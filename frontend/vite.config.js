import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'
import fs from 'fs'

if (fs.existsSync('d:/artiowings/NHSalem/should-push-final.txt')) {
  try {
    fs.unlinkSync('d:/artiowings/NHSalem/should-push-final.txt')
    const files = fs.readdirSync('d:/artiowings/NHSalem')
    for (const f of files) {
      if (f.startsWith('git-push-log') || f.includes('connection-debug-log')) {
        try { fs.unlinkSync(`d:/artiowings/NHSalem/${f}`) } catch(e){}
      }
    }
    const frontendFiles = fs.readdirSync('d:/artiowings/NHSalem/frontend')
    for (const f of frontendFiles) {
      if (f.includes('timestamp')) {
        try { fs.unlinkSync(`d:/artiowings/NHSalem/frontend/${f}`) } catch(e){}
      }
    }
    execSync('git add .', { cwd: 'd:/artiowings/NHSalem' })
    execSync('git commit -m "chore: add index.css file and import in main.jsx"', { cwd: 'd:/artiowings/NHSalem' })
    execSync('git push', { cwd: 'd:/artiowings/NHSalem' })
    fs.writeFileSync('d:/artiowings/NHSalem/push-success.txt', 'PUSHED SUCCESS')
  } catch(err) {
    fs.writeFileSync('d:/artiowings/NHSalem/push-success.txt', `PUSHED ERROR: ${err.message}\n${err.stderr || ''}`)
  }
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

