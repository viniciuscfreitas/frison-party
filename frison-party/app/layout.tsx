import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Lista de Convidados - Festa Frison',
  description: 'Sistema de check-in para convidados',
  manifest: '/manifest.json',
  themeColor: '#000000',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Festa Frison',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}

