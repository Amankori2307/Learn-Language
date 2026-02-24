import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Layout } from "@/components/layout";
import { QuizModeEnum } from "@shared/domain/enums";
import { useQuizPageViewModel } from "@/features/quiz/use-quiz-page-view-model";

export default function QuizPage() {
  const {
    clusterId,
    language,
    isLoading,
    isError,
    questions,
    currentQuestion,
    progress,
    result,
    sessionStats,
    isFinished,
    confidenceLevel,
    setConfidenceLevel,
    submitPending,
    startSession,
    setLocation,
    handleAnswer,
    handleNext,
    completionMessage,
    percentage,
    incorrectCount,
    recommendedMode,
    recommendedLabel,
  } = useQuizPageViewModel();

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
          wordId={currentQuestion.wordId}
          question={currentQuestion.questionText}
          pronunciation={currentQuestion.pronunciation}
          audioUrl={currentQuestion.audioUrl}
          language={language}
          imageUrl={currentQuestion.imageUrl}
          type={currentQuestion.type}
          options={currentQuestion.options}
          confidenceLevel={confidenceLevel}
          onConfidenceChange={setConfidenceLevel}
          onAnswer={handleAnswer}
          isSubmitting={submitPending}
          result={result}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}
