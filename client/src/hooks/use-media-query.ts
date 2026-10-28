import { useEffect, useState } from "react";

/**
 * A CSS media query as a boolean, kept in step with the window.
 *
 * For layout questions that belong to the bar itself rather than to the
 * sidebar's breakpoint: the search sits on its own row on a phone, and the
 * sidebar's breakpoint (`lg`) no longer marks where that row begins.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return matches;
}
