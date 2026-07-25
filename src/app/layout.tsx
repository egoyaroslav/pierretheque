import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const displayFont = Instrument_Serif({
  variable: "--font-display-src",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const sansFont = Inter({
  variable: "--font-sans-src",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "PIERRETHEQUE — Archive Japanese Designer Wear",
  description:
    "Curated archive Japanese designer wear — IF SIX WAS NINE, L.G.B., BEAUTIFUL:BEAST and more. Authenticated pieces, sold one at a time.",
  other: {
    google: "notranslate",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${sansFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
