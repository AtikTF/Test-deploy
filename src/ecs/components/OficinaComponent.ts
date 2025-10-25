import { Componente, type Entidad } from "../core/Componente";

/**
 * Representa una oficina que contiene espacios
 */
export class OficinaComponent extends Componente {
  public espacios: Entidad[] = [];

  constructor(public id: number, public nombre: string, public zonaId: number) {
    super();
  }

  agregarEspacio(entidadEspacio: Entidad): void {
    if (!this.espacios.includes(entidadEspacio)) {
      this.espacios.push(entidadEspacio);
    }
  }
}
