import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/cart-context";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBar } from "@/components/AnnouncementBar";

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
        <CartProvider>
          <AnnouncementBar />
          <Header />
          {children}
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
