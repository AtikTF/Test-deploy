import { Link } from "react-router";
import styles from "../styles/Oficina.module.css"

function Oficina() {
  return (
    <div className={styles.container}>
      Oficina
      <Link to="/dispositivos">Ir a Dispositivos</Link>
    </div>
  )
}

export default Oficina;
