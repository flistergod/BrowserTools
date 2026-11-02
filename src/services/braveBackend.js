/**
 * Privileged adapter, used only inside our installed extension page.
 * Browser permissions authorize access; there is no password, token or server.
 */
export function createBraveBackend(browser = globalThis.chrome) {
  let extensionInfo = new Map();
  let historyLimit = 2000;

  function requireContext() {
    if (
      !browser?.runtime?.id ||
      !browser.bookmarks ||
      !browser.history ||
      !browser.management
    ) {
      throw Error(
        "Open BrowserTools from the installed extension and check its permissions.",
      );
    }
  }

  function extension(id) {
    const item = extensionInfo.get(id);
    if (!item) throw Error("Extension no longer listed. Refresh the workspace.");
    if (id === browser.runtime.id)
      throw Error("BrowserTools cannot disable or uninstall itself.");
    return item;
  }

  async function writableFolder(id) {
    if (!id || id === "0") throw Error("Choose a writable bookmark folder.");
    const [folder] = await browser.bookmarks.get(id);
    if (!folder || folder.url || folder.unmodifiable)
      throw Error("This folder cannot be modified.");
    return folder;
  }

  return {
    mode: "real",
    async snapshot() {
      requireContext();
      const [tree, installed, historyResults] = await Promise.all([
        browser.bookmarks.getTree(),
        browser.management.getAll(),
        browser.history.search({ text: "", startTime: 0, maxResults: historyLimit + 1 }),
      ]);
      const folders = [];
      const bookmarks = [];
      function walk(node, path = "", managed = false) {
        const protectedNode = managed || Boolean(node.unmodifiable);
        if (node.url) {
          bookmarks.push({
            ...node,
            title: node.title || node.url,
            dateAdded: node.dateAdded || 0,
            readOnly: protectedNode,
          });
        } else {
          const title = [path, node.title].filter(Boolean).join(" / ");
          if (node.id !== "0")
            folders.push({
              id: node.id,
              title: title || "Bookmarks",
              color: "blue",
              readOnly: protectedNode,
            });
          for (const child of node.children || []) walk(child, title, protectedNode);
        }
      }
      tree.forEach((root) => walk(root));
      extensionInfo = new Map(installed.map((item) => [item.id, item]));
      const extensions = installed
        .filter((item) => item.type === "extension")
        .map((item) => ({
          ...item,
          icon: item.name[0]?.toUpperCase() || "E",
          permissions: [
            ...new Set([...(item.permissions || []), ...(item.hostPermissions || [])]),
          ],
          mayDisable: item.id !== browser.runtime.id && Boolean(item.mayDisable),
          mayEnable: item.id !== browser.runtime.id && item.mayEnable !== false,
          isSelf: item.id === browser.runtime.id,
        }));

      // Fetch visit details in bounded batches; never invent a successful visit read.
      const history = [];
      const candidates = historyResults.slice(0, historyLimit).filter((item) => item.url);
      for (let offset = 0; offset < candidates.length; offset += 10) {
        const batch = await Promise.all(
          candidates.slice(offset, offset + 10).map(async (item) => ({
            ...item,
            title: item.title || item.url,
            lastVisitTime: item.lastVisitTime || 0,
            visitCount: item.visitCount || 0,
            visits: await browser.history.getVisits({ url: item.url }),
          })),
        );
        history.push(...batch);
      }
      return {
        folders,
        bookmarks,
        extensions,
        history,
        mode: "real",
        historyHasMore: historyResults.length > historyLimit,
      };
    },
    async loadMoreHistory() {
      historyLimit += 2000;
    },
    async saveBookmark(input) {
      requireContext();
      const title = input.title.trim();
      if (!title) throw Error("Please enter a name.");
      if (!["http:", "https:"].includes(new URL(input.url).protocol))
        throw Error("Use an HTTP or HTTPS address.");
      await writableFolder(input.parentId);
      if (!input.id)
        return browser.bookmarks.create({
          title,
          url: input.url,
          parentId: input.parentId,
        });
      const [current] = await browser.bookmarks.get(input.id);
      if (!current?.url || current.unmodifiable)
        throw Error("This bookmark cannot be edited.");
      // Move first: a rejected destination must not also rename the bookmark.
      if (current.parentId !== input.parentId)
        await browser.bookmarks.move(input.id, { parentId: input.parentId });
      return browser.bookmarks.update(input.id, { title, url: input.url });
    },
    async createFolder(title, parentId) {
      requireContext();
      if (!title.trim()) throw Error("Please enter a name.");
      await writableFolder(parentId);
      return browser.bookmarks.create({ title: title.trim(), parentId });
    },
    async removeBookmark(id) {
      requireContext();
      const [item] = await browser.bookmarks.get(id);
      if (!item?.url || item.unmodifiable)
        throw Error("Only writable bookmarks can be deleted here.");
      return browser.bookmarks.remove(id);
    },
    setEnabled(id, enabled) {
      requireContext();
      const item = extension(id);
      if (enabled ? item.mayEnable === false : !item.mayDisable)
        throw Error("This action is restricted by the browser.");
      // Call immediately from the click handler: preserve the browser's user gesture.
      return browser.management.setEnabled(id, enabled);
    },
    uninstall(id) {
      requireContext();
      if (!extension(id).mayDisable)
        throw Error("This extension is managed by the browser.");
      return browser.management.uninstall(id, { showConfirmDialog: true });
    },
    async getPermissionWarnings(id) {
      return browser.management.getPermissionWarningsById(id);
    },
    async deleteUrl(url) {
      requireContext();
      return browser.history.deleteUrl({ url });
    },
    async deleteAll() {
      requireContext();
      return browser.history.deleteAll();
    },
  };
}
