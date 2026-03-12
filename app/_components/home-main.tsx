"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Volume2,
  CheckCircle2,
  Repeat,
  PlayCircle,
  Sparkles,
  Headphones,
  GraduationCap,
  Briefcase,
  Heart,
} from "lucide-react";
import { useState } from "react";

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

export function HomeMainContent() {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="text-foreground">
      {/* SECTION 1: Hero */}
      <section className="relative overflow-hidden border-b border-border bg-background">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,hsl(var(--primary)/0.12),transparent_55%)]" />
        <div className="relative mx-auto grid w-full max-w-6xl gap-10 px-6 py-16 sm:px-8 md:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="space-y-6"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Speak with Certainty. Remember with Ease.
            </p>
            <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
              The Language-Learning Workflow Built for Active Recall.
            </h1>
            <p className="text-base text-muted-foreground sm:text-lg">
              Stop guessing and start remembering. A distraction-free, native-verified path to fluency.
              Currently 100% Free.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-transform hover:scale-[1.02]"
              >
                Start Learning (Free)
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted/40"
              >
                Watch how it works
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="relative"
          >
            <div className="absolute -inset-6 rounded-3xl bg-primary/10 blur-2xl" />
            <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-muted/50 px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Current Streak: 5 Days
                </span>
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-5 text-center">
                <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
                <h3 className="mt-2 text-2xl font-semibold text-foreground">
                  Start Next Session: Telugu Basics
                </h3>
                <button
                  type="button"
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
                >
                  <PlayCircle className="h-4 w-4" />
                  Begin Session
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SECTION 2: Trust Bar */}
      <section className="border-b border-border bg-muted/40">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-center gap-3 px-6 py-4 text-sm text-muted-foreground sm:px-8">
          <span className="font-semibold text-foreground">Verified by native speakers in:</span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">
            Telugu (Flagship)
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">
            Hindi (Coming Soon)
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground">
            Tamil (Coming Soon)
          </span>
        </div>
      </section>

      {/* SECTION 3: How it Works */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="text-center"
        >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              The 4-Step Loop
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">
              Active recall, from prompt to mastery.
            </h2>
          </motion.div>
        <div className="relative mt-12 grid gap-6 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px border-t border-dashed border-border lg:block" />
          {[
            {
              title: "Prompt",
              body: "See or hear a word in its natural context.",
              icon: Brain,
            },
            {
              title: "Recall",
              body: "Produce the answer from memory—not just recognition.",
              icon: Headphones,
            },
            {
              title: "Confirm",
              body: "Instantly verify with native audio and transliteration.",
              icon: CheckCircle2,
            },
            {
              title: "Repeat",
              body: "Move words into “Mastered” buckets via Spaced Repetition.",
              icon: Repeat,
            },
          ].map((step, index) => (
            <motion.div
              key={step.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={fadeUp}
              transition={{ delay: index * 0.1 }}
              className="relative rounded-2xl border border-border bg-card p-5 text-left shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <step.icon className="h-5 w-5" />
                </span>
                <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{step.body}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 4: Interactive Demo */}
      <section className="border-y border-border bg-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={fadeUp}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Interactive Demo
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">
              Feel the active practice loop.
            </h2>
            <p className="mt-3 text-muted-foreground">
              Try a sample recall card right here. No signup needed.
            </p>
          </motion.div>

          <div className="mt-10 flex justify-center">
            <motion.div
              layout
              className="w-full max-w-xl rounded-3xl border border-border bg-card p-6 shadow-xl"
            >
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
                Recall Card
              </p>
              <div className="mt-4 rounded-2xl border border-border bg-muted/40 p-6 text-center">
                <p className="text-lg font-semibold text-foreground">
                  How do you say “Hello” in Telugu?
                </p>
                {revealed ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-5 space-y-3"
                  >
                    <p className="text-2xl font-bold text-primary">నమస్కారం</p>
                    <p className="text-sm text-muted-foreground">Namaskaram</p>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground"
                    >
                      <Volume2 className="h-4 w-4" />
                      Play Audio
                    </button>
                  </motion.div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setRevealed(true)}
                    className="mt-5 inline-flex items-center justify-center rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Reveal Answer
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION 5: Feature Deep-Dive */}
      <section className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <img
            src="/home-word-bucket.png"
            alt="Word bucket chart preview"
            className="w-full rounded-3xl border border-border object-cover"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Decision-Free Practice
            </p>
            <h3 className="mt-3 text-2xl font-bold text-foreground">
              Zero Decision Fatigue.
            </h3>
            <p className="mt-3 text-muted-foreground">
              No more scrolling through menus. Your dashboard knows exactly what you need to
              practice next.
            </p>
          </div>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Audio-Visual Sync
            </p>
            <h3 className="mt-3 text-2xl font-bold text-foreground">
              Audio-Visual Sync.
            </h3>
            <p className="mt-3 text-muted-foreground">
              Every word includes transliteration and high-quality audio so you connect spelling
              with real conversation.
            </p>
          </div>
          <img
            src="/home-audio-player.png"
            alt="Mobile audio player preview"
            className="w-full rounded-3xl border border-border object-cover"
          />
        </div>
      </section>

      {/* SECTION 6: Audience */}
      <section className="border-y border-border bg-muted/40">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 sm:px-8">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Why Learn-Lang?
            </p>
            <h2 className="mt-3 text-3xl font-bold text-foreground">
              Built for every serious learner.
            </h2>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Academic",
                body: "Bridge the gap between textbook theory and real-world recall.",
                icon: GraduationCap,
              },
              {
                title: "Professional",
                body: "Speak with confidence in meetings with native-verified pronunciations.",
                icon: Briefcase,
              },
              {
                title: "Personal",
                body: "Short, repeatable sessions that turn a hobby into a habit.",
                icon: Heart,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-border bg-card p-6 text-left shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: Final CTA */}
      <section className="bg-primary">
        <div className="mx-auto w-full max-w-6xl px-6 py-20 text-center text-primary-foreground sm:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to move beyond recognition?</h2>
          <p className="mt-4 text-base text-primary-foreground/80">
            Get Started for Free — Join the Telugu Beta.
          </p>
          <Link
            href="/auth"
            className="mt-8 inline-flex items-center justify-center rounded-xl bg-background px-6 py-3 text-sm font-semibold text-foreground"
          >
            Get Started for Free — Join the Telugu Beta
          </Link>
        </div>
      </section>
    </div>
  );
}
