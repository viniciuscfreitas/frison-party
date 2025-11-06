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
        <header className="bg-white border-b shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-3">
                <Image
                  src="/logo.svg"
                  alt="Frison"
                  width={150}
                  height={35}
                  className="h-8 w-auto"
                  priority
                />
                <span className="hidden sm:block text-sm text-gray-600">50 anos</span>
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

