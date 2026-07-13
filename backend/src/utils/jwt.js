import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_user_secret'
const JWT_ADMIN_SECRET = process.env.JWT_ADMIN_SECRET || 'fallback_admin_secret'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export function generateUserToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, phone: user.phone },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function generateAdminToken(admin) {
  return jwt.sign(
    { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    JWT_ADMIN_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  )
}

export function verifyUserToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}

export function verifyAdminToken(token) {
  try {
    return jwt.verify(token, JWT_ADMIN_SECRET)
  } catch (err) {
    return null
  }
}
