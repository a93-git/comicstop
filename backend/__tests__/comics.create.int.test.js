import request from 'supertest'

// Configure test env BEFORE importing the app
process.env.NODE_ENV = 'test'
process.env.DB_DIALECT = 'sqlite'
process.env.DB_STORAGE = ':memory:'

const { app } = await import('../src/app.js')
const { initializeDatabase } = await import('../src/config/database.js')
const { Comic, ComicContributor } = await import('../src/models/index.js')

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

describe('Comics create + preview + patch API', () => {
  it('creates a comic from multi-image upload, previews, and publishes', async () => {
    const token = await makeUser()

    // Create a series via API to ensure creatorId is set
    const seriesRes = await request(app)
      .post('/api/series')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'My Series')
    expect(seriesRes.status).toBe(201)
    const series = seriesRes.body.data.series

    // Upload two images to get page_order
    const img1 = Buffer.from([0xFF, 0xD8, 0xFF, 0xD9])
    const img2 = Buffer.from([0xFF, 0xD8, 0xFF, 0xD9])
    const up = await request(app)
      .post('/api/comics/upload')
      .set('Authorization', `Bearer ${token}`)
      .set('x-upload-multiple', 'true')
      .attach('files', img1, { filename: 'page-002.jpg', contentType: 'image/jpeg' })
      .attach('files', img2, { filename: 'page-001.jpg', contentType: 'image/jpeg' })
      .field('title', 'Ignored')

    expect(up.status).toBe(201)
    const { uploadId, pageOrder } = up.body.data
    expect(Array.isArray(pageOrder)).toBe(true)
    expect(pageOrder.length).toBe(2)

    // Create comic record using create endpoint
    const payload = {
      file_id: `imageset:${uploadId}`, // placeholder id to satisfy schema
      title: 'My New Comic',
      series_id: series.id,
      upload_agreement: true,
      page_order: pageOrder,
      contributors: [
        { role: 'writer', names: ['Alice'] },
        { role: 'artist', names: ['Bob', 'Carol'] },
      ],
      public: true,
      price: 0.0,
    }

    const createRes = await request(app)
      .post('/api/comics')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(createRes.status).toBe(201)
    expect(createRes.body.success).toBe(true)
    const created = createRes.body.data.comic
    expect(created.title).toBe('My New Comic')
    expect(created.status).toBe('draft')
    expect(Array.isArray(created.pageOrder)).toBe(true)
    expect(created.pageOrder.length).toBe(2)

    // Verify contributors persisted
    const dbComic = await Comic.findByPk(created.id)
    const contribs = await ComicContributor.findAll({ where: { comicId: dbComic.id } })
    const roles = contribs.map(c => c.role).sort()
    expect(roles).toEqual(['artist', 'writer'])

    // Preview (allowed only for drafts)
    const prev = await request(app)
      .get(`/api/comics/${created.id}/preview`)
      .set('Authorization', `Bearer ${token}`)
    expect(prev.status).toBe(200)
    expect(prev.body.data).toHaveProperty('pageOrder')
    expect(prev.body.data.pageOrder.length).toBe(2)

    // Publish via PATCH
    const patchRes = await request(app)
      .patch(`/api/comics/${created.id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'published', public: true })

    expect(patchRes.status).toBe(200)
    const updated = patchRes.body.data.comic
    expect(updated.status).toBe('published')
    expect(updated.publishStatus).toBe('published')
    expect(updated.publishedAt).toBeTruthy()
  })
})
