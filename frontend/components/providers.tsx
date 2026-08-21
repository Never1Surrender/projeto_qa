'use client';

import type { ReactNode } from 'react';
import { ConfirmProvider } from './confirm-dialog';
import { NotificacaoProvider } from './notificacoes';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfirmProvider>
      <NotificacaoProvider>{children}</NotificacaoProvider>
    </ConfirmProvider>
  );
}
