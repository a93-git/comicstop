# ComicStop Comments Service

A standalone, reusable commenting microservice for the ComicStop platform. This service provides a complete commenting system for comic chapters with features like nested replies, likes, reactions, and moderation capabilities.

## 🚀 Features

- **Chapter-based Comments**: Comments are organized by chapter ID
- **Nested Replies**: Support for multi-level comment threads
- **Likes System**: Users can like/unlike comments
- **Reactions**: Emoji reactions (👍, ❤️, 😂, 😮, 😢, 😡)
- **Sorting Options**: Sort by newest, oldest, or most liked
- **Authentication**: JWT-based authentication compatible with main ComicStop app
- **Validation**: Comprehensive input validation and sanitization
- **Rate Limiting**: Built-in protection against spam
- **CORS Support**: Cross-origin requests enabled for frontend integration
- **RESTful API**: Clean, well-documented REST endpoints

## 📋 Requirements

- Node.js 16+ 
- MongoDB 4.4+
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to the service directory:**
   ```bash
   cd comments-service
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=3002
   MONGODB_URI=mongodb://localhost:27017/comicstop_comments
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   FRONTEND_URL=http://localhost:5173
   BACKEND_URL=http://localhost:3001
   ```

4. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

5. **Start the service:**
   ```bash
   # Development mode (with auto-reload)
   npm run dev
   
   # Production mode
   npm start
   ```

The service will be available at `http://localhost:3002`

## 📚 API Documentation

### Base URL
```
http://localhost:3002
```

### Endpoints

#### 1. Get Comments
```http
GET /comments/:chapterId
```

**Query Parameters:**
- `sort` (optional): `newest` | `oldest` | `most_liked` (default: `newest`)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page, max 100 (default: 20)

**Response:**
```json
{
  "success": true,
  "message": "Comments retrieved successfully",
  "data": {
    "comments": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalComments": 87,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

#### 2. Add Comment
```http
POST /comments/:chapterId
```

**Headers:**
- `Authorization: Bearer <token>` (optional, for user identification)

**Body:**
```json
{
  "author": "username",
  "text": "This is a great chapter!",
  "parentCommentId": "60f7b3b3b3b3b3b3b3b3b3b3" // optional, for replies
}
```

**Response:**
```json
{
  "success": true,
  "message": "Comment added successfully",
  "data": {
    "comment": {
      "_id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "chapterId": "chapter-123",
      "author": "username",
      "text": "This is a great chapter!",
      "likes": 0,
      "reactions": [],
      "createdAt": "2023-07-21T10:30:00.000Z"
    }
  }
}
```

#### 3. Like Comment
```http
POST /comments/:commentId/like
```

#### 4. Unlike Comment
```http
POST /comments/:commentId/unlike
```

#### 5. Add Reaction
```http
POST /comments/:commentId/reaction
```

**Body:**
```json
{
  "type": "👍" // Allowed: 👍, ❤️, 😂, 😮, 😢, 😡
}
```

#### 6. Remove Reaction
```http
DELETE /comments/:commentId/reaction
```

**Body:**
```json
{
  "type": "👍"
}
```

#### 7. Delete Comment
```http
DELETE /comments/:commentId
```

**Headers:**
- `Authorization: Bearer <token>` (required)

#### 8. Get Comment Statistics
```http
GET /comments/:chapterId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "chapterId": "chapter-123",
    "totalComments": 87,
    "topLevelComments": 45,
    "replies": 42,
    "recentComments": 12,
    "mostLikedComment": {
      "id": "60f7b3b3b3b3b3b3b3b3b3b3",
      "author": "username",
      "likes": 25,
      "text": "This is an amazing chapter! The art style really..."
    }
  }
}
```

#### 9. Health Check
```http
GET /health
```

## 🔐 Authentication

The service supports JWT-based authentication compatible with the main ComicStop application:

- **Optional Authentication**: Most endpoints work without authentication
- **Required Authentication**: Only comment deletion requires authentication
- **User Identification**: When authenticated, user info is automatically extracted for comment authorship

**Token Format:**
```
Authorization: Bearer <your-jwt-token>
```

## 🚦 Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [
    {
      "field": "text",
      "message": "Comment text is required"
    }
  ]
}
```

**Common Error Codes:**
- `VALIDATION_ERROR`: Input validation failed
- `COMMENT_NOT_FOUND`: Comment doesn't exist
- `INVALID_TOKEN`: JWT token is invalid
- `RATE_LIMIT_EXCEEDED`: Too many requests

## 📊 Data Model

### Comment Schema
```javascript
{
  chapterId: String,        // Required: Chapter identifier
  author: String,           // Required: Comment author
  text: String,             // Required: Comment text (max 2000 chars)
  parentCommentId: ObjectId, // Optional: For nested replies
  likes: Number,            // Default: 0
  reactions: [{
    type: String,           // Emoji reaction
    count: Number           // Reaction count
  }],
  createdAt: Date,         // Auto-generated
  updatedAt: Date          // Auto-updated
}
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3002` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/comicstop_comments` |
| `JWT_SECRET` | JWT signing secret | Required |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |
| `BACKEND_URL` | Backend URL for CORS | `http://localhost:3001` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint
```

## 🚀 Deployment

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3002
CMD ["npm", "start"]
```

### Environment Setup
1. Ensure MongoDB is accessible
2. Set production environment variables
3. Use a proper JWT secret
4. Configure CORS for your domain
5. Set up reverse proxy if needed

## 🔌 Integration with ComicStop

### Frontend Integration
```javascript
// Example: Add comment
const addComment = async (chapterId, comment) => {
  const response = await fetch(`http://localhost:3002/comments/${chapterId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}` // optional
    },
    body: JSON.stringify(comment)
  });
  return response.json();
};

// Example: Get comments
const getComments = async (chapterId, sort = 'newest') => {
  const response = await fetch(`http://localhost:3002/comments/${chapterId}?sort=${sort}`);
  return response.json();
};
```

### Backend Integration
The service is designed to work independently but can share the same JWT secret for seamless authentication integration.

## 📈 Performance Considerations

- **Database Indexing**: Optimized indexes for chapter and comment queries
- **Pagination**: Built-in pagination to handle large comment threads
- **Rate Limiting**: Protects against spam and abuse
- **Connection Pooling**: MongoDB connection pooling for better performance
- **Caching**: Consider adding Redis for frequently accessed comments

## 🛡️ Security Features

- **Input Validation**: Comprehensive validation using Joi
- **Rate Limiting**: Protection against spam
- **CORS**: Configured for secure cross-origin requests
- **JWT Verification**: Token-based authentication
- **Helmet**: Security headers
- **Data Sanitization**: Input sanitization to prevent injection

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Ensure linting passes
6. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review the API examples above