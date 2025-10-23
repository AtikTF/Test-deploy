import React, { useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { Group } from 'three';

interface Model3DProps {
    modelPath: string;
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number | [number, number, number];
}

/**
 * Componente reutilizable para cargar y renderizar modelos GLTF
 * Permite configurar posición, rotación y escala del modelo
 */
const Model3D: React.FC<Model3DProps> = ({
    modelPath,
    position = [0, 0, 0],
    rotation = [0, 0, 0],
    scale = 1
}) => {
    const groupRef = useRef<Group>(null);
    const { scene } = useGLTF(modelPath);

    return (
        <group
            ref={groupRef}
            position={position}
            rotation={rotation}
            scale={scale}
        >
            <primitive object={scene} />
        </group>
    );
};

// Precargar el modelo para mejorar el rendimiento
export const preloadModel = (path: string) => {
    useGLTF.preload(path);
};

export default Model3D;
