import { useState, useCallback } from 'react'

/**
 * Hook for managing pinch-to-zoom functionality on touch devices
 * @param {number} minZoom - Minimum zoom level (default: 0.5)
 * @param {number} maxZoom - Maximum zoom level (default: 2.0)
 * @returns {Object} Zoom state and handlers
 */
export function useZoom(minZoom = 0.5, maxZoom = 2.0) {
  const [zoom, setZoom] = useState(1)
  const [isZooming, setIsZooming] = useState(false)

  // Clamp zoom value between min and max
  const clampZoom = useCallback((value) => {
    return Math.min(maxZoom, Math.max(minZoom, value))
  }, [minZoom, maxZoom])

  // Update zoom level
  const updateZoom = useCallback((newZoom) => {
    setZoom(clampZoom(newZoom))
  }, [clampZoom])

  // Reset zoom to 1
  const resetZoom = useCallback(() => {
    setZoom(1)
  }, [])

  // Zoom in by factor
  const zoomIn = useCallback((factor = 1.2) => {
    setZoom(prev => clampZoom(prev * factor))
  }, [clampZoom])

  // Zoom out by factor
  const zoomOut = useCallback((factor = 0.8) => {
    setZoom(prev => clampZoom(prev * factor))
  }, [clampZoom])

  // Handle touch events for pinch-to-zoom
  const handleTouchStart = useCallback((e) => {
    if (e.touches.length === 2) {
      setIsZooming(true)
      e.preventDefault()
    }
  }, [])

  const handleTouchMove = useCallback((e) => {
    if (e.touches.length === 2 && isZooming) {
      e.preventDefault()
      
      // Calculate distance between two touch points
      const touch1 = e.touches[0]
      const touch2 = e.touches[1]
      const distance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      )
      
      // Store initial distance for comparison
      if (!e.target.dataset.initialDistance) {
        e.target.dataset.initialDistance = distance
        e.target.dataset.initialZoom = zoom
      } else {
        const initialDistance = parseFloat(e.target.dataset.initialDistance)
        const initialZoom = parseFloat(e.target.dataset.initialZoom)
        const scale = distance / initialDistance
        const newZoom = initialZoom * scale
        updateZoom(newZoom)
      }
    }
  }, [isZooming, zoom, updateZoom])

  const handleTouchEnd = useCallback((e) => {
    if (e.touches.length < 2) {
      setIsZooming(false)
      // Clean up stored values
      if (e.target.dataset) {
        delete e.target.dataset.initialDistance
        delete e.target.dataset.initialZoom
      }
    }
  }, [])

  // Handle wheel events for desktop zoom
  const handleWheel = useCallback((e) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault()
      const delta = e.deltaY
      const factor = delta > 0 ? 0.9 : 1.1
      setZoom(prev => clampZoom(prev * factor))
    }
  }, [clampZoom])

  return {
    zoom,
    isZooming,
    minZoom,
    maxZoom,
    updateZoom,
    resetZoom,
    zoomIn,
    zoomOut,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
      onWheel: handleWheel,
    }
  }
}