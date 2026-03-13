import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { LanguageEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import { useFeedbackEffects } from "@/hooks/use-feedback-effects";
import { runErrorEffects, runSuccessEffects } from "@/lib/feedback-effects";
import { useHybridAudio } from "@/hooks/use-hybrid-audio";
import { cn } from "@/lib/utils";
import { QuizPromptPanel } from "@/components/quiz/quiz-prompt-panel";
import { QuizAnswerPanel } from "@/components/quiz/quiz-answer-panel";
import { QuizFeedbackPanel } from "@/components/quiz/quiz-feedback-panel";
import type { QuizOption, QuizResult } from "@/components/quiz/quiz-card.types";

interface QuizCardProps {
  wordId?: number;
  question: string;
  pronunciation?: string | null;
  audioUrl?: string | null;
  language?: LanguageEnum;
  imageUrl?: string | null;
  type: QuizQuestionTypeEnum;
  options: QuizOption[];
  showConfidenceControl: boolean;
  confidenceLevel: 1 | 2 | 3;
  onConfidenceChange: (value: 1 | 2 | 3) => void;
  onAnswer: (optionId: number, confidenceLevel: 1 | 2 | 3) => void;
  isSubmitting: boolean;
  submitError: string | null;
  result: QuizResult | null;
  onNext: () => void;
}

export function QuizCard({
  wordId,
  question,
  pronunciation,
  audioUrl,
  language,
  imageUrl,
  type,
  options,
  showConfidenceControl,
  confidenceLevel,
  onConfidenceChange,
  onAnswer,
  isSubmitting,
  submitError,
  result,
  onNext,
}: QuizCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [negativeVisualNonce, setNegativeVisualNonce] = useState(0);
  const { enabled: effectsEnabled, toggle: toggleEffects } = useFeedbackEffects();
  const { activeKey, play } = useHybridAudio();

  const cardAnimate =
    result && !result.isCorrect
      ? { opacity: 1, y: 0, x: [0, -9, 9, -7, 7, 0] }
      : { opacity: 1, y: 0, x: 0 };

  useEffect(() => {
    if (!result) {
      return;
    }

    if (result.isCorrect) {
      runSuccessEffects(effectsEnabled);
      return;
    }

    runErrorEffects(effectsEnabled);
    setNegativeVisualNonce((prev) => prev + 1);
  }, [effectsEnabled, result]);

  useEffect(() => {
    // Prevent stale selection/highlight state from leaking into the next question.
    setSelectedOption(null);
  }, [question, options, type]);

  const handleOptionClick = (id: number) => {
    if (result) return;
    setSelectedOption(id);
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl px-1 sm:px-2 md:px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={question}
          initial={{ opacity: 0, y: 20 }}
          animate={cardAnimate}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-[var(--radius-xl)] md:mx-auto md:max-h-[var(--pane-quiz-session-max-height)]",
            result
              ? "border border-transparent bg-transparent shadow-none backdrop-blur-0 md:border md:border-border/50 md:bg-card/95 md:shadow-2xl md:backdrop-blur"
              : "border border-border/50 bg-card/95 shadow-2xl backdrop-blur",
          )}
        >
          <div className="min-h-0 flex-1 overflow-hidden">
          {!result ? (
            <div className="grid h-full min-h-0 grid-cols-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[1.05fr_1fr] lg:grid-rows-1">
              <QuizPromptPanel
                wordId={wordId}
                question={question}
                pronunciation={pronunciation}
                audioUrl={audioUrl}
                language={language}
                imageUrl={imageUrl}
                type={type}
                effectsEnabled={effectsEnabled}
                activeAudioKey={activeKey}
                onToggleEffects={toggleEffects}
                onPlayQuestionAudio={() =>
                  play({
                    key: "question-audio",
                    audioUrl,
                    wordId,
                    text: question,
                    speechText: pronunciation ?? question,
                    resolveText: question,
                    language,
                  })
                }
              />

              <QuizAnswerPanel
                options={options}
                selectedOption={selectedOption}
                isSubmitting={isSubmitting}
                submitError={submitError}
                showConfidenceControl={showConfidenceControl}
                confidenceLevel={confidenceLevel}
                onConfidenceChange={onConfidenceChange}
                onSelectOption={handleOptionClick}
                onSubmitSelection={onAnswer}
              />
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col p-3 sm:p-4 md:px-6 md:pt-6 md:pb-0">
              <QuizFeedbackPanel
                result={result}
                activeAudioKey={activeKey}
                language={language}
                negativeVisualNonce={negativeVisualNonce}
                onPlayAudio={play}
                onNext={onNext}
              />
            </div>
          )}
          </div>

          {/* Hidden visual state container for accessibility continuity */}
          <div className="sr-only" aria-hidden={!result}>
            {result ? "Answer evaluated" : "Awaiting answer"}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
