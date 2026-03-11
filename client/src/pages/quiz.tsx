import { QuizCard } from "@/components/quiz-card";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useQuizPageViewModel } from "@/features/quiz/use-quiz-page-view-model";
import {
  QuizEmptyState,
  QuizFinishedState,
  QuizLoadingState,
  QuizMissingQuestionState,
} from "@/features/quiz/quiz-page-states";

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
    return <QuizLoadingState />;
  }

  if (isError || !questions || questions.length === 0) {
    return (
      <QuizEmptyState
        completionMessage={completionMessage}
        startSession={startSession}
        navigate={setLocation}
      />
    );
  }

  if (!currentQuestion) {
    return <QuizMissingQuestionState navigate={setLocation} />;
  }

  if (isFinished) {
    return (
      <QuizFinishedState
        percentage={percentage}
        correctCount={sessionStats.correct}
        incorrectCount={incorrectCount}
        clusterId={clusterId}
        recommendedMode={recommendedMode}
        recommendedLabel={recommendedLabel}
        startSession={startSession}
        navigate={setLocation}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Quiz Header */}
      <div className="mx-auto flex w-full max-w-4xl items-center gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-secondary"
          onClick={() => setLocation("/")}
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
      <div className="flex flex-1 items-center justify-center p-3 sm:p-4">
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
