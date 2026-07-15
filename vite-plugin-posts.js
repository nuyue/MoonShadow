import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { marked } from 'marked'

/**
 * Vite 插件：构建时解析 articles/ 目录下的 Markdown 文件
 * 生成虚拟模块 virtual:posts-data，包含所有文章数据
 * 同时解析 music/ 目录下的音乐文件
 * 支持从 JSON 文件加载友链和工具数据
 */
export default function postsPlugin() {
  const virtualModuleId = 'virtual:posts-data'
  const resolvedVirtualModuleId = '\0' + virtualModuleId
  
  let postsData = []
  let categories = []
  let tags = []
  let musicList = []
  let linksData = []
  let toolsData = []

  function parsePosts() {
    const postsDir = path.resolve(process.cwd(), 'articles')
    
    if (!fs.existsSync(postsDir)) {
      console.warn('articles/ directory not found')
      return
    }

    const posts = []
    const categoryMap = new Map()
    const tagSet = new Set()

    // 递归查找所有文章文件
    function findMarkdownFiles(dir) {
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      
      // 按文件夹分组
      const folders = entries.filter(e => e.isDirectory())
      const files = entries.filter(e => e.isFile())
      
      // 处理当前目录的文件
      const indexZh = files.find(f => f.name === 'index.zh.md')
      const indexEn = files.find(f => f.name === 'index.en.md')
      const indexDefault = files.find(f => f.name === 'index.md')
      
      if (indexZh || indexEn || indexDefault) {
        const basePath = dir
        const slug = path.basename(basePath)
        
        // 解析各语言版本
        const contentZh = indexZh ? parseMarkdownFile(path.join(basePath, 'index.zh.md')) : null
        const contentEn = indexEn ? parseMarkdownFile(path.join(basePath, 'index.en.md')) : null
        const contentDefault = indexDefault ? parseMarkdownFile(path.join(basePath, 'index.md')) : null
        
        // 合并 front matter
        const fm = contentZh?.data || contentEn?.data || contentDefault?.data || {}
        
        // 标题处理（支持多语言）
        let title
        if (typeof fm.title === 'object' && fm.title !== null) {
          title = {
            zh: fm.title.zh || contentZh?.data?.title || 'Untitled',
            en: fm.title.en || contentEn?.data?.title || 'Untitled'
          }
        } else {
          title = {
            zh: contentZh?.data?.title || fm.title || 'Untitled',
            en: contentEn?.data?.title || fm.title || 'Untitled'
          }
        }
        
        // 描述处理（支持多语言）
        let description
        if (typeof fm.description === 'object' && fm.description !== null) {
          description = {
            zh: fm.description.zh || contentZh?.data?.description || '',
            en: fm.description.en || contentEn?.data?.description || ''
          }
        } else {
          description = {
            zh: contentZh?.data?.description || fm.description || '',
            en: contentEn?.data?.description || fm.description || ''
          }
        }
        
        posts.push({
          slug,
          title,
          description,
          date: fm.date || new Date().toISOString().split('T')[0],
          categories: fm.categories || [],
          tags: fm.tags || [],
          cover: fm.cover || null,
          top: fm.top || 0,
          comments: fm.comments ?? true,
          content: {
            zh: contentZh?.html || contentDefault?.html || '',
            en: contentEn?.html || contentDefault?.html || ''
          },
          readingTime: {
            zh: contentZh?.readingTime || contentDefault?.readingTime || 1,
            en: contentEn?.readingTime || contentDefault?.readingTime || 1
          }
        })
        
        // 收集分类
        for (const cat of (fm.categories || [])) {
          const id = cat.toLowerCase().trim()
          if (!categoryMap.has(id)) {
            categoryMap.set(id, {
              id,
              name: cat,
              count: 0
            })
          }
          categoryMap.get(id).count++
        }
        
        // 收集标签
        for (const tag of (fm.tags || [])) {
          tagSet.add(tag.toLowerCase().trim())
        }
      }
      
      // 递归处理子目录
      for (const folder of folders) {
        findMarkdownFiles(path.join(dir, folder.name))
      }
    }
    
    function parseMarkdownFile(filePath) {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = matter(fileContent)
      const htmlContent = marked(content)
      const words = content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length
      const readingTime = Math.max(1, Math.ceil(words / 200))
      return { data, html: htmlContent, readingTime }
    }

    findMarkdownFiles(postsDir)

    // 按置顶和日期排序
    posts.sort((a, b) => {
      const topDiff = (b.top || 0) - (a.top || 0)
      if (topDiff !== 0) return topDiff
      return new Date(b.date) - new Date(a.date)
    })

    postsData = posts
    categories = Array.from(categoryMap.values())
    tags = Array.from(tagSet).map(tag => ({
      id: tag,
      name: tag,
      count: posts.filter(p => p.tags.map(t => t.toLowerCase()).includes(tag)).length
    }))
  }

  function parseMusic() {
    const musicDir = path.resolve(process.cwd(), 'music')
    const musicConfigPath = path.resolve(process.cwd(), 'src/data/music.json')
    
    // 默认配置
    let config = {
      autoPlay: false,
      defaultVolume: 50,
      defaultMode: 'loop',
      songs: []
    }
    
    // 读取配置文件
    if (fs.existsSync(musicConfigPath)) {
      try {
        const configContent = fs.readFileSync(musicConfigPath, 'utf-8')
        config = { ...config, ...JSON.parse(configContent) }
      } catch (e) {
        console.warn('Failed to parse music.json:', e.message)
      }
    }
    
    if (!fs.existsSync(musicDir)) {
      musicList = { ...config, songs: [] }
      return
    }

    const songs = []
    const entries = fs.readdirSync(musicDir, { withFileTypes: true })
    
    // 如果有配置的歌曲列表，使用配置
    if (config.songs && config.songs.length > 0) {
      for (const song of config.songs) {
        const filePath = path.join(musicDir, song.file)
        if (fs.existsSync(filePath)) {
          // 查找歌词
          let lyrics = null
          if (song.lrc) {
            const lrcPath = path.join(musicDir, song.lrc)
            if (fs.existsSync(lrcPath)) {
              lyrics = fs.readFileSync(lrcPath, 'utf-8')
            }
          } else {
            const baseName = song.file.replace(/\.[^/.]+$/, '')
            const lrcPath = path.join(musicDir, baseName + '.lrc')
            if (fs.existsSync(lrcPath)) {
              lyrics = fs.readFileSync(lrcPath, 'utf-8')
            }
          }
          
          songs.push({
            id: song.id || song.file.toLowerCase().replace(/\s+/g, '-'),
            title: song.title || song.file.replace(/\.[^/.]+$/, ''),
            artist: song.artist || 'Unknown',
            url: `/music/${song.file}`,
            lyrics
          })
        }
      }
    } else {
      // 没有配置则扫描目录
      for (const entry of entries) {
        if (entry.isFile() && /\.(mp3|wav|ogg|flac|m4a)$/i.test(entry.name)) {
          const fileName = entry.name
          const baseName = fileName.replace(/\.[^/.]+$/, '')
          
          const lrcPath = path.join(musicDir, baseName + '.lrc')
          let lyrics = null
          
          if (fs.existsSync(lrcPath)) {
            lyrics = fs.readFileSync(lrcPath, 'utf-8')
          }
          
          songs.push({
            id: baseName.toLowerCase().replace(/\s+/g, '-'),
            title: baseName,
            artist: 'Unknown',
            url: `/music/${fileName}`,
            lyrics
          })
        }
      }
    }

    musicList = {
      autoPlay: config.autoPlay,
      defaultVolume: config.defaultVolume,
      defaultMode: config.defaultMode,
      songs
    }
  }

  function parseLinks() {
    const linksPath = path.resolve(process.cwd(), 'src/data/links.json')
    
    if (fs.existsSync(linksPath)) {
      try {
        const content = fs.readFileSync(linksPath, 'utf-8')
        linksData = JSON.parse(content)
      } catch (e) {
        console.warn('Failed to parse links.json:', e.message)
        linksData = []
      }
    } else {
      linksData = []
    }
  }

  function parseTools() {
    const toolsPath = path.resolve(process.cwd(), 'src/data/tools.json')
    
    if (fs.existsSync(toolsPath)) {
      try {
        const content = fs.readFileSync(toolsPath, 'utf-8')
        toolsData = JSON.parse(content)
      } catch (e) {
        console.warn('Failed to parse tools.json:', e.message)
        toolsData = []
      }
    } else {
      toolsData = []
    }
  }

  return {
    name: 'vite-plugin-posts',
    
    enforce: 'pre',
    
    buildStart() {
      parsePosts()
      parseMusic()
      parseLinks()
      parseTools()
    },
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId
      }
    },
    
    load(id) {
      if (id === resolvedVirtualModuleId) {
        // 生成虚拟模块，导出文章数据、音乐列表、友链和工具
        return `export const posts = ${JSON.stringify(postsData, null, 2)};
export const categories = ${JSON.stringify(categories, null, 2)};
export const tags = ${JSON.stringify(tags, null, 2)};
export const allTags = ${JSON.stringify(tags.map(t => t.id), null, 2)};
export const musicList = ${JSON.stringify(musicList, null, 2)};
export const linksData = ${JSON.stringify(linksData, null, 2)};
export const toolsData = ${JSON.stringify(toolsData, null, 2)};`
      }
    },
    
    // 开发模式下监听文件变化
    configureServer(server) {
      const postsDir = path.resolve(process.cwd(), 'articles')
      const musicDir = path.resolve(process.cwd(), 'music')
      
      server.watcher.add(postsDir)
      if (fs.existsSync(musicDir)) {
        server.watcher.add(musicDir)
      }
      
      server.watcher.on('add', (file) => {
        if (file.endsWith('.md')) {
          parsePosts()
          server.moduleGraph.invalidateModule(
            server.moduleGraph.getModuleById(resolvedVirtualModuleId)
          )
          server.ws.send({ type: 'full-reload' })
        }
        if (/\.(mp3|wav|ogg|flac|m4a|lrc)$/i.test(file)) {
          parseMusic()
          server.moduleGraph.invalidateModule(
            server.moduleGraph.getModuleById(resolvedVirtualModuleId)
          )
          server.ws.send({ type: 'full-reload' })
        }
      })
      
      server.watcher.on('change', (file) => {
        if (file.endsWith('.md')) {
          parsePosts()
          server.moduleGraph.invalidateModule(
            server.moduleGraph.getModuleById(resolvedVirtualModuleId)
          )
          server.ws.send({ type: 'full-reload' })
        }
        if (/\.(mp3|wav|ogg|flac|m4a|lrc)$/i.test(file)) {
          parseMusic()
          server.moduleGraph.invalidateModule(
            server.moduleGraph.getModuleById(resolvedVirtualModuleId)
          )
          server.ws.send({ type: 'full-reload' })
        }
      })
      
      server.watcher.on('unlink', (file) => {
        if (file.endsWith('.md')) {
          parsePosts()
          server.moduleGraph.invalidateModule(
            server.moduleGraph.getModuleById(resolvedVirtualModuleId)
          )
          server.ws.send({ type: 'full-reload' })
        }
        if (/\.(mp3|wav|ogg|flac|m4a|lrc)$/i.test(file)) {
          parseMusic()
          server.moduleGraph.invalidateModule(
            server.moduleGraph.getModuleById(resolvedVirtualModuleId)
          )
          server.ws.send({ type: 'full-reload' })
        }
      })
    }
  }
}
