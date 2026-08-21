'use client';

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

interface ConfirmOpcoes {
  textoCancelar?: string;
  textoConfirmar?: string;
  perigo?: boolean;
}

interface PedidoConfirmacao extends ConfirmOpcoes {
  mensagem: string;
}

type ConfirmarFn = (mensagem: string, opcoes?: ConfirmOpcoes) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmarFn | null>(null);

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pedido, setPedido] = useState<PedidoConfirmacao | null>(null);
  const resolverRef = useRef<((resultado: boolean) => void) | null>(null);

  const confirmar: ConfirmarFn = useCallback((mensagem, opcoes = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setPedido({ mensagem, ...opcoes });
    });
  }, []);

  function responder(resultado: boolean) {
    resolverRef.current?.(resultado);
    setPedido(null);
  }

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      {pedido && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-sm w-full flex flex-col gap-4">
            <p className="font-semibold text-ink">{pedido.mensagem}</p>
            <div className="flex gap-2 justify-end">
              <button type="button" onClick={() => responder(false)}>
                {pedido.textoCancelar || 'Cancelar'}
              </button>
              <button
                type="button"
                className={pedido.perigo ? 'btn-perigo' : 'btn-primario'}
                onClick={() => responder(true)}
                autoFocus
              >
                {pedido.textoConfirmar || 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const confirmar = useContext(ConfirmContext);
  if (!confirmar) {
    throw new Error('useConfirm deve ser usado dentro de ConfirmProvider');
  }
  return confirmar;
}
