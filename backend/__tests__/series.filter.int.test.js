import request from 'supertest'

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

describe('Series filtering API', () => {
  it('requires auth when user_id=current', async () => {
    const res = await request(app).get('/api/series?user_id=current')
    // Our global auth middleware returns 401 on missing token
    expect(res.status).toBe(401)
  })

  it('returns only current user series with id and name', async () => {
    const token1 = await makeUser()
    const token2 = await makeUser()

    // user1 creates two series
    const s1 = await request(app)
      .post('/api/series')
      .set('Authorization', `Bearer ${token1}`)
      .field('title', 'Alpha')
    expect(s1.status).toBe(201)
    const s2 = await request(app)
      .post('/api/series')
      .set('Authorization', `Bearer ${token1}`)
      .field('title', 'Beta')
    expect(s2.status).toBe(201)

    // user2 creates one series
    const s3 = await request(app)
      .post('/api/series')
      .set('Authorization', `Bearer ${token2}`)
      .field('title', 'Gamma')
    expect(s3.status).toBe(201)

    // Query with user1; expect only Alpha/Beta, minimal shape
    const list1 = await request(app)
      .get('/api/series?user_id=current')
      .set('Authorization', `Bearer ${token1}`)
    expect(list1.status).toBe(200)
    expect(Array.isArray(list1.body.data)).toBe(true)
    const names1 = list1.body.data.map(x => x.name).sort()
    expect(names1).toEqual(['Alpha','Beta'])
    list1.body.data.forEach(x => {
      expect(Object.keys(x).sort()).toEqual(['id','name'])
    })

    // Query with user2; expect only Gamma
    const list2 = await request(app)
      .get('/api/series?user_id=current')
      .set('Authorization', `Bearer ${token2}`)
    expect(list2.status).toBe(200)
    const names2 = list2.body.data.map(x => x.name)
    expect(names2).toEqual(['Gamma'])
  })
})
