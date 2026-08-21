'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useNotificacao } from '@/components/notificacoes';
import { useConfirm } from '@/components/confirm-dialog';
import ListaAnimais from '@/components/lista-animais';
import type { Animal, Cidade, Especie } from '@/types';

export default function PaginaAnimais() {
  const router = useRouter();
  const notificar = useNotificacao();
  const confirmar = useConfirm();

  const [animais, setAnimais] = useState<Animal[]>([]);
  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [ordenar, setOrdenar] = useState('criado_em');
  const [direcao, setDirecao] = useState('desc');
  const [pagina, setPagina] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPaginas, setTotalPaginas] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(busca), 400);
    return () => clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    setPagina(1);
  }, [filtroStatus, filtroEspecie, filtroCidade, buscaDebounced, ordenar, direcao]);

  async function carregarAnimais() {
    try {
      const resultado = await api.listarAnimais({
        status: filtroStatus,
        especie_id: filtroEspecie,
        cidade_id: filtroCidade,
        busca: buscaDebounced,
        ordenar,
        direcao,
        page: pagina,
      });
      setAnimais(resultado.dados);
      setTotal(resultado.total);
      setTotalPaginas(resultado.totalPaginas);
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  useEffect(() => {
    carregarAnimais();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtroStatus, filtroEspecie, filtroCidade, buscaDebounced, ordenar, direcao, pagina]);

  useEffect(() => {
    api.listarCidades().then(setCidades).catch((e) => notificar('erro', (e as Error).message));
    api.listarEspecies().then(setEspecies).catch((e) => notificar('erro', (e as Error).message));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function excluirAnimal(animal: Animal) {
    const ok = await confirmar(`Excluir ${animal.nome}?`, { textoConfirmar: 'Excluir', perigo: true });
    if (!ok) return;
    try {
      await api.excluirAnimal(animal.id);
      notificar('sucesso', `${animal.nome} excluído com sucesso!`);
      await carregarAnimais();
    } catch (e) {
      notificar('erro', (e as Error).message);
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Animais</h2>
        <button className="btn-primario" onClick={() => router.push('/animais/novo')}>
          + Novo animal
        </button>
      </div>
      <ListaAnimais
        animais={animais}
        cidades={cidades}
        especies={especies}
        filtroStatus={filtroStatus}
        onFiltroStatusChange={setFiltroStatus}
        filtroEspecie={filtroEspecie}
        onFiltroEspecieChange={(v) => setFiltroEspecie(String(v))}
        filtroCidade={filtroCidade}
        onFiltroCidadeChange={(v) => setFiltroCidade(String(v))}
        busca={busca}
        onBuscaChange={setBusca}
        ordenar={ordenar}
        onOrdenarChange={setOrdenar}
        direcao={direcao}
        onDirecaoChange={setDirecao}
        pagina={pagina}
        totalPaginas={totalPaginas}
        total={total}
        onMudarPagina={setPagina}
        onEditar={(animal) => router.push(`/animais/${animal.id}/editar`)}
        onExcluir={excluirAnimal}
        onAdotar={(animal) => router.push(`/animais/${animal.id}/adotar`)}
        onVerDetalhe={(animal) => router.push(`/animais/${animal.id}`)}
      />
    </>
  );
}
