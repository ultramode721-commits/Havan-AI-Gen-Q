import type { Metadata } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
export const metadata: Metadata = {
  title: "Havan AI — Your academic co-pilot",
  description:
    "Havan Academy academic assistant for Ethiopian higher education, local knowledge, and UAT practice.",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
