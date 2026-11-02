import { domain, formatDate, formatDateTime } from "../utils/format.js";
import SelectionCheckbox from "./SelectionCheckbox.jsx";

/** Shared table layout. Feature pages provide the edit/details/delete actions. */
export default function RecordTable({
  items,
  folders = [],
  history = false,
  onOpen,
  onDelete,
  busy,
  selection,
}) {
  const openLabel = history ? "View visits" : "Edit or move";

  return (
    <table>
      <thead>
        <tr>
          {selection && (
            <th className="selection-column">
              <SelectionCheckbox
                aria-label="Select all filtered history entries"
                checked={
                  items.length > 0 && items.every((item) => selection.ids.has(item.id))
                }
                mixed={
                  items.some((item) => selection.ids.has(item.id)) &&
                  !items.every((item) => selection.ids.has(item.id))
                }
                onChange={selection.toggleAll}
                disabled={busy}
              />
            </th>
          )}
          <th>NAME</th>
          <th className="folder-column">{history ? "VISITS" : "FOLDER"}</th>
          <th className="date-column">{history ? "LAST VISIT" : "ADDED"}</th>
          <th className="actions-heading">ACTIONS</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const folder = folders.find((entry) => entry.id === item.parentId);
          return (
            <tr key={item.id}>
              {selection && (
                <td className="selection-column">
                  <input
                    type="checkbox"
                    aria-label={`Select: ${item.title}`}
                    checked={selection.ids.has(item.id)}
                    onChange={() => selection.toggle(item.id)}
                    disabled={busy}
                  />
                </td>
              )}
              <td>
                <div className="item-main">
                  <span className={`favicon ${folder?.color || ""}`}>
                    {item.icon || domain(item.url)[0]?.toUpperCase()}
                  </span>
                  <div>
                    <a
                      className="item-title"
                      href={/^https?:\/\//i.test(item.url) ? item.url : undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {item.title}
                    </a>
                    <span className="url">{domain(item.url)}</span>
                  </div>
                </div>
              </td>
              <td className="folder-column">
                {history ? (
                  <span className="date">{item.visitCount} visits</span>
                ) : (
                  <span className={`folder ${folder?.color || ""}`}>
                    ▱ &nbsp;{folder?.title}
                  </span>
                )}
              </td>
              <td className="date date-column">
                {history
                  ? formatDateTime(item.lastVisitTime)
                  : formatDate(item.dateAdded)}
              </td>
              <td>
                <div className="row-actions">
                  <button
                    title={openLabel}
                    aria-label={`${openLabel}: ${item.title}`}
                    onClick={() => onOpen(item)}
                    disabled={busy || (!history && item.readOnly)}
                  >
                    {history ? "◷" : "✎"}
                  </button>
                  <button
                    title="Delete"
                    aria-label={`Delete: ${item.title}`}
                    onClick={() => onDelete(item)}
                    disabled={busy || (!history && item.readOnly)}
                  >
                    ×
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
