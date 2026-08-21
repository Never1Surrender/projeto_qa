'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type TipoNotificacao = 'sucesso' | 'erro';
type NotificarFn = (tipo: TipoNotificacao, mensagem: string) => void;

interface Notificacao {
  id: number;
  tipo: TipoNotificacao;
  mensagem: string;
}

const NotificacaoContext = createContext<NotificarFn | null>(null);

let proximoId = 0;

export function NotificacaoProvider({ children }: { children: ReactNode }) {
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const timers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

  const remover = useCallback((id: number) => {
    setNotificacoes((prev) => prev.filter((n) => n.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const notificar: NotificarFn = useCallback(
    (tipo, mensagem) => {
      const id = proximoId++;
      setNotificacoes((prev) => [...prev, { id, tipo, mensagem }]);
      timers.current[id] = setTimeout(() => remover(id), 4000);
    },
    [remover]
  );

  return (
    <NotificacaoContext.Provider value={notificar}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {notificacoes.map((n) => (
          <div
            key={n.id}
            role="status"
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-md shadow-md font-semibold text-sm ${
              n.tipo === 'sucesso'
                ? 'bg-secondary-light text-secondary-dark border border-secondary'
                : 'bg-danger-light text-danger-dark border border-danger'
            }`}
          >
            <span>
              {n.tipo === 'sucesso' ? '✅' : '⚠️'} {n.mensagem}
            </span>
            <button
              type="button"
              onClick={() => remover(n.id)}
              aria-label="Fechar notificação"
              style={{ padding: 0, border: 'none', background: 'transparent', fontWeight: 700, cursor: 'pointer' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificacaoContext.Provider>
  );
}

export function useNotificacao() {
  const notificar = useContext(NotificacaoContext);
  if (!notificar) {
    throw new Error('useNotificacao deve ser usado dentro de NotificacaoProvider');
  }
  return notificar;
}
