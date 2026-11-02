/** Controlled calendar inputs; HistoryPage owns the selected period. */
export default function HistoryDateFilter({ mode, value, end, exclude, onChange, busy }) {
  function update(changes) {
    onChange({ mode, value, end, exclude, ...changes });
  }

  const invalidRange = mode === "range" && value && end && end < value;

  return (
    <div className="history-date-filter">
      <label>
        Date filter
        <select
          value={mode}
          disabled={busy}
          onChange={(event) => update({ mode: event.target.value, value: "", end: "" })}
        >
          <option value="all">All dates</option>
          <option value="day">Specific day</option>
          <option value="range">Date range</option>
          <option value="week">Calendar week</option>
          <option value="month">Month</option>
          <option value="year">Year</option>
        </select>
      </label>

      {mode !== "all" && (
        <>
          <label>
            {mode === "range" ? "From (inclusive)" : "Choose period"}
            <input
              aria-label={mode === "range" ? "Start date" : `Choose ${mode}`}
              type={
                mode === "year"
                  ? "number"
                  : mode === "range" || mode === "day"
                    ? "date"
                    : mode
              }
              min={mode === "year" ? "1000" : undefined}
              max={mode === "year" ? "9999" : undefined}
              placeholder={mode === "year" ? "YYYY" : undefined}
              value={value}
              disabled={busy}
              onChange={(event) => update({ value: event.target.value })}
            />
          </label>
          {mode === "range" && (
            <label>
              To (inclusive)
              <input
                type="date"
                aria-label="End date"
                min={value || undefined}
                value={end}
                disabled={busy}
                onChange={(event) => update({ end: event.target.value })}
              />
            </label>
          )}
          <label>
            Matching visits
            <select
              value={exclude ? "exclude" : "include"}
              disabled={busy}
              onChange={(event) => update({ exclude: event.target.value === "exclude" })}
            >
              <option value="include">Include period</option>
              <option value="exclude">Exclude period</option>
            </select>
          </label>
        </>
      )}
      {invalidRange && (
        <p role="alert">The end date must be on or after the start date.</p>
      )}
    </div>
  );
}
