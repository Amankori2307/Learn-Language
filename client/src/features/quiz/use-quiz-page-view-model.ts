import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { QuizDirectionEnum, QuizModeEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import { useLearningLanguage } from "@/hooks/use-language";
import { useGenerateQuiz, useSubmitAnswer, type QuizMode } from "@/hooks/use-quiz";
import {
  QUIZ_DEFAULT_CONFIDENCE_LEVEL,
  QUIZ_NEXT_RECOMMENDATION_MODE,
  QUIZ_RESPONSE_TIME_MIN_MS,
  QUIZ_WEAK_WORDS_THRESHOLD_PERCENT,
} from "@/features/quiz/quiz.constants";

function parseMode(raw: string | null): QuizMode {
  const mode = raw as QuizMode | null;
  return mode ?? QuizModeEnum.DAILY_REVIEW;
}

function parseClusterId(raw: string | null): number | undefined {
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function useQuizPageViewModel() {
  const [, setLocation] = useLocation();
  const searchText = useSearch();
  const params = useMemo(() => new URLSearchParams(searchText), [searchText]);
  const mode = parseMode(params.get("mode"));
  const clusterId = parseClusterId(params.get("clusterId"));

  const { language } = useLearningLanguage();
  const { data: questions, isLoading, isError } = useGenerateQuiz(mode, clusterId);
  const submitAnswer = useSubmitAnswer();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());
  const [confidenceLevel, setConfidenceLevel] = useState<1 | 2 | 3>(QUIZ_DEFAULT_CONFIDENCE_LEVEL);

  const currentQuestion = questions?.[currentIndex];
  const progress = questions ? (currentIndex / questions.length) * 100 : 0;

  const resetSession = useCallback(() => {
    setCurrentIndex(0);
    setResult(null);
    setSessionStats({ correct: 0, total: 0 });
    setIsFinished(false);
    setQuestionStartedAt(Date.now());
  }, []);

  const startSession = (target: string) => {
    resetSession();
    setLocation(target);
  };

  const handleAnswer = async (optionId: number, answerConfidence: 1 | 2 | 3) => {
    if (!currentQuestion) return;

    try {
      const responseTimeMs = Math.max(QUIZ_RESPONSE_TIME_MIN_MS, Date.now() - questionStartedAt);
      const direction = currentQuestion.type === QuizQuestionTypeEnum.TARGET_TO_SOURCE
        ? QuizDirectionEnum.TARGET_TO_SOURCE
        : QuizDirectionEnum.SOURCE_TO_TARGET;
      const response = await submitAnswer.mutateAsync({
        wordId: currentQuestion.wordId,
        selectedOptionId: optionId,
        questionType: currentQuestion.type,
        direction,
        confidenceLevel: answerConfidence,
        responseTimeMs,
      });

      setResult(response);
      setSessionStats((prev) => ({
        correct: prev.correct + (response.isCorrect ? 1 : 0),
        total: prev.total + 1,
      }));
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleNext = () => {
    setResult(null);
    setQuestionStartedAt(Date.now());
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    setIsFinished(true);
  };

  useEffect(() => {
    setQuestionStartedAt(Date.now());
  }, [currentIndex]);

  useEffect(() => {
    resetSession();
  }, [mode, clusterId, resetSession]);

  const completionMessage =
    mode === QuizModeEnum.NEW_WORDS
      ? "You finished the current new-word queue."
      : "Great job! You've completed all due items for this session.";

  const percentage = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
  const incorrectCount = Math.max(0, sessionStats.total - sessionStats.correct);
  const recommendedMode =
    percentage < QUIZ_WEAK_WORDS_THRESHOLD_PERCENT
      ? QUIZ_NEXT_RECOMMENDATION_MODE.LOW_ACCURACY
      : mode === QuizModeEnum.DAILY_REVIEW
        ? QUIZ_NEXT_RECOMMENDATION_MODE.DAILY_REVIEW_COMPLETE
        : QUIZ_NEXT_RECOMMENDATION_MODE.DEFAULT;
  const recommendedLabel =
    recommendedMode === QuizModeEnum.WEAK_WORDS
      ? "Practice Weak Words"
      : recommendedMode === QuizModeEnum.NEW_WORDS
        ? "Start Next New-Word Set"
        : "Start Next Daily Review";

  return {
    mode,
    clusterId,
    language,
    isLoading,
    isError,
    questions,
    currentQuestion,
    currentIndex,
    progress,
    result,
    sessionStats,
    isFinished,
    confidenceLevel,
    setConfidenceLevel,
    submitPending: submitAnswer.isPending,
    startSession,
    setLocation,
    handleAnswer,
    handleNext,
    completionMessage,
    percentage,
    incorrectCount,
    recommendedMode,
    recommendedLabel,
  };
}
