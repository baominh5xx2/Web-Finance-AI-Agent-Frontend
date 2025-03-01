import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Sidebar from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finance Dashboard',
  description: 'A comprehensive finance dashboard for market analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50`}>
        <Sidebar />
        <div className="p-4 sm:p-6 md:ml-64 mt-4">
          {children}
        </div>
      </body>
    </html>
  )
}
