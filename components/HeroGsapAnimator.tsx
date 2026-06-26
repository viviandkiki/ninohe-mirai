"use client";

import { useEffect, useRef } from "react";

export default function HeroGsapAnimator() {
  const didRun = useRef(false);

  useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;

    (async () => {
      const { gsap } = await import("gsap");
      const SplitTypeModule = await import("split-type");
      const SplitType = SplitTypeModule.default;

      /* ── 2. h1 SplitType line-by-line reveal ── */
      const h1 = document.querySelector<HTMLElement>(".hero-h1");
      if (h1) {
        const split = new SplitType(h1, { types: "lines" });
        gsap.fromTo(
          split.lines,
          { opacity: 0, y: 32 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            ease: "power3.out",
            stagger: 0.15,
            delay: 0.2,
          }
        );
      }

      /* ── hero sub-elements fade in ── */
      const subEls = document.querySelectorAll(".hero-fade-in");
      gsap.fromTo(
        subEls,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out", stagger: 0.1, delay: 0.7 }
      );
    })();
  }, []);

  return null;
}
