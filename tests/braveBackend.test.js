import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createBraveBackend } from "../src/services/braveBackend.js";

// Fake APIs only: these tests cannot reach any real browser profile.
function fixture() {
  const calls = [];
  const nodes = {
    0: { id: "0", children: [] },
    1: { id: "1", title: "Bookmarks bar", parentId: "0", children: [] },
    folder: { id: "folder", title: "Work", parentId: "1", children: [] },
    bookmark: {
      id: "bookmark",
      title: "Example",
      url: "https://example.com",
      parentId: "folder",
      dateAdded: 10,
    },
    managed: { id: "managed", title: "Managed", unmodifiable: "managed", children: [] },
  };
  nodes["0"].children = [nodes["1"], nodes.managed];
  nodes["1"].children = [nodes.folder];
  nodes.folder.children = [nodes.bookmark];
  const items = [
    {
      id: "self",
      type: "extension",
      name: "BrowserTools",
      enabled: true,
      mayDisable: true,
    },
    {
      id: "normal",
      type: "extension",
      name: "Normal",
      enabled: true,
      mayDisable: true,
      permissions: ["storage"],
      hostPermissions: ["https://example.com/*"],
    },
    { id: "policy", type: "extension", name: "Policy", enabled: true, mayDisable: false },
    {
      id: "blocked",
      type: "extension",
      name: "Blocked",
      enabled: false,
      mayEnable: false,
      mayDisable: true,
    },
    { id: "theme", type: "theme", name: "Theme" },
  ];
  const record = (name, ...args) => {
    calls.push([name, ...args]);
    return Promise.resolve();
  };
  const browser = {
    runtime: { id: "self" },
    bookmarks: {
      getTree: async () => [nodes["0"]],
      get: async (id) => [nodes[id]],
      create: (value) => record("create", value),
      update: (id, value) => record("update", id, value),
      move: (id, value) => record("move", id, value),
      remove: (id) => record("remove", id),
    },
    management: {
      getAll: async () => items,
      setEnabled: (id, enabled) => record("setEnabled", id, enabled),
      uninstall: (id, options) => record("uninstall", id, options),
      getPermissionWarningsById: async () => ["Read data"],
    },
    history: {
      search: async (query) => {
        calls.push(["search", query]);
        return [
          { id: "h1", url: "https://example.com", lastVisitTime: 20, visitCount: 1 },
        ];
      },
      getVisits: async () => [{ visitId: "v1", visitTime: 20, transition: "typed" }],
      deleteUrl: (value) => record("deleteUrl", value),
      deleteAll: () => record("deleteAll"),
    },
  };
  return { api: createBraveBackend(browser), browser, calls, nodes };
}

test("snapshot reads real collections without issuing writes", async () => {
  const { api, calls } = fixture();
  const data = await api.snapshot();
  assert.equal(data.mode, "real");
  assert.equal(data.bookmarks[0].parentId, "folder");
  assert.equal(
    data.folders.find((folder) => folder.id === "folder").title,
    "Bookmarks bar / Work",
  );
  assert.ok(!data.folders.some((folder) => folder.id === "0"));
  assert.equal(data.extensions.length, 4);
  assert.equal(data.extensions.find((item) => item.id === "self").mayDisable, false);
  assert.ok(
    data.extensions
      .find((item) => item.id === "normal")
      .permissions.includes("https://example.com/*"),
  );
  assert.equal(data.history[0].visits[0].visitId, "v1");
  assert.deepEqual(
    calls.map(([name]) => name),
    ["search"],
  );
  assert.equal(calls[0][1].startTime, 0);
});

test("bookmark writes reject unsafe URLs, root folders and managed nodes", async () => {
  const { api, calls, nodes } = fixture();
  await assert.rejects(
    api.saveBookmark({ title: "Bad", url: "javascript:alert(1)", parentId: "folder" }),
    /HTTP/,
  );
  await assert.rejects(api.createFolder("Bad", "0"), /writable/);
  await assert.rejects(api.createFolder("Bad", "managed"), /modified/);
  await assert.rejects(api.removeBookmark("1"), /writable/);
  assert.equal(calls.length, 0);
  await api.createFolder("New", "folder");
  assert.deepEqual(calls[0], ["create", { title: "New", parentId: "folder" }]);
  await api.saveBookmark({
    id: "bookmark",
    title: "Renamed",
    url: "https://example.org",
    parentId: "1",
  });
  assert.equal(calls[1][0], "move");
  assert.equal(calls[2][0], "update");
  nodes.bookmark.unmodifiable = "managed";
  await assert.rejects(api.removeBookmark("bookmark"), /writable/);
});

test("extension operations preserve user gestures and browser confirmation", async () => {
  const { api, calls, browser } = fixture();
  await api.snapshot();
  assert.throws(() => api.setEnabled("self", false), /itself/);
  assert.throws(() => api.uninstall("policy"), /managed/);
  assert.throws(() => api.setEnabled("blocked", true), /restricted/);
  const action = api.setEnabled("normal", false);
  assert.equal(calls.at(-1)[0], "setEnabled");
  await action;
  await api.uninstall("normal");
  assert.deepEqual(calls.at(-1), ["uninstall", "normal", { showConfirmDialog: true }]);
  browser.management.uninstall = async () => {
    throw Error("User cancelled");
  };
  await assert.rejects(api.uninstall("normal"), /cancelled/);
});

test("history writes use Chromium arguments and incremental loading raises the limit", async () => {
  const { api, calls } = fixture();
  await api.snapshot();
  await api.loadMoreHistory();
  await api.snapshot();
  assert.deepEqual(
    calls.filter(([name]) => name === "search").map(([, query]) => query.maxResults),
    [2001, 4001],
  );
  await api.deleteUrl("https://example.com");
  assert.deepEqual(calls.at(-1), ["deleteUrl", { url: "https://example.com" }]);
  await api.deleteAll();
  assert.deepEqual(calls.at(-1), ["deleteAll"]);
});

test("missing API permissions fail closed instead of using fake data", async () => {
  await assert.rejects(createBraveBackend({}).snapshot(), /permissions/);
});

test("manifest requests only local API privileges and blocks network access", () => {
  const manifest = JSON.parse(
    readFileSync(new URL("../public/manifest.json", import.meta.url), "utf8"),
  );
  assert.equal(manifest.manifest_version, 3);
  assert.deepEqual(manifest.permissions, ["bookmarks", "management", "history"]);
  assert.equal(manifest.incognito, "not_allowed");
  for (const field of [
    "host_permissions",
    "externally_connectable",
    "content_scripts",
    "web_accessible_resources",
    "oauth2",
  ])
    assert.equal(manifest[field], undefined);
  assert.ok(
    manifest.content_security_policy.extension_pages.includes("connect-src 'none'"),
  );
  assert.ok(!manifest.content_security_policy.extension_pages.includes("unsafe-eval"));
});
