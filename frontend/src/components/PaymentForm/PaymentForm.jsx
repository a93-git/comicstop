import { useState } from 'react'
import styles from './PaymentForm.module.css'

export function PaymentForm({ onSubmit, onBack, loading = false }) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Handle nested billing address fields
    if (name.startsWith('billing.')) {
      const field = name.replace('billing.', '')
      setFormData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [field]: value
        }
      }))
    } else {
      // Handle special formatting for card number and expiry date
      let formattedValue = value
      
      if (name === 'cardNumber') {
        // Remove all non-digits and add spaces every 4 digits
        formattedValue = value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ')
      } else if (name === 'expiryDate') {
        // Format as MM/YY
        formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2')
      } else if (name === 'cvv') {
        // Only allow digits
        formattedValue = value.replace(/\D/g, '')
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formattedValue
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Card number validation (simplified - just check length)
    const cardNumberDigits = formData.cardNumber.replace(/\s/g, '')
    if (!cardNumberDigits || cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
      newErrors.cardNumber = 'Please enter a valid card number'
    }
    
    // Expiry date validation
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/
    if (!formData.expiryDate || !expiryRegex.test(formData.expiryDate)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)'
    } else {
      // Check if date is in the future
      const [month, year] = formData.expiryDate.split('/')
      const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1)
      const now = new Date()
      if (expiryDate < now) {
        newErrors.expiryDate = 'Card has expired'
      }
    }
    
    // CVV validation
    if (!formData.cvv || formData.cvv.length < 3 || formData.cvv.length > 4) {
      newErrors.cvv = 'Please enter a valid CVV'
    }
    
    // Cardholder name validation
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required'
    }
    
    // Billing address validation
    if (!formData.billingAddress.street.trim()) {
      newErrors['billing.street'] = 'Street address is required'
    }
    if (!formData.billingAddress.city.trim()) {
      newErrors['billing.city'] = 'City is required'
    }
    if (!formData.billingAddress.state.trim()) {
      newErrors['billing.state'] = 'State is required'
    }
    if (!formData.billingAddress.zipCode.trim()) {
      newErrors['billing.zipCode'] = 'ZIP code is required'
    }
    if (!formData.billingAddress.country.trim()) {
      newErrors['billing.country'] = 'Country is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      // Prepare data for submission (in real app, this would be tokenized)
      const paymentData = {
        ...formData,
        cardNumber: formData.cardNumber.replace(/\s/g, ''), // Remove spaces for processing
      }
      onSubmit(paymentData)
    }
  }

  const getCardType = (cardNumber) => {
    const number = cardNumber.replace(/\s/g, '')
    if (number.startsWith('4')) return 'visa'
    if (number.startsWith('5') || number.startsWith('2')) return 'mastercard'
    if (number.startsWith('3')) return 'amex'
    return 'unknown'
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Payment Information</h2>
      <p className={styles.subtitle}>Enter your payment details to complete registration</p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Credit Card Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Credit Card Details</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="cardholderName" className={styles.label}>
              Cardholder Name *
            </label>
            <input
              type="text"
              id="cardholderName"
              name="cardholderName"
              value={formData.cardholderName}
              onChange={handleChange}
              className={`${styles.input} ${errors.cardholderName ? styles.inputError : ''}`}
              placeholder="Full name as it appears on card"
              disabled={loading}
              autoComplete="cc-name"
            />
            {errors.cardholderName && (
              <span className={styles.fieldError}>{errors.cardholderName}</span>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cardNumber" className={styles.label}>
              Card Number *
            </label>
            <div className={styles.cardInputWrapper}>
              <input
                type="text"
                id="cardNumber"
                name="cardNumber"
                value={formData.cardNumber}
                onChange={handleChange}
                className={`${styles.input} ${styles.cardInput} ${errors.cardNumber ? styles.inputError : ''}`}
                placeholder="1234 5678 9012 3456"
                maxLength="23"
                disabled={loading}
                autoComplete="cc-number"
              />
              <div className={`${styles.cardIcon} ${styles[getCardType(formData.cardNumber)]}`}>
                {getCardType(formData.cardNumber) !== 'unknown' && '💳'}
              </div>
            </div>
            {errors.cardNumber && (
              <span className={styles.fieldError}>{errors.cardNumber}</span>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="expiryDate" className={styles.label}>
                Expiry Date *
              </label>
              <input
                type="text"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleChange}
                className={`${styles.input} ${errors.expiryDate ? styles.inputError : ''}`}
                placeholder="MM/YY"
                maxLength="5"
                disabled={loading}
                autoComplete="cc-exp"
              />
              {errors.expiryDate && (
                <span className={styles.fieldError}>{errors.expiryDate}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="cvv" className={styles.label}>
                CVV *
              </label>
              <input
                type="password"
                id="cvv"
                name="cvv"
                value={formData.cvv}
                onChange={handleChange}
                className={`${styles.input} ${errors.cvv ? styles.inputError : ''}`}
                placeholder="123"
                maxLength="4"
                disabled={loading}
                autoComplete="cc-csc"
              />
              {errors.cvv && (
                <span className={styles.fieldError}>{errors.cvv}</span>
              )}
            </div>
          </div>
        </div>

        {/* Billing Address */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Billing Address</h3>
          
          <div className={styles.formGroup}>
            <label htmlFor="billing-street" className={styles.label}>
              Street Address *
            </label>
            <input
              type="text"
              id="billing-street"
              name="billing.street"
              value={formData.billingAddress.street}
              onChange={handleChange}
              className={`${styles.input} ${errors['billing.street'] ? styles.inputError : ''}`}
              placeholder="123 Main Street"
              disabled={loading}
              autoComplete="billing street-address"
            />
            {errors['billing.street'] && (
              <span className={styles.fieldError}>{errors['billing.street']}</span>
            )}
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="billing-city" className={styles.label}>
                City *
              </label>
              <input
                type="text"
                id="billing-city"
                name="billing.city"
                value={formData.billingAddress.city}
                onChange={handleChange}
                className={`${styles.input} ${errors['billing.city'] ? styles.inputError : ''}`}
                placeholder="New York"
                disabled={loading}
                autoComplete="billing address-level2"
              />
              {errors['billing.city'] && (
                <span className={styles.fieldError}>{errors['billing.city']}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="billing-state" className={styles.label}>
                State *
              </label>
              <input
                type="text"
                id="billing-state"
                name="billing.state"
                value={formData.billingAddress.state}
                onChange={handleChange}
                className={`${styles.input} ${errors['billing.state'] ? styles.inputError : ''}`}
                placeholder="NY"
                disabled={loading}
                autoComplete="billing address-level1"
              />
              {errors['billing.state'] && (
                <span className={styles.fieldError}>{errors['billing.state']}</span>
              )}
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="billing-zipCode" className={styles.label}>
                ZIP Code *
              </label>
              <input
                type="text"
                id="billing-zipCode"
                name="billing.zipCode"
                value={formData.billingAddress.zipCode}
                onChange={handleChange}
                className={`${styles.input} ${errors['billing.zipCode'] ? styles.inputError : ''}`}
                placeholder="10001"
                disabled={loading}
                autoComplete="billing postal-code"
              />
              {errors['billing.zipCode'] && (
                <span className={styles.fieldError}>{errors['billing.zipCode']}</span>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="billing-country" className={styles.label}>
                Country *
              </label>
              <select
                id="billing-country"
                name="billing.country"
                value={formData.billingAddress.country}
                onChange={handleChange}
                className={`${styles.select} ${errors['billing.country'] ? styles.inputError : ''}`}
                disabled={loading}
                autoComplete="billing country"
              >
                <option value="">Select Country</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
                <option value="UK">United Kingdom</option>
                <option value="AU">Australia</option>
                <option value="DE">Germany</option>
                <option value="FR">France</option>
                <option value="JP">Japan</option>
                <option value="OTHER">Other</option>
              </select>
              {errors['billing.country'] && (
                <span className={styles.fieldError}>{errors['billing.country']}</span>
              )}
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className={styles.securityNotice}>
          <div className={styles.securityIcon}>🔒</div>
          <div className={styles.securityText}>
            <strong>Your payment information is secure</strong>
            <p>We use industry-standard encryption to protect your payment details. Your card information is never stored on our servers.</p>
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.actions}>
          <button
            type="button"
            onClick={onBack}
            className={styles.backButton}
            disabled={loading}
          >
            Back
          </button>
          
          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Complete Registration'}
          </button>
        </div>
      </form>
    </div>
  )
}