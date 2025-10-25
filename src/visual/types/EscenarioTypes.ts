import { Mueble, TipoDispositivo } from "./DeviceEnums";

export interface DispositivoMock {
  id: number;
  tipo: TipoDispositivo;
  nombre?: string;
  sistemaOperativo?: string;
  hardware?: string;
  posicion?: { x: number; y: number; z: number };
}

export interface EspacioMock {
  id: number;
  mueble: Mueble;
  posicion?: { x: number; y: number; z: number; rotacionY?: number };
  dispositivos: DispositivoMock[];
}

export interface OficinaMock {
  id: number;
  nombre?: string;
  posicion?: { x: number; y: number; z: number };
  espacios: EspacioMock[];
}

export interface ZonaMock {
  nombre: string;
  id?: number;
  oficinas: OficinaMock[];
}

export interface EscenarioMock {
  id: number;
  titulo: string;
  zonas: ZonaMock[];
}
