import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { QuizQuestionTypeEnum } from "@shared/domain/enums";
import { Sparkles, Volume2, VolumeX } from "lucide-react";
import type { QuizPromptPanelProps } from "./quiz-card.types";

export function QuizPromptPanel({
  question,
  pronunciation,
  imageUrl,
  type,
  effectsEnabled,
  activeAudioKey,
  onToggleEffects,
  onPlayQuestionAudio,
}: QuizPromptPanelProps) {
  return (
    <section className="border-b border-border/60 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3 sm:p-4 md:p-6 lg:border-b-0 lg:border-r">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2
            className={cn(
              "break-words font-bold leading-tight text-foreground",
              type === QuizQuestionTypeEnum.SOURCE_TO_TARGET
                ? "text-3xl sm:text-4xl md:text-5xl"
                : "text-2xl sm:text-3xl md:text-4xl",
            )}
          >
            {question}
          </h2>
          {pronunciation ? (
            <p className="mt-1 break-words text-sm italic text-muted-foreground md:text-base">
              {pronunciation}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={onToggleEffects}
            aria-label={effectsEnabled ? "Mute feedback effects" : "Unmute feedback effects"}
            title={effectsEnabled ? "Mute effects" : "Enable effects"}
          >
            {effectsEnabled ? <Sparkles className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-9 w-9 rounded-full"
            onClick={onPlayQuestionAudio}
            aria-label={activeAudioKey === "question-audio" ? "Stop audio" : "Play audio"}
            title={activeAudioKey === "question-audio" ? "Stop audio" : "Play audio"}
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {imageUrl ? (
        <div className="mt-3">
          <img
            src={imageUrl}
            alt="Vocabulary hint"
            className="max-h-40 w-full rounded-xl border border-border/60 bg-background/70 object-contain md:max-h-64"
            loading="lazy"
          />
        </div>
      ) : null}
    </section>
  );
}
