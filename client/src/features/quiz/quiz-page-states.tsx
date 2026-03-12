import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Layout } from "@/components/layout";
import { InlineLoading } from "@/components/ui/page-states";
import { QuizModeEnum } from "@shared/domain/enums";

export function QuizLoadingState() {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="mx-auto flex min-h-[60vh] w-full max-w-2xl items-center justify-center rounded-3xl border border-border/50 bg-card p-8 text-center shadow-sm">
        <div className="space-y-3">
          <h2 className="text-2xl font-semibold">Preparing your session</h2>
          <InlineLoading label="Generating your lesson..." className="justify-center" />
        </div>
      </div>
    </div>
  );
}

export function QuizEmptyState({
  completionMessage,
  startSession,
  navigate,
}: {
  completionMessage: string;
  startSession: (target: string) => void;
  navigate: (target: string) => void;
}) {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl rounded-2xl border border-border/50 bg-card p-8 text-center md:p-10">
        <h2 className="text-2xl font-bold text-foreground">Session Complete</h2>
        <p className="mt-2 text-muted-foreground">{completionMessage}</p>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">
          Keep momentum by starting a revision mode instead of stopping here.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button onClick={() => startSession(`/quiz?mode=${QuizModeEnum.DAILY_REVIEW}`)}>
            Daily Revision
          </Button>
          <Button
            variant="outline"
            onClick={() => startSession(`/quiz?mode=${QuizModeEnum.WEAK_WORDS}`)}
          >
            Weak Words Drill
          </Button>
          <Button variant="outline" onClick={() => navigate("/clusters")}>
            Practice by Cluster
          </Button>
          <Button variant="outline" onClick={() => navigate("/analytics")}>
            View Analytics
          </Button>
        </div>
        <Button variant="ghost" className="mt-4" onClick={() => navigate("/")}>
          Return Home
        </Button>
      </div>
    </Layout>
  );
}

export function QuizErrorState({
  retry,
  navigate,
}: {
  retry: () => void;
  navigate: (target: string) => void;
}) {
  return (
    <Layout>
      <div className="mx-auto max-w-2xl rounded-2xl border border-border/50 bg-card p-8 text-center md:p-10">
        <h2 className="text-2xl font-bold text-foreground">Could not load quiz session</h2>
        <p className="mt-2 text-muted-foreground">
          The quiz request failed before a question could be prepared.
        </p>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Button onClick={retry}>Retry Session</Button>
          <Button variant="outline" onClick={() => navigate("/")}>
            Return Home
          </Button>
        </div>
      </div>
    </Layout>
  );
}

export function QuizMissingQuestionState({ navigate }: { navigate: (target: string) => void }) {
  return (
    <Layout>
      <div className="py-20 text-center">
        <h2 className="text-2xl font-bold text-foreground">No active question</h2>
        <p className="mb-6 mt-2 text-muted-foreground">Please restart the session.</p>
        <Button onClick={() => navigate("/")}>Return Home</Button>
      </div>
    </Layout>
  );
}

export function QuizFinishedState({
  percentage,
  correctCount,
  incorrectCount,
  clusterId,
  recommendedMode,
  recommendedLabel,
  startSession,
  navigate,
}: {
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  clusterId?: number;
  recommendedMode: QuizModeEnum;
  recommendedLabel: string;
  startSession: (target: string) => void;
  navigate: (target: string) => void;
}) {
  const actionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const actions = useMemo(
    () => [
      ...(incorrectCount > 0
        ? [
            {
              key: "weak-words",
              run: () => startSession(`/quiz?mode=${QuizModeEnum.WEAK_WORDS}`),
            },
          ]
        : []),
      ...(clusterId
        ? [
            {
              key: "cluster",
              run: () => navigate(`/quiz?mode=cluster&clusterId=${clusterId}`),
            },
          ]
        : []),
      {
        key: "recommended",
        run: () => startSession(`/quiz?mode=${recommendedMode}`),
      },
      {
        key: "dashboard",
        run: () => navigate("/"),
      },
    ],
    [clusterId, incorrectCount, navigate, recommendedMode, startSession],
  );

  useEffect(() => {
    actionRefs.current[0]?.focus();
  }, [actions]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeIndex = actionRefs.current.findIndex((button) => button === document.activeElement);

      if (event.key === "ArrowDown") {
        event.preventDefault();
        const nextIndex = activeIndex >= 0 ? (activeIndex + 1) % actions.length : 0;
        actionRefs.current[nextIndex]?.focus();
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        const nextIndex = activeIndex >= 0 ? (activeIndex - 1 + actions.length) % actions.length : actions.length - 1;
        actionRefs.current[nextIndex]?.focus();
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        const nextIndex = activeIndex >= 0 ? activeIndex : 0;
        actions[nextIndex]?.run();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [actions]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-3xl border border-border/50 bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
          <span className="text-3xl">🎉</span>
        </div>
        <h2 className="mb-2 text-3xl font-bold">Lesson Complete!</h2>
        <p className="mb-8 text-muted-foreground">You&apos;re making steady progress.</p>

        <div className="mb-8 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-secondary/50 p-4">
            <div className="text-2xl font-bold text-primary">{percentage}%</div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Accuracy
            </div>
          </div>
          <div className="rounded-2xl bg-secondary/50 p-4">
            <div className="text-2xl font-bold text-accent">{correctCount}</div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Correct Words
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {incorrectCount > 0 ? (
            <Button
              ref={(node) => {
                actionRefs.current[0] = node;
              }}
              variant="secondary"
              className="h-12 w-full rounded-xl text-lg"
              onClick={() => startSession(`/quiz?mode=${QuizModeEnum.WEAK_WORDS}`)}
            >
              Start Reinforcement Loop ({incorrectCount} missed)
            </Button>
          ) : null}
          {clusterId ? (
            <Button
              ref={(node) => {
                actionRefs.current[incorrectCount > 0 ? 1 : 0] = node;
              }}
              variant="outline"
              className="h-12 w-full rounded-xl text-lg"
              onClick={() => navigate(`/quiz?mode=cluster&clusterId=${clusterId}`)}
            >
              Review Related Cluster Words
            </Button>
          ) : null}
          <Button
            ref={(node) => {
              actionRefs.current[(incorrectCount > 0 ? 1 : 0) + (clusterId ? 1 : 0)] = node;
            }}
            className="h-12 w-full rounded-xl text-lg shadow-lg shadow-primary/20"
            onClick={() => startSession(`/quiz?mode=${recommendedMode}`)}
          >
            {recommendedLabel}
          </Button>
          <Button
            ref={(node) => {
              actionRefs.current[(incorrectCount > 0 ? 1 : 0) + (clusterId ? 1 : 0) + 1] = node;
            }}
            variant="outline"
            className="h-12 w-full rounded-xl text-lg"
            onClick={() => navigate("/")}
          >
            Back to Dashboard
          </Button>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Next recommendation:{" "}
          {recommendedMode === QuizModeEnum.WEAK_WORDS
            ? "focus on weak words"
            : recommendedMode === QuizModeEnum.NEW_WORDS
              ? "continue with new words"
              : "continue daily review"}
          .
        </p>
      </div>
    </div>
  );
}
