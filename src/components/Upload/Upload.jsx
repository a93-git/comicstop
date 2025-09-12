import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { getUserProfile, uploadComic } from '../../services/api'
import { config } from '../../config'
import styles from './Upload.module.css'

export function Upload() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    genre: [],
    tags: '',
    isAdultContent: false,
    triggerWarnings: [],
    description: '',
    files: []
  })
  const [errors, setErrors] = useState({})
  const [generalError, setGeneralError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  // Available options for form
  const genreOptions = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Superhero', 'Thriller'
  ]

  const triggerWarningOptions = [
    'Suicide', 'Overt Violence', 'Sexual Content', 'Self-Harm', 
    'Religious Sentiments', 'Drug Use', 'Mental Health', 'Death'
  ]

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        // No token, redirect immediately
        navigate('/login')
        return
      }

      try {
        await getUserProfile()
        // User is authenticated, continue
      } catch (error) {
        console.log('User not authenticated:', error)
        // Remove invalid token and redirect to login page
        localStorage.removeItem('authToken')
        navigate('/login')
        return
      }
      setLoading(false)
    }

    checkAuth()
  }, [navigate])

  // Form validation
  const validateForm = () => {
    const newErrors = {}

    // Required field validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.genre.length === 0) {
      newErrors.genre = 'Please select at least one genre'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required'
    }

    if (formData.files.length === 0) {
      newErrors.files = 'Please select at least one file to upload'
    } else {
      // Validate file types
      const invalidFiles = formData.files.filter(file => 
        !config.supportedFileTypes.some(type => 
          file.name.toLowerCase().endsWith(type.toLowerCase())
        )
      )
      if (invalidFiles.length > 0) {
        newErrors.files = `Unsupported file types: ${invalidFiles.map(f => f.name).join(', ')}`
      }

      // Validate file sizes
      const maxSizeBytes = config.maxUploadSizeMB * 1024 * 1024
      const oversizedFiles = formData.files.filter(file => file.size > maxSizeBytes)
      if (oversizedFiles.length > 0) {
        newErrors.files = `Files too large (max ${config.maxUploadSizeMB}MB): ${oversizedFiles.map(f => f.name).join(', ')}`
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
    
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Handle multi-select changes (genre and trigger warnings)
  const handleMultiSelectChange = (fieldName, value) => {
    setFormData(prev => {
      const currentValues = prev[fieldName]
      const newValues = currentValues.includes(value)
        ? currentValues.filter(item => item !== value)
        : [...currentValues, value]
      
      return {
        ...prev,
        [fieldName]: newValues
      }
    })

    // Clear field error
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }))
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files)
    setFormData(prev => ({
      ...prev,
      files: selectedFiles
    }))

    // Clear file error
    if (errors.files) {
      setErrors(prev => ({
        ...prev,
        files: ''
      }))
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')
    setSuccessMessage('')

    if (!validateForm()) {
      return
    }

    setSubmitting(true)
    try {
      // Prepare form data for upload
      const uploadFormData = new FormData()
      
      // Add text fields
      uploadFormData.append('title', formData.title)
      uploadFormData.append('genre', JSON.stringify(formData.genre))
      uploadFormData.append('tags', formData.tags)
      uploadFormData.append('isAdultContent', formData.isAdultContent)
      uploadFormData.append('triggerWarnings', JSON.stringify(formData.triggerWarnings))
      uploadFormData.append('description', formData.description)
      
      // Add files
      formData.files.forEach((file) => {
        uploadFormData.append(`files`, file)
      })

      await uploadComic(uploadFormData)
      
      setSuccessMessage('Comic uploaded successfully!')
      
      // Reset form
      setFormData({
        title: '',
        genre: [],
        tags: '',
        isAdultContent: false,
        triggerWarnings: [],
        description: '',
        files: []
      })

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]')
      if (fileInput) {
        fileInput.value = ''
      }

      // Navigate to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)

    } catch (error) {
      setGeneralError(error.message || 'Upload failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div>
        <Navbar showAuth={false} />
        <div className={styles.container}>
          <div className={styles.loading}>
            <p>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Main upload form
  return (
    <div>
      <Navbar showAuth={false} />
      <div className={styles.container}>
        <div className={styles.formWrapper}>
          <h1 className={styles.title}>Upload Comics</h1>
          <p className={styles.subtitle}>Share your comic collection with the community</p>

          {successMessage && (
            <div className={styles.successMessage}>
              {successMessage}
            </div>
          )}

          {generalError && (
            <div className={styles.errorMessage}>
              {generalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Title */}
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                disabled={submitting}
                placeholder="Enter comic title"
              />
              {errors.title && <span className={styles.fieldError}>{errors.title}</span>}
            </div>

            {/* Genre */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Genre(s) *</label>
              <div className={styles.checkboxGrid}>
                {genreOptions.map((genre) => (
                  <label key={genre} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={formData.genre.includes(genre)}
                      onChange={() => handleMultiSelectChange('genre', genre)}
                      disabled={submitting}
                    />
                    <span className={styles.checkboxLabel}>{genre}</span>
                  </label>
                ))}
              </div>
              {errors.genre && <span className={styles.fieldError}>{errors.genre}</span>}
            </div>

            {/* Tags */}
            <div className={styles.formGroup}>
              <label htmlFor="tags" className={styles.label}>
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className={styles.input}
                disabled={submitting}
                placeholder="Enter tags separated by commas (e.g., hero, adventure, marvel)"
              />
              <small className={styles.helpText}>Separate multiple tags with commas</small>
            </div>

            {/* Age Restriction */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  name="isAdultContent"
                  checked={formData.isAdultContent}
                  onChange={handleChange}
                  disabled={submitting}
                />
                <span className={styles.checkboxLabel}>18+ Adult Content</span>
              </label>
            </div>

            {/* Trigger Warnings */}
            <div className={styles.formGroup}>
              <label className={styles.label}>Trigger Warnings</label>
              <div className={styles.checkboxGrid}>
                {triggerWarningOptions.map((warning) => (
                  <label key={warning} className={styles.checkboxItem}>
                    <input
                      type="checkbox"
                      checked={formData.triggerWarnings.includes(warning)}
                      onChange={() => handleMultiSelectChange('triggerWarnings', warning)}
                      disabled={submitting}
                    />
                    <span className={styles.checkboxLabel}>{warning}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className={styles.formGroup}>
              <label htmlFor="description" className={styles.label}>
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                disabled={submitting}
                placeholder="Provide a detailed description of your comic..."
                rows={4}
              />
              {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
            </div>

            {/* File Upload */}
            <div className={styles.formGroup}>
              <label htmlFor="files" className={styles.label}>
                Files *
              </label>
              <input
                type="file"
                id="files"
                multiple
                accept={config.supportedFileTypes.join(',')}
                onChange={handleFileChange}
                className={`${styles.fileInput} ${errors.files ? styles.inputError : ''}`}
                disabled={submitting}
              />
              <small className={styles.helpText}>
                Supported formats: {config.supportedFileTypes.join(', ')} 
                (Max {config.maxUploadSizeMB}MB per file)
              </small>
              {formData.files.length > 0 && (
                <div className={styles.fileList}>
                  <p>Selected files:</p>
                  <ul>
                    {formData.files.map((file, index) => (
                      <li key={index}>
                        {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {errors.files && <span className={styles.fieldError}>{errors.files}</span>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={styles.submitButton}
              disabled={submitting}
            >
              {submitting ? 'Uploading...' : 'Upload Comic'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}