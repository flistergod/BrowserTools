import { useState } from "react";
import PageHeading from "../components/PageHeading.jsx";
import Stats from "../components/Stats.jsx";
import Library from "../components/Library.jsx";
import RecordTable from "../components/RecordTable.jsx";
import BookmarkEditor from "../components/BookmarkEditor.jsx";
import { useLibrary } from "../hooks/useLibrary.js";
import { DAY } from "../utils/format.js";

/** Owns bookmark filters and the editor. Saves go through the backend adapter. */
export default function BookmarksPage({ data, mutate, confirm, busy }) {
  const controls = useLibrary(data.bookmarks);
  const [editor, setEditor] = useState(null);
  const items = controls.items.filter(
    (item) => controls.filter === "all" || item.parentId === controls.filter,
  );
  const cards = [
    {
      icon: "☆",
      label: "Total bookmarks",
      value: data.bookmarks.length,
      note: "In your library",
    },
    {
      icon: "▱",
      label: "Folders",
      value: data.folders.length,
      note: "Everything in its place",
    },
    {
      icon: "↗",
      label: "Added this week",
      value: data.bookmarks.filter((item) => item.dateAdded > Date.now() - 7 * DAY)
        .length,
      note: "New discoveries",
    },
  ];
  const filters = [
    { id: "all", label: "All" },
    ...data.folders.map((folder) => ({ id: folder.id, label: folder.title })),
    { id: "new", label: "＋ Folder", onClick: () => setEditor({ folderOnly: true }) },
  ];

  async function save(input) {
    const saved = await mutate(
      (api) =>
        editor.folderOnly
          ? api.createFolder(input.title, input.parentId)
          : api.saveBookmark(input),
      "Changes saved.",
    );
    if (saved) setEditor(null);
  }

  function remove(item) {
    confirm({
      message: `Delete “${item.title}”${data.mode === "real" ? " from your browser profile? This may sync to other devices." : " from the demo data?"}`,
      operation: (api) => api.removeBookmark(item.id),
      successMessage: "Bookmark deleted.",
    });
  }

  return (
    <>
      <PageHeading
        title="Your bookmarks"
        description="Save good discoveries. Find them when you need them."
      >
        <button className="primary" onClick={() => setEditor({})} disabled={busy}>
          ＋ New bookmark
        </button>
      </PageHeading>
      <Stats cards={cards} />
      <Library
        name="Bookmarks"
        controls={controls}
        filters={filters}
        count={items.length}
        total={data.bookmarks.length}
      >
        <RecordTable
          items={items}
          folders={data.folders}
          onOpen={(item) => setEditor({ item })}
          onDelete={remove}
          busy={busy}
        />
      </Library>
      {editor && (
        <BookmarkEditor
          {...editor}
          folders={data.folders.filter((folder) => !folder.readOnly)}
          defaultFolder={
            data.folders.find(
              (folder) => folder.id === controls.filter && !folder.readOnly,
            )?.id
          }
          onClose={() => setEditor(null)}
          onSave={save}
          busy={busy}
        />
      )}
    </>
  );
}
