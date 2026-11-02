import { useState } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ConfirmDialog from "./components/ConfirmDialog.jsx";
import BookmarksPage from "./pages/BookmarksPage.jsx";
import ExtensionsPage from "./pages/ExtensionsPage.jsx";
import HistoryPage from "./pages/HistoryPage.jsx";
import { useBrowserData } from "./hooks/useBrowserData.js";
import { isRealBrowser } from "./services/backend.js";

const labels = { bookmarks: "Bookmarks", extensions: "Extensions", history: "History" };
const pages = {
  bookmarks: BookmarksPage,
  extensions: ExtensionsPage,
  history: HistoryPage,
};

/** Application shell: navigation, shared data and deletion confirmation. */
export default function App() {
  const [view, setView] = useState("bookmarks");
  const [confirmation, setConfirmation] = useState(null);
  const { data, error, message, busy, mutate } = useBrowserData();

  if (error)
    return (
      <div className="empty" role="alert">
        Unable to load workspace: {error}. Reload this tab after checking extension
        permissions.
      </div>
    );
  if (!data)
    return (
      <div className="empty" role="status">
        Loading your workspace…
      </div>
    );

  // Uppercase variables can be rendered as React components in JSX.
  const Page = pages[view];

  async function confirmOperation() {
    const success = await mutate(confirmation.operation, confirmation.successMessage);
    if (success) setConfirmation(null);
  }

  function resetDemo() {
    setConfirmation({
      title: "Reset demonstration",
      message: "Restore the original sample data? Your demo changes will be removed.",
      operation: (api) => api.reset(),
      successMessage: "Demonstration reset.",
    });
  }

  return (
    <>
      <Sidebar
        view={view}
        onNavigate={setView}
        data={data}
        onReset={resetDemo}
        busy={busy}
      />
      <main>
        <header className="topbar">
          <span>
            Workspace <span className="slash">/</span>
            <strong>{labels[view]}</strong>
          </span>
          <span className="demo-pill">
            <i />
            {isRealBrowser ? "Live browser data" : "Demo mode"}
          </span>
        </header>
        <div className="content">
          <Page
            key={view}
            data={data}
            mutate={mutate}
            confirm={setConfirmation}
            busy={busy}
          />
          <div className="bottom-note">
            <span>◈</span>
            <p>
              <strong>Your browser. Your rules.</strong>
              {isRealBrowser
                ? "Changes affect this browser profile and may sync to other devices."
                : "This preview has no access to real Brave data."}
            </p>
            <span className="connection">
              {isRealBrowser ? "Browser API" : "Simulated API"}
            </span>
          </div>
        </div>
      </main>
      {confirmation && (
        <ConfirmDialog
          title={confirmation.title}
          message={confirmation.message}
          onClose={() => setConfirmation(null)}
          onConfirm={confirmOperation}
          busy={busy}
        />
      )}
      {message && (
        <div id="toast" role="status" aria-live="polite">
          {message}
        </div>
      )}
    </>
  );
}
