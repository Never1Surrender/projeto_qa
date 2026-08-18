import { useEffect, useState } from 'react';
import { api } from './api';
import ListaAnimais from './pages/ListaAnimais';
import FormAnimal from './pages/FormAnimal';
import FormAdotante from './pages/FormAdotante';

const VIEWS = {
  LISTA: 'lista',
  FORM_ANIMAL: 'form_animal',
  FORM_ADOTAR: 'form_adotar',
};

export default function App() {
  const [view, setView] = useState(VIEWS.LISTA);
  const [animais, setAnimais] = useState([]);
  const [adotantes, setAdotantes] = useState([]);
  const [filtroStatus, setFiltroStatus] = useState('');
  const [filtroEspecie, setFiltroEspecie] = useState('');
  const [animalSelecionado, setAnimalSelecionado] = useState(null);
  const [erro, setErro] = useState('');

  async function carregarAnimais() {
    try {
      setErro('');
      const dados = await api.listarAnimais({ status: filtroStatus, especie: filtroEspecie });
      setAnimais(dados);
    } catch (e) {
      setErro(e.message);
    }
  }

  async function carregarAdotantes() {
    try {
      const dados = await api.listarAdotantes();
      setAdotantes(dados);
    } catch (e) {
      setErro(e.message);
    }
  }

  useEffect(() => {
    carregarAnimais();
  }, [filtroStatus, filtroEspecie]);

  useEffect(() => {
    carregarAdotantes();
  }, []);

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

  async function salvarAnimal(dados) {
    try {
      setErro('');
      if (animalSelecionado) {
        await api.atualizarAnimal(animalSelecionado.id, dados);
      } else {
        await api.criarAnimal(dados);
      }
      setView(VIEWS.LISTA);
      await carregarAnimais();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function excluirAnimal(animal) {
    if (!window.confirm(`Excluir ${animal.nome}?`)) return;
    try {
      setErro('');
      await api.excluirAnimal(animal.id);
      await carregarAnimais();
    } catch (e) {
      setErro(e.message);
    }
  }

  async function confirmarAdocao(dadosAdocao) {
    try {
      setErro('');
      await api.adotarAnimal(animalSelecionado.id, dadosAdocao);
      setView(VIEWS.LISTA);
      await carregarAnimais();
      await carregarAdotantes();
    } catch (e) {
      setErro(e.message);
    }
  }

  return (
    <div className="container">
      <header>
        <h1>🐾 Adoção de Animais</h1>
        {view === VIEWS.LISTA && <button onClick={abrirNovoAnimal}>+ Novo animal</button>}
      </header>

      {erro && <p className="erro">{erro}</p>}

      {view === VIEWS.LISTA && (
        <ListaAnimais
          animais={animais}
          filtroStatus={filtroStatus}
          onFiltroStatusChange={setFiltroStatus}
          filtroEspecie={filtroEspecie}
          onFiltroEspecieChange={setFiltroEspecie}
          onEditar={abrirEditarAnimal}
          onExcluir={excluirAnimal}
          onAdotar={abrirAdotar}
        />
      )}

      {view === VIEWS.FORM_ANIMAL && (
        <FormAnimal
          animalInicial={animalSelecionado}
          onSalvar={salvarAnimal}
          onCancelar={() => setView(VIEWS.LISTA)}
        />
      )}

      {view === VIEWS.FORM_ADOTAR && (
        <FormAdotante
          animal={animalSelecionado}
          adotantes={adotantes}
          onAdotar={confirmarAdocao}
          onCancelar={() => setView(VIEWS.LISTA)}
        />
      )}
    </div>
  );
}
