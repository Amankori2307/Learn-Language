import Link from "next/link";
import type { ReactNode } from "react";
import { PublicBreadcrumbs, PublicPageFooter } from "./public-page-seo";

type PublicCrumb = {
  label: string;
  href: string;
};

type PublicPageShellProps = {
  children: ReactNode;
};

type PublicSectionProps = {
  children: ReactNode;
  className?: string;
  width?: "content" | "wide";
};

type PublicIntroProps = {
  breadcrumbs: readonly PublicCrumb[];
  eyebrow: string;
  title: string;
  description: string;
  descriptionClassName?: string;
};

type PublicActionLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
};

function joinClasses(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function PublicPageShell({ children }: PublicPageShellProps) {
  return (
    <main className="min-h-screen min-h-dvh bg-background text-foreground">
      {children}
      <PublicPageFooter />
    </main>
  );
}

export function PublicSection({ children, className, width = "wide" }: PublicSectionProps) {
  return (
    <section
      className={joinClasses(
        "mx-auto w-full px-6 sm:px-8",
        width === "wide" ? "max-w-6xl" : "max-w-5xl",
        className,
      )}
    >
      {children}
    </section>
  );
}

export function PublicIntro({
  breadcrumbs,
  eyebrow,
  title,
  description,
  descriptionClassName,
}: PublicIntroProps) {
  return (
    <>
      <PublicBreadcrumbs items={breadcrumbs} />
      <div className="max-w-3xl space-y-5">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
        <p className={joinClasses("text-base leading-7 text-muted-foreground sm:text-lg", descriptionClassName)}>
          {description}
        </p>
      </div>
    </>
  );
}

export function PublicActionRow({ children }: { children: ReactNode }) {
  return <div className="mt-12 flex flex-col gap-3 sm:flex-row">{children}</div>;
}

export function PublicActionLink({
  href,
  children,
  variant = "secondary",
}: PublicActionLinkProps) {
  return (
    <Link
      href={href}
      className={joinClasses(
        "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-medium transition-colors",
        variant === "primary"
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "border border-border bg-background text-foreground hover:bg-muted",
      )}
    >
      {children}
    </Link>
  );
}

export function PublicCardGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={joinClasses("mt-12 grid gap-5 md:grid-cols-2", className)}>{children}</div>;
}

export function PublicCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <article className={joinClasses("rounded-3xl border border-border/60 bg-card p-6 shadow-sm", className)}>
      {children}
    </article>
  );
}

export function PublicSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={joinClasses("rounded-3xl border border-border/60 bg-card p-8 shadow-sm", className)}>
      {children}
    </div>
  );
}
