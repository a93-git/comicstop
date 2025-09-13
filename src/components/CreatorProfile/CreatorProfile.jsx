import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { getMyCreatorProfile, updateCreatorProfile } from '../../services/api'
import styles from './CreatorProfile.module.css'

export function CreatorProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    websiteUrl: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      facebook: '',
      youtube: '',
      tiktok: '',
      discord: ''
    },
    customColorTheme: {
      primary: '#FF6B2C',
      secondary: '#6B7280',
      accent: '#10B981'
    },
    allowComments: true,
    moderateComments: false,
    emailNotifications: true,
    publicStats: false,
    acceptDonations: false,
    watermarkEnabled: false
  })
  const [files, setFiles] = useState({
    profilePicture: null,
    bannerImage: null,
    logo: null,
    watermark: null
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    document.title = 'ComicStop – Creator Profile'
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      setLoading(true)
      const profileData = await getMyCreatorProfile()
      
      if (profileData) {
        setProfile(profileData)
        setFormData({
          displayName: profileData.displayName || '',
          bio: profileData.bio || '',
          websiteUrl: profileData.websiteUrl || '',
          socialLinks: {
            twitter: profileData.socialLinks?.twitter || '',
            instagram: profileData.socialLinks?.instagram || '',
            facebook: profileData.socialLinks?.facebook || '',
            youtube: profileData.socialLinks?.youtube || '',
            tiktok: profileData.socialLinks?.tiktok || '',
            discord: profileData.socialLinks?.discord || ''
          },
          customColorTheme: {
            primary: profileData.customColorTheme?.primary || '#FF6B2C',
            secondary: profileData.customColorTheme?.secondary || '#6B7280',
            accent: profileData.customColorTheme?.accent || '#10B981'
          },
          allowComments: profileData.allowComments ?? true,
          moderateComments: profileData.moderateComments ?? false,
          emailNotifications: profileData.emailNotifications ?? true,
          publicStats: profileData.publicStats ?? false,
          acceptDonations: profileData.acceptDonations ?? false,
          watermarkEnabled: profileData.watermarkEnabled ?? false
        })
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
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

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target
    if (fileList.length > 0) {
      setFiles(prev => ({
        ...prev,
        [name]: fileList[0]
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (formData.displayName && formData.displayName.length > 255) {
      newErrors.displayName = 'Display name must be less than 255 characters'
    }

    if (formData.bio && formData.bio.length > 2000) {
      newErrors.bio = 'Bio must be less than 2000 characters'
    }

    if (formData.websiteUrl && !isValidUrl(formData.websiteUrl)) {
      newErrors.websiteUrl = 'Please enter a valid URL'
    }

    // Validate social links
    Object.entries(formData.socialLinks).forEach(([platform, url]) => {
      if (url && !isValidUrl(url)) {
        newErrors[`socialLinks.${platform}`] = 'Please enter a valid URL'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const isValidUrl = (string) => {
    try {
      new URL(string)
      return true
    } catch {
      return false
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    setErrors({})
    setSuccessMessage('')

    try {
      const submitData = new FormData()

      // Add form data
      Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          submitData.append(key, JSON.stringify(value))
        } else {
          submitData.append(key, value)
        }
      })

      // Add files
      Object.entries(files).forEach(([key, file]) => {
        if (file) {
          submitData.append(key, file)
        }
      })

      await updateCreatorProfile(submitData)
      setSuccessMessage('Profile updated successfully!')
      
      // Reload profile data
      await loadProfile()
    } catch (error) {
      console.error('Profile update failed:', error)
      setErrors({ general: error.message || 'Failed to update profile' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loading}>Loading creator profile...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navbar />
      
      <div className={styles.main}>
        <div className={styles.header}>
          <h1>Creator Profile</h1>
          <button 
            onClick={() => navigate('/creator/dashboard')}
            className={styles.backButton}
          >
            ← Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {errors.general && (
            <div className={styles.errorMessage}>{errors.general}</div>
          )}
          
          {successMessage && (
            <div className={styles.successMessage}>{successMessage}</div>
          )}

          {/* Basic Information */}
          <section className={styles.section}>
            <h2>Basic Information</h2>
            
            <div className={styles.field}>
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                placeholder="Your creator name"
                className={styles.input}
              />
              {errors.displayName && (
                <span className={styles.fieldError}>{errors.displayName}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="bio">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell readers about yourself and your work..."
                rows={4}
                className={styles.textarea}
              />
              {errors.bio && (
                <span className={styles.fieldError}>{errors.bio}</span>
              )}
            </div>

            <div className={styles.field}>
              <label htmlFor="websiteUrl">Website URL</label>
              <input
                type="url"
                id="websiteUrl"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                placeholder="https://your-website.com"
                className={styles.input}
              />
              {errors.websiteUrl && (
                <span className={styles.fieldError}>{errors.websiteUrl}</span>
              )}
            </div>
          </section>

          {/* Media Uploads */}
          <section className={styles.section}>
            <h2>Profile Media</h2>
            
            <div className={styles.mediaGrid}>
              <div className={styles.mediaField}>
                <label htmlFor="profilePicture">Profile Picture</label>
                <input
                  type="file"
                  id="profilePicture"
                  name="profilePicture"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                {profile?.profilePictureS3Url && (
                  <div className={styles.currentImage}>
                    <img src={profile.profilePictureS3Url} alt="Current profile" />
                  </div>
                )}
              </div>

              <div className={styles.mediaField}>
                <label htmlFor="bannerImage">Banner Image</label>
                <input
                  type="file"
                  id="bannerImage"
                  name="bannerImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                {profile?.bannerImageS3Url && (
                  <div className={styles.currentImage}>
                    <img src={profile.bannerImageS3Url} alt="Current banner" />
                  </div>
                )}
              </div>

              <div className={styles.mediaField}>
                <label htmlFor="logo">Logo</label>
                <input
                  type="file"
                  id="logo"
                  name="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                {profile?.logoS3Url && (
                  <div className={styles.currentImage}>
                    <img src={profile.logoS3Url} alt="Current logo" />
                  </div>
                )}
              </div>

              <div className={styles.mediaField}>
                <label htmlFor="watermark">Watermark</label>
                <input
                  type="file"
                  id="watermark"
                  name="watermark"
                  accept="image/*"
                  onChange={handleFileChange}
                  className={styles.fileInput}
                />
                {profile?.watermarkS3Url && (
                  <div className={styles.currentImage}>
                    <img src={profile.watermarkS3Url} alt="Current watermark" />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Social Links */}
          <section className={styles.section}>
            <h2>Social Media Links</h2>
            
            <div className={styles.socialGrid}>
              {Object.entries(formData.socialLinks).map(([platform, url]) => (
                <div key={platform} className={styles.field}>
                  <label htmlFor={`socialLinks.${platform}`}>
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </label>
                  <input
                    type="url"
                    id={`socialLinks.${platform}`}
                    name={`socialLinks.${platform}`}
                    value={url}
                    onChange={handleInputChange}
                    placeholder={`https://${platform}.com/yourusername`}
                    className={styles.input}
                  />
                  {errors[`socialLinks.${platform}`] && (
                    <span className={styles.fieldError}>
                      {errors[`socialLinks.${platform}`]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Color Theme */}
          <section className={styles.section}>
            <h2>Custom Color Theme</h2>
            
            <div className={styles.colorGrid}>
              <div className={styles.field}>
                <label htmlFor="customColorTheme.primary">Primary Color</label>
                <input
                  type="color"
                  id="customColorTheme.primary"
                  name="customColorTheme.primary"
                  value={formData.customColorTheme.primary}
                  onChange={handleInputChange}
                  className={styles.colorInput}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="customColorTheme.secondary">Secondary Color</label>
                <input
                  type="color"
                  id="customColorTheme.secondary"
                  name="customColorTheme.secondary"
                  value={formData.customColorTheme.secondary}
                  onChange={handleInputChange}
                  className={styles.colorInput}
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="customColorTheme.accent">Accent Color</label>
                <input
                  type="color"
                  id="customColorTheme.accent"
                  name="customColorTheme.accent"
                  value={formData.customColorTheme.accent}
                  onChange={handleInputChange}
                  className={styles.colorInput}
                />
              </div>
            </div>
          </section>

          {/* Settings */}
          <section className={styles.section}>
            <h2>Settings</h2>
            
            <div className={styles.settingsGrid}>
              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="allowComments"
                  name="allowComments"
                  checked={formData.allowComments}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="allowComments">Allow comments on my comics</label>
              </div>

              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="moderateComments"
                  name="moderateComments"
                  checked={formData.moderateComments}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="moderateComments">Moderate comments before publishing</label>
              </div>

              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="emailNotifications"
                  name="emailNotifications"
                  checked={formData.emailNotifications}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="emailNotifications">Receive email notifications</label>
              </div>

              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="publicStats"
                  name="publicStats"
                  checked={formData.publicStats}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="publicStats">Make my statistics public</label>
              </div>

              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="acceptDonations"
                  name="acceptDonations"
                  checked={formData.acceptDonations}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="acceptDonations">Accept donations from readers</label>
              </div>

              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  id="watermarkEnabled"
                  name="watermarkEnabled"
                  checked={formData.watermarkEnabled}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <label htmlFor="watermarkEnabled">Apply watermark to uploaded comics</label>
              </div>
            </div>
          </section>

          <div className={styles.submitSection}>
            <button
              type="submit"
              disabled={submitting}
              className={styles.submitButton}
            >
              {submitting ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}