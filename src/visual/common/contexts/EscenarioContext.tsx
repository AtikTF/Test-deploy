import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { EscenarioMock } from '../../types/EscenarioTypes';
import { escenarioBase } from '../../../escenarios/escenarioBase';

interface EscenarioContextType {
    escenario: EscenarioMock;
    setEscenario: (escenario: EscenarioMock) => void;
}

/**
 * Context para gestionar globalmente al escenario actual en toda la aplicación
*/
const EscenarioContext = createContext<EscenarioContextType | undefined>(undefined);

interface EscenarioProviderProps {
    children: ReactNode;
    initialEscenario?: EscenarioMock;
}

/**
 * Envuelve la aplicación y proporciona el estado del escenario
 */
export function EscenarioProvider({ children, initialEscenario = escenarioBase }: EscenarioProviderProps) {
    const [escenario, setEscenario] = useState<EscenarioMock>(initialEscenario);

    return (
        <EscenarioContext.Provider value={{ escenario, setEscenario }}>
            {children}
        </EscenarioContext.Provider>
    );
}

/**
 * Hook personalizado para usar el contexto de escenario
 * Lanza error si se usa fuera del Provider
 * 
 * @returns El contexto del escenario con el escenario actual y función para actualizarlo
 * @throws Error si se usa fuera del EscenarioProvider
 * 
 * @example
 * const { escenario, setEscenario } = useEscenario();
 */

export function useEscenario(): EscenarioContextType {
    const context = useContext(EscenarioContext);

    if (context === undefined) {
        throw new Error('useEscenario debe ser usado dentro de un EscenarioProvider');
    }

    return context;
}

/**
 * Hook para obtener solo el escenario actual (sin función de actualización)
 * 
 * @returns El escenario actual
 * 
 * @example
 * const escenario = useEscenarioActual();
 */

export function useEscenarioActual(): EscenarioMock {
    const { escenario } = useEscenario();
    return escenario;
}
