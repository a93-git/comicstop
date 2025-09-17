import request from 'supertest'

process.env.NODE_ENV = 'test'
process.env.DB_DIALECT = 'sqlite'
process.env.DB_STORAGE = ':memory:'

const { app } = await import('../src/app.js')
const { initializeDatabase } = await import('../src/config/database.js')

beforeAll(async () => {
  await initializeDatabase()
})

describe('Signup payload variations', () => {
  it('accepts new email-based payload', async () => {
    const base = Date.now()
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username: `newmail${base}`, email: `nm${base}@example.com`, password: 'StrongP@ss1', termsAccepted: true })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
    expect(res.body.data).toHaveProperty('token')
  })

  it('accepts new phone-based payload', async () => {
    const base = Date.now()
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username: `newphone${base}`, isd_code: '+1', phone_number: '5552003000', password: 'StrongP@ss1', termsAccepted: true })
    expect(res.status).toBe(201)
    expect(res.body.success).toBe(true)
  })

  it('rejects when both email and phone_number provided', async () => {
    const base = Date.now()
    const res = await request(app)
      .post('/api/auth/signup')
      .send({ username: `bad${base}`, email: `bad${base}@example.com`, isd_code: '+1', phone_number: '5552003000', password: 'StrongP@ss1', termsAccepted: true })
    expect(res.status).toBe(400)
    expect(res.body.success).toBe(false)
  })
})
