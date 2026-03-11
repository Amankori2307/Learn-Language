import { BookText } from "lucide-react";

type StoryLine = {
  originalScript: string;
  pronunciation: string;
  english: string;
};

export function ContextualStoryGrid({ storyLines }: { storyLines: StoryLine[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {storyLines.map((line, index) => (
        <div
          key={`${line.originalScript}-${index}`}
          className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm sm:p-5"
        >
          <div className="mb-2 flex items-center gap-2 text-primary">
            <BookText className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-wide">
              Context {index + 1}
            </span>
          </div>
          <p className="break-words font-originalScript text-lg leading-relaxed">
            {line.originalScript}
          </p>
          <p className="mt-2 break-words text-sm text-foreground/80">
            Pronunciation: <span className="font-medium">{line.pronunciation}</span>
          </p>
          <p className="mt-2 break-words text-sm text-muted-foreground">{line.english}</p>
        </div>
      ))}
    </div>
  );
}
