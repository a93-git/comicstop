// API service for fetching comic sections and data
import { config } from '../config.js'

// Simple loading state pub/sub for global spinner
let loadingCount = 0
const loadingSubscribers = new Set()

function notifyLoading() {
  const isLoading = loadingCount > 0
  loadingSubscribers.forEach(cb => {
    try { cb(isLoading) } catch {}
  })
}

export function subscribeLoading(cb) {
  loadingSubscribers.add(cb)
  // Initial push
  try { cb(loadingCount > 0) } catch {}
  return () => loadingSubscribers.delete(cb)
}
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
    loadingCount++
    notifyLoading()
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for authentication
    })

    const text = await response.text()
    let data
    try {
      data = text ? JSON.parse(text) : null
    } catch {
      data = null
    }

    if (!response.ok) {
      const message = data?.message || `HTTP error! status: ${response.status}`
      const err = new Error(message)
      err.status = response.status
      err.errors = data?.errors
      throw err
    }

    return data
  } catch (error) {
    console.error('API request failed:', error)
    throw error
  }
  finally {
    loadingCount = Math.max(0, loadingCount - 1)
    notifyLoading()
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
 * signup accepts either legacy { emailOrPhone, ... } or new payloads:
 * - { email, username, password, termsAccepted }
 * - { isd_code, phone_number, username, password, termsAccepted }
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
      // Store a minimal user snapshot if provided
      if (response.data.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.user))
      }
      return response.data
    }
    
    throw new Error(response.message || 'Login failed')
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

/**
 * Password reset flow
 */
export async function requestPasswordReset(email) {
  const res = await apiRequest('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
  return res
}

export async function resetPasswordWithToken(token, password) {
  const res = await apiRequest('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  })
  return res
}

// Phone-based flows
export async function requestPasswordResetByPhone(phone) {
  const res = await apiRequest('/auth/forgot-password/phone', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  })
  return res
}

export async function resetPasswordWithPin(phone, pin, password) {
  const res = await apiRequest('/auth/reset-password/phone', {
    method: 'POST',
    body: JSON.stringify({ phone, pin, password }),
  })
  return res
}

// Uniqueness checks
export async function checkEmailAvailability(email) {
  const params = new URLSearchParams({ email })
  const res = await apiRequest(`/users/check-email?${params.toString()}`)
  // Returns: { success, data: { unique: boolean } }
  return Boolean(res?.data?.unique)
}

export async function checkUsernameAvailability(username) {
  const params = new URLSearchParams({ username })
  const res = await apiRequest(`/users/check-username?${params.toString()}`)
  return Boolean(res?.data?.unique)
}

export async function checkPhoneAvailability({ isd_code, phone }) {
  const params = new URLSearchParams({ isd_code, phone })
  const res = await apiRequest(`/users/check-phone?${params.toString()}`)
  return Boolean(res?.data?.unique)
}

export async function logout() {
  try {
    await apiRequest(config.endpoints.logout, { method: 'POST' })
  } catch {}
  localStorage.removeItem('authToken')
  localStorage.removeItem('currentUser')
}

export async function getUserProfile() {
  try {
    const res = await apiRequest(config.endpoints.profile)
    if (res.success && res.data?.user) {
      localStorage.setItem('currentUser', JSON.stringify(res.data.user))
      return res.data.user
    }
  } catch {}
  return getCurrentUser() || { username: 'Guest', email: 'guest@example.com', joinDate: new Date().toISOString() }
}

// Profile updates
export async function updateUsername(username) {
  const res = await apiRequest('/auth/profile/username', { method: 'PATCH', body: JSON.stringify({ username }) })
  if (res.success && res.data?.user) {
    localStorage.setItem('currentUser', JSON.stringify(res.data.user))
  }
  return res
}

export async function updateEmail(email) {
  const res = await apiRequest('/auth/profile/email', { method: 'PATCH', body: JSON.stringify({ email }) })
  if (res.success && res.data?.user) {
    localStorage.setItem('currentUser', JSON.stringify(res.data.user))
  }
  return res
}

export async function updatePhone(phone) {
  const res = await apiRequest('/auth/profile/phone', { method: 'PATCH', body: JSON.stringify({ phone }) })
  if (res.success && res.data?.user) {
    localStorage.setItem('currentUser', JSON.stringify(res.data.user))
  }
  return res
}

export async function updatePassword(password) {
  const res = await apiRequest('/auth/profile/password', { method: 'PATCH', body: JSON.stringify({ password }) })
  return res
}

// Update profile picture
export async function updateProfilePicture(file) {
  const url = `${config.apiBaseUrl}/api/auth/profile/picture`
  const formData = new FormData()
  formData.append('profilePicture', file)
  const response = await fetch(url, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: formData,
    credentials: 'include',
  })
  if (!response.ok) {
    const text = await response.text()
    let data
    try { data = text ? JSON.parse(text) : null } catch { data = null }
    const message = data?.message || `HTTP error! status: ${response.status}`
    const err = new Error(message)
    err.status = response.status
    throw err
  }
  const data = await response.json()
  if (data.success && data.data?.user) {
    try { localStorage.setItem('currentUser', JSON.stringify(data.data.user)) } catch {}
  }
  return data
}

