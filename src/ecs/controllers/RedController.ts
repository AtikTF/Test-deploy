import { TipoDispositivo } from "../../types/DeviceEnums";
import type { PerfilClienteVPN, PerfilVPNGateway } from "../../types/EscenarioTypes";
import { EventosRed, EventosVPN } from "../../types/EventosEnums";
import { AccionFirewall } from "../../types/FirewallTypes";
import type {
  DireccionTrafico,
  Reglas,
} from "../../types/FirewallTypes";
import { TipoProtocolo } from "../../types/TrafficEnums";
import { ClienteVPNComponent, DispositivoComponent, RouterComponent, VPNGatewayComponent } from "../components";
import type { ECSManager } from "../core";
import type { Entidad } from "../core/Componente";
import { SistemaEvento, SistemaJerarquiaEscenario, SistemaRed } from "../systems";
import { RedDisponibilidadService, TransferenciaService } from "../systems/red";

export class RedController {
  public ecsManager: ECSManager;

  private sistemaRed?: SistemaRed;
  private sistemaEvento?: SistemaEvento;
  private sistemaJerarquia?: SistemaJerarquiaEscenario;
  private transferenciaService?: TransferenciaService;
  private redDisponibilidadService?: RedDisponibilidadService;

  private static instance: RedController | null = null;

  constructor(ecsManager: ECSManager) {
    this.ecsManager = ecsManager;
    this.sistemaJerarquia = this.ecsManager.getSistema(
      SistemaJerarquiaEscenario
    );
  }

  // Singleton
  public static getInstance(ecsManager?: ECSManager): RedController {
    if (!RedController.instance) {
      if (!ecsManager) {
        throw new Error(
          "Debe proporcionar una instancia de ECSManager para inicializar el controlador la primera vez."
        );
      }
      RedController.instance = new RedController(ecsManager);
    } else if (ecsManager) {
      RedController.instance.ecsManager = ecsManager;
    }
    return RedController.instance;
  }

  public iniciarController(): void {
    if (!this.sistemaRed) {
      this.sistemaRed = new SistemaRed();
      this.ecsManager.agregarSistema(this.sistemaRed);
    }

    if (!this.sistemaEvento) {
      this.sistemaEvento = new SistemaEvento();
      this.ecsManager.agregarSistema(this.sistemaEvento);
    }

    if (!this.transferenciaService) {
      this.transferenciaService = new TransferenciaService(this.ecsManager);
    }

    if (!this.redDisponibilidadService) {
      this.redDisponibilidadService = new RedDisponibilidadService(this.ecsManager);
    }

    this.ecsManager.on(EventosRed.RED_ENVIAR_ACTIVO, (data: unknown) => {
      const d = data as {
        eventoConEntidades: {
          entidadEmisor: number;
          entidadReceptor: number;
          nombreActivo: string;
        };
      };
      this.sistemaRed?.enviarTrafico(
        d.eventoConEntidades.entidadEmisor,
        d.eventoConEntidades.entidadReceptor,
        TipoProtocolo.FTP,
        d.eventoConEntidades.nombreActivo
      );
    });

    this.ecsManager.on(EventosRed.RED_ACTIVO_ENVIADO, (data: unknown) => {
      const d = data as { nombreActivo: string; d1: string; d2: string };
      console.log(
        `Se envió un activo: ${d.nombreActivo}. Desde ${d.d1} hacia ${d.d2}.`
      );
    });

    this.ecsManager.on(EventosRed.RED_TRAFICO, (data: unknown) => {
      const d = data as {
        evento: {
          infoAdicional: {
            entidadOrigen: Entidad;
            entidadDestino: Entidad;
            protocolo: TipoProtocolo;
          };
        };
      };

      // Enviar tráfico directamente con el protocolo del evento
      const resultado = this.sistemaRed?.enviarTrafico(
        d.evento.infoAdicional.entidadOrigen,
        d.evento.infoAdicional.entidadDestino,
        d.evento.infoAdicional.protocolo,
        null
      );
      console.log("Tráfico enviado desde el controlador de red", resultado);
    });

    this.ecsManager.on(EventosVPN.VPN_SOLICITUD_CONEXION, (data: unknown) => {
      const d = data as {
        permisosConEntidades: {
          entidadOrigen: Entidad;
          entidadDestino: Entidad;
          permisos: unknown;
        };
      };

      this.sistemaRed?.enviarTrafico(
        d.permisosConEntidades.entidadOrigen,
        d.permisosConEntidades.entidadDestino,
        TipoProtocolo.VPN_GATEWAY,
        d.permisosConEntidades.permisos
      );
    });

    this.ecsManager.on(EventosVPN.VPN_CONEXION_RECHAZADA, (data: unknown) => {
      const d = data as string;
      console.log(d);
    });

    this.ecsManager.on(EventosVPN.VPN_CONEXION_ESTABLECIDA, (data: unknown) => {
      const d = data as string;
      console.log(d);
    });
  }

