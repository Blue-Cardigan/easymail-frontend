// This is the root layout component for your Next.js app.
// Learn more: https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts#root-layout-required
import { Inter } from 'next/font/google'
import { cn } from '@/lib/utils'
import Head from 'next/head'
import '@/app/globals.css'

const fontHeading = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

const fontBody = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata = {
  title: 'EasyMail', 
  description: 'Enhancing effective campaigning with A.I.', 
}


export default function Layout({ children }) {
  return (
    <html lang="en">
      <Head>
        <title>{metadata.title}</title>
        <link rel="icon" href="/logos/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/logos/icon.svg" />
        <link rel="shortcut icon" href="/logos/icon.svg" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logos/icon.svg" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logos/icon.svg" />
        <link rel="icon" type="image/png" sizes="48x48" href="/logos/icon.svg" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logos/icon.svg" />
        <link rel="apple-touch-icon" sizes="192x192" href="/logos/icon.svg" />
      </Head>
      <body 
        className={cn(
          'antialiased',
          fontHeading.variable,
          fontBody.variable
        )}
      >
        {children}
      </body>
    </html>
  )
}