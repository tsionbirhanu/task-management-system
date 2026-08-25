import { IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";

/**
 * Three faces, three jobs:
 *   display — page titles, column headers, ticket numbers. Used with restraint.
 *   body    — everything else.
 *   mono    — IDs, dates, countdowns, tabular metadata. Load-bearing identity.
 */
export const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-body",
  display: "swap",
});

export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});
