export default function Paginacao({ pagina, totalPaginas, total, onMudarPagina }) {
  if (totalPaginas <= 1) return null;

  return (
    <div className="paginacao">
      <span className="paginacao-info">
        Página {pagina} de {totalPaginas} · {total} {total === 1 ? 'registro' : 'registros'}
      </span>
      <div className="paginacao-botoes">
        <button type="button" disabled={pagina <= 1} onClick={() => onMudarPagina(pagina - 1)}>
          ← Anterior
        </button>
        <button type="button" disabled={pagina >= totalPaginas} onClick={() => onMudarPagina(pagina + 1)}>
          Próxima →
        </button>
      </div>
    </div>
  );
}
