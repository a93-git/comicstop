import request from 'supertest'
import path from 'path'
import fs from 'fs'

// Configure test env BEFORE importing the app
process.env.NODE_ENV = 'test'
process.env.DB_DIALECT = 'sqlite'
process.env.DB_STORAGE = ':memory:'

const { app } = await import('../src/app.js')
const { initializeDatabase } = await import('../src/config/database.js')

let authToken

beforeAll(async () => {
  await initializeDatabase()

  const email = `user_${Date.now()}@example.com`
  const signup = await request(app)
    .post('/api/auth/signup')
    .send({ username: 'picuser', emailOrPhone: email, password: 'StrongP@ssw0rd!', termsAccepted: true })
    .set('Accept', 'application/json')

  authToken = signup.body.data.token
})

describe('Profile picture upload', () => {
  it('defaults to no picture and allows uploading one', async () => {
    // Get profile and check no picture fields yet
    const prof = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)

    expect(prof.status).toBe(200)
    expect(prof.body.success).toBe(true)
    expect(prof.body.data.user.profilePictureS3Url || null).toBe(null)

    // Create a tiny fake image buffer
  const testDir = path.dirname(new URL(import.meta.url).pathname)
  const jpgPath = path.join(testDir, 'fixtures', 'tiny.jpg')
    // Ensure fixture exists or create a minimal buffer if not
    let filePath = jpgPath
    try {
      fs.accessSync(jpgPath)
    } catch {
  const buf = Buffer.from([0xff,0xd8,0xff,0xdb,0x00,0x43,0x00, /* minimal header */ 0xff,0xd9])
  const tmp = path.join(testDir, `tmp-${Date.now()}.jpg`)
      fs.writeFileSync(tmp, buf)
      filePath = tmp
    }

    const res = await request(app)
      .patch('/api/auth/profile/picture')
      .set('Authorization', `Bearer ${authToken}`)
      .attach('profilePicture', filePath)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data.user).toHaveProperty('profilePictureS3Url')
    expect(res.body.data.user.profilePictureS3Url).toMatch(/^https?:\/\//)
  })
})
