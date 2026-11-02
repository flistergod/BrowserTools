/** Use local calendar boundaries, including days affected by daylight saving. */
function localDate(value) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function localDateValue(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Returns a half-open interval: start is included, end is excluded. */
export function historyDateRange(mode, value, endValue) {
  if (!value) return null;
  let start;
  let end;

  if (mode === "day" || mode === "range") {
    start = localDate(value);
    end = localDate(mode === "range" ? endValue || value : value);
    end.setDate(end.getDate() + 1);
  } else if (mode === "week") {
    const match = /^(\d{4})-W(\d{2})$/.exec(value);
    if (!match || Number(match[2]) < 1 || Number(match[2]) > 53) return null;
    // ISO week 1 contains January 4. Weeks run Monday through Sunday.
    start = new Date(Number(match[1]), 0, 4);
    start.setDate(
      start.getDate() - ((start.getDay() + 6) % 7) + (Number(match[2]) - 1) * 7,
    );
    end = new Date(start);
    end.setDate(end.getDate() + 7);
  } else if (mode === "month") {
    const [year, month] = value.split("-").map(Number);
    start = new Date(year, month - 1, 1);
    end = new Date(year, month, 1);
  } else if (mode === "year") {
    start = new Date(Number(value), 0, 1);
    end = new Date(Number(value) + 1, 0, 1);
  } else {
    return null;
  }

  if (!Number.isFinite(+start) || !Number.isFinite(+end) || end <= start) return null;
  return { start: +start, end: +end };
}

/** A URL matches if ANY recorded visit falls in the period, not just its latest visit. */
export function matchesHistoryRange(item, range) {
  if (!range) return true;
  const visits = item.visits?.length ? item.visits : [{ visitTime: item.lastVisitTime }];
  return visits.some(
    (visit) => visit.visitTime >= range.start && visit.visitTime < range.end,
  );
}
