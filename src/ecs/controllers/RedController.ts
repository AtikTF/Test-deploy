import { EventosRed } from "../../types/EventosEnums";
import type { ECSManager } from "../core";
import { SistemaRed } from "../systems";

export class RedController {
  public ecsManager: ECSManager;
    
  private sistemaRed?: SistemaRed;

  private static instance: RedController | null = null;
  
  constructor(ecsManager: ECSManager){
      this.ecsManager = ecsManager;
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

    this.ecsManager.on(EventosRed.RED_ENVIAR_ACTIVO, (data: unknown) => {
      const d = data as { evento: unknown };
      this.sistemaRed?.enviarActivo(d.evento.infoAdicional.dispositivoEmisor,
                                    d.evento.infoAdicional.dispositivoReceptor,
                                    d.evento.infoAdicional.nombreActivo);
    });

    this.ecsManager.on(EventosRed.RED_ACTIVO_ENVIADO, (data: unknown) => {
      const d = data as { d1: string, d2: string, nombreActivo: string };
      console.log(`Se envió el activo "${d.nombreActivo}" desde ${d.d1} hacia ${d.d2}.`);
    });
  }
}
