import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { PaymentForm } from '../PaymentForm/PaymentForm'
import { signup } from '../../services/api'
import styles from './Signup.module.css'

export function Signup() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1) // 1: Registration, 2: Terms, 3: Payment
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    username: '',
    email: '',
    password: ''
  })
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [paymentData, setPaymentData] = useState(null) // eslint-disable-line no-unused-vars

  // Set page title
  useEffect(() => {
    document.title = 'ComicStop – Sign Up'
  }, [])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validateRegistrationForm = () => {
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
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox' && name === 'termsAccepted') {
      setTermsAccepted(checked)
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

  const handleRegistrationSubmit = (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateRegistrationForm()) {
      return
    }

    // Move to terms step
    setCurrentStep(2)
  }

  const handleTermsSubmit = (e) => {
    e.preventDefault()
    
    if (!termsAccepted) {
      setGeneralError('You must agree to the Terms and Conditions to continue.')
      return
    }

    // Move to payment step
    setCurrentStep(3)
  }

  const handlePaymentSubmit = async (paymentInfo) => {
    setLoading(true)
    setGeneralError('')
    
    try {
      // In a real application, you would:
      // 1. Tokenize the payment information with a payment processor
      // 2. Send the user data + payment token to your backend
      // 3. The backend would create the user account and set up billing
      
      // For this demo, we'll just simulate the process
      console.log('Processing signup with payment:', {
        user: formData,
        payment: paymentInfo // In real app, this would be a secure token
      })
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Create the user account (in real app, this would include payment setup)
      await signup({
        ...formData,
        paymentProcessed: true // Flag to indicate payment was processed
      })
      
      // Store payment data for demo (in real app, this would be handled securely)
      setPaymentData(paymentInfo)
      
      // On success, navigate to login page
      navigate('/login', { 
        state: { 
          message: 'Account created successfully! Please log in to continue.' 
        }
      })
    } catch (error) {
      setGeneralError(error.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBackToRegistration = () => {
    setCurrentStep(1)
    setGeneralError('')
  }

  const handleBackToTerms = () => {
    setCurrentStep(2)
    setGeneralError('')
  }

  // Step 1: Registration Form
  if (currentStep === 1) {
    return (
      <div>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${styles.stepActive}`}>1</div>
              <div className={styles.stepLine}></div>
              <div className={styles.step}>2</div>
              <div className={styles.stepLine}></div>
              <div className={styles.step}>3</div>
            </div>
            
            <h1 className={styles.title}>Sign Up for ComicStop</h1>
            <p className={styles.subtitle}>Step 1: Create your account</p>

            <form onSubmit={handleRegistrationSubmit} className={styles.form}>
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
                Continue to Terms
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

  // Step 2: Terms and Conditions
  if (currentStep === 2) {
    return (
      <div>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${styles.stepCompleted}`}>✓</div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${styles.stepActive}`}>2</div>
              <div className={styles.stepLine}></div>
              <div className={styles.step}>3</div>
            </div>
            
            <h1 className={styles.title}>Terms and Conditions</h1>
            <p className={styles.subtitle}>Step 2: Review and accept our terms</p>

            <form onSubmit={handleTermsSubmit} className={styles.form}>
              {generalError && (
                <div className={styles.errorMessage}>
                  {generalError}
                </div>
              )}

              <div className={styles.termsContainer}>
                <div className={styles.termsScroll}>
                  <h3>ComicStop Terms of Service</h3>
                  <p>By creating an account with ComicStop, you agree to the following terms:</p>
                  
                  <h4>1. Account Responsibility</h4>
                  <p>You are responsible for maintaining the confidentiality of your account and password.</p>
                  
                  <h4>2. Content Guidelines</h4>
                  <p>You agree to only upload content that you own or have permission to use.</p>
                  
                  <h4>3. Service Usage</h4>
                  <p>You agree to use our service in accordance with all applicable laws and regulations.</p>
                  
                  <h4>4. Privacy</h4>
                  <p>We respect your privacy and will handle your data according to our Privacy Policy.</p>
                  
                  <h4>5. Subscription Terms</h4>
                  <p>Premium features require a paid subscription. Billing occurs monthly and you can cancel anytime.</p>
                  
                  <p className={styles.termsFooter}>
                    For the complete terms, please visit our{' '}
                    <button
                      type="button"
                      onClick={() => window.open('/terms', '_blank')}
                      className={styles.termsLink}
                    >
                      full Terms and Conditions page
                    </button>
                  </p>
                </div>
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
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={handleBackToRegistration}
                  className={styles.backButton}
                >
                  Back
                </button>
                
                <button
                  type="submit"
                  className={styles.submitButton}
                  disabled={!termsAccepted}
                >
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Payment Information
  if (currentStep === 3) {
    return (
      <div>
        <Navbar />
        <div className={styles.container}>
          <div className={styles.formWrapper}>
            <div className={styles.stepIndicator}>
              <div className={`${styles.step} ${styles.stepCompleted}`}>✓</div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${styles.stepCompleted}`}>✓</div>
              <div className={styles.stepLine}></div>
              <div className={`${styles.step} ${styles.stepActive}`}>3</div>
            </div>
            
            <h1 className={styles.title}>Complete Registration</h1>
            <p className={styles.subtitle}>Step 3: Payment information</p>

            {generalError && (
              <div className={styles.errorMessage}>
                {generalError}
              </div>
            )}

            <PaymentForm
              onSubmit={handlePaymentSubmit}
              onBack={handleBackToTerms}
              loading={loading}
            />
          </div>
        </div>
      </div>
    )
  }
}