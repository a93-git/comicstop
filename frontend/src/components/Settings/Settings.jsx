import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { getUserSettings, setCreatorMode, deleteMyAccount } from '../../services/api'
import styles from './Settings.module.css'

export function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        setError(null)
        
        const userSettings = await getUserSettings()
        setSettings(userSettings)
      } catch (err) {
        setError('Failed to load settings')
        console.error('Error loading settings:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleLogout = () => {
    // Clear localStorage and navigate to home
    localStorage.removeItem('authToken')
    navigate('/')
  }

  const handleEnableCreator = async () => {
    try {
      setSaving(true)
      await setCreatorMode(true)
      const updatedSettings = await getUserSettings()
      setSettings(updatedSettings)
      alert('Creator mode enabled successfully!')
    } catch (e) {
      console.error(e)
      alert('Failed to enable creator mode')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    try {
      setSaving(true)
      await deleteMyAccount()
      navigate('/')
    } catch (e) {
      console.error(e)
      alert('Failed to delete account')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.loading}>Loading settings...</div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.error}>Error: {error}</div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navbar />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>Account Settings</h1>
          <div className={styles.userInfo}>
            <h2 className={styles.username}>{settings.username}</h2>
            <p className={styles.email}>{settings.email}</p>
            <p className={styles.joinDate}>
              Member since {new Date(settings.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Account Status</h3>
            <div className={styles.statusGrid}>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Creator Mode:</span>
                <span className={`${styles.statusValue} ${settings.isCreator ? styles.statusActive : styles.statusInactive}`}>
                  {settings.isCreator ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              <div className={styles.statusItem}>
                <span className={styles.statusLabel}>Email Verified:</span>
                <span className={`${styles.statusValue} ${settings.emailVerified ? styles.statusActive : styles.statusInactive}`}>
                  {settings.emailVerified ? 'Verified' : 'Not Verified'}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Theme Preferences</h3>
            <div className={styles.settingItem}>
              <label htmlFor="theme" className={styles.settingLabel}>
                Preferred Theme
              </label>
              <select 
                id="theme" 
                className={styles.settingSelect}
                value={settings.theme}
                onChange={() => {}} // TODO: Implement theme change
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>
          
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Reading Preferences</h3>
            <div className={styles.settingItem}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={settings.readingPreferences?.showDialogues ?? true}
                  onChange={() => {}} // TODO: Implement preference change
                />
                Show dialogues by default
              </label>
            </div>
            <div className={styles.settingItem}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={settings.readingPreferences?.enableClickNavigation ?? true}
                  onChange={() => {}} // TODO: Implement preference change
                />
                Enable click navigation
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Notifications</h3>
            <div className={styles.settingItem}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={settings.notifications?.emailNotifications ?? true}
                  onChange={() => {}} // TODO: Implement notification change
                />
                Email notifications
              </label>
            </div>
            <div className={styles.settingItem}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={settings.notifications?.pushNotifications ?? false}
                  onChange={() => {}} // TODO: Implement notification change
                />
                Push notifications
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Account Actions</h3>
            <div className={styles.actionGrid}>
              {!settings.isCreator && (
                <button 
                  className={styles.primaryButton} 
                  onClick={handleEnableCreator}
                  disabled={saving}
                >
                  {saving ? 'Enabling...' : 'Enable Creator Mode'}
                </button>
              )}
              <button 
                className={styles.dangerButton} 
                onClick={handleDeleteAccount}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}