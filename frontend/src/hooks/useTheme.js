import { useState, useEffect } from 'react'

const THEME_STORAGE_KEY = 'comicstop-theme'
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark'
}

export function useTheme() {
  // Get initial theme from localStorage or system preference
  const getInitialTheme = () => {
    try {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
        return savedTheme
      }
    } catch (error) {
      console.warn('Failed to access localStorage:', error)
    }
    
    // Fall back to system preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches 
        ? THEMES.DARK 
        : THEMES.LIGHT
    }
    
    return THEMES.LIGHT
  }

  const [theme, setTheme] = useState(getInitialTheme)

  // Apply theme to document root
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch (error) {
      console.warn('Failed to save theme to localStorage:', error)
    }
  }, [theme])

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Only update if no theme is explicitly saved
      try {
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
        if (!savedTheme) {
          setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT)
        }
      } catch {
        // If localStorage fails, update based on system preference
        setTheme(e.matches ? THEMES.DARK : THEMES.LIGHT)
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === THEMES.LIGHT ? THEMES.DARK : THEMES.LIGHT)
  }

  const setLightTheme = () => setTheme(THEMES.LIGHT)
  const setDarkTheme = () => setTheme(THEMES.DARK)

  return {
    theme,
    isLight: theme === THEMES.LIGHT,
    isDark: theme === THEMES.DARK,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    THEMES
  }
}