import { createDemoData } from "../data/demoData.js";

/** Create an independent async backend. Storage can be replaced in tests. */
export function createMockBackend(storage) {
  // Reading localStorage itself can throw when browser storage is blocked.
  if (storage === undefined) {
    try {
      storage = globalThis.localStorage;
    } catch {
      storage = null;
    }
  }
  // Namespaced storage key for the demo database. Keep stable across reloads.
  const KEY = "browsertools.demo.v2.en";
  // Load previously saved JSON. If it is missing or unreadable, use samples.
  let data;
  try {
    data = JSON.parse(storage?.getItem(KEY)) || createDemoData();
  } catch {
    data = createDemoData();
  }
  // localStorage accepts strings, so serialize the data object to JSON.
  const persist = () => {
    try {
      storage?.setItem(KEY, JSON.stringify(data));
    } catch {
      /* In-memory mode if browser blocks storage. */
    }
  };
  // Return copies so the frontend cannot accidentally modify backend state.
  const clone = (value) => structuredClone(value);

  // Find a record by ID, or stop the operation with a readable error.
  const get = (collection, id) => {
    const item = data[collection].find((x) => x.id === id);
    if (!item) throw Error("Record not found.");
    return item;
  };
  // PUBLIC API: React pages use only these methods to read and change data.
  return {
    // Read all collections without exposing the originals.
    async snapshot() {
      return clone(data);
    },
    // An existing ID means update; no ID means create a new bookmark.
    // Changing parentId moves the bookmark to another folder.
    async saveBookmark(input) {
      // Validate input before modifying the saved data.
      if (!input.title.trim()) throw Error("Please enter a name.");
      if (!data.folders.some((f) => f.id === input.parentId))
        throw Error("Invalid folder.");
      if (!input.url || !["http:", "https:"].includes(new URL(input.url).protocol))
        throw Error("Use an HTTP or HTTPS address.");
      // Object.assign updates fields; unshift inserts at the start of the array.
      if (input.id) Object.assign(get("bookmarks", input.id), input);
      else
        data.bookmarks.unshift({
          ...input,
          id: crypto.randomUUID(),
          dateAdded: Date.now(),
          icon: input.title[0].toUpperCase(),
        });
      persist();
    },
    // Create a folder with a unique ID and a default display colour.
    async createFolder(title) {
      if (!title.trim()) throw Error("Please enter a name.");
      data.folders.push({
        id: crypto.randomUUID(),
        title: title.trim(),
        color: "blue",
      });
      persist();
    },
    // Keep all bookmarks except the one being removed.
    async removeBookmark(id) {
      get("bookmarks", id);
      data.bookmarks = data.bookmarks.filter((x) => x.id !== id);
      persist();
    },
    // Toggle the simulated extension, respecting the managed-extension flag.
    async setEnabled(id, enabled) {
      const item = get("extensions", id);
      if (!item.mayDisable) throw Error("This extension is managed by the browser.");
      item.enabled = enabled;
      persist();
    },
    // Remove an extension from this dataset only.
    async uninstall(id) {
      if (!get("extensions", id).mayDisable)
        throw Error("This extension is managed by the browser.");
      data.extensions = data.extensions.filter((x) => x.id !== id);
      persist();
    },
    // Removing a history URL also removes its nested list of visits.
    async deleteUrl(url) {
      data.history = data.history.filter((x) => x.url !== url);
      persist();
    },
    // Clear history while keeping bookmarks, folders and extensions.
    async deleteAll() {
      data.history = [];
      persist();
    },
    // Demo-only operation: replace all saved collections with fresh samples.
    async reset() {
      data = createDemoData();
      persist();
    },
  };
}
