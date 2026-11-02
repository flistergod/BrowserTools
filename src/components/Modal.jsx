import { useEffect, useId, useRef } from "react";

/** Native dialog supplies focus containment and the Escape-to-close behaviour. */
export default function Modal({ title, onClose, children, busy = false }) {
  const dialog = useRef(null);
  const headingId = useId();

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={headingId}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onClose();
      }}
    >
      <div className="dialog-heading">
        <h2 id={headingId}>{title}</h2>
        <button
          className="icon-button"
          aria-label="Close"
          disabled={busy}
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
