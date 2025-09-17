import { useState } from 'react'
import { Navbar } from '../Navbar/Navbar'
import { requestPasswordReset, requestPasswordResetByPhone } from '../../services/api'
import styles from './AuthExtras.module.css'
import { ISD_OPTIONS, getDefaultISD, combineISDWithLocal } from '../../utils/phone'

export function ForgotPassword() {
  const [method, setMethod] = useState('email') // 'email' | 'phone'
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isd, setIsd] = useState(getDefaultISD())
  const [status, setStatus] = useState({ loading: false, message: '', error: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus({ loading: true, message: '', error: '' })
    try {
      if (method === 'email') {
        await requestPasswordReset(email)
        setStatus({ loading: false, message: 'If that email exists, we\'ve sent a reset link.', error: '' })
      } else {
        const full = combineISDWithLocal(isd, phone)
        await requestPasswordResetByPhone(full)
        setStatus({ loading: false, message: 'If that phone exists, we\'ve sent a PIN code via SMS.', error: '' })
      }
    } catch (err) {
      setStatus({ loading: false, message: '', error: err.message || 'Request failed' })
    }
  }

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Forgot Password</h1>
          <p className={styles.subtitle}>Choose how you want to reset your password.</p>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div role="radiogroup" aria-label="Reset method" className={styles.fieldRow}>
              <label className={styles.inlineLabel}>
                <input
                  type="radio"
                  name="method"
                  value="email"
                  checked={method === 'email'}
                  onChange={() => setMethod('email')}
                />
                Email link
              </label>
              <label className={styles.inlineLabel}>
                <input
                  type="radio"
                  name="method"
                  value="phone"
                  checked={method === 'phone'}
                  onChange={() => setMethod('phone')}
                />
                Phone PIN
              </label>
            </div>

            {method === 'email' ? (
              <>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className={styles.input}
                />
              </>
            ) : (
              <>
                <label htmlFor="phone" className={styles.label}>Phone</label>
                <div className={styles.phoneRow}>
                  <select
                    aria-label="ISD code"
                    className={styles.isdSelect}
                    value={isd}
                    onChange={(e) => setIsd(e.target.value)}
                  >
                    {ISD_OPTIONS.map(code => (
                      <option key={code} value={code}>{code}</option>
                    ))}
                  </select>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="555 123 4567"
                    required
                    className={styles.input}
                  />
                </div>
              </>
            )}

            <button
              type="submit"
              className={styles.submitButton}
              disabled={(method === 'email' ? !email : !phone) || status.loading}
            >
              {status.loading ? 'Sending…' : (method === 'email' ? 'Send reset link' : 'Send PIN')}
            </button>
          </form>
          {status.message && <div className={`${styles.statusMessage} ${styles.successMessage}`}>{status.message}</div>}
          {status.error && <div className={`${styles.statusMessage} ${styles.errorMessage}`}>{status.error}</div>}
          <p className={styles.statusMessage}><a href="/">Back to Home</a></p>
        </div>
      </div>
    </div>
  )
}
