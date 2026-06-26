// Floating low-poly triangles behind the hero section.
// Uses pre-defined SVG triangles + CSS keyframe animations (no Canvas API).

const TRIS = [
  { x: 8,  y: 12, s: 38, r: 20,  color: "#1B4E8A", op: 0.14, dur: 22, del: 0   },
  { x: 82, y: 8,  s: 28, r: 140, color: "#52B788", op: 0.13, dur: 18, del: -7  },
  { x: 55, y: 70, s: 44, r: 260, color: "#B8872A", op: 0.11, dur: 26, del: -12 },
  { x: 91, y: 55, s: 20, r: 80,  color: "#8B2500", op: 0.13, dur: 20, del: -5  },
  { x: 25, y: 85, s: 16, r: 190, color: "#2e7d8c", op: 0.12, dur: 24, del: -18 },
  { x: 68, y: 35, s: 32, r: 45,  color: "#4A9E8F", op: 0.12, dur: 17, del: -3  },
  { x: 12, y: 55, s: 22, r: 300, color: "#B8872A", op: 0.11, dur: 21, del: -9  },
  { x: 44, y: 18, s: 14, r: 220, color: "#1B4E8A", op: 0.13, dur: 19, del: -15 },
  { x: 77, y: 82, s: 18, r: 160, color: "#52B788", op: 0.12, dur: 23, del: -4  },
  { x: 35, y: 45, s: 12, r: 340, color: "#8B2500", op: 0.11, dur: 16, del: -11 },
  { x: 93, y: 20, s: 40, r: 60,  color: "#1B4E8A", op: 0.10, dur: 28, del: -20 },
  { x: 6,  y: 75, s: 24, r: 120, color: "#4A9E8F", op: 0.12, dur: 22, del: -8  },
  { x: 60, y: 5,  s: 16, r: 200, color: "#B8872A", op: 0.13, dur: 18, del: -14 },
  { x: 48, y: 90, s: 30, r: 280, color: "#2e7d8c", op: 0.11, dur: 25, del: -2  },
  { x: 20, y: 30, s: 10, r: 100, color: "#52B788", op: 0.12, dur: 20, del: -16 },
] as const;

// CSS keyframes: one per unique drift direction using animation-delay offsets
const DRIFT_CSS = TRIS.map((t, i) => {
  // compute a drift based on the index for variety
  const dx = ((i * 37 + 11) % 60) - 30;
  const dy = ((i * 53 + 7) % 50) - 25;
  return (
    `@keyframes htri${i}{` +
    `from{transform:translate(-50%,-50%) rotate(${t.r}deg) translate(0px,0px);}` +
    `to{transform:translate(-50%,-50%) rotate(${t.r + 25}deg) translate(${dx}px,${dy}px);}` +
    `}`
  );
}).join("\n");

export default function HeroCanvas() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden pointer-events-none select-none"
    >
      <style dangerouslySetInnerHTML={{ __html: DRIFT_CSS }} />
      {TRIS.map((t, i) => {
        const s = t.s;
        const pts = `0,${-s} ${s * 0.866},${s * 0.5} ${-s * 0.866},${s * 0.5}`;
        return (
          <svg
            key={i}
            style={{
              position: "absolute",
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: s * 2,
              height: s * 2,
              overflow: "visible",
              opacity: t.op,
              animation: `htri${i} ${t.dur}s ease-in-out ${t.del}s infinite alternate`,
            }}
            viewBox={`${-s} ${-s} ${s * 2} ${s * 2}`}
          >
            <polygon points={pts} fill={t.color} />
          </svg>
        );
      })}
    </div>
  );
}
