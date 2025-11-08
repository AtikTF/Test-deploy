import { useState } from 'react';
import ComboBox from '../../../common/components/ComboBox';
import styles from '../styles/ModalFirewall.module.css';

/**
 * Componente para configurar el Firewall de un router
 * Permite permitir o denegar servicios por red y dirección
 */

const SERVICIOS = [
    { label: 'HTTP', value: 'http' },
    { label: 'HTTPS', value: 'https' },
    { label: 'FTP', value: 'ftp' },
    { label: 'SSH', value: 'ssh' },
    { label: 'Email', value: 'email' },
    { label: 'Web Server', value: 'web_server' },
];

const REDES = [
    { label: 'LAN 1', value: 'lan1' },
    { label: 'Internet', value: 'internet' },
];

type RedOption = typeof REDES[number];

interface ReglaFirewall {
    red: string;
    direccion: 'inbound' | 'outbound';
    servicios: string[];
}

export default function ModalFirewall() {
    const [reglas, setReglas] = useState<ReglaFirewall[]>([]);
    const [redSeleccionada, setRedSeleccionada] = useState<RedOption | null>(REDES[0]);
    const [logs, setLogs] = useState<string[]>([]);

    const obtenerRegla = (red: string, direccion: 'inbound' | 'outbound'): ReglaFirewall => {
        const reglaExistente = reglas.find(r => r.red === red && r.direccion === direccion);
        if (reglaExistente) return reglaExistente;
        return { red, direccion, servicios: [] };
    };

    // Verificar si un servicio está bloqueado
    const estaServicioBloqueado = (red: string, direccion: 'inbound' | 'outbound', servicio: string): boolean => {
        const regla = obtenerRegla(red, direccion);
        return regla.servicios.includes(servicio);
    };

    const toggleServicio = (red: string, direccion: 'inbound' | 'outbound', servicio: string) => {
        const reglaActual = obtenerRegla(red, direccion);
        const estaBloqueado = reglaActual.servicios.includes(servicio);

        let nuevosServicios: string[];
        if (estaBloqueado) {
            nuevosServicios = reglaActual.servicios.filter(s => s !== servicio);
        } else {
            nuevosServicios = [...reglaActual.servicios, servicio];
        }

        // Actualizar o agregar regla
        const reglasActualizadas = reglas.filter(r => !(r.red === red && r.direccion === direccion));
        if (nuevosServicios.length > 0) {
            reglasActualizadas.push({ red, direccion, servicios: nuevosServicios });
        }
        setReglas(reglasActualizadas);
    };

    const toggleTodos = (red: string, direccion: 'inbound' | 'outbound') => {
        const reglaActual = obtenerRegla(red, direccion);
        const todosBloqueados = reglaActual.servicios.length === SERVICIOS.length;

        const reglasActualizadas = reglas.filter(r => !(r.red === red && r.direccion === direccion));

        if (todosBloqueados) {
            setReglas(reglasActualizadas); // permitir todos
        } else {
            reglasActualizadas.push({
                red,
                direccion,
                servicios: SERVICIOS.map(s => s.value)
            }); // bloquear todos agrega todos los servicios a la lista
            setReglas(reglasActualizadas);
        }
    };

    return (
        <div className={styles.modalFirewallContainer}>
            <h2 className={styles.modalFirewallTitle}>Configuración de Firewall</h2>
            <p className={styles.descripcion}>
                Configura qué servicios bloquear para cada red y dirección de tráfico
            </p>

            <ComboBox
                items={REDES}
                value={redSeleccionada}
                onChange={setRedSeleccionada}
                getKey={(item) => item.value}
                getLabel={(item) => item.label}
                placeholder="Selecciona una red"
            />

            {redSeleccionada && (
                <div className={styles.reglasGrid}>
                    {[redSeleccionada].map(red => (
                        <div key={red.value} className={styles.redSection}>
                            <div className={styles.direccionGroup}>
                                <div className={styles.direccionHeader}>
                                    <span className={styles.direccionLabel}>
                                        <span className={styles.direccionIcon}>←</span>
                                        Entrante desde
                                    </span>
                                    <button
                                        className={styles.toggleTodosBtn}
                                        onClick={() => toggleTodos(red.value, 'inbound')}
                                        title={obtenerRegla(red.value, 'inbound').servicios.length === SERVICIOS.length
                                            ? "Permitir todos"
                                            : "Bloquear todos"}
                                    >
                                        {obtenerRegla(red.value, 'inbound').servicios.length === SERVICIOS.length
                                            ? '✓ Permitir todos'
                                            : '✗ Bloquear todos'}
                                    </button>
                                </div>
                                <div className={styles.serviciosGrid}>
                                    {SERVICIOS.map(servicio => {
                                        const bloqueado = estaServicioBloqueado(red.value, 'inbound', servicio.value);
                                        return (
                                            <button
                                                key={servicio.value}
                                                className={`${styles.servicioBtn} ${bloqueado ? styles.bloqueado : styles.permitido}`}
                                                onClick={() => toggleServicio(red.value, 'inbound', servicio.value)}
                                            >
                                                <span className={styles.servicioNombre}>{servicio.label}</span>

                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className={styles.separator} />

                            <div className={styles.direccionGroup}>
                                <div className={styles.direccionHeader}>
                                    <span className={styles.direccionLabel}>
                                        <span className={styles.direccionIcon}>→</span>
                                        Saliente hacia
                                    </span>
                                    <button
                                        className={styles.toggleTodosBtn}
                                        onClick={() => toggleTodos(red.value, 'outbound')}
                                        title={obtenerRegla(red.value, 'outbound').servicios.length === SERVICIOS.length
                                            ? "Permitir todos"
                                            : "Bloquear todos"}
                                    >
                                        {obtenerRegla(red.value, 'outbound').servicios.length === SERVICIOS.length
                                            ? '✓ Permitir todos'
                                            : '✗ Bloquear todos'}
                                    </button>
                                </div>
                                <div className={styles.serviciosGrid}>
                                    {SERVICIOS.map(servicio => {
                                        const bloqueado = estaServicioBloqueado(red.value, 'outbound', servicio.value);
                                        return (
                                            <button
                                                key={servicio.value}
                                                className={`${styles.servicioBtn} ${bloqueado ? styles.bloqueado : styles.permitido}`}
                                                onClick={() => toggleServicio(red.value, 'outbound', servicio.value)}
                                            >
                                                <span className={styles.servicioNombre}>{servicio.label}</span>

                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className={styles.logsSection}>
                <h3 className={styles.subtitle}>Resumen de bloqueos</h3>
                <div className={styles.resumenContent}>
                    {logs.length === 0 ? (
                        <p className={styles.textoVacio}>No hay logs sobre bloqueos.</p>
                    ) : (
                        <div className={styles.resumenGrid}>
                            {logs.map((log, index) => (
                                <div key={index} className={styles.resumenItem}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}