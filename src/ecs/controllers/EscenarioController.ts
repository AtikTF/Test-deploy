import { PresupuestoComponent, TiempoComponent } from "../components";
import { ECSManager, type Entidad } from "../core";
import { SistemaPresupuesto, SistemaTiempo } from "../systems";
import { ScenarioBuilder } from "../utils/ScenarioBuilder";

export class EscenarioController {
  public escenario: any;
  public escManager: ECSManager;
  public builder!: ScenarioBuilder;

  private entidadTiempo?: Entidad;
  private sistemaTiempo?: SistemaTiempo;
  private sistemaPresupuesto?: SistemaPresupuesto;
  private entidadPresupuesto?: Entidad;

  private static instance: EscenarioController | null = null;

  private constructor(escenario: any) {
    this.escenario = escenario;
    this.escManager = new ECSManager();
  }

  // SINGLETON
  public static getInstance(escenario?: any): EscenarioController {
    if (!EscenarioController.instance) {
      if (!escenario) {
        throw new Error(
          "Debe proporcionar un escenario para inicializar el controlador la primera vez."
        );
      }
      EscenarioController.instance = new EscenarioController(escenario);
    } else if (escenario) {
      EscenarioController.instance.escenario = escenario;
    }
    return EscenarioController.instance;
  }

  public iniciarEscenario(): void {
    this.builder = new ScenarioBuilder(this.escManager);
    this.builder.construirDesdeArchivo(this.escenario);
  }

  public ejecutarTiempo(): any {
    if (!this.entidadTiempo) {
      this.entidadTiempo = this.escManager.agregarEntidad();
      this.escManager.agregarComponente(
        this.entidadTiempo,
        new TiempoComponent()
      );
      this.sistemaTiempo = new SistemaTiempo();
      this.escManager.agregarSistema(this.sistemaTiempo);
    }

    const iniciarTiempo = () =>
      this.sistemaTiempo!.iniciar(this.entidadTiempo!);
    const pausarTiempo = () => this.sistemaTiempo!.pausar(this.entidadTiempo!);
    const reanudarTiempo = () =>
      this.sistemaTiempo!.reanudar(this.entidadTiempo!);

    return { iniciarTiempo, pausarTiempo, reanudarTiempo };
  }

  public estaTiempoPausado(): boolean {
    if (!this.escManager || !this.entidadTiempo) {
      return false;
    }

    const cont = this.escManager.getComponentes(this.entidadTiempo);
    if (!cont) return false;

    const tiempo = cont.get(TiempoComponent);
    return tiempo?.pausado ?? false;
  }

  public get tiempoTranscurrido(): number {
    if (!this.escManager || !this.entidadTiempo) {
      return 0;
    }

    const cont = this.escManager.getComponentes(this.entidadTiempo);
    if (!cont) return 0;

    const tiempo = cont.get(TiempoComponent);
    return tiempo?.transcurrido ?? 0;
  }

  /**
   * Suscribe un callback a eventos del ECSManager
   * @param eventName Nombre del evento (ej: 'tiempo:actualizado')
   * @param callback Función a ejecutar cuando se emita el evento
   * @returns Función para desuscribirse del evento
   */
  public on(eventName: string, callback: (data: any) => void): () => void {
    return this.escManager.on(eventName, callback);
  }

  public efectuarPresupuesto(montoInicial: number): any {
    if (!this.entidadPresupuesto) {
      this.entidadPresupuesto = this.escManager.agregarEntidad();
      this.escManager.agregarComponente(
        this.entidadPresupuesto,
        new PresupuestoComponent(montoInicial)
      );
      this.sistemaPresupuesto = new SistemaPresupuesto();
      this.escManager.agregarSistema(this.sistemaPresupuesto);
    }

    const toggleConfiguracionWorkstation = (
      entidadWorkstation: Entidad,
      nombreConfig: string
    ) => {
      this.sistemaPresupuesto!.toggleConfiguracionWorkstation(
        this.entidadPresupuesto!,
        entidadWorkstation,
        nombreConfig
      );
    };

    return { toggleConfiguracionWorkstation };
  }

  public getPresupuestoActual(): number {
    if (!this.escManager || !this.entidadPresupuesto) {
      return 0;
    }
    const cont = this.escManager.getComponentes(this.entidadPresupuesto);
    if (!cont) return 0;

    const presupuesto = cont.get(PresupuestoComponent);
    return presupuesto?.monto ?? 0;
  }
}
