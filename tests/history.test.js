import { test } from "node:test";
import assert from "node:assert/strict";
import { historyDateRange, matchesHistoryRange } from "../src/utils/historyDates.js";
import { deleteHistoryItems } from "../src/utils/bulkOperations.js";
import { createMockBackend } from "../src/services/mockBackend.js";

// Check local calendar boundaries through Lisbon's daylight-saving change.
process.env.TZ = "Europe/Lisbon";

test("day includes midnight and excludes the next day across daylight saving", () => {
  const range = historyDateRange("day", "2026-03-29");
  assert.equal(range.start, +new Date(2026, 2, 29));
  assert.equal(range.end, +new Date(2026, 2, 30));
  assert.equal(range.end - range.start, 23 * 60 * 60 * 1000);
  assert.equal(matchesHistoryRange({ lastVisitTime: range.start }, range), true);
  assert.equal(matchesHistoryRange({ lastVisitTime: range.end }, range), false);
});

test("month, year, ISO week and inclusive date range boundaries", () => {
  const month = historyDateRange("month", "2024-02");
  assert.equal(month.start, +new Date(2024, 1, 1));
  assert.equal(month.end, +new Date(2024, 2, 1));
  assert.equal(historyDateRange("year", "2026").end, +new Date(2027, 0, 1));
  const week = historyDateRange("week", "2026-W01");
  assert.equal(week.start, +new Date(2025, 11, 29));
  assert.equal(week.end, +new Date(2026, 0, 5));
  assert.equal(
    historyDateRange("range", "2026-11-01", "2026-11-03").end,
    +new Date(2026, 10, 4),
  );
  assert.equal(historyDateRange("range", "2026-11-03", "2026-11-01"), null);
  assert.equal(historyDateRange("week", "2026-W99"), null);
  assert.equal(historyDateRange("day", ""), null);
});

test("older visits match even when the latest visit is outside the period", () => {
  const item = {
    lastVisitTime: +new Date(2026, 10, 2),
    visits: [
      { visitTime: +new Date(2025, 5, 15) },
      { visitTime: +new Date(2026, 10, 2) },
    ],
  };
  assert.equal(matchesHistoryRange(item, historyDateRange("month", "2025-06")), true);
  assert.equal(matchesHistoryRange(item, historyDateRange("year", "2024")), false);
  assert.equal(matchesHistoryRange(item, null), true);
});

test("bulk reports success, async failure and synchronous errors separately", async () => {
  const items = ["ok", "async-failure", "sync-failure"].map((id) => ({
    id,
    url: `https://${id}.example`,
  }));
  const result = await deleteHistoryItems(
    {
      deleteUrl(url) {
        if (url.includes("async-failure")) return Promise.reject(Error("Try again"));
        if (url.includes("sync-failure")) throw Error("Blocked");
        return Promise.resolve();
      },
    },
    items,
  );
  assert.deepEqual(
    result.succeeded.map((item) => item.id),
    ["ok"],
  );
  assert.deepEqual(
    result.failed.map(({ item }) => item.id),
    ["async-failure", "sync-failure"],
  );
  assert.deepEqual(
    result.failed.map(({ message }) => message),
    ["Try again", "Blocked"],
  );
});

test("bulk deduplicates URLs and limits concurrency to ten requests", async () => {
  let active = 0;
  let peak = 0;
  let calls = 0;
  const items = Array.from({ length: 25 }, (_, id) => ({
    id: String(id),
    url: `https://example.com/${id}`,
  }));
  const result = await deleteHistoryItems(
    {
      async deleteUrl() {
        calls++;
        active++;
        peak = Math.max(peak, active);
        await new Promise((resolve) => setTimeout(resolve, 1));
        active--;
      },
    },
    [...items, items[0]],
  );
  assert.equal(result.succeeded.length, 25);
  assert.equal(calls, 25);
  assert.equal(peak, 10);
});

test("bulk removes selected URLs while preserving unselected history and bookmarks", async () => {
  const api = createMockBackend(null);
  const before = await api.snapshot();
  const result = await deleteHistoryItems(api, before.history.slice(0, 2));
  const after = await api.snapshot();
  assert.equal(result.failed.length, 0);
  assert.deepEqual(after.history, before.history.slice(2));
  assert.deepEqual(after.bookmarks, before.bookmarks);
  assert.deepEqual(await deleteHistoryItems(api, []), { succeeded: [], failed: [] });
});
