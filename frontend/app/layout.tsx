import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { Providers } from '@/components/providers';
import Toolbar from '@/components/toolbar';

export const metadata: Metadata = {
  title: 'Adoção de Animais',
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='.9em' font-size='90'%3E%F0%9F%90%BE%3C/text%3E%3C/svg%3E",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Providers>
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

            <Toolbar />

            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
