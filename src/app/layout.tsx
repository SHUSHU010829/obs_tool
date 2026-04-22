import './globals.css'
import type { Metadata } from 'next'
import { Noto_Sans_TC, Montserrat, Titan_One, Poppins, Space_Mono } from 'next/font/google'
import React from 'react'
import { Toaster } from 'sonner'

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-noto-sans-tc',
})

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-montserrat',
})

const titanOne = Titan_One({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-titan-one',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
})

const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'SHU OBS TOOL',
  description: 'Made by SHU',
  other: { robots: 'noindex', googlebot: 'noindex' },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang='en'>
      <body
        className={`${notoSansTC.variable} ${montserrat.variable} ${titanOne.variable} ${poppins.variable} ${spaceMono.variable} sans `}
        suppressHydrationWarning={true}
      >
        {children}
        <Toaster
          position='bottom-right'
          theme='dark'
          duration={3000}
          toastOptions={{ className: 'admin-toast' }}
        />
      </body>
    </html>
  )
}
