import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // escuta em 0.0.0.0, necessário para ser acessível de fora do container
  },
});
