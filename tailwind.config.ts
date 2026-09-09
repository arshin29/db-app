import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        apple: {
          blue: "#0066cc",
          "blue-focus": "#0071e3",
          "blue-dark": "#2997ff",
          ink: "#1d1d1f",
          "ink-muted": "#7a7a7a",
          "ink-subtle": "#333333",
          canvas: "#ffffff",
          parchment: "#f5f5f7",
          pearl: "#fafafc",
          hairline: "#e0e0e0",
          divider: "#f0f0f0",
          tile: "#272729",
          "tile-2": "#2a2a2c",
          black: "#000000",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          '"SF Pro Text"',
          '"SF Pro Display"',
          '"Segoe UI"',
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
      borderRadius: {
        xs: "5px",
        sm: "8px",
        md: "11px",
        lg: "18px",
        pill: "9999px",
      },
      boxShadow: {
        "apple-product": "rgba(0, 0, 0, 0.15) 0px 4px 24px 0px",
        "apple-card": "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [],
} satisfies Config;
