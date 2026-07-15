import { execSync } from 'child_process'
import { existsSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync, statSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const rootDir = join(__dirname, '..')

// 环境变量（带默认值）
const DATA_REPO_TOKEN = process.env.DATA_REPO_TOKEN
const DATA_REPO_PATH = process.env.DATA_REPO_PATH || 'nuyue/MoonShadow-Data'
// 默认合并模式为 true，设置 false 则不合并
const DATA_ARTICLES_MERGE = process.env.DATA_ARTICLES_MERGE !== 'false'
const DATA_MUSIC_MERGE = process.env.DATA_MUSIC_MERGE !== 'false'
const DATA_LINKS_MERGE = process.env.DATA_LINKS_MERGE !== 'false'
const DATA_TOOLS_MERGE = process.env.DATA_TOOLS_MERGE !== 'false'

// 调试日志
console.log('所有环境变量:')
Object.keys(process.env).filter(k => k.startsWith('DATA_')).forEach(k => {
  console.log(`  ${k} = "${process.env[k]}"`)
})
console.log('环境变量原始值:')
console.log(`  DATA_ARTICLES_MERGE = "${process.env.DATA_ARTICLES_MERGE}"`)
console.log(`  DATA_MUSIC_MERGE = "${process.env.DATA_MUSIC_MERGE}"`)
console.log(`  DATA_LINKS_MERGE = "${process.env.DATA_LINKS_MERGE}"`)
console.log(`  DATA_TOOLS_MERGE = "${process.env.DATA_TOOLS_MERGE}"`)
console.log('环境变量解析结果:')
console.log(`  articles=${DATA_ARTICLES_MERGE}, music=${DATA_MUSIC_MERGE}, links=${DATA_LINKS_MERGE}, tools=${DATA_TOOLS_MERGE}`)

// 检查是否配置了私有仓库 token
if (!DATA_REPO_TOKEN) {
  console.log('未配置 DATA_REPO_TOKEN，跳过私有数据拉取')
  process.exit(0)
}

console.log('开始从私有仓库拉取数据...')
console.log(`数据仓库: ${DATA_REPO_PATH}`)
console.log(`合并模式: articles=${DATA_ARTICLES_MERGE}, music=${DATA_MUSIC_MERGE}, links=${DATA_LINKS_MERGE}, tools=${DATA_TOOLS_MERGE}`)

// 创建临时目录
const tempDir = join(rootDir, '.temp-data')
if (existsSync(tempDir)) {
  rmSync(tempDir, { recursive: true })
}
mkdirSync(tempDir, { recursive: true })

// 克隆私有仓库
try {
  const repoUrl = `https://${DATA_REPO_TOKEN}@github.com/${DATA_REPO_PATH}.git`
  execSync(`git clone --depth 1 "${repoUrl}" "${tempDir}"`, {
    stdio: 'inherit',
    env: { ...process.env, GIT_TERMINAL_PROMPT: '0' }
  })
  console.log('私有仓库克隆成功')
} catch (error) {
  console.error('克隆私有仓库失败:', error.message)
  process.exit(1)
}

// 合并数据函数
function mergeData(sourcePath, targetPath, merge = true) {
  if (!existsSync(sourcePath)) {
    console.log(`源路径不存在: ${sourcePath}`)
    return
  }

  if (!merge) {
    // 完全覆盖模式：先删除目标目录
    if (existsSync(targetPath)) {
      if (statSync(targetPath).isDirectory()) {
        rmSync(targetPath, { recursive: true })
      } else {
        rmSync(targetPath)
      }
    }
  }

  // 确保目标目录存在
  const targetDir = statSync(sourcePath).isDirectory() ? targetPath : dirname(targetPath)
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true })
  }

  // 复制文件或目录
  if (statSync(sourcePath).isDirectory()) {
    if (!merge && !existsSync(targetPath)) {
      mkdirSync(targetPath, { recursive: true })
    }
    
    const items = readdirSync(sourcePath)
    for (const item of items) {
      const srcItem = join(sourcePath, item)
      const tgtItem = join(targetPath, item)
      
      if (statSync(srcItem).isDirectory()) {
        mergeData(srcItem, tgtItem, merge)
      } else {
        if (!merge && existsSync(tgtItem)) {
          rmSync(tgtItem)
        }
        if (merge || !existsSync(tgtItem)) {
          const content = readFileSync(srcItem)
          writeFileSync(tgtItem, content)
        }
      }
    }
  } else {
    if (!merge && existsSync(targetPath)) {
      rmSync(targetPath)
    }
    const content = readFileSync(sourcePath)
    writeFileSync(targetPath, content)
  }
}

