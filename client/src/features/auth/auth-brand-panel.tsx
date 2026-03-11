import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";

export function AuthBrandPanel() {
  return (
    <div className="relative hidden overflow-hidden bg-primary p-12 text-primary-foreground lg:flex lg:flex-col lg:items-center lg:justify-center">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1588661803731-0df0b8754245?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary" />

      <div className="relative z-10 max-w-lg text-center">
        <h1 className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 whitespace-nowrap text-9xl font-originalScript opacity-10">
          {APP_BRAND_NAME}
        </h1>

        <h2 className="mb-6 text-5xl font-bold tracking-tight">Master languages the natural way.</h2>
        <p className="text-lg leading-relaxed opacity-90">
          Learn vocabulary through semantic clusters, spaced repetition, and real-world examples.
          {` ${APP_BRAND_NAME} helps you build fluency step by step.`}
        </p>
      </div>
    </div>
  );
}
