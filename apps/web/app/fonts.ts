import {
  DM_Sans,
  Geist,
  Instrument_Serif,
  Inter,
  JetBrains_Mono,
  Lora,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  weight: "400",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const allFontVariables = [
  geist.variable,
  inter.variable,
  dmSans.variable,
  spaceGrotesk.variable,
  lora.variable,
  playfair.variable,
  instrumentSerif.variable,
  jetbrainsMono.variable,
].join(" ");
