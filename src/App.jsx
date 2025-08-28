// src/App.jsx
import {Navbar} from './components/Navbar/Navbar'
import { ComicThumbnail } from './components/ComicThumbnail/ComicThumbnail'
import { config } from './config'
import { sampleComics } from './data/sampleComics'

export default function App() {
  const handleComicClick = (comic) => {
    // Placeholder for navigation to comic reader
    alert(`Opening comic reader for: ${comic.title}`)
  }

  return (
    <div>
      <Navbar />
      <main style={{ padding: '2rem' }}>
        <h1>Welcome to {config.appName}</h1>
        <p>Start by uploading your PDF collection.</p>
        
        <section style={{ marginTop: '3rem' }}>
          <h2>Featured Comics</h2>
          <div style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            flexWrap: 'wrap',
            marginTop: '1.5rem'
          }}>
            {sampleComics.map(comic => (
              <ComicThumbnail
                key={comic.id}
                imageUrl={comic.imageUrl}
                title={comic.title}
                author={comic.author}
                rating={comic.rating}
                pageCount={comic.pageCount}
                onClick={() => handleComicClick(comic)}
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

