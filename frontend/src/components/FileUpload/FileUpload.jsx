import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styles from './FileUpload.module.css'
import { config } from '../../config'
import axios from 'axios'
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

function Progress({ value }) {
  const pct = Math.max(0, Math.min(100, Math.round(value || 0)))
  return (
    <div className={styles.progressWrap} aria-label={`Upload progress ${pct}%`}>
      <div className={styles.progress}>
        <div className={styles.bar} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function SortableItem({ id, file, url, isImage }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  return (
    <div ref={setNodeRef} style={style} className={styles.item} {...attributes} {...listeners} aria-label={`Draggable item ${file.name}`}>
      <div className={styles.thumb}>
        {isImage ? <img alt={file.name} src={url} /> : <span aria-hidden>FILE</span>}
      </div>
      <div className={styles.name} title={file.name}>{file.name}</div>
    </div>
  )
}

/**
 * FileUpload component
 * Props:
 * - onComplete: ({ file_id } | { page_order, uploadId }) => void
 * - allowImagesReorder?: boolean
 */
export default function FileUpload({ onComplete, allowImagesReorder = true, onPreviewChange }) {
  const [dragOver, setDragOver] = useState(false)
  const [files, setFiles] = useState([])
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const inputRef = useRef(null)
  const [previewItems, setPreviewItems] = useState([])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  const acceptExts = useMemo(() => ['.pdf', '.cbr', '.cbz', '.zip', '.jpg', '.jpeg', '.png', '.webp'], [])
  const imageExts = useMemo(() => ['.jpg', '.jpeg', '.png', '.webp'], [])

  const isImageFile = useCallback((f) => {
    if (!f) return false
    const typeOk = !!f.type && f.type.startsWith('image/')
    if (typeOk) return true
    const name = f.name?.toLowerCase() || ''
    return imageExts.some(ext => name.endsWith(ext))
  }, [imageExts])

  const onFilesSelected = useCallback((list) => {
    const arr = Array.from(list)
    // Filter unsupported by extension
    const filtered = arr.filter(f => {
      const name = f.name?.toLowerCase() || ''
      return acceptExts.some(ext => name.endsWith(ext))
    })
    setFiles(filtered)
    setError(arr.length && !filtered.length ? 'Unsupported file types selected' : '')
  }, [acceptExts])

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer?.files?.length) onFilesSelected(e.dataTransfer.files)
  }

  const onPick = () => inputRef.current?.click()

  const onUpload = async () => {
    setError('')
    setProgress(0)
    try {
      const token = localStorage.getItem('authToken')
      const headers = { 'Authorization': token ? `Bearer ${token}` : undefined }
      let response
  if (files.length > 1 && allowImagesReorder && files.every(isImageFile)) {
        // Multi-image flow
        const form = new FormData()
        files.forEach(f => form.append('files', f))
        form.append('title', 'Images Upload')
  response = await axios.post(`${config.apiBaseUrl}${config.endpoints.uploadComic}`, form, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data', 'x-upload-multiple': 'true' },
          onUploadProgress: (evt) => {
            if (!evt.total) return
            setProgress(Math.round((evt.loaded * 100) / evt.total))
          }
        })
        const data = response.data?.data
        if (data?.uploadId && Array.isArray(data?.pageOrder)) {
          onComplete?.({ uploadId: data.uploadId, page_order: data.pageOrder })
        }
      } else if (files.length === 1) {
        const form = new FormData()
        form.append('comic', files[0])
        form.append('title', files[0].name)
  response = await axios.post(`${config.apiBaseUrl}${config.endpoints.uploadComic}`, form, {
          headers: { ...headers, 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (evt) => {
            if (!evt.total) return
            setProgress(Math.round((evt.loaded * 100) / evt.total))
          }
        })
        const comic = response.data?.data?.comic
        if (comic?.s3Key) onComplete?.({ file_id: comic.s3Key })
      } else {
        setError('Please select at least one file')
        return
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Upload failed')
    }
  }

  const handleDragEnd = (event) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setFiles((prev) => {
      const oldIndex = prev.findIndex((f, i) => `${f.name}-${i}` === active.id)
      const newIndex = prev.findIndex((f, i) => `${f.name}-${i}` === over.id)
      if (oldIndex === -1 || newIndex === -1) return prev
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  const items = files.map((f, i) => `${f.name}-${i}`)
  const isImages = files.length > 1 && files.every(isImageFile)

  // Generate/revoke local preview URLs and notify parent of order/preview
  useEffect(() => {
    // cleanup previous urls
    previewItems.forEach(p => { try { URL.revokeObjectURL(p.url) } catch {} })
    const next = files.map(f => ({
      name: f.name,
      isImage: isImageFile(f),
      url: URL.createObjectURL(f)
    }))
    setPreviewItems(next)
    if (typeof onPreviewChange === 'function') {
      onPreviewChange(next)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files, isImageFile])

  // Revoke on unmount
  useEffect(() => () => {
    previewItems.forEach(p => { try { URL.revokeObjectURL(p.url) } catch {} })
  }, [previewItems])

  return (
    <div>
      <div
        className={`${styles.dropzone} ${dragOver ? styles.drag : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
      >
        <div className={styles.hint}>Drag & drop files here or</div>
        <div className={styles.actions}>
          <button type="button" className={`${styles.btn} ${styles.primary}`} onClick={onPick}>Choose files</button>
          <input ref={inputRef} type="file" accept={acceptExts.join(',')} multiple onChange={(e) => onFilesSelected(e.target.files)} hidden />
          <button type="button" className={styles.btn} onClick={onUpload}>Upload</button>
        </div>
        <div className={styles.hint}>Allowed: {acceptExts.join(', ')}</div>
        {!!progress && <div style={{ marginTop: 8 }}><Progress value={progress} /></div>}
        {error && <div style={{ color: '#c0392b', marginTop: 8 }}>{error}</div>}
      </div>

      {files.length > 0 && (
        isImages && allowImagesReorder ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
              <div className={styles.list}>
                {files.map((f, i) => (
                  <SortableItem key={`${f.name}-${i}`} id={`${f.name}-${i}`} file={f} url={previewItems[i]?.url} isImage={previewItems[i]?.isImage} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className={styles.list}>
            {files.map((f, i) => (
              <div key={`${f.name}-${i}`} className={styles.item} aria-label={`File item ${f.name}`}>
                <div className={styles.thumb}>
                  {previewItems[i]?.isImage ? <img alt={f.name} src={previewItems[i]?.url} /> : <span aria-hidden>FILE</span>}
                </div>
                <div className={styles.name} title={f.name}>{f.name}</div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
