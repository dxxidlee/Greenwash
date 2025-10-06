import type { Metadata } from 'next'
import './globals.css'
import '../styles/noise-surface.css'

export const metadata: Metadata = {
  title: 'Greenwash',
  description: 'Government Compliance Management System - Year 2037',
  keywords: ['compliance', 'government', '2037', 'dystopian'],
  authors: [{ name: 'Ministry of Environmental Compliance' }],
  robots: 'noindex, nofollow', // Dystopian theme - hidden from search
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}
