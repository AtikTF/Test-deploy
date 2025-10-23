import React from 'react';
import styles from '../styles/Escena3D.module.css';
import Controles3D from './Controles3D';
import Scene3DCanvas from './Scene3DCanvas';
import Model3D from './Model3D';
import CameraControls from './CameraControls';
import Lights from './Lights';
import Environment from './Environment';
import {
    DEFAULT_MODEL_CONFIG,
    DEFAULT_LIGHT_CONFIG,
    DEFAULT_CONTROLS_CONFIG,
    DEFAULT_ENVIRONMENT_CONFIG,
} from '../config/scene3DConfig';


const Escena3D: React.FC = () => {
    return (
        <section className={styles.vista3D} aria-label="Vista 3D de la escena">
            <Controles3D />
            <Scene3DCanvas className={styles.canvas}>
                <Lights
                    ambientIntensity={DEFAULT_LIGHT_CONFIG.ambientIntensity}
                    directionalIntensity={DEFAULT_LIGHT_CONFIG.directionalIntensity}
                    directionalPosition={DEFAULT_LIGHT_CONFIG.directionalPosition}
                    enableShadows={DEFAULT_LIGHT_CONFIG.enableShadows}
                />
                <Model3D
                    modelPath={DEFAULT_MODEL_CONFIG.path}
                    position={DEFAULT_MODEL_CONFIG.position}
                    rotation={DEFAULT_MODEL_CONFIG.rotation}
                    scale={DEFAULT_MODEL_CONFIG.scale}
                />

                <CameraControls
                    enableZoom={DEFAULT_CONTROLS_CONFIG.enableZoom}
                    enablePan={DEFAULT_CONTROLS_CONFIG.enablePan}
                    enableRotate={DEFAULT_CONTROLS_CONFIG.enableRotate}
                    autoRotate={DEFAULT_CONTROLS_CONFIG.autoRotate}
                    autoRotateSpeed={DEFAULT_CONTROLS_CONFIG.autoRotateSpeed}
                    minDistance={DEFAULT_CONTROLS_CONFIG.minDistance}
                    maxDistance={DEFAULT_CONTROLS_CONFIG.maxDistance}
                    minPolarAngle={DEFAULT_CONTROLS_CONFIG.minPolarAngle}
                    maxPolarAngle={DEFAULT_CONTROLS_CONFIG.maxPolarAngle}
                />
                <Environment
                    showGrid={DEFAULT_ENVIRONMENT_CONFIG.showGrid}
                    showAxes={DEFAULT_ENVIRONMENT_CONFIG.showAxes}
                    gridSize={DEFAULT_ENVIRONMENT_CONFIG.gridSize}
                    gridDivisions={DEFAULT_ENVIRONMENT_CONFIG.gridDivisions}
                />
            </Scene3DCanvas>
        </section>
    );
};

export default Escena3D;
