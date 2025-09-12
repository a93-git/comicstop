// API service for fetching comic sections and data
import { config } from '../config.js'
import { sampleComics } from '../data/sampleComics.js'

/**
 * Get auth token from localStorage
 */
function getAuthToken() {
  return localStorage.getItem('authToken')
}

/**
 * Set auth headers for requests
 */
function getAuthHeaders() {
  const token = getAuthToken()
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

/**
 * Generic API request function
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${config.apiBaseUrl}${endpoint}`
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...options.headers
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
}

/**
 * Fetch available comic sections from the backend
 * @returns {Promise<Array>} Array of section objects
 */
export async function fetchSections() {
  try {
    const response = await apiRequest(config.endpoints.comics)
    
    // Transform the comics response into sections format for compatibility
    if (response.success && response.data.comics) {
      // Create sections based on the comics data
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
    
    throw new Error('Invalid response format')
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
    // Build query parameters based on section
    let queryParams = new URLSearchParams()
    
    switch (sectionId) {
      case 'newest':
        queryParams.append('sort', 'createdAt')
        queryParams.append('order', 'DESC')
        queryParams.append('limit', '6')
        break
      case 'popular':
        queryParams.append('sort', 'viewCount')
        queryParams.append('order', 'DESC')
        queryParams.append('limit', '6')
        break
      case 'action':
        queryParams.append('genre', 'action')
        queryParams.append('limit', '6')
        break
      default: // featured
        queryParams.append('limit', '6')
        break
    }

    const endpoint = `${config.endpoints.comics}?${queryParams.toString()}`
    const response = await apiRequest(endpoint)
    
    if (response.success && response.data.comics) {
      // Transform backend comic format to frontend format
      return response.data.comics.map(comic => ({
        id: comic.id,
        title: comic.title,
        author: comic.author || 'Unknown Author',
        rating: comic.rating || 0,
        pageCount: comic.pageCount || 0,
        imageUrl: comic.thumbnailS3Url || '/placeholder-comic.jpg', // Fallback image
        description: comic.description
      }))
    }
    
    throw new Error('Invalid response format')
  } catch (error) {
    console.warn(`Failed to fetch comics for section ${sectionId} from API, using fallback data:`, error)
    
    // Return sample data with some variation based on section
    return getSampleComicsForSection(sectionId)
  }
}

/**
 * Authentication functions
 */
export async function signup(userData) {
  try {
    const response = await apiRequest(config.endpoints.signup, {
      method: 'POST',
      body: JSON.stringify(userData),
    })

    if (response.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      return response.data
    }
    
    throw new Error(response.message || 'Signup failed')
  } catch (error) {
    console.error('Signup failed:', error)
    throw error
  }
}

export async function login(credentials) {
  try {
    const response = await apiRequest(config.endpoints.login, {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.success && response.data.token) {
      localStorage.setItem('authToken', response.data.token)
      return response.data
    }
    
    throw new Error(response.message || 'Login failed')
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

export async function logout() {
  try {
    await apiRequest(config.endpoints.logout, {
      method: 'POST',
    })
  } catch (error) {
    console.warn('Logout API call failed:', error)
  } finally {
    // Always remove token from localStorage
    localStorage.removeItem('authToken')
  }
}

export async function getUserProfile() {
  try {
    const response = await apiRequest(config.endpoints.profile)
    
    if (response.success) {
      return response.data.user
    }
    
    throw new Error(response.message || 'Failed to get profile')
  } catch (error) {
    console.error('Get profile failed:', error)
    throw error
  }
}

/**
 * Comic management functions
 */
export async function uploadComic(formData) {
  try {
    const url = `${config.apiBaseUrl}${config.endpoints.uploadComic}`
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData, // Don't set Content-Type for multipart/form-data
      credentials: 'include', // Include cookies for authentication
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success) {
      return data.data.comic
    }
    
    throw new Error(data.message || 'Upload failed')
  } catch (error) {
    console.error('Comic upload failed:', error)
    throw error
  }
}

export async function getMyComics(queryParams = {}) {
  try {
    const params = new URLSearchParams(queryParams)
    const endpoint = `${config.endpoints.myComics}?${params.toString()}`
    const response = await apiRequest(endpoint)
    
    if (response.success) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get comics')
  } catch (error) {
    console.error('Get my comics failed:', error)
    throw error
  }
}

export async function getComicById(id) {
  try {
    const endpoint = config.endpoints.comicById.replace('{id}', id)
    const response = await apiRequest(endpoint)
    
    if (response.success) {
      return response.data.comic
    }
    
    throw new Error(response.message || 'Failed to get comic')
  } catch (error) {
    console.error('Get comic failed:', error)
    throw error
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