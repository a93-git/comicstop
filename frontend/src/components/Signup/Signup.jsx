import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { signup } from '../../services/api'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'
import styles from './Signup.module.css'

export function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    emailOrPhone: '',
    username: '',
    password: '',
    confirmPassword: ''
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    document.title = 'ComicStop – Sign Up'
  }, [])

  const validateEmail = (email) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(email)
  const validatePhone = (phone) => (/^[+]?[- ().0-9]{3,}$/).test(phone)

  const validateForm = () => {
    const newErrors = {}
    if (!formData.username.trim()) newErrors.username = 'Username is required'
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone number is required'
    } else if (!(validateEmail(formData.emailOrPhone) || validatePhone(formData.emailOrPhone))) {
      newErrors.emailOrPhone = 'Enter a valid email address or phone number'
    }
    if (!formData.password.trim()) newErrors.password = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters long'
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    if (type === 'checkbox' && name === 'termsAccepted') {
      setTermsAccepted(checked)
      return
    }
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'password') {
      const hasUpper = /[A-Z]/.test(value)
      const hasLower = /[a-z]/.test(value)
      const hasNumber = /[0-9]/.test(value)
      const hasSymbol = /[^A-Za-z0-9]/.test(value)
      const lengthOK = value.length >= 8
      const score = [hasUpper, hasLower, hasNumber, hasSymbol, lengthOK].filter(Boolean).length
      setPasswordStrength(score >= 4 ? 'strong' : score >= 3 ? 'medium' : 'weak')
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')
    if (!validateForm()) return
    if (!termsAccepted) {
      setGeneralError('You must agree to the Terms of Service and Privacy Policy to continue.')
      return
    }
    try {
      setLoading(true)
      await signup({
        emailOrPhone: formData.emailOrPhone,
        username: formData.username,
        password: formData.password,
        termsAccepted: true,
      })
      navigate('/login', { state: { message: 'Account created successfully! Please log in to continue.' } })
    } catch (error) {
      setGeneralError(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Create your ComicStop account</h1>
          <p className={styles.subtitle}>Sign up with email or phone, set a password, and agree to the terms.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            {generalError && <div className={styles.errorMessage}>{generalError}</div>}

            <div className={styles.formGroup}>
              <label htmlFor="username" className={styles.label}>Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className={`${styles.input} ${errors.username ? styles.inputError : ''}`}
                disabled={loading}
              />
              {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="emailOrPhone" className={styles.label}>Email or Phone number</label>
              <input
                type="text"
                id="emailOrPhone"
                name="emailOrPhone"
                value={formData.emailOrPhone}
                onChange={handleChange}
                className={`${styles.input} ${errors.emailOrPhone ? styles.inputError : ''}`}
                disabled={loading}
              />
              {errors.emailOrPhone && <span className={styles.fieldError}>{errors.emailOrPhone}</span>}
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
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  aria-controls="password"
                  onClick={() => setShowPassword(p => !p)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
              {formData.password && (
                <div className={styles.passwordStrength} data-strength={passwordStrength}>
                  Strength: {passwordStrength}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword" className={styles.label}>Confirm Password</label>
              <div className={styles.passwordField}>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.confirmPassword ? styles.inputError : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  aria-pressed={showConfirm}
                  aria-controls="confirmPassword"
                  onClick={() => setShowConfirm(p => !p)}
                  disabled={loading}
                >
                  <FontAwesomeIcon icon={showConfirm ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
            </div>

            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel} htmlFor="terms">
                <input
                  id="terms"
                  type="checkbox"
                  name="termsAccepted"
                  checked={termsAccepted}
                  onChange={handleChange}
                  className={styles.checkbox}
                  aria-required="true"
                />
                <span className={styles.checkboxText}>
                  I agree to the{' '}
                  <a href="/terms" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>Terms of Service</a>
                  {' '}and{' '}
                  <a href="/privacy" target="_blank" rel="noopener noreferrer" className={styles.termsLink}>Privacy Policy</a>
                </span>
              </label>
            </div>

            <button type="submit" className={styles.submitButton} disabled={loading}>
              Create account
            </button>
          </form>

          <p className={styles.loginLink}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className={styles.linkButton}
              disabled={loading}
            >
              Login here
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}