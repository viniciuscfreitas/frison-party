'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6">
      <Link
        href="/"
        className={`text-sm font-medium transition-colors ${
          pathname === '/'
            ? 'text-primary border-b-2 border-primary pb-1'
            : 'text-foreground hover:text-primary'
        }`}
      >
        Lista de Presença
      </Link>
      <Link
        href="/relatorios"
        className={`text-sm font-medium transition-colors ${
          pathname === '/relatorios'
            ? 'text-primary border-b-2 border-primary pb-1'
            : 'text-foreground hover:text-primary'
        }`}
      >
        Relatórios
      </Link>
    </nav>
  );
}

