# BrowserTools commands

Run these commands in a PowerShell terminal. Node.js must be installed; this project requires Node.js 22.12+ or a newer supported release.

## Launch the app

**For the real browser APIs:** run `npm.cmd run build`, then load the `dist` folder using **Load unpacked** at `brave://extensions`. Click BrowserTools in the toolbar. See [complete extension installation instructions](docs/EXTENSION.md). The development-server commands below remain a mock preview.

### 1. Open the project folder

```powershell
cd "C:\Users\Nelson\Desktop\projetos\BrowserTools"
```

### 2. Install dependencies (first launch only)

```powershell
npm.cmd install
```

Dependencies are already installed on this machine. Repeat this step after downloading the project elsewhere or when its dependencies change.

### 3. Start the development server

```powershell
npm.cmd run dev
```

Keep this terminal open. It will print a local address, normally:

```text
http://127.0.0.1:5173/
```

Open that address in Brave. If the port is already occupied, use the address printed in the terminal instead. Saving source files automatically updates the app.

Do not open `index.html` directly: React needs the development server or a production build served over HTTP. Developer mode in Brave is not needed for this mock frontend.

## Stop the app

In the terminal running the server, press:

```text
Ctrl+C
```

If PowerShell asks whether to terminate the batch job, confirm with `Y` and Enter.

## Launch again

After the first setup, these are the only commands needed:

```powershell
cd "C:\Users\Nelson\Desktop\projetos\BrowserTools"
npm.cmd run dev
```

## Use a different port

```powershell
npm.cmd run dev -- --port 5174
```

Open the URL printed by the server. Demo data is stored per origin, so a different port has separate demo storage.

## Run backend tests

```powershell
npm.cmd test
```

These tests check the mock backend. They do not launch the interface or access real Brave data.

## Build the app

```powershell
npm.cmd run build
```

Creates production files in `dist/`. Edit source files in `src/`; generated files in `dist/` are replaced by the next build.

## Preview the production build

```powershell
npm.cmd run build
npm.cmd run preview
```

Open the URL printed in the terminal, normally `http://127.0.0.1:4173/`. Press Ctrl+C to stop. This previews the built app locally; it does not publish it or install a Brave extension.

## Format the source code

```powershell
node node_modules/prettier/bin/prettier.cjs --write index.html package.json vite.config.js src tests docs README.md Commands.md
```

Applies the formatting rules in `.prettierrc.json`.

## Troubleshooting

**PowerShell blocks `npm.ps1`:** use `npm.cmd` as shown here. There is no need to change the execution policy.

**`npm.cmd` is not recognized:** install Node.js, reopen the terminal, and check:

```powershell
node --version
npm.cmd --version
```

**Dependencies are missing:** run `npm.cmd install` in the project folder, then launch again.

**The page cannot connect:** keep the server terminal running and use its printed URL.

**You want the original sample data:** click **Reset demonstration** in the app and confirm. The app uses simulated data only; it does not modify your real bookmarks, extensions or history.
