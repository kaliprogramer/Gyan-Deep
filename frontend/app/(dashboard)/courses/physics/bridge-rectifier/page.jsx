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
} from "lucide-react";
import Link from "next/link";
/* ====================================================================== */
/*  GEOMETRY                                                              */
/* ====================================================================== */

const AC = { x: 90, y: 230, r: 30 };

const BRIDGE = {
  leftX: 240,
  rightX: 480,
  topY: 120,
  bottomY: 340,
  midY: 230,
  centerX: 360,
};

const D1 = { x: 240, y: 175 };
const D2 = { x: 480, y: 175 };
const D3 = { x: 240, y: 285 };
const D4 = { x: 480, y: 285 };

const LOAD = { x: 600, top: 260, bottom: 400 };

/* ====================================================================== */
/*  WIRES                                                                 */
/* ====================================================================== */

const WIRE = {
  ac1: `M ${AC.x + AC.r} ${AC.y} L ${BRIDGE.leftX} ${BRIDGE.midY}`,
  ac2: `M ${AC.x} ${AC.y + AC.r} L ${AC.x} 460 L 720 460 L 720 ${BRIDGE.midY} L ${BRIDGE.rightX} ${BRIDGE.midY}`,
  plus: `M ${BRIDGE.centerX} ${BRIDGE.topY} L ${BRIDGE.centerX} 60 L ${LOAD.x} 60 L ${LOAD.x} ${LOAD.top}`,
  minus: `M ${BRIDGE.centerX} ${BRIDGE.bottomY} L ${BRIDGE.centerX} 420 L ${LOAD.x} 420 L ${LOAD.x} ${LOAD.bottom}`,
  topRail: `M ${BRIDGE.leftX} ${BRIDGE.topY} L ${BRIDGE.rightX} ${BRIDGE.topY}`,
  bottomRail: `M ${BRIDGE.leftX} ${BRIDGE.bottomY} L ${BRIDGE.rightX} ${BRIDGE.bottomY}`,
  leftRail: `M ${BRIDGE.leftX} ${BRIDGE.topY} L ${BRIDGE.leftX} ${BRIDGE.bottomY}`,
  rightRail: `M ${BRIDGE.rightX} ${BRIDGE.topY} L ${BRIDGE.rightX} ${BRIDGE.bottomY}`,
};

const BASE_WIRES = Object.values(WIRE).join(" ");

const GLOW_POS = `M ${BRIDGE.leftX} ${BRIDGE.midY} L ${BRIDGE.leftX} ${BRIDGE.topY} L ${BRIDGE.centerX} ${BRIDGE.topY} L ${BRIDGE.centerX} 60 L ${LOAD.x} 60 L ${LOAD.x} ${LOAD.top} L ${LOAD.x} ${LOAD.bottom} L ${LOAD.x} 420 L ${BRIDGE.centerX} 420 L ${BRIDGE.centerX} ${BRIDGE.bottomY} L ${BRIDGE.rightX} ${BRIDGE.bottomY} L ${BRIDGE.rightX} ${BRIDGE.midY}`;

const GLOW_NEG = `M ${BRIDGE.rightX} ${BRIDGE.midY} L ${BRIDGE.rightX} ${BRIDGE.topY} L ${BRIDGE.centerX} ${BRIDGE.topY} L ${BRIDGE.centerX} 60 L ${LOAD.x} 60 L ${LOAD.x} ${LOAD.top} L ${LOAD.x} ${LOAD.bottom} L ${LOAD.x} 420 L ${BRIDGE.centerX} 420 L ${BRIDGE.centerX} ${BRIDGE.bottomY} L ${BRIDGE.leftX} ${BRIDGE.bottomY} L ${BRIDGE.leftX} ${BRIDGE.midY}`;

const PARTICLE_POS = [
  { x: BRIDGE.leftX, y: BRIDGE.midY },
  { x: BRIDGE.leftX, y: BRIDGE.topY },
  { x: BRIDGE.centerX, y: BRIDGE.topY },
  { x: BRIDGE.centerX, y: 60 },
  { x: LOAD.x, y: 60 },
  { x: LOAD.x, y: LOAD.top },
  { x: LOAD.x, y: LOAD.bottom },
  { x: LOAD.x, y: 420 },
  { x: BRIDGE.centerX, y: 420 },
  { x: BRIDGE.centerX, y: BRIDGE.bottomY },
  { x: BRIDGE.rightX, y: BRIDGE.bottomY },
  { x: BRIDGE.rightX, y: BRIDGE.midY },
];

