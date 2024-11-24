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
        // based on this color palette https://colorhunt.co/palette/640d6bb51b75e65c19f8d082
        dark: {
          colors: {
            background: "#3C064D",
            default: {
              DEFAULT: "#640D6B",
              900: "#F7CCEC",
              800: "#F09BE1",
              700: "#D263C8",
              600: "#A638A5",
              500: "#640D6B",
              400: "#4F095C",
              300: "#3C064D",
              200: "#2B043E",
              100: "#1F0233",
            },
            content1: "#4F095C",
            content2: "#640D6B",
            content3: "#A638A5",
            content4: "#D263C8",
            primary: {
              DEFAULT: "#E65C19",
              100: "#FDEBD0",
              200: "#FCD1A2",
              300: "#F7AF73",
              400: "#F08E4F",
              500: "#E65C19",
              600: "#C54112",
              700: "#A52A0C",
              800: "#851807",
              900: "#6E0B04",
            },
            secondary: {
              DEFAULT: "#B51B75",
              100: "#FBD0D8",
              200: "#F7A3BB",
              300: "#E8719F",
              400: "#D24C8D",
              500: "#B51B75",
              600: "#9B1370",
              700: "#820D69",
              800: "#68085D",
              900: "#560555",
            },
            success: {
              DEFAULT: "#71D619",
              100: "#EEFCD0",
              200: "#D9FAA2",
              300: "#BBF272",
              400: "#9CE64D",
              500: "#71D619",
              600: "#56B812",
              700: "#3F9A0C",
              800: "#2B7C07",
              900: "#1D6604",
            },
            warning: {
              DEFAULT: "#FCC605",
              100: "#FEF8CC",
              200: "#FEEF9A",
              300: "#FEE468",
              400: "#FDD843",
              500: "#FCC605",
              600: "#D8A503",
              700: "#B58602",
              800: "#926801",
              900: "#785300",
            },
            danger: {
              100: "#FEDCD8",
              200: "#FEB2B1",
              300: "#FD8B95",
              400: "#FB6D88",
              500: "#F93E73",
              600: "#D62D6D",
              700: "#B31F66",
              800: "#90135B",
              900: "#770B54",
            },
          },
        },
      },
    }),
  ],
};
