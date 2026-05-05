import "./globals.css";
import type { Metadata } from "next";

const siteUrl = "https://dumichki.bg";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Думички",
    template: "%s | Думички",
  },

  description:
    "Познай думата за деня! Думички е ежедневна българска игра с думи, вдъхновена от Wordle. Нова дума всеки ден.",

  keywords: [
    "Думички",
    "игра с думи",
    "българска игра с думи",
    "дума за деня",
    "wordle български",
    "български wordle",
    "ежедневна игра",
    "познай думата",
  ],

  authors: [{ name: "Любослав Оведенски" }],
  creator: "Любослав Оведенски",
  publisher: "Любослав Оведенски",

  applicationName: "Думички",

  openGraph: {
    title: "Думички – ежедневна игра с думи",
    description:
      "Познай думата за деня в българска игра, вдъхновена от Wordle.",
    url: siteUrl,
    siteName: "Думички",
    locale: "bg_BG",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Думички",
    description: "Ежедневна игра с думи на български език.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="bg">
      <body>{children}</body>
    </html>
  );
}