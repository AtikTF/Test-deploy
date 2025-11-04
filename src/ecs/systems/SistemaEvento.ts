import { ObjetosManejables } from "../../types/AccionesEnums";
import { EstadoAtaqueDispositivo } from "../../types/DeviceEnums";
import { AtaqueComponent, DispositivoComponent, WorkstationComponent } from "../components";
import { Sistema, type Entidad } from "../core";
import type { ClaseComponente } from "../core/Componente";

export class SistemaEvento extends Sistema {
  public componentesRequeridos: Set<ClaseComponente> = new Set([
    AtaqueComponent,
  ]);

  public on(eventName: string, callback: (data: unknown) => void): () => void {
    return this.ecsManager.on(eventName, callback);
  }

  public ejecutarAtaque(
    entidadDispositivo: Entidad,
    ataque: AtaqueComponent
  ): void {
    const container3 = this.ecsManager.getComponentes(entidadDispositivo);
    if (!container3) return;
    const dispositivoAAtacar = container3.get(DispositivoComponent);
    if (!dispositivoAAtacar) return;

    if (!this.verificarCondicionMitigacion(entidadDispositivo, ataque.condicionMitigacion)) {
      dispositivoAAtacar.estadoAtaque = EstadoAtaqueDispositivo.COMPROMETIDO;
      this.ecsManager.emit("ataque:ataqueRealizado", { ataque });
    } else {
      this.ecsManager.emit("ataque:ataqueMitigado", { ataque });
    }
  }

  /* Se verifica la condición de mitigación para cada ataque */
  private verificarCondicionMitigacion(entidadDispositivo: Entidad, condicionMitigacion: unknown): boolean {
    // Se obtiene el dispositivo general sobre el cual se realiza el ataque
    const containerDispositivo = this.ecsManager.getComponentes(entidadDispositivo);
    if(!containerDispositivo) throw new Error(`No existe contenedor para Entidad: ${entidadDispositivo}`);
   
    /* A partir del objeto de la condición de mitigación (o sea, lo que se supone que debe haberse topado para
     * mitigar el ataque), se verifica (en el preciso momento del ataque) que lo demás de la condición de mitigación 
     * del ataque actual se haya cumplido; para lo cual, se extrae, en el momento del ataque, lo necesario para la 
     * verificación de la condición de mitigación. De esta forma ya no se depende del registro de acciones ni del tiempo 
     * en que estas hayan sido realizadas. */
    switch (condicionMitigacion?.objeto){
      case ObjetosManejables.CONFIG_WORKSTATION: {
        const dispositivo = containerDispositivo.get(WorkstationComponent);
        const config = dispositivo?.configuraciones.find((conf) => conf.nombreConfig == condicionMitigacion?.val.nombreConfig);
        if (config?.activado == condicionMitigacion?.val.activado) return true; 
        return false;
      }
      // Próximamente para otros dispositivos y/o configuraciones
    }

    return false;
  }
}
