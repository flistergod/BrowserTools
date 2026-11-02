const pages = [
  { id: "bookmarks", label: "Bookmarks", icon: "☆" },
  { id: "extensions", label: "Extensions", icon: "⊞" },
  { id: "history", label: "History", icon: "◷" },
];

/** Navigation only: App owns the selected page and the reset action. */
export default function Sidebar({ view, onNavigate, data, onReset, busy }) {
  return (
    <aside className="sidebar">
      <a className="brand" href="./">
        <span className="brand-icon">
          B<span>↗</span>
        </span>
        BrowserTools
        <span className="version">LAB</span>
      </a>

      <div className="workspace">
        <span className="avatar">N</span>
        <div>
          My workspace
          <small>
            {data.mode === "real" ? "Current browser profile" : "Brave · Demo profile"}
          </small>
        </div>
        <span className="status-dot" />
      </div>

      <p className="nav-label">BROWSER LIBRARY</p>
      <nav aria-label="Main navigation">
        {pages.map((page) => (
          <button
            key={page.id}
            className={view === page.id ? "active" : ""}
            aria-current={view === page.id ? "page" : undefined}
            onClick={() => onNavigate(page.id)}
          >
            <span>{page.icon}</span>
            {page.label}
            <b>{data[page.id].length}</b>
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="mock-card">
          <span>◈</span>
          <strong>
            {data.mode === "real" ? "Connected to your browser" : "A space to experiment"}
          </strong>
          <p>
            {data.mode === "real"
              ? "Live data. Deletions are permanent. Reload this tab to refresh external changes."
              : "You are using demo data. Feel free to explore."}
          </p>
          {data.mode !== "real" && (
            <button onClick={onReset} disabled={busy}>
              Reset demonstration ↗
            </button>
          )}
        </div>
        <small>BrowserTools · Made to simplify</small>
      </div>
    </aside>
  );
}
