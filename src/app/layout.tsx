import './globals.css'

export const metadata = {
  title: 'Sudoku App',
  description: 'by CRSylar',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
