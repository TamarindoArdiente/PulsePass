import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router/dom';
import './index.css';
import { AuthProvider } from './context/AuthProvider';
import { TemaProvider } from './context/TemaProvider';
import { queryClient } from './lib/queryClient';
import { router } from './router';

const raiz = document.getElementById('root');
if (raiz === null) throw new Error('No se encontró el elemento #root');

createRoot(raiz).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <TemaProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </TemaProvider>
    </QueryClientProvider>
  </StrictMode>,
);

