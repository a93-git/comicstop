import { useState, useEffect } from 'react'
import { Navbar } from '../Navbar/Navbar'
import { ComicThumbnail } from '../ComicThumbnail/ComicThumbnail'
import { config } from '../../config'
import { fetchSections, fetchSectionComics } from '../../services/api'
import styles from './Home.module.css'

export function Home() {
  const [sections, setSections] = useState([])
  const [sectionComics, setSectionComics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch available sections
        const sectionsData = await fetchSections()
        setSections(sectionsData)
        
        // Fetch comics for each section
        const comicsData = {}
        await Promise.all(
          sectionsData.map(async (section) => {
            const comics = await fetchSectionComics(section.id)
            comicsData[section.id] = comics
          })
        )
        
        setSectionComics(comicsData)
      } catch (err) {
        setError('Failed to load comic data')
        console.error('Error loading data:', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleComicClick = (comic) => {
    // Placeholder for navigation to comic reader
    alert(`Opening comic reader for: ${comic.title}`)
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <main className={styles.main}>
          <h1>Welcome to {config.appName}</h1>
          <p>Loading your comic collection...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar />
        <main className={styles.main}>
          <h1>Welcome to {config.appName}</h1>
          <p>Error: {error}</p>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      <main className={styles.main}>
        <h1>Welcome to {config.appName}</h1>
        <p>Start by uploading your PDF collection.</p>
        
        {sections.map(section => (
          <section key={section.id} className={styles.section}>
            <h2>{section.name}</h2>
            {section.description && (
              <p className={styles.sectionDescription}>{section.description}</p>
            )}
            <div className={styles.comicsGrid}>
              {(sectionComics[section.id] || []).map(comic => (
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
        ))}
      </main>
    </div>
  )
}