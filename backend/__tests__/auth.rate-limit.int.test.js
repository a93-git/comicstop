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

describe('Auth rate limiting', () => {
  it('allows normal login attempts and blocks excessive ones', async () => {
    const email = `rl_${Date.now()}@example.com`
    const password = 'StrongP@ssw0rd!'
    const testKey = `login-${Date.now()}`

    await request(app)
      .post('/api/auth/signup')
      .set('X-Test-Key', testKey)
      .send({ username: `rl${Date.now()}`, emailOrPhone: email, password, termsAccepted: true })
      .expect(201)

    // 5 allowed attempts (including successful ones)
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/auth/login')
        .set('X-Test-Key', testKey)
        .send({ identifier: email, password })
      expect([200, 401]).toContain(res.status)
    }

    // 6th should be blocked with 429
    const blocked = await request(app)
      .post('/api/auth/login')
      .set('X-Test-Key', testKey)
      .send({ identifier: email, password })
    expect(blocked.status).toBe(429)
    expect(blocked.body).toEqual(expect.objectContaining({ success: false }))
  })

  it('limits forgot-password and signup endpoints', async () => {
    const base = `${Date.now()}`
    const email = `rl2_${base}@example.com`
    const testKeySignup = `signup-${base}`
    const testKeyForgot = `forgot-${base}`

    // Signup limiter allows 3 per hour; perform 3 normal attempts (only first should succeed, others 409 or 400), then 4th should be 429
    const s1 = await request(app)
      .post('/api/auth/signup')
      .set('X-Test-Key', testKeySignup)
      .send({ username: `rlu${base}`, emailOrPhone: email, password: 'StrongP@ssw0rd!', termsAccepted: true })
    expect([201, 400, 409]).toContain(s1.status)

    const s2 = await request(app)
      .post('/api/auth/signup')
      .set('X-Test-Key', testKeySignup)
      .send({ username: `rlu${base}`, emailOrPhone: email, password: 'StrongP@ssw0rd!', termsAccepted: true })
    expect([201, 400, 409]).toContain(s2.status)

    const s3 = await request(app)
      .post('/api/auth/signup')
      .set('X-Test-Key', testKeySignup)
      .send({ username: `rlu${base}`, emailOrPhone: email, password: 'StrongP@ssw0rd!', termsAccepted: true })
    expect([201, 400, 409]).toContain(s3.status)

    const s4 = await request(app)
      .post('/api/auth/signup')
      .set('X-Test-Key', testKeySignup)
      .send({ username: `rlu${base}`, emailOrPhone: email, password: 'StrongP@ssw0rd!', termsAccepted: true })
    expect(s4.status).toBe(429)

    // forgot-password limiter allows 3 requests per 30 minutes
    for (let i = 0; i < 3; i++) {
      const f = await request(app)
        .post('/api/auth/forgot-password')
        .set('X-Test-Key', testKeyForgot)
        .send({ email })
      expect(f.status).toBe(200)
    }
    const fBlocked = await request(app)
      .post('/api/auth/forgot-password')
      .set('X-Test-Key', testKeyForgot)
      .send({ email })
    expect(fBlocked.status).toBe(429)
  })
})
