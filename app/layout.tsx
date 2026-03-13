/* eslint-disable react-refresh/only-export-components */
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "../client/src/index.css";
import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";
import { AppThemeProvider } from "../client/src/theme/app-theme-provider";
import {
  APP_DEFAULT_DESCRIPTION,
  APP_GOOGLE_TAG_MANAGER_ID,
  APP_KEYWORDS,
  APP_SITE_URL,
} from "@shared/domain/constants/seo";

export const metadata: Metadata = {
  metadataBase: new URL(APP_SITE_URL),
  title: {
    default: APP_BRAND_NAME,
    template: `%s | ${APP_BRAND_NAME}`,
  },
  description: APP_DEFAULT_DESCRIPTION,
  keywords: APP_KEYWORDS,
  applicationName: APP_BRAND_NAME,
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "android-chrome",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
  openGraph: {
    type: "website",
    url: APP_SITE_URL,
    title: APP_BRAND_NAME,
    description: APP_DEFAULT_DESCRIPTION,
    siteName: APP_BRAND_NAME,
    locale: "en_US",
    images: [
      {
        url: "/android-chrome-512x512.png",
        width: 512,
        height: 512,
        alt: `${APP_BRAND_NAME} icon`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: APP_BRAND_NAME,
    description: APP_DEFAULT_DESCRIPTION,
    images: ["/android-chrome-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  category: "education",
};

export const viewport: Viewport = {
  themeColor: "hsl(217 91% 60%)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const websiteStructuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: APP_BRAND_NAME,
    url: APP_SITE_URL,
    description: APP_DEFAULT_DESCRIPTION,
    inLanguage: "en",
  };

  const softwareStructuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_BRAND_NAME,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    url: APP_SITE_URL,
    description: APP_DEFAULT_DESCRIPTION,
  };

  const organizationStructuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: APP_BRAND_NAME,
    url: APP_SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${APP_SITE_URL}/brand-logo.png`,
      width: 500,
      height: 500,
    },
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-background text-foreground">
        <AppThemeProvider>
          {APP_GOOGLE_TAG_MANAGER_ID ? (
            <>
              <Script
                id="google-tag-manager"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                  __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${APP_GOOGLE_TAG_MANAGER_ID}');`,
                }}
              />
              <noscript>
                <iframe
                  src={`https://www.googletagmanager.com/ns.html?id=${APP_GOOGLE_TAG_MANAGER_ID}`}
                  height="0"
                  width="0"
                  style={{ display: "none", visibility: "hidden" }}
                />
              </noscript>
            </>
          ) : null}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteStructuredData) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareStructuredData) }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationStructuredData) }}
          />
          {children}
        </AppThemeProvider>
      </body>
    </html>
  );
}
