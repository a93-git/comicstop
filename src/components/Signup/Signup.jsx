import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { signup } from '../../services/api'
import styles from './Signup.module.css'

export function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    username: '',
    email: '',
    password: ''
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateForm = () => {
    const newErrors = {}

    // Required field validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters long'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      await signup(formData)
      // On success, navigate to login page
      navigate('/login')
    } catch (error) {
      setGeneralError(error.message || 'Signup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.formWrapper}>
        <h1 className={styles.title}>Sign Up for ComicStop</h1>
        <p className={styles.subtitle}>Join us to manage your comic collection</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {generalError && (
            <div className={styles.errorMessage}>
              {generalError}
            </div>
          )}

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="firstName" className={styles.label}>First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`${styles.input} ${errors.firstName ? styles.inputError : ''}`}
                disabled={loading}
              />
              {errors.firstName && <span className={styles.fieldError}>{errors.firstName}</span>}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="lastName" className={styles.label}>Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`${styles.input} ${errors.lastName ? styles.inputError : ''}`}
                disabled={loading}
              />
              {errors.lastName && <span className={styles.fieldError}>{errors.lastName}</span>}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="phone" className={styles.label}>Phone Number</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
              disabled={loading}
            />
            {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
          </div>

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
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              disabled={loading}
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
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
            />
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
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
  )
}