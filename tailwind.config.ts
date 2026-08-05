import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F8F8F6",
        linen: "#F4F0E9",
        mist: "#E8E8E4",
        greige: "#D9D6CF",
        line: "#D2D2CD",
        sand: "#D6C5AD",
        clay: "#8F725D",
        umber: "#5A5049",
        graphite: "#343434",
        muted: "#6F6F6B",
        gold: "#A88F58",
        sage: "#8F9A91",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["Georgia", "Cambria", "Times New Roman", "serif"],
      },
      boxShadow: {
        soft: "0 18px 60px rgb(52 52 52 / 0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
