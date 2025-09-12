import { createContext } from 'react'
import { useTheme } from '../hooks/useTheme'

export const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const themeState = useTheme()

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  )
}