import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { getUserSettings, saveUserSettings, setCreatorMode, deleteMyAccount, updateUsername, updateEmail, updatePhone, updatePassword, getUserProfile, updateProfilePicture } from '../../services/api'
import { useThemeContext } from '../../hooks/useThemeContext'
import styles from './Settings.module.css'

export function Settings() {
  const navigate = useNavigate()
  const { setLightTheme, setDarkTheme, setAutoTheme, THEMES } = useThemeContext()
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileError, setProfileError] = useState(null)
  const [activeEdit, setActiveEdit] = useState(null) // 'username' | 'email' | 'phone' | 'password' | null
  const [profile, setProfile] = useState(null)
  const [form, setForm] = useState({ username: '', email: '', phone: '', password: '' })
  const [avatarUploading, setAvatarUploading] = useState(false)

  // Deterministic color from username initial
  const getAvatarColor = (name) => {
    const colors = ['#FF6B2C','#10B981','#3B82F6','#F59E0B','#8B5CF6','#EF4444','#14B8A6','#84CC16']
    if (!name) return colors[0]
    let hash = 0
    for (let i=0;i<name.length;i++) hash = name.charCodeAt(i) + ((hash<<5)-hash)
    const idx = Math.abs(hash) % colors.length
    return colors[idx]
  }

  const onAvatarFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      setAvatarUploading(true)
      const res = await updateProfilePicture(file)
      if (res.success && res.data?.user) {
        setProfile(p => ({ ...p, profilePictureS3Url: res.data.user.profilePictureS3Url }))
      }
    } catch (err) {
      setProfileError(err?.message || 'Failed to upload picture')
    } finally {
      setAvatarUploading(false)
      // reset the input so same file can be selected again if needed
      e.target.value = ''
    }
  }

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        setError(null)
        
        const userSettings = await getUserSettings()
        let userProfile = null
        try {
          // getUserProfile may not exist in some test mocks; guard it
          if (typeof getUserProfile === 'function') {
            userProfile = await getUserProfile()
          }
        } catch {}
        const effectiveProfile = userProfile || {
          username: userSettings?.username || '',
          email: userSettings?.email || '',
          phone: userSettings?.phone || '',
        }
        // If theme saved in user settings differs from current, apply it
        try {
          if (userSettings?.theme === 'light') setLightTheme()
          else if (userSettings?.theme === 'dark') setDarkTheme()
          else setAutoTheme()
        } catch {}
        setSettings(userSettings)
        setProfile(effectiveProfile)
        setForm({
          username: effectiveProfile?.username || '',
          email: effectiveProfile?.email || '',
          phone: effectiveProfile?.phone || '',
          password: '',
        })
      } catch (err) {
        setError('Failed to load settings')
        console.error('Error loading settings:', err)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleToggleCreator = async () => {
    if (settings.isCreator) {
      // Confirm before disabling
      const ok = confirm('Disable Creator Mode? You may lose access to creator features.')
      if (!ok) return
    }
    try {
      setSaving(true)
      await setCreatorMode(!settings.isCreator)
      const updated = await getUserSettings()
      setSettings(updated)
    } catch (e) {
      console.error(e)
      alert('Failed to update creator mode')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (field) => {
    if (activeEdit && activeEdit !== field) return
    setActiveEdit(field)
    setProfileError(null)
  }

  const cancelEdit = () => {
    setActiveEdit(null)
    setProfileError(null)
    // reset password field
    setForm(f => ({ ...f, password: '' }))
  }

  const submitEdit = async (field) => {
    if (activeEdit && activeEdit !== field) return
    try {
      setProfileSaving(true)
      setProfileError(null)
      if (field === 'username') {
        const res = await updateUsername(form.username)
        if (res.success) setProfile(p => ({ ...p, username: res.data.user.username }))
      } else if (field === 'email') {
        const res = await updateEmail(form.email)
        if (res.success) setProfile(p => ({ ...p, email: res.data.user.email }))
      } else if (field === 'phone') {
        const res = await updatePhone(form.phone)
        if (res.success) setProfile(p => ({ ...p, phone: res.data.user.phone }))
      } else if (field === 'password') {
        await updatePassword(form.password)
      }
      setActiveEdit(null)
      // reflect username/email in settings header as well
      setSettings(s => ({ ...s, username: field==='username'?form.username:s.username, email: field==='email'?form.email:s.email }))
      // clear password field
      setForm(f => ({ ...f, password: '' }))
    } catch (e) {
      setProfileError(e?.message || 'Update failed')
    } finally {
      setProfileSaving(false)
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
          {/* Sidebar navigation for desktop */}
          <nav className={styles.sidebar} aria-label="Settings sections">
            <a href="#profile" className={styles.sidebarLink}>Profile</a>
            <a href="#account-status" className={styles.sidebarLink}>Account Status</a>
            <a href="#theme-section" className={styles.sidebarLink}>Theme</a>
            <a href="#reading-section" className={styles.sidebarLink}>Reading</a>
            <a href="#notifications-section" className={styles.sidebarLink}>Notifications</a>
            <a href="#actions-section" className={styles.sidebarLink}>Actions</a>
          </nav>

          <div className={styles.sections}>
          <div className={styles.section}>
            <h3 id="profile" className={styles.sectionTitle}>Profile</h3>
            {profileError && <div className={styles.error} role="alert">{profileError}</div>}
            <div className={styles.profileGrid}>
              <div className={styles.avatarCol}>
                {/* Show uploaded image if present, else letter avatar */}
                { (profile?.profilePictureS3Url) ? (
                  <img
                    src={profile.profilePictureS3Url}
                    alt="Profile"
                    className={styles.avatarImage}
                  />
                ) : (
                  <div
                    className={styles.avatar}
                    aria-label="Profile picture"
                    style={{ background: getAvatarColor(profile?.username || 'U'), color: '#fff' }}
                  >
                    {(profile?.username?.[0] || 'U').toUpperCase()}
                  </div>
                )}
                <div className={styles.inlineRow} style={{ marginTop: '0.5rem' }}>
                  <label className={styles.secondaryButton} htmlFor="profilePictureInput">
                    {avatarUploading ? 'Uploading...' : 'Change Picture'}
                  </label>
                  <input id="profilePictureInput" type="file" accept="image/*" onChange={onAvatarFileChange} style={{ display: 'none' }} />
                </div>
              </div>
              <div className={styles.infoCol}>
                {/* Username */}
                <label className={styles.settingLabel} htmlFor="username">Username</label>
                <div className={styles.inlineRow}>
                  <input id="username" className={styles.settingInput} value={form.username} onChange={(e)=>setForm(f=>({...f, username:e.target.value}))} disabled={profileSaving || (activeEdit && activeEdit!=='username')} />
                  {activeEdit==='username' ? (
                    <>
                      <button className={styles.primaryButton} disabled={profileSaving} onClick={()=>submitEdit('username')}>{profileSaving?'Saving...':'Save'}</button>
                      <button className={styles.secondaryButton} disabled={profileSaving} onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <button className={styles.primaryButton} disabled={!!activeEdit} onClick={()=>startEdit('username')}>Edit</button>
                  )}
                </div>

                {/* Email */}
                <label className={styles.settingLabel} htmlFor="email">Email</label>
                <div className={styles.inlineRow}>
                  <input id="email" type="email" className={styles.settingInput} value={form.email} onChange={(e)=>setForm(f=>({...f, email:e.target.value}))} disabled={profileSaving || (activeEdit && activeEdit!=='email')} />
                  {activeEdit==='email' ? (
                    <>
                      <button className={styles.primaryButton} disabled={profileSaving} onClick={()=>submitEdit('email')}>{profileSaving?'Saving...':'Save'}</button>
                      <button className={styles.secondaryButton} disabled={profileSaving} onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <button className={styles.primaryButton} disabled={!!activeEdit} onClick={()=>startEdit('email')}>Edit</button>
                  )}
                </div>

                {/* Phone */}
                <label className={styles.settingLabel} htmlFor="phone">Phone</label>
                <div className={styles.inlineRow}>
                  <input id="phone" className={styles.settingInput} value={form.phone} onChange={(e)=>setForm(f=>({...f, phone:e.target.value}))} disabled={profileSaving || (activeEdit && activeEdit!=='phone')} />
                  {activeEdit==='phone' ? (
                    <>
                      <button className={styles.primaryButton} disabled={profileSaving} onClick={()=>submitEdit('phone')}>{profileSaving?'Saving...':'Save'}</button>
                      <button className={styles.secondaryButton} disabled={profileSaving} onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <button className={styles.primaryButton} disabled={!!activeEdit} onClick={()=>startEdit('phone')}>Edit</button>
                  )}
                </div>

                {/* Password */}
                <label className={styles.settingLabel} htmlFor="password">Password</label>
                <div className={styles.inlineRow}>
                  <input id="password" type="password" className={styles.settingInput} value={form.password} onChange={(e)=>setForm(f=>({...f, password:e.target.value}))} disabled={profileSaving || (activeEdit && activeEdit!=='password')} />
                  {activeEdit==='password' ? (
                    <>
                      <button className={styles.primaryButton} disabled={profileSaving || !form.password} onClick={()=>submitEdit('password')}>{profileSaving?'Saving...':'Save'}</button>
                      <button className={styles.secondaryButton} disabled={profileSaving} onClick={cancelEdit}>Cancel</button>
                    </>
                  ) : (
                    <button className={styles.primaryButton} disabled={!!activeEdit} onClick={()=>startEdit('password')}>Change</button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 id="account-status" className={styles.sectionTitle}>Account Status</h3>
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
            <h3 id="theme-section" className={styles.sectionTitle}>Theme Preferences</h3>
            <div className={styles.settingItem}>
              <label htmlFor="theme" className={styles.settingLabel}>
                Preferred Theme
              </label>
              <select 
                id="theme" 
                className={styles.settingSelect}
                value={settings.theme}
                onChange={(e) => {
                  const value = e.target.value
                  // Update theme immediately via context (updates localStorage & data-theme)
                  if (value === THEMES.LIGHT) setLightTheme()
                  else if (value === THEMES.DARK) setDarkTheme()
                  else setAutoTheme()
                  // Persist per-user settings and reflect in component state
                  const next = saveUserSettings({ theme: value })
                  setSettings(prev => ({ ...prev, ...next }))
                }}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
          </div>
          
          <div className={styles.section}>
            <h3 id="reading-section" className={styles.sectionTitle}>Reading Preferences</h3>
            <div className={styles.settingItem}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={settings.readingPreferences?.showDialogues ?? true}
                  onChange={(e) => setSettings(saveUserSettings({
                    readingPreferences: { showDialogues: e.target.checked }
                  }))}
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
                  onChange={(e) => setSettings(saveUserSettings({
                    readingPreferences: { enableClickNavigation: e.target.checked }
                  }))}
                />
                Enable click navigation
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h3 id="notifications-section" className={styles.sectionTitle}>Notifications</h3>
            <div className={styles.settingItem}>
              <label className={styles.checkboxLabel}>
                <input 
                  type="checkbox" 
                  className={styles.checkbox}
                  checked={settings.notifications?.emailNotifications ?? true}
                  onChange={(e) => setSettings(saveUserSettings({
                    notifications: { emailNotifications: e.target.checked }
                  }))}
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
                  onChange={(e) => setSettings(saveUserSettings({
                    notifications: { pushNotifications: e.target.checked }
                  }))}
                />
                Push notifications
              </label>
            </div>
          </div>

          <div className={styles.section}>
            <h3 id="actions-section" className={styles.sectionTitle}>Account Actions</h3>
            <div className={styles.actionGrid}>
              <button 
                className={styles.primaryButton} 
                onClick={handleToggleCreator}
                disabled={saving}
              >
                {saving ? (settings.isCreator ? 'Disabling...' : 'Enabling...') : (settings.isCreator ? 'Disable Creator Mode' : 'Enable Creator Mode')}
              </button>
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
        </div>
      </main>
    </div>
  )
}