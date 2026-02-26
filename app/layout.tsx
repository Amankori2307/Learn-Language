/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import "../client/src/index.css";
import { APP_BRAND_NAME } from "@shared/domain/constants/app-brand";

export const metadata: Metadata = {
  title: APP_BRAND_NAME,
  description: `${APP_BRAND_NAME}: language learning with spaced repetition and review workflows`,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
