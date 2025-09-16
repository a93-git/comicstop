import { jest } from '@jest/globals'
import { AuthController } from '../src/controllers/authController.js'

const mockRes = () => {
  const res = {}
  res.status = jest.fn().mockReturnValue(res)
  res.json = jest.fn().mockReturnValue(res)
  return res
}

describe('AuthController - unit', () => {
  it('logout returns success message', async () => {
    const req = {}
    const res = mockRes()

    await AuthController.logout(req, res)

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.',
    })
  })
})
