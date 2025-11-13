import { Transform } from "stream";
import { describe, it, beforeEach, expect } from "vitest";
import {
  ActivoComponent,
  DispositivoComponent,
  RouterComponent,
  Velocidad,
  ZonaComponent,
} from "../../src/ecs/components";
import { ECSManager } from "../../src/ecs/core";
import { SistemaMovimiento, SistemaRed } from "../../src/ecs/systems";
import {
  EstadoAtaqueDispositivo,
  TipoDispositivo,
} from "../../src/types/DeviceEnums";
import { TipoProtocolo } from "../../src/types/TrafficEnums";
import { FirewallBuilder } from "../../src/ecs/utils/FirewallBuilder";
import { AccionFirewall, DireccionTrafico } from "../../src/types/FirewallTypes";

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
/*
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
      let entidadRouterIntermediario3 = em.agregarEntidad(); // 4

      let redLan1 = em.agregarEntidad(); // 5
      let redLan2 = em.agregarEntidad(); // 6
      let redEntreRouters = em.agregarEntidad(); //7
      let redEntreRouters2 = em.agregarEntidad(); //8

      em.agregarComponente(
        entidadComputadoraEmisora,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.WORKSTATION,
          EstadoAtaqueDispositivo.NORMAL,
          []
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
      const firewallConfig1 = new FirewallBuilder()
            .build();
      em.agregarComponente(
        entidadRouterIntermediario,
        new RouterComponent(firewallConfig1, [])
      ); 

      em.agregarComponente(
        entidadRouterIntermediario2,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.ROUTER,
          EstadoAtaqueDispositivo.NORMAL,
          [redEntreRouters2, redLan2]
        )
      );
      const firewallConfig2 = new FirewallBuilder()
            .build();
      em.agregarComponente(
        entidadRouterIntermediario2,
        new RouterComponent(firewallConfig2, [])
      );
      em.agregarComponente(
        entidadRouterIntermediario3,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.ROUTER,
          EstadoAtaqueDispositivo.NORMAL,
          [redEntreRouters2, redEntreRouters]
        )
      );

      const firewallConfig3 = new FirewallBuilder()
            .build();
      em.agregarComponente(
        entidadRouterIntermediario3,
        new RouterComponent(firewallConfig3, [])
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
*/

/*describe("ECSManager", () => {
  let em: ECSManager;

  beforeEach(() => {
    em = new ECSManager();
  });

  describe("traficoPorInternet", () => {
    it("enviar activos por protocolo FTP y validar firewall", () => {
      let entidadComputadoraEmisora = em.agregarEntidad(); // 0
      let entidadRouterIntermediario = em.agregarEntidad(); // 1
      let entidadComputadoraReceptora = em.agregarEntidad(); // 2
      let entidadRouter2 = em.agregarEntidad(); // 3
      let entidadRouter3 = em.agregarEntidad(); // 4
      let entidadRouter4 = em.agregarEntidad(); // 5

      let redLan1 = em.agregarEntidad(); // 6
      let redLan2 = em.agregarEntidad();// 7
      let redEntreRouters = em.agregarEntidad(); // 8
      let redEntreRouters2 = em.agregarEntidad(); // 9
      let internet = em.agregarEntidad(); //10
      let zona1 = em.agregarEntidad(); //11
      let zona2 = em.agregarEntidad(); //12

      em.agregarComponente(zona1, new ZonaComponent(1, "Zona 1", "",[],[redLan1,internet],"zona")); 
      em.agregarComponente(zona2, new ZonaComponent(2, "Zona 2", "",[],[redLan2,internet,redEntreRouters2,redEntreRouters],"zona"));
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
        entidadComputadoraReceptora,
        new ActivoComponent([{ nombre: "Clave", contenido: "123" }])
      );

      em.agregarComponente(
        entidadRouterIntermediario,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.ROUTER,
          EstadoAtaqueDispositivo.NORMAL,
          [redLan1, internet]
        )
      );
  const firewallConfig1 = new FirewallBuilder()
      .build();
      em.agregarComponente(
        entidadRouterIntermediario,
        new RouterComponent(firewallConfig1, [])
      );

      em.agregarComponente(
        entidadRouter2,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.ROUTER,
          EstadoAtaqueDispositivo.NORMAL,
          [redEntreRouters , internet ]
        )
      );
        const firewallConfig2 = new FirewallBuilder()
            .build();
      em.agregarComponente(
        entidadRouter2,
        new RouterComponent(firewallConfig2, [])
      );

// 3
em.agregarComponente(
        entidadRouter3,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.ROUTER,
          EstadoAtaqueDispositivo.NORMAL,
          [redEntreRouters , redEntreRouters2 ]
        )
      );
        const firewallConfig3 = new FirewallBuilder()
        .agregarRegla(redEntreRouters, TipoProtocolo.SSH, AccionFirewall.DENEGAR, DireccionTrafico.SALIENTE)
            .build();
      em.agregarComponente(
        entidadRouter3,
        new RouterComponent(firewallConfig3, [])
      );

      



//4

em.agregarComponente(
        entidadRouter4,
        new DispositivoComponent(
          "",
          "",
          "",
          TipoDispositivo.ROUTER,
          EstadoAtaqueDispositivo.NORMAL,
          [redLan2, redEntreRouters2 ]
        )
      );
        const firewallConfig4 = new FirewallBuilder()
            .build();
      em.agregarComponente(
        entidadRouter4,
        new RouterComponent(firewallConfig4, [])
      );

let sistemaRed = new SistemaRed();
      em.agregarSistema(sistemaRed);
      sistemaRed.enviarTrafico(
        entidadComputadoraReceptora,
        entidadComputadoraEmisora,
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