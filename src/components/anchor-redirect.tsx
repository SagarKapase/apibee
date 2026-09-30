"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/** Sends links to the old per-group anchors (#books-get-by-id) to endpoint pages. */
export function AnchorRedirect({ targets }: { targets: Record<string, string> }) {
  const router = useRouter();

  useEffect(() => {
    const target = targets[decodeURIComponent(window.location.hash.slice(1))];
    if (target) router.replace(target);
  }, [router, targets]);

  return null;
}
