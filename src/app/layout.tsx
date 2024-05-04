import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import "./globals.css";
export const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto-sans-tc",
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
      <body className={notoSansTC.className} suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
