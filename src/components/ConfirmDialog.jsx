import Modal from "./Modal.jsx";

/** Ask before deleting demo records. The parent supplies the actual operation. */
export default function ConfirmDialog({
  title = "Confirm deletion",
  message,
  onClose,
  onConfirm,
  busy,
}) {
  return (
    <Modal title={title} onClose={onClose} busy={busy}>
      <p>{message}</p>
      <div className="dialog-actions">
        <button onClick={onClose} disabled={busy}>
          Cancel
        </button>
        <button className="danger" onClick={onConfirm} disabled={busy}>
          {busy ? "Working…" : "Confirm"}
        </button>
      </div>
    </Modal>
  );
}
