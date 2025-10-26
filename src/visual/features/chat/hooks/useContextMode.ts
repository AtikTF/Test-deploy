import { useState, useEffect, useCallback } from 'react';
import type { GameContext } from '../types/chat.types';


const CONTEXT_SELECTOR = '[data-context]' as const;

const CONTEXT_MODE_CLASS = 'context-mode-active' as const;

const BLOCKED_EVENT_TYPES = [
  'mousedown',
  'mouseup', 
  'dblclick',
  'contextmenu',
  'keydown',
  'keyup',
  'submit'
] as const;

type OnContextSelectedCallback = (context: GameContext) => void;


export const useContextMode = (onContextSelected?: OnContextSelectedCallback) => {
  const [isContextMode, setIsContextMode] = useState(false);
  const [selectedContext, setSelectedContext] = useState<GameContext | null>(null);


  const extractContextFromElement = useCallback((element: HTMLElement): GameContext => {
    const contextId = element.getAttribute('data-context') || '';
    const displayText = element.textContent?.trim() || contextId;
    const ariaLabel = element.getAttribute('aria-label') || undefined;
    const objectName = element.getAttribute('data-object-name') || element.tagName;
    const imageUrl = element instanceof HTMLImageElement ? element.src : undefined;

    return {
      objectName,
      contextId,
      displayText,
      ariaLabel,
      imageUrl,
    };
  }, []);


  const preventEventPropagation = useCallback((event: Event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, []);


  const handleObjectClick = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const elementWithContext = target.closest(CONTEXT_SELECTOR) as HTMLElement;
    
    if (!elementWithContext?.hasAttribute('data-context')) return;

    preventEventPropagation(event);

    const context = extractContextFromElement(elementWithContext);
    
    // Desactivar modo contexto ANTES de notificar
    setIsContextMode(false);
    setSelectedContext(null);
    
    // Notificar al componente padre que se seleccionó un contexto
    onContextSelected?.(context);
  }, [extractContextFromElement, preventEventPropagation, onContextSelected]);


  const blockElementActions = useCallback((event: Event) => {
    const target = event.target as HTMLElement;
    const elementWithContext = target.closest(CONTEXT_SELECTOR);
    
    if (elementWithContext) {
      preventEventPropagation(event);
    }
  }, [preventEventPropagation]);


  const addEventListeners = useCallback(() => {
    document.addEventListener('click', handleObjectClick, true);
     
    BLOCKED_EVENT_TYPES.forEach(eventType => {
      document.addEventListener(eventType, blockElementActions, true);
    });
    
    document.body.classList.add(CONTEXT_MODE_CLASS);
  }, [handleObjectClick, blockElementActions]);

  const removeEventListeners = useCallback(() => {
    document.removeEventListener('click', handleObjectClick, true);
    
    BLOCKED_EVENT_TYPES.forEach(eventType => {
      document.removeEventListener(eventType, blockElementActions, true);
    });
    
    document.body.classList.remove(CONTEXT_MODE_CLASS);
  }, [handleObjectClick, blockElementActions]);


  const toggleContextMode = useCallback(() => {
    setIsContextMode((prev) => {
      const newValue = !prev;
      
      // Limpiar contexto cuando se desactiva
      if (!newValue) {
        setSelectedContext(null);
      }
      
      return newValue;
    });
  }, []);

  const clearContext = useCallback(() => {
    setSelectedContext(null);
  }, []);

  /**
   * Desactiva el modo contexto manualmente
   */
  const deactivateContextMode = useCallback(() => {
    setIsContextMode(false);
    setSelectedContext(null);
  }, []);

  /**
   * Efecto para gestionar event listeners según el estado del modo contexto
   */
  useEffect(() => {
    if (isContextMode) {
      addEventListeners();
    } else {
      removeEventListeners();
    }

    // Cleanup al desmontar o cambiar el modo
    return removeEventListeners;
  }, [isContextMode, addEventListeners, removeEventListeners]);

  return {
    isContextMode,
    selectedContext,
    toggleContextMode,
    clearContext,
    deactivateContextMode,
  };
};
