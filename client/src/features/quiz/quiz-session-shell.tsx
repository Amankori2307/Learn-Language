import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function QuizSessionHeader({
  progress,
  onExit,
}: {
  progress: number;
  onExit: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-4xl shrink-0 items-center gap-3 px-3 py-4 sm:gap-4 sm:px-4 sm:py-6">
      <Button
        variant="ghost"
        size="icon"
        className="rounded-full hover:bg-secondary"
        onClick={onExit}
      >
        <X className="h-6 w-6 text-muted-foreground" />
      </Button>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function QuizSessionFrame({ header, children }: { header: ReactNode; children: ReactNode }) {
  return (
    <div className="flex h-screen min-h-screen flex-col overflow-hidden bg-background h-dvh min-h-dvh">
      {header}
      <div className="flex min-h-0 flex-1 items-stretch justify-center overflow-hidden px-2 pb-2 pt-1 sm:p-4 md:px-6 md:pt-4 md:pb-8">
        {children}
      </div>
    </div>
  );
}
