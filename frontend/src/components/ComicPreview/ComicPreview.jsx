import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { getDraftPreview } from '../../services/api'
import styles from './ComicPreview.module.css'

export function ComicPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    document.title = 'ComicStop – Preview'
    ;(async () => {
      try {
        const res = await getDraftPreview(id)
        if (!mounted) return
        setData(res)
      } catch (e) {
        setError(e.message || 'Failed to load preview')
      } finally {
        setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [id])

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => navigate('/upload')}>← Back to Edit</button>
          <h1>Comic Preview</h1>
        </div>
        {loading && <div className={styles.loading}>Loading preview…</div>}
        {error && <div className={styles.error}>{error}</div>}
        {data && (
          <div className={styles.previewCard}>
            <div className={styles.topRow}>
              <div className={styles.thumbBox}>
                {data.thumbnailUrl ? (
                  <img src={data.thumbnailUrl} alt="Cover thumbnail" />
                ) : (
                  <div className={styles.thumbPlaceholder}>No Thumbnail</div>
                )}
              </div>
              <div className={styles.meta}>
                <h2 className={styles.title}>{data.title || 'Untitled'}</h2>
                {data.subtitle && <div className={styles.subtitle}>{data.subtitle}</div>}
                <div className={styles.detailsRow}>
                  <span className={styles.detail}><strong>Status:</strong> Draft</span>
                  <span className={styles.detail}><strong>Pages:</strong> {data.pageOrder?.length || 0}</span>
                </div>
                <div className={styles.description}>{data.description || '—'}</div>
              </div>
            </div>

            {Array.isArray(data.pageOrder) && data.pageOrder.length > 0 && (
              <div className={styles.pagesGrid} aria-label="Preview Pages">
                {data.pageOrder.map((src, i) => (
                  <div className={styles.pageItem} key={`${src}-${i}`}>
                    <img src={typeof src === 'string' ? src : ''} alt={`Page ${i + 1}`} />
                    <div className={styles.badge}>#{i + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
