# Install BrowserTools in Brave

## Build and load locally

1. In PowerShell, open the project and build:

   ```powershell
   cd "path\to\BrowserTools"
   npm.cmd install
   npm.cmd run build
   ```

2. Open `brave://extensions` in the Brave profile you want to manage.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select the `dist` folder inside your local project directory.
6. Review the extension's requested access to bookmarks, installed extensions and history.
7. Pin BrowserTools using Brave's extensions menu, then click its toolbar icon. The React workspace opens in a tab labelled **Live browser data**.

Select `dist`, not the project root or `src`. You do not need the Vite development server for this installed build. The extension only accesses the profile in which you load it.

For later changes, run `npm.cmd run build`, click **Reload** on BrowserTools at `brave://extensions`, and reload or reopen the BrowserTools tab. Reload the workspace to pick up changes made elsewhere in the browser.

`npm.cmd run dev` still opens the mock frontend at localhost. It cannot access real browser data, even when the extension is installed. This deliberate separation avoids exposing privileged APIs to a web page.

## Authorization and authentication

The implementation uses local `chrome.bookmarks`, `chrome.management` and `chrome.history` extension APIs, supported by Brave's Chromium extension platform. These APIs use the installed extension's permissions; no API key, account login, OAuth flow or `chrome.identity` permission is needed for this architecture. Installing/loading the extension and granting its permissions is the authorization boundary.

The manifest requests only `bookmarks`, `management` and `history`. These permissions cover read and write together; the app cannot request a read-only version of them. Browser policies remain authoritative and can reject operations.

## Security choices

- Manifest V3, with bundled JavaScript and CSS and a strict Content Security Policy.
- No host permissions, content scripts, web-accessible resources, externally connectable web pages, network API server or message-based command bridge.
- No remote fonts, scripts, favicons, telemetry or cloud data uploads. Real data lives in React memory and browser APIs, not the mock localStorage database.
- No incognito access. This extension is a local profile manager, not an authentication tool for websites.
- React escapes displayed titles; only HTTP/HTTPS URLs are clickable. Existing non-web bookmarks remain visible, but creating/editing URLs is restricted to HTTP/HTTPS.
- Destructive actions require confirmation. Brave also presents its native extension uninstall prompt. BrowserTools cannot disable/uninstall itself through its UI or adapter.
- Protected bookmark nodes and managed extensions are respected. Extension enabling/disabling runs directly from a user click so browser user-gesture checks remain effective.
- New folders are created under the folder chosen in the editor. Special root folders are not renamed, moved or removed.

Changes are real and can be permanent; bookmark changes may propagate through browser sync.

## History loading

The app initially loads up to 2,000 URLs, starting from time zero rather than the API's default last 24 hours. Each loaded URL includes its available visit records, fetched in batches of ten. Use **Load 2,000 more URLs** until no more remain to search older history. Filters and selection operate on loaded URLs only. **Clear history** deletes the entire profile history, including unloaded URLs; its confirmation explicitly says so.

Browser history retention and visit availability are controlled by Brave. This app cannot recover history that Brave no longer stores. Calendar filters use available visit timestamps in the computer's local timezone. URL deletion removes all visits to that URL, not only the filtered dates.

## Verification and limitations

Automated tests use fake Chromium APIs; they never access or change your profile. Build checks validate the packaged manifest, scripts and CSP. Installation and real browser permission prompts must be verified manually in Brave; loading the extension is a user action.

Loading unpacked installs locally. Publishing in an extension store requires a developer account, store review, privacy disclosures and a distributable ZIP.

## Official references

- [Brave extension compatibility](https://brave.com/learn/using-chrome-extensions-in-brave/)
- [Declaring extension permissions](https://developer.chrome.com/docs/extensions/develop/concepts/declare-permissions)
- [Bookmarks API and protected root folders](https://developer.chrome.com/docs/extensions/reference/api/bookmarks)
- [Management API, user gestures and uninstall confirmation](https://developer.chrome.com/docs/extensions/reference/api/management)
- [History API and search defaults](https://developer.chrome.com/docs/extensions/reference/api/history)
- [Manifest Content Security Policy](https://developer.chrome.com/docs/extensions/reference/manifest/content-security-policy)
- [Extension security practices](https://developer.chrome.com/docs/extensions/develop/security-privacy/stay-secure)
