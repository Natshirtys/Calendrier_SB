import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { ConcoursProvider } from './hooks/useConcours';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ConcoursProvider>
      <App />
    </ConcoursProvider>
  </StrictMode>,
);
