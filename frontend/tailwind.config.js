import { nextui } from "@nextui-org/theme";

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)"],
        mono: ["var(--font-mono)"],
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      themes: {
        light: {
          colors: {
            foreground: "#401f0d",
            background: {
              DEFAULT: "#fdf9f6",
              foreground: "#401f0d",
            },
            content1: "#fdf9f6",
            content2: "#fcf3ee",
            content3: "#f7e3d9",
            content4: "#f3d4c3",
            default: {
              50: "#fdf9f6",
              100: "#fcf3ee",
              200: "#f7e3d9",
              300: "#f3d4c3",
              400: "#f0c8b2",
              500: "#e7a988",
              600: "#e19166",
              700: "#c86028",
              800: "#88411b",
              900: "#401f0d",
              DEFAULT: "#f7e3d9",
              foreground: "#401f0d",
            },
            divider: "rgba(175, 170, 151, 0.3)",
            focus: "#E65D19",
            overlay: "#FAF3D9",
            primary: {
              50: "#fef8f5",
              100: "#fef2ec",
              200: "#fce1d4",
              300: "#fbd1bc",
              400: "#fac3a8",
              500: "#f7a278",
              600: "#f58851",
              700: "#e3540d",
              800: "#9a3909",
              900: "#481b04",
              DEFAULT: "#E65D19",
            },
            secondary: {
              50: "#fcfbf7",
              100: "#faf6f0",
              200: "#f3ecdd",
              300: "#ece1ca",
              400: "#e7d8bb",
              500: "#dac395",
              600: "#cfb277",
              700: "#b18b3e",
              800: "#795f2a",
              900: "#392c14",
              DEFAULT: "#F7D081",
            },
          },
        },
      },
    }),
  ],
};
