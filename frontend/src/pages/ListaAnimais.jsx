import { IconeEditar, IconeExcluir } from '../components/Icones';
import Combobox from '../components/Combobox';

const STATUS_INFO = {
  disponivel: { rotulo: 'Disponível', icone: '💚' },
  adotado: { rotulo: 'Adotado', icone: '🏠' },
};

const ESPECIE_EMOJI = {
  Cachorro: '🐶',
  Gato: '🐱',
  Ave: '🐦',
  Coelho: '🐰',
  Réptil: '🦎',
  Peixe: '🐠',
  Outro: '🐾',
};

export default function ListaAnimais({
  animais,
  cidades,
  especies,
  filtroStatus,
  onFiltroStatusChange,
  filtroEspecie,
  onFiltroEspecieChange,
  filtroCidade,
  onFiltroCidadeChange,
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
          <Combobox
            options={[{ value: '', label: 'Todas' }, ...especies.map((esp) => ({ value: esp.id, label: esp.nome }))]}
            value={filtroEspecie}
            onChange={onFiltroEspecieChange}
            placeholder="Digite ou selecione..."
          />
        </label>

        <label>
          Filtrar por cidade:
          <Combobox
            options={[
              { value: '', label: 'Todas' },
              ...cidades.map((c) => ({ value: c.id, label: `${c.nome}/${c.estado}` })),
            ]}
            value={filtroCidade}
            onChange={onFiltroCidadeChange}
            placeholder="Digite ou selecione..."
          />
        </label>
      </div>

      {animais.length === 0 && (
        <div className="empty-state">
          <span className="empty-emoji">🐾</span>
          Nenhum animal por aqui ainda. Que tal cadastrar o primeiro?
        </div>
      )}

      {animais.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {animais.map((animal) => (
            <div
              key={animal.id}
              className="group bg-white rounded-lg border border-line shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col items-center text-center gap-4"
            >
              <div className="min-w-0 w-full">
                <div className="font-extrabold text-lg text-ink leading-tight truncate" title={animal.nome}>
                  {animal.nome}
                </div>
                <div className="text-sm text-ink-muted font-semibold truncate">
                  {animal.especie_nome}
                  {animal.raca_nome ? ` · ${animal.raca_nome}` : ''}
                </div>
              </div>

              <span className="inline-flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-primary-light to-secondary-light text-2xl">
                {ESPECIE_EMOJI[animal.especie_nome] || '🐾'}
              </span>

              <div className="flex flex-col items-center gap-1.5 text-sm text-ink-muted font-semibold min-w-0 w-full">
                <span className={`badge badge-${animal.status} w-fit`}>
                  {STATUS_INFO[animal.status]?.icone} {STATUS_INFO[animal.status]?.rotulo || animal.status}
                </span>
                <span className="min-w-0 break-words">
                  🎂 {animal.idade != null ? `${animal.idade} ano${animal.idade === 1 ? '' : 's'}` : 'Idade não informada'}
                </span>
                <span className="min-w-0 break-words">
                  📍 {animal.cidade_nome ? `${animal.cidade_nome}/${animal.cidade_estado}` : 'Cidade não informada'}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-auto pt-3 border-t border-line">
                {animal.status === 'disponivel' && (
                  <button className="btn-secundario flex-1" onClick={() => onAdotar(animal)}>
                    Adotar
                  </button>
                )}
                <div className={`flex items-center gap-2 ${animal.status === 'disponivel' ? '' : 'ml-auto'}`}>
                  <button
                    className="btn-icone"
                    title="Editar"
                    aria-label={`Editar ${animal.nome}`}
                    onClick={() => onEditar(animal)}
                  >
                    <IconeEditar />
                  </button>
                  <button
                    className="btn-icone btn-perigo"
                    title="Excluir"
                    aria-label={`Excluir ${animal.nome}`}
                    onClick={() => onExcluir(animal)}
                  >
                    <IconeExcluir />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
