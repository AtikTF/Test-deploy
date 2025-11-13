import { Componente } from "../core";
import type { Entidad } from "../core/Componente";
import type { Reglas } from "../../types/FirewallTypes";

export class RouterComponent extends Componente {
    constructor(
        public bloqueosFirewall: Map<Entidad, Reglas[]> = new Map(),
        public logsTrafico: any[] = []
    ) {
        super();
    }
}

