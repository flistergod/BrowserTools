import { useEffect, useRef } from "react";
import { isRealBrowser } from "../services/backend.js";

/** Shared filters, search, sorting and footer; results arrive as children. */
export default function Library({
  name,
  controls,
  filters,
  count,
  total,
  children,
  toolbar,
}) {
  const searchInput = useRef(null);

  useEffect(() => {
    function focusSearch(event) {
      const isTyping =
        ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName) ||
        document.activeElement.isContentEditable;
      if (event.key === "/" && !isTyping && !document.querySelector("dialog[open]")) {
        event.preventDefault();
        searchInput.current?.focus();
      }
    }
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  return (
    <section className="library" aria-label={name}>
      <div className="library-top">
        <div className="tabs">
          {filters.map((option) => (
            <button
              key={option.id}
              className={controls.filter === option.id ? "active" : ""}
              aria-pressed={controls.filter === option.id}
              onClick={option.onClick || (() => controls.setFilter(option.id))}
            >
              {option.label}
            </button>
          ))}
        </div>
        <div className="tools">
          <label className="search">
            <span>⌕</span>
            <input
              ref={searchInput}
              type="search"
              aria-label={`Search ${name}`}
              placeholder={`Search ${name.toLowerCase()}…`}
              value={controls.query}
              onChange={(event) => controls.setQuery(event.target.value)}
            />
            <kbd>/</kbd>
          </label>
          <select
            aria-label="Sort results"
            value={controls.sort}
            onChange={(event) => controls.setSort(event.target.value)}
          >
            <option value="recent">Most recent</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>
      </div>

      {toolbar}

      {count ? (
        children
      ) : (
        <div className="empty">No results here. Try a different search or filter.</div>
      )}

      <footer className="list-footer">
        <span>
          {count} of {total} {name.toLowerCase()}
        </span>
        <span>
          {isRealBrowser ? "Current profile · Browser API" : "Local data · Mock backend"}{" "}
          <span className="tiny-dot">●</span>
        </span>
      </footer>
    </section>
  );
}
