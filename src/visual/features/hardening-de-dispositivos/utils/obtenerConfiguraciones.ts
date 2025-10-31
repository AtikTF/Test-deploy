import { ConfiguracionWorkstation } from "../../../../data/configuraciones/configWorkstation";
/**
 * Convierte el array de configuraciones a formato de lista
 */
export default function obtenerConfiguraciones() {
  return ConfiguracionWorkstation.map(({ nombreConfig, costoActivacion }) => ({
    configuracion: nombreConfig,
    precio: costoActivacion,
  }));
}
