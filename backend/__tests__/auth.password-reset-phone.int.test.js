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

describe('Password reset via phone PIN flow', () => {
  const base = `${Date.now()}`
  const phone = `+1 (555) 00${base.slice(-4)}`
  const username = `pinuser${base}`
  const email = `pin_${base}@example.com`
  const password = 'OldP@ssw0rd!'

  it('signs up a user with phone to reset', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username, emailOrPhone: phone, password, termsAccepted: true })
      .set('Accept', 'application/json')
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })

  let pin
  it('requests a PIN to phone (exposed in test)', async () => {
    const res = await request(app)
      .post('/api/auth/forgot-password/phone')
      .send({ phone })
      .set('Accept', 'application/json')
    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    pin = res.body.data?.pin
    expect(typeof pin).toBe('string')
    expect(pin).toHaveLength(6)
  })

  it('resets the password with a valid PIN and can login', async () => {
    const newPassword = 'NewP@ssw0rd!'
    const reset = await request(app)
      .post('/api/auth/reset-password/phone')
      .send({ phone, pin, password: newPassword })
      .set('Accept', 'application/json')
    expect(reset.status).toBe(200)
    expect(reset.body.success).toBe(true)

    const login = await request(app)
      .post('/api/auth/login')
      .send({ identifier: phone, password: newPassword })
      .set('Accept', 'application/json')
    expect(login.status).toBe(200)
    expect(login.body.success).toBe(true)
    expect(login.body.data).toHaveProperty('token')
  })

  it('rejects invalid PIN', async () => {
    const res = await request(app)
      .post('/api/auth/reset-password/phone')
      .send({ phone, pin: '000000', password: 'AnotherP@ss1' })
      .set('Accept', 'application/json')
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })

  it('rejects expired PIN', async () => {
    const phone2 = `+1 (555) 99${base.slice(-4)}`
    const username2 = `pinuser2${base}`
    await request(app).post('/api/auth/signup').send({ username: username2, emailOrPhone: phone2, password: 'TempP@ss1', termsAccepted: true })
    const req2 = await request(app).post('/api/auth/forgot-password/phone').send({ phone: phone2 })
    const { User } = await import('../src/models/index.js')
    const u = await User.findOne({ where: { phone: phone2.replace(/\D+/g, '') } })
    await u.update({ resetPinExpires: new Date(Date.now() - 1000) })
    const res = await request(app)
      .post('/api/auth/reset-password/phone')
      .send({ phone: phone2, pin: '123456', password: 'AnotherP@ss2' })
      .set('Accept', 'application/json')
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})
