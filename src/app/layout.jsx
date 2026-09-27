import './globals.css'

export const metadata = {
  title: 'LembreMed',
  description: 'Organização e lembretes de medicamentos.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
