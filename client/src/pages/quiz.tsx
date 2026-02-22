import { useCallback, useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useGenerateQuiz, useSubmitAnswer, type QuizMode } from "@/hooks/use-quiz";
import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Layout } from "@/components/layout";
import { QuizDirectionEnum, QuizModeEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";

export default function QuizPage() {
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const mode = (params.get("mode") as QuizMode) || QuizModeEnum.DAILY_REVIEW;
  const clusterId = params.get("clusterId") ? Number(params.get("clusterId")) : undefined;

  const { data: questions, isLoading, isError } = useGenerateQuiz(mode, clusterId);
  const submitAnswer = useSubmitAnswer();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());
  const [confidenceLevel, setConfidenceLevel] = useState<1 | 2 | 3>(2);

  const currentQuestion = questions?.[currentIndex];
  const progress = questions ? ((currentIndex) / questions.length) * 100 : 0;
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
      const responseTimeMs = Math.max(1, Date.now() - questionStartedAt);
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
      setSessionStats(prev => ({
        correct: prev.correct + (response.isCorrect ? 1 : 0),
        total: prev.total + 1
      }));
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  const handleNext = () => {
    setResult(null);
    setQuestionStartedAt(Date.now());
    if (questions && currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  useEffect(() => {
    setQuestionStartedAt(Date.now());
  }, [currentIndex]);

  useEffect(() => {
    resetSession();
  }, [mode, clusterId, resetSession]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-muted-foreground animate-pulse">Generating your lesson...</p>
        </div>
      </div>
    );
  }

  if (isError || !questions || questions.length === 0) {
    const completionMessage =
      mode === QuizModeEnum.NEW_WORDS
        ? "You finished the current new-word queue."
        : "Great job! You've completed all due items for this session.";
    return (
      <Layout>
        <div className="max-w-2xl mx-auto rounded-2xl border border-border/50 bg-card p-8 md:p-10 text-center">
          <h2 className="text-2xl font-bold text-foreground">Session Complete</h2>
          <p className="text-muted-foreground mt-2">{completionMessage}</p>
          <p className="text-sm text-muted-foreground mt-1 mb-6">
            Keep momentum by starting a revision mode instead of stopping here.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button onClick={() => startSession(`/quiz?mode=${QuizModeEnum.DAILY_REVIEW}`)}>
              Daily Revision
            </Button>
            <Button variant="outline" onClick={() => startSession(`/quiz?mode=${QuizModeEnum.WEAK_WORDS}`)}>
              Weak Words Drill
            </Button>
            <Button variant="outline" onClick={() => setLocation("/clusters")}>
              Practice by Cluster
            </Button>
            <Button variant="outline" onClick={() => setLocation("/analytics")}>
              View Analytics
            </Button>
          </div>
          <Button variant="ghost" className="mt-4" onClick={() => setLocation("/")}>
            Return Home
          </Button>
        </div>
      </Layout>
    );
  }

  if (!currentQuestion) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground">No active question</h2>
          <p className="text-muted-foreground mt-2 mb-6">Please restart the session.</p>
          <Button onClick={() => setLocation('/')}>Return Home</Button>
        </div>
      </Layout>
    );
  }

  if (isFinished) {
    const percentage = Math.round((sessionStats.correct / sessionStats.total) * 100);
    const incorrectCount = Math.max(0, sessionStats.total - sessionStats.correct);
    const recommendedMode =
      percentage < 70
        ? QuizModeEnum.WEAK_WORDS
        : mode === QuizModeEnum.DAILY_REVIEW
          ? QuizModeEnum.NEW_WORDS
          : QuizModeEnum.DAILY_REVIEW;
    const recommendedLabel =
      recommendedMode === QuizModeEnum.WEAK_WORDS
        ? "Practice Weak Words"
        : recommendedMode === QuizModeEnum.NEW_WORDS
          ? "Start Next New-Word Set"
          : "Start Next Daily Review";
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-card rounded-3xl p-8 border border-border/50 shadow-2xl text-center">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-3xl font-bold mb-2">Lesson Complete!</h2>
          <p className="text-muted-foreground mb-8">You're making steady progress.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-secondary/50 p-4 rounded-2xl">
              <div className="text-2xl font-bold text-primary">{percentage}%</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Accuracy</div>
            </div>
            <div className="bg-secondary/50 p-4 rounded-2xl">
              <div className="text-2xl font-bold text-accent">{sessionStats.correct}</div>
              <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Correct Words</div>
            </div>
          </div>

          <div className="space-y-3">
            {incorrectCount > 0 && (
              <Button
                variant="secondary"
                className="w-full h-12 text-lg rounded-xl"
                onClick={() => startSession(`/quiz?mode=${QuizModeEnum.WEAK_WORDS}`)}
              >
                Start Reinforcement Loop ({incorrectCount} missed)
              </Button>
            )}
            {clusterId && (
              <Button
                variant="outline"
                className="w-full h-12 text-lg rounded-xl"
                onClick={() => setLocation(`/quiz?mode=cluster&clusterId=${clusterId}`)}
              >
                Review Related Cluster Words
              </Button>
            )}
            <Button
              className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
              onClick={() => startSession(`/quiz?mode=${recommendedMode}`)}
            >
              {recommendedLabel}
            </Button>
            <Button variant="outline" className="w-full h-12 text-lg rounded-xl" onClick={() => setLocation('/')}>
              Back to Dashboard
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Next recommendation: {recommendedMode === QuizModeEnum.WEAK_WORDS ? "focus on weak words" : recommendedMode === QuizModeEnum.NEW_WORDS ? "continue with new words" : "continue daily review"}.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Quiz Header */}
      <div className="px-4 py-6 max-w-4xl mx-auto w-full flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon" 
          className="rounded-full hover:bg-secondary"
          onClick={() => setLocation('/')}
        >
          <X className="w-6 h-6 text-muted-foreground" />
        </Button>
        <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Quiz Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <QuizCard
          question={currentQuestion.questionText}
          pronunciation={currentQuestion.pronunciation}
          imageUrl={currentQuestion.imageUrl}
          type={currentQuestion.type}
          options={currentQuestion.options}
          confidenceLevel={confidenceLevel}
          onConfidenceChange={setConfidenceLevel}
          onAnswer={handleAnswer}
          isSubmitting={submitAnswer.isPending}
          result={result}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
