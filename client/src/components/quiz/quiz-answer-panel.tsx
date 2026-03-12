import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { QuizAnswerPanelProps } from "./quiz-card.types";

export function QuizAnswerPanel({
  options,
  selectedOption,
  isSubmitting,
  submitError,
  showConfidenceControl,
  confidenceLevel,
  onConfidenceChange,
  onSelectOption,
  onSubmitSelection,
}: QuizAnswerPanelProps) {
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedIndex = selectedOption === null ? -1 : options.findIndex((option) => option.id === selectedOption);

  const focusOptionAt = useCallback((index: number) => {
    const nextButton = optionRefs.current[index];
    if (!nextButton) {
      return;
    }

    nextButton.focus();
    onSelectOption(options[index].id);
  }, [onSelectOption, options]);

  useEffect(() => {
    if (selectedOption !== null) {
      return;
    }

    optionRefs.current[0]?.focus();
  }, [options, selectedOption]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = selectedIndex >= 0 ? (selectedIndex + 1) % options.length : 0;
        focusOptionAt(nextIndex);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const nextIndex = selectedIndex >= 0 ? (selectedIndex - 1 + options.length) % options.length : options.length - 1;
        focusOptionAt(nextIndex);
        return;
      }

      if (event.key === "Enter" && selectedOption !== null && !isSubmitting) {
        event.preventDefault();
        onSubmitSelection(selectedOption, confidenceLevel);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [confidenceLevel, focusOptionAt, isSubmitting, onSubmitSelection, options.length, selectedIndex, selectedOption]);

  return (
    <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-2 overflow-hidden p-2.5 sm:gap-3 sm:p-4 md:p-6">
      <div className="min-h-0 overflow-y-auto px-0.5 pb-2">
        <div className="grid grid-cols-1 gap-2.5 sm:gap-3">
          {options.map((option, index) => {
            const isSelected = selectedOption === option.id;
            const className = isSelected
              ? "border-primary/70 bg-primary/8 text-foreground"
              : "border-border/70 bg-background/30 hover:border-primary/40 hover:bg-primary/4";

            return (
              <button
                key={option.id}
                ref={(node) => {
                  optionRefs.current[index] = node;
                }}
                disabled={isSubmitting}
                onClick={() => onSelectOption(option.id)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown") {
                    event.preventDefault();
                    focusOptionAt((index + 1) % options.length);
                    return;
                  }

                  if (event.key === "ArrowUp") {
                    event.preventDefault();
                    focusOptionAt((index - 1 + options.length) % options.length);
                  }
                }}
                aria-label={`Option ${option.text}`}
                className={cn(
                  "relative min-h-14 rounded-xl border p-4 text-left text-base font-medium break-words transition-colors duration-150 md:text-lg",
                  className,
                )}
                autoFocus={index === 0 && selectedOption === null}
              >
                <span className="relative z-10">{option.text}</span>
                {isSelected && isSubmitting ? (
                  <div className="absolute inset-0 animate-pulse bg-white/20" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-2.5 space-y-2 border-t border-border/60 bg-card/95 px-2.5 pt-2 pb-[calc(env(safe-area-inset-bottom)+0.5rem)] backdrop-blur sm:static sm:mx-0 sm:space-y-3 sm:bg-transparent sm:px-0 sm:pb-0 sm:backdrop-blur-0">
        {submitError ? (
          <p className="rounded-xl border border-status-error/35 bg-status-error-surface px-3 py-2 text-sm text-status-error">
            {submitError}
          </p>
        ) : null}
        {showConfidenceControl ? (
          <div className="rounded-2xl border border-border/50 bg-background/40 p-3">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">Confidence</p>
              <span className="text-xs text-muted-foreground">Used to grade recall quality</span>
            </div>
            <RadioGroup
              value={String(confidenceLevel)}
              onValueChange={(value) => onConfidenceChange(Number(value) as 1 | 2 | 3)}
              className="grid grid-cols-3 gap-2"
              aria-label="Answer confidence"
            >
              {[
                { value: "1", label: "Low" },
                { value: "2", label: "Medium" },
                { value: "3", label: "High" },
              ].map((option) => {
                const itemId = `quiz-confidence-${option.value}`;
                const isSelected = confidenceLevel === Number(option.value);
                return (
                  <Label
                    key={option.value}
                    htmlFor={itemId}
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/60 px-3 py-2 text-sm transition-colors",
                      isSelected
                        ? "border-primary/60 bg-primary/10 text-foreground"
                        : "bg-background/60 text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    <RadioGroupItem id={itemId} value={option.value} />
                    {option.label}
                  </Label>
                );
              })}
            </RadioGroup>
          </div>
        ) : null}
        {selectedOption !== null ? (
          <Button
            size="lg"
            onClick={() => onSubmitSelection(selectedOption, confidenceLevel)}
            disabled={isSubmitting}
            className="w-full gap-2 shadow-lg transition-all hover:shadow-xl"
          >
            {isSubmitting ? "Checking..." : "Check Answer"}
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            Choose an option, then confirm your answer.
          </p>
        )}
      </div>
    </section>
  );
}
