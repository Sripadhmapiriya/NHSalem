import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { execSync } from 'child_process'
import fs from 'fs'

try {
  const log = []
  const run = (cmd) => {
    log.push(`> ${cmd}`)
    try {
      const out = execSync(cmd, { cwd: 'd:/artiowings/NHSalem', encoding: 'utf8' })
      log.push(out)
      return true
    } catch (err) {
      log.push(`ERROR: ${err.message}`)
      if (err.stderr) log.push(err.stderr)
      return false
    }
  }

  run('git status')
  run('git add .')
  run('git commit -m "feat: integrate razorpay test mode, replace logo with transparent png, and compact navbar layout"')
  run('git status')
  fs.writeFileSync('d:/artiowings/NHSalem/git-push-log-2.txt', log.join('\n'))
} catch (globalErr) {
  fs.writeFileSync('d:/artiowings/NHSalem/git-push-log-2.txt', `GLOBAL ERROR: ${globalErr.message}`)
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

