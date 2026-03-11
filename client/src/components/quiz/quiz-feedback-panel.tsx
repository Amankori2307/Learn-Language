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
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        aria-live="polite"
        className="grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3 overflow-hidden md:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] md:grid-rows-1 md:gap-5"
      >
        <div
          className={cn(
            "relative overflow-hidden rounded-[1rem] px-3 py-3 sm:px-4 md:px-5 md:py-5",
            result.isCorrect
              ? "bg-emerald-500/8 dark:bg-emerald-500/10"
              : "bg-rose-500/8 dark:bg-rose-500/10",
          )}
        >
          {!result.isCorrect ? (
            <motion.div
              key={negativeVisualNonce}
              initial={{ opacity: 0.2, scale: 0.98 }}
              animate={{ opacity: 0, scale: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-[1.5rem] bg-rose-500/12 blur-xl"
            />
          ) : null}

          <div className="mb-3 flex items-start gap-3">
            <div
              className={cn(
                "mt-0.5 shrink-0 rounded-full p-2",
                result.isCorrect
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300",
              )}
            >
              {result.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <h4
                className={cn(
                  "text-lg font-bold",
                  result.isCorrect
                    ? "text-emerald-800 dark:text-emerald-300"
                    : "text-rose-800 dark:text-rose-300",
                )}
              >
                {result.isCorrect ? "Excellent!" : "Not quite right"}
              </h4>
              <p className="mt-0.5 text-sm text-foreground/90 dark:text-foreground">
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

        <div className="min-h-0 overflow-hidden">
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

      <div className="border-t border-border/60 pt-2 md:pb-6">
        <Button
          ref={continueButtonRef}
          size="lg"
          onClick={onNext}
          className={cn(
            "w-full gap-2 shadow-sm transition-all hover:shadow-md",
            result.isCorrect
              ? "bg-green-600 text-white shadow-green-200/40 hover:bg-green-700"
              : "bg-primary shadow-primary/20 hover:bg-primary/90",
          )}
        >
          Continue <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
