import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner'

export function ProtectedRoute({ children, requireCreator = false }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireCreator && !user?.isCreator) {
    // Redirect to signup to enable creator mode
    return <Navigate to="/signup" state={{ needsCreator: true }} replace />
  }

  return children
}