import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Copy binary assets using Vite configuration load hook
try {
  const artifactDir = 'C:/Users/Windows/.gemini/antigravity-ide/brain/1837ec1b-1e15-4da5-900d-83b965469dbd'
  const publicDir = 'd:/artiowings/NHSalem/frontend/public'
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  
  fs.copyFileSync(path.join(artifactDir, 'media__1783751029845.jpg'), path.join(publicDir, 'crest.jpg'))
  fs.copyFileSync(path.join(artifactDir, 'media__1783751060566.jpg'), path.join(publicDir, 'poster.jpg'))
  console.log('Successfully copied crest.jpg and poster.jpg to public directory!')
} catch (err) {
  console.error('Failed to copy assets:', err)
}

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
})

