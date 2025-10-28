import { EstadoAtaqueDispositivo } from "../../types/DeviceEnums";
import { AtaqueComponent, DispositivoComponent, TiempoComponent } from "../components";
import { Sistema, type Entidad } from "../core";

export class SistemaAtaque extends Sistema {
    public componentesRequeridos: Set<Function> = new Set([AtaqueComponent]);

    public actualizar(entidades: Set<Entidad>): void {
        //
    }

    public ejecutarAtaque(entidadDispositivo: Entidad, ataque: AtaqueComponent, entidadTiempo: Entidad): void {
        /*const container1 = this.ecsManager.getComponentes(entidadAtaque);
        if (!container1) return;
        const ataque = container1.get(AtaqueComponent);*/
        console.log("Ejecutando ataque para entidad dispositivo:", entidadDispositivo);
        const container2 = this.ecsManager.getComponentes(entidadTiempo);
        if (!container2) return;
        const tiempo = container2.get(TiempoComponent);

        const container3 = this.ecsManager.getComponentes(entidadDispositivo);
        if(!container3) return;
        const dispositivoAAtacar = container3.get(DispositivoComponent);

        if(tiempo.transcurrido == ataque.tiempoEnOcurrir){
            dispositivoAAtacar.estadoAtaque = EstadoAtaqueDispositivo.COMPROMETIDO;
            console.log("cambio hecho en estado de dispositivo");
            console.log("entidad:", entidadDispositivo);
            console.log(dispositivoAAtacar.estadoAtaque);
            console.log(this.ecsManager.getEntidades());
            this.ecsManager.emit("eventoAtaque", ataque);
        }
    }
}
