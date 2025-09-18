import { useEffect, useMemo, useRef, useState } from 'react'
import styles from './ThumbnailField.module.css'

/**
 * ThumbnailField component
 * Lets user provide a thumbnail either via URL or by uploading a single image file.
 * Props:
 * - value: { mode: 'url' | 'file', url?: string, file?: File, previewUrl?: string }
 * - onChange: (next) => void
 * - label?: string
 * - error?: string
 * - accept?: string[] of extensions
 */
export default function ThumbnailField({ value, onChange, label = 'Cover Thumbnail', error, accept }) {
  const [mode, setMode] = useState(value?.mode || 'url')
  const [url, setUrl] = useState(value?.url || '')
  const [file, setFile] = useState(value?.file || null)
  const [previewUrl, setPreviewUrl] = useState(value?.previewUrl || '')
  const [localError, setLocalError] = useState('')
  const inputRef = useRef(null)

  const acceptExts = useMemo(() => accept || ['.jpg', '.jpeg', '.png', '.webp'], [accept])

  useEffect(() => {
    setMode(value?.mode || 'url')
    setUrl(value?.url || '')
    setFile(value?.file || null)
    setPreviewUrl(value?.previewUrl || '')
    setLocalError('')
  }, [value])

  useEffect(() => {
    if (mode === 'url') {
      setFile(null)
      if (url) setPreviewUrl(url)
      onChange?.({ mode, url, file: null, previewUrl: url || '' })
    } else if (mode === 'file') {
      setUrl('')
      if (file) {
        const u = URL.createObjectURL(file)
        setPreviewUrl(u)
        onChange?.({ mode, url: '', file, previewUrl: u })
        return () => { try { URL.revokeObjectURL(u) } catch {} }
      } else {
        setPreviewUrl('')
        onChange?.({ mode, url: '', file: null, previewUrl: '' })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, url, file])

  const onPick = () => inputRef.current?.click()

  const isLikelyUrl = (u) => {
    // Basic URL regex; HEAD check is attempted separately
    try {
      const parsed = new URL(u)
      return parsed.protocol === 'http:' || parsed.protocol === 'https:'
    } catch { return false }
  }

  // Attempt a lightweight HEAD check to validate accessibility and content type
  const headCheck = async (u) => {
    try {
      const res = await fetch(u, { method: 'HEAD', mode: 'no-cors' })
      // In no-cors mode, status is 0 and we can't read headers; consider basic URL valid
      if (res.type === 'opaque') return true
      if (!res.ok) return false
      const ct = res.headers.get('content-type') || ''
      if (ct && !(ct.includes('image/'))) return false
      return true
    } catch {
      return false
    }
  }

  const onFileChange = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const name = f.name?.toLowerCase() || ''
    const ok = acceptExts.some(ext => name.endsWith(ext))
    if (!ok) return
    setFile(f)
  }

  const onRemove = () => {
    setUrl('')
    setFile(null)
    setPreviewUrl('')
    setLocalError('')
    onChange?.({ mode, url: '', file: null, previewUrl: '' })
  }

  // Validate URL on blur
  const onUrlBlur = async () => {
    if (!url) { setLocalError(''); return }
    if (!isLikelyUrl(url)) {
      setLocalError('Enter a valid URL starting with http(s)')
      return
    }
    // Best-effort HEAD check
    const ok = await headCheck(url)
    if (!ok) {
      setLocalError('Could not verify image URL (might be blocked by CORS)')
    } else {
      setLocalError('')
    }
  }

  return (
    <div className={styles.wrapper}>
      {label && <div className={styles.label}>{label}</div>}
      {(error || localError) && <div className={styles.error} role="alert">{error || localError}</div>}

      <div className={styles.modeRow}>
        <label className={styles.radioLabel}>
          <input type="radio" name="thumb-mode" checked={mode === 'url'} onChange={() => setMode('url')} />
          URL
        </label>
        <label className={styles.radioLabel}>
          <input type="radio" name="thumb-mode" checked={mode === 'file'} onChange={() => setMode('file')} />
          Upload file
        </label>
        {(url || file) && (
          <button type="button" className={styles.btnSecondary} onClick={onRemove} aria-label="Remove thumbnail">Remove</button>
        )}
      </div>

      {mode === 'url' ? (
        <input
          className={styles.input}
          placeholder="https://example.com/cover.jpg"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onBlur={onUrlBlur}
        />
      ) : (
        <div className={styles.uploadRow}>
          <button type="button" className={styles.btn} onClick={onPick}>Choose image</button>
          <input ref={inputRef} type="file" accept={acceptExts.join(',')} onChange={onFileChange} hidden />
          <span className={styles.help}>{file?.name || 'JPG, PNG, or WEBP'}</span>
        </div>
      )}

      {previewUrl && (
        <div className={styles.previewBox}>
          <img alt="Thumbnail preview image" src={previewUrl} />
        </div>
      )}
    </div>
  )
}
