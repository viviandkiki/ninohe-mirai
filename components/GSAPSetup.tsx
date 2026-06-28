"use client";

import { useEffect } from "react";

export default function GSAPSetup() {
  useEffect(() => {
    let cleanupFn: (() => void) | null = null;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      const sections = document.querySelectorAll<HTMLElement>(".section-fade");
      sections.forEach((el) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: "top 85%",
              once: true,
            },
          }
        );
      });

      cleanupFn = () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      };
    })();

    return () => { cleanupFn?.(); };
  }, []);

  return null;
}