const PARTICLE_NEG = [
  { x: BRIDGE.rightX, y: BRIDGE.midY },
  { x: BRIDGE.rightX, y: BRIDGE.topY },
  { x: BRIDGE.centerX, y: BRIDGE.topY },
  { x: BRIDGE.centerX, y: 60 },
  { x: LOAD.x, y: 60 },
  { x: LOAD.x, y: LOAD.top },
  { x: LOAD.x, y: LOAD.bottom },
  { x: LOAD.x, y: 420 },
  { x: BRIDGE.centerX, y: 420 },
  { x: BRIDGE.centerX, y: BRIDGE.bottomY },
  { x: BRIDGE.leftX, y: BRIDGE.bottomY },
  { x: BRIDGE.leftX, y: BRIDGE.midY },
];

/* ====================================================================== */
/*  SAMPLER (arc-length parameterised → constant speed)                   */
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

const SAMPLER_POS = buildSampler(PARTICLE_POS);
const SAMPLER_NEG = buildSampler(PARTICLE_NEG);
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

function rectifiedWavePath(width, baseline, amplitude, cycles, steps = 220) {
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

const PHASE_RATE = 0.0002; // phase units per millisecond at 1×

/* ====================================================================== */
/*  DIODE SYMBOL                                                          */
/* ====================================================================== */

function Diode({ x, y, active, color }) {
  return (
    <g>
      <polygon
        points={`${x - 14},${y + 16} ${x + 14},${y + 16} ${x},${y - 16}`}
        fill={active ? color : "currentColor"}
        opacity={active ? 1 : 0.22}
        style={{ transition: "opacity 0.2s, fill 0.2s" }}
      />
      <line
        x1={x - 14}
        y1={y - 16}
        x2={x + 14}
        y2={y - 16}
        stroke={active ? color : "currentColor"}
        strokeWidth="5"
        strokeLinecap="round"
        opacity={active ? 1 : 0.22}
        style={{ transition: "opacity 0.2s, stroke 0.2s" }}
      />
    </g>
  );
}

/* ====================================================================== */
/*  MAIN COMPONENT                                                        */
/* ====================================================================== */

export function BridgeRectifier() {
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
  /* Derived state                                                       */
  /* ------------------------------------------------------------------ */

  const cycleT = (phase * 2) % 1;
  const isPositive = cycleT < 0.5;
  const halfProgress = isPositive ? cycleT * 2 : (cycleT - 0.5) * 2;

  const activeColor = isPositive ? "#ef4444" : "#3b82f6";

  const phaseInfo = isPositive
    ? {
        diodes: "D1 & D4",
        title: "D1 and D4 are conducting",
        subtitle: "Positive half-cycle",
        color: "#ef4444",
        explanation:
          "AC1 is positive, so current flows up through D1, across to the load, and returns through D4 to AC2.",
      }
    : {
        diodes: "D2 & D3",
        title: "D2 and D3 are conducting",
        subtitle: "Negative half-cycle",
        color: "#3b82f6",
        explanation:
          "AC2 is positive, so current flows up through D2, across to the load, and returns through D3 to AC1.",
      };

  /* ------------------------------------------------------------------ */
  /* Particles                                                           */
  /* ------------------------------------------------------------------ */

  const sampler = isPositive ? SAMPLER_POS : SAMPLER_NEG;

  const particles = PARTICLE_OFFSETS.map((offset) => {
    const t = (halfProgress + offset) % 1;
    return sampler(t);
  });

  /* ------------------------------------------------------------------ */
  /* Waveform markers                                                    */
  /* ------------------------------------------------------------------ */

  const inputValue = Math.sin(phase * Math.PI * 4);
  const outputValue = Math.abs(inputValue);

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
                  Bridge Rectifier
                </h1>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Four diodes in a bridge arrangement let both halves of AC
                  produce current through the load in one direction — no
                  centre-tapped transformer needed.
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
                key={phaseInfo.diodes}
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
              {isPositive
                ? "AC1 → D1 → load → D4 → AC2"
                : "AC2 → D2 → load → D3 → AC1"}
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
                    Four diodes route both halves through the load in the same
                    direction.
                  </p>
                </div>

                <div
                  className="hidden rounded-full px-3 py-1 text-xs font-bold sm:block"
                  style={{
                    backgroundColor: `${phaseInfo.color}15`,
                    color: phaseInfo.color,
                  }}
                >
                  {phaseInfo.diodes} ON
                </div>
              </div>

              {/* ------------------- SCHEMATIC ------------------- */}

              <div className="w-full">
                <svg
                  viewBox="0 0 780 520"
                  className="h-auto w-full"
                  role="img"
                  aria-label="Animated bridge rectifier schematic"
                >
                  <defs>
                    <filter
                      id="bridge-glow"
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

                  {/* ---------- dashed bridge outline ---------- */}

                  <rect
                    x={BRIDGE.leftX - 34}
                    y={BRIDGE.topY - 34}
                    width={BRIDGE.rightX - BRIDGE.leftX + 68}
                    height={BRIDGE.bottomY - BRIDGE.topY + 68}
                    rx="18"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                    opacity="0.18"
                  />

                  <text
                    x={BRIDGE.centerX}
                    y={BRIDGE.topY - 46}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="11"
                    fontWeight="700"
                    opacity="0.5"
                  >
                    DIODE BRIDGE
                  </text>

                  {/* ---------- base wires ---------- */}

                  <path
                    d={BASE_WIRES}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.3"
                  />

                  {/* ---------- active glow paths ---------- */}

                  <motion.path
                    d={GLOW_POS}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#bridge-glow)"
                    animate={{ opacity: isPositive ? 0.85 : 0 }}
                    transition={{ duration: 0.2 }}
                  />

                  <motion.path
                    d={GLOW_NEG}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    filter="url(#bridge-glow)"
                    animate={{ opacity: isPositive ? 0 : 0.85 }}
                    transition={{ duration: 0.2 }}
                  />

                  {/* ---------- diodes ---------- */}

                  <Diode x={D1.x} y={D1.y} active={isPositive} color="#ef4444" />
                  <Diode x={D2.x} y={D2.y} active={!isPositive} color="#3b82f6" />
                  <Diode x={D3.x} y={D3.y} active={!isPositive} color="#3b82f6" />
                  <Diode x={D4.x} y={D4.y} active={isPositive} color="#ef4444" />

                  {/* ---------- diode labels ---------- */}

                  <text
                    x={D1.x - 28}
                    y={D1.y + 5}
                    textAnchor="end"
                    fill="currentColor"
                    fontSize="13"
                    fontWeight="800"
                  >
                    D1
                  </text>

                  <text
                    x={D2.x + 28}
                    y={D2.y + 5}
                    textAnchor="start"
                    fill="currentColor"
                    fontSize="13"
                    fontWeight="800"
                  >
                    D2
                  </text>

                  <text
                    x={D3.x - 28}
                    y={D3.y + 5}
                    textAnchor="end"
                    fill="currentColor"
                    fontSize="13"
                    fontWeight="800"
                  >
                    D3
                  </text>

                  <text
                    x={D4.x + 28}
                    y={D4.y + 5}
                    textAnchor="start"
                    fill="currentColor"
                    fontSize="13"
                    fontWeight="800"
                  >
                    D4
                  </text>

                  {/* ---------- AC source ---------- */}

                  <circle
                    cx={AC.x}
                    cy={AC.y}
                    r={AC.r}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />

                  <path
                    d={`M ${AC.x - 14} ${AC.y} c 4.5 -14 9.5 -14 14 0 c 4.5 14 9.5 14 14 0`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <text
                    x={AC.x}
                    y={AC.y - AC.r - 14}
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="11"
                    fontWeight="700"
                    opacity="0.6"
                  >
                    AC SOURCE
                  </text>

                  {/* ---------- junction dots ---------- */}

                  <circle
                    cx={BRIDGE.leftX}
                    cy={BRIDGE.midY}
                    r="4.5"
                    fill="currentColor"
                  />
                  <circle
                    cx={BRIDGE.rightX}
                    cy={BRIDGE.midY}
                    r="4.5"
                    fill="currentColor"
                  />
                  <circle
                    cx={BRIDGE.centerX}
                    cy={BRIDGE.topY}
                    r="5"
                    fill={activeColor}
                    style={{ transition: "fill 0.2s" }}
                  />
                  <circle
                    cx={BRIDGE.centerX}
                    cy={BRIDGE.bottomY}
                    r="5"
                    fill={activeColor}
                    style={{ transition: "fill 0.2s" }}
                  />

                  {/* ---------- + and - labels ---------- */}

                  <text
                    x={BRIDGE.centerX + 18}
                    y={BRIDGE.topY + 5}
                    fill="currentColor"
                    fontSize="15"
                    fontWeight="800"
                  >
                    +
                  </text>

                  <text
                    x={BRIDGE.centerX + 18}
                    y={BRIDGE.bottomY + 5}
                    fill="currentColor"
                    fontSize="15"
                    fontWeight="800"
                  >
                    −
                  </text>

                  {/* ---------- load resistor ---------- */}

                  <path
                    d={`M ${LOAD.x} ${LOAD.top} l -20 12 l 40 23 l -40 23 l 40 23 l -40 23 l 40 23 l -20 13`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <text
                    x={LOAD.x + 34}
                    y={LOAD.top + 70}
                    fill="currentColor"
                    fontSize="14"
                    fontWeight="800"
                  >
                    R
                  </text>

                  <text
                    x={LOAD.x + 44}
                    y={LOAD.top + 83}
                    fill="currentColor"
                    fontSize="10"
                    opacity="0.6"
                  >
                    LOAD
                  </text>

                  {/* ---------- current direction arrow ---------- */}

                  <motion.g
                    animate={{ y: [-3, 3, -3] }}
                    transition={{
                      duration: 1.4 / speed,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <line
                      x1={LOAD.x - 44}
                      y1={LOAD.top + 12}
                      x2={LOAD.x - 44}
                      y2={LOAD.bottom - 22}
                      stroke={activeColor}
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    <polygon
                      points={`${LOAD.x - 44},${LOAD.bottom - 12} ${
                        LOAD.x - 50
                      },${LOAD.bottom - 24} ${LOAD.x - 38},${
                        LOAD.bottom - 24
                      }`}
                      fill={activeColor}
                    />
                  </motion.g>

                  {/* ---------- current particles ---------- */}

                  {particles.map((p, i) => (
                    <circle
                      key={i}
                      cx={p.x}
                      cy={p.y}
                      r="5"
                      fill={activeColor}
                      filter="url(#bridge-glow)"
                    />
                  ))}

                  {/* ---------- info badge ---------- */}

                  <rect
                    x="290"
                    y="14"
                    width="220"
                    height="46"
                    rx="12"
                    fill={phaseInfo.color}
                    opacity="0.1"
                    style={{ transition: "fill 0.2s" }}
                  />

                  <text
                    x="400"
                    y="35"
                    textAnchor="middle"
                    fill={phaseInfo.color}
                    fontSize="12"
                    fontWeight="800"
                    style={{ transition: "fill 0.2s" }}
                  >
                    {phaseInfo.diodes} CONDUCTING
                  </text>

                  <text
                    x="400"
                    y="50"
                    textAnchor="middle"
                    fill="currentColor"
                    fontSize="9"
                    opacity="0.6"
                  >
                    current has a complete path
                  </text>
                </svg>
              </div>

              {/* ---------------- process explanation ---------------- */}

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={phaseInfo.diodes}
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
                      <CheckCircle2 className="h-4 w-4" />
                    </div>

                    <div>
                      <p
                        className="text-sm font-bold"
                        style={{ color: phaseInfo.color }}
                      >
                        {phaseInfo.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {phaseInfo.explanation} The load always receives current
                        in the same direction.
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
                  Both AC halves now appear above the zero line.
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
                        Current keeps the same direction
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
                    It used four diodes so the load receives current in one
                    direction on every half-cycle.
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
              Bridge picks two diodes
            </span>

            <ArrowRight className="h-4 w-4 text-muted-foreground" />

            <span className="rounded-lg bg-green-500/10 px-3 py-2 text-green-600">
              Load current stays one way
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
            text="The AC source pushes current one way, then the other way, on alternate half-cycles."
          />

          <InfoBox
            number="2"
            title={`${phaseInfo.diodes} conduct`}
            text={phaseInfo.explanation}
            active
          />

          <InfoBox
            number="3"
            title="The load sees one direction"
            text="Whichever pair conducts, current through the load always flows from + to −."
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
                Think of the bridge as four one-way doors
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Two doors open on each half-cycle — always letting current
                through the load the same way.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <ExplanationCard
              color="red"
              icon={<ArrowDown className="h-5 w-5" />}
              title="AC1 is positive"
              text="D1 and D4 open. Current flows AC1 → D1 → load → D4 → AC2."
            />

            <ExplanationCard
              color="blue"
              icon={<ArrowUp className="h-5 w-5" />}
              title="AC2 is positive"
              text="D2 and D3 open. Current flows AC2 → D2 → load → D3 → AC1 — still the same way through the load."
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
                D1 + D4
              </span>

              <span className="text-muted-foreground">/</span>

              <span className="rounded-lg bg-blue-500/10 px-3 py-2 text-blue-500">
                D2 + D3
              </span>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />

              <span className="rounded-lg bg-green-500/10 px-3 py-2 text-green-600">
                Same direction
              </span>

              <ArrowRight className="h-4 w-4 text-muted-foreground" />

              <span className="rounded-lg bg-green-500/10 px-3 py-2 text-green-600">
                Pulsating DC
              </span>
            </div>
          </div>
        </section>

        <footer className="py-7 text-center text-xs text-muted-foreground">
          One complete AC cycle produces two output pulses. The bridge never
          needs a centre tap.
        </footer>
      </div>
    </main>
  );
}

export default BridgeRectifier;

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
          wrapper: "border-blue-500/20 bg-blue-500/[0.04]",
          icon: "bg-blue-500/10 text-blue-500",
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