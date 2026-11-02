import { useCallback, useEffect, useRef, useState } from "react";
import { backend } from "../services/backend.js";

/** Owns data loading, backend changes and temporary feedback messages. */
export function useBrowserData() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef(null);

  const notify = useCallback((text) => {
    setMessage(text);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMessage(""), 3500);
  }, []);

  useEffect(() => {
    let active = true;
    backend.snapshot().then(
      (snapshot) => {
        if (active) setData(snapshot);
      },
      (failure) => {
        if (active) setError(failure.message);
      },
    );
    return () => {
      active = false;
      clearTimeout(timer.current);
    };
  }, []);

  // Return success so a form closes only after its data was saved.
  const mutate = async (operation, successMessage) => {
    setBusy(true);
    try {
      const result = await operation(backend);
      setData(await backend.snapshot());
      // Bulk operations can build feedback from their per-item results.
      notify(
        typeof successMessage === "function" ? successMessage(result) : successMessage,
      );
      return true;
    } catch (failure) {
      // A multi-step API write can partially succeed. Refresh what actually exists.
      try {
        setData(await backend.snapshot());
      } catch {
        // Keep the last snapshot if access was revoked or the browser is unavailable.
      }
      notify(failure.message);
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { data, error, message, busy, mutate };
}
