import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { CommentsSection } from '../CommentsSection/CommentsSection'
import { detailedSampleComics } from '../../data/sampleComics'
import styles from './ComicReader.module.css'

export function ComicReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comic, setComic] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Find the comic by ID
    const foundComic = detailedSampleComics.find(c => c.id === parseInt(id))
    
    if (foundComic) {
      setComic(foundComic)
    } else {
      // Redirect to home if comic not found
      navigate('/')
      return
    }
    
    setLoading(false)
  }, [id, navigate])

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < comic.pages.length) {
      setCurrentPage(currentPage + 1)
    }
  }

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className={styles.loading}>Loading comic...</div>
      </div>
    )
  }

  if (!comic) {
    return (
      <div>
        <Navbar />
        <div className={styles.error}>Comic not found</div>
      </div>
    )
  }

  const currentPageData = comic.pages[currentPage - 1]

  return (
    <div className={styles.container}>
      <Navbar />
      
      <div className={styles.content}>
        {/* Comic Header */}
        <div className={styles.header}>
          <button 
            onClick={() => navigate('/')} 
            className={styles.backButton}
            aria-label="Back to home"
          >
            ← Back to Comics
          </button>
          
          <div className={styles.comicInfo}>
            <h1 className={styles.title}>{comic.title}</h1>
            <div className={styles.meta}>
              <span className={styles.author}>by {comic.author}</span>
              <span className={styles.theme}>{comic.theme}</span>
              <span className={styles.rating}>★ {comic.rating}</span>
            </div>
            <p className={styles.plotSummary}>{comic.plotSummary}</p>
          </div>
        </div>

        {/* Comic Reader */}
        <div className={styles.reader}>
          {/* Page Navigation */}
          <div className={styles.pageNavigation}>
            <button 
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
              className={styles.navButton}
              aria-label="Previous page"
            >
              ← Previous
            </button>
            
            <span className={styles.pageInfo}>
              Page {currentPage} of {comic.pages.length}
            </span>
            
            <button 
              onClick={handleNextPage}
              disabled={currentPage === comic.pages.length}
              className={styles.navButton}
              aria-label="Next page"
            >
              Next →
            </button>
          </div>

          {/* Current Page */}
          <div className={styles.page}>
            <div className={styles.illustration}>
              <div className={styles.illustrationPlaceholder}>
                📖 Page {currentPage}
                <div className={styles.illustrationDescription}>
                  {currentPageData.illustration}
                </div>
              </div>
            </div>
            
            <div className={styles.dialogues}>
              {currentPageData.dialogues.map((dialogue, index) => (
                <div key={index} className={styles.dialogue}>
                  <span className={styles.character}>{dialogue.character}:</span>
                  <span className={styles.text}>"{dialogue.text}"</span>
                </div>
              ))}
            </div>
          </div>

          {/* Page Thumbnails */}
          <div className={styles.thumbnails}>
            {comic.pages.map((_, index) => (
              <button
                key={index}
                onClick={() => handlePageClick(index + 1)}
                className={`${styles.thumbnail} ${
                  currentPage === index + 1 ? styles.thumbnailActive : ''
                }`}
                aria-label={`Go to page ${index + 1}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Comic Details */}
        <div className={styles.details}>
          <h3>Comic Details</h3>
          <div className={styles.detailsGrid}>
            <div className={styles.detailItem}>
              <strong>Setting:</strong> {comic.setting}
            </div>
            <div className={styles.detailItem}>
              <strong>Genre:</strong> {comic.genre}
            </div>
            <div className={styles.detailItem}>
              <strong>Characters:</strong>
              <ul className={styles.characterList}>
                {comic.characters.map((character, index) => (
                  <li key={index}>{character}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className={styles.commentsContainer}>
          <h3>Reader Comments</h3>
          <CommentsSection 
            chapterId={comic.chapterId}
            userToken={localStorage.getItem('authToken')}
          />
        </div>
      </div>
    </div>
  )
}