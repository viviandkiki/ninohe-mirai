"use client";

import { useEffect } from "react";

export default function GSAPSetup() {
  useEffect(() => {
    let cleanupFn: (() => void) | null = null;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      gsap.registerPlugin(ScrollTrigger);

      /* ── 3. Section fade (.section-fade) ── */
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

      /* ── 4. Power card hover ── */
      const cards = document.querySelectorAll<HTMLElement>(".power-card-gsap");
      const handlers: Array<{ card: HTMLElement; enter: () => void; leave: () => void }> = [];
      cards.forEach((card) => {
        const enterHandler = () => {
          gsap.to(card, {
            scale: 1.03,
            boxShadow: "0 12px 36px rgba(46,125,140,0.35)",
            duration: 0.2,
            ease: "power1.out",
          });
        };
        const leaveHandler = () => {
          gsap.to(card, {
            scale: 1,
            boxShadow: "0 0 0 rgba(46,125,140,0)",
            duration: 0.2,
            ease: "power1.out",
          });
        };
        card.addEventListener("mouseenter", enterHandler);
        card.addEventListener("mouseleave", leaveHandler);
        handlers.push({ card, enter: enterHandler, leave: leaveHandler });
      });

      cleanupFn = () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
        handlers.forEach(({ card, enter, leave }) => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        });
      };
    })();

    return () => { cleanupFn?.(); };
  }, []);

  return null;
}
