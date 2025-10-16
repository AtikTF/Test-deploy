import { Link } from "react-router";
import styles from "../styles/Dispositivos.module.css"
function Dispositivos() {
    return <div className={styles.container}>
        Dispositivos
        <Link to="/">Ir a Oficina</Link>
    </div>
}
export default Dispositivos;