import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { resetPasswordWithToken, resetPasswordWithPin } from '../../services/api'
import styles from './AuthExtras.module.css'

export function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''
  const via = params.get('via') || (token ? 'email' : 'phone') // 'email' | 'phone'
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [status, setStatus] = useState({ loading: false, message: '', error: '' })

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) {
      setStatus({ loading: false, message: '', error: 'Password must be at least 6 characters' })
      return
    }
    if (password !== confirm) {
      setStatus({ loading: false, message: '', error: 'Passwords do not match' })
      return
    }
    setStatus({ loading: true, message: '', error: '' })
    try {
      if (via === 'phone') {
        await resetPasswordWithPin(phone, pin, password)
      } else {
        await resetPasswordWithToken(token, password)
      }
      setStatus({ loading: false, message: 'Password updated! Redirecting to login…', error: '' })
      setTimeout(() => navigate('/login'), 1200)
    } catch (err) {
      setStatus({ loading: false, message: '', error: err.message || 'Reset failed' })
    }
  }

  return (
    <div>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Reset Password</h1>
          {via === 'email' && !token && <div className={styles.errorMessage}>Missing token. Please use the link from your email.</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            {via === 'phone' && (
              <>
                <label htmlFor="phone" className={styles.label}>Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 123 4567"
                  required
                  className={styles.input}
                />
                <label htmlFor="pin" className={styles.label}>PIN code</label>
                <input
                  id="pin"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]{4,6}"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="6-digit PIN"
                  required
                  className={styles.input}
                />
              </>
            )}
            <label htmlFor="password" className={styles.label}>New password</label>
            <div className={styles.passwordField}>
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={styles.input}
            />
            <button
              type="button"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              aria-controls="password"
              onClick={() => setShowPassword(p => !p)}
              className={styles.passwordToggle}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
            </div>
            <label htmlFor="confirm" className={styles.label}>Confirm new password</label>
            <div className={styles.passwordField}>
            <input
              id="confirm"
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className={styles.input}
            />
            <button
              type="button"
              aria-label={showConfirm ? 'Hide password' : 'Show password'}
              aria-pressed={showConfirm}
              aria-controls="confirm"
              onClick={() => setShowConfirm(p => !p)}
              className={styles.passwordToggle}
            >
              {showConfirm ? 'Hide' : 'Show'}
            </button>
            </div>
            <button
              type="submit"
              className={styles.submitButton}
              disabled={(via === 'email' ? !token : (!phone || !pin)) || !password || !confirm || status.loading}
            >
              {status.loading ? 'Resetting…' : 'Reset password'}
            </button>
          </form>
          {status.message && <div className={`${styles.statusMessage} ${styles.successMessage}`}>{status.message}</div>}
          {status.error && <div className={`${styles.statusMessage} ${styles.errorMessage}`}>{status.error}</div>}
        </div>
      </div>
    </div>
  )
}
