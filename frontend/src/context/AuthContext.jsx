import { createContext, useContext, useState, useEffect } from 'react'
import { getCurrentUser, getUserProfile } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is already logged in on mount
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('authToken')
        
        if (token) {
          // Try to get fresh user profile
          const userProfile = await getUserProfile()
          if (userProfile) {
            setUser(userProfile)
            setIsAuthenticated(true)
          } else {
            // Token invalid, clear it
            localStorage.removeItem('authToken')
            localStorage.removeItem('currentUser')
          }
        } else {
          // Check for cached user data (for offline scenarios)
          const cachedUser = getCurrentUser()
          if (cachedUser) {
            setUser(cachedUser)
            setIsAuthenticated(true)
          }
        }
      } catch (error) {
        console.warn('Auth check failed:', error)
        // Fall back to cached user data if API fails
        const cachedUser = getCurrentUser()
        if (cachedUser) {
          setUser(cachedUser)
          setIsAuthenticated(true)
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  const login = (userData, token) => {
    setUser(userData)
    setIsAuthenticated(true)
    localStorage.setItem('authToken', token)
    localStorage.setItem('currentUser', JSON.stringify(userData))
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem('authToken')
    localStorage.removeItem('currentUser')
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
    localStorage.setItem('currentUser', JSON.stringify(updatedUser))
  }

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}