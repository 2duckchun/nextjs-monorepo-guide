import type { Config } from "tailwindcss";

const config: Config = {
  presets: [
    require("@repo/tailwind-config/extends-shared-colors"),
    require("@repo/tailwind-config/shadcn"),
  ],
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx,mdx}",
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
