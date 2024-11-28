import {
  Fira_Code as FontMono,
  Inter as FontSans,
  Shrikhand,
} from "next/font/google";

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const shrikhand = Shrikhand({
  weight: "400",
  subsets: ["latin"],
});
