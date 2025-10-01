import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WeightedWins - NFL Rankings",
  description: "NFL team rankings using weighted wins methodology",
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
