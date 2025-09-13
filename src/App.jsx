// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { Home } from './components/Home/Home'
import { Login } from './components/Login/Login'
import { Signup } from './components/Signup/Signup'
import { Dashboard } from './components/Dashboard/Dashboard'
import { Upload } from './components/Upload/Upload'
import { ComicReader } from './components/ComicReader/ComicReader'
import { Profile } from './components/Profile/Profile'
import { Terms } from './components/Terms/Terms'
import { CreatorDashboard } from './components/CreatorDashboard/CreatorDashboard'
import { CreatorProfile } from './components/CreatorProfile/CreatorProfile'

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/comic/:id" element={<ComicReader />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/terms" element={<Terms />} />
          
          {/* Creator Routes */}
          <Route path="/creator/dashboard" element={<CreatorDashboard />} />
          <Route path="/creator/profile" element={<CreatorProfile />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

