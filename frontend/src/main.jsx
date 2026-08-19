import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { NotificacaoProvider } from './components/Notificacoes.jsx';
import { ConfirmProvider } from './components/ConfirmDialog.jsx';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ConfirmProvider>
      <NotificacaoProvider>
        <App />
      </NotificacaoProvider>
    </ConfirmProvider>
  </React.StrictMode>
);
