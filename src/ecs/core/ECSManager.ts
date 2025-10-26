import { ComponenteContainer, Componente, type Entidad } from "./Componente"
import type { Sistema } from "./Sistema"

export class ECSManager {
    private entidades = new Map<Entidad, ComponenteContainer>()
    private sistemas = new Map<Sistema, Set<Entidad>>()

    private idSiguienteEntidad: number = 0
    private entidadesADestruir = new Array<Entidad>()

    // Para Entidades

    public agregarEntidad(): Entidad {
        let entidad = this.idSiguienteEntidad;
        this.idSiguienteEntidad++;
        this.entidades.set(entidad, new ComponenteContainer());
        return entidad;
    }

    public removerEntidad(entidad: Entidad): void{
        this.entidadesADestruir.push(entidad);
    }

    // Para Componentes

    public agregarComponente(entidad: Entidad, componente: Componente): void {
        this.entidades.get(entidad)?.agregar(componente);
        this.verificarEntidad(entidad);
    }

    public getComponentes(entidad: Entidad): ComponenteContainer | undefined {
        return this.entidades.get(entidad);
    }

    public removerComponente(entidad: Entidad, claseComponente: Function): void {
        this.entidades.get(entidad)?.eliminar(claseComponente);
        this.verificarEntidad(entidad);
    }

    // Para Sistemas

    public agregarSistema(sistema: Sistema): void {
        if (sistema.componentesRequeridos.size == 0) {
            console.warn(`Sistema ${sistema} no agregado: lista de componentes vacía.`);
            return;
        }

        sistema.ecsManager = this;

        this.sistemas.set(sistema, new Set());
        for (let entidad of this.entidades.keys()) {
            this.verificarEntidadSistema(entidad, sistema);
        }
    }

    public removerSistema(sistema: Sistema): void {
        this.sistemas.delete(sistema);
    }

    public actualizar(): void {
        for (let [sistema, entidades] of this.sistemas.entries()) {
            sistema.actualizar(entidades)
        }
        while (this.entidadesADestruir.length > 0) {
            const entidad = this.entidadesADestruir.pop();
            if (entidad !== undefined) {
                this.destruirEntidad(entidad);
            }
        }
    }

    // Snapshot / restauración: serializa el estado actual de todas las entidades y componentes.
    // Nota: Implementación simple que intenta serializar las propiedades públicas de los componentes.
    /*public serializarEstado(): string {
        const data: any = {
            idSiguienteEntidad: this.idSiguienteEntidad,
            entidades: [] as any[],
        };

        for (const [entidad, container] of this.entidades.entries()) {
            const comps: any = {};
            // iterar sobre las entradas del mapa interno
            // no hay API pública para enumerar, así que usamos toString de la función constructor como key
            // accedemos por reflexión: (container as any).map
            const internalMap = (container as any).map as Map<Function, any> | undefined;
            if (!internalMap) continue;
            for (const [cls, comp] of internalMap.entries()) {
                try {
                    comps[cls.name] = JSON.parse(JSON.stringify(comp));
                } catch (e) {
                    comps[cls.name] = null;
                }
            }

            data.entidades.push({ entidad, componentes: comps });
        }

        return JSON.stringify(data);
    }

    public restaurarEstado(serialized: string): void {
        try {
            const data = JSON.parse(serialized);
            // limpiar estado actual
            this.entidades.clear();
            this.sistemas.forEach((set) => set.clear());

            this.idSiguienteEntidad = data.idSiguienteEntidad || 0;

            // Restauración mínima: crear las entidades y añadir componentes como objetos planos
            for (const item of data.entidades) {
                const entidad: Entidad = item.entidad;
                const container = new ComponenteContainer();
                // No podemos reconstruir instancias de clases específicas sin un mapeo.
                // En su lugar guardamos los objetos serializados bajo un símbolo genérico
                (container as any).map = new Map();
                for (const [clsName, compObj] of Object.entries(item.componentes)) {
                    // Guardar el objeto serializado tal cual; sistemas que esperen clases concretas
                    // deberán ser capaces de leer las propiedades desde objetos planos también.
                    (container as any).map.set({ name: clsName }, compObj as any);
                }

                this.entidades.set(entidad, container as any);
            }
        } catch (e) {
            console.error('Error al restaurar estado ECS:', e);
        }
    }*/

    // Para verificaciones internas

    private destruirEntidad(entidad: Entidad): void {
        this.entidades.delete(entidad);
        for (let entidades of this.sistemas.values()) {
            entidades.delete(entidad);
        }
    }

    private verificarEntidad(entidad: Entidad): void {
        for (let sistema of this.sistemas.keys()) {
            this.verificarEntidadSistema(entidad, sistema);
        }
    }

    private verificarEntidadSistema(entidad: Entidad, sistema: Sistema): void {
        let componenteContainer = this.entidades.get(entidad);
        let componentesRequeridos = sistema.componentesRequeridos;
        if (componenteContainer?.tieneTodos(componentesRequeridos)) {
            this.sistemas.get(sistema)?.add(entidad);
        } else {
            this.sistemas.get(sistema)?.delete(entidad);
        }
    }
}
