import request from 'supertest'

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
    .send({ username: 'ProfUser', emailOrPhone: email, password: 'StrongP@ssw0rd!', termsAccepted: true })
    .set('Accept', 'application/json')

  authToken = signup.body.data.token
})

describe('Auth profile/settings endpoints', () => {
  it('GET /api/auth/profile returns current user', async () => {
    const res = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('user')
    expect(res.body.data.user).toHaveProperty('email')
  })

  it('GET /api/auth/settings returns settings object', async () => {
    const res = await request(app)
      .get('/api/auth/settings')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('settings')
    expect(res.body.data.settings).toHaveProperty('username')
  })

  it('POST /api/auth/creator-mode enables and disables creator flag', async () => {
    const enable = await request(app)
      .post('/api/auth/creator-mode')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ enable: true })

    expect(enable.status).toBe(200)
    expect(enable.body.success).toBe(true)
    expect(enable.body.data.user.isCreator).toBe(true)

    const disable = await request(app)
      .post('/api/auth/creator-mode')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ enable: false })

    expect(disable.status).toBe(200)
    expect(disable.body.success).toBe(true)
    expect(disable.body.data.user.isCreator).toBe(false)
  })

  it('DELETE /api/auth/me removes the account', async () => {
    const del = await request(app)
      .delete('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`)

    expect(del.status).toBe(200)
    expect(del.body.success).toBe(true)
    expect(del.body.data).toEqual(expect.objectContaining({ loggedOut: true }))
    // Afterwards, the old token should no longer grant access
    const profileAfter = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
    expect(profileAfter.status).toBe(401)
    expect(profileAfter.body.success).toBe(false)
  })
})
