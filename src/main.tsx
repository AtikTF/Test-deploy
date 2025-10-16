import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "../src/common/styles/global.css"
import Oficina from './features/escenarios-simulados/pages/Oficina.tsx'
import Dispositivos from './features/hardening-de-dispositivos/pages/Dispositivos.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Oficina />} />
        <Route path='/dispositivos' element={<Dispositivos />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
