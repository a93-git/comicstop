import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './UploadComicForm.module.css'
import { config } from '../../config'
import { FileUpload } from '../FileUpload'
import { ContributorsField } from '../ContributorsField'
import { ThumbnailField } from '../ThumbnailField'

// Lightweight, self-contained upload form with controlled state and placeholders
// Props contract:
// - initialValues?: optional initial form values
// - onSubmit: async function(formState) => void
// - loading?: boolean to disable inputs while external work is in progress
// - mySeriesOptions?: [{id, name}] minimal options for series selector
export default function UploadComicForm({ initialValues, onSubmit, onPreview, loading = false, mySeriesOptions = [], apiErrors = {} }) {
  const [form, setForm] = useState(() => ({
    title: '',
    seriesId: '',
    description: '',
    genre: [],
    tags: '',
    isAdultContent: false,
    triggerWarnings: [],
    files: [],
    previewMode: false,
    fileRef: null,
    contributors: [],
    thumbnail: { mode: 'url', url: '', file: null, previewUrl: '' },
    upload_agreement: false,
    ...(initialValues || {})
  }))
  const [errors, setErrors] = useState({})
  const fileInputRef = useRef(null)
  const [uploadPreview, setUploadPreview] = useState([]) // [{ name, url, isImage }]
  const [draftSavedAt, setDraftSavedAt] = useState(null)

  // Options (static for now; align with Upload.jsx)
  const genreOptions = useMemo(() => [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror',
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Superhero', 'Thriller'
  ], [])

  const triggerWarningOptions = useMemo(() => [
    'Suicide', 'Overt Violence', 'Sexual Content', 'Self-Harm',
    'Religious Sentiments', 'Drug Use', 'Mental Health', 'Death'
  ], [])

  // Restore from initialValues or draft
  useEffect(() => {
    if (initialValues) {
      setForm((prev) => ({ ...prev, ...initialValues }))
      return
    }
    try {
      const raw = localStorage.getItem('upload:draft')
      if (raw) {
        const parsed = JSON.parse(raw)
        setForm((prev) => ({ ...prev, ...parsed }))
      }
    } catch {}
  }, [initialValues])

  // Autosave draft
  useEffect(() => {
    try {
      const { files: _files, ...safe } = form
      localStorage.setItem('upload:draft', JSON.stringify(safe))
      setDraftSavedAt(new Date().toISOString())
    } catch {}
  }, [form])

  // Merge API errors on change
  useEffect(() => {
    if (apiErrors && Object.keys(apiErrors).length) {
      setErrors((prev) => ({ ...prev, ...apiErrors }))
    }
  }, [apiErrors])

  const setField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const toggleFromList = (field, value) => {
    setForm((prev) => {
      const curr = prev[field]
      const exists = curr.includes(value)
      const next = exists ? curr.filter((v) => v !== value) : [...curr, value]
      return { ...prev, [field]: next }
    })
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  // legacy: file list preview kept for potential future; actual upload handled by FileUpload

  const validate = () => {
    const next = {}
    if (!form.title.trim()) next.title = 'Title is required'
    if (!form.fileRef) next.files = 'Please upload at least one file'
    // Series required per spec
    if (!form.seriesId) next.seriesId = 'Please select a series'
    // Upload agreement required per spec
    if (!form.upload_agreement) next.upload_agreement = 'You must agree before uploading'
    // Validate series id only when provided
    if (form.seriesId) {
      const valid = mySeriesOptions.some((s) => String(s.id) === String(form.seriesId))
      if (!valid) next.seriesId = 'Please select a valid series'
    }

    // Contributors: forbid names when role empty. Also dedupe names per row.
    if (Array.isArray(form.contributors)) {
      let anyProblem = false
      const fixed = form.contributors.map((row) => {
        const names = Array.from(new Set((row.names || []).map((n) => n.trim()).filter(Boolean)))
        if (names.length > 0 && !row.role) anyProblem = true
        return { ...row, names }
      })
      if (anyProblem) next.contributors = 'Select a role for each contributor with names'
      // Apply deduped names silently to form
      if (JSON.stringify(fixed) !== JSON.stringify(form.contributors)) {
        setForm((prev) => ({ ...prev, contributors: fixed }))
      }
    }

    // File validations
    if (Array.isArray(form.files) && form.files.length > 0) {
      const maxBytes = config.maxUploadSizeMB * 1024 * 1024
      const badType = form.files.filter(
        (f) => !config.supportedFileTypes.some((ext) => f.name.toLowerCase().endsWith(ext.toLowerCase()))
      )
      if (badType.length) next.files = `Unsupported file types: ${badType.map((f) => f.name).join(', ')}`

      const tooBig = form.files.filter((f) => f.size > maxBytes)
      if (tooBig.length) next.files = `Files too large (max ${config.maxUploadSizeMB}MB): ${tooBig.map((f) => f.name).join(', ')}`
    }

    // Merge API field errors passed in
    const merged = { ...next, ...apiErrors }
    setErrors(merged)
    return Object.keys(merged).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    // Clean form for submission: trim/dedupe contributor names
    let cleaned = form
    if (Array.isArray(form.contributors)) {
      cleaned = {
        ...form,
        contributors: form.contributors.map((row) => ({
          ...row,
          names: Array.from(new Set((row.names || []).map((n) => n.trim()).filter(Boolean)))
        }))
      }
    }
    await onSubmit?.(cleaned)
    // Keep files unless parent resets via initialValues, but clear input for UX
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePreview = async () => {
    if (!validate()) return
    let cleaned = form
    if (Array.isArray(form.contributors)) {
      cleaned = {
        ...form,
        contributors: form.contributors.map((row) => ({
          ...row,
          names: Array.from(new Set((row.names || []).map((n) => n.trim()).filter(Boolean)))
        }))
      }
    }
    await onPreview?.(cleaned)
  }

  // DnD handled inside FileUpload for images

  return (
    <form className={styles.wrapper} onSubmit={handleSubmit} aria-busy={loading}>
      {/* Section: File Upload */}
      <section className={styles.section} aria-labelledby="files-heading">
        <h2 id="files-heading">Files</h2>
        <FileUpload onComplete={(ref) => setField('fileRef', ref)} allowImagesReorder onPreviewChange={setUploadPreview} />
        <div className={styles.help}>
          Supported: .pdf, .cbr, .cbz, .zip, .jpg, .jpeg, .png, .webp (Max {config.maxUploadSizeMB}MB per file)
        </div>
        {errors.files && <div className={styles.error}>{errors.files}</div>}
      </section>

      {/* Section: Metadata */}
      <section className={styles.section} aria-labelledby="meta-heading">
        <h2 id="meta-heading">Details</h2>
  <div className={styles.gridTwo}>
          <div>
            <label htmlFor="title">Title *</label>
            <input id="title" className={styles.input} value={form.title} onChange={(e) => setField('title', e.target.value)} disabled={loading} />
            {errors.title && <div className={styles.error}>{errors.title}</div>}
          </div>

          <div>
            <label htmlFor="seriesId">Add to Series</label>
            <select id="seriesId" className={styles.select} value={form.seriesId} onChange={(e) => setField('seriesId', e.target.value)} disabled={loading || mySeriesOptions.length === 0}>
              <option value="">— No series —</option>
              {mySeriesOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.seriesId && <div className={styles.error}>{errors.seriesId}</div>}
          </div>
        </div>

        <div className={styles.section}>
          <label>Genre(s) *</label>
          <div className={styles.checkboxGrid} role="group" aria-label="Genres">
            {genreOptions.map((g) => (
              <label key={g} className={styles.toggle}>
                <input type="checkbox" checked={form.genre.includes(g)} onChange={() => toggleFromList('genre', g)} disabled={loading} />
                <span>{g}</span>
              </label>
            ))}
          </div>
          {errors.genre && <div className={styles.error}>{errors.genre}</div>}
        </div>

        <div className={styles.section}>
          <label htmlFor="tags">Tags</label>
          <input id="tags" className={styles.input} value={form.tags} onChange={(e) => setField('tags', e.target.value)} disabled={loading} placeholder="Comma separated (e.g. hero, adventure)" />
          <div className={styles.help}>Separate with commas</div>
        </div>

        <div className={styles.section}>
          <label className={styles.toggle}>
            <input type="checkbox" checked={form.isAdultContent} onChange={(e) => setField('isAdultContent', e.target.checked)} disabled={loading} />
            <span>18+ Adult Content</span>
          </label>
        </div>

        <div className={styles.section}>
          <label>Trigger Warnings</label>
          <div className={styles.checkboxGrid} role="group" aria-label="Trigger warnings">
            {triggerWarningOptions.map((t) => (
              <label key={t} className={styles.toggle}>
                <input type="checkbox" checked={form.triggerWarnings.includes(t)} onChange={() => toggleFromList('triggerWarnings', t)} disabled={loading} />
                <span>{t}</span>
              </label>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <label>Contributors</label>
          <ContributorsField
            value={form.contributors}
            onChange={(next) => setField('contributors', next)}
            error={errors.contributors}
          />
        </div>

        <div className={styles.section}>
          <label>Cover Thumbnail</label>
          <ThumbnailField
            value={form.thumbnail}
            onChange={(next) => setField('thumbnail', next)}
            error={errors.thumbnail}
          />
          <div className={styles.help}>Optional: Provide a URL or upload an image to be used as the cover thumbnail.</div>
        </div>

        <div className={styles.section}>
          <label className={styles.toggle}>
            <input
              type="checkbox"
              checked={form.upload_agreement}
              onChange={(e) => setField('upload_agreement', e.target.checked)}
              disabled={loading}
            />
            <span>I agree that I have the right to upload and publish this content</span>
          </label>
          {errors.upload_agreement && <div className={styles.error}>{errors.upload_agreement}</div>}
        </div>

        <div>
          <label htmlFor="description">Description *</label>
          <textarea id="description" className={styles.textarea} value={form.description} onChange={(e) => setField('description', e.target.value)} disabled={loading} rows={4} placeholder="Describe your comic..." />
          {errors.description && <div className={styles.error}>{errors.description}</div>}
        </div>
      </section>

      {/* Section: Preview Toggle */}
      <section className={styles.section} aria-labelledby="preview-heading">
        <h2 id="preview-heading">Preview</h2>
        <label className={styles.toggle}>
          <input type="checkbox" checked={form.previewMode} onChange={(e) => setField('previewMode', e.target.checked)} disabled={loading} />
          <span>Show preview of metadata</span>
        </label>

        {form.previewMode && (
          <div className={styles.previewPane} role="region" aria-label="Preview">
            <strong>{form.title || 'Untitled'}</strong>
            {form.seriesId && <div>Series: {mySeriesOptions.find((s) => String(s.id) === String(form.seriesId))?.name || form.seriesId}</div>}
            <div>Genres: {form.genre.join(', ') || '—'}</div>
            <div>Tags: {form.tags || '—'}</div>
            <div>Adult: {form.isAdultContent ? 'Yes' : 'No'}</div>
            <div>Triggers: {form.triggerWarnings.join(', ') || '—'}</div>
            <div>Description: {form.description || '—'}</div>
            <div>Contributors: {form.contributors?.length || 0}</div>
            <div>Upload ref: {form.fileRef ? (form.fileRef.file_id ? 'Single file' : 'Multi-image') : '—'}</div>
            {form.thumbnail?.previewUrl && (
              <div style={{ marginTop: 8 }}>
                <div>Thumbnail:</div>
                <div className={styles.imageList}>
                  <div className={styles.imageItem}>
                    <img alt="Thumbnail preview" src={form.thumbnail.previewUrl} />
                  </div>
                </div>
              </div>
            )}
            {uploadPreview?.length > 0 && (
              <div className={styles.imageList} aria-label="Upload Preview Thumbnails">
                {uploadPreview.map((p, idx) => (
                  <div className={styles.imageItem} key={`${p.name}-${idx}`}>
                    {p.isImage ? <img alt={`Page ${idx + 1}: ${p.name}`} src={p.url} /> : <span>{p.name}</span>}
                    <div className={styles.dragHint}>#{idx + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      <div className={styles.actions}>
        <button
          type="submit"
          className={styles.primary}
          disabled={loading || !(
            form.title?.trim() && form.fileRef && form.seriesId && form.upload_agreement
          )}
        >
          Save & Continue
        </button>
        <button type="button" className={styles.secondary} disabled={loading} onClick={handlePreview}>Preview & Save Draft</button>
        <button type="button" className={styles.secondary} disabled={loading} onClick={() => {
          setForm((prev) => ({
            ...prev,
            title: '', seriesId: '', description: '', genre: [], tags: '', isAdultContent: false, triggerWarnings: [], files: [], fileRef: null, contributors: []
          }))
          if (fileInputRef.current) fileInputRef.current.value = ''
          setErrors({})
          setUploadPreview([])
          try { localStorage.removeItem('upload:draft') } catch {}
        }}>Reset</button>
        {draftSavedAt && <span className={styles.help} aria-live="polite">Draft saved</span>}
      </div>
    </form>
  )
}
