'use client';
import React, { useEffect, useRef, useState } from 'react';

// ✅ Animation sprint — animated number counter. Counts from 0 to `value`
// the first time it scrolls into view, with an ease-out curve so the last
// digits land gently. Accepts a custom formatter (e.g. 1200 → "1.2K+").
export default function CountUp({
  value,
  format,
  duration = 1200,
}: {
  value: number;
  format?: (n: number) => string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const run = () => {
      if (started.current) return;
      started.current = true;
      const t0 = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - t0) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        setDisplay(Math.round(value * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    if (typeof IntersectionObserver === 'undefined') { setDisplay(value); return; }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { run(); obs.disconnect(); } },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  return <span ref={ref}>{format ? format(display) : display.toLocaleString()}</span>;
}
