import { Navigation } from '@/components/navigation';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
  title: 'Festa de Aniversário 50 anos - Frison Convenience',
  description: 'Sistema de lista de presença para a festa de aniversário de 50 anos da Frison Convenience',
  manifest: '/manifest.json',
  themeColor: '#E21C2A',
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
    <html lang="pt-BR" className="light">
      <body>
        <header className="bg-white border-b border-border shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-4">
                <Image
                  src="/logo.svg"
                  alt="Frison Convenience"
                  width={180}
                  height={40}
                  className="h-10 w-auto"
                  priority
                />
                <div className="hidden sm:block">
                  <h1 className="text-xl font-bold text-foreground">
                    Festa de Aniversário
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    50 anos de Frison Convenience
                  </p>
                </div>
              </Link>
              <Navigation />
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

