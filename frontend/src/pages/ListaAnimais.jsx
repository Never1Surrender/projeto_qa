const ROTULOS_ESPECIE = {
  cachorro: 'Cachorro',
  gato: 'Gato',
  ave: 'Ave',
  coelho: 'Coelho',
  reptil: 'Réptil',
  outro: 'Outro',
};

export default function ListaAnimais({
  animais,
  filtroStatus,
  onFiltroStatusChange,
  filtroEspecie,
  onFiltroEspecieChange,
  onEditar,
  onExcluir,
  onAdotar,
}) {
  return (
    <div>
      <div className="filtros">
        <label>
          Filtrar por status:
          <select value={filtroStatus} onChange={(e) => onFiltroStatusChange(e.target.value)}>
            <option value="">Todos</option>
            <option value="disponivel">Disponível</option>
            <option value="adotado">Adotado</option>
          </select>
        </label>

        <label>
          Filtrar por espécie:
          <select value={filtroEspecie} onChange={(e) => onFiltroEspecieChange(e.target.value)}>
            <option value="">Todas</option>
            {Object.entries(ROTULOS_ESPECIE).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>
      </div>

      {animais.length === 0 && <p>Nenhum animal cadastrado.</p>}

      <table className="tabela-animais">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Espécie</th>
            <th>Raça</th>
            <th>Idade</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {animais.map((animal) => (
            <tr key={animal.id}>
              <td>{animal.nome}</td>
              <td>{ROTULOS_ESPECIE[animal.especie] || animal.especie}</td>
              <td>{animal.raca || '-'}</td>
              <td>{animal.idade != null ? `${animal.idade} ano${animal.idade === 1 ? '' : 's'}` : '-'}</td>
              <td>
                <span className={`badge badge-${animal.status}`}>{animal.status}</span>
              </td>
              <td className="acoes">
                {animal.status === 'disponivel' && (
                  <button onClick={() => onAdotar(animal)}>Adotar</button>
                )}
                <button onClick={() => onEditar(animal)}>Editar</button>
                <button className="btn-perigo" onClick={() => onExcluir(animal)}>
                  Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
