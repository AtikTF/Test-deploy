import type { ECSManager } from "../../core/ECSManager";
import { EventosRed, EventosFirewall } from "../../../types/EventosEnums";
import type { TipoProtocolo, RegistroTrafico, RegistroFirewallBloqueado, RegistroFirewallPermitido } from "../../../types/TrafficEnums";

/**
 * Servicio responsable de emitir eventos relacionados con la red
 */
export class EventoRedService {
    constructor(private ecsManager: ECSManager) {}

    // Emite evento cuando el tráfico es permitido por el firewall
    emitirEventoPermitido(origen: string, destino: string, protocolo: TipoProtocolo): void {
        const registro: RegistroFirewallPermitido = {
            origen,
            destino,
            protocolo,
            mensaje: `Conexión permitida: ${origen} → ${destino} [${protocolo}]`,
            tipo: 'PERMITIDO'
        };
        
        this.ecsManager.emit(EventosFirewall.TRAFICO_PERMITIDO, registro);
    }

    // Emite evento cuando el tráfico es bloqueado por el firewall
    emitirEventoBloqueado(origen: string, destino: string, protocolo: TipoProtocolo, razon?: string): void {
        const registro: RegistroFirewallBloqueado = {
            origen,
            destino,
            protocolo,
            mensaje: `Conexión bloqueada: ${origen} → ${destino} [${protocolo}]${razon ? ` - Razón: ${razon}` : ''}`,
            tipo: 'BLOQUEADO',
            razon
        };
        
        this.ecsManager.emit(EventosFirewall.TRAFICO_BLOQUEADO, registro);
    }

    // Registra tráfico exitoso
    registrarTrafico(origen: string, destino: string, protocolo: TipoProtocolo): void {
        const registro: RegistroTrafico = {
            origen,
            destino,
            protocolo
        };

        this.ecsManager.emit(EventosRed.TRAFICO_ENVIADO, registro);
    }

    // Emite evento de envío de activo
    emitirActivoEnviado(nombreActivo: string, origen: string, destino: string): void {
        this.ecsManager.emit(EventosRed.RED_ACTIVO_ENVIADO, {
            nombreActivo,
            d1: origen,
            d2: destino
        });
    }
}
