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

describe('Auth API', () => {
  it('responds to GET /api/health', async () => {
    const res = await request(app).get('/api/health')
    expect(res.status).toBe(200)
    expect(res.body).toHaveProperty('success', true)
  })

  it('can signup and login', async () => {
    const email = `user_${Date.now()}@example.com`

    const signup = await request(app)
      .post('/api/auth/signup')
      .send({ username: 'TestUser', emailOrPhone: email, password: 'StrongP@ssw0rd!', termsAccepted: true })
      .set('Accept', 'application/json')

    expect(signup.status).toBe(201)
    expect(signup.body.success).toBe(true)
    expect(signup.body.data).toHaveProperty('token')

    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: email, password: 'StrongP@ssw0rd!' })
      .set('Accept', 'application/json')

    expect(login.status).toBe(200)
    expect(login.body.success).toBe(true)
    expect(login.body.data).toHaveProperty('token')
  })

  it('allows login via username and phone', async () => {
    const base = `${Date.now()}`
    const email = `multi_${base}@example.com`
    const username = `multiuser${base}`
    const phone = '+1 (555) 222-3333'

    const signup = await request(app)
      .post('/api/auth/signup')
      // Sign up using the phone number to ensure phone is stored
      .send({ username, emailOrPhone: phone, password: 'StrongP@ssw0rd!', termsAccepted: true })
      .set('Accept', 'application/json')

    expect(signup.status).toBe(201)

    // Login with username
    const byUser = await request(app)
      .post('/api/auth/login')
      .send({ identifier: username, password: 'StrongP@ssw0rd!' })
      .set('Accept', 'application/json')
    expect(byUser.status).toBe(200)
    expect(byUser.body.success).toBe(true)

    // Login with phone (varied formatting)
    const byPhone = await request(app)
      .post('/api/auth/login')
      .send({ identifier: '1-555-222-3333', password: 'StrongP@ssw0rd!' })
      .set('Accept', 'application/json')
    expect(byPhone.status).toBe(200)
    expect(byPhone.body.success).toBe(true)
  })

  it('prevents duplicate email/username/phone on signup', async () => {
    const base = `${Date.now()}`
    const email = `dup_${base}@example.com`
    const phone = '1-555-001-0001'

    // initial signup (email)
    const first = await request(app)
      .post('/api/auth/signup')
      .send({ username: `user${base}`, emailOrPhone: email, password: 'StrongP@ssw0rd!', termsAccepted: true })
      .set('Accept', 'application/json')
    expect(first.status).toBe(201)

    // duplicate email (different case)
    const dupEmail = await request(app)
      .post('/api/auth/signup')
      .send({ username: `user${base}b`, emailOrPhone: email.toUpperCase(), password: 'StrongP@ssw0rd!', termsAccepted: true })
      .set('Accept', 'application/json')
    expect(dupEmail.status).toBe(409)
    expect(dupEmail.body.success).toBe(false)

    // duplicate username (different case)
    const dupUser = await request(app)
      .post('/api/auth/signup')
      .send({ username: `USER${base}`, emailOrPhone: `other_${base}@example.com`, password: 'StrongP@ssw0rd!', termsAccepted: true })
      .set('Accept', 'application/json')
    expect(dupUser.status).toBe(409)
    expect(dupUser.body.success).toBe(false)

    // create a user with a phone number
    const withPhone = await request(app)
      .post('/api/auth/signup')
      .send({ username: `user${base}c`, emailOrPhone: phone, password: 'StrongP@ssw0rd!', termsAccepted: true })
      .set('Accept', 'application/json')
    expect(withPhone.status).toBe(201)

    // duplicate phone (normalized digits)
    const dupPhone = await request(app)
      .post('/api/auth/signup')
      .send({ username: `user${base}d`, emailOrPhone: '15550010001', password: 'StrongP@ssw0rd!', termsAccepted: true })
      .set('Accept', 'application/json')
    expect(dupPhone.status).toBe(409)
    expect(dupPhone.body.success).toBe(false)
  })
})
