import Link from "next/link";
import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";
import { APP_SITE_URL } from "@shared/domain/constants/seo";

interface IPublicCrumb {
  label: string;
  href: string;
}

const PUBLIC_DISCOVERY_LINKS: readonly IPublicCrumb[] = [
  { label: "Home", href: "/" },
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Learn Telugu", href: "/languages/telugu" },
  { label: "Topics", href: "/topics" },
  { label: "Sign In", href: "/auth" },
];

export function PublicBreadcrumbs({ items }: { items: readonly IPublicCrumb[] }) {
  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      item: `${APP_SITE_URL}${item.href}`,
    })),
  };

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {items.map((item, index) => (
          <span key={item.href} className="inline-flex items-center gap-2">
            {index > 0 ? <span aria-hidden="true">/</span> : null}
            {index === items.length - 1 ? (
              <span className="text-foreground">{item.label}</span>
            ) : (
              <Link href={item.href} className="transition-colors hover:text-foreground">
                {item.label}
              </Link>
            )}
          </span>
        ))}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }}
      />
    </>
  );
}

export function PublicPageFooter() {
  return (
    <footer className="border-t border-border/60 bg-card/30">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-md">
          <h2 className="text-lg font-semibold">{APP_BRAND_NAME}</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Public entry pages for language-learning discovery, product context, and sign-in.
          </p>
        </div>
        <nav aria-label="Public site links" className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          {PUBLIC_DISCOVERY_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
