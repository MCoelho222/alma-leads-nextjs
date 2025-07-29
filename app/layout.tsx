import '../styles/globals.css'

export const metadata = {
  title: 'Alma Leads',
  description: 'Lead capture system',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* <head>
        <link rel="icon" href="data:," />
      </head> */}
      <body>{children}</body>
    </html>
  )
}
