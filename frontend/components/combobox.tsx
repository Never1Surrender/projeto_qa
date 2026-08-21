'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ComboboxOption {
  value: string | number;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  name?: string;
}

export default function Combobox({ options, value, onChange, placeholder, disabled, required, name }: ComboboxProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  // value === '' representa "nenhuma seleção" (placeholder), então não deve casar com uma
  // opção real que por acaso também use value: '' (ex: a opção "Todas"/"Todos" de um filtro)
  const selecionado = value === '' ? undefined : options.find((o) => String(o.value) === String(value));
  const [texto, setTexto] = useState(selecionado?.label ?? '');
  const [aberto, setAberto] = useState(false);
  const [indiceAtivo, setIndiceAtivo] = useState(-1);
  const [posicao, setPosicao] = useState<{ top: number; left: number; width: number } | null>(null);

  useEffect(() => {
    setTexto(selecionado?.label ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    function handleClickFora(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setAberto(false);
        setTexto(selecionado?.label ?? '');
      }
    }
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selecionado]);

  useEffect(() => {
    if (!aberto) return;

    function atualizarPosicao() {
      const retangulo = inputRef.current?.getBoundingClientRect();
      if (retangulo) {
        setPosicao({ top: retangulo.bottom, left: retangulo.left, width: retangulo.width });
      }
    }

    atualizarPosicao();
    window.addEventListener('scroll', atualizarPosicao, true);
    window.addEventListener('resize', atualizarPosicao);
    return () => {
      window.removeEventListener('scroll', atualizarPosicao, true);
      window.removeEventListener('resize', atualizarPosicao);
    };
  }, [aberto]);

  const opcoesFiltradas = texto ? options.filter((o) => o.label.toLowerCase().includes(texto.toLowerCase())) : options;

  function handleSelecionar(opcao: ComboboxOption) {
    setTexto(opcao.label);
    setAberto(false);
    setIndiceAtivo(-1);
    onChange(opcao.value);
  }

  function handleChangeTexto(e: React.ChangeEvent<HTMLInputElement>) {
    const novoTexto = e.target.value;
    setTexto(novoTexto);
    setAberto(true);
    setIndiceAtivo(-1);
    if (novoTexto === '') {
      onChange('');
      return;
    }
    const opcaoExata = options.find((o) => o.label.toLowerCase() === novoTexto.toLowerCase());
    if (opcaoExata) {
      onChange(opcaoExata.value);
      setAberto(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Escape') {
      setAberto(false);
      setTexto(selecionado?.label ?? '');
      return;
    }
    if (!aberto || opcoesFiltradas.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIndiceAtivo((i) => Math.min(i + 1, opcoesFiltradas.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIndiceAtivo((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && indiceAtivo >= 0) {
      e.preventDefault();
      handleSelecionar(opcoesFiltradas[indiceAtivo]);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        name={name}
        value={texto}
        onChange={handleChangeTexto}
        onFocus={() => setAberto(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
      />
      {aberto &&
        !disabled &&
        opcoesFiltradas.length > 0 &&
        posicao &&
        createPortal(
          <ul
            ref={dropdownRef}
            className="fixed z-50 max-h-56 overflow-y-auto rounded-sm border border-line bg-white shadow-md"
            style={{ top: posicao.top + 4, left: posicao.left, width: posicao.width }}
          >
            {opcoesFiltradas.map((o, i) => (
              <li key={o.value}>
                <div
                  role="option"
                  aria-selected={i === indiceAtivo}
                  className={`px-3 py-2 text-sm font-semibold cursor-pointer ${
                    i === indiceAtivo ? 'bg-primary-light text-primary-dark' : 'text-ink hover:bg-primary-light'
                  }`}
                  onClick={() => handleSelecionar(o)}
                  onMouseEnter={() => setIndiceAtivo(i)}
                >
                  {o.label}
                </div>
              </li>
            ))}
          </ul>,
          document.body
        )}
    </>
  );
}
