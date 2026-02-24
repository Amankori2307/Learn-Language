import { BookOpen, Dumbbell, Layers3, Target, Zap } from "lucide-react";
import { QuizDirectionEnum, QuizModeEnum } from "@shared/domain/enums";
import { useAuth } from "@/hooks/use-auth";
import { useStats } from "@/hooks/use-quiz";
import { DASHBOARD_NEW_WORDS_CARD_COUNT } from "@/features/dashboard/dashboard.constants";

const DEFAULT_STATS = {
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

export function useDashboardViewModel() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useStats();
  const resolvedStats = stats ?? DEFAULT_STATS;

  const primaryMode = resolvedStats.weak > 0 ? QuizModeEnum.WEAK_WORDS : QuizModeEnum.DAILY_REVIEW;
  const primaryLabel = primaryMode === QuizModeEnum.WEAK_WORDS ? "Resume Weak Words" : "Start Daily Review";

  const coreActions = [
    {
      title: "Daily Review",
      description: "Review words due for repetition.",
      icon: Zap,
      href: `/quiz?mode=${QuizModeEnum.DAILY_REVIEW}`,
      count: resolvedStats.learning,
    },
    {
      title: "New Words",
      description: "Learn a new set of words.",
      icon: BookOpen,
      href: `/quiz?mode=${QuizModeEnum.NEW_WORDS}`,
      count: DASHBOARD_NEW_WORDS_CARD_COUNT,
    },
    {
      title: "Weak Words",
      description: "Reinforce words you miss often.",
      icon: Dumbbell,
      href: `/quiz?mode=${QuizModeEnum.WEAK_WORDS}`,
      count: resolvedStats.weak,
    },
    {
      title: "Practice by Cluster",
      description: "Choose topic clusters and practice.",
      icon: Layers3,
      href: "/clusters",
      count: resolvedStats.totalWords,
    },
  ];

  const bucketCards = [
    {
      key: "mastered",
      label: "Words Mastered",
      value: resolvedStats.mastered,
      meaning: "Mastered means you answered this word correctly enough times to reach mastery level 4+.",
      improve: "To master more words: finish daily review consistently and maintain correct answers in both directions.",
      icon: Target,
    },
    {
      key: "learning",
      label: "Learning",
      value: resolvedStats.learning,
      meaning: "Learning means the word is in active progress (mastery level 1-3).",
      improve: "To move words out of learning: keep practicing daily and answer with higher confidence.",
      icon: BookOpen,
    },
    {
      key: "needs_review",
      label: "Needs Review",
      value: resolvedStats.weak,
      meaning: "Needs Review means the word is overdue or has repeated mistakes.",
      improve: "To reduce this list: run weak words + daily review and clear missed words with repeated correct recall.",
      icon: Dumbbell,
    },
  ] as const;

  return {
    isLoading,
    userName: user?.firstName || "Learner",
    stats: resolvedStats,
    primaryMode,
    primaryLabel,
    coreActions,
    bucketCards,
  };
}
