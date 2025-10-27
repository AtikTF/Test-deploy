import { Sistema } from "../core";
import { type Entidad } from "../core";
import { TiempoComponent } from "../components";

export class SistemaTiempo extends Sistema {
  public componentesRequeridos = new Set([TiempoComponent]);
  public intervalo: ReturnType<typeof setInterval> | null = null;

  public actualizar(entidades: Set<Entidad>): void {
    console.log("SistemaTiempo llamado. Entidades: ", entidades.size);
    // Aquí capaz van futuras funciones dependientes del tiempo
  }

  public pausar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;
    const tiempo = container.get(TiempoComponent);
    tiempo.pausado = true;
    // Emitir evento de pausa
    this.ecsManager.emit("tiempo:pausado", {
      transcurrido: tiempo.transcurrido,
      pausado: true,
    });
    //clearInterval(this.intervalo!);
    //this.intervalo = null;
  }

  public reanudar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;
    const tiempo = container.get(TiempoComponent);
    tiempo.pausado = false;
    // Emitir evento de reanudación
    this.ecsManager.emit("tiempo:reanudado", {
      transcurrido: tiempo.transcurrido,
      pausado: false,
    });
  }

  public iniciar(entidad: Entidad) {
    const container = this.ecsManager.getComponentes(entidad);
    if (!container) return;
    const tiempo = container.get(TiempoComponent);
    if (this.intervalo) return; // evitar múltiples intervalos
    this.intervalo = setInterval(() => {
      if (!tiempo.pausado) {
        tiempo.transcurrido += 1;
        // Emitir evento cuando el tiempo cambia
        this.ecsManager.emit("tiempo:actualizado", {
          transcurrido: tiempo.transcurrido,
          pausado: tiempo.pausado,
        });
      }
      console.log(`Tiempo transcurrido: ${tiempo.transcurrido}s`);
    }, 1000);
  }
}
