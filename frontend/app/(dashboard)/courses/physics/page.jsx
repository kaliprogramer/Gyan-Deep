import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Atom,
  Zap,
  CircuitBoard,
  Waves,
  Gauge,
  Radio,
  BookOpen,
  Sparkles,
} from "lucide-react";

const physicsTopics = [
  {
    title: "AC & DC",
    description:
      "Learn how alternating and direct current work, and understand their key differences.",
    icon: Radio,
    href: "/courses/physics/ac-dc",
    lessons: "6 lessons",
  },
  {
    title: "Diodes",
    description:
      "Understand diode behavior, current flow, and common electronic applications.",
    icon: Atom,
    href: "/courses/physics/diodes",
    lessons: "7 lessons",
  },
  {
    title: "Rectifier",
    description:
      "Discover how rectifier circuits convert alternating current into direct current.",
    icon: Zap,
    href: "/courses/physics/rectifier",
    lessons: "5 lessons",
  },
  {
    title: "Half Wave Rectifier",
    description:
      "Explore how a single diode converts one half of an AC waveform into DC.",
    icon: Waves,
    href: "/courses/physics/half-wave-rectifier",
    lessons: "4 lessons",
  },
  {
    title: "Full Wave Rectifier",
    description:
      "Learn how both halves of an AC signal can be converted into usable DC.",
    icon: CircuitBoard,
    href: "/courses/physics/full-wave-rectifier",
    lessons: "6 lessons",
  },
  {
    title: "Bridge Rectifier",
    description:
      "Understand bridge rectifier circuits, their operation, and practical applications.",
    icon: Gauge,
    href: "/courses/physics/bridge-rectifier",
    lessons: "8 lessons",
  },
];

export default function PhysicPage() {
  return (
    <main className="min-h-full bg-background">
      {" "}
      <div className="mx-auto w-full max-w-7xl px-3 py-6 sm:px-6 sm:py-8 lg:px-3">
        {/* Breadcrumb */}{" "}
        <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
          {" "}
          <Link
            href="/courses"
            className="transition-colors hover:text-foreground"
          >
            Courses{" "}
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">Physics</span>
        </nav>
        {/* Hero */}
        <section className="relative mb-10 overflow-hidden rounded-2xl border bg-card shadow-sm">
          <div className="grid min-h-[320px] lg:grid-cols-[1.1fr_0.9fr]">
            {/* Hero Content */}
            <div className="relative z-10 flex flex-col justify-center p-6 sm:p-8 lg:p-10">
              <div className="mb-5 flex w-fit items-center gap-2 rounded-full border bg-background/80 px-3 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                <Sparkles className="size-3.5 text-primary" />
                Interactive Learning
              </div>

              <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Atom className="size-6" />
              </div>

              <h1 className="max-w-xl text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                Learn Physics by{" "}
                <span className="text-primary">Understanding</span> It
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
                Explore physics through simple explanations, interactive
                diagrams, animations, and practical examples designed to make
                difficult concepts easier to understand.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="#topics"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
                >
                  <BookOpen className="size-4" />
                  Start Learning
                </Link>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {physicsTopics.length}
                  </span>
                  topics available
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative hidden min-h-[320px] overflow-hidden lg:block">
              <Image
                src="https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=1200&q=85"
                alt="Physics illustration"
                fill
                priority
                className="object-cover"
                sizes="(max-width: 1024px) 0px, 45vw"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-card via-card/20 to-transparent" />

              <div className="absolute bottom-6 right-6 rounded-xl border bg-background/80 px-4 py-3 shadow-lg backdrop-blur">
                <p className="text-xs text-muted-foreground">Learning path</p>

                <p className="mt-0.5 text-sm font-semibold">
                  Electronics & Circuits
                </p>
              </div>
            </div>
          </div>
        </section>
        {/* Topics Header */}
        <section id="topics">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">
                Physics Topics
              </h2>

              <p className="mt-1 text-sm text-muted-foreground">
                Choose a topic and learn through interactive lessons.
              </p>
            </div>

            <span className="text-sm text-muted-foreground">
              {physicsTopics.length} topics
            </span>
          </div>

          {/* Topic Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {physicsTopics.map((topic) => {
              const Icon = topic.icon;

              return (
                <Link
                  key={topic.title}
                  href={topic.href}
                  className="group relative overflow-hidden rounded-2xl border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md"
                >
                  {/* Top row */}
                  <div className="flex items-start justify-between">
                    <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-5" />
                    </div>

                    <div className="flex size-8 items-center justify-center rounded-full border bg-background text-muted-foreground transition-all group-hover:border-primary/30 group-hover:text-primary">
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {topic.title}
                    </h3>

                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-muted-foreground">
                      {topic.description}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="mt-5 flex items-center justify-between border-t pt-4">
                    <span className="text-xs font-medium text-muted-foreground">
                      {topic.lessons}
                    </span>

                    <span className="text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                      Start lesson →
                    </span>
                  </div>

                  {/* Decorative glow */}
                  <div className="pointer-events-none absolute -right-10 -top-10 size-24 rounded-full bg-primary/5 blur-2xl transition-all group-hover:bg-primary/10" />
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}
