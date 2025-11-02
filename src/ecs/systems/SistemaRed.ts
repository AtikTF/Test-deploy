import { ActivoComponent, DispositivoComponent } from "../components";
import { RedComponent } from "../components";
import { Sistema } from "../core";

export class SistemaRed extends Sistema {
    public componentesRequeridos = new Set([ActivoComponent]);
    
    public enviarActivo(entidadDispEnvio: number, entidadDispReceptor: number, activo: any) {
        const c1 = this.ecsManager.getComponentes(entidadDispEnvio);
        const dispEnvio = c1?.get(DispositivoComponent)?.nombre;
        const redes = this.getRedes();

        const c2 = this.ecsManager.getComponentes(entidadDispReceptor);
        const dispReceptor = c2?.get(DispositivoComponent)?.nombre;
        const activosDispR = c2?.get(ActivoComponent)?.activos;

        // Verificamos que el receptor esté también conectado en al menos una red del de envío
        let incluyeAmbosDisp: boolean = false;
        redes.forEach((red: RedComponent) => {
            if(red.dispositivosConectados.includes(dispEnvio!) &&
               red.dispositivosConectados.includes(dispReceptor!)){
                incluyeAmbosDisp = true; 
            }
        });

        if (!incluyeAmbosDisp){
            console.log("El dispositivo receptor no está conectado a una red del dispositivo de envío");
            return;
        }

        // Verificamos si el receptor ya tiene el activo, si lo tiene entonces no se hace nada
        // (De momento así porque no le veo algo útil en que tenga copias del mismo activo)
        if (activosDispR?.some(a => a.nombre === activo.nombre && a.contenido === activo.contenido)){
            console.log("El dispositivo receptor ya contiene activo:", activo.nombre);
            return;
        }
         
        activosDispR?.push(activo);

        this.ecsManager.emit("red:activoEnviado", {
            nombreActivo: activo.nombre,
            d1: dispEnvio,
            d2: dispReceptor
        });
    }

    private getRedes(): RedComponent[] {
        const redes: RedComponent[] = [];
        this.ecsManager.getEntidades().forEach((container) => {
            if(container.tiene(RedComponent)) redes.push(container.get(RedComponent)!)
        });
        return redes;
    }
}
