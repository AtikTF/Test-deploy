import { useFasesContext } from '../contexts/FasesContext';

export const useFases = () => {
    const { fases, faseActualIndex, completarObjetivo, avanzarFase, retrocederFase, navegarAFase } = useFasesContext();

    const faseActual = fases[faseActualIndex];

    const puedaAvanzar = faseActual?.completada ?? false;

    return {
        fases,
        faseActual,
        faseActualIndex,
        completarObjetivo,
        avanzarFase,
        retrocederFase,
        navegarAFase,
        puedaAvanzar,
    };
};
