import React from 'react';
import type { GameContext } from '../../types/chat.types';
import styles from '../../styles/ContextPreview.module.css';

interface ContextPreviewProps {
  context: GameContext | null;
  onRemove: () => void;
}

const ContextPreview: React.FC<ContextPreviewProps> = ({ context, onRemove }) => {
  if (!context) return null;

  return (
    <div className={styles.contextPreview}>
      <div className={styles.contextPreviewHeader}>
        <span className={styles.contextLabel}>📎 Contexto seleccionado:</span>
        <button 
          className={styles.contextRemoveBtn} 
          onClick={onRemove}
          title="Remover contexto"
        >
          ✕
        </button>
      </div>
      <div className={styles.contextPreviewContent}>
        {context.imageUrl && (
          <img 
            src={context.imageUrl} 
            alt={context.displayText} 
            className={styles.contextPreviewImage}
          />
        )}
        <div className={styles.contextPreviewInfo}>
          <strong>{context.contextId}</strong>
          <span className={styles.contextAriaLabel}>{context.displayText}</span>
        </div>
      </div>
    </div>
  );
};

export default ContextPreview;
