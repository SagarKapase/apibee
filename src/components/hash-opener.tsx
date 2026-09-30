"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/** Open the <details> element with this id and scroll it into view. */
export function openDetails(id: string) {
  const el = document.getElementById(id);
  if (el instanceof HTMLDetailsElement) {
    el.open = true;
    el.scrollIntoView({ block: "start" });
  }
}

function openFromHash() {
  const id = decodeURIComponent(window.location.hash.slice(1));
  if (id) openDetails(id);
}

/**
 * Opens the entry named by the URL hash. Client-side navigation does not fire
 * hashchange, so this also runs whenever the path changes.
 */
export function HashOpener() {
  const pathname = usePathname();

  useEffect(() => {
    openFromHash();
  }, [pathname]);

  useEffect(() => {
    window.addEventListener("hashchange", openFromHash);
    return () => window.removeEventListener("hashchange", openFromHash);
  }, []);

  return null;
}
