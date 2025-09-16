import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { ComicThumbnail } from '../ComicThumbnail/ComicThumbnail'
import { getBookmarks, removeBookmark, getUserProfile, setCreatorMode, deleteMyAccount } from '../../services/api'
import styles from './Profile.module.css'

export function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('bookmarks')

  useEffect(() => {
    async function loadProfileData() {
      try {
        setLoading(true)
        setError(null)
        
        // Load user profile and bookmarks
        const [userProfile, userBookmarks] = await Promise.all([
          getUserProfile().catch(() => ({
            username: 'Demo User',
            email: 'demo@comicstop.com',
            joinDate: new Date().toISOString()
          })),
          getBookmarks()
        ])
        
        setUser(userProfile)
        setBookmarks(userBookmarks)
      } catch (err) {
        setError('Failed to load profile data')
        console.error('Error loading profile:', err)
      } finally {
        setLoading(false)
      }
    }

    loadProfileData()
  }, [])

  const handleRemoveBookmark = async (bookmarkId) => {
    try {
      await removeBookmark(bookmarkId)
      setBookmarks(prevBookmarks => 
        prevBookmarks.filter(bookmark => bookmark.id !== bookmarkId)
      )
    } catch (err) {
      console.error('Failed to remove bookmark:', err)
      // You could add a toast notification here
    }
  }

  const handleComicClick = (bookmark) => {
    if (bookmark.type === 'comic') {
      navigate(`/comic/${bookmark.itemId}`)
    } else if (bookmark.type === 'page') {
      navigate(`/comic/${bookmark.itemId}?page=${bookmark.metadata?.pageNumber || 1}`)
    }
  }

  const handleLogout = () => {
    // Clear localStorage and navigate to home
    localStorage.removeItem('authToken')
    navigate('/')
  }

  const handleEnableCreator = async () => {
    try {
      await setCreatorMode(true)
      const updated = await getUserProfile()
      setUser(updated)
      alert('Creator mode enabled')
    } catch (e) {
      console.error(e)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return
    try {
      await deleteMyAccount()
      navigate('/')
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar showAuth={false} onLogout={handleLogout} />
        <main className={styles.main}>
          <div className={styles.loading}>Loading profile...</div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <Navbar showAuth={false} onLogout={handleLogout} />
        <main className={styles.main}>
          <div className={styles.error}>Error: {error}</div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <Navbar showAuth={false} onLogout={handleLogout} />
      
      <main className={styles.main}>
        <div className={styles.header}>
          <h1 className={styles.title}>My Profile</h1>
          <div className={styles.userInfo}>
            <h2 className={styles.username}>{user.username}</h2>
            <p className={styles.email}>{user.email}</p>
            <p className={styles.joinDate}>
              Member since {new Date(user.joinDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className={styles.content}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'bookmarks' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              Bookmarks ({bookmarks.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'settings' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </div>

          <div className={styles.tabContent}>
            {activeTab === 'bookmarks' && (
              <div className={styles.bookmarksSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Your Bookmarks</h3>
                  <p className={styles.sectionDescription}>
                    Manage your saved comics and reading progress
                  </p>
                </div>

                {bookmarks.length === 0 ? (
                  <div className={styles.emptyState}>
                    <div className={styles.emptyIcon}>📚</div>
                    <h4 className={styles.emptyTitle}>No bookmarks yet</h4>
                    <p className={styles.emptyDescription}>
                      Start reading comics and bookmark your favorites to see them here.
                    </p>
                    <button 
                      onClick={() => navigate('/')}
                      className={styles.browseButton}
                    >
                      Browse Comics
                    </button>
                  </div>
                ) : (
                  <div className={styles.bookmarksList}>
                    {bookmarks.map((bookmark) => (
                      <div key={bookmark.id} className={styles.bookmarkItem}>
                        <div className={styles.bookmarkInfo}>
                          <h4 className={styles.bookmarkTitle}>
                            {bookmark.title || `Bookmark ${bookmark.id}`}
                          </h4>
                          <div className={styles.bookmarkMeta}>
                            <span className={styles.bookmarkType}>
                              {bookmark.type === 'comic' ? '📖 Comic' : 
                               bookmark.type === 'page' ? '📄 Page' : 
                               '📚 Series'}
                            </span>
                            {bookmark.metadata?.pageNumber && (
                              <span className={styles.pageNumber}>
                                Page {bookmark.metadata.pageNumber}
                              </span>
                            )}
                            <span className={styles.bookmarkDate}>
                              Added {new Date(bookmark.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className={styles.bookmarkActions}>
                          <button
                            onClick={() => handleComicClick(bookmark)}
                            className={styles.readButton}
                          >
                            Read
                          </button>
                          <button
                            onClick={() => handleRemoveBookmark(bookmark.id)}
                            className={styles.removeButton}
                            aria-label="Remove bookmark"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Account Settings</h3>
                  <p className={styles.sectionDescription}>
                    Manage your account preferences
                  </p>
                </div>
                
                <div className={styles.settingsContent}>
                  <div className={styles.settingItem}>
                    <h4 className={styles.settingTitle}>Theme</h4>
                    <p className={styles.settingDescription}>
                      Choose your preferred theme for reading comics
                    </p>
                    <select className={styles.settingSelect}>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>
                  
                  <div className={styles.settingItem}>
                    <h4 className={styles.settingTitle}>Reading Preferences</h4>
                    <p className={styles.settingDescription}>
                      Customize your reading experience
                    </p>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" className={styles.checkbox} />
                      Show dialogues by default
                    </label>
                    <label className={styles.checkboxLabel}>
                      <input type="checkbox" className={styles.checkbox} />
                      Enable click navigation
                    </label>
                  </div>

                  <div className={styles.settingItem}>
                    <h4 className={styles.settingTitle}>Account Actions</h4>
                    <p className={styles.settingDescription}>Manage important account actions</p>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                      {!user.isCreator && (
                        <button className={styles.readButton} onClick={handleEnableCreator}>
                          Enable Creator Mode
                        </button>
                      )}
                      <button className={styles.removeButton} onClick={handleDeleteAccount}>
                        Delete Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}