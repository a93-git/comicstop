import styles from './Navbar.module.css'
import { config } from '../../config'

export function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>{config.appName}</div>
      <div className={styles.actions}>
        <button className={`${styles.button} ${styles.upload}`}>Upload</button>
        <button className={`${styles.button} ${styles.auth}`}>Sign Up / Login</button>
      </div>
    </nav>
  )
}