export async function getUserSettings() {
  const user = getCurrentUser()
  const userId = user?.id || 'guest'

  // Helper to read locally stored settings per user
  const localKey = `user:${userId}:settings`
  const getLocal = () => {
    try {
      const raw = localStorage.getItem(localKey)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  }

  // Base defaults using current user info when available
  const baseDefaults = {
    username: user?.username || 'Guest',
    email: user?.email || 'guest@example.com',
    joinDate: user?.joinDate || user?.createdAt || new Date().toISOString(),
    isCreator: Boolean(user?.isCreator),
    emailVerified: Boolean(user?.emailVerified),
    theme: 'auto',
    readingPreferences: {
      showDialogues: true,
      enableClickNavigation: true,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
    },
  }

  // Fetch server settings if available
  let serverSettings = null
  try {
    const res = await apiRequest(config.endpoints.settings)
    if (res.success && res.data?.settings) {
      serverSettings = res.data.settings
    }
  } catch {}

  // Merge: defaults <- server <- local overrides
  const localOverrides = getLocal() || {}

  const merged = {
    ...baseDefaults,
    ...(serverSettings || {}),
    // Deep merge for nested structures
    readingPreferences: {
      ...baseDefaults.readingPreferences,
      ...(serverSettings?.readingPreferences || {}),
      ...(localOverrides.readingPreferences || {}),
    },
    notifications: {
      ...baseDefaults.notifications,
      ...(serverSettings?.notifications || {}),
      ...(localOverrides.notifications || {}),
    },
    theme: localOverrides.theme ?? serverSettings?.theme ?? baseDefaults.theme,
  }

  return merged
}

export function saveUserSettings(partial) {
  const user = getCurrentUser()
  const userId = user?.id || 'guest'
  const key = `user:${userId}:settings`
  let existing = {}
  try {
    const raw = localStorage.getItem(key)
    existing = raw ? JSON.parse(raw) : {}
  } catch {}

  // Merge shallow, but handle nested known groups
  const next = {
    ...existing,
    ...partial,
    readingPreferences: {
      ...(existing.readingPreferences || {}),
      ...(partial.readingPreferences || {}),
    },
    notifications: {
      ...(existing.notifications || {}),
      ...(partial.notifications || {}),
    },
  }

  try {
    localStorage.setItem(key, JSON.stringify(next))
  } catch {}
  return next
}

export async function verifyEmail() {
  const res = await apiRequest('/auth/verify-email', { method: 'POST' })
  if (res.success && res.data?.user) {
    localStorage.setItem('currentUser', JSON.stringify(res.data.user))
  }
  return res
}

export async function setCreatorMode(enable = true) {
  const res = await apiRequest('/auth/creator-mode', { method: 'POST', body: JSON.stringify({ enable }) })
  if (res.success && res.data?.user) {
    localStorage.setItem('currentUser', JSON.stringify(res.data.user))
  }
  return res
}

export async function deleteMyAccount() {
  const res = await apiRequest('/auth/me', { method: 'DELETE' })
  if (res.success) {
    await logout()
  }
  return res
}

/**
 * Get current user from localStorage
 */
export function getCurrentUser() {
  try {
    const str = localStorage.getItem('currentUser')
    return str ? JSON.parse(str) : null
  } catch {
    return null
  }
}

/**
 * Check if current user is a creator
 */
export function isCreatorUser() {
  const user = getCurrentUser()
  return Boolean(user?.isCreator)
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

/**
 * Bookmark management functions
 */
export async function getBookmarks(queryParams = {}) {
  try {
    const params = new URLSearchParams(queryParams)
    const response = await apiRequest(`${config.endpoints.bookmarks}?${params.toString()}`)
    
    if (response.success) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to get bookmarks')
  } catch (error) {
    console.warn('Failed to fetch bookmarks from API, using fallback data:', error)
    
    // Return sample bookmarks for development
    return {
      bookmarks: [
        {
          id: 1,
          itemId: 1,
          type: 'comic',
          metadata: { title: 'Mystic Guardians: The Awakening' },
          createdAt: new Date().toISOString()
        }
      ],
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: 1,
        itemsPerPage: 20
      }
    }
  }
}

export async function addBookmark(itemId, type = 'comic', metadata = {}) {
  try {
    const response = await apiRequest(config.endpoints.addBookmark, {
      method: 'POST',
      body: JSON.stringify({
        itemId,
        type,
        metadata
      }),
    })

    if (response.success) {
      return response.data.bookmark
    }
    
    throw new Error(response.message || 'Failed to add bookmark')
  } catch (error) {
    console.error('Add bookmark failed:', error)
    throw error
  }
}

export async function removeBookmark(bookmarkId) {
  try {
    const endpoint = config.endpoints.removeBookmark.replace('{id}', bookmarkId)
    const response = await apiRequest(endpoint, {
      method: 'DELETE',
    })

    if (response.success) {
      return true
    }
    
    throw new Error(response.message || 'Failed to remove bookmark')
  } catch (error) {
    console.error('Remove bookmark failed:', error)
    throw error
  }
}

export async function toggleBookmark(itemId, type = 'comic', metadata = {}) {
  try {
    const response = await apiRequest(config.endpoints.toggleBookmark, {
      method: 'POST',
      body: JSON.stringify({
        itemId,
        type,
        metadata
      }),
    })

    if (response.success) {
      return response.data
    }
    
    throw new Error(response.message || 'Failed to toggle bookmark')
  } catch (error) {
    console.error('Toggle bookmark failed:', error)
    throw error
  }
}

export async function isBookmarked(itemId, type = 'comic') {
  try {
    const params = new URLSearchParams({ itemId, type })
    const response = await apiRequest(`${config.endpoints.checkBookmark}?${params.toString()}`)
    
    if (response.success) {
      return response.data.bookmarked
    }
    
    return false
  } catch (error) {
    console.error('Check bookmark status failed:', error)
    return false
  }
}

/**
 * Series management functions
 */
export async function createSeries(formData) {
  try {
    const url = `${config.apiBaseUrl}/api/series`
    const response = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData, // FormData for file upload
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success) {
      return data.data.series
    }
    
    throw new Error(data.message || 'Series creation failed')
  } catch (error) {
    console.error('Series creation failed:', error)
    throw error
  }
}

