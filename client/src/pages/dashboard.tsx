import { Layout } from "@/components/layout";
import { useAuth } from "@/hooks/use-auth";
import { useStats } from "@/hooks/use-quiz";
import { StatCard } from "@/components/stat-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  BrainCircuit, 
  Flame, 
  Target, 
  Zap, 
  ArrowRight, 
  BookOpen, 
  Dumbbell,
  Layers3,
  PlayCircle,
  MessageSquareQuote
} from "lucide-react";
import { motion } from "framer-motion";
import { QuizDirectionEnum, QuizModeEnum } from "@shared/domain/enums";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useStats();

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
    recommendedDirection: QuizDirectionEnum.SOURCE_TO_TARGET as const,
  };

  const s = stats || defaultStats;

  const continueMode = s.weak > 0 ? QuizModeEnum.WEAK_WORDS : QuizModeEnum.DAILY_REVIEW;
  const primaryLearningHref = `/quiz?mode=${continueMode}`;
  const primaryLearningLabel = continueMode === QuizModeEnum.WEAK_WORDS ? "Resume Weak Spots" : "Start Daily Review";
  const tutorEnabled = import.meta.env.VITE_ENABLE_TUTOR === "true";

  const cards = [
    {
      title: "Continue Learning",
      description: "Jump back into your best next session",
      icon: PlayCircle,
      href: `/quiz?mode=${continueMode}`,
      count: Math.max(1, s.weak),
    },
    {
      title: "Daily Review",
      description: "Review words due for repetition",
      icon: Zap,
      href: `/quiz?mode=${QuizModeEnum.DAILY_REVIEW}`,
      count: s.learning
    },
    {
      title: "New Words",
      description: "Learn 10 new words today",
      icon: BookOpen,
      href: `/quiz?mode=${QuizModeEnum.NEW_WORDS}`,
      count: 10
    },
    {
      title: "Weak Spots",
      description: "Practice words you struggle with",
      icon: Dumbbell,
      href: `/quiz?mode=${QuizModeEnum.WEAK_WORDS}`,
      count: s.weak
    },
    {
      title: "Practice by Cluster",
      description: "Choose a topic cluster and practice in context",
      icon: Layers3,
      href: "/clusters",
      count: s.totalWords,
    },
    {
      title: "Complex Workout",
      description: "Harder sentence-based drills to deepen retention",
      icon: BrainCircuit,
      href: `/quiz?mode=${QuizModeEnum.COMPLEX_WORKOUT}`,
      count: Math.max(5, Math.round(s.learning / 2)),
    },
    {
      title: "Contextual Mode",
      description: "Study short story/dialogue snippets before practice",
      icon: MessageSquareQuote,
      href: "/contextual",
      count: 6,
    },
    ...(tutorEnabled
      ? [{
          title: "Tutor Mode",
          description: "Text tutor for guided vocabulary feedback",
          icon: BrainCircuit,
          href: "/tutor",
          count: s.learning,
        }]
      : []),
  ];

  return (
    <Layout>
      <div className="space-y-7">
        {/* Learning First Hero */}
        <section className="rounded-2xl border border-border/60 bg-card p-5 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Primary Action</p>
              <h1 className="text-3xl md:text-4xl font-semibold mt-1">Start Learning</h1>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                Jump directly into your next best session. This is the core flow for daily progress.
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Focus next on:{" "}
                <span className="font-semibold text-foreground">
                  {s.recommendedDirection === QuizDirectionEnum.SOURCE_TO_TARGET ? "Source Language -> English recall" : "English -> Source Language recognition"}
                </span>
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 shrink-0">
              <Link href={primaryLearningHref}>
                <Button size="lg" className="min-w-[220px] gap-2">
                  <PlayCircle className="w-5 h-5" />
                  {primaryLearningLabel}
                </Button>
              </Link>
              <Link href={`/quiz?mode=${QuizModeEnum.NEW_WORDS}`}>
                <Button size="lg" variant="outline" className="min-w-[220px] gap-2">
                  <BookOpen className="w-5 h-5" />
                  Learn New Words
                </Button>
              </Link>
            </div>
          </div>
          <div className="mt-4 inline-flex items-center gap-2 bg-secondary px-3 py-2 rounded-lg border border-border text-sm">
            <Flame className="w-4 h-4 text-foreground" />
            <span className="font-medium">{s.streak} day streak</span>
          </div>
        </section>

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Welcome back, {user?.firstName || 'Learner'}</h2>
            <p className="text-muted-foreground mt-1">Your daily language learning dashboard.</p>
          </div>
          <div className="flex items-center gap-2 bg-card px-3 py-2 rounded-lg border border-border/60">
            <Target className="w-4 h-4 text-foreground" />
            <span className="font-medium text-sm">{s.mastered} mastered</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            label="Total XP" 
            value={s.xp} 
            icon={Zap} 
            color="accent" 
          />
          <StatCard 
            label="Words Mastered" 
            value={s.mastered} 
            icon={Target} 
            color="primary" 
          />
          <StatCard 
            label="Learning" 
            value={s.learning} 
            icon={BrainCircuit} 
            color="blue" 
          />
          <StatCard 
            label="Needs Review" 
            value={s.weak} 
            icon={Dumbbell} 
            color="orange" 
          />
          <StatCard
            label="Recall %"
            value={`${s.recallAccuracy}%`}
            icon={BookOpen}
            color="blue"
          />
          <StatCard
            label="Recognition %"
            value={`${s.recognitionAccuracy}%`}
            icon={Layers3}
            color="primary"
          />
        </div>

        {/* Action Cards */}
        <section className="rounded-2xl border border-border/60 bg-card/70 p-4 md:p-5">
          <div className="mb-4">
            <h3 className="text-xl font-semibold">Quick Modes</h3>
            <p className="text-sm text-muted-foreground mt-1">Alternative session types based on your goal.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-stretch">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="group bg-card rounded-xl p-4 border border-border/70 hover:border-border transition-colors duration-200 flex flex-col justify-between min-h-[220px] h-full"
            >
              <div className="space-y-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2 bg-secondary text-foreground">
                  <card.icon className="w-5 h-5" />
                </div>
                <h4 className="text-lg font-semibold">{card.title}</h4>
                <p className="text-muted-foreground text-sm leading-relaxed line-clamp-4">{card.description}</p>
              </div>
              
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/40">
                <span className="text-xs font-medium text-muted-foreground bg-secondary px-2 py-1 rounded-md">
                  {card.count} items
                </span>
                <Link href={card.href}>
                  <Button variant="outline" className="rounded-full w-9 h-9 p-0 border-border hover:bg-foreground hover:text-background transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
