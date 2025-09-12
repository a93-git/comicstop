import { useNavigate } from 'react-router-dom'
import styles from './Navbar.module.css'
import { config } from '../../config'

export function Navbar({ showAuth = true, onLogout }) {
  const navigate = useNavigate()

  const handleLogoClick = () => {
    navigate('/')
  }

  const handleSignUp = () => {
    navigate('/signup')
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={handleLogoClick}>{config.appName}</div>
      <div className={styles.actions}>
        <button className={`${styles.button} ${styles.upload}`}>Upload</button>
        {showAuth ? (
          <button 
            className={`${styles.button} ${styles.auth}`}
            onClick={handleSignUp}
          >
            Sign Up / Login
          </button>
        ) : (
          <button 
            className={`${styles.button} ${styles.logout}`}
            onClick={onLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}
