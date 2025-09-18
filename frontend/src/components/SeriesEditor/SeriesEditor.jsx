import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import styles from './SeriesEditor.module.css'
import { createSeries, deleteSeries, getSeriesById, updateSeries } from '../../services/api'

export function SeriesEditor() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id && id !== 'new')

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [genre, setGenre] = useState('')
  const [tags, setTags] = useState([])
  const [ageRating, setAgeRating] = useState('')
  const [language, setLanguage] = useState('en')
  const [status, setStatus] = useState('ongoing')
  const [isPublic, setIsPublic] = useState(true)
  const [coverFile, setCoverFile] = useState(null)
  const [coverPreview, setCoverPreview] = useState('')

  // Load series when editing
  useEffect(() => {
    let mounted = true
    if (!isEdit) return
    ;(async () => {
      try {
        setLoading(true)
        const s = await getSeriesById(id)
        if (!mounted) return
        setTitle(s.title || '')
        setDescription(s.description || '')
        setGenre(s.genre || '')
        setTags(Array.isArray(s.tags) ? s.tags : [])
        setAgeRating(s.ageRating || '')
        setLanguage(s.language || 'en')
        setStatus(s.status || 'ongoing')
        setIsPublic(Boolean(s.isPublic))
        setCoverPreview(s.coverArtS3Url || '')
      } catch (e) {
        console.error(e)
        setError('Failed to load series')
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id, isEdit])

  // Cover preview URL management
  const lastObjectUrl = useRef('')
  useEffect(() => {
    if (coverFile) {
      const url = URL.createObjectURL(coverFile)
      setCoverPreview(url)
      if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current)
      lastObjectUrl.current = url
    }
    return () => {
      if (lastObjectUrl.current) URL.revokeObjectURL(lastObjectUrl.current)
    }
  }, [coverFile])

  const canSave = useMemo(() => title.trim().length > 0, [title])

  const handleSubmit = async (e) => {
    e?.preventDefault?.()
    if (!canSave) return
    try {
      setSaving(true)
      setError(null)
      const form = new FormData()
      form.append('title', title.trim())
      if (description) form.append('description', description)
      if (genre) form.append('genre', genre)
      if (tags?.length) tags.forEach(t => form.append('tags', t))
      if (ageRating) form.append('ageRating', ageRating)
      if (language) form.append('language', language)
      if (status) form.append('status', status)
      form.append('isPublic', String(isPublic))
      if (coverFile) form.append('coverArt', coverFile)

      if (isEdit) {
        await updateSeries(id, form)
      } else {
        const created = await createSeries(form)
        // Navigate to edit page for further changes
        navigate(`/creator/series/${created.id}`)
        return
      }
      navigate('/creator/dashboard')
    } catch (e) {
      console.error(e)
      setError(e.message || 'Failed to save series')
    } finally {
      setSaving(false)
    }
  }

  const [tagDraft, setTagDraft] = useState('')
  const addTag = () => {
    const t = tagDraft.trim()
    if (!t) return
    if (!tags.includes(t)) setTags(prev => [...prev, t])
    setTagDraft('')
  }
  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t))

  const handleDelete = async () => {
    if (!isEdit) return
    if (!confirm('Delete this series? This will hide it and its comics.')) return
    try {
      setSaving(true)
      await deleteSeries(id)
      navigate('/creator/dashboard')
    } catch (e) {
      setError(e.message || 'Failed to delete series')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.main}>
        <div className={styles.header}>
          <div className={styles.title}>{isEdit ? 'Edit Series' : 'Create Series'}</div>
          <div className={styles.actions}>
            {isEdit && (
              <button className={styles.dangerButton} onClick={handleDelete} disabled={saving}>Delete</button>
            )}
            <button className={styles.secondaryButton} onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
            <button className={styles.primaryButton} onClick={handleSubmit} disabled={!canSave || saving}>
              {saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Series')}
            </button>
          </div>
        </div>

        {loading ? (
          <div>Loading…</div>
        ) : (
          <form className={styles.form} onSubmit={handleSubmit}>
            {error && <div role="alert" className={styles.help}>{error}</div>}

            <div className={styles.field}>
              <label className={styles.label} htmlFor="title">Title</label>
              <input id="title" className={styles.input} value={title} onChange={e => setTitle(e.target.value)} required />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="desc">Description</label>
              <textarea id="desc" className={styles.textarea} value={description} onChange={e => setDescription(e.target.value)} />
              <span className={styles.help}>Up to 2000 characters.</span>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="genre">Genre</label>
                <input id="genre" className={styles.input} value={genre} onChange={e => setGenre(e.target.value)} placeholder="e.g. Action" />
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="language">Language</label>
                <input id="language" className={styles.input} value={language} onChange={e => setLanguage(e.target.value)} placeholder="en" />
              </div>
            </div>

            <div className={styles.row}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="ageRating">Age rating</label>
                <select id="ageRating" className={styles.select} value={ageRating} onChange={e => setAgeRating(e.target.value)}>
                  <option value="">None</option>
                  <option value="G">G</option>
                  <option value="PG">PG</option>
                  <option value="PG-13">PG-13</option>
                  <option value="R">R</option>
                  <option value="NC-17">NC-17</option>
                </select>
              </div>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="status">Status</label>
                <select id="status" className={styles.select} value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="hiatus">Hiatus</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Visibility</label>
              <div className={styles.checkboxRow}>
                <input type="checkbox" id="isPublic" checked={isPublic} onChange={e => setIsPublic(e.target.checked)} />
                <label htmlFor="isPublic">Public</label>
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Tags</label>
              <div className={styles.tagInput}>
                {tags.map(t => (
                  <span key={t} className={styles.tag}>{t}<button type="button" aria-label={`Remove ${t}`} onClick={() => removeTag(t)}>×</button></span>
                ))}
              </div>
              <div className={styles.tagEditor}>
                <input className={styles.input} placeholder="Add a tag" value={tagDraft} onChange={e => setTagDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }} />
                <button type="button" className={styles.secondaryButton} onClick={addTag}>Add</button>
              </div>
              <span className={styles.help}>Up to 20 tags. Press Enter to add.</span>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Cover image</label>
              <div className={styles.coverPicker}>
                <div className={styles.coverPreview}>
                  {coverPreview ? <img src={coverPreview} alt="Series cover" /> : <span className={styles.help}>No cover</span>}
                </div>
                <div>
                  <input type="file" accept="image/*" onChange={e => setCoverFile(e.target.files?.[0] || null)} />
                  <div className={styles.help}>Optional. Recommended 3:4 aspect.</div>
                </div>
              </div>
            </div>

            <div className={styles.actions}>
              <button type="button" className={styles.secondaryButton} onClick={() => navigate(-1)} disabled={saving}>Cancel</button>
              <button type="submit" className={styles.primaryButton} disabled={!canSave || saving}>{saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Series')}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
