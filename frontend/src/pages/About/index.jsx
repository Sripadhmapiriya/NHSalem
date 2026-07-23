import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function AboutRedirect() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/', { replace: true })
    setTimeout(() => {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    }, 150)
  }, [navigate])
  return null
}
