import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { DrawingProvider } from './context/DrawingContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <DrawingProvider>
      <App />
    </DrawingProvider>
  </StrictMode>
);