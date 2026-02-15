import type { Config } from "tailwindcss";

const config: Config = {
  content: [
  "./frontend/src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  "./frontend/src/components/**/*.{js,ts,jsx,tsx,mdx}",
  "./frontend/src/app/**/*.{js,ts,jsx,tsx,mdx}",
],
  theme: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'), // 核心：激活 Markdown 样式支持
  ],
};
export default config;