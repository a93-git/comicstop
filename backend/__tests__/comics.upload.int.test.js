import request from 'supertest'
import path from 'path'
import fs from 'fs'

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

describe('Comics upload API', () => {
  it('rejects missing file', async () => {
    const token = await makeUser()
    const res = await request(app)
      .post('/api/comics/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'No File')
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('rejects disallowed type', async () => {
    const token = await makeUser()
    const badBuf = Buffer.from('not a real exe')
    const res = await request(app)
      .post('/api/comics/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'Bad Type')
      .attach('comic', badBuf, { filename: 'malware.exe', contentType: 'application/octet-stream' })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('uploads a single PDF and returns comic metadata', async () => {
    const token = await makeUser()
    const pdfBuf = Buffer.from('%PDF-1.4\n%\xE2\xE3\xCF\xD3\n')
    const res = await request(app)
      .post('/api/comics/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('title', 'My PDF Comic')
      .attach('comic', pdfBuf, { filename: 'demo.pdf', contentType: 'application/pdf' })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('comic')
    const comic = res.body.data.comic
    expect(comic).toHaveProperty('s3Key')
    expect(comic).toHaveProperty('s3Url')
    expect(comic).toHaveProperty('fileName', 'demo.pdf')
  })

  it('uploads multiple images and returns uploadId + pageOrder', async () => {
    const token = await makeUser()
    const img1 = Buffer.from([0xFF, 0xD8, 0xFF, 0xD9]) // tiny jpeg
    const img2 = Buffer.from([0xFF, 0xD8, 0xFF, 0xD9]) // tiny jpeg

    const res = await request(app)
      .post('/api/comics/upload')
      .set('Authorization', `Bearer ${token}`)
      .set('x-upload-multiple', 'true')
      .attach('files', img1, { filename: 'page-002.jpg', contentType: 'image/jpeg' })
      .attach('files', img2, { filename: 'page-001.jpg', contentType: 'image/jpeg' })
      .field('title', 'Ignored for images')

    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('uploadId')
    expect(res.body.data).toHaveProperty('pageOrder')
    const { pageOrder, uploads } = res.body.data
    expect(Array.isArray(pageOrder)).toBe(true)
    expect(pageOrder.length).toBe(2)
    // ensure order follows filename numeric sort (001 before 002)
    const names = uploads.map(u => u.originalName)
    expect(names).toEqual(['page-001.jpg', 'page-002.jpg'])
  })
})
