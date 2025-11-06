import { Componente } from "../core";
import type { ConfiguracionFirewall } from "../../types/FirewallTypes";

/**
 * Componente que representa un router de red
 * Almacena configuración de conectividad y firewall
 */
export class RouterComponent extends Componente {
    constructor(
        public conectadoAInternet: boolean,
        public firewall: ConfiguracionFirewall
    ) {
        super();
    }
}
