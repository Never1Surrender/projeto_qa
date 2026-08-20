import { useEffect, useState } from 'react';
import { api } from './api';
import Toolbar from './components/Toolbar';
import { useNotificacao } from './components/Notificacoes';
import { useConfirm } from './components/ConfirmDialog';
import ListaAnimais from './pages/ListaAnimais';
import FormAnimal from './pages/FormAnimal';
import FormAdotante from './pages/FormAdotante';
import DetalheAnimal from './pages/DetalheAnimal';
import PaginaAdotantes from './pages/PaginaAdotantes';
import PaginaCidades from './pages/PaginaCidades';
import PaginaEspecies from './pages/PaginaEspecies';
import PaginaRacas from './pages/PaginaRacas';

const VIEWS = {
  LISTA: 'lista',
  FORM_ANIMAL: 'form_animal',
  FORM_ADOTAR: 'form_adotar',
  DETALHE_ANIMAL: 'detalhe_animal',
};

export default function App() {
  const notificar = useNotificacao();
  const confirmar = useConfirm();
  const [pagina, setPagina] = useState('animais');
  const [view, setView] = useState(VIEWS.LISTA);
  const [animais, setAnimais] = useState([]);
  const [adotantes, setAdotantes] = useState([]);
  const [cidades, setCidades] = useState([]);
  const [especies, setEspecies] = useState([]);
  const [racas, setRacas] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [filtroCidade, setFiltroCidade] = useState('');
  const [busca, setBusca] = useState('');
  const [buscaDebounced, setBuscaDebounced] = useState('');
  const [ordenar, setOrdenar] = useState('criado_em');
  const [direcao, setDirecao] = useState('desc');
  const [paginaAnimais, setPaginaAnimais] = useState(1);
  const [totalAnimais, setTotalAnimais] = useState(0);
  const [totalPaginasAnimais, setTotalPaginasAnimais] = useState(1);
  const [animalSelecionado, setAnimalSelecionado] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setBuscaDebounced(busca), 400);
    return () => clearTimeout(timer);
  }, [busca]);

  useEffect(() => {
    setPaginaAnimais(1);
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
        page: paginaAnimais,
      });
      setAnimais(resultado.dados);
      setTotalAnimais(resultado.total);
      setTotalPaginasAnimais(resultado.totalPaginas);
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function carregarAdotantes() {
    try {
      const resultado = await api.listarAdotantes({ limit: 100 });
      setAdotantes(resultado.dados);
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function carregarCidades() {
    try {
      const dados = await api.listarCidades();
      setCidades(dados);
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function carregarEspecies() {
    try {
      const dados = await api.listarEspecies();
      setEspecies(dados);
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function carregarRacas() {
    try {
      const dados = await api.listarRacas();
      setRacas(dados);
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  useEffect(() => {
    carregarAnimais();
  }, [filtroStatus, filtroEspecie, filtroCidade, buscaDebounced, ordenar, direcao, paginaAnimais]);

  useEffect(() => {
    carregarAdotantes();
    carregarCidades();
    carregarEspecies();
    carregarRacas();
  }, []);

  function navegar(novaPagina) {
    setPagina(novaPagina);
    setView(VIEWS.LISTA);
    carregarCidades();
    carregarEspecies();
    carregarRacas();
  }

  function abrirNovoAnimal() {
    setAnimalSelecionado(null);
    setView(VIEWS.FORM_ANIMAL);
  }

  function abrirEditarAnimal(animal) {
    setAnimalSelecionado(animal);
    setView(VIEWS.FORM_ANIMAL);
  }

  function abrirAdotar(animal) {
    setAnimalSelecionado(animal);
    setView(VIEWS.FORM_ADOTAR);
  }

  function abrirDetalheAnimal(animal) {
    setAnimalSelecionado(animal);
    setView(VIEWS.DETALHE_ANIMAL);
  }

  async function salvarAnimal(dados) {
    try {
      if (animalSelecionado) {
        await api.atualizarAnimal(animalSelecionado.id, dados);
        notificar('sucesso', 'Animal atualizado com sucesso!');
        setView(VIEWS.LISTA);
        await carregarAnimais();
      } else {
        await api.criarAnimal(dados);
        notificar('sucesso', 'Animal cadastrado com sucesso!');
        setView(VIEWS.LISTA);
        if (paginaAnimais === 1) {
          await carregarAnimais();
        } else {
          setPaginaAnimais(1);
        }
      }
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function excluirAnimal(animal) {
    const ok = await confirmar(`Excluir ${animal.nome}?`, { textoConfirmar: 'Excluir', perigo: true });
    if (!ok) return;
    try {
      await api.excluirAnimal(animal.id);
      notificar('sucesso', `${animal.nome} excluído com sucesso!`);
      await carregarAnimais();
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  async function confirmarAdocao(dadosAdocao) {
    try {
      await api.adotarAnimal(animalSelecionado.id, dadosAdocao);
      notificar('sucesso', 'Adoção registrada com sucesso!');
      setView(VIEWS.LISTA);
      await carregarAnimais();
      await carregarAdotantes();
    } catch (e) {
      notificar('erro', e.message);
    }
  }

  return (
    <div className="container relative">
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-[28rem] h-[28rem] rounded-full bg-secondary/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="w-full h-48 rounded-lg mb-7 bg-gradient-to-br from-primary to-secondary flex flex-col items-center justify-center text-center text-white gap-1">
        <h1 className="text-3xl font-extrabold">Adoção de Animais</h1>
        <p className="font-semibold">encontre um novo lar</p>
      </div>

      <Toolbar paginaAtiva={pagina} onNavegar={navegar} />

      {pagina === 'animais' && (
        <>
          {view === VIEWS.LISTA && (
            <>
              <div className="page-header">
                <h2>Animais</h2>
                <button className="btn-primario" onClick={abrirNovoAnimal}>
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
                onFiltroEspecieChange={setFiltroEspecie}
                filtroCidade={filtroCidade}
                onFiltroCidadeChange={setFiltroCidade}
                busca={busca}
                onBuscaChange={setBusca}
                ordenar={ordenar}
                onOrdenarChange={setOrdenar}
                direcao={direcao}
                onDirecaoChange={setDirecao}
                pagina={paginaAnimais}
                totalPaginas={totalPaginasAnimais}
                total={totalAnimais}
                onMudarPagina={setPaginaAnimais}
                onEditar={abrirEditarAnimal}
                onExcluir={excluirAnimal}
                onAdotar={abrirAdotar}
                onVerDetalhe={abrirDetalheAnimal}
              />
            </>
          )}

          {view === VIEWS.DETALHE_ANIMAL && (
            <DetalheAnimal
              animal={animalSelecionado}
              onEditar={abrirEditarAnimal}
              onAdotar={abrirAdotar}
              onVoltar={() => setView(VIEWS.LISTA)}
            />
          )}

          {view === VIEWS.FORM_ANIMAL && (
            <FormAnimal
              animalInicial={animalSelecionado}
              cidades={cidades}
              especies={especies}
              racas={racas}
              onSalvar={salvarAnimal}
              onCancelar={() => setView(VIEWS.LISTA)}
            />
          )}

          {view === VIEWS.FORM_ADOTAR && (
            <FormAdotante
              animal={animalSelecionado}
              adotantes={adotantes}
              cidades={cidades}
              onAdotar={confirmarAdocao}
              onCancelar={() => setView(VIEWS.LISTA)}
            />
          )}
        </>
      )}

      {pagina === 'adotantes' && <PaginaAdotantes />}

      {pagina === 'cidades' && <PaginaCidades />}

      {pagina === 'especies' && <PaginaEspecies />}

      {pagina === 'racas' && <PaginaRacas />}
    </div>
  );
}
