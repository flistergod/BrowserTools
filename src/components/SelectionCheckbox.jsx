import { useEffect, useRef } from "react";

/** Native mixed-state checkbox for selecting all currently filtered rows. */
export default function SelectionCheckbox({ checked, mixed = false, ...props }) {
  const input = useRef(null);
  useEffect(() => {
    input.current.indeterminate = mixed;
  }, [mixed]);
  return <input ref={input} type="checkbox" checked={checked} {...props} />;
}
