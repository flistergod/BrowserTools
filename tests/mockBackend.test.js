import { test } from "node:test";
import assert from "node:assert/strict";
import { createMockBackend } from "../src/services/mockBackend.js";

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}

test("bookmark create, move, update and delete persist across backend instances", async () => {
  const storage = memoryStorage();
  const api = createMockBackend(storage);
  await api.createFolder("Reading");
  const folder = (await api.snapshot()).folders.at(-1);
  await api.saveBookmark({
    title: "Example",
    url: "https://example.com",
    parentId: folder.id,
  });
  const bookmark = (await api.snapshot()).bookmarks[0];
  await api.saveBookmark({ ...bookmark, title: "Updated", parentId: "work" });
  const reloaded = createMockBackend(storage);
  assert.equal((await reloaded.snapshot()).bookmarks[0].title, "Updated");
  assert.equal((await reloaded.snapshot()).bookmarks[0].parentId, "work");
  await api.removeBookmark(bookmark.id);
  assert.ok(!(await api.snapshot()).bookmarks.some((item) => item.id === bookmark.id));
});

test("managed extensions reject changes; ordinary extensions can be disabled and removed", async () => {
  const api = createMockBackend(memoryStorage());
  await assert.rejects(api.setEnabled("e5", false), /managed/);
  await assert.rejects(api.uninstall("e5"), /managed/);
  await api.setEnabled("e1", false);
  assert.equal((await api.snapshot()).extensions[0].enabled, false);
  await api.uninstall("e1");
  assert.ok(!(await api.snapshot()).extensions.some((item) => item.id === "e1"));
});

test("history deletion removes nested visits and reset restores sample records", async () => {
  const api = createMockBackend(memoryStorage());
  const initial = await api.snapshot();
  await api.deleteUrl(initial.history[0].url);
  assert.equal((await api.snapshot()).history.length, initial.history.length - 1);
  await api.deleteAll();
  const cleared = await api.snapshot();
  assert.equal(cleared.history.length, 0);
  assert.equal(cleared.bookmarks.length, initial.bookmarks.length);
  await api.reset();
  assert.equal((await api.snapshot()).history.length, initial.history.length);
});

test("invalid input is rejected without adding bookmarks", async () => {
  const api = createMockBackend(memoryStorage());
  const initial = (await api.snapshot()).bookmarks.length;
  await assert.rejects(
    api.saveBookmark({ title: "Unsafe", url: "javascript:alert(1)", parentId: "work" }),
    /HTTP/,
  );
  await assert.rejects(
    api.saveBookmark({ title: "Empty URL", url: "", parentId: "work" }),
    /HTTP/,
  );
  await assert.rejects(
    api.saveBookmark({
      title: "Missing folder",
      url: "https://example.com",
      parentId: "missing",
    }),
    /folder/,
  );
  await assert.rejects(api.createFolder("   "), /name/);
  assert.equal((await api.snapshot()).bookmarks.length, initial);
});

test("snapshots are isolated and blocked storage falls back to memory", async () => {
  const api = createMockBackend({
    getItem() {
      throw Error("Blocked");
    },
    setItem() {
      throw Error("Blocked");
    },
  });
  const snapshot = await api.snapshot();
  snapshot.folders[0].title = "Changed copy";
  assert.equal((await api.snapshot()).folders[0].title, "Work");
  await api.createFolder("Offline");
  assert.equal((await api.snapshot()).folders.at(-1).title, "Offline");
});
