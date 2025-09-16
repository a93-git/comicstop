import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { subscribeLoading } from './services/api'
import { LoadingSpinner } from './components/LoadingSpinner/LoadingSpinner'

function Root() {
  const [loading, setLoading] = useState(false)
  useEffect(() => subscribeLoading(setLoading), [])
  return (
    <StrictMode>
      <App />
      <LoadingSpinner show={loading} />
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<Root />)
