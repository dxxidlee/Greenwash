import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BreakRoom BRK-37 - Greenwash VR Experience',
  description: 'Immersive VR compliance training environment',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-mono overflow-hidden">
        {children}
      </body>
    </html>
  )
}
