import { createRoot } from 'react-dom/client'
import "./common/styles/global.css"
import VistaOficina from './features/escenarios-simulados/pages/VistaOficina.tsx'
import Dispositivos from './features/hardening-de-dispositivos/pages/Dispositivos.tsx'
import { BrowserRouter, Route, Routes } from 'react-router'
import Header from './common/components/Header.tsx'
import { EscenarioProvider, ModalProvider, SelectedLevelProvider } from './common/contexts'
import { ECSSceneProvider } from './features/escenarios-simulados/context/ECSSceneContext.tsx'
import TarjetaLogNuevo from './features/escenarios-simulados/components/TarjetaLogNuevo.tsx'
import { ChatProvider } from './features/chat/context/ChatContext.tsx'
import Redes from './features/simulacion-redes/pages/Redes.tsx'
import Modal from './common/components/Modal.tsx'
import ModelPreloader from './common/components/ModelPreloader.tsx'
import VistaFasesPartida from './features/escenarios-simulados/pages/VistaFasesPartida.tsx'
import { FasesProvider } from './features/escenarios-simulados/contexts/FasesContext.tsx'
import VistaSeleccionNiveles from './features/escenarios-simulados/pages/VistaSeleccionNiveles.tsx'

const shouldRedirect = sessionStorage.getItem('redirect-on-reload');
if (shouldRedirect === 'true') {
  sessionStorage.removeItem('redirect-on-reload');
  window.history.replaceState(null, '', '/');
}

window.addEventListener('beforeunload', () => {
  const currentPath = window.location.pathname;
  if (currentPath === '/dispositivos' || currentPath === '/redes') {
    sessionStorage.setItem('redirect-on-reload', 'true');
  }
});

createRoot(document.getElementById('root')!).render(
  <SelectedLevelProvider>
    <BrowserRouter>
      <Routes>
        <Route path='/seleccion-niveles' element={<VistaSeleccionNiveles />} />
        <Route path='/*' element={
        <EscenarioProvider>
          <ModalProvider>
            <ChatProvider>
              <FasesProvider>
                <ECSSceneProvider>
                  <ModelPreloader />
                  <Header />
                  <div className="content">
                    <Routes>
                      <Route path='/' element={<VistaOficina />} />
                      <Route path='/dispositivos' element={<Dispositivos />} />
                      <Route path='/redes' element={<Redes />} />
                      <Route path='/fases-partida' element={<VistaFasesPartida />} />
                    </Routes>
                    <TarjetaLogNuevo />
                  </div>
                  <Modal />
                </ECSSceneProvider>
              </FasesProvider>
            </ChatProvider>
          </ModalProvider>
        </EscenarioProvider>
      } />
      </Routes>
    </BrowserRouter>
  </SelectedLevelProvider>,
)
