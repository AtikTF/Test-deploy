import React, { useState, useCallback } from 'react';
import type { Message, GameContext } from '../../types/chat.types';
import N8nService from '../../services/n8nService';
import MessageList from '../MessageList/MessageList';
import MessageInput from '../MessageInput/MessageInput';
import ContextModeToggle from '../ContextModeToggle/ContextModeToggle';
import { useChatFlowOrchestrator } from '../../hooks/useChatFlowOrchestrator';
import styles from '../../styles/ChatContainer.module.css';

interface ChatContainerProps {
  webhookUrl: string;
  isOpen?: boolean;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ webhookUrl, isOpen = true }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [n8nService] = useState(() => new N8nService(webhookUrl));

  /**
   * Agrega un mensaje a la lista.
   * Responsabilidad única: Gestionar el estado de mensajes.
   */
  const addMessage = useCallback((text: string, sender: 'user' | 'bot', context?: GameContext) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      text,
      sender,
      timestamp: new Date(),
      context,
    };
    setMessages((prev) => [...prev, newMessage]);
  }, []);

  /**
   * Envía un contexto seleccionado a n8n con mensaje vacío.
   * Responsabilidad única: Enviar contexto al webhook.
   */
  const sendContextMessage = useCallback(async (context: GameContext) => {
    setIsTyping(true);

    try {
      const response = await n8nService.sendMessage('', context);
      addMessage(response.message, 'bot');
    } catch (error) {
      console.error('Error al enviar contexto:', error);
      addMessage('Lo siento, hubo un error al procesar la selección.', 'bot');
    } finally {
      setIsTyping(false);
    }
  }, [n8nService, addMessage]);

  /**
   * Maneja la selección de contexto desde el modo contexto.
   * Responsabilidad única: Coordinar acciones cuando se selecciona un elemento.
   */
  const handleContextSelected = useCallback((context: GameContext) => {
    addMessage('', 'user', context);
    sendContextMessage(context);
  }, [addMessage, sendContextMessage]);
  
  /**
   * Hook orquestador que maneja la coordinación entre chat y modo contexto.
   * Separa la responsabilidad de coordinación del estado del chat.
   */
  const { isContextMode, toggleContextMode } = useChatFlowOrchestrator(handleContextSelected);

  /**
   * Maneja el envío de mensajes regulares (sin contexto).
   * Responsabilidad única: Procesar entrada del usuario.
   */
  const handleSendMessage = useCallback(async (messageText: string) => {
    if (!messageText.trim()) return;

    addMessage(messageText, 'user');
    setIsTyping(true);

    try {
      const response = await n8nService.sendMessage(messageText);
      addMessage(response.message, 'bot');
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      addMessage('Lo siento, hubo un error al procesar tu mensaje.', 'bot');
    } finally {
      setIsTyping(false);
    }
  }, [n8nService, addMessage]);

  return (
    <div className={`${styles.chatContainer} ${isOpen ? styles.open : styles.closed}`}>
      <div className={styles.chatHeader}>
        <h2>Chat con Agente</h2>
        <div className={styles.chatHeaderActions}>
          <ContextModeToggle 
            isActive={isContextMode} 
            onToggle={toggleContextMode} 
          />
        </div>
      </div>
      <MessageList messages={messages} isTyping={isTyping} />
      <MessageInput 
        onSendMessage={(msg) => handleSendMessage(msg)} 
        disabled={isTyping} 
      />
    </div>
  );
};

export default ChatContainer;
