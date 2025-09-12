// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { Home } from './components/Home/Home'
import { Login } from './components/Login/Login'
import { Signup } from './components/Signup/Signup'
import { Dashboard } from './components/Dashboard/Dashboard'

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

