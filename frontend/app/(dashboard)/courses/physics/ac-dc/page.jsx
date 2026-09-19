"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Pause,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  RefreshCw,
  Battery,
} from "lucide-react";
import Link from "next/link";
const PHASE_RATE = 0.0002;

/* ====================================================================== */
/*  WAVEFORM HELPERS                                                      */
/* ====================================================================== */

function sineWavePath(width, baseline, amplitude, cycles, steps = 200) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = t * width;
    const y = baseline - Math.sin(t * Math.PI * 2 * cycles) * amplitude;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function dcPath(width, baseline, amplitude, steps = 20) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = t * width;
    const y = baseline - amplitude;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

const AC_WAVE = sineWavePath(500, 60, 42, 2);
const DC_LINE = dcPath(500, 60, 42);

/* ====================================================================== */
/*  MAIN COMPONENT                                                        */
/* ====================================================================== */

export default function ACandDC() {
  const prefersReduced = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [phase, setPhase] = useState(0);

  /* ------------------------------------------------------------------ */
  /* Animation loop                                                      */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    if (!playing || prefersReduced) return undefined;

    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(now - last, 64);
      last = now;

      setPhase((p) => {
        const next = p + dt * PHASE_RATE * speed;
        return next >= 1 ? next - 1 : next;
      });

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, prefersReduced, speed]);

  /* ------------------------------------------------------------------ */
  /* Waveform markers                                                    */
  /* ------------------------------------------------------------------ */

  const acValue = Math.sin(phase * Math.PI * 4);
  const acDot = { x: phase * 500, y: 60 - acValue * 42 };
  const dcDot = { x: phase * 500, y: 60 - 42 };

  const resetAnimation = () => setPhase(0);

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Link
        href="/courses/physics"
        className="rounded-lg bg-primary px-6 ml-2 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go to Physics
      </Link>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {/* ============================================================ */}
        {/* HEADER / DEFINITION                                           */}
        {/* ============================================================ */}

        <header className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
            <Zap className="h-7 w-7" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Electronics • Simple Lesson
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            AC vs DC
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            <span className="font-semibold text-amber-600">
              Alternating Current (AC)
            </span>{" "}
            keeps reversing its direction, while{" "}
            <span className="font-semibold text-green-600">
              Direct Current (DC)
            </span>{" "}
            always flows in one steady direction. Both carry energy — but they
            behave very differently.
          </p>

          {/* CONTROLS */}

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPlaying((v) => !v)}
              className="inline-flex items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-semibold shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {playing ? (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Play
                </>
              )}
            </button>

            <div
              className="flex items-center rounded-xl border bg-card p-0.5 shadow-sm"
              role="group"
              aria-label="Playback speed"
            >
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSpeed(s)}
                  aria-pressed={speed === s}
                  className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    speed === s
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {s}×
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={resetAnimation}
              className="rounded-xl border bg-card p-2.5 shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label="Restart animation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ============================================================ */}
        {/* ANIMATION — AC on the left, DC on the right                   */}
        {/* ============================================================ */}

        <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
          <div className="grid items-center gap-6 md:grid-cols-2">
            {/* ---------- AC ---------- */}

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
              <div className="mb-3 flex items-center justify-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
                  <RefreshCw className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                  Alternating Current
                </h2>
              </div>

              <Waveform
                path={AC_WAVE}
                dotX={acDot.x}
                dotY={acDot.y}
                color="#f59e0b"
                baseline={60}
              />

              <div className="mt-3 space-y-1.5 text-center">
                <p className="text-xs text-muted-foreground">
                  Flows forward, then backward, again and again.
                </p>
                <p className="text-xs font-semibold text-amber-600">
                  Direction changes every half-cycle
                </p>
              </div>
            </div>

            {/* ---------- DC ---------- */}

            <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-5">
              <div className="mb-3 flex items-center justify-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/15 text-green-600">
                  <Battery className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-green-600">
                  Direct Current
                </h2>
              </div>

              <Waveform
                path={DC_LINE}
                dotX={dcDot.x}
                dotY={dcDot.y}
                color="#22c55e"
                baseline={60}
                filled
              />

              <div className="mt-3 space-y-1.5 text-center">
                <p className="text-xs text-muted-foreground">
                  Flows steadily in one direction only.
                </p>
                <p className="text-xs font-semibold text-green-600">
                  Direction never changes
                </p>
              </div>
            </div>
          </div>

          {/* ---------- FLOW SUMMARY ---------- */}

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 rounded-2xl border bg-muted/20 p-4 text-sm font-semibold">
            <span className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-600">
              AC — direction changes
            </span>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            <span className="rounded-lg bg-green-500/10 px-3 py-2 text-green-600">
              DC — direction stays the same
            </span>
          </div>
        </section>

        {/* ============================================================ */}
        {/* COMPARISON CARDS                                              */}
        {/* ============================================================ */}

        <section className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600">
                <RefreshCw className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-amber-700">Alternating Current</h3>
            </div>

            <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted-foreground">
              <li>• Direction reverses periodically</li>
              <li>• Shown as a sine wave</li>
              <li>• Comes from wall outlets and generators</li>
              <li>• Easy to transmit over long distances</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-green-500/20 bg-green-500/[0.04] p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <Battery className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-green-700">Direct Current</h3>
            </div>

            <ul className="mt-3 space-y-1.5 text-sm leading-6 text-muted-foreground">
              <li>• Direction stays constant</li>
              <li>• Shown as a flat line</li>
              <li>• Comes from batteries, solar cells, DC supplies</li>
              <li>• Used by most electronics</li>
            </ul>
          </div>
        </section>

        {/* ============================================================ */}
        {/* KEY IDEA                                                      */}
        {/* ============================================================ */}

        <section className="mt-6 rounded-3xl border bg-card p-6 text-center shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Key Idea
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 sm:text-lg">
            Both AC and DC carry electrical energy. The difference is simple:{" "}
            <span className="font-semibold text-amber-600">
              AC alternates direction
            </span>
            , while{" "}
            <span className="font-semibold text-green-600">
              DC stays in one direction
            </span>
            . A rectifier is what turns AC into DC.
          </p>
        </section>

        <footer className="py-8 text-center text-xs text-muted-foreground">
          Watch the moving dots — AC swings up and down, DC stays level.
        </footer>
      </div>
    </main>
  );
}


/* ====================================================================== */
/*  WAVEFORM                                                              */
/* ====================================================================== */

function Waveform({ path, dotX, dotY, color, baseline = 60, filled = false }) {
  return (
    <svg
      viewBox="0 0 500 120"
      className="h-auto w-full"
      role="img"
      aria-label="waveform"
    >
      <line
        x1="0"
        y1={baseline}
        x2="500"
        y2={baseline}
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.2"
      />

      <line
        x1="0"
        y1="8"
        x2="0"
        y2="112"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.2"
      />

      <path
        d={path}
        fill={filled ? `${color}18` : "none"}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx={dotX} cy={dotY} r="9" fill={color} opacity="0.18" />
      <circle cx={dotX} cy={dotY} r="5" fill={color} />
    </svg>
  );
}