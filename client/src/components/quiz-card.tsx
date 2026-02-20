import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Volume2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import confetti from "canvas-confetti";
import { useEffect, useState } from "react";

interface QuizOption {
  id: number;
  text: string;
}

interface QuizCardProps {
  question: string;
  pronunciation?: string | null;
  type: 'telugu_to_english' | 'english_to_telugu';
  options: QuizOption[];
  confidenceLevel: 1 | 2 | 3;
  onConfidenceChange: (value: 1 | 2 | 3) => void;
  onAnswer: (optionId: number, confidenceLevel: 1 | 2 | 3) => void;
  isSubmitting: boolean;
  result: {
    isCorrect: boolean;
    correctAnswer: {
      id?: number;
      telugu: string;
      english: string;
      transliteration: string;
      exampleSentences: string[];
    };
    example: {
      telugu: string;
      pronunciation: string;
      meaning: string;
    };
  } | null;
  onNext: () => void;
}

export function QuizCard({ 
  question, 
  pronunciation,
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

  useEffect(() => {
    if (result?.isCorrect) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#34d399', '#059669']
      });
    }
  }, [result]);

  const handleOptionClick = (id: number) => {
    if (result) return;
    setSelectedOption(id);
    onAnswer(id, confidenceLevel);
  };

  const promptLabel =
    type === "telugu_to_english"
      ? "Translate to English"
      : "Translate to Telugu";

  return (
    <div className="w-full max-w-2xl mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={question}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-card rounded-3xl shadow-xl border border-border/50 overflow-hidden"
        >
          {/* Question Area */}
          <div className="p-8 md:p-12 text-center bg-gradient-to-b from-primary/5 to-transparent">
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
              {promptLabel}
            </span>
            
            <h2 className={cn(
              "text-3xl md:text-5xl font-bold mb-6 text-foreground leading-relaxed",
              "font-sans break-words"
            )}>
              {question}
            </h2>
            {pronunciation && (
              <p className="text-sm md:text-base text-muted-foreground mb-5">
                Pronunciation: <span className="font-semibold text-foreground">{pronunciation}</span>
              </p>
            )}

            {/* Audio Button Placeholder if needed */}
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-primary/10 hover:text-primary">
              <Volume2 className="w-6 h-6" />
            </Button>
          </div>

          {/* Options Grid */}
          <div className="p-6 md:p-8 bg-card">
            <div className="mb-4">
              <p className="text-sm font-medium text-muted-foreground mb-2">How confident are you?</p>
              <div className="flex gap-2" role="radiogroup" aria-label="Answer confidence">
                <Button
                  type="button"
                  variant={confidenceLevel === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onConfidenceChange(1)}
                  aria-pressed={confidenceLevel === 1}
                  disabled={isSubmitting || !!result}
                >
                  Guess
                </Button>
                <Button
                  type="button"
                  variant={confidenceLevel === 2 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onConfidenceChange(2)}
                  aria-pressed={confidenceLevel === 2}
                  disabled={isSubmitting || !!result}
                >
                  Somewhat Sure
                </Button>
                <Button
                  type="button"
                  variant={confidenceLevel === 3 ? "default" : "outline"}
                  size="sm"
                  onClick={() => onConfidenceChange(3)}
                  aria-pressed={confidenceLevel === 3}
                  disabled={isSubmitting || !!result}
                >
                  Very Sure
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {options.map((option) => {
                const isSelected = selectedOption === option.id;
                const correctOptionId = result?.correctAnswer?.id;
                const isCorrectOption = result
                  ? (typeof correctOptionId === "number"
                      ? option.id === correctOptionId
                      : option.text === result.correctAnswer.english)
                  : false;
                let className = "hover:border-primary hover:bg-primary/5";

                if (result) {
                  if (isCorrectOption) {
                    className = "border-emerald-500 bg-emerald-500/12 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/60 ring-offset-2 ring-offset-background";
                  } else if (!result.isCorrect && isSelected) {
                    className = "border-rose-500 bg-rose-500/12 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/60 ring-offset-2 ring-offset-background";
                  } else {
                    className = "opacity-70";
                  }
                } else if (isSelected) {
                  className = "border-primary bg-primary/10 text-primary ring-2 ring-primary ring-offset-2";
                }

                return (
                  <button
                    key={option.id}
                    disabled={!!result || isSubmitting}
                    onClick={() => handleOptionClick(option.id)}
                    aria-label={`Option ${option.text}`}
                      className={cn(
                        "p-4 rounded-xl text-base md:text-lg font-medium border-2 transition-all duration-200 text-left relative overflow-hidden group break-words",
                        type !== "telugu_to_english" && "text-xl",
                        className
                      )}
                  >
                    <span className="relative z-10">{option.text}</span>
                    {isSelected && isSubmitting && (
                      <div className="absolute inset-0 bg-white/20 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result Feedback & Next Button */}
          <AnimatePresence>
            {result && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                aria-live="polite"
                className={cn(
                  "border-t p-6 md:p-8",
                  result.isCorrect
                    ? "bg-emerald-50/80 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800/70"
                    : "bg-rose-50/80 border-rose-200 dark:bg-rose-950/30 dark:border-rose-800/70"
                )}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex gap-4">
                    <div className={cn(
                      "p-3 rounded-full shrink-0",
                      result.isCorrect
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                        : "bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-300"
                    )}>
                      {result.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                    </div>
                    <div>
                      <h4 className={cn(
                        "text-lg font-bold",
                        result.isCorrect ? "text-emerald-800 dark:text-emerald-300" : "text-rose-800 dark:text-rose-300"
                      )}>
                        {result.isCorrect ? "Excellent!" : "Not quite right"}
                      </h4>
                      <p className="text-sm md:text-base text-foreground/90 dark:text-foreground mt-1">
                        <span className="italic break-words">{result.correctAnswer.transliteration}</span>
                        <span className="mx-2">•</span>
                        <span className="font-semibold text-foreground">({result.correctAnswer.telugu})</span>
                        <span className="mx-2">•</span>
                        <span>{result.correctAnswer.english}</span>
                      </p>
                      {result.example && (
                        <div className="text-sm mt-3 p-3 rounded-lg border border-border/70 bg-background/90 dark:bg-background/60 space-y-1 text-foreground">
                          <p>
                            <span className="font-semibold">Sentence:</span>{" "}
                            <span className="font-telugu text-foreground/95">
                              {result.example.telugu}
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold">Pronunciation:</span>{" "}
                            <span className="font-medium text-foreground/95">
                              {result.example.pronunciation}
                            </span>
                          </p>
                          <p>
                            <span className="font-semibold">Meaning:</span>{" "}
                            <span className="font-medium text-foreground/95">
                              {result.example.meaning}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    size="lg" 
                    onClick={onNext}
                    className={cn(
                      "w-full md:w-auto shrink-0 gap-2 shadow-lg hover:shadow-xl transition-all",
                      result.isCorrect 
                        ? "bg-green-600 hover:bg-green-700 text-white shadow-green-200" 
                        : "bg-primary hover:bg-primary/90 shadow-primary/20"
                    )}
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
