import { Navbar } from '../Navbar/Navbar'
import styles from './NotFound.module.css'

export function NotFound() {
  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <h1>404 - Page Not Found</h1>
        <p>The page you are looking for does not exist.</p>
        <a href="/" className={styles.homeLink}>Go to Homepage</a>
      </main>
    </div>
  )
}
