import { QuizCard } from "@/components/quiz-card";
import { useQuizPageViewModel } from "@/features/quiz/use-quiz-page-view-model";
import {
  QuizEmptyState,
  QuizErrorState,
  QuizFinishedState,
  QuizLoadingState,
  QuizMissingQuestionState,
} from "@/features/quiz/quiz-page-states";
import { QuizSessionFrame, QuizSessionHeader } from "@/features/quiz/quiz-session-shell";

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
    submitError,
    sessionStats,
    isFinished,
    submitPending,
    startSession,
    setLocation,
    retry,
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

  if (isError) {
    return <QuizErrorState retry={retry} navigate={setLocation} />;
  }

  if (!questions || questions.length === 0) {
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
    <QuizSessionFrame
      header={<QuizSessionHeader progress={progress} onExit={() => setLocation("/dashboard")} />}
    >
        <QuizCard
          wordId={currentQuestion.wordId}
          question={currentQuestion.questionText}
          pronunciation={currentQuestion.pronunciation}
          audioUrl={currentQuestion.audioUrl}
          language={language}
          imageUrl={currentQuestion.imageUrl}
          type={currentQuestion.type}
          options={currentQuestion.options}
          onAnswer={handleAnswer}
          isSubmitting={submitPending}
          submitError={submitError}
          result={result}
          onNext={handleNext}
        />
    </QuizSessionFrame>
  );
}
