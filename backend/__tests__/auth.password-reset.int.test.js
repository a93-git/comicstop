import request from 'supertest'

// Configure test env BEFORE importing the app
process.env.NODE_ENV = 'test'
process.env.DB_DIALECT = 'sqlite'
process.env.DB_STORAGE = ':memory:'

const { app } = await import('../src/app.js')
const { initializeDatabase } = await import('../src/config/database.js')
const { User } = await import('../src/models/index.js')

beforeAll(async () => {
  await initializeDatabase()
})

describe('Password reset flow', () => {
  const base = `${Date.now()}`
  const email = `reset_${base}@example.com`
  const username = `resetuser${base}`
  const password = 'OldP@ssw0rd!'

  it('signs up a user to reset', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username, emailOrPhone: email, password, termsAccepted: true })
      .set('Accept', 'application/json')
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })

  let token
  it('requests a reset token (exposed in test)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password')
      .send({ email })
      .set('Accept', 'application/json')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    // In test env, token is returned
    token = res.body.data?.token
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(10)
  })

  it('resets the password with a valid token and can login', async () => {
    const newPassword = 'NewP@ssw0rd!'
    const reset = await request(app)
      .post('/api/auth/reset-password')
      .send({ token, password: newPassword })
      .set('Accept', 'application/json')
    expect(reset.status).toBe(200)
    expect(reset.body.success).toBe(true)

    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: email, password: newPassword })
      .set('Accept', 'application/json')
    expect(login.status).toBe(200)
    expect(login.body.success).toBe(true)
    expect(login.body.data).toHaveProperty('token')
  })

  it('rejects invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: 'invalid-token', password: 'AnotherP@ss1' })
      .set('Accept', 'application/json')
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('rejects expired token', async () => {
    // Request a new token
    const email2 = `reset2_${base}@example.com`
  const username2 = `resetuser2${base}`
  await request(app).post('/api/auth/signup').send({ username: username2, emailOrPhone: email2, password: 'TempP@ss1', termsAccepted: true })
    const req2 = await request(app).post('/api/auth/forgot-password').send({ email: email2 })
    const token2 = req2.body.data?.token

    // Force expire it in DB
    const user = await User.findOne({ where: { email: email2 } })
    await user.update({ resetPasswordExpires: new Date(Date.now() - 1000) })

    const res = await request(app)
      .post('/api/auth/reset-password')
      .send({ token: token2, password: 'AnotherP@ss2' })
      .set('Accept', 'application/json')
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})
