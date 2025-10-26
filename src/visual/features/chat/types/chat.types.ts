// Tipos para los mensajes del chat
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  context?: GameContext;
}

// Tipo para el contexto del juego
export interface GameContext {
  objectName: string;
  contextId: string;        // ID único del contexto (data-context)
  displayText: string;      // Texto visible para mostrar
  ariaLabel?: string;       // Opcional: mantener aria-label si existe
  imageUrl?: string;
}

// Tipo para la respuesta del webhook de n8n
export interface N8nWebhookResponse {
  message: string;
  success?: boolean;
}

// Tipo para la configuración del chat
export interface ChatConfig {
  webhookUrl: string;
  sessionId?: string;
}
