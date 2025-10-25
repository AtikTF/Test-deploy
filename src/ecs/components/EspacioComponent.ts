import { Componente, type Entidad } from "../core/Componente";

/**
 * Representa un espacio que puede contener dispositivos
 * Mantiene referencias a las entidades de dispositivos que contiene
 */
export class EspacioComponent extends Componente {
  public dispositivos: Entidad[] = [];

  constructor(public id: number, public oficinaId: number) {
    super();
  }

  agregarDispositivo(entidadDispositivo: Entidad): boolean {
    if (!this.dispositivos.includes(entidadDispositivo)) {
      this.dispositivos.push(entidadDispositivo);
      return true;
    }
    return false;
  }
}
