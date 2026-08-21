'use client';

import { usePathname, useRouter } from 'next/navigation';

const PAGINAS = [
  { chave: 'animais', rotulo: 'Animais' },
  { chave: 'adotantes', rotulo: 'Adotantes' },
  { chave: 'cidades', rotulo: 'Cidades' },
  { chave: 'especies', rotulo: 'Espécies' },
  { chave: 'racas', rotulo: 'Raças' },
];

export default function Toolbar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="toolbar bg-white">
      <div className="toolbar-links">
        {PAGINAS.map((p) => (
          <button
            key={p.chave}
            type="button"
            className={pathname?.startsWith(`/${p.chave}`) ? 'ativo' : ''}
            onClick={() => router.push(`/${p.chave}`)}
          >
            {p.rotulo}
          </button>
        ))}
      </div>
    </nav>
  );
}
