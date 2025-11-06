import { describe, test, expect, beforeEach } from 'vitest'
import { ECSManager } from '../src/ecs/core';
import { SistemaRed } from '../src/ecs/systems';
import { TipoProtocolo } from '../src/types/TrafficEnums';
import { 
  DispositivoComponent, 
  RedComponent
} from '../src/ecs/components';
import { EstadoAtaqueDispositivo, TipoDispositivo } from '../src/types/DeviceEnums';

describe("SistemaTrafico", () => {
  let em: ECSManager;
  let sistema: SistemaRed;

  beforeEach(() => {
    em = new ECSManager();
    sistema = new SistemaRed();
    em.agregarSistema(sistema);
  });

  test("permite tráfico entre dispositivos de la misma red", () => {
    // Crear dos dispositivos
    const dispositivo1 = em.agregarEntidad();
    em.agregarComponente(dispositivo1, 
      new DispositivoComponent("disp1", "Linux", "hw", 
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const dispositivo2 = em.agregarEntidad();
    em.agregarComponente(dispositivo2,
      new DispositivoComponent("disp2", "Windows", "hw",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    // Crear red que conecta ambos dispositivos
    const red = em.agregarEntidad();
    em.agregarComponente(red, 
      new RedComponent("LAN", "#00FF00", ["disp1", "disp2"], "zona1")
    );

    // Intentar tráfico (cualquier protocolo funciona)
    const resultado = sistema.enviarTrafico("disp1", "disp2", TipoProtocolo.SSH, null);

    expect(resultado).toBe(true);
  });

  test("bloquea tráfico entre dispositivos de diferentes redes", () => {
    // Crear dos dispositivos
    const dispositivo1 = em.agregarEntidad();
    em.agregarComponente(dispositivo1,
      new DispositivoComponent("disp1", "Linux", "hw",
        TipoDispositivo.WORKSTATION, EstadoAtaqueDispositivo.NORMAL)
    );

    const dispositivo2 = em.agregarEntidad();
    em.agregarComponente(dispositivo2,
      new DispositivoComponent("disp2", "Windows", "hw",
        TipoDispositivo.SERVER, EstadoAtaqueDispositivo.NORMAL)
    );

    // Crear dos redes DIFERENTES
    const red1 = em.agregarEntidad();
    em.agregarComponente(red1,
      new RedComponent("LAN1", "#00FF00", ["disp1"], "zona1")
    );

    const red2 = em.agregarEntidad();
    em.agregarComponente(red2,
      new RedComponent("LAN2", "#FF0000", ["disp2"], "zona2")
    );

    // Intentar tráfico entre redes diferentes (debe fallar)
    const resultado = sistema.enviarTrafico("disp1", "disp2", TipoProtocolo.SSH, null);

    expect(resultado).toBe(false);
  });
});
