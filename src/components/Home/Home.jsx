import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { ComicThumbnail } from '../ComicThumbnail/ComicThumbnail'
import { fetchSections, fetchSectionComics } from '../../services/api'
import { detailedSampleComics } from '../../data/sampleComics'
import styles from './Home.module.css'

export function Home() {
  const navigate = useNavigate()
  const [sections, setSections] = useState([])
  const [sectionComics, setSectionComics] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredSections, setFilteredSections] = useState([])

  // Set page title
  useEffect(() => {
    document.title = 'ComicStop'
  }, [])

  // Filter sections based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredSections(sections)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = sections.map(section => {
      const filteredComics = (sectionComics[section.id] || []).filter(comic =>
        comic.title.toLowerCase().includes(query) ||
        comic.author.toLowerCase().includes(query) ||
        (comic.genre && comic.genre.toLowerCase().includes(query))
      )
      
      return filteredComics.length > 0 ? { ...section, filteredComics } : null
    }).filter(Boolean)

    setFilteredSections(filtered)
  }, [searchQuery, sections, sectionComics])

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
        setFilteredSections(sectionsData)
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
    // Check if this is one of our detailed sample comics
    const detailedComic = detailedSampleComics.find(dc => 
      dc.title.toLowerCase().includes(comic.title.toLowerCase().replace(/ \((New|Popular|Action)\)/, ''))
    )
    
    if (detailedComic) {
      navigate(`/comic/${detailedComic.id}`)
    } else {
      // For basic sample comics, navigate to the first detailed comic as fallback
      navigate(`/comic/${detailedSampleComics[0].id}`)
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.intro}>
            <p className={styles.introText}>
              Your personal digital comic collection awaits. Discover, organize, and enjoy your favorite stories all in one place.
            </p>
          </div>
          <p>Loading your comic collection...</p>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navbar />
        <main className={styles.main}>
          <div className={styles.intro}>
            <p className={styles.introText}>
              Your personal digital comic collection awaits. Discover, organize, and enjoy your favorite stories all in one place.
            </p>
          </div>
          <p>Error: {error}</p>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navbar />
      <main className={styles.main}>
        <div className={styles.intro}>
          <p className={styles.introText}>
            Your personal digital comic collection awaits. Discover, organize, and enjoy your favorite stories all in one place.
          </p>
          
          {/* Search Bar */}
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search by title, author, or genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className={styles.clearButton}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>
        
        {filteredSections.map(section => (
          <section key={section.id} className={styles.section}>
            <h2>{section.name}</h2>
            {section.description && (
              <p className={styles.sectionDescription}>{section.description}</p>
            )}
            <div className={styles.comicsGrid}>
              {(section.filteredComics || sectionComics[section.id] || []).map(comic => (
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