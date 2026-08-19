import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [pedido, setPedido] = useState(null);
  const resolverRef = useRef(null);

  const confirmar = useCallback((mensagem, opcoes = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setPedido({ mensagem, ...opcoes });
    });
  }, []);

  function responder(resultado) {
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
