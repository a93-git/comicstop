// src/App.jsx
import {Navbar} from './components/Navbar/Navbar'
import { config } from './config'

export default function App() {
  return (
    <div>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>Welcome to {config.appName}</h1>
        <p>Start by uploading your PDF collection.</p>
      </main>
    </div>
  )
}

