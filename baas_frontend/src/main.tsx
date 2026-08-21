import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { CheckoutPage } from './pages/checkout/CheckoutPage.tsx'
import { AuthProvider } from './context/AuthContext'
import { PaymentsProvider } from './context/PaymentsContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
      <PaymentsProvider>
        <Routes>
          <Route path="/checkout/:id" element={<CheckoutPage />} />
          <Route path="*" element={<App />} />
        </Routes>
      </PaymentsProvider>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
)
