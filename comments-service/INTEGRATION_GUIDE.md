# ComicStop Comments Service Integration Example

This document shows how to integrate the ComicStop Comments Service with frontend applications.

## Quick Start

1. **Start the Comments Service:**
   ```bash
   cd comments-service
   npm install
   npm start
   # Service will run on http://localhost:3002
   ```

2. **Ensure MongoDB is running** (optional for testing, service will start without it):
   ```bash
   mongod
   ```

## Frontend Integration Examples

### Basic Comment Display Component (React)

```jsx
import React, { useState, useEffect } from 'react';

const CommentsSection = ({ chapterId, userToken }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:3002';

  // Fetch comments for the chapter
  const fetchComments = async () => {
    try {
      const response = await fetch(`${API_BASE}/comments/${chapterId}?sort=newest`);
      const data = await response.json();
      if (data.success) {
        setComments(data.data.comments);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    }
  };

  // Add a new comment
  const addComment = async () => {
    if (!newComment.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/comments/${chapterId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(userToken && { 'Authorization': `Bearer ${userToken}` })
        },
        body: JSON.stringify({
          author: 'CurrentUser', // Get from your auth system
          text: newComment
        })
      });

      const data = await response.json();
      if (data.success) {
        setNewComment('');
        fetchComments(); // Refresh comments
      }
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setLoading(false);
    }
  };

  // Like a comment
  const likeComment = async (commentId) => {
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}/like`, {
        method: 'POST'
      });
      
      if (response.ok) {
        fetchComments(); // Refresh to show updated likes
      }
    } catch (error) {
      console.error('Failed to like comment:', error);
    }
  };

  // Add reaction to comment
  const addReaction = async (commentId, reactionType) => {
    try {
      const response = await fetch(`${API_BASE}/comments/${commentId}/reaction`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: reactionType })
      });
      
      if (response.ok) {
        fetchComments(); // Refresh to show updated reactions
      }
    } catch (error) {
      console.error('Failed to add reaction:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [chapterId]);

  return (
    <div className="comments-section">
      <h3>Comments</h3>
      
      {/* Add Comment Form */}
      <div className="add-comment">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
        />
        <button onClick={addComment} disabled={loading}>
          {loading ? 'Adding...' : 'Add Comment'}
        </button>
      </div>

      {/* Comments List */}
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment._id} className="comment">
            <div className="comment-header">
              <strong>{comment.author}</strong>
              <span className="comment-date">
                {new Date(comment.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="comment-text">{comment.text}</div>
            
            <div className="comment-actions">
              <button onClick={() => likeComment(comment._id)}>
                👍 {comment.likes}
              </button>
              
              {/* Reaction buttons */}
              {['❤️', '😂', '😮'].map(reaction => (
                <button
                  key={reaction}
                  onClick={() => addReaction(comment._id, reaction)}
                  className="reaction-btn"
                >
                  {reaction}
                </button>
              ))}
            </div>

            {/* Display reactions */}
            {comment.reactions.length > 0 && (
              <div className="reactions">
                {comment.reactions.map(reaction => (
                  <span key={reaction.type} className="reaction">
                    {reaction.type} {reaction.count}
                  </span>
                ))}
              </div>
            )}

            {/* Nested replies */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="replies">
                {comment.replies.map(reply => (
                  <div key={reply._id} className="reply">
                    <strong>{reply.author}:</strong> {reply.text}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentsSection;
```

### Usage in Comic Reader Component

```jsx
import CommentsSection from './CommentsSection';

const ComicReader = ({ chapterId }) => {
  const userToken = localStorage.getItem('authToken'); // Get from your auth system

  return (
    <div className="comic-reader">
      {/* Comic content */}
      <div className="comic-content">
        {/* Your comic display logic */}
      </div>

      {/* Comments section */}
      <CommentsSection 
        chapterId={chapterId} 
        userToken={userToken}
      />
    </div>
  );
};
```

## JavaScript/Vanilla JS Integration

```javascript
class CommentsAPI {
  constructor(baseURL = 'http://localhost:3002') {
    this.baseURL = baseURL;
  }

  // Get comments for a chapter
  async getComments(chapterId, sort = 'newest', page = 1) {
    const response = await fetch(
      `${this.baseURL}/comments/${chapterId}?sort=${sort}&page=${page}`
    );
    return response.json();
  }

  // Add a comment
  async addComment(chapterId, author, text, parentCommentId = null, token = null) {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`${this.baseURL}/comments/${chapterId}`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ author, text, parentCommentId })
    });
    return response.json();
  }

  // Like a comment
  async likeComment(commentId) {
    const response = await fetch(`${this.baseURL}/comments/${commentId}/like`, {
      method: 'POST'
    });
    return response.json();
  }

  // Add reaction
  async addReaction(commentId, reactionType) {
    const response = await fetch(`${this.baseURL}/comments/${commentId}/reaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: reactionType })
    });
    return response.json();
  }

  // Get comment statistics
  async getStats(chapterId) {
    const response = await fetch(`${this.baseURL}/comments/${chapterId}/stats`);
    return response.json();
  }
}

// Usage
const commentsAPI = new CommentsAPI();

// Example: Load and display comments
async function loadComments(chapterId) {
  try {
    const result = await commentsAPI.getComments(chapterId);
    if (result.success) {
      displayComments(result.data.comments);
    }
  } catch (error) {
    console.error('Failed to load comments:', error);
  }
}
```

## Backend Integration (Node.js/Express)

```javascript
// In your main backend, you can proxy requests or call the service directly
import express from 'express';
import fetch from 'node-fetch';

const app = express();

// Proxy comments requests to the microservice
app.use('/api/comments', async (req, res) => {
  try {
    const commentsServiceURL = 'http://localhost:3002';
    const targetURL = `${commentsServiceURL}${req.originalUrl.replace('/api', '')}`;
    
    const response = await fetch(targetURL, {
      method: req.method,
      headers: {
        ...req.headers,
        host: undefined // Remove host header
      },
      ...(req.body && { body: JSON.stringify(req.body) })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Comments service unavailable' 
    });
  }
});
```

## Environment Configuration

Make sure to set the appropriate environment variables:

```env
# In your main app's .env
COMMENTS_SERVICE_URL=http://localhost:3002

# In comments-service/.env
NODE_ENV=production
PORT=3002
MONGODB_URI=mongodb://localhost:27017/comicstop_comments
JWT_SECRET=your_shared_jwt_secret_here
FRONTEND_URL=https://your-domain.com
```

## Authentication Integration

The service uses JWT tokens compatible with your main app. Make sure to:

1. Use the same JWT secret in both applications
2. Include the Authorization header in requests that require authentication
3. The service will extract user info from valid tokens automatically

## Error Handling

All endpoints return consistent error responses:

```javascript
// Example error handling
const handleCommentsError = (error) => {
  if (error.code === 'VALIDATION_ERROR') {
    // Show validation errors to user
    error.errors.forEach(err => {
      console.log(`${err.field}: ${err.message}`);
    });
  } else if (error.code === 'RATE_LIMIT_EXCEEDED') {
    // Show rate limit message
    console.log('Too many requests, please try again later');
  } else {
    // Generic error handling
    console.log('Something went wrong:', error.message);
  }
};
```

## Production Deployment

1. **Deploy the comments service separately** (Docker, PM2, etc.)
2. **Use environment variables** for configuration
3. **Set up MongoDB** with proper authentication
4. **Configure CORS** for your production domains
5. **Use HTTPS** in production
6. **Set up monitoring** and logging
7. **Consider load balancing** for high traffic

For more details, see the complete API documentation in the README.md file.