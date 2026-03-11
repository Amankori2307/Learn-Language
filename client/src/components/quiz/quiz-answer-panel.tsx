import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { QuizAnswerPanelProps } from "./quiz-card.types";

export function QuizAnswerPanel({
  options,
  selectedOption,
  isSubmitting,
  confidenceLevel,
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
    <section className="grid min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3 overflow-hidden p-3 sm:p-4 md:p-6">
      <div className="min-h-0 overflow-y-auto pr-1">
        <div className="grid grid-cols-1 gap-3">
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
                  "relative overflow-hidden rounded-xl border p-4 text-left text-base font-medium break-words transition-colors duration-150 md:text-lg",
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

      <div className="border-t border-border/60 pt-2">
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