  public asignarRed(entidadDisp: Entidad, entidadRed: Entidad): void {
    if (!this.sistemaRed || !this.redDisponibilidadService) {
      console.error("Sistema de red no inicializado");
      return;
    }

    // Validar si el dispositivo puede conectarse a esta red
    if (!this.redDisponibilidadService.puedeConectarseARed(entidadDisp, entidadRed)) {
      return;
    }

    this.sistemaRed.asignarRed(entidadDisp, entidadRed);
  }

  public removerRed(entidadDisp: Entidad, entidadRed: Entidad): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.removerRed(entidadDisp, entidadRed);
  }

  public obtenerRedesDisponibles(entidadDisp: Entidad): Entidad[] {
    if (!this.redDisponibilidadService) return [];
    return this.redDisponibilidadService.obtenerRedesDisponibles(entidadDisp);
  }

  // ==================== MÉTODOS DE FIREWALL ====================

  public agregarReglaFirewall(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolo: TipoProtocolo,
    accion: AccionFirewall,
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.agregarReglaFirewall(
      entidadRouter,
      entidadRed,
      protocolo,
      accion,
      direccion
    );
  }


  public bloquearProtocolosEnRed(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolos: TipoProtocolo[],
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.bloquearProtocolosEnRed(
      entidadRouter,
      entidadRed,
      protocolos,
      direccion
    );
  }

  public permitirProtocolosEnRed(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolos: TipoProtocolo[],
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.permitirProtocolosEnRed(
      entidadRouter,
      entidadRed,
      protocolos,
      direccion
    );
  }


  public obtenerReglasDeRed(entidadRouter: Entidad, entidadRed: Entidad): Reglas[] {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return [];
    }
    return this.sistemaRed.obtenerReglasDeRed(entidadRouter, entidadRed);
  }


  public eliminarReglaFirewall(
    entidadRouter: Entidad,
    entidadRed: Entidad,
    protocolo: TipoProtocolo,
    direccion: DireccionTrafico
  ): void {
    if (!this.sistemaRed) {
      console.error("Sistema de red no inicializado");
      return;
    }
    this.sistemaRed.eliminarReglaFirewall(
      entidadRouter,
      entidadRed,
      protocolo,
      direccion
    );
  }

 
  public obtenerLogsTrafico(entidadRouter: Entidad): any[] {
    const router = this.obtenerRouter(entidadRouter);
    return router?.logsTrafico || [];
  }

  // ==================== FIN MÉTODOS DE FIREWALL ====================

  private obtenerRouter(entidadRouter: Entidad): RouterComponent | null {
    const container = this.ecsManager.getComponentes(entidadRouter);
    return container?.get(RouterComponent) || null;
  }

  public obtenerRedesDeRouter(entidadRouter: Entidad): Entidad[] {
    if (!this.sistemaRed) {
      return [];
    }
    return this.sistemaRed.obtenerRedesDeRouter(entidadRouter);
  }

  /**
   * Obtiene todos los dispositivos conectados a una red específica
   * @param entidadRed - La entidad de la red
   * @returns Array de entidades de dispositivos conectados a la red
   */
  public obtenerDispositivosPorRed(entidadRed: Entidad): Entidad[] {
    if (!this.sistemaRed) {
      return [];
    }
    return this.sistemaRed.obtenerDispositivosPorRed(entidadRed);
  }

  getDispositivosPorZona(entidadZona: Entidad): Entidad[] | undefined {
    let worksYServersDeZona: Entidad[] = [];
    for (const entidadDispositivo of this.sistemaJerarquia?.obtenerDispositivosDeZona(entidadZona)!) {
      const tipoDispositivo = this.ecsManager.getComponentes(entidadDispositivo)?.get(DispositivoComponent)?.tipo;
      if (tipoDispositivo === TipoDispositivo.WORKSTATION || tipoDispositivo === TipoDispositivo.SERVER)
        worksYServersDeZona.push(entidadDispositivo);
    }
    return worksYServersDeZona;
  }

  // Obtiene las zonas locales del router/gateway (la zona donde está el dispositivo)
  getZonasLocales(entidadDispositivo: Entidad): Entidad[] {
    const entidadZonaActual =
      this.sistemaJerarquia?.obtenerZonaDeDispositivo(entidadDispositivo);

    // Devuelve solo la zona actual del dispositivo como zona local
    return entidadZonaActual ? [entidadZonaActual] : [];
  }

  // Se pasa el id del dispositivo actual para filtrar su zona y que solo devuelva las zonas remotas
  getDominiosRemotos(entidadDispositivo: Entidad): Entidad[] {
    let dominiosRemotos: Entidad[] = [];
    const entidadZonaActual =
      this.sistemaJerarquia?.obtenerZonaDeDispositivo(entidadDispositivo);
    const entidadEscenario = this.sistemaJerarquia?.obtenerEscenarioDeZona(
      entidadZonaActual!
    );

    for (const entidadZona of this.sistemaJerarquia?.obtenerZonasDeEscenario(
      entidadEscenario!
    )!) {
      if (entidadZona != entidadZonaActual) dominiosRemotos.push(entidadZona);
    }

    return dominiosRemotos;
  }

  getPerfilesVPNGateway(
    entidadVpnGateway: Entidad
  ): PerfilVPNGateway[] | undefined {
    return this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(VPNGatewayComponent)?.perfilesVPNGateway;
  }

  agregarPerfilVPNGateway(
    entidadVpnGateway: Entidad,
    perfil: PerfilVPNGateway
  ): void {
    this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(VPNGatewayComponent)
      ?.perfilesVPNGateway.push(perfil);
  }

  // Se pasa la entidad del gateway de la cual se quiere eliminar un perfil, y se le pasa el índice de la tabla
  // que se corresponde con el array de perfiles (desde arriba de la tabla es el índice 0)
  removerPerfilVPNGateway(
    entidadVpnGateway: Entidad,
    indexEnTabla: number
  ): void {
    let actualesPerfilesGateway = this.ecsManager
      .getComponentes(entidadVpnGateway)
      ?.get(VPNGatewayComponent)?.perfilesVPNGateway;
    actualesPerfilesGateway = actualesPerfilesGateway?.splice(indexEnTabla, 1);
  }

  getPerfilesClienteVPN(
    entidadClienteVpn: Entidad
  ): PerfilClienteVPN[] | undefined {
    return this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(ClienteVPNComponent)?.perfilesClienteVPN;
  }

  agregarPerfilClienteVPN(
    entidadClienteVpn: Entidad,
    perfil: PerfilClienteVPN
  ): void {
    this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(ClienteVPNComponent)
      ?.perfilesClienteVPN.push(perfil);
  }

  removerPerfilClienteVPN(
    entidadClienteVpn: Entidad,
    indexEnTabla: number
  ): void {
    let actualesPerfilesCliente = this.ecsManager
      .getComponentes(entidadClienteVpn)
      ?.get(ClienteVPNComponent)?.perfilesClienteVPN;
    actualesPerfilesCliente = actualesPerfilesCliente?.splice(indexEnTabla, 1);
  }
}
