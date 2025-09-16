import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeContext } from '../../hooks/useThemeContext'
import { isCreatorUser } from '../../services/api'
import styles from './Navbar.module.css'
import { config } from '../../config'

export function Navbar({ showAuth = true, onLogout }) {
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useThemeContext()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogoClick = () => {
    navigate('/')
    setIsMobileMenuOpen(false)
  }

  const handleSignUp = () => {
    navigate('/signup')
    setIsMobileMenuOpen(false)
  }

  const handleUpload = () => {
    if (isCreatorUser()) {
      navigate('/upload')
    } else {
      navigate('/signup')
    }
    setIsMobileMenuOpen(false)
  }

  const handleCreatorDashboard = () => {
    if (isCreatorUser()) {
      navigate('/creator/dashboard')
    } else {
      navigate('/signup')
    }
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={handleLogoClick}>{config.appName}</div>
      
      {/* Desktop Actions */}
      <div className={styles.desktopActions}>
        <button className={`${styles.button} ${styles.upload}`} onClick={handleUpload}>Upload</button>
        <button className={`${styles.button} ${styles.creator}`} onClick={handleCreatorDashboard}>Creator Hub</button>
        <button
          className={`${styles.button} ${styles.themeToggle}`}
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
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

      {/* Mobile Menu Button */}
      <button 
        className={styles.mobileMenuButton}
        onClick={toggleMobileMenu}
        aria-label="Toggle mobile menu"
        aria-expanded={isMobileMenuOpen}
      >
        <span className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </span>
      </button>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className={`${styles.mobileMenu} ${styles.mobileMenuOpen}`}>
          <button 
            className={`${styles.mobileButton} ${styles.upload}`}
            onClick={handleUpload}
          >
            Upload
          </button>
          <button
            className={`${styles.mobileButton} ${styles.themeToggle}`}
            onClick={toggleTheme}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          {showAuth ? (
            <button 
              className={`${styles.mobileButton} ${styles.auth}`}
              onClick={handleSignUp}
            >
              Sign Up / Login
            </button>
          ) : (
            <button 
              className={`${styles.mobileButton} ${styles.logout}`}
              onClick={onLogout}
            >
              Logout
            </button>
          )}
        </div>
      )}

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className={styles.mobileMenuOverlay}
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  )
}
