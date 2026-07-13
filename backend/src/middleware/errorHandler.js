import { ZodError } from 'zod'

export function errorHandler(err, req, res, next) {
  console.error('[Error Handler]:', err)

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: err.errors.map(e => ({
        field: e.path.join('.'),
        message: e.message
      }))
    })
  }

  const statusCode = err.status || 500
  const message = err.message || 'Internal server error'

  res.status(statusCode).json({
    success: false,
    message
  })
}

export default errorHandler
