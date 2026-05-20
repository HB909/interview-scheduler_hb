import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '면접 일정 조율',
  description: 'Aents 면접 일정 조율 시스템',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
}
