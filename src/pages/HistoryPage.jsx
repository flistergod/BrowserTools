import { useState } from "react";
import PageHeading from "../components/PageHeading.jsx";
import Stats from "../components/Stats.jsx";
import Library from "../components/Library.jsx";
import RecordTable from "../components/RecordTable.jsx";
import Modal from "../components/Modal.jsx";
import HistoryDateFilter from "../components/HistoryDateFilter.jsx";
import {
  historyDateRange,
  matchesHistoryRange,
  localDateValue,
} from "../utils/historyDates.js";
import { deleteHistoryItems } from "../utils/bulkOperations.js";
import { useLibrary } from "../hooks/useLibrary.js";
import { formatDateTime, isToday } from "../utils/format.js";

/** History lists URLs; each URL contains its own individual visit records. */
export default function HistoryPage({ data, confirm, busy, mutate }) {
  const controls = useLibrary(data.history);
  const [details, setDetails] = useState(null);
  const [period, setPeriod] = useState({
    mode: "all",
    value: "",
    end: "",
    exclude: false,
  });
  const [selection, setSelection] = useState({ scope: "", ids: new Set() });
  const [bulkReport, setBulkReport] = useState(null);

  // Changed search/date filters start a fresh selection. Sorting preserves it.
  const scope = JSON.stringify([controls.query, controls.filter, period]);
  const validIds = new Set(data.history.map((item) => item.id));
  const selectedIds = new Set(
    selection.scope === scope ? [...selection.ids].filter((id) => validIds.has(id)) : [],
  );
  let range = historyDateRange(period.mode, period.value, period.end);
  if (controls.filter === "today") range = historyDateRange("day", localDateValue());
  if (controls.filter === "week") {
    const start = new Date();
    start.setDate(start.getDate() - 6);
    range = historyDateRange("range", localDateValue(start), localDateValue());
  }
  const incompletePeriod =
    period.mode !== "all" &&
    (!period.value || !range || (period.mode === "range" && !period.end));
  const items = controls.items.filter((item) => {
    if (incompletePeriod) return false;
    const matches = matchesHistoryRange(item, range);
    return period.exclude && range ? !matches : matches;
  });
  const selectedItems = items.filter((item) => selectedIds.has(item.id));

  function toggle(id) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelection({ scope, ids: next });
  }

  function toggleAll() {
    const allSelected = items.every((item) => selectedIds.has(item.id));
    setSelection({
      scope,
      ids: new Set(allSelected ? [] : items.map((item) => item.id)),
    });
  }

  function changePeriod(next) {
    setSelection({ scope: "", ids: new Set() });
    setPeriod(next);
    controls.setFilter("all");
  }

  function deleteSelected() {
    // Capture this exact selection before opening confirmation.
    const targets = [...selectedItems];
    confirm({
      title: "Delete selected history",
      message: `Delete ${targets.length} selected URLs and ALL their visits, including visits outside the date filter? ${data.mode === "real" ? "This permanently changes your browser history." : "This affects demo data only."}`,
      operation: async (api) => {
        const result = await deleteHistoryItems(api, targets);
        setBulkReport(result);
        setSelection({ scope, ids: new Set(result.failed.map(({ item }) => item.id)) });
        return result;
      },
      successMessage: (result) =>
        `${result.succeeded.length} deleted; ${result.failed.length} failed.`,
    });
  }
  const cards = [
    {
      icon: "◷",
      label: "Pages in history",
      value: data.history.length,
      note: "Unique URLs",
    },
    {
      icon: "↗",
      label: "Recorded visits",
      value: data.history.reduce((total, item) => total + item.visitCount, 0),
      note: data.mode === "real" ? "Loaded URLs" : "In this demonstration",
    },
    {
      icon: "◴",
      label: "Visited today",
      value: data.history.filter((item) => isToday(item.lastVisitTime)).length,
      note: "Your day",
    },
  ];
  const filters = [
    ...[
      { id: "all", label: "All" },
      { id: "today", label: "Today" },
      { id: "week", label: "Last 7 days" },
    ].map((option) => ({
      ...option,
      onClick: () => {
        setSelection({ scope: "", ids: new Set() });
        setPeriod({ mode: "all", value: "", end: "", exclude: false });
        controls.setFilter(option.id);
      },
    })),
  ];

  function remove(item) {
    confirm({
      message: `Delete “${item.title}” and all visits to this URL${data.mode === "real" ? " permanently from this browser profile?" : " from the demo data?"}`,
      operation: (api) => api.deleteUrl(item.url),
      successMessage: "History entry deleted.",
    });
  }

  return (
    <>
      <PageHeading
        title="Your history"
        description="Return to the pages you visited along the way."
      >
        <button
          className="danger"
          disabled={busy || !data.history.length}
          onClick={() =>
            confirm({
              message:
                data.mode === "real"
                  ? "Permanently delete ALL history in this browser profile, including URLs that are not loaded or displayed?"
                  : "Delete all simulated history? This does not affect Brave.",
              operation: (api) => api.deleteAll(),
              successMessage: "History cleared.",
            })
          }
        >
          Clear history
        </button>
      </PageHeading>
      <Stats cards={cards} />
      <Library
        name="History"
        controls={{
          ...controls,
          setQuery: (query) => {
            setSelection({ scope: "", ids: new Set() });
            controls.setQuery(query);
          },
        }}
        filters={filters}
        count={items.length}
        total={data.history.length}
        toolbar={
          <>
            {data.mode === "real" && (
              <div className="history-filter-note">
                <p>
                  Filters apply to {data.history.length} loaded URLs.{" "}
                  {data.historyHasMore
                    ? "Older URLs are not yet loaded."
                    : "All returned URLs are loaded."}
                </p>
                {data.historyHasMore && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      mutate((api) => api.loadMoreHistory(), "More history loaded.")
                    }
                  >
                    Load 2,000 more URLs
                  </button>
                )}
              </div>
            )}
            <HistoryDateFilter {...period} onChange={changePeriod} busy={busy} />
            <div className="history-bulk-toolbar">
              <span>{selectedItems.length} selected</span>
              <button onClick={toggleAll} disabled={busy || !items.length}>
                {items.length > 0 && selectedItems.length === items.length
                  ? "Deselect filtered"
                  : "Select all filtered"}
              </button>
              <button
                onClick={() => setSelection({ scope, ids: new Set() })}
                disabled={busy || !selectedItems.length}
              >
                Clear selection
              </button>
              <button
                className="danger"
                onClick={deleteSelected}
                disabled={busy || !selectedItems.length}
              >
                {busy ? "Working…" : `Delete selected (${selectedItems.length})`}
              </button>
            </div>
            <p className="history-filter-note">
              Dates match any recorded visit, in your local timezone. Calendar weeks run
              Monday–Sunday. Deleting a URL removes all its visits.
            </p>
            {incompletePeriod && (
              <p className="history-filter-note" role="status">
                Choose a complete, valid period to show results.
              </p>
            )}
            {bulkReport && (
              <div className="history-bulk-report" role="status">
                <strong>
                  {bulkReport.succeeded.length} deleted; {bulkReport.failed.length}{" "}
                  failed.
                </strong>
                {bulkReport.failed.length > 0 && (
                  <>
                    <p>Failed entries remain selected. Use Delete selected to retry.</p>
                    <ul>
                      {bulkReport.failed.map(({ item, message }) => (
                        <li key={item.id}>
                          {item.title}: {message}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <button onClick={() => setBulkReport(null)}>Dismiss results</button>
              </div>
            )}
          </>
        }
      >
        <RecordTable
          items={items}
          history
          onOpen={setDetails}
          onDelete={remove}
          busy={busy}
          selection={{ ids: selectedIds, toggle, toggleAll }}
        />
      </Library>
      {details && (
        <Modal title="Page visits" onClose={() => setDetails(null)}>
          <div id="details-content">
            <p>{details.title}</p>
            <ul>
              {details.visits.map((visit) => (
                <li key={visit.visitId}>
                  {formatDateTime(visit.visitTime)} ·{" "}
                  {visit.transition === "typed" ? "Typed address" : "Link"}
                </li>
              ))}
            </ul>
          </div>
        </Modal>
      )}
    </>
  );
}
