import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PendingButtonProps = ButtonProps & {
  pending?: boolean;
  pendingLabel?: string;
};

export const PendingButton = forwardRef<HTMLButtonElement, PendingButtonProps>(
  ({ children, className, pending = false, pendingLabel, disabled, ...props }, ref) => (
    <Button
      ref={ref}
      className={cn("inline-flex items-center gap-2", className)}
      disabled={disabled || pending}
      {...props}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      <span>{pending ? pendingLabel ?? children : children}</span>
    </Button>
  ),
);

PendingButton.displayName = "PendingButton";
