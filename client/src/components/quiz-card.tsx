import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Volume2, VolumeX, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { LanguageEnum, QuizQuestionTypeEnum } from "@shared/domain/enums";
import { useFeedbackEffects } from "@/hooks/use-feedback-effects";
import { runErrorEffects, runSuccessEffects } from "@/lib/feedback-effects";
import { useHybridAudio } from "@/hooks/use-hybrid-audio";

interface QuizOption {
  id: number;
  text: string;
}

interface QuizCardProps {
  question: string;
  pronunciation?: string | null;
  audioUrl?: string | null;
  language?: LanguageEnum;
  imageUrl?: string | null;
  type: QuizQuestionTypeEnum;
  options: QuizOption[];
  confidenceLevel: 1 | 2 | 3;
  onConfidenceChange: (value: 1 | 2 | 3) => void;
  onAnswer: (optionId: number, confidenceLevel: 1 | 2 | 3) => void;
  isSubmitting: boolean;
  result: {
    isCorrect: boolean;
      correctAnswer: {
        id?: number;
        originalScript: string;
        english: string;
        transliteration: string;
        audioUrl?: string | null;
        exampleSentences: string[];
      };
    examples: Array<{
      originalScript: string;
      pronunciation: string;
      meaning: string;
    }>;
  } | null;
  onNext: () => void;
}

