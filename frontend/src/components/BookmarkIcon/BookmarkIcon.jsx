import { useState, useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBookmark as faBookmarkSolid } from '@fortawesome/free-solid-svg-icons'
import { faBookmark as faBookmarkRegular } from '@fortawesome/free-regular-svg-icons'
import { useAuth } from '../../context/AuthContext'
import { toggleBookmark, isBookmarked } from '../../services/api'
import styles from './BookmarkIcon.module.css'

export function BookmarkIcon({ 
  itemId, 
  type = 'comic', 
  metadata = {}, 
  size = 'lg',
  className = '',
  showTooltip = true,
  onToggle = null 
}) {
  const { isAuthenticated } = useAuth()
  const [bookmarked, setBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isAuthenticated && itemId) {
      checkBookmarkStatus()
    }
  }, [isAuthenticated, itemId, type])

  const checkBookmarkStatus = async () => {
    try {
      const status = await isBookmarked(itemId, type)
      setBookmarked(status)
    } catch (error) {
      console.error('Failed to check bookmark status:', error)
    }
  }

  const handleToggle = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      // Could show a login prompt or redirect
      setError('Please log in to bookmark items')
      return
    }

    if (loading) return

    try {
      setLoading(true)
      setError(null)
      
      const result = await toggleBookmark(itemId, type, metadata)
      setBookmarked(result.bookmarked)
      
      // Call optional callback
      if (onToggle) {
        onToggle(result.bookmarked, result)
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
      setError('Failed to update bookmark')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null // Don't show bookmark icon for unauthenticated users
  }

  return (
    <button
      onClick={handleToggle}
      className={`${styles.bookmarkButton} ${className}`}
      disabled={loading}
      title={
        showTooltip
          ? bookmarked
            ? 'Remove from bookmarks'
            : 'Add to bookmarks'
          : undefined
      }
      aria-label={bookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      <FontAwesomeIcon
        icon={bookmarked ? faBookmarkSolid : faBookmarkRegular}
        size={size}
        className={`${styles.icon} ${bookmarked ? styles.bookmarked : styles.notBookmarked} ${
          loading ? styles.loading : ''
        }`}
      />
      {error && <span className={styles.error}>{error}</span>}
    </button>
  )
}