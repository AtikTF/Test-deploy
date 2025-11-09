import { Componente, type Entidad } from "../core";

export class RedComponent extends Componente {
    constructor(
        public nombre: string,
        public color: string
    ){
        super();
    }
}
