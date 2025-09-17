import { User } from '../models/index.js'

const digitsOnly = (v) => String(v || '').replace(/\D+/g, '')

export const usersController = {
  async checkEmail(req, res) {
    const emailRaw = String(req.query.email || '').trim().toLowerCase()
    if (!emailRaw || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailRaw)) {
      return res.status(400).json({ success: false, message: 'Invalid email', data: { unique: false } })
    }
    const existing = await User.findOne({ where: { email: emailRaw } })
    return res.json({ success: true, data: { unique: !existing } })
  },

  async checkUsername(req, res) {
    const usernameRaw = String(req.query.username || '').trim().toLowerCase()
    if (!usernameRaw || usernameRaw.length < 3 || usernameRaw.length > 50 || /[^a-z0-9]/i.test(usernameRaw)) {
      return res.status(400).json({ success: false, message: 'Invalid username', data: { unique: false } })
    }
    const existing = await User.findOne({ where: { username: usernameRaw } })
    return res.json({ success: true, data: { unique: !existing } })
  },

  async checkPhone(req, res) {
    const isd = String(req.query.isd_code || '')
    const local = String(req.query.phone || '')
    const combined = digitsOnly(isd + local)
    if (!combined || combined.length < 7 || combined.length > 15) {
      return res.status(400).json({ success: false, message: 'Invalid phone', data: { unique: false } })
    }
    const existing = await User.findOne({ where: { phone: combined } })
    return res.json({ success: true, data: { unique: !existing } })
  },
}
