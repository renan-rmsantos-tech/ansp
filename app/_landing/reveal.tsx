"use client";

import { useEffect } from "react";

/**
 * Progressive enhancement for the landing's scroll reveals.
 * Elements are fully visible by default; this only adds the `in` class to
 * trigger a one-shot entrance animation as each element enters the viewport.
 * If JS or IntersectionObserver is unavailable, content simply stays visible.
 */
export function Reveal() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const els = Array.from(document.querySelectorAll<HTMLElement>(".reveal"));
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
