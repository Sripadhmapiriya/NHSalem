import { verifyUserToken } from '../utils/jwt.js'

export function requireUser(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Authentication required' })
  }

  const token = authHeader.split(' ')[1]
  const payload = verifyUserToken(token)

  if (!payload) {
    return res.status(401).json({ success: false, message: 'Invalid or expired session' })
  }

  req.user = payload
  next()
}

export default requireUser
