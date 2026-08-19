const PAGINAS = [
  { chave: 'animais', rotulo: 'Animais' },
  { chave: 'adotantes', rotulo: 'Adotantes' },
  { chave: 'cidades', rotulo: 'Cidades' },
  { chave: 'especies', rotulo: 'Espécies' },
  { chave: 'racas', rotulo: 'Raças' },
];

export default function Toolbar({ paginaAtiva, onNavegar }) {
  return (
    <nav className="toolbar bg-white">
      <div className="toolbar-links">
        {PAGINAS.map((p) => (
          <button
            key={p.chave}
            className={paginaAtiva === p.chave ? 'ativo' : ''}
            onClick={() => onNavegar(p.chave)}
          >
            {p.rotulo}
          </button>
        ))}
      </div>
    </nav>
  );
}
