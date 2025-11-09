import { ActivoComponent, RouterComponent, DispositivoComponent } from "../components";
import { Sistema, type Entidad } from "../core";
import { TipoProtocolo } from "../../types/TrafficEnums";
import type { DireccionTrafico } from "../../types/FirewallTypes";
import {
    ConectividadService,
    EventoRedService,
    FirewallService,
    FirewallConfigService,
    TransferenciaService
} from "./red";

// Sistema encargado de gestionar redes, conectividad y firewalls
export class SistemaRed extends Sistema {
    public componentesRequeridos = new Set([ActivoComponent, RouterComponent]);

    // Servicios especializados
    private conectividadService: ConectividadService;
    private eventoService: EventoRedService;
    private firewallService: FirewallService;
    private firewallConfigService: FirewallConfigService;
    private transferenciaService: TransferenciaService;

    constructor() {
        super();
        this.eventoService = null as any;
        this.conectividadService = null as any;
        this.firewallService = null as any;
        this.firewallConfigService = null as any;
        this.transferenciaService = null as any;
    }

    // Inicializa servicios de forma lazy (solo la primera vez que se accede)
    private getEventoService(): EventoRedService {
        if (!this.eventoService) {
            this.eventoService = new EventoRedService(this.ecsManager);
        }
        return this.eventoService;
    }

    private getConectividadService(): ConectividadService {
        if (!this.conectividadService) {
            this.conectividadService = new ConectividadService(this.ecsManager);
        }
        return this.conectividadService;
    }

    private getFirewallService(): FirewallService {
        if (!this.firewallService) {
            this.firewallService = new FirewallService(
                this.getConectividadService(),
                this.getEventoService(),
                this.ecsManager
            );
        }
        return this.firewallService;
    }

    private getFirewallConfigService(): FirewallConfigService {
        if (!this.firewallConfigService) {
            this.firewallConfigService = new FirewallConfigService(this.ecsManager);
        }
        return this.firewallConfigService;
    }

    private getTransferenciaService(): TransferenciaService {
        if (!this.transferenciaService) {
            this.transferenciaService = new TransferenciaService(
                this.ecsManager,
                this.getEventoService()
            );
        }
        return this.transferenciaService;
    }

    // Conecta un dispositivo a una red específica
    public asignarRed(entidadDisp: Entidad, entidadRed: Entidad): void {
        const dispositivo = this.ecsManager.getComponentes(entidadDisp)?.get(DispositivoComponent);
        
        // Verificamos que el dispositivo no esté en la red
        if(dispositivo?.redes.some((d) => d === entidadRed)){
            return;
        }

        dispositivo?.redes.push(entidadRed);
    }

    // Envía tráfico entre dos dispositivos validando conectividad y firewall
    // null = Internet (sin dispositivo físico)
    public enviarTrafico(
        entidadOrigen: Entidad | null,
        entidadDestino: Entidad | null,
        protocolo: TipoProtocolo,
        payload: unknown
    ): boolean {
        // Si origen o destino es Internet (null), manejar de forma especial
        const nombreOrigen = entidadOrigen 
            ? this.ecsManager.getComponentes(entidadOrigen)?.get(DispositivoComponent)?.nombre ?? "Desconocido"
            : "Internet";
        const nombreDestino = entidadDestino
            ? this.ecsManager.getComponentes(entidadDestino)?.get(DispositivoComponent)?.nombre ?? "Desconocido"
            : "Internet";

        // Si ambos son Internet, no tiene sentido
        if (!entidadOrigen && !entidadDestino) {
            console.error("No se puede enviar tráfico entre Internet e Internet");
            return false;
        }

        // Si al menos uno es Internet, verificar firewall del router
        if (!entidadOrigen || !entidadDestino) {
            if (!this.getFirewallService().validarFirewall(entidadOrigen, entidadDestino, protocolo)) {
                return false;
            }
            
            this.getEventoService().registrarTrafico(nombreOrigen, nombreDestino, protocolo);
            return true;
        }

        const dispOrigen = this.ecsManager.getComponentes(entidadOrigen)?.get(DispositivoComponent);
        const dispDestino = this.ecsManager.getComponentes(entidadDestino)?.get(DispositivoComponent);
        
        if (!dispOrigen || !dispDestino) {
            return false;
        }

        if (!this.getConectividadService().estanConectados(entidadOrigen, entidadDestino)) {
            return false;
        }

        if (!this.getFirewallService().validarFirewall(entidadOrigen, entidadDestino, protocolo)) {
            return false;
        }

        switch(protocolo){
            case TipoProtocolo.FTP: {
                const activo = payload as string;
                this.getTransferenciaService().enviarActivo(entidadOrigen, entidadDestino, activo);
                break;
            }
            // Próximamente para otros protocolos
        }

        // Tráfico exitoso
        this.getEventoService().registrarTrafico(dispOrigen.nombre, dispDestino.nombre, protocolo);
        
        return true;
    }

    public toggleFirewall(entidadRouter: Entidad, habilitado: boolean): void {
        this.getFirewallConfigService().toggleFirewall(entidadRouter, habilitado);
    }

    public agregarReglaFirewall(
        entidadRouter: Entidad,
        protocolo: TipoProtocolo,
        accion: "PERMITIR" | "DENEGAR",
        direccion: DireccionTrafico
    ): void {
        this.getFirewallConfigService().agregarReglaFirewall(entidadRouter, protocolo, accion, direccion);
    }

    public agregarExcepcionFirewall(
        entidadRouter: Entidad,
        protocolo: TipoProtocolo,
        entidadDispositivo: Entidad,
        accion: "PERMITIR" | "DENEGAR",
        direccion: DireccionTrafico
    ): void {
        this.getFirewallConfigService().agregarExcepcionFirewall(
            entidadRouter,
            protocolo,
            entidadDispositivo,
            accion,
            direccion
        );
    }

    public setPoliticaFirewall(
        entidadRouter: Entidad,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        this.getFirewallConfigService().setPoliticaFirewall(entidadRouter, politica);
    }

    public setPoliticaFirewallSaliente(
        entidadRouter: Entidad,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        this.getFirewallConfigService().setPoliticaFirewallSaliente(entidadRouter, politica);
    }

    public setPoliticaFirewallEntrante(
        entidadRouter: Entidad,
        politica: "PERMITIR" | "DENEGAR"
    ): void {
        this.getFirewallConfigService().setPoliticaFirewallEntrante(entidadRouter, politica);
    }
}
