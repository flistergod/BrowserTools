import { useState } from "react";

/** Local search and ordering, shared by all three feature pages. */
export function useLibrary(records) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("recent");
  const [filter, setFilter] = useState("all");

  const items = records.filter((item) => {
    const text = `${item.title || item.name} ${item.url || item.description || ""}`;
    return text.toLocaleLowerCase("en-GB").includes(query.toLocaleLowerCase("en-GB"));
  });

  items.sort((first, second) => {
    if (sort === "name") {
      return (first.title || first.name).localeCompare(second.title || second.name, "en");
    }
    return (
      (second.dateAdded || second.lastVisitTime || 0) -
      (first.dateAdded || first.lastVisitTime || 0)
    );
  });

  return { items, query, setQuery, sort, setSort, filter, setFilter };
}
