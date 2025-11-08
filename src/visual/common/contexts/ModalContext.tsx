/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ModalContextType {
    isOpen: boolean;
    modalContent: ReactNode | null;
    openModal: (content: ReactNode) => void;
    closeModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

interface ModalProviderProps {
    children: ReactNode;
}

/**
 * Provider que gestiona el estado global del modal
 */
export function ModalProvider({ children }: ModalProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);

    const openModal = (content: ReactNode) => {
        setModalContent(content);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        // Pequeño delay antes de limpiar el contenido para permitir animaciones
        setTimeout(() => setModalContent(null), 300);
    };

    return (
        <ModalContext.Provider value={{ isOpen, modalContent, openModal, closeModal }}>
            {children}
        </ModalContext.Provider>
    );
}

/**
 * Hook para usar el contexto del modal
 * 
 * @example
 * const { openModal, closeModal } = useModal();
 * 
 * // Abrir modal con contenido personalizado
 * openModal(<ModalFirewall />);
 * 
 * // Cerrar modal
 * closeModal();
 */
export function useModal(): ModalContextType {
    const context = useContext(ModalContext);

    if (context === undefined) {
        throw new Error('useModal debe ser usado dentro de un ModalProvider');
    }

    return context;
}
