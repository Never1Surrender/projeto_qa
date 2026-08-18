const PAGINAS = [
  { chave: 'animais', rotulo: 'Animais', icone: '🐾' },
  { chave: 'adotantes', rotulo: 'Adotantes', icone: '🧑‍🤝‍🧑' },
  { chave: 'cidades', rotulo: 'Cidades', icone: '📍' },
  { chave: 'especies', rotulo: 'Espécies', icone: '🏷️' },
  { chave: 'racas', rotulo: 'Raças', icone: '🧬' },
];

export default function Toolbar({ paginaAtiva, onNavegar }) {
  return (
    <nav className="toolbar sticky top-4 z-10 backdrop-blur bg-white/90">
      <div className="toolbar-titulo">
        <span className="toolbar-logo bg-gradient-to-br from-primary to-secondary text-white shadow-sm">🐾</span>
        <div className="flex flex-col leading-tight">
          <span>Adoção de Animais</span>
          <span className="text-xs font-semibold text-ink-muted normal-case tracking-normal">
            encontre um novo lar 🏡
          </span>
        </div>
      </div>
      <div className="toolbar-links">
        {PAGINAS.map((p) => (
          <button
            key={p.chave}
            className={paginaAtiva === p.chave ? 'ativo' : ''}
            onClick={() => onNavegar(p.chave)}
          >
            {p.icone} {p.rotulo}
          </button>
        ))}
      </div>
    </nav>
  );
}
