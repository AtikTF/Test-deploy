import { useState, useEffect /*useRef*/, useMemo } from "react";
import type { Entidad } from "../../../../ecs/core/Componente";
import { getDispositivoHeight } from "../config/modelConfig";
import { useEscenarioActual } from "../../../common/contexts/EscenarioContext";
import { EscenarioController } from "../../../../ecs/controllers/EscenarioController";

export interface ECSSceneEntity {
  id: Entidad;
  position: [number, number, number];
  rotation: number;
  type: "espacio" | "dispositivo";
  muebleTipo?: string;
  dispositivoTipo?: string;
  nombre?: string;
}

interface Transform {
  x: number;
  y: number;
  z: number;
  rotacionY: number;
}

interface ObjetoConTipo {
  tipo: string;
  [key: string]: any;
}

interface ProcessedEntity {
  objetoConTipo: ObjetoConTipo;
  position: [number, number, number];
  rotacionY: number;
  entityIndex: number;
}

export function useECSScene() {
  const escenario = useEscenarioActual();
  const [entities, setEntities] = useState<any>([]);
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);

  const escenarioController = useMemo(
    () => new EscenarioController(escenario),
    [escenario]
  );

  const { iniciarTiempo, pausarTiempo, reanudarTiempo } =
    escenarioController.ejecutarTiempo();

  const { toggleConfiguracionWorkstation } =
    escenarioController.efectuarPresupuesto(escenario.presupuestoInicial);

  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    escenarioController.iniciarEscenario();
    setEntities(escenarioController.builder.getEntidades());
    setIsPaused(escenarioController.estaTiempoPausado());

    // Suscribirse a eventos de tiempo
    const unsubscribeActualizado = escenarioController.on(
      "tiempo:actualizado",
      (data: { transcurrido: number; pausado: boolean }) => {
        setTiempoTranscurrido(data.transcurrido);
      }
    );

    const unsubscribePausado = escenarioController.on(
      "tiempo:pausado",
      (data: { transcurrido: number; pausado: boolean }) => {
        setTiempoTranscurrido(data.transcurrido);
      }
    );

    const unsubscribeReanudado = escenarioController.on(
      "tiempo:reanudado",
      (data: { transcurrido: number; pausado: boolean }) => {
        setTiempoTranscurrido(data.transcurrido);
      }
    );

    // desuscribirse cuando el componente se desmonte
    return () => {
      unsubscribeActualizado();
      unsubscribePausado();
      unsubscribeReanudado();
    };
  }, [escenarioController]);

  // procesar entidades desde los maps
  const processEntities = (): ProcessedEntity[] => {
    if (!entities) return [];

    const processedEntities: ProcessedEntity[] = [];

    Array.from(entities.values()).forEach((value: any, entityIndex: number) => {
      const componentes = Array.from(value.map.values()) as any[];

      const objetoConTipo = componentes.find(
        (obj: any): obj is ObjetoConTipo =>
          "tipo" in obj && typeof obj.tipo === "string"
      );

      const transform = componentes.find(
        (obj: any): obj is Transform =>
          "x" in obj &&
          "y" in obj &&
          "z" in obj &&
          "rotacionY" in obj &&
          typeof obj.x === "number" &&
          typeof obj.y === "number" &&
          typeof obj.z === "number" &&
          typeof obj.rotacionY === "number"
      );

      if (!objetoConTipo) return;

      // el offsetY es para poner el dispositivo a
      // la altura correcta sobre una mesa
      const offsetY = getDispositivoHeight(objetoConTipo.tipo);

      const position: [number, number, number] = transform
        ? [transform.x, transform.y + offsetY, transform.z]
        : [0, offsetY, 0];

      const rotacionY: number = transform?.rotacionY ?? 0;

      processedEntities.push({
        objetoConTipo,
        position,
        rotacionY,
        entityIndex,
      });
    });

    return processedEntities;
  };

  return {
    entities,
    ecsManager: escenarioController.escManager,
    builder: escenarioController.builder,
    processEntities,
    tiempoTranscurrido,
    iniciar: () => {
      iniciarTiempo();
      setIsPaused(escenarioController.estaTiempoPausado());
    },
    pause: () => {
      pausarTiempo();
      setIsPaused(true);
    },
    resume: () => {
      reanudarTiempo();
      setIsPaused(false);
    },
    isPaused,
    toggleConfigWorkstation: (
      entidadWorkstation: Entidad,
      nombreConfig: string
    ) => {
      toggleConfiguracionWorkstation(entidadWorkstation, nombreConfig);
    },
  };
}
