import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '../Navbar/Navbar'
import { ComicThumbnail } from '../ComicThumbnail/ComicThumbnail'
import { getMyCreatorProfile, getMySeries, getMyComics } from '../../services/api'
import styles from './CreatorDashboard.module.css'

export function CreatorDashboard() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [series, setSeries] = useState([])
  const [comics, setComics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    document.title = 'ComicStop – Creator Dashboard'
    loadCreatorData()
  }, [])

  const loadCreatorData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [creatorProfile, creatorSeries, creatorComics] = await Promise.all([
        getMyCreatorProfile().catch(() => null),
        getMySeries().catch(() => ({ series: [] })),
        getMyComics({ limit: 10 }).catch(() => ({ comics: [] })),
      ])

      setProfile(creatorProfile)
      setSeries(creatorSeries.series || [])
      setComics(creatorComics.comics || [])
    } catch (err) {
      setError('Failed to load creator data')
      console.error('Error loading creator data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleComicClick = (comic) => {
    navigate(`/comic/${comic.id}`)
  }

  const handleCreateSeries = () => {
    navigate('/creator/series/new')
  }

  const handleManageSeries = (series) => {
    navigate(`/creator/series/${series.id}`)
  }

  const handleUploadComic = () => {
    navigate('/upload')
  }

  const handleEditProfile = () => {
    navigate('/creator/profile')
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.loading}>Loading creator dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.container}>
        <Navbar />
        <div className={styles.error}>{error}</div>
      </div>
    )
  }

  const renderOverview = () => (
    <div className={styles.overview}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Total Series</h3>
          <div className={styles.statNumber}>{series.length}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Comics</h3>
          <div className={styles.statNumber}>{comics.length}</div>
        </div>
        <div className={styles.statCard}>
          <h3>Total Views</h3>
          <div className={styles.statNumber}>
            {comics.reduce((total, comic) => total + (comic.viewCount || 0), 0)}
          </div>
        </div>
        <div className={styles.statCard}>
          <h3>Published Comics</h3>
          <div className={styles.statNumber}>
            {comics.filter(comic => comic.publishStatus === 'published').length}
          </div>
        </div>
      </div>

      <div className={styles.quickActions}>
        <h3>Quick Actions</h3>
        <div className={styles.actionButtons}>
          <button onClick={handleUploadComic} className={styles.primaryButton}>
            Upload New Comic
          </button>
          <button onClick={handleCreateSeries} className={styles.secondaryButton}>
            Create New Series
          </button>
          <button onClick={handleEditProfile} className={styles.secondaryButton}>
            Edit Profile
          </button>
        </div>
      </div>

      <div className={styles.recentComics}>
        <h3>Recent Comics</h3>
        {comics.length > 0 ? (
          <div className={styles.comicsGrid}>
            {comics.slice(0, 6).map(comic => (
              <div key={comic.id} className={styles.comicCard}>
                <ComicThumbnail comic={comic} onClick={() => handleComicClick(comic)} />
                <div className={styles.comicStatus}>
                  <span className={`${styles.statusBadge} ${styles[comic.publishStatus]}`}>
                    {comic.publishStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <p>No comics uploaded yet.</p>
            <button onClick={handleUploadComic} className={styles.primaryButton}>
              Upload Your First Comic
            </button>
          </div>
        )}
      </div>
    </div>
  )

  const renderSeries = () => (
    <div className={styles.seriesSection}>
      <div className={styles.sectionHeader}>
        <h3>My Series</h3>
        <button onClick={handleCreateSeries} className={styles.primaryButton}>
          Create New Series
        </button>
      </div>
      
      {series.length > 0 ? (
        <div className={styles.seriesGrid}>
          {series.map(s => (
            <div key={s.id} className={styles.seriesCard}>
              <div className={styles.seriesCover}>
                {s.coverArtS3Url ? (
                  <img src={s.coverArtS3Url} alt={s.title} />
                ) : (
                  <div className={styles.placeholderCover}>No Cover</div>
                )}
              </div>
              <div className={styles.seriesInfo}>
                <h4>{s.title}</h4>
                <p>{s.description}</p>
                <div className={styles.seriesMeta}>
                  <span>Status: {s.status}</span>
                  <span>Comics: {s.comics?.length || 0}</span>
                </div>
                <button 
                  onClick={() => handleManageSeries(s)} 
                  className={styles.secondaryButton}
                >
                  Manage Series
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No series created yet.</p>
          <button onClick={handleCreateSeries} className={styles.primaryButton}>
            Create Your First Series
          </button>
        </div>
      )}
    </div>
  )

  const renderComics = () => (
    <div className={styles.comicsSection}>
      <div className={styles.sectionHeader}>
        <h3>My Comics</h3>
        <button onClick={handleUploadComic} className={styles.primaryButton}>
          Upload New Comic
        </button>
      </div>

      {comics.length > 0 ? (
        <div className={styles.comicsTable}>
          <div className={styles.tableHeader}>
            <span>Title</span>
            <span>Status</span>
            <span>Views</span>
            <span>Published</span>
            <span>Actions</span>
          </div>
          {comics.map(comic => (
            <div key={comic.id} className={styles.tableRow}>
              <span className={styles.comicTitle}>{comic.title}</span>
              <span className={`${styles.statusBadge} ${styles[comic.publishStatus]}`}>
                {comic.publishStatus}
              </span>
              <span>{comic.viewCount || 0}</span>
              <span>
                {comic.publishedAt 
                  ? new Date(comic.publishedAt).toLocaleDateString()
                  : 'Not published'
                }
              </span>
              <div className={styles.actions}>
                <button 
                  onClick={() => handleComicClick(comic)}
                  className={styles.linkButton}
                >
                  View
                </button>
                <button 
                  onClick={() => navigate(`/comic/${comic.id}/edit`)}
                  className={styles.linkButton}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p>No comics uploaded yet.</p>
          <button onClick={handleUploadComic} className={styles.primaryButton}>
            Upload Your First Comic
          </button>
        </div>
      )}
    </div>
  )

  const renderAnalytics = () => (
    <div className={styles.analyticsSection}>
      <h3>Analytics</h3>
      <p>Analytics features coming soon...</p>
      <div className={styles.metricsGrid}>
        <div className={styles.metricCard}>
          <h4>Total Views</h4>
          <div className={styles.metricValue}>
            {comics.reduce((total, comic) => total + (comic.viewCount || 0), 0)}
          </div>
        </div>
        <div className={styles.metricCard}>
          <h4>Average Rating</h4>
          <div className={styles.metricValue}>
            {comics.length > 0 
              ? (comics.reduce((total, comic) => total + (comic.rating || 0), 0) / comics.length).toFixed(1)
              : '0.0'
            }
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className={styles.container}>
      <Navbar />
      
      <div className={styles.main}>
        <div className={styles.header}>
          <h1>Creator Dashboard</h1>
          {profile && (
            <div className={styles.profilePreview}>
              <span>Welcome back, {profile.displayName || profile.user?.username || 'Creator'}!</span>
            </div>
          )}
        </div>

        <nav className={styles.tabNavigation}>
          <button 
            className={`${styles.tab} ${activeTab === 'overview' ? styles.active : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'series' ? styles.active : ''}`}
            onClick={() => setActiveTab('series')}
          >
            Series
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'comics' ? styles.active : ''}`}
            onClick={() => setActiveTab('comics')}
          >
            Comics
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'analytics' ? styles.active : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </nav>

        <div className={styles.content}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'series' && renderSeries()}
          {activeTab === 'comics' && renderComics()}
          {activeTab === 'analytics' && renderAnalytics()}
        </div>
      </div>
    </div>
  )
}