export async function getSeries(queryParams = {}) {
  try {
    const searchParams = new URLSearchParams(queryParams)
    const data = await apiRequest(`/api/series?${searchParams}`)
    
    if (data.success) {
      return data.data
    }
    
    throw new Error(data.message || 'Failed to fetch series')
  } catch (error) {
    console.error('Get series failed:', error)
    throw error
  }
}

export async function getSeriesById(id) {
  try {
    const data = await apiRequest(`/api/series/${id}`)
    
    if (data.success) {
      return data.data.series
    }
    
    throw new Error(data.message || 'Series not found')
  } catch (error) {
    console.error('Get series by ID failed:', error)
    throw error
  }
}

export async function updateSeries(id, formData) {
  try {
    const url = `${config.apiBaseUrl}/api/series/${id}`
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success) {
      return data.data.series
    }
    
    throw new Error(data.message || 'Series update failed')
  } catch (error) {
    console.error('Series update failed:', error)
    throw error
  }
}

export async function deleteSeries(id) {
  try {
    const data = await apiRequest(`/api/series/${id}`, { method: 'DELETE' })
    
    if (data.success) {
      return data
    }
    
    throw new Error(data.message || 'Series deletion failed')
  } catch (error) {
    console.error('Series deletion failed:', error)
    throw error
  }
}

export async function getMySeries() {
  try {
    const data = await apiRequest('/api/series/my/series')
    
    if (data.success) {
      return data.data
    }
    
    throw new Error(data.message || 'Failed to fetch creator series')
  } catch (error) {
    console.error('Get my series failed:', error)
    throw error
  }
}

/**
 * Creator Profile management functions
 */
export async function getMyCreatorProfile() {
  try {
    const data = await apiRequest('/api/creator-profile/my')
    
    if (data.success) {
      return data.data.profile
    }
    
    throw new Error(data.message || 'Profile not found')
  } catch (error) {
    console.error('Get creator profile failed:', error)
    throw error
  }
}

export async function updateCreatorProfile(formData) {
  try {
    const url = `${config.apiBaseUrl}/api/creator-profile`
    const response = await fetch(url, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.success) {
      return data.data.profile
    }
    
    throw new Error(data.message || 'Profile update failed')
  } catch (error) {
    console.error('Creator profile update failed:', error)
    throw error
  }
}

export async function getPublicCreatorProfile(userId) {
  try {
    const data = await apiRequest(`/api/creator-profile/${userId}/public`)
    
    if (data.success) {
      return data.data.profile
    }
    
    throw new Error(data.message || 'Profile not found')
  } catch (error) {
    console.error('Get public creator profile failed:', error)
    throw error
  }
}

/**
 * Publishing workflow functions
 */
export async function publishComic(comicId) {
  try {
    const data = await apiRequest(`/api/comics/${comicId}/publish`, { method: 'POST' })
    
    if (data.success) {
      return data.data.comic
    }
    
    throw new Error(data.message || 'Publishing failed')
  } catch (error) {
    console.error('Publish comic failed:', error)
    throw error
  }
}

export async function scheduleComic(comicId, scheduledAt) {
  try {
    const data = await apiRequest(`/api/comics/${comicId}/schedule`, {
      method: 'POST',
      body: JSON.stringify({ scheduledAt }),
    })
    
    if (data.success) {
      return data.data.comic
    }
    
    throw new Error(data.message || 'Scheduling failed')
  } catch (error) {
    console.error('Schedule comic failed:', error)
    throw error
  }
}

export async function draftComic(comicId) {
  try {
    const data = await apiRequest(`/api/comics/${comicId}/draft`, { method: 'POST' })
    
    if (data.success) {
      return data.data.comic
    }
    
    throw new Error(data.message || 'Draft failed')
  } catch (error) {
    console.error('Draft comic failed:', error)
    throw error
  }
}