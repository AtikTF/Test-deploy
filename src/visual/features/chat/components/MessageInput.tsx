import React, { useState, type FormEvent } from 'react';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import type { Message } from '../../../../chat';
import styles from '../styles/MessageInput.module.css';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  isContextMode?: boolean;
  onToggleContextMode?: () => void;
  messages: readonly Message[];
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled = false,
  isContextMode = false,
  onToggleContextMode,
  messages
}) => {
  const [inputValue, setInputValue] = useState('');
  const { isPlaying, play } = useAudioPlayer();
  const lastBotAudio = [...messages].reverse().find(m => m.sender === 'bot')?.audioContent || null;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (inputValue.trim() && !disabled) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handlePlayAudio = () => {
    if (lastBotAudio) {
      play(lastBotAudio);
    }
  };

  return (
    <form className={styles.messageInputContainer} onSubmit={handleSubmit}>
      <textarea
        className={styles.messageInput}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyPress={handleKeyPress}
        spellCheck="false"
        placeholder={isContextMode ? "Selecciona un elemento..." : "Pregúntame cualquier cosa..."}
        disabled={disabled}
        rows={1}
      />
      <div className={styles.inputActions}>
        <div
          className={`${styles.contextButton} ${isContextMode ? styles.contextActive : ''}`}
          onClick={onToggleContextMode}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11.589 3a.75.75 0 0 0-1.5 0v1.978a.75.75 0 0 0 1.5 0zM5.983 4.945A.75.75 0 0 0 4.917 6l1.47 1.483A.75.75 0 1 0 7.452 6.43zM16.761 6a.75.75 0 0 0-1.065-1.055l-1.47 1.484a.75.75 0 1 0 1.065 1.055zM11.8 10.096c-1.025-.404-1.994.617-1.61 1.61l3.581 9.25c.41 1.058 1.901 1.059 2.311 0l1.374-3.543l3.508-1.385c1.048-.414 1.048-1.903 0-2.317zm-6.84.067H3a.75.75 0 0 0 0 1.5h1.96a.75.75 0 0 0 0-1.5m2.492 5.234a.75.75 0 0 0-1.065-1.056l-1.47 1.484a.75.75 0 1 0 1.066 1.056z" />
          </svg>
          Pedir contexto
        </div>
        {lastBotAudio && (
          <div
            className={`${styles.contextButton} ${isPlaying ? styles.audioPlaying : ''}`}
            onClick={handlePlayAudio}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="currentColor" d="M3 9v6h4l5 5V4L7 9zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77" />
            </svg>
            Escuchar
          </div>
        )}
        <button
          type="submit"
          className={styles.sendButton}
          disabled={disabled || !inputValue.trim()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"><path fill="currentColor" d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z" /></svg>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
