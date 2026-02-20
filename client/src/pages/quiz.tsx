import { useEffect, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { useGenerateQuiz, useSubmitAnswer, type QuizMode } from "@/hooks/use-quiz";
import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Layout } from "@/components/layout";

export default function QuizPage() {
  const [location, setLocation] = useLocation();
  const searchStr = useSearch();
  const params = new URLSearchParams(searchStr);
  const mode = (params.get("mode") as QuizMode) || "daily_review";
  const clusterId = params.get("clusterId") ? Number(params.get("clusterId")) : undefined;

  const { data: questions, isLoading, isError } = useGenerateQuiz(mode, clusterId);
  const submitAnswer = useSubmitAnswer();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [result, setResult] = useState<any>(null);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [isFinished, setIsFinished] = useState(false);
  const [questionStartedAt, setQuestionStartedAt] = useState<number>(Date.now());

  const currentQuestion = questions?.[currentIndex];
  const progress = questions ? ((currentIndex) / questions.length) * 100 : 0;

  const handleAnswer = async (optionId: number) => {
    if (!currentQuestion) return;

    try {
      const responseTimeMs = Math.max(1, Date.now() - questionStartedAt);
      const direction = currentQuestion.type === "english_to_telugu" ? "english_to_telugu" : "telugu_to_english";
      const response = await submitAnswer.mutateAsync({
        wordId: currentQuestion.wordId,
        selectedOptionId: optionId,
        questionType: currentQuestion.type,
        direction,
        confidenceLevel: 2, // Default for now
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
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold text-foreground">No questions available</h2>
          <p className="text-muted-foreground mt-2 mb-6">Great job! You've completed all your reviews for now.</p>
          <Button onClick={() => setLocation('/')}>Return Home</Button>
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

          <Button className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20" onClick={() => setLocation('/')}>
            Back to Dashboard
          </Button>
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
          type={currentQuestion.type}
          options={currentQuestion.options}
          onAnswer={handleAnswer}
          isSubmitting={submitAnswer.isPending}
          result={result}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
