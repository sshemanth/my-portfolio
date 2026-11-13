import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { site } from "@/content/site";
import { asset } from "@/lib/asset";
import "./globals.css";

const display = localFont({
  src: [
    { path: "./fonts/InstrumentSerif-Regular.woff2", weight: "400", style: "normal" },
    { path: "./fonts/InstrumentSerif-Italic.woff2", weight: "400", style: "italic" },
  ],
  variable: "--font-display",
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

export const metadata: Metadata = {
  ...(site.url ? { metadataBase: new URL(site.url) } : {}),
  title: site.title,
  description: site.description,
  authors: [{ name: site.name }],
  openGraph: {
    type: "profile",
    title: site.title,
    description: site.description,
    images: [{ url: asset("og.jpg"), width: 1200, height: 630, alt: "Sri Sai Hemanth Bollepalli, medical AI researcher, over a neural network of glass nodes" }],
  },
  twitter: { card: "summary_large_image", title: site.title, description: site.description, images: [asset("og.jpg")] },
  icons: { icon: asset("icon.svg") },
};

export const viewport: Viewport = { themeColor: "#fafafd", colorScheme: "light" };

/**
 * Runs before first paint. Decides whether scroll-driven motion is allowed, so the pinned hero
 * layout is in place before hydration (no jump, correct scroll restoration on reload).
 * If the app script never takes over, a timer falls back to the static, fully readable layout.
 */
const motionGate = `(function(){var d=document.documentElement;var r=matchMedia('(prefers-reduced-motion: reduce)');d.dataset.motion=r.matches?'reduce':'full';setTimeout(function(){if(!d.dataset.live)d.dataset.motion='reduce'},4000)})()`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionGate }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
