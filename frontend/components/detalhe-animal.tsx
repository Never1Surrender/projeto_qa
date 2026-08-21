import type { Animal } from '@/types';

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

function formatarData(data: string | null | undefined) {
  if (!data) return null;
  return new Date(data).toLocaleDateString('pt-BR');
}

interface DetalheAnimalProps {
  animal: Animal;
  onEditar: (animal: Animal) => void;
  onAdotar: (animal: Animal) => void;
  onVoltar: () => void;
}

export default function DetalheAnimal({ animal, onEditar, onAdotar, onVoltar }: DetalheAnimalProps) {
  return (
    <div className="detalhe-animal">
      <button type="button" className="btn-voltar" onClick={onVoltar}>
        ← Voltar para a lista
      </button>

      <div className="detalhe-animal-card">
        <div className="detalhe-animal-foto">
          {animal.foto_url ? (
            <img src={animal.foto_url} alt={animal.nome} />
          ) : (
            <span className="detalhe-animal-emoji">{ESPECIE_EMOJI[animal.especie_nome] || '🐾'}</span>
          )}
        </div>

        <div className="detalhe-animal-info">
          <div className="page-header">
            <h2>{animal.nome}</h2>
            <span className={`badge badge-${animal.status} w-fit`}>
              {STATUS_INFO[animal.status]?.icone} {STATUS_INFO[animal.status]?.rotulo || animal.status}
            </span>
          </div>

          <dl className="detalhe-lista">
            <div>
              <dt>Espécie</dt>
              <dd>{animal.especie_nome}</dd>
            </div>
            <div>
              <dt>Raça</dt>
              <dd>{animal.raca_nome || 'Não informada'}</dd>
            </div>
            <div>
              <dt>Idade</dt>
              <dd>{animal.idade != null ? `${animal.idade} ano${animal.idade === 1 ? '' : 's'}` : 'Não informada'}</dd>
            </div>
            <div>
              <dt>Data de nascimento</dt>
              <dd>{formatarData(animal.data_nascimento) || 'Não informada'}</dd>
            </div>
            <div>
              <dt>Cidade</dt>
              <dd>{animal.cidade_nome ? `${animal.cidade_nome}/${animal.cidade_estado}` : 'Não informada'}</dd>
            </div>
            <div>
              <dt>Cadastrado em</dt>
              <dd>{formatarData(animal.criado_em)}</dd>
            </div>
            {animal.status === 'adotado' && (
              <div>
                <dt>Adotado por</dt>
                <dd>{animal.adotante_nome || 'Não informado'}</dd>
              </div>
            )}
          </dl>

          <div className="form-actions">
            {animal.status === 'disponivel' && (
              <button className="btn-secundario" onClick={() => onAdotar(animal)}>
                Adotar
              </button>
            )}
            <button className="btn-primario" onClick={() => onEditar(animal)}>
              Editar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
