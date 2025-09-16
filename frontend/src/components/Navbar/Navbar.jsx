import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useThemeContext } from '../../hooks/useThemeContext'
import { useAuth } from '../../context/AuthContext'
import { logout as apiLogout } from '../../services/api'
import styles from './Navbar.module.css'
import { config } from '../../config'

export function Navbar() {
  const navigate = useNavigate()
  const { toggleTheme, isDark } = useThemeContext()
  const { isAuthenticated, user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogoClick = () => {
    navigate('/')
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  const handleSignUp = () => {
    navigate('/signup')
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  const handleLogin = () => {
    navigate('/login')
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  const handleCreatorDashboard = () => {
    if (!isAuthenticated) {
      navigate('/login')
    } else if (!user?.isCreator) {
      navigate('/settings') // Redirect to settings to enable creator mode
    } else {
      navigate('/creator/dashboard')
    }
    setIsMobileMenuOpen(false)
    setIsUserMenuOpen(false)
  }

  const handleProfile = () => {
    navigate('/profile')
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  const handleSettings = () => {
    navigate('/settings')
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    try {
      await apiLogout()
    } catch (error) {
      console.error('Logout error:', error)
    }
    logout()
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
    navigate('/')
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsUserMenuOpen(false)
  }

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen)
    setIsMobileMenuOpen(false)
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo} onClick={handleLogoClick}>{config.appName}</div>
      
      {/* Desktop Actions */}
      <div className={styles.desktopActions}>
        <button className={`${styles.button} ${styles.creator}`} onClick={handleCreatorDashboard}>Creator Hub</button>
        <button
          className={`${styles.button} ${styles.themeToggle}`}
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          {isDark ? '☀️' : '🌙'}
        </button>
        
        {isAuthenticated ? (
          <div className={styles.userMenuContainer}>
            <button 
              className={`${styles.button} ${styles.userButton}`}
              onClick={toggleUserMenu}
              aria-expanded={isUserMenuOpen}
            >
              {user?.username || 'User'}
            </button>
            {isUserMenuOpen && (
              <div className={styles.userMenu}>
                <button className={styles.userMenuItem} onClick={handleProfile}>
                  Profile
                </button>
                <button className={styles.userMenuItem} onClick={handleSettings}>
                  Settings
                </button>
                <button className={styles.userMenuItem} onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button 
              className={`${styles.button} ${styles.auth}`}
              onClick={handleLogin}
            >
              Login
            </button>
            <button 
              className={`${styles.button} ${styles.signup}`}
              onClick={handleSignUp}
            >
              Sign Up
            </button>
          </>
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
            className={`${styles.mobileButton} ${styles.creator}`}
            onClick={handleCreatorDashboard}
          >
            Creator Hub
          </button>
          <button
            className={`${styles.mobileButton} ${styles.themeToggle}`}
            onClick={toggleTheme}
          >
            {isDark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          
          {isAuthenticated ? (
            <>
              <div className={styles.mobileUserInfo}>
                Hello, {user?.username || 'User'}
              </div>
              <button 
                className={`${styles.mobileButton} ${styles.profile}`}
                onClick={handleProfile}
              >
                Profile
              </button>
              <button 
                className={`${styles.mobileButton} ${styles.settings}`}
                onClick={handleSettings}
              >
                Settings
              </button>
              <button 
                className={`${styles.mobileButton} ${styles.logout}`}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button 
                className={`${styles.mobileButton} ${styles.auth}`}
                onClick={handleLogin}
              >
                Login
              </button>
              <button 
                className={`${styles.mobileButton} ${styles.signup}`}
                onClick={handleSignUp}
              >
                Sign Up
              </button>
            </>
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

      {/* User Menu Overlay (Desktop) */}
      {isUserMenuOpen && (
        <div 
          className={styles.userMenuOverlay}
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </nav>
  )
}
