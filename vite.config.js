import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import postsPlugin from './vite-plugin-posts'
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    postsPlugin(),
    {
      name: 'serve-music',
      configureServer(server) {
        server.middlewares.use('/music', (req, res, next) => {
          const filePath = path.resolve(process.cwd(), 'music', req.url.replace(/^\//, ''))
          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            res.setHeader('Content-Type', 'audio/mpeg')
            fs.createReadStream(filePath).pipe(res)
          } else {
            next()
          }
        })
      }
    },
    // 构建时复制 music 目录到 dist/music
    {
      name: 'copy-music',
      closeBundle() {
        const musicDir = path.resolve(process.cwd(), 'music')
        const distMusicDir = path.resolve(process.cwd(), 'dist', 'music')
        
        if (fs.existsSync(musicDir)) {
          // 创建目标目录
          if (!fs.existsSync(distMusicDir)) {
            fs.mkdirSync(distMusicDir, { recursive: true })
          }
          
          // 复制所有音乐文件
          const files = fs.readdirSync(musicDir)
          for (const file of files) {
            const srcPath = path.join(musicDir, file)
            const destPath = path.join(distMusicDir, file)
            if (fs.statSync(srcPath).isFile()) {
              fs.copyFileSync(srcPath, destPath)
              console.log(`Copied: ${file}`)
            }
          }
        }
      }
    }
  ],
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})