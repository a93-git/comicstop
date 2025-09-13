import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { login } from '../../services/api'
import styles from './Login.module.css'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    password: ''
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  
  // Set page title
  useEffect(() => {
    document.title = 'ComicStop – Login'
  }, [])
  
  // Check if there's a success message from signup
  const successMessage = location.state?.message

  const validateForm = () => {
    const newErrors = {}

    // Required field validation
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone number is required'
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    }
    if (!termsAccepted) {
      newErrors.terms = 'You must agree to the Terms and Conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox' && name === 'termsAccepted') {
      setTermsAccepted(checked)
      // Clear terms error when checkbox is checked
      if (checked && errors.terms) {
        setErrors(prev => ({
          ...prev,
          terms: ''
        }))
      }
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
      // The backend expects 'email' field, so we map emailOrPhone to email
      const credentials = {
        email: formData.emailOrPhone,
        password: formData.password,
        termsAccepted: termsAccepted
      }
      
      await login(credentials)
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
            <label htmlFor="emailOrPhone" className={styles.label}>Email or Phone Number</label>
            <input
              type="text"
              id="emailOrPhone"
              name="emailOrPhone"
              value={formData.emailOrPhone}
              onChange={handleChange}
              className={`${styles.input} ${errors.emailOrPhone ? styles.inputError : ''}`}
              disabled={loading}
              placeholder="Enter your email or phone number"
            />
            {errors.emailOrPhone && <span className={styles.fieldError}>{errors.emailOrPhone}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              disabled={loading}
              placeholder="Enter your password"
            />
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="termsAccepted"
                checked={termsAccepted}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>
                I agree to the{' '}
                <button
                  type="button"
                  onClick={() => window.open('/terms', '_blank')}
                  className={styles.termsLink}
                >
                  Terms and Conditions
                </button>
              </span>
            </label>
            {errors.terms && <span className={styles.fieldError}>{errors.terms}</span>}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading || !termsAccepted}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

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
      </div>
    </div>
    </div>
  )
}