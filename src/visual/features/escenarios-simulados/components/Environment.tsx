import React from 'react';

interface EnvironmentProps {
    showGrid?: boolean;
    showAxes?: boolean;
    gridSize?: number;
    gridDivisions?: number;
}

/**
 * Componente para elementos del entorno 3D (grid, ejes, etc.)
 * Útil para desarrollo y depuración
 */
const Environment: React.FC<EnvironmentProps> = ({
    showGrid = false,
    showAxes = false,
    gridSize = 10,
    gridDivisions = 10,
}) => {
    return (
        <>
            {showGrid && (
                <gridHelper
                    args={[gridSize, gridDivisions, '#888888', '#444444']}
                />
            )}

            {showAxes && (
                <axesHelper args={[5]} />
            )}

            {/* Plano de suelo para recibir sombras */}
            <mesh
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, -0.01, 0]}
                receiveShadow
            >
                <planeGeometry args={[100, 100]} />
                <shadowMaterial opacity={0.3} />
            </mesh>
        </>
    );
};

export default Environment;
