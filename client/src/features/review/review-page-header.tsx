import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function ReviewPageHeader({
  status,
  setStatus,
  statusOptions,
}: {
  status: string;
  setStatus: (value: string) => void;
  statusOptions: string[];
}) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-bold">Review Queue</h1>
        <p className="text-muted-foreground">
          Approve or reject vocabulary before learner exposure.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {statusOptions.map((option) => (
          <Button
            key={option}
            variant={status === option ? "default" : "outline"}
            onClick={() => setStatus(option)}
          >
            {option}
          </Button>
        ))}
        <Link href="/review/add">
          <Button variant="secondary">Go to Add Vocabulary</Button>
        </Link>
      </div>
    </div>
  );
}
