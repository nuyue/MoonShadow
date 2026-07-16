import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useTheme, RADIUS, FONT } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import hljs from 'highlight.js'

// 从虚拟模块导入文章数据
import { posts } from 'virtual:posts-data'

function Article() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { theme, radius, font } = useTheme()
  const { lang, t } = useLang()
  const [isMobile, setIsMobile] = useState(false)

  // 查找当前文章
  const post = posts.find(p => p.slug === slug)
  
  // 获取当前语言的内容
  const getTitle = (post) => {
    if (typeof post.title === 'object') {
      return post.title[lang] || post.title.zh || post.title.en || 'Untitled'
    }
    return post.title || 'Untitled'
  }
  
  const getDescription = (post) => {
    if (typeof post.description === 'object') {
      return post.description[lang] || post.description.zh || post.description.en || ''
    }
    return post.description || ''
  }
  
  const getContent = (post) => {
    if (typeof post.content === 'object') {
      return post.content[lang] || post.content.zh || post.content.en || ''
    }
    return post.content || ''
  }
  
  const getReadingTime = (post) => {
    if (typeof post.readingTime === 'object') {
      return post.readingTime[lang] || post.readingTime.zh || post.readingTime.en || 1
    }
    return post.readingTime || 1
  }
  
  // 查找上一篇/下一篇
  const currentIndex = posts.findIndex(p => p.slug === slug)
  const prevPost = currentIndex > 0 ? posts[currentIndex - 1] : null
  const nextPost = currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 代码高亮和复制功能
  const contentRef = useRef(null)
  const { themeId } = useTheme()

  // 使用 highlight.js 处理代码块
  useEffect(() => {
    if (!post) return

    const timer = setTimeout(() => {
      if (!contentRef.current) return

      const preElements = contentRef.current.querySelectorAll('pre')
      
      preElements.forEach((pre) => {
        const code = pre.querySelector('code')
        if (!code) return

        // 获取语言
        const classList = code.className || ''
        const langMatch = classList.match(/language-(\w+)/)
        const lang = langMatch ? langMatch[1] : ''

        // 使用 highlight.js 高亮（只在首次或需要时）
        if (!code.dataset.highlighted) {
          if (lang && hljs.getLanguage(lang)) {
            code.innerHTML = hljs.highlight(code.textContent, { language: lang }).value
          } else {
            code.innerHTML = hljs.highlightAuto(code.textContent).value
          }
          code.dataset.highlighted = 'true'
        }

        // 添加语言标签
        if (!pre.querySelector('.code-lang-badge')) {
          const detectedLang = lang || (code.result?.language) || 'code'
          const badge = document.createElement('div')
          badge.className = 'code-lang-badge'
          badge.textContent = detectedLang
          pre.style.position = 'relative'
          pre.style.paddingTop = '40px'
          pre.insertBefore(badge, pre.firstChild)
        }

        // 检查是否已有复制按钮，如果有则先移除再重新创建（确保主题切换后正常）
        const existingBtn = pre.querySelector('.copy-button')
        if (existingBtn) {
          existingBtn.remove()
        }

        const copyBtn = document.createElement('button')
        copyBtn.className = 'copy-button'
        copyBtn.title = 'Copy code'
        copyBtn.innerHTML = `
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        `
        const originalIcon = copyBtn.innerHTML
        const originalTitle = 'Copy code'
        let copyTimeout = null
        let isHoveringButton = false
        
        // 恢复按钮原始状态的函数
        const resetButton = () => {
          // 如果鼠标还在按钮上，不恢复状态
          if (isHoveringButton) return
          copyBtn.classList.remove('copied')
          copyBtn.title = originalTitle
          copyBtn.innerHTML = originalIcon
          if (copyTimeout) {
            clearTimeout(copyTimeout)
            copyTimeout = null
          }
        }
        
        // 监听按钮的鼠标事件
        copyBtn.onmouseenter = () => { isHoveringButton = true }
        copyBtn.onmouseleave = () => { isHoveringButton = false; resetButton() }
        
        // 鼠标移出代码块时先隐藏再恢复状态
        pre.onmouseleave = () => {
          isHoveringButton = false
          // 先隐藏按钮
          copyBtn.style.opacity = '0'
          copyBtn.style.pointerEvents = 'none'
          // 稍后恢复状态（等动画完成后）
          setTimeout(() => {
            resetButton()
            copyBtn.style.opacity = ''
            copyBtn.style.pointerEvents = ''
          }, 150)
        }
        
        copyBtn.onclick = async (e) => {
          e.stopPropagation()
          
          const copySuccess = () => {
            copyBtn.classList.add('copied')
            copyBtn.title = 'Copied!'
            copyBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            `
            if (copyTimeout) clearTimeout(copyTimeout)
            copyTimeout = setTimeout(() => {
              resetButton()
            }, 1000)
          }
          
          try {
            await navigator.clipboard.writeText(code.textContent)
            copySuccess()
          } catch (err) {
            // 降级方案：使用传统的 execCommand
            const textArea = document.createElement('textarea')
            textArea.value = code.textContent
            textArea.style.position = 'fixed'
            textArea.style.left = '-9999px'
            document.body.appendChild(textArea)
            textArea.select()
            try {
              document.execCommand('copy')
              copySuccess()
            } catch (fallbackErr) {
              console.error('Failed to copy:', fallbackErr)
            }
            document.body.removeChild(textArea)
          }
        }
        pre.appendChild(copyBtn)
      })
    }, 0)

    return () => clearTimeout(timer)
  }, [post, themeId])

  // 格式化日期
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    if (lang === 'zh') {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  if (!post) {
    return (
      <div style={{
        minHeight: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        background: theme.bgPrimary,
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.textPrimary, marginBottom: '16px' }}>
            404
          </h1>
          <p style={{ color: theme.textMuted, fontFamily: font.ui, marginBottom: '24px' }}>
            {lang === 'zh' ? '文章未找到' : 'Post not found'}
          </p>
          <button
            onClick={() => navigate('/articles')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: theme.bgSecondary,
              color: theme.textPrimary,
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 500,
              textDecoration: 'none',
              border: `1px solid ${theme.border}`,
              transition: 'all 0.15s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.bgTertiary
              e.currentTarget.style.borderColor = theme.borderHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.bgSecondary
              e.currentTarget.style.borderColor = theme.border
            }}
          >
            {lang === 'zh' ? '返回文章列表' : 'Back to posts'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100%',
        padding: isMobile ? '20px 12px' : '32px 24px',
        background: theme.bgPrimary,
      }}
    >
      <article style={{ maxWidth: isMobile ? '100%' : '800px', margin: '0 auto' }}>
        {/* Header */}
        <header style={{ marginBottom: isMobile ? '20px' : '32px' }}>
          {/* Title */}
          <h1 style={{
            fontSize: isMobile ? '22px' : '24px',
            fontWeight: 700,
            color: theme.textPrimary,
            fontFamily: font.ui,
            lineHeight: 1.3,
            marginBottom: '12px',
          }}>
            {getTitle(post)}
          </h1>
          
          {/* 装饰条 */}
          <div style={{
            width: '32px',
            height: '3px',
            background: theme.bgAccent,
            borderRadius: '2px',
            marginBottom: '16px',
          }} />

          {/* Meta */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '8px' : '12px',
            paddingBottom: '16px',
            borderBottom: `1px solid ${theme.border}`,
            alignItems: isMobile ? 'flex-start' : 'center',
            flexWrap: 'wrap',
          }}>
            {/* Date */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: theme.bgSecondary,
              borderRadius: radius.sm,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.bgTertiary
              e.currentTarget.style.borderColor = theme.borderHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.bgSecondary
              e.currentTarget.style.borderColor = theme.border
            }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="1.5">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span style={{ fontSize: '11px', fontFamily: font.ui, color: theme.textSecondary }}>
                {formatDate(post.date)}
              </span>
            </div>

            {/* Categories */}
            {post.categories && post.categories.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {post.categories.map(cat => {
                  // 分类名称多语言支持
                  const categoryNames = {
                    tech: { zh: '技术', en: 'Tech' },
                    dev: { zh: '开发', en: 'Dev' },
                    life: { zh: '生活', en: 'Life' },
                    other: { zh: '其他', en: 'Other' }
                  }
                  const id = cat.toLowerCase()
                  const displayName = categoryNames[id] ? categoryNames[id][lang] : cat
                  return (
                    <button
                      key={cat}
                      onClick={() => navigate(`/articles?category=${id}`)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '4px 10px',
                        fontSize: '11px',
                        fontFamily: font.ui,
                        background: theme.bgSecondary,
                        color: theme.textSecondary,
                        borderRadius: radius.sm,
                        border: `1px solid ${theme.border}`,
                        textDecoration: 'none',
                        transition: 'all 0.15s ease',
                        cursor: 'pointer',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.bgTertiary
                        e.currentTarget.style.color = theme.textPrimary
                        e.currentTarget.style.borderColor = theme.borderHover
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.bgSecondary
                        e.currentTarget.style.color = theme.textSecondary
                        e.currentTarget.style.borderColor = theme.border
                      }}
                    >
                      {displayName}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Reading time */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              background: theme.bgSecondary,
              borderRadius: radius.sm,
              border: `1px solid ${theme.border}`,
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = theme.bgTertiary
              e.currentTarget.style.borderColor = theme.borderHover
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = theme.bgSecondary
              e.currentTarget.style.borderColor = theme.border
            }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="1.5">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <span style={{ fontSize: '11px', fontFamily: font.ui, color: theme.textSecondary }}>
                {lang === 'zh' ? `${getReadingTime(post)} 分钟` : `${getReadingTime(post)} min`}
              </span>
            </div>

            {/* Tags */}
            {post.tags.length > 0 && (
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {post.tags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => navigate(`/articles?tag=${tag.toLowerCase()}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '4px 10px',
                      fontSize: '11px',
                      fontFamily: font.ui,
                      background: theme.bgSecondary,
                      color: theme.textSecondary,
                      borderRadius: radius.sm,
                      border: `1px solid ${theme.border}`,
                      textDecoration: 'none',
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = theme.bgTertiary
                      e.currentTarget.style.color = theme.textPrimary
                      e.currentTarget.style.borderColor = theme.borderHover
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = theme.bgSecondary
                      e.currentTarget.style.color = theme.textSecondary
                      e.currentTarget.style.borderColor = theme.border
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div
          ref={contentRef}
          style={{
            color: theme.textPrimary,
            lineHeight: 1.7,
          }}
          className="markdown-content"
          dangerouslySetInnerHTML={{ __html: getContent(post) }}
        />

        {/* Navigation: Prev/Next */}
        <nav style={{
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: `1px solid ${theme.border}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            gap: '16px',
          }}>
            {/* Prev */}
            <button
              onClick={() => prevPost && navigate(`/articles/${prevPost.slug}`)}
              disabled={!prevPost}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: theme.bgSecondary,
                borderRadius: radius.sm,
                border: `1px solid ${theme.border}`,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                opacity: prevPost ? 1 : 0.4,
                cursor: prevPost ? 'pointer' : 'default',
                minWidth: '0',
                flex: '1 1 0',
              }}
              onMouseEnter={(e) => {
                if (prevPost) {
                  e.currentTarget.style.background = theme.bgTertiary
                  e.currentTarget.style.borderColor = theme.borderHover
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.bgSecondary
                e.currentTarget.style.borderColor = theme.border
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                background: theme.bgTertiary,
                flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M15 18l-6-6 6-6"/>
                </svg>
              </div>
              <div style={{ 
                minWidth: 0,
                overflow: 'hidden',
              }}>
                <div style={{
                  fontSize: '10px',
                  fontFamily: font.ui,
                  color: theme.textMuted,
                  letterSpacing: '0.03em',
                  marginBottom: '1px',
                }}>
                  {lang === 'zh' ? '上一篇' : 'PREV'}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: theme.textSecondary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {prevPost ? getTitle(prevPost) : (lang === 'zh' ? '没有更多' : 'No more')}
                </div>
              </div>
            </button>

            {/* Divider */}
            <div style={{
              width: '1px',
              background: theme.border,
              alignSelf: 'stretch',
            }} />

            {/* Next */}
            <button
              onClick={() => nextPost && navigate(`/articles/${nextPost.slug}`)}
              disabled={!nextPost}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                background: theme.bgSecondary,
                borderRadius: radius.sm,
                border: `1px solid ${theme.border}`,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
                opacity: nextPost ? 1 : 0.4,
                cursor: nextPost ? 'pointer' : 'default',
                minWidth: '0',
                flex: '1 1 0',
                justifyContent: 'flex-end',
              }}
              onMouseEnter={(e) => {
                if (nextPost) {
                  e.currentTarget.style.background = theme.bgTertiary
                  e.currentTarget.style.borderColor = theme.borderHover
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.bgSecondary
                e.currentTarget.style.borderColor = theme.border
              }}
            >
              <div style={{ 
                minWidth: 0,
                overflow: 'hidden',
                textAlign: 'right',
              }}>
                <div style={{
                  fontSize: '10px',
                  fontFamily: font.ui,
                  color: theme.textMuted,
                  letterSpacing: '0.03em',
                  marginBottom: '1px',
                }}>
                  {lang === 'zh' ? '下一篇' : 'NEXT'}
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: theme.textSecondary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {nextPost ? getTitle(nextPost) : (lang === 'zh' ? '没有更多' : 'No more')}
                </div>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '24px',
                height: '24px',
                borderRadius: '4px',
                background: theme.bgTertiary,
                flexShrink: 0,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={theme.textMuted} strokeWidth="1.5" strokeLinecap="round">
                  <path d="M9 18l6-6-6-6"/>
                </svg>
              </div>
            </button>
          </div>
        </nav>
      </article>

      {/* Markdown 样式 */}
      <style>{`
        .markdown-content h2 {
          font-size: ${isMobile ? '18px' : '20px'};
          font-weight: 600;
          color: ${theme.textPrimary};
          margin-bottom: 12px;
          margin-top: 24px;
        }
        
        .markdown-content h3 {
          font-size: ${isMobile ? '16px' : '17px'};
          font-weight: 600;
          color: ${theme.textPrimary};
          margin-bottom: 10px;
          margin-top: 20px;
        }
        
        .markdown-content p {
          font-size: 14px;
          line-height: 1.7;
          color: ${theme.textPrimary};
          margin-bottom: 12px;
        }
        
        .markdown-content ul, .markdown-content ol {
          margin-bottom: 16px;
          padding-left: 24px;
        }
        
        .markdown-content li {
          font-size: 14px;
          line-height: 1.6;
          color: ${theme.textPrimary};
          margin-bottom: 6px;
        }
        
        .markdown-content code {
          background: ${theme.bgTertiary};
          padding: 2px 6px;
          border-radius: 4px;
          font-family: ${font.ui};
          font-size: 13px;
        }
        
        .markdown-content pre {
          background: ${theme.bgTertiary};
          padding: 12px 16px;
          border-radius: 6px;
          overflow-x: auto;
          border: 1px solid ${theme.border};
          margin-bottom: 16px;
        }
        
        .markdown-content pre code {
          background: none;
          padding: 0;
          font-size: 13px;
          line-height: 1.6;
        }
        
        .markdown-content a {
          color: #3B82F6;
          text-decoration: none;
        }
        
        .markdown-content a:hover {
          text-decoration: underline;
        }
        
        .markdown-content blockquote {
          border-left: 3px solid ${theme.border};
          padding-left: 16px;
          margin: 16px 0;
          color: ${theme.textSecondary};
        }
        
        .markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 16px;
        }
        
        .markdown-content th, .markdown-content td {
          border: 1px solid ${theme.border};
          padding: 8px 12px;
          text-align: left;
          font-size: 14px;
        }
        
        .markdown-content th {
          background: ${theme.bgTertiary};
          font-weight: 600;
        }
        
        .markdown-content img {
          max-width: 100%;
          border-radius: 8px;
          margin: 16px 0;
        }
      `}</style>
    </motion.div>
  )
}

export default Article