import { Componente } from "../core";
import type { ConfiguracionWorkstation } from "../../data/configuraciones/configWorkstation";

// Tiene el conjunto de total de configuraciones de un workstation.
export class WorkstationComponent extends Componente {
    constructor(
        public configuraciones: typeof ConfiguracionWorkstation,
    ){
        super();
    }
}
