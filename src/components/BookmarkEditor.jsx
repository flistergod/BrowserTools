import { useState } from "react";
import Modal from "./Modal.jsx";

/** One form supports adding/editing bookmarks and creating folders. */
export default function BookmarkEditor({
  item,
  folderOnly,
  folders,
  defaultFolder,
  onClose,
  onSave,
  busy,
}) {
  const [title, setTitle] = useState(item?.title || "");
  const [url, setUrl] = useState(item?.url || "");
  const [parentId, setParentId] = useState(
    item?.parentId || defaultFolder || folders[0]?.id,
  );

  const dialogTitle = folderOnly ? "New folder" : item ? "Edit bookmark" : "New bookmark";

  async function submit(event) {
    event.preventDefault();
    // Include an ID only for existing records; parentId selects the destination folder.
    await onSave({
      ...(item ? { id: item.id } : {}),
      title: title.trim(),
      url: url.trim(),
      parentId,
    });
  }

  return (
    <Modal title={dialogTitle} onClose={onClose} busy={busy}>
      <form onSubmit={submit}>
        <label>
          Name
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            maxLength={150}
          />
        </label>
        <>
          {!folderOnly && (
            <label>
              URL
              <input
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                required
                placeholder="https://"
              />
            </label>
          )}
          <label>
            Folder
            <select
              value={parentId}
              required
              onChange={(event) => setParentId(event.target.value)}
            >
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.title}
                </option>
              ))}
            </select>
          </label>
        </>
        <div className="dialog-actions">
          <button type="button" onClick={onClose} disabled={busy}>
            Cancel
          </button>
          <button className="primary" type="submit" disabled={busy || !folders.length}>
            {busy ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
