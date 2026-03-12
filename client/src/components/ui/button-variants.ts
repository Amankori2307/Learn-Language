import { cva, type VariantProps } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0" +
    " hover-elevate active-elevate-2",
  {
    variants: {
      variant: {
        default:
          "border border-primary-border bg-primary text-primary-foreground [box-shadow:var(--shadow-xs)] hover:[box-shadow:var(--shadow-accent)]",
        destructive:
          "border border-destructive-border bg-destructive text-destructive-foreground [box-shadow:var(--shadow-xs)] hover:[box-shadow:var(--shadow-sm)]",
        outline:
          "border bg-background text-foreground [border-color:var(--button-outline)] [box-shadow:var(--shadow-xs)] hover:bg-secondary/60 active:[box-shadow:var(--shadow-xs)]",
        secondary:
          "border border-secondary-border bg-secondary text-secondary-foreground [box-shadow:var(--shadow-xs)] hover:[box-shadow:var(--shadow-sm)]",
        ghost: "border border-transparent",
      },
      size: {
        default: "min-h-9 px-4 py-2",
        sm: "min-h-8 rounded-[var(--radius-sm)] px-3 text-xs",
        lg: "min-h-10 rounded-[var(--radius-sm)] px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
