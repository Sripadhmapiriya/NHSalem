import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Copy binary assets using Vite configuration load hook
try {
  const artifactDir = 'C:/Users/Windows/.gemini/antigravity-ide/brain/1837ec1b-1e15-4da5-900d-83b965469dbd'
  const currentConversationDir = 'C:/Users/Windows/.gemini/antigravity-ide/brain/68def2a0-c25b-42a3-9f17-1235d1d4be8d'
  const publicDir = 'd:/artiowings/NHSalem/frontend/public'
  const crabsDir = 'd:/artiowings/NHSalem/frontend/public/images/crabs'
  
  const lobsterDir = 'd:/artiowings/NHSalem/frontend/public/images/lobster'
  
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true })
  }
  if (!fs.existsSync(crabsDir)) {
    fs.mkdirSync(crabsDir, { recursive: true })
  }
  if (!fs.existsSync(lobsterDir)) {
    fs.mkdirSync(lobsterDir, { recursive: true })
  }
  
  fs.copyFileSync(path.join(currentConversationDir, 'media__1783946179032.jpg'), path.join(publicDir, 'crest.jpg'))
  fs.copyFileSync(path.join(artifactDir, 'media__1783751060566.jpg'), path.join(publicDir, 'poster.jpg'))
  fs.copyFileSync(path.join(currentConversationDir, 'transparent_logo_1783946595114.png'), path.join(publicDir, 'crest.png'))

  const crabFileMap = {
    'media__1783943803798.png': 'soft-shell-mangrove-crab.png',
    'media__1783943819455.png': 'lagoon-mud-crab.png',
    'media__1783943853908.png': 'red-claw-rock-crab.png',
    'media__1783943866537.png': 'three-spot-crab.png',
    'media__1783943888122.jpg': 'blue-swimmer-crab.jpg'
  }

  for (const [srcName, destName] of Object.entries(crabFileMap)) {
    const srcPath = path.join(currentConversationDir, srcName)
    const destPath = path.join(crabsDir, destName)
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
    }
  }

  const lobsterFileMap = {
    'media__1783943932967.png': 'spiny-lobster-tails.png',
    'media__1783943950951.png': 'tiger-rock-lobster.png',
    'media__1783943959760.png': 'whole-rock-lobster.png',
    'media__1783943978957.png': 'bamboo-rock-lobster.png',
    'media__1783943993347.png': 'premium-sand-lobster.png'
  }

  for (const [srcName, destName] of Object.entries(lobsterFileMap)) {
    const srcPath = path.join(currentConversationDir, srcName)
    const destPath = path.join(lobsterDir, destName)
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
    }
  }

  const dryFishDir = 'd:/artiowings/NHSalem/frontend/public/images/dry-fish'
  if (!fs.existsSync(dryFishDir)) {
    fs.mkdirSync(dryFishDir, { recursive: true })
  }

  const dryFishFileMap = {
    'media__1783944302940.jpg': 'premium-dried-sardines.jpg',
    'media__1783944314745.jpg': 'premium-dried-anchovies.jpg',
    'media__1783944331001.png': 'premium-dried-seerfish-heads.png',
    'media__1783944342056.png': 'traditional-dried-mackerel.png'
  }

  for (const [srcName, destName] of Object.entries(dryFishFileMap)) {
    const srcPath = path.join(currentConversationDir, srcName)
    const destPath = path.join(dryFishDir, destName)
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, destPath)
    }
  }

  console.log('Successfully copied crest.jpg, crest.png, poster.jpg, crab, lobster, and dry fish images to public directory!')
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

