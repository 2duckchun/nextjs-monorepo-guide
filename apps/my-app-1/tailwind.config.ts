import type { Config } from "tailwindcss";

const config: Config = {
  presets: [
    require("@repo/tailwind-config/shadcn"),
    require("@repo/tailwind-config/extends-shared-colors"),
  ],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Graphik", "sans-serif"],
      },
    },
  },
};

export default config;
