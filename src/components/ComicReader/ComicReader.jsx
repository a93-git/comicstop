import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { CommentsSection } from '../CommentsSection/CommentsSection'
import { detailedSampleComics } from '../../data/sampleComics'
import { useResponsive } from '../../hooks/useResponsive'
import { useZoom } from '../../hooks/useZoom'
import { useBookmark } from '../../hooks/useBookmark'
import styles from './ComicReader.module.css'

export function ComicReader() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comic, setComic] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [isDialoguesVisible, setIsDialoguesVisible] = useState(false)
  
  // Custom hooks for enhanced functionality
  const { isDesktop, isMobile, isTouchDevice } = useResponsive()
  const { zoom, resetZoom, handlers: zoomHandlers } = useZoom()
  const { isBookmarked, toggleBookmark, loading: bookmarkLoading } = useBookmark(
    comic?.id, 
    'comic', 
    { title: comic?.title, author: comic?.author }
  )

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

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }, [currentPage])

  const handleNextPage = useCallback(() => {
    if (currentPage < comic.pages.length) {
      setCurrentPage(currentPage + 1)
    }
  }, [currentPage, comic?.pages?.length])

  const handlePageClick = useCallback((pageNumber) => {
    setCurrentPage(pageNumber)
  }, [])

  // Desktop click navigation
  const handleDesktopClick = useCallback((e) => {
    if (!isDesktop) return
    
    const clickX = e.nativeEvent.offsetX
    const width = e.currentTarget.offsetWidth
    
    if (clickX > width / 2 && currentPage < comic.pages.length) {
      handleNextPage()
    } else if (clickX <= width / 2 && currentPage > 1) {
      handlePreviousPage()
    }
  }, [isDesktop, currentPage, comic?.pages?.length, handleNextPage, handlePreviousPage])

  // Mobile tap-to-scroll
  const handleMobileTap = useCallback((e) => {
    if (!isMobile) return
    
    const clickY = e.nativeEvent.clientY
    const height = window.innerHeight
    
    if (clickY > height / 2) {
      window.scrollBy({ top: height / 2, behavior: 'smooth' })
    } else {
      window.scrollBy({ top: -height / 2, behavior: 'smooth' })
    }
  }, [isMobile])

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
          <div className={styles.headerTop}>
            <button 
              onClick={() => navigate('/')} 
              className={styles.backButton}
              aria-label="Back to home"
            >
              ← Back to Comics
            </button>
            
            <button
              onClick={toggleBookmark}
              disabled={bookmarkLoading}
              className={`${styles.bookmarkButton} ${isBookmarked ? styles.bookmarked : ''}`}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              {isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
            </button>
          </div>
          
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
              ← Prev
            </button>
            
            <span className={styles.pageInfo}>
              {currentPage} / {comic.pages.length}
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
            <div 
              className={styles.illustration}
              onClick={isDesktop ? handleDesktopClick : isMobile ? handleMobileTap : undefined}
              {...(isTouchDevice() ? zoomHandlers : {})}
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'center',
                cursor: isDesktop ? 'pointer' : isMobile ? 'pointer' : 'default'
              }}
            >
              <div className={styles.illustrationPlaceholder}>
                📖 Page {currentPage}
                <div className={styles.illustrationDescription}>
                  {currentPageData.illustration}
                </div>
              </div>
            </div>
            
            {/* Dialogues Control */}
            <div className={styles.dialoguesControl}>
              <button
                onClick={() => setIsDialoguesVisible(!isDialoguesVisible)}
                className={styles.dialoguesToggle}
                aria-label={isDialoguesVisible ? 'Hide dialogues' : 'Show dialogues'}
              >
                {isDialoguesVisible ? 'Hide Dialogues' : 'Show Dialogues'}
              </button>
              
              {/* Zoom Controls for touch devices */}
              {isTouchDevice() && (
                <div className={styles.zoomControls}>
                  <span className={styles.zoomLevel}>{Math.round(zoom * 100)}%</span>
                  <button 
                    onClick={resetZoom}
                    className={styles.resetZoomButton}
                    aria-label="Reset zoom"
                  >
                    Reset Zoom
                  </button>
                </div>
              )}
            </div>
            
            {/* Collapsible Dialogues */}
            {isDialoguesVisible && (
              <div className={styles.dialogues}>
                {currentPageData.dialogues.map((dialogue, index) => (
                  <div key={index} className={styles.dialogue}>
                    <span className={styles.character}>{dialogue.character}:</span>
                    <span className={styles.text}>"{dialogue.text}"</span>
                  </div>
                ))}
              </div>
            )}
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