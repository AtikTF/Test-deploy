import type { ECSManager } from "../../core/ECSManager";
import {
  RouterComponent,
  RedComponent,
  ZonaComponent,
  DispositivoComponent,
} from "../../components";
import type { Entidad } from "../../core/Componente";
import { SistemaRelaciones } from "../SistemaRelaciones";

export class ConectividadService {
  constructor(private ecsManager: ECSManager) {}

  public obtenerRedesDeZona(zonaEntidad: Entidad): Entidad[] {
    const sistemasArray = Array.from(this.ecsManager.getSistemas().keys());
    const sistemasRelaciones = sistemasArray.filter(
      (s): s is SistemaRelaciones => s instanceof SistemaRelaciones
    );
    for (const sistema of sistemasRelaciones) {
      const hijos = sistema.obtenerHijos(zonaEntidad);
      if (hijos.length > 0) {
        const primerHijo = this.ecsManager
          .getComponentes(hijos[0])
          ?.get(RedComponent);
        if (primerHijo) {
          return hijos;
        }
      }
    }

    return [];
  }

  private obtenerRedesDelDispositivo(entidadDispositivo: Entidad): Entidad[] {
    const disp = this.ecsManager
      .getComponentes(entidadDispositivo)
      ?.get(DispositivoComponent);
    return disp?.redes || [];
  }

  private compartanRed(entidadDisp1: Entidad, entidadDisp2: Entidad): boolean {
    const redesDisp1 = this.obtenerRedesDelDispositivo(entidadDisp1);
    const redesDisp2 = this.obtenerRedesDelDispositivo(entidadDisp2);

    // Verificar si comparten alguna red
    return redesDisp1.some((red1) => redesDisp2.includes(red1));
  }

  /**
   * Verifica si dos dispositivos están conectados (pueden comunicarse)
   * Nueva arquitectura: Los dispositivos tienen referencias a redes (DispositivoComponent.redes)
   *
   * Casos:
   * 1. Ambos en la misma red → Conectados
   * 2. Uno en red, otro externo + router con internet → Conectados
   * 3. Ambos en redes diferentes pero routers con internet → Conectados
   */
  estanConectados(entidadOrigen: Entidad, entidadDestino: Entidad): boolean {
    /*
    
        * Permitir tráfico por Internet entre distintas zonas
            - El router debe ser el unico con acceso a Internet
            - Se debe validar que ambas zonas tengan un router conectado a Internet.
            

        * Permitir tráfico entre distintas redes de misma zona ---- FINALIZADO
            Escenario 1:	
            - Los dispositivos están en distintas redes X
            - Ambos deben estar conectados al mismo router X
            
            Escenario 2: 
            - Ambos dispositivos están conectados en distintas redes y distintos router
            - Estos dos routers están conectados por una misma red
            - Se permite el trafico
    */

    const redesOrigen = this.obtenerRedesDelDispositivo(entidadOrigen);
    const redesDestino = this.obtenerRedesDelDispositivo(entidadDestino);

    // una de las dos ni siquiera tiene redes

    if (redesOrigen.length === 0 || redesDestino.length === 0) {
      return false;
    }

    // Caso 1: Si comparten alguna red, están directamente conectados
    if (this.compartanRed(entidadOrigen, entidadDestino)) {
      return true;
    }

    // Permitir tráfico entre distintas redes de misma zona a través de router
    const routersOrigen =
      this.buscarRoutersConectadoADispositivo(entidadOrigen);
    const routersDestino =
      this.buscarRoutersConectadoADispositivo(entidadDestino);
    // si uno de los dos no tiene routers conectados, no están conectados
    if (routersOrigen.length === 0 || routersDestino.length === 0) {
      return false;
    }

    // Verificar si hay algún router común entre ambos dispositivos
    if (
      routersOrigen.some((routerO) =>
        routersDestino.some((routerD) => routerO.entidad === routerD.entidad)
      )
    ) {
      return true;
    }

    routersOrigen.forEach((routerO, index) => {
      console.log("Router Origen ", index);
      console.log(
        this.ecsManager
          .getComponentes(routerO.entidad)
          ?.get(DispositivoComponent)?.redes
      );
    });
    routersDestino.forEach((routerO, index) => {
      console.log("Router Destino ", index);
      console.log(
        this.ecsManager
          .getComponentes(routerO.entidad)
          ?.get(DispositivoComponent)?.redes
      );
    });
    //

    return false;
  }

  buscarRoutersConectadoADispositivo(
    entidadDispositivo: Entidad
  ): Array<{ entidad: Entidad; redesEnComun: Entidad[] }> {
    const routersConectados: Array<{
      entidad: Entidad;
      redesEnComun: Entidad[];
    }> = [];
    const redesDelDispositivo =
      this.obtenerRedesDelDispositivo(entidadDispositivo);

    if (redesDelDispositivo.length === 0) {
      return [];
    }

    this.ecsManager.getEntidades().forEach((container, entidad) => {
      if (container.tiene(RouterComponent)) {
        const redesDelRouter = this.obtenerRedesDelDispositivo(entidad);
        // Verificar si el router tiene alguna red en común con el dispositivo
        const redesEnComun = redesDelDispositivo.filter((redId) =>
          redesDelRouter.includes(redId)
        );

        if (redesEnComun.length > 0) {
          routersConectados.push({ entidad, redesEnComun });
        }
      }
    });

    return routersConectados;
  }

  //   buscarRouterConDispositivo(
  //     entidadDispositivo: Entidad
  //   ): { router: RouterComponent; zonaId: Entidad } | null {
  //     // 1. Obtener las redes del dispositivo
  //     const redesDelDispositivo =
  //       this.obtenerRedesDelDispositivo(entidadDispositivo);
  //     if (redesDelDispositivo.length === 0) return null;

  //     // 2. Encontrar la zona que contiene alguna de estas redes
  //     for (const [zonaEntidad, container] of this.ecsManager.getEntidades()) {
  //       const zona = container.get(ZonaComponent);
  //       if (!zona) continue;

  //       // Obtener las redes de esta zona usando SistemaRelaciones
  //       const redesZona = this.obtenerRedesDeZona(zonaEntidad);

  //       // Verificar si la zona contiene alguna red del dispositivo
  //       const zonaContieneDispositivo = redesZona.some((redId) =>
  //         redesDelDispositivo.includes(redId)
  //       );

  //       if (!zonaContieneDispositivo) continue;

  //       // 3. Buscar el router en esta zona
  //       // El router es un dispositivo que tiene redes de esta zona
  //       for (const [
  //         routerEntidad,
  //         routerContainer,
  //       ] of this.ecsManager.getEntidades()) {
  //         const router = routerContainer.get(RouterComponent);
  //         if (!router) continue;

  //         // Verificar si este router tiene redes de esta zona
  //         const redesRouter = this.obtenerRedesDelDispositivo(routerEntidad);
  //         const routerEnZona = redesRouter.some((redId) =>
  //           redesZona.includes(redId)
  //         );
  //         if (routerEnZona) {
  //           return { router, zonaId: zonaEntidad };
  //         }
  //       }
  //     }

  //     return null;
  //   }

  obtenerRoutersDeRed(
    entidadDisp1: Entidad,
    entidadDisp2: Entidad
  ): RouterComponent[] {
    const routersAplicables: RouterComponent[] = [];

    return routersAplicables;
  }
}
