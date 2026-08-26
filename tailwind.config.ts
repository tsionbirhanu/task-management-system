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
        ticket: "0 10px 30px -18px rgb(var(--ink-rgb) / 0.26), 0 1px 2px rgb(var(--ink-rgb) / 0.06)",
        lift: "0 22px 44px -18px rgb(var(--progress-rgb) / 0.42), 0 10px 18px -12px rgb(var(--ink-rgb) / 0.20)",
        panel: "0 18px 50px -32px rgb(var(--ink-rgb) / 0.35)",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};
export default config;
