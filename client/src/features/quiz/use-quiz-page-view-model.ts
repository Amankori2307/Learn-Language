import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { QuizDirectionEnum, QuizModeEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import { useLearningLanguage } from "@/hooks/use-language";
import { useQuizConfidencePreference } from "@/hooks/use-quiz-confidence-preference";
import { useGenerateQuiz, useSubmitAnswer, type QuizModeValue } from "@/hooks/use-quiz";
import {
  QUIZ_DEFAULT_CONFIDENCE_LEVEL,
  QUIZ_NEXT_RECOMMENDATION_MODE,
  QUIZ_RESPONSE_TIME_MIN_MS,
  QUIZ_WEAK_WORDS_THRESHOLD_PERCENT,
} from "@/features/quiz/quiz.constants";
import { trackAnalyticsEvent } from "@/lib/analytics";

function parseMode(raw: string | null): QuizModeValue {
  const mode = raw as QuizModeValue | null;
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
  const quizConfidencePreference = useQuizConfidencePreference();
  const { data: questions, isLoading, isError, refetch } = useGenerateQuiz(mode, clusterId);
  const submitAnswer = useSubmitAnswer();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());
  const [confidenceLevel, setConfidenceLevel] = useState<1 | 2 | 3>(QUIZ_DEFAULT_CONFIDENCE_LEVEL);
  const trackedSessionKeyRef = useRef<string | null>(null);
  const trackedCompletionKeyRef = useRef<string | null>(null);

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
      const direction =
        currentQuestion.type === QuizQuestionTypeEnum.TARGET_TO_SOURCE
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
      trackAnalyticsEvent("quiz_answer_submitted", {
        route: "/quiz",
        language,
        mode,
        clusterId: clusterId ?? null,
        wordId: currentQuestion.wordId,
        questionType: currentQuestion.type,
        direction,
        responseTimeMs,
        isCorrect: response.isCorrect,
      });
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
    trackedSessionKeyRef.current = null;
    trackedCompletionKeyRef.current = null;
  }, [mode, clusterId, resetSession]);

  useEffect(() => {
    if (!questions || questions.length === 0 || isLoading) {
      return;
    }

    const sessionKey = `${mode}:${clusterId ?? "none"}:${language}:${questions.length}`;
    if (trackedSessionKeyRef.current === sessionKey) {
      return;
    }

    trackedSessionKeyRef.current = sessionKey;
    trackAnalyticsEvent("quiz_session_started", {
      route: "/quiz",
      language,
      mode,
      clusterId: clusterId ?? null,
      total: questions.length,
    });
  }, [clusterId, isLoading, language, mode, questions]);

  useEffect(() => {
    if (!isFinished) {
      return;
    }

    const completionKey = `${mode}:${clusterId ?? "none"}:${language}:${sessionStats.total}:${sessionStats.correct}`;
    if (trackedCompletionKeyRef.current === completionKey) {
      return;
    }

    trackedCompletionKeyRef.current = completionKey;
    trackAnalyticsEvent("quiz_session_completed", {
      route: "/quiz",
      language,
      mode,
      clusterId: clusterId ?? null,
      total: sessionStats.total,
      correct: sessionStats.correct,
      incorrect: Math.max(0, sessionStats.total - sessionStats.correct),
      accuracyPercent:
        sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0,
    });
  }, [clusterId, isFinished, language, mode, sessionStats]);

  const completionMessage =
    mode === QuizModeEnum.NEW_WORDS
      ? "You finished the current new-word queue."
      : "Great job! You've completed all due items for this session.";

  const percentage =
    sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
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
    showConfidenceControl: quizConfidencePreference.enabled,
    submitPending: submitAnswer.isPending,
    startSession,
    setLocation,
    retry: () => {
      void refetch();
    },
    handleAnswer,
    handleNext,
    completionMessage,
    percentage,
    incorrectCount,
    recommendedMode,
    recommendedLabel,
  };
}
