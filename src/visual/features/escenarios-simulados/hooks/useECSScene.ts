import { useState, useEffect, useRef } from "react";
import { ECSManager } from "../../../../ecs/core/ECSManager";
import type { Entidad } from "../../../../ecs/core/Componente";
import {
  Transform,
  MuebleComponent,
  DispositivoComponent,
  EspacioComponent,
  TiempoComponent,
} from "../../../../ecs/components";
import { ScenarioBuilder } from "../../../../ecs/utils/ScenarioBuilder";
import { useEscenarioActual } from "../../../common/contexts/EscenarioContext";
import { SistemaTiempo } from "../../../../ecs/systems";

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

  // Usar un singleton a nivel de módulo para que múltiples hooks/componentes compartan el mismo ECS
  // (Header y la escena deben controlar la misma simulación)
  // Inicializamos perezosamente si no existe
  if (!(globalThis as any).__simECS) {
    const ecs = new ECSManager();
    const timeEntity = ecs.agregarEntidad();
    ecs.agregarComponente(timeEntity, new TiempoComponent());
    const sistemaTiempo = new SistemaTiempo();
    ecs.agregarSistema(sistemaTiempo);

    // Almacenar en globalThis para accesibilidad entre componentes/hook invocaciones
    (globalThis as any).__simECS = {
      ecsManager: ecs,
      timeEntity,
      sistemaTiempo,
      builder: null as ScenarioBuilder | null,
    };
  }

  // Referencias al singleton
  ecsManagerRef.current = (globalThis as any).__simECS.ecsManager as ECSManager;
  const timeEntity = (globalThis as any).__simECS.timeEntity as Entidad;
  const sistemaTiempo = (globalThis as any).__simECS.sistemaTiempo as SistemaTiempo;
  builderRef.current = (globalThis as any).__simECS.builder as ScenarioBuilder | null;

  useEffect(() => {
    // Prevenir doble inicialización en React StrictMode
    if (inicializadoRef.current) {
      return;
    }
    inicializadoRef.current = true;
    
    const ecsManager = ecsManagerRef.current!;
    const builder = new ScenarioBuilder(ecsManager);

    // Construir el escenario desde el context
    builder.construirDesdeArchivo(escenario);

    builderRef.current = builder;
  // Guardar builder en singleton para posibles futuras referencias
  (globalThis as any).__simECS.builder = builder;

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
    iniciar:() => {
      sistemaTiempo.iniciar(timeEntity);
    },
    pause:() =>{
      console.log("useECSScene: pausar");
      sistemaTiempo.pausar(timeEntity);
    },
    resume: () => {
      console.log("useECSScene: reanudar");
      sistemaTiempo.reanudar(timeEntity);
    }
    ,
    isPaused: () => {
      const ecs = ecsManagerRef.current;
      if (!ecs) return false;
      const cont = ecs.getComponentes(timeEntity);
      if (!cont) return false;
      const tiempo = cont.get(TiempoComponent);
      return !!tiempo.pausado;
    }
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
