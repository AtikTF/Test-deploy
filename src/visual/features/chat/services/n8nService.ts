import type { N8nWebhookResponse, GameContext } from '../types/chat.types';


class N8nService {
  private webhookUrl: string;
  private sessionId: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
    this.sessionId = this.generateSessionId();
  }

 
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  
  async sendMessage(message: string, context?: GameContext | null): Promise<N8nWebhookResponse> {
    try {
      const payload: any = {
        message,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      };

      if (context) {
        payload.context = {
          objectName: context.objectName,
          contextId: context.contextId,
          displayText: context.displayText,
          ariaLabel: context.ariaLabel,
          imageUrl: context.imageUrl,
        };
      }

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status}`);
      }

      const data: N8nWebhookResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error al comunicarse con n8n:', error);
      throw error;
    }
  }


  setWebhookUrl(url: string): void {
    this.webhookUrl = url;
  }


  getSessionId(): string {
    return this.sessionId;
  }
}

export default N8nService;
