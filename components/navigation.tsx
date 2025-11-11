'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4">
      <Link
        href="/"
        className={pathname === '/' ? 'text-red-600 font-semibold' : 'text-gray-600 hover:text-red-600'}
      >
        Lista
      </Link>
      <Link
        href="/relatorios"
        className={pathname === '/relatorios' ? 'text-red-600 font-semibold' : 'text-gray-600 hover:text-red-600'}
      >
        Relatórios
      </Link>
    </nav>
  );
}

