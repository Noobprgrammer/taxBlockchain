import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import TaxPaymentForm from './TaxPaymentForm';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TaxPaymentForm />
  </StrictMode>
);