import { useState, useEffect } from "react";

/**
 * Returns a debounced version of `value` that only updates
 * after `delay` ms of inactivity. Use this on search inputs
 * so the actual filter/query only fires when the user pauses.
 *
 * @param {any}    value - The value to debounce (typically a search string)
 * @param {number} delay - Milliseconds to wait (default 300)
 */
export function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer); // clear on each change
  }, [value, delay]);

  return debounced;
}
