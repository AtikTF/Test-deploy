import { Transform } from "stream";
import { describe, it, beforeEach, expect } from "vitest";
import {
  ActivoComponent,
  DispositivoComponent,
  RouterComponent,
  Velocidad,
} from "../../src/ecs/components";
import { ECSManager } from "../../src/ecs/core";
import { SistemaMovimiento, SistemaRed } from "../../src/ecs/systems";
import {
  EstadoAtaqueDispositivo,
  TipoDispositivo,
} from "../../src/types/DeviceEnums";
import { TipoProtocolo } from "../../src/types/TrafficEnums";

/*describe("ECSManager", () => {
  let em: ECSManager;

  beforeEach(() => {
    em = new ECSManager();
  });

  
  describe("trafico", () => {
    it("enviar activos", () => {
      let entidadComputadoraEmisora = em.agregarEntidad(); // 0
      let entidadRouterIntermediario = em.agregarEntidad(); // 1
      let entidadComputadoraReceptora = em.agregarEntidad(); // 2
      let entidadRouterIntermediario2 = em.agregarEntidad(); // 3

      let redLan1 = em.agregarEntidad(); // 4
      let redLan2 = em.agregarEntidad(); // 5
      let redlan3 = em.agregarEntidad(); // 6
      let redWWW = em.agregarEntidad(); // 7
      em.agregarComponente(
        entidadComputadoraEmisora,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.WORKSTATION,
          EstadoAtaqueDispositivo.NORMAL,
          [redLan1, redWWW]
        )
      );

      em.agregarComponente(
        entidadComputadoraEmisora,
        new ActivoComponent([{ nombre: "Clave", contenido: "123" }])
      );

      em.agregarComponente(
        entidadComputadoraReceptora,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.WORKSTATION,
          EstadoAtaqueDispositivo.NORMAL,
          [redLan2, redlan3]
        )
      );

      em.agregarComponente(
        entidadRouterIntermediario,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.ROUTER,
          EstadoAtaqueDispositivo.NORMAL,
          [redLan1, redLan2]
        )
      );

      em.agregarComponente(
        entidadRouterIntermediario,
        new RouterComponent(false, {
          habilitado: true,
          reglas: [],
        })
      );

      em.agregarComponente(
        entidadRouterIntermediario2,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.ROUTER,
          EstadoAtaqueDispositivo.NORMAL,
          [redWWW]
        )
      );

      em.agregarComponente(
        entidadRouterIntermediario2,
        new RouterComponent(false, {
          habilitado: true,
          reglas: [],
        })
      );

      let sistemaRed = new SistemaRed();
      em.agregarSistema(sistemaRed);

      sistemaRed.enviarTrafico(
        entidadComputadoraEmisora,
        entidadComputadoraReceptora,
        TipoProtocolo.FTP,
        "hola"
      );

      console.log(
        em.getComponentes(entidadComputadoraEmisora)?.get(ActivoComponent)
      );

      expect(
        em.getComponentes(entidadComputadoraEmisora)?.get(ActivoComponent)
          ?.activos.length
      ).toBe(0);
      expect(
        em.getComponentes(entidadComputadoraReceptora)?.get(ActivoComponent)
          ?.activos.length
      ).toBe(1);
    });
  });


});*/

describe("ECSManager", () => {
  let em: ECSManager;

  beforeEach(() => {
    em = new ECSManager();
  });

  describe("traficoDobleRouter", () => {
    it("enviar activos entre doble router", () => {
      let entidadComputadoraEmisora = em.agregarEntidad(); // 0
      let entidadRouterIntermediario = em.agregarEntidad(); // 1
      let entidadComputadoraReceptora = em.agregarEntidad(); // 2
      let entidadRouterIntermediario2 = em.agregarEntidad(); // 3

      let redLan1 = em.agregarEntidad(); // 4
      let redLan2 = em.agregarEntidad(); // 5
      let redEntreRouters = em.agregarEntidad(); //6

      em.agregarComponente(
        entidadComputadoraEmisora,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.WORKSTATION,
          EstadoAtaqueDispositivo.NORMAL,
          [redLan1]
        )
      );

      em.agregarComponente(
        entidadComputadoraEmisora,
        new ActivoComponent([{ nombre: "Clave", contenido: "123" }])
      );

      em.agregarComponente(
        entidadComputadoraReceptora,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.WORKSTATION,
          EstadoAtaqueDispositivo.NORMAL,
          [redLan2]
        )
      );

      em.agregarComponente(
        entidadRouterIntermediario,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.ROUTER,
          EstadoAtaqueDispositivo.NORMAL,
          [redLan1, redEntreRouters]
        )
      );

      em.agregarComponente(
        entidadRouterIntermediario,
        new RouterComponent(false, {
          habilitado: true,
          reglas: [],
        })
      );

      em.agregarComponente(
        entidadRouterIntermediario2,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.ROUTER,
          EstadoAtaqueDispositivo.NORMAL,
          [redEntreRouters, redLan2]
        )
      );

      em.agregarComponente(
        entidadRouterIntermediario2,
        new RouterComponent(false, {
          habilitado: true,
          reglas: [],
        })
      );

      let sistemaRed = new SistemaRed();
      em.agregarSistema(sistemaRed);

      sistemaRed.enviarTrafico(
        entidadComputadoraEmisora,
        entidadComputadoraReceptora,
        TipoProtocolo.FTP,
        "hola"
      );

      console.log(
        em.getComponentes(entidadComputadoraEmisora)?.get(ActivoComponent)
      );

      expect(
        em.getComponentes(entidadComputadoraEmisora)?.get(ActivoComponent)
          ?.activos.length
      ).toBe(0);
      expect(
        em.getComponentes(entidadComputadoraReceptora)?.get(ActivoComponent)
          ?.activos.length
      ).toBe(1);
    });
  });
});
