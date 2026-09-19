"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play, RotateCcw, Zap, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
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

function rectifiedWavePath(width, baseline, amplitude, cycles, steps = 200) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = t * width;
    const y =
      baseline - Math.abs(Math.sin(t * Math.PI * 2 * cycles)) * amplitude;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

const INPUT_WAVE = sineWavePath(500, 60, 42, 2);
const OUTPUT_WAVE = rectifiedWavePath(500, 100, 42, 2);

const PHASE_RATE = 0.0002;

/* ====================================================================== */
/*  MAIN COMPONENT                                                        */
/* ====================================================================== */

export default function Rectifier() {
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

  const inputValue = Math.sin(phase * Math.PI * 4);
  const outputValue = Math.abs(inputValue);

  const inputDot = { x: phase * 500, y: 60 - inputValue * 42 };
  const outputDot = { x: phase * 500, y: 100 - outputValue * 42 };

  const resetAnimation = () => setPhase(0);

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-background text-foreground ">
        <Link
        href="/courses/physics"
        className="ml-2 rounded-lg bg-primary px-6 py-3  text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
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
            Rectifier
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A <span className="font-semibold text-foreground">rectifier</span>{" "}
            is an electrical circuit that converts{" "}
            <span className="font-semibold text-amber-600">
              alternating current (AC)
            </span>{" "}
            — which keeps changing direction — into{" "}
            <span className="font-semibold text-green-600">
              direct current (DC)
            </span>{" "}
            — which flows in only one direction.
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
        {/* SIMPLE ANIMATION                                              */}
        {/* ============================================================ */}

        <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
          <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
            {/* ---------- AC INPUT ---------- */}

            <div className="rounded-2xl border bg-amber-500/[0.04] p-5">
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-amber-600">
                  AC Input
                </h2>
              </div>

              <Waveform
                path={INPUT_WAVE}
                dotX={inputDot.x}
                dotY={inputDot.y}
                color="#f59e0b"
                baseline={60}
              />

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Current moves forward, then backward.
              </p>
            </div>

            {/* ---------- ARROW / RECTIFIER SYMBOL ---------- */}

            <div className="flex flex-col items-center justify-center gap-2">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                <Sparkles className="h-6 w-6" />
              </div>

              <ArrowRight className="hidden h-5 w-5 text-muted-foreground md:block" />

              <p className="text-xs font-bold uppercase tracking-wider text-primary">
                Rectifier
              </p>
            </div>

            {/* ---------- DC OUTPUT ---------- */}

            <div className="rounded-2xl border bg-green-500/[0.04] p-5">
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-green-600">
                  DC Output
                </h2>
              </div>

              <Waveform
                path={OUTPUT_WAVE}
                dotX={outputDot.x}
                dotY={outputDot.y}
                color="#22c55e"
                baseline={100}
                filled
              />

              <p className="mt-3 text-center text-xs text-muted-foreground">
                Current flows in one direction only.
              </p>
            </div>
          </div>

          {/* ---------- FLOW SUMMARY ---------- */}

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2 rounded-2xl border bg-muted/20 p-4 text-sm font-semibold">
            <span className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-600">
              AC
            </span>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            <span className="rounded-lg bg-primary/10 px-3 py-2 text-primary">
              Rectifier
            </span>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            <span className="rounded-lg bg-green-500/10 px-3 py-2 text-green-600">
              DC
            </span>
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
            The rectifier keeps the useful part of the wave and flips or blocks
            the part that would push current the wrong way — so the output
            always flows in the same direction.
          </p>
        </section>

        <footer className="py-8 text-center text-xs text-muted-foreground">
          Rectification is the first step in almost every DC power supply.
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