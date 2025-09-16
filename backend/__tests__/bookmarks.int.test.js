import request from 'supertest'

// Configure test env BEFORE importing the app
process.env.NODE_ENV = 'test'
process.env.DB_DIALECT = 'sqlite'
process.env.DB_STORAGE = ':memory:'

const { app } = await import('../src/app.js')
const { initializeDatabase } = await import('../src/config/database.js')
const { Comic } = await import('../src/models/Comic.js')

let authToken
let comic

beforeAll(async () => {
  await initializeDatabase()

  // Create a user
  const email = `user_${Date.now()}@example.com`
  const signup = await request(app)
    .post('/api/auth/signup')
    .send({ username: 'BUser', emailOrPhone: email, password: 'StrongP@ssw0rd!', termsAccepted: true })
    .set('Accept', 'application/json')

  authToken = signup.body.data.token

  // Create a comic record to bookmark
  comic = await Comic.create({
    title: 'Bookmarkable',
    description: 'Test',
    author: 'Tester',
    fileName: 'a.pdf',
    fileSize: 1,
    fileType: 'application/pdf',
    s3Key: 'k',
    s3Url: 'http://example.com/k',
    uploaderId: signup.body.data.user.id,
  })
})

describe('Bookmarks API', () => {
  it('GET /api/bookmarks initially returns empty list', async () => {
    const res = await request(app)
      .get('/api/bookmarks')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(Array.isArray(res.body.data.bookmarks)).toBe(true)
  })

  it('POST /api/bookmarks adds a bookmark', async () => {
    const res = await request(app)
      .post('/api/bookmarks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ itemId: comic.id, type: 'comic', metadata: { title: comic.title } })

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data.bookmark.itemId).toBe(comic.id)
  })

  it('GET /api/bookmarks/check shows bookmarked true', async () => {
    const res = await request(app)
      .get('/api/bookmarks/check')
      .set('Authorization', `Bearer ${authToken}`)
      .query({ itemId: comic.id, type: 'comic' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.bookmarked).toBe(true)
  })

  it('POST /api/bookmarks/toggle removes existing bookmark', async () => {
    const res = await request(app)
      .post('/api/bookmarks/toggle')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ itemId: comic.id, type: 'comic' })

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.bookmarked).toBe(false)
  })
})
