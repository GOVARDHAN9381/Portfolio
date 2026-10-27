import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const monoHud = JetBrains_Mono({
  variable: "--font-mono-hud",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AARAV MEHTA — Creative Developer",
  description:
    "Portfolio of Aarav Mehta — a creative developer engineering cinematic web experiences with design, motion and code.",
  keywords: [
    "portfolio",
    "creative developer",
    "frontend engineer",
    "web experience",
    "Next.js",
    "motion design",
  ],
  authors: [{ name: "Aarav Mehta" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${monoHud.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
