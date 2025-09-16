import { useState, useEffect } from 'react'
import axios from 'axios'
import styles from './CommentsSection.module.css'

export function CommentsSection({ chapterId, userToken }) {
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
  const [replyingTo, setReplyingTo] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [userReactions, setUserReactions] = useState({}) // Track user's reactions per comment

  const API_BASE = 'http://localhost:3002'
  const EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢'] // Five emoji reactions

  // Enhanced sorting function
  const sortComments = (comments, sortBy) => {
    return [...comments].sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'likes':
          return (b.likes || 0) - (a.likes || 0)
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })
  }

  // Fetch comments for the chapter
  const fetchComments = async () => {
    try {
      const response = await axios.get(`${API_BASE}/comments/${chapterId}?sort=${sortBy}`)
      if (response.data.success) {
        const sortedComments = sortComments(response.data.data.comments, sortBy)
        setComments(sortedComments)
      }
    } catch (error) {
      console.warn('Failed to fetch comments, using fallback data:', error)
      // Fallback sample comments for demonstration
      const fallbackComments = [
        {
          _id: 'sample1',
          author: 'ComicFan2024',
          text: 'Amazing storyline! Can\'t wait to see what happens next.',
          createdAt: new Date().toISOString(),
          likes: 5,
          reactions: { '❤️': 2, '😮': 1, '👍': 3 },
          replies: []
        },
        {
          _id: 'sample2',
          author: 'GraphicNovelLover',
          text: 'The character development in this chapter is incredible.',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          likes: 3,
          reactions: { '👍': 4, '❤️': 1, '😂': 2 },
          replies: [
            {
              _id: 'reply1',
              author: 'StorytellerFan',
              text: 'Totally agree! The dialogue feels so natural.',
              createdAt: new Date(Date.now() - 43200000).toISOString(),
              likes: 1
            }
          ]
        },
        {
          _id: 'sample3',
          author: 'ArtEnthusiast',
          text: 'The artwork in this issue is absolutely stunning. The color palette really brings the emotions to life.',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          likes: 8,
          reactions: { '👍': 5, '❤️': 3, '😮': 2 },
          replies: []
        }
      ]
      
      const sortedComments = sortComments(fallbackComments, sortBy)
      setComments(sortedComments)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [chapterId, sortBy]) // fetchComments is recreated on every render, so we don't include it

  // Add a new comment
  const addComment = async () => {
    if (!newComment.trim()) return
    
    setLoading(true)
    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(userToken && { 'Authorization': `Bearer ${userToken}` })
      }
      
      const response = await axios.post(`${API_BASE}/comments/${chapterId}`, {
        author: 'CurrentUser', // Get from your auth system
        text: newComment
      }, { headers })

      if (response.data.success) {
        setNewComment('')
        fetchComments() // Refresh comments
      }
    } catch (error) {
      console.warn('Failed to add comment, showing in UI anyway:', error)
      // Add comment to local state for demonstration
      const newCommentObj = {
        _id: `local-${Date.now()}`,
        author: 'CurrentUser',
        text: newComment,
        createdAt: new Date().toISOString(),
        likes: 0,
        reactions: {},
        replies: []
      }
      setComments(prev => [newCommentObj, ...prev])
      setNewComment('')
    } finally {
      setLoading(false)
    }
  }

  // Like a comment
  const likeComment = async (commentId) => {
    try {
      await axios.post(`${API_BASE}/comments/${commentId}/like`)
      fetchComments() // Refresh to get updated likes
    } catch (error) {
      console.warn('Failed to like comment:', error)
      // Update local state for demonstration
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      ))
    }
  }

  // Enhanced reaction system
  const toggleReaction = async (commentId, reaction) => {
    const currentUserReaction = userReactions[commentId]
    
    try {
      if (currentUserReaction === reaction) {
        // Remove reaction if clicking same one
        await axios.delete(`${API_BASE}/comments/${commentId}/reaction/${reaction}`)
        setUserReactions(prev => ({ ...prev, [commentId]: null }))
      } else {
        // Add or change reaction
        await axios.post(`${API_BASE}/comments/${commentId}/reaction`, { type: reaction })
        setUserReactions(prev => ({ ...prev, [commentId]: reaction }))
      }
      fetchComments() // Refresh to get updated reactions
    } catch (error) {
      console.warn('Failed to update reaction:', error)
      // Update local state for demonstration
      setComments(prev => prev.map(comment => {
        if (comment._id === commentId) {
          const newReactions = { ...comment.reactions }
          
          // Remove old reaction if exists
          if (currentUserReaction && newReactions[currentUserReaction]) {
            newReactions[currentUserReaction] = Math.max(0, newReactions[currentUserReaction] - 1)
            if (newReactions[currentUserReaction] === 0) {
              delete newReactions[currentUserReaction]
            }
          }
          
          // Add new reaction if different or first time
          if (currentUserReaction !== reaction) {
            newReactions[reaction] = (newReactions[reaction] || 0) + 1
            setUserReactions(prev => ({ ...prev, [commentId]: reaction }))
          } else {
            setUserReactions(prev => ({ ...prev, [commentId]: null }))
          }
          
          return { ...comment, reactions: newReactions }
        }
        return comment
      }))
    }
  }

  // Reply to a comment
  const addReply = async (commentId) => {
    if (!replyText.trim()) return

    try {
      const headers = {
        'Content-Type': 'application/json',
        ...(userToken && { 'Authorization': `Bearer ${userToken}` })
      }

      await axios.post(`${API_BASE}/comments/${commentId}/reply`, {
        author: 'CurrentUser',
        text: replyText
      }, { headers })

      setReplyText('')
      setReplyingTo(null)
      fetchComments() // Refresh comments
    } catch (error) {
      console.warn('Failed to add reply:', error)
      // Add reply to local state for demonstration
      const newReply = {
        _id: `reply-${Date.now()}`,
        author: 'CurrentUser',
        text: replyText,
        createdAt: new Date().toISOString(),
        likes: 0
      }
      
      setComments(prev => prev.map(comment => 
        comment._id === commentId 
          ? { ...comment, replies: [...(comment.replies || []), newReply] }
          : comment
      ))
      
      setReplyText('')
      setReplyingTo(null)
    }
  }

  const handleKeyPress = (e, action, ...args) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      action(...args)
    }
  }

  return (
    <div className={styles.commentsSection}>
      {/* Sort Controls */}
      <div className={styles.controls}>
        <div className={styles.sortControls}>
          <label htmlFor="sort-select" className={styles.sortLabel}>Sort by:</label>
          <select 
            id="sort-select"
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="likes">Most Liked</option>
          </select>
        </div>
        <div className={styles.commentsCount}>
          {comments.length} comment{comments.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Add Comment */}
      <div className={styles.addComment}>
        <h4>Add a comment</h4>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyPress={(e) => handleKeyPress(e, addComment)}
          placeholder="Share your thoughts about this comic..."
          rows={3}
          className={styles.commentInput}
          aria-label="Write a comment"
        />
        <button 
          onClick={addComment} 
          disabled={loading || !newComment.trim()}
          className={styles.submitButton}
        >
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </div>

      {/* Comments List */}
      <div className={styles.commentsList}>
        {comments.length === 0 ? (
          <div className={styles.noComments}>
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          comments.map(comment => (
            <div key={comment._id} className={styles.comment}>
              <div className={styles.commentHeader}>
                <strong className={styles.commentAuthor}>{comment.author}</strong>
                <span className={styles.commentDate}>
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              
              <div className={styles.commentText}>{comment.text}</div>
              
              <div className={styles.commentActions}>
                <button 
                  onClick={() => likeComment(comment._id)}
                  className={styles.actionButton}
                  aria-label={`Like comment by ${comment.author}`}
                >
                  👍 {comment.likes}
                </button>
                
                {/* Enhanced Emoji Reaction buttons */}
                <div className={styles.reactionsContainer}>
                  {EMOJI_REACTIONS.map(reaction => {
                    const count = comment.reactions?.[reaction] || 0
                    const isUserReaction = userReactions[comment._id] === reaction
                    
                    return (
                      <button
                        key={reaction}
                        onClick={() => toggleReaction(comment._id, reaction)}
                        className={`${styles.reactionButton} ${isUserReaction ? styles.userReaction : ''}`}
                        aria-label={`React with ${reaction}${count > 0 ? ` (${count})` : ''}`}
                        title={`${reaction} ${count > 0 ? count : ''}`}
                      >
                        {reaction}
                        {count > 0 && <span className={styles.reactionCount}>{count}</span>}
                      </button>
                    )
                  })}
                </div>

                <button 
                  onClick={() => setReplyingTo(comment._id)}
                  className={styles.replyButton}
                  aria-label={`Reply to ${comment.author}`}
                >
                  Reply
                </button>
              </div>

              {/* Reply Form */}
              {replyingTo === comment._id && (
                <div className={styles.replyForm}>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyPress={(e) => handleKeyPress(e, addReply, comment._id)}
                    placeholder="Write a reply..."
                    rows={2}
                    className={styles.replyInput}
                    aria-label="Write a reply"
                  />
                  <div className={styles.replyActions}>
                    <button 
                      onClick={() => addReply(comment._id)}
                      disabled={!replyText.trim()}
                      className={styles.submitReplyButton}
                    >
                      Reply
                    </button>
                    <button 
                      onClick={() => {
                        setReplyingTo(null)
                        setReplyText('')
                      }}
                      className={styles.cancelButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div className={styles.replies}>
                  {comment.replies.map(reply => (
                    <div key={reply._id} className={styles.reply}>
                      <div className={styles.commentHeader}>
                        <strong className={styles.commentAuthor}>{reply.author}</strong>
                        <span className={styles.commentDate}>
                          {new Date(reply.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.commentText}>{reply.text}</div>
                      <div className={styles.commentActions}>
                        <button 
                          onClick={() => likeComment(reply._id)}
                          className={styles.actionButton}
                          aria-label={`Like reply by ${reply.author}`}
                        >
                          👍 {reply.likes || 0}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}