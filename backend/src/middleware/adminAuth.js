import { verifyAdminToken } from '../utils/jwt.js'

export function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Admin authentication required' })
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyAdminToken(token)

  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired admin session' })
  }

  req.admin = payload
  next()
}

export default requireAdmin
