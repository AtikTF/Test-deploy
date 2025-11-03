import { ActivoComponent, DispositivoComponent } from "../components";
import { RedComponent } from "../components";
import { Sistema } from "../core";
import type { TipoProtocolo, RegistroTrafico } from "../../types/TrafficEnums";
import { PROTOCOLOS } from "../../types/TrafficEnums";

export class SistemaRed extends Sistema {
    public componentesRequeridos = new Set([ActivoComponent, RedComponent]);
    
    public enviarActivo(entidadDispEnvio: number, entidadDispReceptor: number, activo: any) {
        // Obtener dispositivos
        const dispEnvio = this.getDispositivo(entidadDispEnvio);
        const dispReceptor = this.getDispositivo(entidadDispReceptor);

        if (!dispEnvio || !dispReceptor) {
            console.log("Dispositivos no encontrados");
            return;
        }

        // Verificar conectividad
        if (!this.estanConectados(dispEnvio.nombre, dispReceptor.nombre)) {
            console.log("El dispositivo receptor no está conectado a una red del dispositivo de envío");
            return;
        }

        // Obtener lista de activos del receptor
        const activosDispR = this.ecsManager
            .getComponentes(entidadDispReceptor)
            ?.get(ActivoComponent)?.activos;

        if (!activosDispR) {
            console.log("El dispositivo receptor no tiene componente de activos");
            return;
        }

        // Verificar si el receptor ya tiene el activo
        if (activosDispR.some(a => a.nombre === activo.nombre && a.contenido === activo.contenido)) {
            console.log("El dispositivo receptor ya contiene activo:", activo.nombre);
            return;
        }
         
        // Transferir activo
        activosDispR.push(activo);

        this.ecsManager.emit("red:activoEnviado", {
            nombreActivo: activo.nombre,
            d1: dispEnvio.nombre,
            d2: dispReceptor.nombre
        });
    }

    public enviarTrafico(
        entidadOrigen: number,
        entidadDestino: number,
        protocolo: TipoProtocolo
    ): boolean {
        // Obtener dispositivos
        const dispOrigen = this.getDispositivo(entidadOrigen);
        const dispDestino = this.getDispositivo(entidadDestino);
        // Podría eliminarse si se asume que las entidades siempre son válidas
        if (!dispOrigen || !dispDestino) {
            console.log("Dispositivos no encontrados");
            return false;
        }

        // Verificar conectividad
        if (!this.estanConectados(dispOrigen.nombre, dispDestino.nombre)) {
            console.log(`${dispOrigen.nombre} y ${dispDestino.nombre} no están en la misma red`);
            return false;
        }

        // Tráfico exitoso
        this.mostrarInfoTrafico(dispOrigen.nombre, dispDestino.nombre, protocolo);
        this.registrarTrafico(dispOrigen.nombre, dispDestino.nombre, protocolo);
        
        return true;
    }

    private getRedes(): RedComponent[] {
        const redes: RedComponent[] = [];
        this.ecsManager.getEntidades().forEach((container) => {
            if(container.tiene(RedComponent)) redes.push(container.get(RedComponent)!)
        });
        return redes;
    }

    private getDispositivo(entidadId: number): DispositivoComponent | null {
        const componentes = this.ecsManager.getComponentes(entidadId);
        return componentes?.get(DispositivoComponent) || null;
    }

    private estanConectados(nombreDispOrigen: string, nombreDispDestino: string): boolean {
        const redes = this.getRedes();
        
        return redes.some((red: RedComponent) => 
            red.dispositivosConectados.includes(nombreDispOrigen) &&
            red.dispositivosConectados.includes(nombreDispDestino)
        );
    }
    private mostrarInfoTrafico(
        nombreOrigen: string,
        nombreDestino: string,
        protocolo: TipoProtocolo
    ): void {
        const protocoloInfo = PROTOCOLOS[protocolo];
        console.log(
            `Tráfico ${protocolo}: ${nombreOrigen} → ${nombreDestino} (puerto ${protocoloInfo.puerto})`
        );
    }

    

    private registrarTrafico(
        origen: string,
        destino: string,
        protocolo: TipoProtocolo
    ): void {
        const registro: RegistroTrafico = {
            origen,
            destino,
            protocolo
        };

        this.ecsManager.emit("trafico:enviado", registro);
    }
}
