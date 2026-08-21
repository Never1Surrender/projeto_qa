'use client';

import Combobox from './combobox';
import Paginacao from './paginacao';
import { IconeEditar, IconeExcluir } from './icones';
import type { Animal, Cidade, Especie } from '@/types';

const STATUS_INFO: Record<string, { rotulo: string; icone: string }> = {
  disponivel: { rotulo: 'Disponível', icone: '💚' },
  adotado: { rotulo: 'Adotado', icone: '🏠' },
};

const ESPECIE_EMOJI: Record<string, string> = {
  Cachorro: '🐶',
  Gato: '🐱',
  Ave: '🐦',
  Coelho: '🐰',
  Réptil: '🦎',
  Peixe: '🐠',
  Outro: '🐾',
};

const STATUS_ROTULO: Record<string, string> = { disponivel: 'Disponível', adotado: 'Adotado' };
const ORDENACAO_ROTULO: Record<string, string> = { nome: 'Nome', idade: 'Idade', criado_em: 'Data de cadastro' };

interface ListaAnimaisProps {
  animais: Animal[];
  cidades: Cidade[];
  especies: Especie[];
  filtroStatus: string;
  onFiltroStatusChange: (v: string) => void;
  filtroEspecie: string;
  onFiltroEspecieChange: (v: string | number) => void;
  filtroCidade: string;
  onFiltroCidadeChange: (v: string | number) => void;
  busca: string;
  onBuscaChange: (v: string) => void;
  ordenar: string;
  onOrdenarChange: (v: string) => void;
  direcao: string;
  onDirecaoChange: (v: string) => void;
  pagina: number;
  totalPaginas: number;
  total: number;
  onMudarPagina: (p: number) => void;
  onEditar: (animal: Animal) => void;
  onExcluir: (animal: Animal) => void;
  onAdotar: (animal: Animal) => void;
  onVerDetalhe: (animal: Animal) => void;
}

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
  busca,
  onBuscaChange,
  ordenar,
  onOrdenarChange,
  direcao,
  onDirecaoChange,
  pagina,
  totalPaginas,
  total,
  onMudarPagina,
  onEditar,
  onExcluir,
  onAdotar,
  onVerDetalhe,
}: ListaAnimaisProps) {
  const especieSelecionada = especies.find((esp) => String(esp.id) === String(filtroEspecie));
  const cidadeSelecionada = cidades.find((c) => String(c.id) === String(filtroCidade));

  const filtrosAtivos = [
    filtroStatus && { chave: 'status', rotulo: STATUS_ROTULO[filtroStatus], limpar: () => onFiltroStatusChange('') },
    filtroEspecie && { chave: 'especie', rotulo: especieSelecionada?.nome, limpar: () => onFiltroEspecieChange('') },
    filtroCidade && {
      chave: 'cidade',
      rotulo: cidadeSelecionada ? `${cidadeSelecionada.nome}/${cidadeSelecionada.estado}` : '',
      limpar: () => onFiltroCidadeChange(''),
    },
    busca && { chave: 'busca', rotulo: `"${busca}"`, limpar: () => onBuscaChange('') },
  ].filter(Boolean) as { chave: string; rotulo: string; limpar: () => void }[];

  function limparTudo() {
    onFiltroStatusChange('');
    onFiltroEspecieChange('');
    onFiltroCidadeChange('');
    onBuscaChange('');
  }

  return (
    <div>
      <div className="filtros">
        <label>
          Buscar por nome:
          <input
            type="text"
            value={busca}
            onChange={(e) => onBuscaChange(e.target.value)}
            placeholder="Digite o nome do animal..."
          />
        </label>

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

        <label>
          Ordenar por:
          <select value={ordenar} onChange={(e) => onOrdenarChange(e.target.value)}>
            {Object.entries(ORDENACAO_ROTULO).map(([valor, rotulo]) => (
              <option key={valor} value={valor}>
                {rotulo}
              </option>
            ))}
          </select>
        </label>

        <label>
          Direção:
          <select value={direcao} onChange={(e) => onDirecaoChange(e.target.value)}>
            <option value="asc">Crescente</option>
            <option value="desc">Decrescente</option>
          </select>
        </label>
      </div>

      {filtrosAtivos.length > 0 && (
        <div className="chips-filtro">
          {filtrosAtivos.map((filtro) => (
            <span className="chip" key={filtro.chave}>
              {filtro.rotulo}
              <button type="button" aria-label={`Remover filtro ${filtro.rotulo}`} onClick={filtro.limpar}>
                ×
              </button>
            </span>
          ))}
          <button type="button" className="chip-limpar" onClick={limparTudo}>
            Limpar todos
          </button>
        </div>
      )}

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
              <button
                type="button"
                className="flex flex-col items-center gap-4 w-full bg-transparent border-none p-0 cursor-pointer"
                onClick={() => onVerDetalhe(animal)}
                aria-label={`Ver detalhes de ${animal.nome}`}
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

                {animal.foto_url ? (
                  <span className="card-foto">
                    <img src={animal.foto_url} alt={animal.nome} />
                  </span>
                ) : (
                  <span className="inline-flex items-center justify-center w-12 h-12 shrink-0 rounded-full bg-gradient-to-br from-primary-light to-secondary-light text-2xl">
                    {ESPECIE_EMOJI[animal.especie_nome] || '🐾'}
                  </span>
                )}

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
              </button>

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

      <Paginacao pagina={pagina} totalPaginas={totalPaginas} total={total} onMudarPagina={onMudarPagina} />
    </div>
  );
}
