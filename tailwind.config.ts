import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        surface: {
          950: "#050816",
          900: "#0b1120",
          800: "#111827",
          700: "#1f2937",
        },
        accent: {
          cyan: "#22d3ee",
          blue: "#3b82f6",
          emerald: "#10b981",
          amber: "#f59e0b",
          rose: "#fb7185",
          violet: "#8b5cf6",
        },
      },
      boxShadow: {
        glow: "0 10px 40px rgba(34, 211, 238, 0.12)",
      },
      backgroundImage: {
        "hero-grid":
          "radial-gradient(circle at top, rgba(34,211,238,0.16), transparent 40%), radial-gradient(circle at right, rgba(59,130,246,0.18), transparent 25%)",
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        pulseSoft: "pulseSoft 2.6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.72" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
