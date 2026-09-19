"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Pause,
  Play,
  RotateCcw,
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
const PHASE_RATE = 0.00035;

/* ====================================================================== */
/*  MAIN COMPONENT                                                        */
/* ====================================================================== */

export default function Diode() {
  const prefersReduced = useReducedMotion();
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [phase, setPhase] = useState(0);
  const [mode, setMode] = useState("forward"); // "forward" | "reverse"

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

  const isForward = mode === "forward";
  const color = isForward ? "#22c55e" : "#ef4444";

  const info = isForward
    ? {
        title: "Forward Bias",
        subtitle: "Anode +  |  Cathode −",
        color: "#22c55e",
        explanation:
          "When the anode is connected to the positive terminal and the cathode to the negative terminal, the diode is forward-biased. Current flows easily — the diode acts like a closed switch.",
        status: "Conducting",
        statusIcon: "check",
      }
    : {
        title: "Reverse Bias",
        subtitle: "Anode −  |  Cathode +",
        color: "#ef4444",
        explanation:
          "When the anode is connected to the negative terminal and the cathode to the positive terminal, the diode is reverse-biased. Current is blocked — the diode acts like an open switch.",
        status: "Blocking",
        statusIcon: "cross",
      };

  /* ------------------------------------------------------------------ */
  /* Particle positions along the wire                                   */
  /* ------------------------------------------------------------------ */

  /* Wire runs from x=80 to x=620 at y=180 */
  const wireStart = 80;
  const wireEnd = 620;
  const wireY = 180;

  const particles = [0, 0.2, 0.4, 0.6, 0.8].map((offset) => {
    const t = (phase + offset) % 1;
    /* In reverse mode, particles stop at the diode barrier (x=350) */
    const limit = isForward ? wireEnd : 340;
    const x = wireStart + (limit - wireStart) * t;
    return { x, y: wireY };
  });

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
            Diode
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A <span className="font-semibold text-foreground">diode</span> is a
            two-terminal semiconductor device that allows current to flow in{" "}
            <span className="font-semibold text-green-600">one direction</span>{" "}
            and blocks it in the{" "}
            <span className="font-semibold text-red-500">opposite direction</span>.
            It acts like a one-way valve for electricity.
          </p>
        </header>

        {/* ============================================================ */}
        {/* MODE TOGGLE + CONTROLS                                        */}
        {/* ============================================================ */}

        <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
          <div
            className="flex items-center rounded-xl border bg-card p-0.5 shadow-sm"
            role="group"
            aria-label="Bias mode"
          >
            <button
              type="button"
              onClick={() => setMode("forward")}
              aria-pressed={isForward}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                isForward
                  ? "bg-green-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Forward Bias
            </button>

            <button
              type="button"
              onClick={() => setMode("reverse")}
              aria-pressed={!isForward}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                !isForward
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              Reverse Bias
            </button>
          </div>

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

        {/* ============================================================ */}
        {/* STATUS BAR                                                    */}
        {/* ============================================================ */}

        <div className="mb-5 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: info.color }}
              />

              <div>
                <p className="text-sm font-bold">{info.title}</p>
                <p className="text-xs text-muted-foreground">{info.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Status:</span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold"
                style={{
                  backgroundColor: `${info.color}15`,
                  color: info.color,
                }}
              >
                {info.statusIcon === "check" ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <XCircle className="h-3.5 w-3.5" />
                )}
                {info.status}
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* CIRCUIT ANIMATION                                             */}
        {/* ============================================================ */}

        <section className="rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
          <svg
            viewBox="0 0 700 340"
            className="h-auto w-full"
            role="img"
            aria-label="Diode forward and reverse bias animation"
          >
            <defs>
              <filter
                id="diode-glow"
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

            {/* ---------- battery / source ---------- */}

            <g>
              <line
                x1="80"
                y1="80"
                x2="80"
                y2="180"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.5"
              />
              <line
                x1="80"
                y1="180"
                x2="80"
                y2="280"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                opacity="0.5"
              />

              {/* battery symbol */}
              <g transform="translate(80, 180)">
                <line
                  x1="-18"
                  y1="-14"
                  x2="18"
                  y2="-14"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <line
                  x1="-10"
                  y1="-4"
                  x2="10"
                  y2="-4"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1="-18"
                  y1="6"
                  x2="18"
                  y2="6"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <line
                  x1="-10"
                  y1="16"
                  x2="10"
                  y2="16"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>

              <text
                x="80"
                y="70"
                textAnchor="middle"
                fill="currentColor"
                fontSize="12"
                fontWeight="700"
                opacity="0.6"
              >
                {isForward ? "+" : "−"}
              </text>
              <text
                x="80"
                y="305"
                textAnchor="middle"
                fill="currentColor"
                fontSize="12"
                fontWeight="700"
                opacity="0.6"
              >
                {isForward ? "−" : "+"}
              </text>
            </g>

            {/* ---------- top wire ---------- */}

            <line
              x1="80"
              y1="80"
              x2="620"
              y2="80"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.35"
            />

            {/* ---------- bottom wire (return) ---------- */}

            <line
              x1="80"
              y1="280"
              x2="620"
              y2="280"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.35"
            />

            {/* ---------- right wire connecting back ---------- */}

            <line
              x1="620"
              y1="80"
              x2="620"
              y2="280"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              opacity="0.35"
            />

            {/* ---------- active glow on the top wire (only forward) ---------- */}

            <motion.line
              x1="80"
              y1="80"
              x2={isForward ? 620 : 350}
              y2="80"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              filter="url(#diode-glow)"
              animate={{ opacity: 0.8 }}
              transition={{ duration: 0.3 }}
            />

            {/* ---------- diode symbol (centered around x=350, y=80) ---------- */}

            <g>
              {/* triangle pointing right (towards cathode) */}
              <polygon
                points="330,60 330,100 370,80"
                fill={isForward ? "#22c55e" : "currentColor"}
                opacity={isForward ? 1 : 0.3}
                style={{ transition: "fill 0.2s, opacity 0.2s" }}
              />

              {/* cathode bar */}
              <line
                x1="370"
                y1="60"
                x2="370"
                y2="100"
                stroke={isForward ? "#22c55e" : "currentColor"}
                strokeWidth="6"
                strokeLinecap="round"
                opacity={isForward ? 1 : 0.3}
                style={{ transition: "stroke 0.2s, opacity 0.2s" }}
              />

              {/* labels */}
              <text
                x="315"
                y="45"
                textAnchor="middle"
                fill="currentColor"
                fontSize="11"
                fontWeight="700"
                opacity="0.7"
              >
                ANODE
              </text>
              <text
                x="385"
                y="45"
                textAnchor="middle"
                fill="currentColor"
                fontSize="11"
                fontWeight="700"
                opacity="0.7"
              >
                CATHODE
              </text>

              {/* + / − signs based on bias */}
              <text
                x="310"
                y="118"
                textAnchor="middle"
                fill={isForward ? "#22c55e" : "#ef4444"}
                fontSize="16"
                fontWeight="800"
              >
                {isForward ? "+" : "−"}
              </text>
              <text
                x="390"
                y="118"
                textAnchor="middle"
                fill={isForward ? "#22c55e" : "#ef4444"}
                fontSize="16"
                fontWeight="800"
              >
                {isForward ? "−" : "+"}
              </text>
            </g>

            {/* ---------- "barrier" wall in reverse mode ---------- */}

            <motion.line
              x1="350"
              y1="50"
              x2="350"
              y2="110"
              stroke="#ef4444"
              strokeWidth="3"
              strokeDasharray="6 6"
              strokeLinecap="round"
              animate={{ opacity: isForward ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            />

            {/* ---------- particles ---------- */}

            {particles.map((p, i) => (
              <motion.circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="6"
                fill={color}
                opacity={isForward ? 1 : p.x < 335 ? 0.7 : 0}
                filter="url(#diode-glow)"
                animate={{ opacity: isForward ? 1 : p.x < 335 ? 0.7 : 0 }}
                transition={{ duration: 0.1 }}
              />
            ))}

            {/* ---------- current direction arrow ---------- */}

            <motion.g
              animate={{
                opacity: isForward ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
            >
              <line
                x1="450"
                y1="80"
                x2="510"
                y2="80"
                stroke="#22c55e"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <polygon points="520,80 505,72 505,88" fill="#22c55e" />
              <text
                x="485"
                y="65"
                textAnchor="middle"
                fill="#22c55e"
                fontSize="11"
                fontWeight="700"
              >
                CURRENT
              </text>
            </motion.g>

            {/* ---------- blocked marker in reverse ---------- */}

            <motion.g
              animate={{ opacity: isForward ? 0 : 1 }}
              transition={{ duration: 0.3 }}
            >
              <circle
                cx="350"
                cy="80"
                r="40"
                fill="none"
                stroke="#ef4444"
                strokeWidth="2.5"
                opacity="0.4"
              />
              <line
                x1="333"
                y1="63"
                x2="367"
                y2="97"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1="367"
                y1="63"
                x2="333"
                y2="97"
                stroke="#ef4444"
                strokeWidth="4"
                strokeLinecap="round"
              />
              <text
                x="350"
                y="145"
                textAnchor="middle"
                fill="#ef4444"
                fontSize="12"
                fontWeight="700"
              >
                NO CURRENT
              </text>
            </motion.g>
          </svg>

          {/* ---------- explanation ---------- */}

          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 rounded-xl border p-4"
            style={{
              borderColor: `${info.color}40`,
              backgroundColor: `${info.color}0d`,
            }}
          >
            <div className="flex gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{
                  backgroundColor: `${info.color}1a`,
                  color: info.color,
                }}
              >
                {info.statusIcon === "check" ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <XCircle className="h-5 w-5" />
                )}
              </div>

              <div>
                <p
                  className="text-sm font-bold"
                  style={{ color: info.color }}
                >
                  {info.title}
                </p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  {info.explanation}
                </p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ============================================================ */}
        {/* COMPARISON CARDS                                              */}
        {/* ============================================================ */}

        <section className="mt-6 grid gap-3 md:grid-cols-2">
          <div
            className={`rounded-2xl border p-5 transition-colors ${
              isForward
                ? "border-green-500/30 bg-green-500/[0.06]"
                : "border-green-500/15 bg-green-500/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
                <ArrowRight className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-green-700">Forward Bias</h3>
            </div>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              <span className="font-semibold text-foreground">Anode +</span>,{" "}
              <span className="font-semibold text-foreground">Cathode −</span>.
              The diode conducts — current flows freely, like a closed switch.
            </p>
          </div>

          <div
            className={`rounded-2xl border p-5 transition-colors ${
              !isForward
                ? "border-red-500/30 bg-red-500/[0.06]"
                : "border-red-500/15 bg-red-500/[0.02]"
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                <ArrowLeft className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-red-600">Reverse Bias</h3>
            </div>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              <span className="font-semibold text-foreground">Anode −</span>,{" "}
              <span className="font-semibold text-foreground">Cathode +</span>.
              The diode blocks — no current flows, like an open switch.
            </p>
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
            A diode is a{" "}
            <span className="font-semibold text-foreground">
              one-way valve
            </span>{" "}
            for current. It says{" "}
            <span className="font-semibold text-green-600">yes</span> to current
            in one direction and{" "}
            <span className="font-semibold text-red-500">no</span> in the other.
            That simple behavior is what makes rectifiers possible.
          </p>
        </section>

        <footer className="py-8 text-center text-xs text-muted-foreground">
          Click Forward Bias or Reverse Bias above to switch between modes.
        </footer>
      </div>
    </main>
  );
}
