import type { Metadata } from "next";
import { Noto_Sans_TC, Montserrat } from "next/font/google";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-tc",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "SHU OBS TOOL",
  description: "Made by SHU",
  other: { robots: "noindex", googlebot: "noindex" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${notoSansTC.className} ${montserrat.className} sans`}
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