// 合并 JSON 文件（去重）
function mergeJsonFile(sourceFile, targetFile, keyField = null) {
  if (!existsSync(sourceFile)) {
    console.log(`源文件不存在: ${sourceFile}`)
    return
  }

  const sourceData = JSON.parse(readFileSync(sourceFile, 'utf-8'))
  
  if (!existsSync(targetFile)) {
    writeFileSync(targetFile, JSON.stringify(sourceData, null, 2))
    console.log(`创建文件: ${targetFile}`)
    return
  }

  const targetData = JSON.parse(readFileSync(targetFile, 'utf-8'))

  if (Array.isArray(sourceData) && Array.isArray(targetData)) {
    if (keyField) {
      // 按 keyField 去重合并
      const merged = [...targetData]
      for (const item of sourceData) {
        if (!merged.find(i => i[keyField] === item[keyField])) {
          merged.push(item)
        }
      }
      writeFileSync(targetFile, JSON.stringify(merged, null, 2))
    } else {
      // 直接合并数组
      writeFileSync(targetFile, JSON.stringify([...targetData, ...sourceData], null, 2))
    }
  } else {
    // 对象合并
    writeFileSync(targetFile, JSON.stringify({ ...targetData, ...sourceData }, null, 2))
  }
  console.log(`合并文件: ${targetFile}`)
}

// 处理文章数据
console.log('\n处理文章数据...')
if (DATA_ARTICLES_MERGE) {
  mergeData(join(tempDir, 'articles'), join(rootDir, 'articles'), true)
} else {
  // 完全覆盖：先清空目标目录
  if (existsSync(join(rootDir, 'articles'))) {
    rmSync(join(rootDir, 'articles'), { recursive: true })
  }
  mergeData(join(tempDir, 'articles'), join(rootDir, 'articles'), false)
}

// 处理音乐文件
console.log('\n处理音乐文件...')
if (DATA_MUSIC_MERGE) {
  mergeData(join(tempDir, 'music'), join(rootDir, 'music'), true)
} else {
  if (existsSync(join(rootDir, 'music'))) {
    rmSync(join(rootDir, 'music'), { recursive: true })
  }
  mergeData(join(tempDir, 'music'), join(rootDir, 'music'), false)
}

// 处理音乐配置
console.log('\n处理音乐配置...')
if (existsSync(join(tempDir, 'music.json'))) {
  if (DATA_MUSIC_MERGE) {
    const sourceConfig = JSON.parse(readFileSync(join(tempDir, 'music.json'), 'utf-8'))
    const targetPath = join(rootDir, 'src/data/music.json')
    
    if (existsSync(targetPath)) {
      const targetConfig = JSON.parse(readFileSync(targetPath, 'utf-8'))
      // 合并配置
      const merged = {
        autoPlay: sourceConfig.autoPlay ?? targetConfig.autoPlay ?? false,
        defaultVolume: sourceConfig.defaultVolume ?? targetConfig.defaultVolume ?? 50,
        defaultMode: sourceConfig.defaultMode ?? targetConfig.defaultMode ?? 'loop',
        songs: [...(targetConfig.songs || []), ...(sourceConfig.songs || [])].filter((song, index, self) => 
          index === self.findIndex(s => s.id === song.id)
        )
      }
      writeFileSync(targetPath, JSON.stringify(merged, null, 2))
    } else {
      mkdirSync(dirname(targetPath), { recursive: true })
      writeFileSync(targetPath, JSON.stringify(sourceConfig, null, 2))
    }
    console.log(`合并配置: ${targetPath}`)
  } else {
    mergeData(join(tempDir, 'music.json'), join(rootDir, 'src/data/music.json'), false)
  }
}

// 处理友链数据
console.log('\n处理友链数据...')
if (existsSync(join(tempDir, 'links.json'))) {
  if (DATA_LINKS_MERGE) {
    mergeJsonFile(join(tempDir, 'links.json'), join(rootDir, 'src/data/links.json'), 'name')
  } else {
    mergeData(join(tempDir, 'links.json'), join(rootDir, 'src/data/links.json'), false)
  }
}

// 处理工具数据
console.log('\n处理工具数据...')
if (existsSync(join(tempDir, 'tools.json'))) {
  if (DATA_TOOLS_MERGE) {
    mergeJsonFile(join(tempDir, 'tools.json'), join(rootDir, 'src/data/tools.json'), 'id')
  } else {
    mergeData(join(tempDir, 'tools.json'), join(rootDir, 'src/data/tools.json'), false)
  }
}

// 处理工具组件
console.log('\n处理工具组件...')
if (existsSync(join(tempDir, 'tools'))) {
  if (DATA_TOOLS_MERGE) {
    mergeData(join(tempDir, 'tools'), join(rootDir, 'src/pages/tools'), true)
  } else {
    if (existsSync(join(rootDir, 'src/pages/tools'))) {
      rmSync(join(rootDir, 'src/pages/tools'), { recursive: true })
    }
    mergeData(join(tempDir, 'tools'), join(rootDir, 'src/pages/tools'), false)
  }
}

// 清理临时目录
console.log('\n清理临时目录...')
rmSync(tempDir, { recursive: true })

console.log('\n✅ 私有数据拉取完成！')
