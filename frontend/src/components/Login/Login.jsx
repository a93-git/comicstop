import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { login } from '../../services/api'
import styles from './Login.module.css'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    identifier: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [rememberMe, setRememberMe] = useState(true)
  const [generalError, setGeneralError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
  // Set page title
  useEffect(() => {
    document.title = 'ComicStop – Login'
  }, [])
  
  // Check if there's a success message from signup
  const successMessage = location.state?.message

  const validateForm = () => {
    const newErrors = {}

    // Required field validation
    if (!formData.identifier.trim()) {
      newErrors.identifier = 'Email, username, or phone is required'
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox' && name === 'rememberMe') {
      setRememberMe(checked)
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
      
      // Clear specific field error when user starts typing
      if (errors[name]) {
        setErrors(prev => ({
          ...prev,
          [name]: ''
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      // The backend accepts a generic identifier (email/username/phone)
      const credentials = { identifier: formData.identifier, password: formData.password }
      
      const result = await login(credentials)
      if (rememberMe && result?.token) {
        // Token already in localStorage; optionally extend persistence or set a marker
        localStorage.setItem('rememberMe', '1')
      } else {
        localStorage.removeItem('rememberMe')
      }
      // On success, navigate to dashboard
      navigate('/dashboard')
    } catch (error) {
      setGeneralError(error.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Welcome back to ComicStop</h1>
          <p className={styles.subtitle}>Sign in to your account to continue</p>

          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
            </div>
          )}

        <form onSubmit={handleSubmit} className={styles.form}>
          {generalError && (
            <div className={styles.errorMessage}>
              {generalError}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="identifier" className={styles.label}>Email, Username, or Phone</label>
            <input
              type="text"
              id="identifier"
              name="identifier"
              value={formData.identifier}
              onChange={handleChange}
              className={`${styles.input} ${errors.identifier ? styles.inputError : ''}`}
              disabled={loading}
              placeholder="Enter your email, username, or phone number"
            />
            {errors.identifier && <span className={styles.fieldError}>{errors.identifier}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <div className={styles.passwordField}>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
                disabled={loading}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                aria-controls="password"
                onClick={() => setShowPassword(prev => !prev)}
                disabled={loading}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="rememberMe"
                checked={rememberMe}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Remember Me</span>
            </label>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.signupLink}>
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className={styles.linkButton}
            disabled={loading}
          >
            Forgot Password?
          </button>
        </p>

        <p className={styles.signupLink}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/signup')}
            className={styles.linkButton}
            disabled={loading}
          >
            Sign up here
          </button>
        </p>

        <p className={styles.signupLink}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={styles.linkButton}
            disabled={loading}
          >
            ← Go to Homepage
          </button>
        </p>
      </div>
    </div>
    </div>
  )
}