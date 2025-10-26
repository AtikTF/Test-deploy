import { useCallback, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import { useContextMode } from './useContextMode';
import type { GameContext } from '../types/chat.types';

/**
 * Hook orquestador que coordina el flujo completo entre el chat y el modo contexto.
 * 
 * Responsabilidad única: Gestionar las transiciones de estado entre chat y modo contexto.
 * 
 * Flujo:
 * 1. Activar modo contexto → Cerrar chat
 * 2. Seleccionar elemento → Abrir chat y desactivar modo contexto
 * 
 * @param onContextSelected - Callback cuando se selecciona un contexto
 * @returns Estado y funciones para controlar el flujo
 */
export const useChatFlowOrchestrator = (
  onContextSelected: (context: GameContext) => void
) => {
  const { isChatOpen, closeChat, openChat, setContextModeActive } = useChatContext();

  /**
   * Callback ejecutado cuando se selecciona un contexto.
   * Desactiva modo contexto, abre el chat y notifica al padre.
   */
  const handleContextSelection = useCallback((context: GameContext) => {
    // Primero notificar la selección
    onContextSelected(context);
    
    // Luego abrir el chat (el modo contexto se desactiva automáticamente en useContextMode)
    openChat();
  }, [openChat, onContextSelected]);

  // Hook de modo contexto con callback de selección
  const { 
    isContextMode, 
    toggleContextMode
  } = useContextMode(handleContextSelection);

  /**
   * Efecto: Sincronizar estado del modo contexto con el contexto global.
   */
  useEffect(() => {
    setContextModeActive(isContextMode);
  }, [isContextMode, setContextModeActive]);

  /**
   * Efecto: Cerrar chat cuando se activa el modo contexto.
   */
  useEffect(() => {
    if (isContextMode && isChatOpen) {
      closeChat();
    }
  }, [isContextMode, isChatOpen, closeChat]);

  return {
    isContextMode,
    toggleContextMode,
  };
};
