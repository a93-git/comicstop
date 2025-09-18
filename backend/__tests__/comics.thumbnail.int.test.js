import request from 'supertest'

// Configure test env BEFORE importing the app
process.env.NODE_ENV = 'test'
process.env.DB_DIALECT = 'sqlite'
process.env.DB_STORAGE = ':memory:'

const { app } = await import('../src/app.js')
const { initializeDatabase } = await import('../src/config/database.js')

const makeUser = async () => {
  const email = `u${Date.now()}@example.com`
  const signup = await request(app)
    .post('/api/auth/signup')
    .send({ username: `user${Date.now()}`, emailOrPhone: email, password: 'StrongP@ssw0rd!', termsAccepted: true })
  const token = signup.body.data.token
  return token
}

beforeAll(async () => {
  await initializeDatabase()
})

describe('Comics thumbnail upload', () => {
  it('creates a comic with a thumbnail file and replaces via patch', async () => {
    const token = await makeUser()

    // Create a series
    const seriesRes = await request(app)
      .post('/api/series')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Thumb Series')
    expect(seriesRes.status).toBe(201)
    const series = seriesRes.body.data.series

    // Prepare multipart create with thumbnailUpload
    const thumb1 = Buffer.from([0xFF, 0xD8, 0xFF, 0xD9])
    const createRes = await request(app)
      .post('/api/comics')
      .set('Authorization', `Bearer ${token}`)
      .attach('thumbnailUpload', thumb1, { filename: 'cover1.jpg', contentType: 'image/jpeg' })
      .field('file_id', 'test-key-123')
      .field('title', 'With Thumb')
      .field('series_id', series.id)
      .field('upload_agreement', 'true')

    expect(createRes.status).toBe(201)
    const comic = createRes.body.data.comic
    expect(comic.thumbnailS3Key).toBeTruthy()
    expect(comic.thumbnailS3Url).toBeTruthy()

    // Patch with a new thumbnail file
    const thumb2 = Buffer.from([0xFF, 0xD8, 0xFF, 0xD9])
    const patchRes = await request(app)
      .patch(`/api/comics/${comic.id}`)
      .set('Authorization', `Bearer ${token}`)
      .attach('thumbnailUpload', thumb2, { filename: 'cover2.jpg', contentType: 'image/jpeg' })

    expect(patchRes.status).toBe(200)
    const updated = patchRes.body.data.comic
    expect(updated.thumbnailS3Key).toBeTruthy()
    expect(updated.thumbnailS3Url).toBeTruthy()
  }, 15000)
})
