import { Button } from "@/components/ui/button";
import { Volume2 } from "lucide-react";
import type { LanguageEnum } from "@shared/domain/enums";
import type { QuizExample } from "./quiz-card.types";

export function QuizFeedbackExamples({
  examples,
  activeAudioKey,
  language,
  onPlayAudio,
}: {
  examples: QuizExample[];
  activeAudioKey: string | null;
  language?: LanguageEnum;
  onPlayAudio: (payload: {
    key: string;
    text: string;
    speechText: string;
    resolveText: string;
    language?: LanguageEnum;
  }) => void;
}) {
  return (
    <div className="grid h-full min-h-0 grid-rows-[auto_minmax(0,1fr)]">
      <p className="mb-2 pt-3 text-base font-semibold uppercase tracking-[0.16em] text-foreground/85 md:pt-0 md:text-sm md:text-muted-foreground">
        Examples
      </p>
      <div className="min-h-0 overflow-y-auto pr-1">
        <div className="space-y-2">
        {examples.map((example, index) => (
          <div
            key={`${example.originalScript}-${index}`}
            className="rounded-[var(--radius-md)] border border-border/50 bg-background/80 p-3 text-foreground [box-shadow:var(--shadow-xs)]"
          >
            <div className="flex items-center justify-end pb-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() =>
                  onPlayAudio({
                    key: `example-audio-${index}`,
                    text: example.originalScript,
                    speechText: example.pronunciation ?? example.originalScript,
                    resolveText: example.originalScript,
                    language,
                  })
                }
                aria-label={
                  activeAudioKey === `example-audio-${index}`
                    ? "Stop example audio"
                    : "Play example audio"
                }
                title={
                  activeAudioKey === `example-audio-${index}`
                    ? "Stop example audio"
                    : "Play example audio"
                }
              >
                <Volume2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="break-words text-lg font-medium text-foreground">{example.originalScript}</p>
            <p className="mt-2 break-words text-sm italic text-muted-foreground">
              {example.pronunciation}
            </p>
            <p className="mt-3 break-words text-sm text-foreground/90">{example.meaning}</p>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
}
