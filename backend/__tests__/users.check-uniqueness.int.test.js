import request from 'supertest'

// Configure test env BEFORE importing the app
process.env.NODE_ENV = 'test'
process.env.DB_DIALECT = 'sqlite'
process.env.DB_STORAGE = ':memory:'

const { app } = await import('../src/app.js')
const { initializeDatabase } = await import('../src/config/database.js')

beforeAll(async () => {
  await initializeDatabase()
})

/**
 * Integration tests for users uniqueness check endpoints
 */
describe('Users uniqueness checks', () => {
  it('returns unique: true for fresh email/username/phone and false after signup', async () => {
    const email = `u${Date.now()}@example.com`
    const username = `user${Math.floor(Math.random()*100000)}`
    const isd = '+1'
    const phoneLocal = '5551234000'

    // Initially unique
    const e1 = await request(app).get('/api/users/check-email').query({ email })
    expect(e1.status).toBe(200)
    expect(e1.body?.data?.unique).toBe(true)

    const u1 = await request(app).get('/api/users/check-username').query({ username })
    expect(u1.status).toBe(200)
    expect(u1.body?.data?.unique).toBe(true)

    const p1 = await request(app).get('/api/users/check-phone').query({ isd_code: isd, phone: phoneLocal })
    expect(p1.status).toBe(200)
    expect(p1.body?.data?.unique).toBe(true)

    // Create account using email first
    const signupRes = await request(app)
      .post('/api/auth/signup')
      .send({ email, username, password: 'Password1!', termsAccepted: true })
    expect(signupRes.status).toBe(201)

    // email and username now not unique
    const e2 = await request(app).get('/api/users/check-email').query({ email })
    expect(e2.status).toBe(200)
    expect(e2.body?.data?.unique).toBe(false)

    const u2 = await request(app).get('/api/users/check-username').query({ username })
    expect(u2.status).toBe(200)
    expect(u2.body?.data?.unique).toBe(false)

    // phone still unique; update phone on profile then recheck
    const login = await request(app).post('/api/auth/login').send({ identifier: email, password: 'Password1!' })
    expect(login.status).toBe(200)
    const token = login.body?.data?.token
    expect(token).toBeTruthy()

    const updatePhone = await request(app)
      .patch('/api/auth/profile/phone')
      .set('Authorization', `Bearer ${token}`)
      .send({ phone: `${isd} ${phoneLocal}` })
    expect(updatePhone.status).toBe(200)

    const p2 = await request(app).get('/api/users/check-phone').query({ isd_code: isd, phone: phoneLocal })
    expect(p2.status).toBe(200)
    expect(p2.body?.data?.unique).toBe(false)
  })

  it('returns 400 for invalid inputs', async () => {
    const badEmail = await request(app).get('/api/users/check-email').query({ email: 'not-an-email' })
    expect(badEmail.status).toBe(400)

    const badUser = await request(app).get('/api/users/check-username').query({ username: 'x' })
    expect(badUser.status).toBe(400)

    const badPhone = await request(app).get('/api/users/check-phone').query({ isd_code: '+1', phone: '12' })
    expect(badPhone.status).toBe(400)
  })
})
