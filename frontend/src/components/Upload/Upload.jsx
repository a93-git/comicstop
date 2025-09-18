import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { getUserProfile, getMySeriesMinimal, createComic, updateComic } from '../../services/api'
import styles from './Upload.module.css'
import { UploadComicForm } from '../UploadComicForm'

export function Upload() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [mySeriesOptions, setMySeriesOptions] = useState([])
  const [generalError, setGeneralError] = useState('')
  const [apiFieldErrors, setApiFieldErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')
  const [resetKey, setResetKey] = useState(0)

  // (Options moved inside UploadComicForm)

  // Check authentication on component mount
  useEffect(() => {
    // Set page title
    document.title = 'ComicStop – Upload'
    
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken')
      if (!token) {
        // No token, redirect immediately
        navigate('/login')
        return
      }

      try {
        await getUserProfile()
        // Fetch minimal series list for selector
        try {
          const series = await getMySeriesMinimal()
          setMySeriesOptions(series)
        } catch (e) {
          console.warn('Failed to load series list for selector:', e)
        }
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

  // Handle form submission (UploadComicForm -> uploadComic API)
  const handleSubmit = async (formData) => {
    setGeneralError('')
    setSuccessMessage('')
    setSubmitting(true)
    try {
      // Build create payload, using fileRef from FileUpload flow
      const lastDraftId = (() => { try { return localStorage.getItem('upload:lastDraftId') } catch { return null } })()
      const isFileThumb = formData.thumbnail?.mode === 'file' && formData.thumbnail?.file
      if (isFileThumb) {
        // Multipart for create or patch with thumbnail file
        const fd = new FormData()
        fd.append('title', formData.title)
        fd.append('upload_agreement', 'true')
        if (formData.seriesId) fd.append('series_id', formData.seriesId)
        if (formData.description) fd.append('description', formData.description)
        if (Array.isArray(formData.genre)) formData.genre.forEach(g => fd.append('genres[]', g))
        const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        tags.forEach(t => fd.append('tags[]', t))
        fd.append('age_restricted', String(!!formData.isAdultContent))
        if (Array.isArray(formData.contributors)) fd.append('contributors', JSON.stringify(formData.contributors))
        if (formData.fileRef?.file_id) fd.append('file_id', formData.fileRef.file_id)
        if (Array.isArray(formData.fileRef?.page_order)) formData.fileRef.page_order.forEach(p => fd.append('page_order[]', p))
        fd.append('thumbnailUpload', formData.thumbnail.file)
        if (lastDraftId) {
          fd.append('status', 'published')
          await updateComic(lastDraftId, fd, { multipart: true })
        } else {
          await createComic(fd, { multipart: true })
        }
      } else {
        const payload = {
          title: formData.title,
          upload_agreement: true,
          series_id: formData.seriesId || undefined,
          description: formData.description,
          genres: formData.genre,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          age_restricted: !!formData.isAdultContent,
        }
        if (formData.thumbnail?.mode === 'url' && formData.thumbnail?.url) {
          payload.thumbnail_url = formData.thumbnail.url
        }
        if (Array.isArray(formData.contributors) && formData.contributors.length) {
          payload.contributors = formData.contributors
        }
        if (formData.fileRef?.file_id) {
          payload.file_id = formData.fileRef.file_id
        } else if (Array.isArray(formData.fileRef?.page_order)) {
          payload.page_order = formData.fileRef.page_order
        }
        if (lastDraftId) {
          await updateComic(lastDraftId, { ...payload, status: 'published' })
        } else {
          await createComic(payload)
        }
      }
      setSuccessMessage('Comic uploaded successfully!')
      // Clear stored draft id after publish
      try { localStorage.removeItem('upload:lastDraftId') } catch {}
      // Force reset child form
      setResetKey((k) => k + 1)
      // Navigate soon after success
      setTimeout(() => navigate('/dashboard'), 2000)
    } catch (error) {
      setGeneralError(error.message || 'Upload failed. Please try again.')
      // Map backend validation errors if provided
      const fields = {}
      if (error?.errors && typeof error.errors === 'object') {
        Object.entries(error.errors).forEach(([k, v]) => { fields[k] = Array.isArray(v) ? v.join(', ') : String(v) })
      }
      setApiFieldErrors(fields)
    } finally {
      setSubmitting(false)
    }
  }

  // Handle Preview: save as draft and navigate to preview page
  const handlePreview = async (formData) => {
    setGeneralError('')
    setSubmitting(true)
    try {
      const isFileThumb = formData.thumbnail?.mode === 'file' && formData.thumbnail?.file
      let created
      if (isFileThumb) {
        const fd = new FormData()
        fd.append('title', formData.title)
        fd.append('upload_agreement', 'true')
        if (formData.seriesId) fd.append('series_id', formData.seriesId)
        if (formData.description) fd.append('description', formData.description)
        if (Array.isArray(formData.genre)) formData.genre.forEach(g => fd.append('genres[]', g))
        const tags = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        tags.forEach(t => fd.append('tags[]', t))
        fd.append('age_restricted', String(!!formData.isAdultContent))
        if (Array.isArray(formData.contributors)) fd.append('contributors', JSON.stringify(formData.contributors))
        if (formData.fileRef?.file_id) fd.append('file_id', formData.fileRef.file_id)
        if (Array.isArray(formData.fileRef?.page_order)) formData.fileRef.page_order.forEach(p => fd.append('page_order[]', p))
        if (formData.thumbnail?.file) fd.append('thumbnailUpload', formData.thumbnail.file)
        created = await createComic(fd, { multipart: true })
      } else {
        const payload = {
          title: formData.title,
          upload_agreement: true,
          series_id: formData.seriesId || undefined,
          description: formData.description,
          genres: formData.genre,
          tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          age_restricted: !!formData.isAdultContent,
        }
        if (formData.thumbnail?.mode === 'url' && formData.thumbnail?.url) {
          payload.thumbnail_url = formData.thumbnail.url
        }
        if (Array.isArray(formData.contributors) && formData.contributors.length) {
          payload.contributors = formData.contributors
        }
        if (formData.fileRef?.file_id) {
          payload.file_id = formData.fileRef.file_id
        } else if (Array.isArray(formData.fileRef?.page_order)) {
          payload.page_order = formData.fileRef.page_order
        }
        created = await createComic(payload)
      }

      const draftId = created?.id || created?.comic?.id || created?.data?.comic?.id
      if (draftId) {
        try { localStorage.setItem('upload:lastDraftId', String(draftId)) } catch {}
        navigate(`/preview/${draftId}`)
      } else {
        throw new Error('Draft ID missing from response')
      }
    } catch (error) {
      setGeneralError(error.message || 'Preview failed. Please try again.')
      const fields = {}
      if (error?.errors && typeof error.errors === 'object') {
        Object.entries(error.errors).forEach(([k, v]) => { fields[k] = Array.isArray(v) ? v.join(', ') : String(v) })
      }
      setApiFieldErrors(fields)
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

          <UploadComicForm key={resetKey} onSubmit={handleSubmit} onPreview={handlePreview} loading={submitting} mySeriesOptions={mySeriesOptions} apiErrors={apiFieldErrors} />
        </div>
      </div>
    </div>
  )
}