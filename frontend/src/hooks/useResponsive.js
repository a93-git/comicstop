import { useState, useEffect } from 'react'

/**
 * Hook to detect responsive breakpoints
 * @returns {Object} Responsive state with isDesktop, isMobile, isTablet flags
 */
export function useResponsive() {
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      })
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Breakpoints based on common responsive design patterns
  const isDesktop = dimensions.width >= 1024
  const isTablet = dimensions.width >= 768 && dimensions.width < 1024
  const isMobile = dimensions.width < 768

  return {
    width: dimensions.width,
    height: dimensions.height,
    isDesktop,
    isTablet,
    isMobile,
    // Helper functions
    isTouchDevice: () => {
      if (typeof window === 'undefined') return false
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0
    }
  }
}