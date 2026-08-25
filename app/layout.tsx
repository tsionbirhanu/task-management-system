import type { Metadata, Viewport } from "next";

import { body, display, mono } from "@/app/fonts";
import { Providers } from "@/app/providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Workbench",
  description: "Track every task as a numbered work order.",
};

export const viewport: Viewport = {
  themeColor: "#faf9f5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <body className="min-h-screen bg-paper font-body text-ink">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
