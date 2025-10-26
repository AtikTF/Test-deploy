import React from 'react';
import styles from '../../styles/ContextModeToggle.module.css';

interface ContextModeToggleProps {
  isActive: boolean;
  onToggle: () => void;
}

const ContextModeToggle: React.FC<ContextModeToggleProps> = ({ isActive, onToggle }) => {
  return (
    <button
      className={`${styles.contextModeToggle} ${isActive ? styles.active : ''}`}
      onClick={onToggle}
      title={isActive ? 'Desactivar modo contexto' : 'Activar modo contexto'}
    >
      <span>{isActive ? 'Modo Contexto ON' : 'Modo Contexto OFF'}</span>
    </button>
  );
};

export default ContextModeToggle;
