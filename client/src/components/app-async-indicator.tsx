import { useEffect, useState } from "react";
import { useIsFetching, useIsMutating } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

export function AppAsyncIndicator() {
  const fetchingCount = useIsFetching();
  const mutatingCount = useIsMutating();
  const activeCount = fetchingCount + mutatingCount;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (activeCount > 0) {
      setVisible(true);
      return;
    }

    const timeout = window.setTimeout(() => {
      setVisible(false);
    }, 120);

    return () => window.clearTimeout(timeout);
  }, [activeCount]);

  if (!visible) {
    return null;
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-1 overflow-hidden bg-primary/10">
        <div className="async-progress-bar h-full w-1/3 rounded-full bg-primary" />
      </div>
      <div className="pointer-events-none fixed right-3 top-3 z-[100] rounded-full border border-border/70 bg-background/95 px-3 py-1.5 shadow-lg backdrop-blur">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-foreground">
          <Loader2 className="size-3.5 animate-spin" />
          Syncing
        </span>
      </div>
    </>
  );
}
