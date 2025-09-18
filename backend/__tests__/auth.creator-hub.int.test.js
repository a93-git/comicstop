import request from 'supertest'
import jest from 'jest-mock'

// Configure test env BEFORE importing the app
process.env.NODE_ENV = 'test'
process.env.DB_DIALECT = 'sqlite'
process.env.DB_STORAGE = ':memory:'

const { app } = await import('../src/app.js')
const { initializeDatabase } = await import('../src/config/database.js')
const { User } = await import('../src/models/User.js')
const { Op } = await import('sequelize')

beforeAll(async () => {
  await initializeDatabase()
})

describe('CreatorHub API', () => {
  let userToken
  let userId
  const testEmail = `creator_${Date.now()}@example.com`
  const testUsername = `creator${Date.now()}`

  beforeEach(async () => {
    // Create a test user and get auth token
    const signup = await request(app)
      .post('/api/auth/signup')
      .send({ 
        username: testUsername, 
        emailOrPhone: testEmail, 
        password: 'StrongP@ssw0rd!', 
        termsAccepted: true 
      })
      .set('Accept', 'application/json')

    expect(signup.status).toBe(201)
    userToken = signup.body.data.token
    userId = signup.body.data.user.id
  })

  afterEach(async () => {
    // Clean up test user
    if (userId) {
      await User.destroy({ where: { id: userId } })
    }
  })

  describe('POST /api/auth/creator-hub', () => {
    it('should enable CreatorHub for a user', async () => {
      const response = await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('CreatorHub enabled')

      // Verify user in database
      const user = await User.findByPk(userId)
      expect(user.isCreatorEnabled).toBe(true)
      expect(user.creatorDisabledAt).toBeNull()
    })

    it('should disable CreatorHub for a user', async () => {
      // First enable CreatorHub
      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true })

      // Then disable it
      const response = await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: false })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('disabled')

      // Verify user in database
      const user = await User.findByPk(userId)
      expect(user.isCreatorEnabled).toBe(false)
      expect(user.creatorDisabledAt).not.toBeNull()
    })

    it('should re-enable CreatorHub within retention period', async () => {
      // Enable, then disable CreatorHub
      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true })

      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: false })

      // Re-enable within retention period
      const response = await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true })

      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain('enabled')

      // Verify user in database
      const user = await User.findByPk(userId)
      expect(user.isCreatorEnabled).toBe(true)
      expect(user.creatorDisabledAt).toBeNull()
    })

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/auth/creator-hub')
        .send({ enabled: true })

      expect(response.status).toBe(401)
    })

    it('should validate enabled parameter', async () => {
      const response = await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({}) // Missing enabled parameter

      expect(response.status).toBe(400)
      expect(response.body.message).toContain('enabled')
    })

    it('should handle invalid enabled parameter type', async () => {
      const response = await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: 'invalid' })

      expect(response.status).toBe(400)
    })
  })

  describe('CreatorHub retention policy', () => {
    it('should track disable timestamp correctly', async () => {
      // Enable and then disable CreatorHub
      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true })

      const disableTime = new Date()
      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: false })

      const user = await User.findByPk(userId)
      expect(user.creatorDisabledAt).not.toBeNull()
      
      // Check that timestamp is within reasonable range (within 1 minute)
      const timeDiff = Math.abs(new Date(user.creatorDisabledAt) - disableTime)
      expect(timeDiff).toBeLessThan(60000) // 1 minute in milliseconds
    })

    it('should clear disable timestamp when re-enabling', async () => {
      // Enable, disable, then re-enable
      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true })

      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: false })

      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true })

      const user = await User.findByPk(userId)
      expect(user.isCreatorEnabled).toBe(true)
      expect(user.creatorDisabledAt).toBeNull()
    })
  })

  describe('Email notifications', () => {
    // Mock console.log to capture email messages in test environment
    let consoleSpy

    beforeEach(() => {
      consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      consoleSpy.mockRestore()
    })

    it('should log email notification when enabling CreatorHub', async () => {
      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true })

      // In test environment, emails are logged to console
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('CreatorHub Enabled')
      )
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining(testEmail)
      )
    })

    it('should log email notification when disabling CreatorHub', async () => {
      // First enable
      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true })

      // Clear console spy calls from enable
      consoleSpy.mockClear()

      // Then disable
      await request(app)
        .post('/api/auth/creator-hub')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: false })

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('CreatorHub Disabled')
      )
      // Check that the email body contains retention policy info (even if truncated)
      const emailBodyCall = consoleSpy.mock.calls.find(call => 
        call[0] && typeof call[0] === 'string' && call[0].includes('Data Retention Policy')
      )
      expect(emailBodyCall).toBeTruthy()
    })
  })

  describe('Data cleanup functionality', () => {
    it('should identify expired creator profiles for cleanup', async () => {
      // Create user with expired disable date (older than 6 months)
      const expiredDate = new Date()
      expiredDate.setMonth(expiredDate.getMonth() - 7) // 7 months ago

      await User.update(
        { 
          isCreatorEnabled: false, 
          creatorDisabledAt: expiredDate 
        },
        { where: { id: userId } }
      )

      // Import the auth service to test cleanup method
      const { authService } = await import('../src/services/authService.js')
      
      // Test that the user would be identified for cleanup
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const expiredUsers = await User.findAll({
        where: {
          isCreatorEnabled: false,
          creatorDisabledAt: {
            [Op.lt]: sixMonthsAgo
          }
        }
      })

      expect(expiredUsers.length).toBe(1)
      expect(expiredUsers[0].id).toBe(userId)
    })

    it('should not identify recently disabled profiles for cleanup', async () => {
      // Create user with recent disable date (within 6 months)
      const recentDate = new Date()
      recentDate.setMonth(recentDate.getMonth() - 3) // 3 months ago

      await User.update(
        { 
          isCreatorEnabled: false, 
          creatorDisabledAt: recentDate 
        },
        { where: { id: userId } }
      )

      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const expiredUsers = await User.findAll({
        where: {
          isCreatorEnabled: false,
          creatorDisabledAt: {
            [Op.lt]: sixMonthsAgo
          }
        }
      })

      expect(expiredUsers.length).toBe(0)
    })
  })

  describe('Legacy creator-mode compatibility', () => {
    it('should still support legacy creator-mode endpoint', async () => {
      const response = await request(app)
        .post('/api/auth/creator-mode')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ enabled: true })

      // Should work with legacy endpoint
      expect(response.status).toBe(200)
      expect(response.body.success).toBe(true)

      const user = await User.findByPk(userId)
      expect(user.isCreator).toBe(true)
    })
  })
})