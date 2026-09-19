"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Pause,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  ArrowDown,
  ArrowUp,
  CircleHelp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
/* ====================================================================== */
/*  GEOMETRY — single source of truth for every coordinate                */
/* ====================================================================== */

const G = {
  /* AC source on the primary side */
  ac: { x: 50, y: 240, r: 28 },

  /* Primary winding — identical size to the secondary */
  primaryX: 95,
  primaryTop: 130,
  primaryBottom: 350,
  primaryLoops: 6,

  /* Laminated core, perfectly centred between the two windings */
  coreX1: 130,
  coreX2: 144,
  coreTop: 105,
  coreBottom: 375,

  /* Secondary winding — same size as the primary */
  secX: 179,
  secTop: 130,
  secBottom: 350,
  secLoops: 6,

  /* The single diode */
  d1: { x1: 290, x2: 340, y: 130, h: 20 },

  /* Output node (cathode side of D1) */
  outX: 490,
  outY: 240,

  /* Load resistor (vertical) */
  loadTop: 275,
  loadBottom: 355,

  /* Return rail */
  retY: 425,
};

/* ====================================================================== */
/*  COIL PATH HELPER                                                      */
/* ====================================================================== */

function coilPath(x, y1, y2, loops, sweep) {
  const step = (y2 - y1) / loops;
  const r = Math.abs(step) / 2;
  let d = `M ${x} ${y1}`;
  for (let i = 0; i < loops; i += 1) {
    d += ` A ${r} ${r} 0 0 ${sweep} ${x} ${y1 + (i + 1) * step}`;
  }
  return d;
}

/* Both coils are the same height and loop count → identical size */
const PRIMARY_COIL = coilPath(
  G.primaryX,
  G.primaryTop,
  G.primaryBottom,
  G.primaryLoops,
  0
);

const SECONDARY_COIL = coilPath(
  G.secX,
  G.secTop,
  G.secBottom,
  G.secLoops,
  1
);

/* ====================================================================== */
/*  WIRE PATHS                                                            */
/* ====================================================================== */

const WIRE = {
  primaryTop: `M ${G.ac.x} ${G.ac.y - G.ac.r} L ${G.ac.x} ${G.primaryTop} L ${G.primaryX} ${G.primaryTop}`,
  primaryBottom: `M ${G.primaryX} ${G.primaryBottom} L ${G.ac.x} ${G.primaryBottom} L ${G.ac.x} ${G.ac.y + G.ac.r}`,

  secToD1: `M ${G.secX} ${G.secTop} L ${G.d1.x1} ${G.d1.y}`,
  d1ToOut: `M ${G.d1.x2} ${G.d1.y} L ${G.outX} ${G.d1.y} L ${G.outX} ${G.outY}`,
  outToLoad: `M ${G.outX} ${G.outY} L ${G.outX} ${G.loadTop}`,
  loadToReturn: `M ${G.outX} ${G.loadBottom} L ${G.outX} ${G.retY} L ${G.secX} ${G.retY} L ${G.secX} ${G.secBottom}`,
};

const RECTIFIER_WIRES = [
  WIRE.secToD1,
  WIRE.d1ToOut,
  WIRE.outToLoad,
  WIRE.loadToReturn,
].join(" ");

/* ====================================================================== */
/*  PARTICLE PATH SAMPLER (arc-length parameterised → constant speed)     */
/* ====================================================================== */

function buildSampler(points) {
  const segs = [];
  let total = 0;

  for (let i = 0; i < points.length - 1; i += 1) {
    const a = points[i];
    const b = points[i + 1];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    segs.push({ a, b, len, start: total });
    total += len;
  }

  return (t) => {
    const target = Math.max(0, Math.min(1, t)) * total;
    let seg = segs[segs.length - 1];

    for (let i = 0; i < segs.length; i += 1) {
      if (target <= segs[i].start + segs[i].len) {
        seg = segs[i];
        break;
      }
    }

    const k =
      seg.len > 0
        ? Math.max(0, Math.min(1, (target - seg.start) / seg.len))
        : 0;

    return {
      x: seg.a.x + (seg.b.x - seg.a.x) * k,
      y: seg.a.y + (seg.b.y - seg.a.y) * k,
    };
  };
}

const PARTICLE_PATH = [
  { x: G.secX, y: G.secTop },
  { x: G.d1.x1, y: G.d1.y },
  { x: G.d1.x2, y: G.d1.y },
  { x: G.outX, y: G.d1.y },
  { x: G.outX, y: G.outY },
  { x: G.outX, y: G.loadTop },
  { x: G.outX, y: G.loadBottom },
  { x: G.outX, y: G.retY },
  { x: G.secX, y: G.retY },
  { x: G.secX, y: G.secBottom },
];

