import type { Config } from "tailwindcss";

/**
 * Every color resolves to an rgb() channel triplet so Tailwind's opacity
 * modifiers keep working (e.g. `bg-amber/10`, `border-line/60`). The canonical
 * hex values live in app/globals.css — keep the two in sync.
 *
 * Note: `slate` and `amber` deliberately shadow Tailwind's built-in palettes.
 * `text-slate-500` no longer exists, which is the point: a default gray or blue
 * slipping into the UI shows up as a class that simply does not render.
 */
const token = (name: string) => `rgb(var(--${name}-rgb) / <alpha-value>)`;

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: token("paper"),
        ink: token("ink"),
        slate: token("slate"),
        amber: token("amber"),
        line: token("line"),
        done: token("done"),
        danger: token("danger"),
        progress: token("progress"),
      },
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      boxShadow: {
        // Resting ticket: a hairline lift, barely there.
        ticket: "0 1px 2px 0 rgb(var(--ink-rgb) / 0.04)",
        // Ticket picked up mid-drag.
        lift: "0 12px 24px -6px rgb(var(--ink-rgb) / 0.18), 0 4px 8px -4px rgb(var(--ink-rgb) / 0.10)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};
export default config;
