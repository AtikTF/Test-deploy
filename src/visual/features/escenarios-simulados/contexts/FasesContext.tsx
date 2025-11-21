import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Objetivo {
    id: string;
    descripcion: string;
    completado: boolean;
}

export interface Fase {
    id: number;
    nombre: string;
    descripcion: string;
    objetivos: Objetivo[];
    completada: boolean;
}

interface FasesContextType {
    fases: Fase[];
    faseActualIndex: number;
    completarObjetivo: (faseId: number, objetivoId: string) => void;
    avanzarFase: () => void;
    retrocederFase: () => void;
    navegarAFase: (index: number) => void;
}

const FasesContext = createContext<FasesContextType | undefined>(undefined);

export const useFasesContext = () => {
    const context = useContext(FasesContext);
    if (!context) {
        throw new Error('useFasesContext debe ser usado dentro de un FasesProvider');
    }
    return context;
};

interface FasesProviderProps {
    children: ReactNode;
}

export const FasesProvider = ({ children }: FasesProviderProps) => {
    // Datos quemados por ahora
    const [fases, setFases] = useState<Fase[]>([
        {
            id: 1,
            nombre: 'Fase 1',
            descripcion: 'Configuración inicial del entorno de red',
            objetivos: [
                { id: '1-1', descripcion: 'Configurar el router principal', completado: true },
                { id: '1-2', descripcion: 'Establecer las subredes', completado: true },
                { id: '1-3', descripcion: 'Lo que sea', completado: true },
            ],
            completada: true,
        },
        {
            id: 2,
            nombre: 'Fase 2',
            descripcion: 'Implementación de seguridad básica',
            objetivos: [
                { id: '2-1', descripcion: 'Configurar firewall básico', completado: true },
                { id: '2-2', descripcion: 'Establecer políticas de acceso', completado: true },
            ],
            completada: true,
        },
        {
            id: 3,
            nombre: 'Asegurar la comunicación de Harry y Lisa por Internet',
            descripcion: 'Asegurar la comunicación de Harry y Lisa por Internet',
            objetivos: [
                {
                    id: '3-1',
                    descripcion: 'Cuando Lisa accede a la Planificación de Marketing por Internet, ¿cómo puedes asegurarte que es realmente Lisa haciendo las modificaciones? ¿Y si atacantes secuestran su sesión de red?',
                    completado: true,
                },
                {
                    id: '3-2',
                    descripcion: 'Después de asegurar las comunicaciones por Internet, ponga en funcionamiento presionando el botón de reproducir y ejecute por un tiempo. La simulación continuará sin interrupciones si las medidas de seguridad son suficientes.',
                    completado: false,
                },
            ],
            completada: false,
        },
        {
            id: 4,
            nombre: 'Fase 4',
            descripcion: 'Auditoría y optimización final',
            objetivos: [
                { id: '4-1', descripcion: 'Realizar auditoría de seguridad', completado: false },
                { id: '4-2', descripcion: 'Optimizar el rendimiento de red', completado: false },
            ],
            completada: false,
        },
    ]);

    const [faseActualIndex, setFaseActualIndex] = useState(2); // Fase 3 es el índice 2

    const completarObjetivo = (faseId: number, objetivoId: string) => {
        setFases((prevFases) =>
            prevFases.map((fase) => {
                if (fase.id === faseId) {
                    const nuevosObjetivos = fase.objetivos.map((obj) =>
                        obj.id === objetivoId ? { ...obj, completado: !obj.completado } : obj
                    );
                    const todosCompletados = nuevosObjetivos.every((obj) => obj.completado);
                    return {
                        ...fase,
                        objetivos: nuevosObjetivos,
                        completada: todosCompletados,
                    };
                }
                return fase;
            })
        );
    };

    const avanzarFase = () => {
        if (faseActualIndex < fases.length - 1) {
            setFaseActualIndex(faseActualIndex + 1);
        }
    };

    const retrocederFase = () => {
        if (faseActualIndex > 0) {
            setFaseActualIndex(faseActualIndex - 1);
        }
    };

    const navegarAFase = (index: number) => {
        // Solo permitir navegar a fases completadas o la fase actual
        if (index <= faseActualIndex || fases[index - 1]?.completada) {
            setFaseActualIndex(index);
        }
    };

    return (
        <FasesContext.Provider
            value={{
                fases,
                faseActualIndex,
                completarObjetivo,
                avanzarFase,
                retrocederFase,
                navegarAFase,
            }}
        >
            {children}
        </FasesContext.Provider>
    );
};
