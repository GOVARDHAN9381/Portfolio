import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const monoHud = JetBrains_Mono({
  variable: "--font-mono-hud",
  subsets: ["latin"],
});

const serifAccent = Instrument_Serif({
  variable: "--font-serif-accent",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GOVARDHAN REDDY — Aspiring Software Developer",
  description:
    "Portfolio of Narapareddy Govardhan Reddy — CSE student and aspiring software developer building AI systems, security tools and modern web applications. Class of 2028, Saveetha School of Engineering.",
  keywords: [
    "Govardhan Reddy",
    "portfolio",
    "CSE student",
    "AI developer",
    "Java DSA",
    "FastAPI",
    "CrewAI",
    "cybersecurity",
  ],
  authors: [{ name: "Narapareddy Govardhan Reddy" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${monoHud.variable} ${serifAccent.variable} antialiased bg-background text-foreground`}
      >
        {children}
      </body>
    </html>
  );
}
