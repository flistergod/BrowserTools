# BrowserTools

A local React workspace for Brave bookmarks, extensions and history. The installed extension uses real browser APIs; the localhost development server uses a mock backend. See [extension installation and security](docs/EXTENSION.md) to load the real version.

## Run locally

Requires Node.js 22.12+ or a newer supported release (the development machine uses Node 24).

```powershell
npm.cmd install
npm.cmd run dev
```

Open the local URL printed in the terminal in Brave. Vite normally uses `http://127.0.0.1:5173`. Keep the terminal running; press Ctrl+C to stop. Opening `index.html` directly is no longer supported because React source needs the development server or a build.

`npm.cmd` works in Windows PowerShell even when execution policy blocks `npm.ps1`. Other shells can use `npm`.

## Folder structure

```text
BrowserTools/
├── index.html                 # Small HTML entry point
├── package.json               # Dependencies and run commands
├── vite.config.js             # React build configuration
├── public/                    # Manifest V3 and toolbar service worker
├── src/
│   ├── main.jsx               # Starts React and imports styles
│   ├── App.jsx                # App shell, navigation, confirmations
│   ├── components/            # Reusable UI: sidebar, forms, tables, dialogs
│   ├── pages/                 # BookmarksPage, ExtensionsPage, HistoryPage
│   ├── hooks/                 # Data loading, mutations, search and ordering
│   ├── services/              # Backend adapter and mock implementation
│   ├── data/                  # English demonstration records
│   ├── utils/                 # Date and URL formatting
│   └── styles/                # CSS separated by visual responsibility
├── tests/                     # Backend behaviour checks
└── docs/
    ├── PROJECT.md             # Scope and architecture
    └── EXTENSION.md           # Installation, permissions and security
```

Start reading `src/App.jsx`, then a file in `src/pages/`, then the components that page imports. Each component returns JSX: HTML-like markup with JavaScript values inside `{braces}`. Comments explain each file's purpose.

Data flow: **user action → page handler → backend method → updated React state → refreshed UI**. React handles updates without generated HTML strings or manual DOM replacement.

## Commands

```powershell
npm.cmd run dev       # Development server with automatic reload
npm.cmd run build     # Production files in dist/
npm.cmd run preview   # Serve the production build locally
npm.cmd test          # Backend tests
```

All UI labels, comments, errors, built-in sample records and documentation are in English. Dates use the `en-GB` locale. Users can still enter names in any language.

The English demo uses a new storage key (`browsertools.demo.v2.en`). The previous Portuguese demo's data is left untouched and is not imported automatically. Changes persist in localStorage for the current origin; data opened through `file://` is separate from the Vite server. If storage is blocked, the app keeps its session data in memory.

Formatting is configured in `.prettierrc.json`. CSS files keep one property per line; JSX replaces the old HTML template strings. `node_modules/` contains installed packages and `dist/` contains generated output; edit `src/` instead.
