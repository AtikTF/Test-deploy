import type { ECSManager } from "../../core/ECSManager";
import type { Entidad } from "../../core";
import { DispositivoComponent, RouterComponent } from "../../components";
import type { TipoProtocolo } from "../../../types/TrafficEnums";
import { DireccionTrafico, AccionFirewall } from "../../../types/FirewallTypes";
import type { Reglas } from "../../../types/FirewallTypes";

/**
 * Servicio para configurar el firewall de routers
 * Trabaja con bloqueosFirewall: Map<Entidad, Reglas[]>
 * donde Entidad representa una red
 */
export class FirewallConfigService {
    constructor(private ecsManager: ECSManager) {}

    /**
     * Agrega o actualiza una regla de bloqueo para una red específica
     */
    agregarReglaFirewall(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolo: TipoProtocolo,
        accion: AccionFirewall,
        direccion: DireccionTrafico
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        // Obtener reglas existentes para esta red
        const reglasExistentes = router.bloqueosFirewall.get(entidadRed) || [];
        
        // Filtrar reglas que coincidan con el mismo protocolo y dirección
        const reglasFiltradas = reglasExistentes.filter(regla => 
            !(regla.protocolo === protocolo && 
              (regla.direccion === direccion || regla.direccion === DireccionTrafico.AMBAS || direccion === DireccionTrafico.AMBAS))
        );
        
        // Agregar la nueva regla
        const nuevaRegla: Reglas = { accion, direccion, protocolo };
        router.bloqueosFirewall.set(entidadRed, [...reglasFiltradas, nuevaRegla]);
    }

    /**
     * Bloquea todos los protocolos especificados para una red
     */
    bloquearProtocolosEnRed(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolos: TipoProtocolo[],
        direccion: DireccionTrafico
    ): void {
        protocolos.forEach(protocolo => {
            this.agregarReglaFirewall(
                entidadRouter,
                entidadRed,
                protocolo,
                AccionFirewall.DENEGAR,
                direccion
            );
        });
    }

    /**
     * Permite múltiples protocolos eliminando sus reglas de bloqueo
     */
    permitirProtocolosEnRed(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolos: TipoProtocolo[],
        direccion: DireccionTrafico
    ): void {
        protocolos.forEach(protocolo => {
            this.eliminarRegla(
                entidadRouter,
                entidadRed,
                protocolo,
                direccion
            );
        });
    }

    /**
     * Obtiene todas las reglas configuradas para una red
     */
    obtenerReglasDeRed(entidadRouter: Entidad, entidadRed: Entidad): Reglas[] {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        
        if (!router) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return [];
        }

        return router.bloqueosFirewall.get(entidadRed) || [];
    }

    /**
     * Elimina una regla específica de una red
     */
    eliminarRegla(
        entidadRouter: Entidad,
        entidadRed: Entidad,
        protocolo: TipoProtocolo,
        direccion: DireccionTrafico
    ): void {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        const dispositivo = this.ecsManager.getComponentes(entidadRouter)?.get(DispositivoComponent);
        
        if (!router || !dispositivo) {
            console.error(`Router con entidad "${entidadRouter}" no encontrado`);
            return;
        }

        const reglasExistentes = router.bloqueosFirewall.get(entidadRed) || [];
        const reglasActualizadas = reglasExistentes.filter(regla => 
            !(regla.protocolo === protocolo && regla.direccion === direccion)
        );

        if (reglasActualizadas.length > 0) {
            router.bloqueosFirewall.set(entidadRed, reglasActualizadas);
        } else {
            router.bloqueosFirewall.delete(entidadRed);
        }

    }

    /**
     * Obtiene todas las redes con reglas de firewall configuradas
     */
    obtenerRedesConReglas(entidadRouter: Entidad): Entidad[] {
        const router = this.ecsManager.getComponentes(entidadRouter)?.get(RouterComponent);
        
        if (!router) {
            return [];
        }

        return Array.from(router.bloqueosFirewall.keys());
    }
}
