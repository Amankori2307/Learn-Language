import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useStats } from "@/hooks/use-quiz";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { BookOpen, Dumbbell, Layers3, PlayCircle, Target, Zap } from "lucide-react";
import { QuizDirectionEnum, QuizModeEnum } from "@shared/domain/enums";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </Layout>
    );
  }

  const defaultStats = {
    totalWords: 0,
    mastered: 0,
    learning: 0,
    weak: 0,
    streak: 0,
    xp: 0,
    recognitionAccuracy: 0,
    recallAccuracy: 0,
    sourceToTargetStrength: 0.5,
    targetToSourceStrength: 0.5,
    recommendedDirection: QuizDirectionEnum.SOURCE_TO_TARGET as const,
  };

  const s = stats ?? defaultStats;
  const primaryMode = s.weak > 0 ? QuizModeEnum.WEAK_WORDS : QuizModeEnum.DAILY_REVIEW;
  const primaryLabel = primaryMode === QuizModeEnum.WEAK_WORDS ? "Resume Weak Words" : "Start Daily Review";

  const coreActions = [
    {
      title: "Daily Review",
      description: "Review words due for repetition.",
      icon: Zap,
      href: `/quiz?mode=${QuizModeEnum.DAILY_REVIEW}`,
      count: s.learning,
    },
    {
      title: "New Words",
      description: "Learn a new set of words.",
      icon: BookOpen,
      href: `/quiz?mode=${QuizModeEnum.NEW_WORDS}`,
      count: 10,
    },
    {
      title: "Weak Words",
      description: "Reinforce words you miss often.",
      icon: Dumbbell,
      href: `/quiz?mode=${QuizModeEnum.WEAK_WORDS}`,
      count: s.weak,
    },
    {
      title: "Practice by Cluster",
      description: "Choose topic clusters and practice.",
      icon: Layers3,
      href: "/clusters",
      count: s.totalWords,
    },
  ];

  const bucketCards = [
    {
      key: "mastered",
      label: "Words Mastered",
      value: s.mastered,
      meaning: "Mastered means you answered this word correctly enough times to reach mastery level 4+.",
      improve: "To master more words: finish daily review consistently and maintain correct answers in both directions.",
    },
    {
      key: "learning",
      label: "Learning",
      value: s.learning,
      meaning: "Learning means the word is in active progress (mastery level 1-3).",
      improve: "To move words out of learning: keep practicing daily and answer with higher confidence.",
    },
    {
      key: "needs_review",
      label: "Needs Review",
      value: s.weak,
      meaning: "Needs Review means the word is overdue or has repeated mistakes.",
      improve: "To reduce this list: run weak words + daily review and clear missed words with repeated correct recall.",
    },
  ] as const;

  return (
    <Layout>
      <div className="space-y-6">
        <section className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Primary Action</p>
              <h1 className="text-3xl font-semibold mt-1">Start Learning</h1>
              <p className="text-muted-foreground mt-2">
                Welcome back, {user?.firstName || "Learner"}. Continue with the next recommended session.
              </p>
              <p className="text-sm text-muted-foreground mt-1">{s.streak} day streak • {s.mastered} mastered words</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/quiz?mode=${primaryMode}`}>
                <Button size="lg" className="min-w-[220px] gap-2">
                  <PlayCircle className="w-5 h-5" />
                  {primaryLabel}
                </Button>
              </Link>
              <Link href="/analytics">
                <Button size="lg" variant="outline" className="min-w-[220px]">
                  Open Analytics
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total XP" value={s.xp} icon={Zap} color="accent" />
          {bucketCards.map((card) => (
            <div key={card.key} className="rounded-xl border border-border/60 bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
                  <h3 className="text-2xl font-semibold mt-1 tracking-tight">{card.value}</h3>
                </div>
                <div className="p-2.5 rounded-lg border bg-secondary text-foreground border-border">
                  {card.key === "mastered" ? <Target className="w-4 h-4" /> : null}
                  {card.key === "learning" ? <BookOpen className="w-4 h-4" /> : null}
                  {card.key === "needs_review" ? <Dumbbell className="w-4 h-4" /> : null}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3">{card.meaning}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.improve}</p>
              <Link href={`/analytics/words?bucket=${card.key}`}>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  View Words
                </Button>
              </Link>
            </div>
          ))}
        </div>

        <section className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Core Modes</h2>
            <p className="text-sm text-muted-foreground mt-1">Only essential and stable learning flows are shown here.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {coreActions.map((action) => (
              <div key={action.title} className="rounded-xl border border-border/60 bg-card p-4 flex flex-col justify-between min-h-[200px]">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-secondary text-foreground flex items-center justify-center mb-3">
                    <action.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{action.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                    {action.count} items
                  </span>
                  <Link href={action.href}>
                    <Button variant="outline" size="sm">
                      Open
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
