/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import "../client/src/index.css";

export const metadata: Metadata = {
  title: "Learn Language",
  description: "Language learning with spaced repetition and review workflows",
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
