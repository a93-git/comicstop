import { useState } from 'react'
import styles from './ComicThumbnail.module.css'

export function ComicThumbnail({ 
  imageUrl, 
  title, 
  author, 
  rating, 
  pageCount, 
  onClick 
}) {
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
  }

  return (
    <div 
      className={styles.thumbnail}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        <img 
          src={imageUrl} 
          alt={`${title} cover`}
          className={styles.image}
        />
        
        {isHovered && (
          <div className={styles.overlay}>
            <div className={styles.metadata}>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.author}>by {author}</p>
              <div className={styles.stats}>
                <div className={styles.rating}>
                  <span className={styles.stars}>
                    {'★'.repeat(Math.floor(rating))}{'☆'.repeat(5 - Math.floor(rating))}
                  </span>
                  <span className={styles.ratingText}>{rating}/5</span>
                </div>
                <p className={styles.pageCount}>{pageCount} pages</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}