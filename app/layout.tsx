import React from 'react'
import { Providers } from './providers'
import './globals.css'
import type { Metadata } from 'next/types'

export const metadata: Metadata = {
  title: '媒体数据',
  description: '媒体数据管理系统',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh" suppressHydrationWarning>
      <head />
      <body className='bg-white'>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
