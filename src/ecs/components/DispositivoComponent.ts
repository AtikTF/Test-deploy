import { Componente } from "../core/Componente";
import { TipoDispositivo } from "../../visual/types/DeviceEnums";

export class DispositivoComponent extends Componente {
  constructor(
    public tipo: TipoDispositivo,
    public nombre: string = "",
    public sistemaOperativo: string = "",
    public hardware: string = ""
  ) {
    super();
  }
}
