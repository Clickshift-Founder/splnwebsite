"use client";

import { useEffect } from "react";

/**
 * After a search or filter, bring the results into view. On phones the results sit below the hero
 * and search box, so without this a visitor taps "Search" and sees nothing change.
 * `signature` changes whenever the query/filters change, re-triggering the scroll.
 */
export function ScrollToResults({ targetId, signature }: { targetId: string; signature: string }) {
  useEffect(() => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const top = el.getBoundingClientRect().top;
    // Already comfortably on screen (e.g. paging on desktop) — leave the reader where they are.
    if (top >= 0 && top < window.innerHeight * 0.35) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }, [targetId, signature]);
  return null;
}
