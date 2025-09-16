# ComicStop Backend

Express.js backend for the ComicStop comic sharing platform.

## Quick start (SQLite, local development)

The backend is configured to use SQLite for local development and testing. You do not need PostgreSQL to run it locally.

1) Install dependencies

```bash
cd backend
npm install
```

2) Create a local env file (overrides .env in local dev)

```bash
cp .env.example .env.local
```

3) Edit `.env.local` to use SQLite and a dev JWT secret

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database (SQLite for local dev)
DB_DIALECT=sqlite
DB_STORAGE=./dev.sqlite

# Auth
JWT_SECRET=dev_secret_change_me
JWT_EXPIRES_IN=7d

# Optional (only needed if you test uploads)
# AWS_REGION=us-east-1
# AWS_ACCESS_KEY_ID=your_access_key
# AWS_SECRET_ACCESS_KEY=your_secret_key
# S3_BUCKET_NAME=comicstop-uploads
```

4) Run the server

```bash
# Development mode
npm run dev

# Or start in production mode
npm start
```

The API will be available at http://localhost:3001 and Swagger docs at http://localhost:3001/api-docs.

5) (Optional) Seed local data

```bash
npm run seed
```

6) Quick sanity checks

```bash
# Health check
curl -s http://localhost:3001/api/health | jq .

# Create a user
curl -s -X POST http://localhost:3001/api/auth/signup \
	-H 'Content-Type: application/json' \
	-d '{"username":"devuser","email":"dev@example.com","password":"StrongP@ssw0rd!"}' | jq .
```

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

Local development: use SQLite (recommended)

```env
DB_DIALECT=sqlite
DB_STORAGE=./dev.sqlite
```

Production or external DB (optional for local): configure PostgreSQL

```env
DB_DIALECT=postgres
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

The server will start on `http://localhost:3001`. Swagger docs at `http://localhost:3001/api-docs`.

### 7. Running with tests (uses in-memory SQLite)

The test runner configures `DB_DIALECT=sqlite` and `DB_STORAGE=:memory:` automatically.

```bash
npm test
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user using a generic `identifier` (string) and `password`. The `identifier` can be an email address, a username, or a phone number. The API normalizes values (lowercase for email/username, digits-only for phone) and matches accordingly.
- `GET /api/auth/profile` - Get user profile (requires authentication)
- `PATCH /api/auth/profile` - Update exactly one of: `username`, `email`, `phone`, or `password` (requires authentication). Requests providing more than one field are rejected.
- `PATCH /api/auth/profile/username` - Update username (normalized lowercase; unique)
- `PATCH /api/auth/profile/email` - Update email address (normalized lowercase; unique)
- `PATCH /api/auth/profile/phone` - Update phone (digits-only; unique)
- `PATCH /api/auth/profile/password` - Update password (must meet strength requirements)
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request a password reset (always returns success; in development/test, returns `{ token, expiresAt }` in response data)
- `POST /api/auth/reset-password` - Reset password using a token
 - `DELETE /api/auth/me` - Delete the currently authenticated account. On success returns:
	 `{ success: true, data: { loggedOut: true }, message: 'Account deleted. Please remove client token.' }`.
	 Clients must clear any stored auth tokens. Any previously issued JWTs become invalid immediately since the user record no longer exists; subsequent requests with the old token will return 401.

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
	- Auth endpoints are rate limited using express-rate-limit
		- POST /api/auth/login: max 5 requests per 10 minutes per IP/key
		- POST /api/auth/signup: max 3 requests per hour per IP/key
		- POST /api/auth/forgot-password: max 3 requests per 30 minutes per IP/key
	- Exceeding limits returns HTTP 429 with JSON: `{ success: false, message: 'Too many requests, please try again later.' }`
- **CORS**: Configurable cross-origin resource sharing
- **Helmet**: Security headers
- **Input Validation**: Joi validation for all inputs
- **File Type Validation**: Restricts allowed file types

## Development

### Running Tests

```bash
npm test
### Password reset tokens in development/test

For convenience during local development and automated tests, the password reset endpoint returns the generated reset token in the response when `NODE_ENV !== 'production'`. You can copy the token from the response and visit the frontend reset page at:

`http://localhost:5173/reset-password?token=YOUR_TOKEN`

In production, tokens are not returned by the API and should be delivered via email.

```

### Linting

```bash
npm run lint
```

### Environment

- Node.js 18+ (Node 20.x recommended)
- SQLite for local development (no external DB required)
- PostgreSQL 12+ for production or if you prefer running against Postgres locally
- AWS S3 bucket (only required if you test uploads)

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Configure production database
3. Set up AWS S3 bucket with proper permissions
4. Use a secure JWT secret
5. Configure rate limiting and CORS for production URLs
6. Set up process manager (PM2, Docker, etc.)
