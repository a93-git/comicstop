# ComicStop Backend

Express.js backend for the ComicStop comic sharing platform.

## Features

- **User Authentication**: JWT-based authentication with bcrypt password hashing
- **Comic Uploads**: File uploads to Amazon S3 with metadata storage in PostgreSQL
- **Comic Management**: CRUD operations for comic metadata and files
- **RESTful API**: Clean API endpoints with proper HTTP status codes
- **Database Integration**: PostgreSQL with Sequelize ORM
- **File Storage**: Amazon S3 integration for comic file storage
- **API Documentation**: Swagger/OpenAPI documentation
- **Security**: Helmet, CORS, rate limiting, and input validation
- **Modular Architecture**: Organized folder structure for scalability

## Tech Stack

- **Node.js** + **Express.js**
- **PostgreSQL** with **Sequelize ORM**
- **Amazon S3** for file storage
- **JWT** for authentication
- **bcrypt** for password hashing
- **Joi** for input validation
- **Swagger** for API documentation
- **Multer** for file uploads

## Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── index.js     # Main configuration
│   │   └── database.js  # Database configuration
│   ├── controllers/     # Request handlers
│   │   ├── authController.js
│   │   └── comicController.js
│   ├── middleware/      # Custom middleware
│   │   ├── auth.js      # Authentication middleware
│   │   ├── errorHandler.js
│   │   ├── upload.js    # File upload middleware
│   │   └── validation.js
│   ├── models/          # Database models
│   │   ├── index.js
│   │   ├── User.js
│   │   └── Comic.js
│   ├── routes/          # API routes
│   │   ├── index.js
│   │   ├── auth.js
│   │   └── comics.js
│   ├── services/        # Business logic
│   │   ├── authService.js
│   │   ├── comicService.js
│   │   └── s3Service.js
│   └── app.js          # Main application file
├── .env.example        # Environment variables template
├── swagger.config.js   # Swagger configuration
└── package.json
```

## Setup Instructions

### 1. Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

### 2. Database Setup

Create a PostgreSQL database and update the database configuration in `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=comicstop
DB_USER=your_username
DB_PASSWORD=your_password
```

### 3. AWS S3 Setup

Configure AWS S3 credentials in `.env`:

```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=comicstop-uploads
```

### 4. JWT Configuration

Set a secure JWT secret in `.env`:

```env
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 5. Install Dependencies

```bash
npm install
```

### 6. Start the Server

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires authentication)
- `POST /api/auth/logout` - Logout user

### Comics
- `POST /api/comics/upload` - Upload a new comic (requires authentication)
- `GET /api/comics` - Get all public comics (with pagination and filtering)
- `GET /api/comics/my` - Get user's own comics (requires authentication)
- `GET /api/comics/:id` - Get specific comic by ID (requires authentication)
- `PUT /api/comics/:id` - Update comic metadata (requires authentication, owner only)
- `DELETE /api/comics/:id` - Delete comic (requires authentication, owner only)

### Other
- `GET /api/health` - Health check endpoint
- `GET /api-docs` - Swagger API documentation

## API Documentation

Once the server is running, visit `http://localhost:3001/api-docs` for interactive API documentation powered by Swagger UI.

## File Upload Support

The API supports the following file types:
- PDF (.pdf)
- EPUB (.epub)
- MOBI (.mobi)
- Comic Book Zip (.cbz)
- Comic Book RAR (.cbr)
- ZIP (.zip)
- Images (.jpg, .jpeg, .png)

Maximum file size: 50MB (configurable)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents API abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Joi validation for all inputs
- **File Type Validation**: Restricts allowed file types

## Development

### Running Tests

```bash
npm test
```

### Linting

```bash
npm run lint
```

### Environment

- Node.js 18+
- PostgreSQL 12+
- AWS S3 bucket

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Configure production database
3. Set up AWS S3 bucket with proper permissions
4. Use a secure JWT secret
5. Configure rate limiting and CORS for production URLs
6. Set up process manager (PM2, Docker, etc.)
