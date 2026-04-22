import type { Config } from "tailwindcss";

/** Referência do design system; tokens principais estão em app/globals.css (@theme) para Tailwind v4. */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
};

export default config;