const SAMPLER = buildSampler(PARTICLE_PATH);
const PARTICLE_OFFSETS = [0, 0.2, 0.4, 0.6, 0.8];

/* ====================================================================== */
/*  WAVEFORM HELPERS                                                      */
/* ====================================================================== */

function sineWavePath(width, baseline, amplitude, cycles, steps = 220) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = t * width;
    const y = baseline - Math.sin(t * Math.PI * 2 * cycles) * amplitude;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

function halfWavePath(width, baseline, amplitude, cycles, steps = 220) {
  const pts = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const x = t * width;
    const v = Math.sin(t * Math.PI * 2 * cycles);
    const y = baseline - Math.max(0, v) * amplitude;
    pts.push(`${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

const INPUT_WAVE = sineWavePath(500, 60, 42, 2);
const OUTPUT_WAVE = halfWavePath(500, 100, 42, 2);

const PHASE_RATE = 0.0002; // phase units per millisecond at 1×

/* ====================================================================== */
/*  MAIN COMPONENT                                                        */
/* ====================================================================== */

export function Halfwaverectifier() {
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
      const dt = Math.min(now - last, 64); // clamp after tab switches
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
  /* Derived state — one AC cycle == 0.5 phase units                     */
  /* ------------------------------------------------------------------ */

  const cycleT = (phase * 2) % 1; // 0 → 1 within one AC cycle
  const isConducting = cycleT < 0.5;

  /* Frozen at 1 during the negative half so particles don't jump */
  const halfProgress = Math.min(cycleT * 2, 1);

  const particles = PARTICLE_OFFSETS.map((offset) => {
    const t = (halfProgress + offset) % 1;
    return SAMPLER(t);
  });

  const phaseInfo = isConducting
    ? {
        title: "D1 is conducting",
        subtitle: "Positive half-cycle",
        color: "#ef4444",
        explanation:
          "The secondary top is positive, so D1 is forward-biased and current flows through the load.",
      }
    : {
        title: "D1 is blocking",
        subtitle: "Negative half-cycle",
        color: "#94a3b8",
        explanation:
          "The secondary top is negative, so D1 is reverse-biased. No current flows and the output is zero.",
      };

  /* ------------------------------------------------------------------ */
  /* Waveform markers                                                    */
  /* ------------------------------------------------------------------ */

  const inputValue = Math.sin(phase * Math.PI * 4);
  const outputValue = Math.max(0, inputValue);

  const inputDot = { x: phase * 500, y: 60 - inputValue * 42 };
  const outputDot = { x: phase * 500, y: 100 - outputValue * 42 };

  /* ------------------------------------------------------------------ */
  /* Handlers                                                            */
  /* ------------------------------------------------------------------ */

  const resetAnimation = () => setPhase(0);

  /* ------------------------------------------------------------------ */
  /* Render                                                              */
  /* ------------------------------------------------------------------ */

  return (
    <main className="min-h-screen bg-background text-foreground">
        <Link
        href="/courses/physics"
        className="ml-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Go to Physics
      </Link>
      <div className="mx-auto max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        {/* ============================================================ */}
        {/* HEADER                                                        */}
        {/* ============================================================ */}

        <header className="mb-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                <Zap className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Electronics • Interactive Lesson
                </p>

                <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                  Half-Wave Rectifier
                </h1>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  See how a single diode lets only one half of the AC cycle
                  through, producing pulsating DC with gaps between pulses.
                </p>
              </div>
            </div>

            {/* CONTROLS */}

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPlaying((v) => !v)}
                className="inline-flex items-center gap-2 rounded-xl border bg-card px-3 py-2 text-sm font-semibold shadow-sm transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

              {/* SPEED SEGMENTED CONTROL — includes 0.5× */}

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
          </div>
        </header>

        {/* ============================================================ */}
        {/* STATUS BAR                                                    */}
        {/* ============================================================ */}

        <div className="mb-5 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isConducting ? "on" : "off"}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-3"
              >
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: phaseInfo.color }}
                />

                <div>
                  <p className="text-sm font-bold">{phaseInfo.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {phaseInfo.subtitle}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Current:</span>{" "}
              {isConducting
                ? "secondary → D1 → load → return"
                : "no complete path — output is zero"}
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3-COLUMN LEARNING AREA                                        */}
        {/* ============================================================ */}

        <section className="rounded-3xl border bg-card p-3 shadow-sm sm:p-5 lg:p-6">
          <div className="grid items-stretch gap-4 lg:grid-cols-[0.9fr_1.6fr_0.9fr]">
            {/* ======================================================= */}
            {/* LEFT — AC INPUT                                          */}
            {/* ======================================================= */}

            <div className="flex min-h-[400px] flex-col rounded-2xl border bg-muted/20 p-4 sm:p-5">
              <div className="mb-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-xs font-bold text-amber-600">
                    1
                  </span>
                  <h2 className="font-bold">AC Input</h2>
                </div>

                <p className="text-sm leading-5 text-muted-foreground">
                  Alternating current keeps changing direction.
                </p>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center">
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-4 border-amber-500/70 bg-amber-500/5">
                  <span className="text-2xl font-black text-amber-500">AC</span>

                  <motion.div
                    className="absolute -right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-amber-500"
                    animate={{ x: [0, 12, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 2.5 / speed,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>

                <ArrowDown className="my-4 h-5 w-5 rotate-[-90deg] text-muted-foreground" />

                <Waveform
                  path={INPUT_WAVE}
                  dotX={inputDot.x}
                  dotY={inputDot.y}
                  color="#f59e0b"
                  label="AC"
                  baseline={60}
                />

                <div className="mt-4 rounded-xl border bg-background p-3 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    What does AC do?
                  </p>
                  <p className="mt-1 text-sm leading-5">
                    It moves one way, then the opposite way.
                  </p>
                </div>
              </div>
            </div>

            {/* ======================================================= */}
            {/* CENTRE — RECTIFIER                                       */}
            {/* ======================================================= */}

            <div className="relative overflow-hidden rounded-2xl border bg-background p-3 sm:p-4">
              <div className="mb-2 flex items-center justify-between px-1">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                      2
                    </span>
                    <h2 className="font-bold">Rectifier Process</h2>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    A single diode allows only the positive half of the AC
                    through.
                  </p>
                </div>

                <div
                  className="hidden rounded-full px-3 py-1 text-xs font-bold sm:block"
                  style={{
                    backgroundColor: `${phaseInfo.color}15`,
                    color: phaseInfo.color,
                  }}
                >
                  {isConducting ? "D1 ON" : "D1 OFF"}
                </div>
              </div>

              {/* ------------------- SCHEMATIC ------------------- */}

              <div className="w-full">
                <svg
                  viewBox="0 0 620 460"
                  className="h-auto w-full"
                  role="img"
                  aria-label="Animated half-wave rectifier schematic"
                >
                  <defs>
                    <filter
                      id="hw-glow"
                      x="-50%"
                      y="-50%"
                      width="200%"
                      height="200%"
                    >
                      <feGaussianBlur stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>

                  {/* ---------- base wires (always visible) ---------- */}

                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.3"
                  >
                    <path d={RECTIFIER_WIRES} />
                  </g>

                  {/* ---------- primary circuit ---------- */}

                  <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.55"
                  >
                    <path d={WIRE.primaryTop} />
                    <path d={WIRE.primaryBottom} />
                  </g>

                  {/* ---------- core ---------- */}

                  <g
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity="0.25"
                  >
                    <line
                      x1={G.coreX1}
                      y1={G.coreTop}
                      x2={G.coreX1}
                      y2={G.coreBottom}
                    />
                    <line
                      x1={G.coreX2}
                      y1={G.coreTop}
                      x2={G.coreX2}
                      y2={G.coreBottom}
                    />
                  </g>

                  {/* ---------- primary winding ---------- */}

                  <path
                    d={PRIMARY_COIL}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    opacity="0.8"
                  />

                  {/* ---------- AC source ---------- */}

                  <circle
                    cx={G.ac.x}
                    cy={G.ac.y}
                    r={G.ac.r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    d={`M ${G.ac.x - 13} ${G.ac.y} c 4.5 -13 8.5 -13 13 0 c 4.5 13 8.5 13 13 0`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <text
                    x={G.ac.x}
                    y={G.ac.y - 44}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="11"
                    fontWeight="700"
                    opacity="0.55"
                  >
                    AC SOURCE
                  </text>

                  {/* ---------- secondary winding ---------- */}

                  <path
                    d={SECONDARY_COIL}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />

                  {/* ---------- ACTIVE GLOW — only when conducting ---------- */}

                  <motion.g
                    animate={{ opacity: isConducting ? 0.85 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <path
                      d={RECTIFIER_WIRES}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="9"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#hw-glow)"
                    />
                    <path
                      d={SECONDARY_COIL}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="9"
                      strokeLinecap="round"
                      filter="url(#hw-glow)"
                    />
                  </motion.g>

                  {/* ---------- D1 (diode) ---------- */}

                  <polygon
                    points={`${G.d1.x1},${G.d1.y - G.d1.h} ${G.d1.x1},${
                      G.d1.y + G.d1.h
                    } ${G.d1.x2},${G.d1.y}`}
                    fill={isConducting ? "#ef4444" : "currentColor"}
                    opacity={isConducting ? 1 : 0.25}
                    style={{ transition: "all 0.2s" }}
                  />

                  <line
                    x1={G.d1.x2}
                    y1={G.d1.y - G.d1.h}
                    x2={G.d1.x2}
                    y2={G.d1.y + G.d1.h}
                    stroke={isConducting ? "#ef4444" : "currentColor"}
                    strokeWidth="5"
                    strokeLinecap="round"
                    opacity={isConducting ? 1 : 0.25}
                    style={{ transition: "all 0.2s" }}
                  />

                  <text
                    x={(G.d1.x1 + G.d1.x2) / 2}
                    y={G.d1.y - 34}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="14"
                    fontWeight="800"
                  >
                    D1
                  </text>

                  {/* selection ring around D1 */}
                  <motion.rect
                    x={G.d1.x1 - 16}
                    y={G.d1.y - 34}
                    width="72"
                    height="68"
                    rx="14"
                    fill="none"
                    stroke={isConducting ? "#ef4444" : "#94a3b8"}
                    strokeWidth="2.5"
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />

                  {/* blocking "×" marker */}
                  <AnimatePresence>
                    {!isConducting && (
                      <motion.g
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.7 }}
                        transition={{ duration: 0.2 }}
                      >
                        <line
                          x1={(G.d1.x1 + G.d1.x2) / 2 - 9}
                          y1={G.d1.y - 9}
                          x2={(G.d1.x1 + G.d1.x2) / 2 + 9}
                          y2={G.d1.y + 9}
                          stroke="#94a3b8"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                        <line
                          x1={(G.d1.x1 + G.d1.x2) / 2 + 9}
                          y1={G.d1.y - 9}
                          x2={(G.d1.x1 + G.d1.x2) / 2 - 9}
                          y2={G.d1.y + 9}
                          stroke="#94a3b8"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </motion.g>
                    )}
                  </AnimatePresence>

                  {/* ---------- output node ---------- */}

                  <circle
                    cx={G.outX}
                    cy={G.outY}
                    r="9"
                    fill={isConducting ? "#ef4444" : "#94a3b8"}
                    style={{ transition: "fill 0.2s" }}
                  />

                  <circle
                    cx={G.outX}
                    cy={G.outY}
                    r="16"
                    fill={isConducting ? "#ef4444" : "#94a3b8"}
                    opacity="0.15"
                  />

                  <text
                    x={G.outX}
                    y={G.outY - 26}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="13"
                    fontWeight="800"
                  >
                    +
                  </text>

                  {/* ---------- load resistor ---------- */}

                  <path
                    d={`M ${G.outX} ${G.loadTop} l -22 8 l 44 16 l -44 16 l 44 16 l -44 16 l 22 8`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <text
                    x={G.outX + 38}
                    y={G.loadTop + 32}
                    fill="currentColor"
                    fontSize="14"
                    fontWeight="800"
                  >
                    R
                    <tspan fontSize="10" dy="3">
                      L
                    </tspan>
                  </text>

                  <text
                    x={G.outX + 38}
                    y={G.loadTop + 52}
                    fill="currentColor"
                    fontSize="10"
                    opacity="0.55"
                  >
                    LOAD
                  </text>

                  {/* ---------- current direction arrow (only when conducting) ---------- */}

                  <motion.g
                    animate={{ opacity: isConducting ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.g
                      animate={{ y: [-3, 3, -3] }}
                      transition={{
                        duration: 1.4 / speed,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    >
                      <line
                        x1={G.outX - 42}
                        y1={G.loadTop + 10}
                        x2={G.outX - 42}
                        y2={G.loadBottom - 22}
                        stroke="#ef4444"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                      />

                      <polygon
                        points={`${G.outX - 42},${G.loadBottom - 14} ${
                          G.outX - 48
                        },${G.loadBottom - 26} ${G.outX - 36},${
                          G.loadBottom - 26
                        }`}
                        fill="#ef4444"
                      />
                    </motion.g>
                  </motion.g>

                  {/* ---------- current particles (fade in/out) ---------- */}

                  <motion.g
                    animate={{ opacity: isConducting ? 1 : 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    {particles.map((p, i) => (
                      <circle
                        key={i}
                        cx={p.x}
                        cy={p.y}
                        r="5"
                        fill="#ef4444"
                        filter="url(#hw-glow)"
                      />
                    ))}
                  </motion.g>

                  {/* ---------- coil labels ---------- */}

                  <text
                    x={G.primaryX}
                    y={G.coreTop - 16}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="10"
                    fontWeight="700"
                    opacity="0.5"
                  >
                    PRIMARY
                  </text>

                  <text
                    x={G.secX}
                    y={G.coreTop - 16}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="10"
                    fontWeight="700"
                    opacity="0.5"
                  >
                    SECONDARY
                  </text>

                  {/* ---------- info badge ---------- */}

                  <rect
                    x="330"
                    y="14"
                    width="210"
                    height="46"
                    rx="12"
                    fill={phaseInfo.color}
                    opacity="0.1"
                    style={{ transition: "fill 0.2s" }}
                  />

                  <text
                    x="435"
                    y="35"
                    textAnchor="middle"
                    fill={phaseInfo.color}
                    fontSize="12"
                    fontWeight="800"
                    style={{ transition: "fill 0.2s" }}
                  >
                    {isConducting
                      ? "D1 IS CONDUCTING"
                      : "D1 IS BLOCKING"}
                  </text>

                  <text
                    x="435"
                    y="50"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="9"
                    opacity="0.6"
                  >
                    {isConducting
                      ? "current has a complete path"
                      : "no current flows"}
                  </text>
                </svg>
              </div>

              {/* ---------------- process explanation ---------------- */}

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={isConducting ? "on" : "off"}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-xl border p-3"
                  style={{
                    borderColor: `${phaseInfo.color}40`,
                    backgroundColor: `${phaseInfo.color}0d`,
                  }}
                >
                  <div className="flex gap-3">
                    <div
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                      style={{
                        backgroundColor: `${phaseInfo.color}1a`,
                        color: phaseInfo.color,
                      }}
                    >
                      {isConducting ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>

                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: phaseInfo.color }}
                      >
                        {phaseInfo.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {phaseInfo.explanation}{" "}
                        {isConducting
                          ? "The current then passes through the load."
                          : "The load receives no current during this half."}
                      </p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ======================================================= */}
            {/* RIGHT — DC OUTPUT                                        */}
            {/* ======================================================= */}

            <div className="flex min-h-[400px] flex-col rounded-2xl border bg-muted/20 p-4 sm:p-5">
              <div className="mb-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/10 text-xs font-bold text-green-600">
                    3
                  </span>
                  <h2 className="font-bold">DC Output</h2>
                </div>

                <p className="text-sm leading-5 text-muted-foreground">
                  Only the positive half reaches the load — the rest is lost.
                </p>
              </div>

              <div className="flex flex-1 flex-col justify-center">
                <div className="mb-5 flex items-center justify-center">
                  <div className="flex items-center gap-3 rounded-xl border bg-green-500/5 px-4 py-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10 text-lg font-bold text-green-600">
                      +
                    </div>

                    <div>
                      <p className="text-sm font-bold">Pulsating DC</p>
                      <p className="text-xs text-muted-foreground">
                        Pulses with gaps between them
                      </p>
                    </div>
                  </div>
                </div>

                <Waveform
                  path={OUTPUT_WAVE}
                  dotX={outputDot.x}
                  dotY={outputDot.y}
                  color="#22c55e"
                  label="DC"
                  baseline={100}
                  filled
                />

                <div className="mt-4 rounded-xl border bg-background p-3 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    What did the rectifier do?
                  </p>
                  <p className="mt-1 text-sm leading-5">
                    It removed the negative half, so current flows in one
                    direction — but only half the time.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* FLOW INDICATOR                                            */}
          {/* ========================================================= */}

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 rounded-2xl border bg-muted/20 p-3 text-sm font-semibold">
            <span className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-600">
              AC changes direction
            </span>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            <span className="rounded-lg bg-primary/10 px-3 py-2 text-primary">
              D1 allows one half only
            </span>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            <span className="rounded-lg bg-green-500/10 px-3 py-2 text-green-600">
              Pulsating DC with gaps
            </span>
          </div>
        </section>

        {/* ============================================================ */}
        {/* THREE SIMPLE EXPLANATIONS                                     */}
        {/* ============================================================ */}

        <section className="mt-5 grid gap-3 md:grid-cols-3">
          <InfoBox
            number="1"
            title="AC changes direction"
            text="The secondary voltage becomes positive and negative on alternate half-cycles."
          />

          <InfoBox
            number="2"
            title={phaseInfo.title}
            text={phaseInfo.explanation}
            active
          />

          <InfoBox
            number="3"
            title="The load sees one direction"
            text="Current only flows during the positive half, so the output has gaps."
          />
        </section>

        {/* ============================================================ */}
        {/* CHILD-FRIENDLY EXPLANATION                                    */}
        {/* ============================================================ */}

        <section className="mt-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CircleHelp className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold">
                Think of D1 as a one-way door
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                It opens only when the AC pushes in the forward direction.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ExplanationCard
              color="red"
              icon={<ArrowDown className="h-5 w-5" />}
              title="AC is positive"
              text="D1 opens. Current travels through D1, through the load, and back to the secondary."
            />

            <ExplanationCard
              color="gray"
              icon={<ArrowUp className="h-5 w-5" />}
              title="AC becomes negative"
              text="D1 closes. No current can flow, so the load receives nothing during this half."
            />
          </div>

          {/* SUMMARY */}

          <div className="mt-5 rounded-2xl border bg-muted/30 p-4 text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Remember this
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-sm font-bold sm:text-base">
              <span className="rounded-lg bg-amber-500/10 px-3 py-2 text-amber-600">
                AC
              </span>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />

              <span className="rounded-lg bg-red-500/10 px-3 py-2 text-red-500">
                D1
              </span>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />

              <span className="rounded-lg bg-green-500/10 px-3 py-2 text-green-600">
                One direction only
              </span>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />

              <span className="rounded-lg bg-green-500/10 px-3 py-2 text-green-600">
                Pulsating DC
              </span>
            </div>
          </div>
        </section>

        <footer className="py-7 text-center text-xs text-muted-foreground">
          One complete AC cycle produces one output pulse. Half the input is
          unused.
        </footer>
      </div>
    </main>
  );
}


/* ====================================================================== */
/*  INFO BOX                                                              */
/* ====================================================================== */

function InfoBox({ number, title, text, active = false }) {
  return (
    <div
      className={`rounded-2xl border p-4 transition-colors ${
        active ? "border-primary/20 bg-primary/[0.04]" : "bg-card"
      }`}
    >
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
          {number}
        </div>

        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}

/* ====================================================================== */
/*  WAVEFORM                                                              */
/* ====================================================================== */

function Waveform({
  path,
  dotX,
  dotY,
  color,
  label,
  baseline = 60,
  filled = false,
}) {
  return (
    <svg
      viewBox="0 0 500 120"
      className="h-auto w-full"
      role="img"
      aria-label={`${label} waveform`}
    >
      {/* horizontal zero axis */}
      <line
        x1="0"
        y1={baseline}
        x2="500"
        y2={baseline}
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.2"
      />

      {/* vertical axis */}
      <line
        x1="0"
        y1="8"
        x2="0"
        y2="112"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.2"
      />

      {/* waveform */}
      <path
        d={path}
        fill={filled ? `${color}18` : "none"}
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* moving marker */}
      <circle cx={dotX} cy={dotY} r="9" fill={color} opacity="0.18" />
      <circle cx={dotX} cy={dotY} r="5" fill={color} />

      <text
        x="486"
        y="26"
        textAnchor="end"
        fill={color}
        fontSize="15"
        fontWeight="800"
      >
        {label}
      </text>
    </svg>
  );
}

/* ====================================================================== */
/*  EXPLANATION CARD                                                      */
/* ====================================================================== */

function ExplanationCard({ color, icon, title, text }) {
  const styles =
    color === "red"
      ? {
          wrapper: "border-red-500/20 bg-red-500/[0.04]",
          icon: "bg-red-500/10 text-red-500",
        }
      : {
          wrapper: "border-slate-400/20 bg-slate-400/[0.04]",
          icon: "bg-slate-400/10 text-slate-500",
        };

  return (
    <div className={`rounded-2xl border p-4 ${styles.wrapper}`}>
      <div className="flex gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          {icon}
        </div>

        <div>
          <h3 className="font-bold">{title}</h3>
          <p className="mt-1 text-sm leading-5 text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  );
}