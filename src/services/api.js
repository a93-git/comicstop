// API service for fetching comic sections and data
import { config } from '../config.js'
import { sampleComics } from '../data/sampleComics.js'

/**
 * Fetch available comic sections from the backend
 * @returns {Promise<Array>} Array of section objects
 */
export async function fetchSections() {
  try {
    const response = await fetch(`${config.apiBaseUrl}${config.endpoints.sections}`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const sections = await response.json()
    return sections
  } catch (error) {
    console.warn('Failed to fetch sections from API, using fallback data:', error)
    
    // Fallback data when API is not available
    return [
      {
        id: 'featured',
        name: 'Featured Comics',
        description: 'Hand-picked comics for you'
      },
      {
        id: 'newest',
        name: 'Newest Releases',
        description: 'Latest comic releases'
      },
      {
        id: 'popular',
        name: 'Most Popular',
        description: 'Trending comics this week'
      },
      {
        id: 'action',
        name: 'Action & Adventure',
        description: 'High-octane action comics'
      }
    ]
  }
}

/**
 * Fetch comics for a specific section
 * @param {string} sectionId - The section ID
 * @returns {Promise<Array>} Array of comic objects
 */
export async function fetchSectionComics(sectionId) {
  try {
    const url = `${config.apiBaseUrl}${config.endpoints.sectionComics.replace('{sectionId}', sectionId)}`
    const response = await fetch(url)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const comics = await response.json()
    return comics
  } catch (error) {
    console.warn(`Failed to fetch comics for section ${sectionId} from API, using fallback data:`, error)
    
    // Return sample data with some variation based on section
    return getSampleComicsForSection(sectionId)
  }
}

/**
 * Get sample comics for a section (fallback when API is unavailable)
 * @param {string} sectionId - The section ID
 * @returns {Array} Array of comic objects
 */
function getSampleComicsForSection(sectionId) {
  // For demo purposes, return a subset of sample comics with slight variations
  switch (sectionId) {
    case 'featured':
      return sampleComics
    case 'newest':
      return sampleComics.slice(0, 2).map(comic => ({
        ...comic,
        id: comic.id + 100,
        title: `${comic.title} (New)`
      }))
    case 'popular':
      return sampleComics.slice(1, 3).map(comic => ({
        ...comic,
        id: comic.id + 200,
        title: `${comic.title} (Popular)`
      }))
    case 'action':
      return sampleComics.filter(comic => 
        comic.title.includes('Spider-Man') || comic.title.includes('Batman') || comic.title.includes('X-Men')
      ).map(comic => ({
        ...comic,
        id: comic.id + 300,
        title: `${comic.title} (Action)`
      }))
    default:
      return sampleComics.slice(0, 2)
  }
}