export function QuizCard({ 
  question, 
  pronunciation,
  audioUrl,
  language,
  imageUrl,
  type, 
  options, 
  confidenceLevel,
  onConfidenceChange,
  onAnswer, 
  isSubmitting, 
  result,
  onNext 
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
    onAnswer(id, confidenceLevel);
  };

  const promptLabel =
    type === QuizQuestionTypeEnum.SOURCE_TO_TARGET
      ? "Translate to English"
      : "Translate to Source Language";

  return (
    <div className="w-full max-w-6xl mx-auto px-2 md:px-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={question}
          initial={{ opacity: 0, y: 20 }}
          animate={cardAnimate}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative bg-card/95 backdrop-blur rounded-3xl shadow-2xl border border-border/50 overflow-hidden h-[min(88vh,820px)] flex flex-col"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] flex-1 min-h-0">
            <section className="min-h-0 border-b lg:border-b-0 lg:border-r border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-5 md:p-8 flex flex-col">
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold uppercase tracking-wider">
                  {promptLabel}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full gap-2"
                  onClick={toggleEffects}
                  aria-label={effectsEnabled ? "Mute feedback effects" : "Unmute feedback effects"}
                >
                  {effectsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  {effectsEnabled ? "Effects On" : "Effects Off"}
                </Button>
              </div>

              <div className="mt-5 min-h-0 overflow-y-auto pr-1">
                <h2
                  className={cn(
                    "font-bold text-foreground break-words leading-tight",
                    type === QuizQuestionTypeEnum.SOURCE_TO_TARGET ? "text-4xl md:text-5xl" : "text-3xl md:text-4xl",
                  )}
                >
                  {question}
                </h2>
                {pronunciation && (
                  <p className="text-sm md:text-base text-muted-foreground mt-4 break-words">
                    Pronunciation: <span className="font-semibold text-foreground">{pronunciation}</span>
                  </p>
                )}
                <div className="mt-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-2"
                    onClick={() =>
                      play({
                        key: "question-audio",
                        audioUrl,
                        text: question,
                        language,
                      })
                    }
                  >
                    <Volume2 className="h-4 w-4" />
                    {activeKey === "question-audio" ? "Stop Audio" : "Listen"}
                  </Button>
                </div>
                {imageUrl && (
                  <div className="mt-5">
                    <img
                      src={imageUrl}
                      alt="Vocabulary hint"
                      className="max-h-64 w-full rounded-xl border border-border/60 object-contain bg-background/70"
                      loading="lazy"
                    />
                  </div>
                )}
              </div>
            </section>

            <section className="min-h-0 p-5 md:p-8 grid grid-rows-[auto_minmax(0,1fr)_auto] gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">How confident are you?</p>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Answer confidence">
                  <Button
                    type="button"
                    variant={confidenceLevel === 1 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onConfidenceChange(1)}
                    aria-pressed={confidenceLevel === 1}
                    disabled={isSubmitting || Boolean(result)}
                  >
                    Guess
                  </Button>
                  <Button
                    type="button"
                    variant={confidenceLevel === 2 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onConfidenceChange(2)}
                    aria-pressed={confidenceLevel === 2}
                    disabled={isSubmitting || Boolean(result)}
                  >
                    Somewhat Sure
                  </Button>
                  <Button
                    type="button"
                    variant={confidenceLevel === 3 ? "default" : "outline"}
                    size="sm"
                    onClick={() => onConfidenceChange(3)}
                    aria-pressed={confidenceLevel === 3}
                    disabled={isSubmitting || Boolean(result)}
                  >
                    Very Sure
                  </Button>
                </div>
              </div>

              {!result ? (
                <div className="min-h-0 overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 gap-3">
                    {options.map((option) => {
                      const isSelected = selectedOption === option.id;
                      const className = isSelected
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-2"
                        : "hover:border-primary hover:bg-primary/5";

                      return (
                        <button
                          key={option.id}
                          disabled={isSubmitting}
                          onClick={() => handleOptionClick(option.id)}
                          aria-label={`Option ${option.text}`}
                          className={cn(
                            "p-4 rounded-xl text-base md:text-lg font-medium border-2 transition-all duration-200 text-left relative overflow-hidden break-words",
                            type !== QuizQuestionTypeEnum.SOURCE_TO_TARGET && "text-xl",
                            className,
                          )}
                        >
                          <span className="relative z-10">{option.text}</span>
                          {isSelected && isSubmitting && <div className="absolute inset-0 bg-white/20 animate-pulse" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    aria-live="polite"
                    className={cn(
                      "relative rounded-2xl border p-4 md:p-5 min-h-0 overflow-hidden grid grid-rows-[auto_minmax(0,1fr)]",
                      result.isCorrect
                        ? "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/70"
                        : "bg-rose-50/80 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/70",
                    )}
                  >
                    {!result.isCorrect && (
                      <motion.div
                        key={negativeVisualNonce}
                        initial={{ opacity: 0.18 }}
                        animate={{ opacity: 0 }}
                        transition={{ duration: 0.45, ease: "easeOut" }}
                        className="pointer-events-none absolute inset-0 bg-rose-500/20"
                      />
                    )}

                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={cn(
                          "p-2 rounded-full shrink-0",
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
                            result.isCorrect ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300",
                          )}
                        >
                          {result.isCorrect ? "Excellent!" : "Not quite right"}
                        </h4>
                        <p className="text-sm text-foreground/90 dark:text-foreground mt-1 break-words">
                          <span className="italic">{result.correctAnswer.transliteration}</span>
                          <span className="mx-2">•</span>
                          <span className="font-semibold">({result.correctAnswer.originalScript})</span>
                          <span className="mx-2">•</span>
                          <span>{result.correctAnswer.english}</span>
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2 rounded-full gap-2"
                          onClick={() =>
                            play({
                              key: "answer-audio",
                              audioUrl: result.correctAnswer.audioUrl ?? null,
                              text: result.correctAnswer.originalScript,
                              language,
                            })
                          }
                        >
                          <Volume2 className="h-4 w-4" />
                          {activeKey === "answer-audio" ? "Stop Audio" : "Listen Answer"}
                        </Button>
                      </div>
                    </div>

                    {result.examples.length > 0 ? (
                      <div className="space-y-2 overflow-y-auto pr-1 min-h-0">
                        {result.examples.map((example, index) => (
                          <div
                            key={`${example.originalScript}-${index}`}
                            className="p-3 rounded-lg border border-border/70 bg-background/90 dark:bg-background/60 text-sm text-foreground"
                          >
                            <div className="flex items-center justify-end pb-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 rounded-full gap-1 text-xs"
                                onClick={() =>
                                  play({
                                    key: `example-audio-${index}`,
                                    text: example.originalScript,
                                    language,
                                  })
                                }
                              >
                                <Volume2 className="h-3.5 w-3.5" />
                                {activeKey === `example-audio-${index}` ? "Stop" : "Listen"}
                              </Button>
                            </div>
                            <p className="break-words">
                              <span className="font-semibold">Sentence:</span> {example.originalScript}
                            </p>
                            <p className="break-words">
                              <span className="font-semibold">Pronunciation:</span> {example.pronunciation}
                            </p>
                            <p className="break-words">
                              <span className="font-semibold">Meaning:</span> {example.meaning}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No examples available for this item yet.</div>
                    )}
                  </motion.div>
                </AnimatePresence>
              )}

              <div className="pt-2 border-t border-border/60">
                {result ? (
                  <Button
                    size="lg"
                    onClick={onNext}
                    className={cn(
                      "w-full gap-2 shadow-lg hover:shadow-xl transition-all",
                      result.isCorrect
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200"
                        : "bg-primary hover:bg-primary/90 shadow-primary/20",
                    )}
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground text-center">Choose an option to view feedback and examples.</p>
                )}
              </div>
            </section>
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
