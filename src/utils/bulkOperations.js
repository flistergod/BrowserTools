/**
 * Run independent async operations in small batches. allSettled waits for every
 * result, so one rejection never hides successful deletes or prevents retries.
 */
export async function deleteHistoryItems(api, items) {
  const succeeded = [];
  const failed = [];
  const uniqueItems = [...new Map(items.map((item) => [item.url, item])).values()];

  for (let offset = 0; offset < uniqueItems.length; offset += 10) {
    const batch = uniqueItems.slice(offset, offset + 10);
    const results = await Promise.allSettled(
      batch.map((item) => Promise.resolve().then(() => api.deleteUrl(item.url))),
    );

    results.forEach((result, index) => {
      const item = batch[index];
      if (result.status === "fulfilled") succeeded.push(item);
      else
        failed.push({ item, message: result.reason?.message || String(result.reason) });
    });
  }

  return { succeeded, failed };
}
