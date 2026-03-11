import { Button } from "@/components/ui/button";

export function WordBucketHeader({
  title,
  meaning,
  onBack,
}: {
  title: string;
  meaning: string;
  onBack: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-muted-foreground">{meaning}</p>
      </div>
      <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
        Back to Dashboard
      </Button>
    </div>
  );
}

export function WordBucketNextAction({
  title,
  description,
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
}: {
  title: string;
  description: string;
  primaryLabel: string;
  secondaryLabel: string;
  onPrimary: () => void;
  onSecondary: () => void;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-4 md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Next action</p>
          <h2 className="mt-1 text-lg font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Button onClick={onPrimary} className="w-full sm:w-auto">
            {primaryLabel}
          </Button>
          <Button variant="outline" onClick={onSecondary} className="w-full sm:w-auto">
            {secondaryLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
