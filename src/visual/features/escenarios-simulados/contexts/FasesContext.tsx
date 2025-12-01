import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { EscenarioController } from '../../../../ecs/controllers/EscenarioController';
import type { FaseComponent } from '../../../../ecs/components/FaseComponent';
import { EventosPublicos } from '../../../../types/EventosEnums';

export interface Objetivo {
    descripcion: string;
    completado: boolean;
}

export interface Fase {
    id: number;
    nombre: string;
    descripcion: string;
    objetivos: Objetivo[];
    completada: boolean;
    faseActual: boolean;
}

interface FasesContextType {
    fases: Fase[];
    faseActualIndex: number;
    actualizarFases: () => void;
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
    const [fases, setFases] = useState<Fase[]>([]);
    const [faseActualIndex, setFaseActualIndex] = useState(0);

    const convertirFaseComponentAFase = (faseComponent: FaseComponent): Fase => {
        return {
            id: faseComponent.id,
            nombre: faseComponent.nombre,
            descripcion: faseComponent.descripcion,
            objetivos: faseComponent.objetivos.map((obj) => ({
                descripcion: obj.descripcion,
                completado: obj.completado,
            })),
            completada: faseComponent.completada,
            faseActual: faseComponent.faseActual,
        };
    };

    const actualizarFases = () => {
        try {
            const controller = EscenarioController.getInstance();
            const fasesECS = controller.getFasesConObjetivos();

            if (fasesECS && fasesECS.length > 0) {
                const fasesConvertidas = fasesECS.map(convertirFaseComponentAFase);
                setFases(fasesConvertidas);

                // Encontrar el índice de la fase actual
                const indexActual = fasesConvertidas.findIndex((f) => f.faseActual);
                if (indexActual !== -1) {
                    setFaseActualIndex(indexActual);
                }
            }
        } catch (error) {
            console.error('Error al obtener fases del controlador:', error);
        }
    };

    useEffect(() => {
        actualizarFases();

        try {
            const controller = EscenarioController.getInstance();
            
            const unsubscribeAtaqueMitigado = controller.on(EventosPublicos.ATAQUE_MITIGADO, () => {
                setTimeout(() => actualizarFases(), 100);
            });

            const unsubscribeFaseCompletada = controller.on(EventosPublicos.FASE_COMPLETADA, () => {
                setTimeout(() => actualizarFases(), 100);
            });

            const unsubscribeObjetivoCompletado = controller.on('objetivo:completado' as EventosPublicos, () => {
                setTimeout(() => actualizarFases(), 100);
            });

            const unsubscribeFaseNoCompletada = controller.on(EventosPublicos.FASE_NO_COMPLETADA, () => {
                setTimeout(() => actualizarFases(), 100);
            });

            const unsubscribeEscenarioCompletado = controller.on(EventosPublicos.ESCENARIO_COMPLETADO, () => {
                setTimeout(() => actualizarFases(), 100);
            });

            return () => {
                unsubscribeAtaqueMitigado();
                unsubscribeFaseCompletada();
                unsubscribeObjetivoCompletado();
                unsubscribeFaseNoCompletada();
                unsubscribeEscenarioCompletado();
            };
        } catch (error) {
            console.error('Error al suscribirse a eventos del controlador:', error);
        }
    }, []);

    return (
        <FasesContext.Provider
            value={{
                fases,
                faseActualIndex,
                actualizarFases,
            }}
        >
            {children}
        </FasesContext.Provider>
    );
};
