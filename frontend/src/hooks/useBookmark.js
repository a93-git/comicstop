import { useState, useEffect } from 'react'
import { addBookmark, isBookmarked } from '../services/api'

/**
 * Hook for managing bookmark state for a specific item
 * @param {number|string} itemId - The ID of the item to bookmark
 * @param {string} type - The type of bookmark ('series', 'comic', 'page')
 * @param {Object} metadata - Additional metadata for the bookmark
 * @returns {Object} Bookmark state and handlers
 */
export function useBookmark(itemId, type, metadata = {}) {
  const [isBookmarkedState, setIsBookmarkedState] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Check if item is bookmarked on mount
  useEffect(() => {
    async function checkBookmarkStatus() {
      try {
        setLoading(true)
        const bookmarked = await isBookmarked(itemId, type)
        setIsBookmarkedState(bookmarked)
      } catch (err) {
        setError('Failed to check bookmark status')
        console.error('Check bookmark status failed:', err)
      } finally {
        setLoading(false)
      }
    }

    if (itemId && type) {
      checkBookmarkStatus()
    }
  }, [itemId, type])

  // Toggle bookmark status
  const toggleBookmark = async () => {
    try {
      setLoading(true)
      setError(null)

      if (isBookmarkedState) {
        // Remove bookmark - we'd need to get the bookmark ID first
        // For now, we'll just toggle the state optimistically
        setIsBookmarkedState(false)
        // TODO: Implement proper bookmark ID lookup and removal
      } else {
        // Add bookmark
        await addBookmark(itemId, type, metadata)
        setIsBookmarkedState(true)
      }
    } catch (err) {
      setError('Failed to toggle bookmark')
      console.error('Toggle bookmark failed:', err)
      // Revert optimistic update on error
      setIsBookmarkedState(prev => !prev)
    } finally {
      setLoading(false)
    }
  }

  return {
    isBookmarked: isBookmarkedState,
    loading,
    error,
    toggleBookmark
  }
}