import { useState, useEffect, useRef } from "react";
import { ECSManager } from "../../../../ecs/core/ECSManager";
import type { Entidad } from "../../../../ecs/core/Componente";
import {
  Transform,
  MuebleComponent,
  DispositivoComponent,
  EspacioComponent,
} from "../../../../ecs/components";
import { ScenarioBuilder } from "../../../../ecs/utils/ScenarioBuilder";
import { useEscenarioActual } from "../../../common/contexts/EscenarioContext";

export interface ECSSceneEntity {
  id: Entidad;
  position: [number, number, number];
  rotation: number;
  type: "espacio" | "dispositivo";
  muebleTipo?: string;
  dispositivoTipo?: string;
  nombre?: string;
}

export function useECSScene() {
  const escenario = useEscenarioActual();
  const [entities, setEntities] = useState<ECSSceneEntity[]>([]);
  const ecsManagerRef = useRef<ECSManager | null>(null);
  const builderRef = useRef<ScenarioBuilder | null>(null);
  const inicializadoRef = useRef(false);

  useEffect(() => {
    // Prevenir doble inicialización en React StrictMode
    if (inicializadoRef.current) {
      return;
    }
    inicializadoRef.current = true;
    const ecsManager = new ECSManager();

    ecsManagerRef.current = ecsManager;
    const builder = new ScenarioBuilder(ecsManager);

    // Construir el escenario desde el context
    builder.construirDesdeArchivo(escenario);

    builderRef.current = builder;

    console.log("Builder:", builder);
    console.log("Escenario usado:", escenario);

    const result = builder.construir();
    const extractedEntities = extractEntitiesFromBuilder(result, ecsManager);
    setEntities(extractedEntities);

    console.log("Entidades extraídas:", extractedEntities);
  }, [escenario]); // Re-ejecutar cuando cambie el escenario

  return {
    entities,
    ecsManager: ecsManagerRef.current,
    builder: builderRef.current,
  };
}

/**
 * Extrae las entidades del builder y las convierte al formato ECSSceneEntity
 */
function extractEntitiesFromBuilder(
  builderResult: {
    oficinas: Map<number, Entidad>;
    espacios: Map<string, Entidad>;
    dispositivos: Map<number, Entidad>;
    ecsManager: ECSManager;
  },
  ecsManager: ECSManager
): ECSSceneEntity[] {
  const sceneEntities: ECSSceneEntity[] = [];

  // Extraer espacios (mesas/racks)
  for (const [, entityId] of builderResult.espacios) {
    const components = ecsManager.getComponentes(entityId);
    if (!components) continue;

    const transform = components.get(Transform);
    const muebleComp = components.get(MuebleComponent);
    const espacioComp = components.get(EspacioComponent);

    if (transform && muebleComp && espacioComp) {
      sceneEntities.push({
        id: entityId,
        position: [transform.x, transform.y, transform.z],
        rotation: transform.rotacionY,
        type: "espacio",
        muebleTipo: muebleComp.tipo,
      });
    }
  }

  // Extraer dispositivos
  for (const [, entityId] of builderResult.dispositivos) {
    const components = ecsManager.getComponentes(entityId);
    if (!components) continue;

    const transform = components.get(Transform);
    const dispositivoComp = components.get(DispositivoComponent);

    if (transform && dispositivoComp) {
      sceneEntities.push({
        id: entityId,
        position: [transform.x, transform.y, transform.z],
        rotation: transform.rotacionY,
        type: "dispositivo",
        dispositivoTipo: dispositivoComp.tipo,
        nombre: dispositivoComp.nombre,
      });
    }
  }

  return sceneEntities;
}
