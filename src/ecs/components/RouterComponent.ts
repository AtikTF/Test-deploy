import { Componente } from "../core";

export class RouterComponent extends Componente {
    constructor(
        public conectadoAInternet: boolean
        // public firewall  // Para la implementación del firewall después
    )
    {
        super();
    }
}
