// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Home } from './components/Home/Home'
import { Login } from './components/Login/Login'
import { Signup } from './components/Signup/Signup'
import { Dashboard } from './components/Dashboard/Dashboard'
import { Upload } from './components/Upload/Upload'
import { ComicReader } from './components/ComicReader/ComicReader'
import { Settings } from './components/Settings/Settings'
import { Terms } from './components/Terms/Terms'
import { CreatorDashboard } from './components/CreatorDashboard/CreatorDashboard'
import { CreatorProfile } from './components/CreatorProfile/CreatorProfile'
import { SeriesEditor } from './components/SeriesEditor/SeriesEditor'
import { NotFound } from './components/NotFound/NotFound'
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute'
import { ForgotPassword } from './components/AuthExtras/ForgotPassword'
import { ResetPassword } from './components/AuthExtras/ResetPassword'
import { ComicPreview } from './components/ComicPreview/ComicPreview'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={
              <ProtectedRoute requireCreator>
                <Upload />
              </ProtectedRoute>
            } />
            <Route path="/comic/:id" element={<ComicReader />} />
            <Route path="/preview/:id" element={
              <ProtectedRoute requireCreator>
                <ComicPreview />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/terms" element={<Terms />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Creator Routes (guarded) */}
            <Route path="/creator/dashboard" element={
              <ProtectedRoute requireCreator>
                <CreatorDashboard />
              </ProtectedRoute>
            } />
            <Route path="/creator/profile" element={
              <ProtectedRoute requireCreator>
                <CreatorProfile />
              </ProtectedRoute>
            } />
            <Route path="/creator/series/new" element={
              <ProtectedRoute requireCreator>
                <SeriesEditor />
              </ProtectedRoute>
            } />
            <Route path="/creator/series/:id" element={
              <ProtectedRoute requireCreator>
                <SeriesEditor />
              </ProtectedRoute>
            } />
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

