# BrowserTools project

## Goal and current scope

BrowserTools is a React + JavaScript frontend built with Vite. The packaged Manifest V3 extension uses real browser APIs. The localhost development frontend remains a mock preview. Installation is manual; see [extension setup and security](EXTENSION.md). No site is published.

The original plain JavaScript files have been replaced by components and modules. English is the language for interface text, documentation, errors and comments.

## Features

- Bookmarks: search, filter by folder, sort, create, edit, move by changing folder, delete and create folders.
- Extensions: search, filter by state, inspect permissions, enable, disable and uninstall (simulated on localhost). Browser policy restrictions and self-protection apply in the installed extension.
- History: search titles and URLs, filter today or the last seven days, inspect visits, delete a URL and its visits, or clear all history.
- Native modal dialogs, confirmation before deletion, feedback messages, `/` to focus search, responsive layouts and local demo persistence.

## Responsibilities

| Location                      | Responsibility                                                       |
| ----------------------------- | -------------------------------------------------------------------- |
| `src/App.jsx`                 | Application shell and shared confirmation state                      |
| `src/pages/`                  | Feature-specific behaviour, filters and content                      |
| `src/components/`             | Reusable visual elements and forms                                   |
| `src/hooks/useBrowserData.js` | Load backend state, perform mutations, report results                |
| `src/hooks/useLibrary.js`     | Search and ordering state                                            |
| `src/services/backend.js`     | Select the active backend adapter                                    |
| `src/services/mockBackend.js` | Async operations and localStorage persistence                        |
| `src/data/demoData.js`        | Sample data creation                                                 |
| `src/styles/`                 | Base, sidebar, layout, library, extension, dialog and responsive CSS |

Component inputs are called **props**. `useState` stores values that can change, such as the active filter; changing state causes React to update the screen. A **hook** packages reusable stateful behaviour. Backend functions return Promises; `await` waits for completion before updating the interface.

## History date filters and bulk actions

Filter by a specific day, an inclusive date range, an ISO calendar week (Monday–Sunday), a month, or a year. Include or exclude the chosen period. Quick filters offer Today and Last 7 days (today plus six previous local calendar days). A URL matches any recorded visit within the period, falling back to its latest visit when individual visits are unavailable. Local calendar boundaries account for daylight saving.

Use row checkboxes or Select all filtered. Search/date changes clear selection; sorting preserves it. Bulk deletion requires confirmation and removes ALL visits for selected URLs, including visits outside the date filter.

`src/utils/bulkOperations.js` uses `Promise.allSettled()` in batches of ten, deduplicates URLs, and reports individual successes and failures. Failed entries stay selected for retry. It uses the existing adapter's `deleteUrl()` method.

## Backend contract

The selected adapter exports `snapshot()`, `saveBookmark(input)`, `createFolder(title)`, `removeBookmark(id)`, `setEnabled(id, enabled)`, `uninstall(id)`, `deleteUrl(url)`, `deleteAll()` and `reset()`.

`snapshot()` returns a copy of `{ folders, bookmarks, extensions, history }`. Bookmark `parentId` identifies its folder. History contains one record per URL, including a list of visits with IDs, timestamps and transitions. All methods are asynchronous so the interface can use the same contract with a real browser adapter. `reset()` is demonstration-only.

Demo extension versions and permissions are fictional examples. Real mode reads installed extension metadata. No external favicons or fonts are requested; icons are characters and fonts use local fallbacks.

## Brave integration

`public/manifest.json` declares Manifest V3 and the `bookmarks`, `management` and `history` permissions. Vite copies it and `public/background.js` into `dist`. `src/services/backend.js` selects `braveBackend.js` only in an extension origin, with no mock fallback on API errors. No account, OAuth token or network bridge is used.

| Feature    | Browser APIs                                                              |
| ---------- | ------------------------------------------------------------------------- |
| Bookmarks  | `chrome.bookmarks.getTree/create/update/move/remove`                      |
| Extensions | `chrome.management.getAll/getPermissionWarningsById/setEnabled/uninstall` |
| History    | `chrome.history.search/getVisits/deleteUrl/deleteAll`                     |

The adapter normalizes bookmark trees, extension metadata and history visits. History loads in increments of 2,000 URLs with visible scope information; older records require Load more. Refresh the tab to pick up external changes. Real mode hides demo reset and labels data as live. The bundled build uses a local-only CSP and relative asset paths. Installation and native prompts still require manual verification in Brave.

## Verification

Run `npm.cmd test` for backend CRUD, protected-extension restrictions, URL validation, snapshot isolation, persistence fallback and reset. Run `npm.cmd run build` to check React imports and bundle production files. Browser interaction and visual review are separate checks; a successful build alone does not verify them.

Vite setup reference: [official getting started guide](https://vite.dev/guide/).
