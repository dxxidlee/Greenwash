import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'HueScan HUE-37 - Green Compliance Scanner',
  description: 'Real-time green compliance detection and analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-black text-white font-mono">
        {children}
      </body>
    </html>
  )
}
