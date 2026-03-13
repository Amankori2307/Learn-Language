import { motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight, CheckCircle2, Volume2, XCircle } from "lucide-react";
import { QuizFeedbackExamples } from "./quiz-feedback-examples";
import type { LanguageEnum } from "@shared/domain/enums";
import type { QuizResult } from "./quiz-card.types";

export function QuizFeedbackPanel({
  result,
  activeAudioKey,
  language,
  negativeVisualNonce,
  onPlayAudio,
  onNext,
}: {
  result: QuizResult;
  activeAudioKey: string | null;
  language?: LanguageEnum;
  negativeVisualNonce: number;
  onPlayAudio: (payload: {
    key: string;
    audioUrl?: string | null;
    wordId?: number;
    text: string;
    speechText: string;
    resolveText: string;
    language?: LanguageEnum;
  }) => void;
  onNext: () => void;
}) {
  const continueButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    continueButtonRef.current?.focus();
  }, [result.correctAnswer.originalScript, result.isCorrect]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Enter") {
        return;
      }

      event.preventDefault();
      onNext();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onNext]);

  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-0">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        aria-live="polite"
        className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-2 overflow-hidden pb-2 sm:pb-3 md:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] md:grid-rows-1 md:gap-5 md:pb-4"
      >
        <div
          className={cn(
            "relative h-full min-h-0 overflow-hidden rounded-[var(--radius-lg)] border px-3 py-3 sm:px-4 md:px-5 md:py-5",
            result.isCorrect ? "surface-status-success" : "surface-status-error",
          )}
        >
          {!result.isCorrect ? (
            <motion.div
              key={negativeVisualNonce}
              initial={{ opacity: 0.2, scale: 0.98 }}
              animate={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-[var(--radius-xl)] bg-[hsl(var(--status-error-emphasis)/0.16)] blur-xl"
            />
          ) : null}

          <div className="mb-3 flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 shrink-0 rounded-full p-2",
                result.isCorrect
                  ? "bg-[hsl(var(--status-success-emphasis)/0.14)] text-status-success"
                  : "bg-[hsl(var(--status-error-emphasis)/0.14)] text-status-error",
              )}
            >
              {result.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h4
                className={cn(
                  "text-lg font-bold",
                  result.isCorrect ? "text-status-success" : "text-status-error",
                )}
              >
                {result.isCorrect ? "Excellent!" : "Not quite right"}
              </h4>
              <p className="mt-0.5 text-sm text-current/90">
                {result.isCorrect
                  ? "That answer fits the current prompt."
                  : "Correct answer below."}
              </p>
            </div>
          </div>

          <div className="flex items-start justify-between gap-3 md:flex-col md:items-start">
            <div className="min-w-0">
              <p className="break-words text-2xl font-semibold text-foreground sm:text-3xl md:text-4xl">
                {result.correctAnswer.originalScript}
              </p>
              <p className="mt-1 break-words text-sm italic text-muted-foreground sm:text-base">
                {result.correctAnswer.transliteration}
              </p>
              <p className="mt-1 break-words text-base text-foreground/90 sm:text-lg">
                {result.correctAnswer.english}
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 shrink-0 rounded-full md:mt-4"
              onClick={() =>
                onPlayAudio({
                  key: "answer-audio",
                  audioUrl: result.correctAnswer.audioUrl ?? null,
                  wordId: result.correctAnswer.id,
                  text: result.correctAnswer.originalScript,
                  speechText:
                    result.correctAnswer.transliteration ?? result.correctAnswer.originalScript,
                  resolveText: result.correctAnswer.originalScript,
                  language,
                })
              }
              aria-label={activeAudioKey === "answer-audio" ? "Stop answer audio" : "Play answer audio"}
              title={activeAudioKey === "answer-audio" ? "Stop answer audio" : "Play answer audio"}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="h-full min-h-0 overflow-hidden">
          {result.examples.length > 0 ? (
            <QuizFeedbackExamples
              examples={result.examples}
              activeAudioKey={activeAudioKey}
              language={language}
              onPlayAudio={onPlayAudio}
            />
          ) : (
            <div className="text-sm text-muted-foreground">No examples available for this item yet.</div>
          )}
        </div>
      </motion.div>

      <div className="sticky bottom-0 border-t border-border/60 bg-background/95 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur md:static md:pb-6 md:backdrop-blur-0">
        <Button
          ref={continueButtonRef}
          size="lg"
          onClick={onNext}
          className={cn(
            "w-full gap-2 shadow-sm transition-all hover:shadow-md",
            result.isCorrect
              ? "border border-[hsl(var(--status-success-border))] bg-[hsl(var(--status-success-emphasis))] text-[hsl(var(--primary-foreground))] [box-shadow:var(--shadow-sm)] hover:[box-shadow:var(--shadow-md)]"
              : "bg-primary shadow-primary/20 hover:bg-primary/90",
          )}
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
