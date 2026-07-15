import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme, RADIUS, FONT } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import PageHeader from '../components/PageHeader'

// 从虚拟模块导入文章数据
import { posts, categories, tags } from 'virtual:posts-data'

const POSTS_PER_PAGE = 5

function Posts() {
  const { theme, radius, font } = useTheme()
  const { lang, t } = useLang()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isMobile, setIsMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilter, setShowFilter] = useState(() => {
    // 从 sessionStorage 恢复筛选面板状态
    return sessionStorage.getItem('posts-showFilter') === 'true'
  })
  const [showCategory, setShowCategory] = useState(() => {
    // 从 sessionStorage 恢复分类面板状态
    return sessionStorage.getItem('posts-showCategory') === 'true'
  })

  const activeTag = searchParams.get('tag') || null
  const activeCategory = searchParams.get('category') || null
  const currentPage = parseInt(searchParams.get('page') || '1', 10)
  
  // 获取多语言字段
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

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 保存筛选面板状态到 sessionStorage
  useEffect(() => {
    sessionStorage.setItem('posts-showFilter', showFilter.toString())
  }, [showFilter])

  useEffect(() => {
    sessionStorage.setItem('posts-showCategory', showCategory.toString())
  }, [showCategory])

  // 筛选文章
  const filteredPosts = posts.filter(post => {
    if (activeCategory && !post.categories.map(c => c.toLowerCase()).includes(activeCategory.toLowerCase())) return false
    if (activeTag && !post.tags.map(t => t.toLowerCase()).includes(activeTag.toLowerCase())) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const title = getTitle(post).toLowerCase()
      const desc = getDescription(post).toLowerCase()
      if (!title.includes(query) &&
          !desc.includes(query) &&
          !post.tags.some(tag => tag.toLowerCase().includes(query))) {
        return false
      }
    }
    return true
  })

  // 分页
  const totalPages = Math.ceil(filteredPosts.length / POSTS_PER_PAGE)
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE)

  // 设置标签筛选
  const handleTagClick = (tag) => {
    if (tag === activeTag) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('tag')
      newParams.set('page', '1')
      setSearchParams(newParams)
    } else {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('tag', tag)
      newParams.set('page', '1')
      setSearchParams(newParams)
    }
  }

  // 设置分类筛选
  const handleCategoryClick = (category) => {
    if (category === activeCategory) {
      const newParams = new URLSearchParams(searchParams)
      newParams.delete('category')
      newParams.set('page', '1')
      setSearchParams(newParams)
    } else {
      const newParams = new URLSearchParams(searchParams)
      newParams.set('category', category)
      newParams.set('page', '1')
      setSearchParams(newParams)
    }
  }

  // 分页导航
  const handlePageChange = (page) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set('page', String(page))
    setSearchParams(newParams)
  }

  // 格式化日期
  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    if (lang === 'zh') {
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    }
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  }

  return (
    <div style={{
      minHeight: '100%',
      padding: isMobile ? '20px 12px' : '32px 24px',
      background: theme.bgPrimary,
    }}>
      <div style={{ maxWidth: isMobile ? '100%' : '800px', margin: '0 auto' }}>
        {/* Header */}
        <PageHeader
          title={lang === 'zh' ? '文章' : 'Posts'}
          subtitle={lang === 'zh' ? `${posts.length} 篇文章` : `${posts.length} posts`}
          actions={
            <div style={{ display: 'flex', gap: '6px' }}>
              {/* Category toggle */}
              {categories.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowCategory(!showCategory)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: showCategory ? theme.bgTertiary : theme.bgSecondary,
                    borderRadius: radius.sm,
                    border: `1px solid ${showCategory ? theme.borderHover : theme.border}`,
                    color: showCategory ? theme.textPrimary : theme.textSecondary,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: font.ui,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.bgTertiary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = showCategory ? theme.bgTertiary : theme.bgSecondary
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 7h18M3 12h18M3 17h18" strokeLinecap="round"/>
                  </svg>
                  {lang === 'zh' ? '分类' : 'Category'}
                </motion.button>
              )}
              
              {/* Tag toggle */}
              {tags.length > 0 && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilter(!showFilter)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: showFilter ? theme.bgTertiary : theme.bgSecondary,
                    borderRadius: radius.sm,
                    border: `1px solid ${showFilter ? theme.borderHover : theme.border}`,
                    color: showFilter ? theme.textPrimary : theme.textSecondary,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: font.ui,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.bgTertiary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = showFilter ? theme.bgTertiary : theme.bgSecondary
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M3 6h18M7 12h10M10 18h4" strokeLinecap="round"/>
                  </svg>
                  {lang === 'zh' ? '标签' : 'Tags'}
                </motion.button>
              )}
              
              {/* Clear filters */}
              {(activeCategory || activeTag || searchQuery) && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    const newParams = new URLSearchParams()
                    setSearchQuery('')
                    setSearchParams(newParams)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '4px 8px',
                    background: theme.bgSecondary,
                    borderRadius: radius.sm,
                    border: `1px solid ${theme.border}`,
                    color: theme.textMuted,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: font.ui,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.bgTertiary
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.bgSecondary
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/>
                  </svg>
                  {lang === 'zh' ? '清除' : 'Clear'}
                </motion.button>
              )}
            </div>
          }
        />

        {/* Search */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            position: 'relative',
          }}>
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke={theme.textMuted}
              strokeWidth="1.5"
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === 'zh' ? '搜索文章...' : 'Search posts...'}
              style={{
                width: '100%',
                padding: '10px 12px 10px 36px',
                background: theme.bgSecondary,
                borderRadius: radius.md,
                border: `1px solid ${theme.border}`,
                color: theme.textPrimary,
                fontFamily: font.ui,
                fontSize: '13px',
                outline: 'none',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.currentTarget) {
                  e.currentTarget.style.background = theme.bgTertiary
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.currentTarget) {
                  e.currentTarget.style.background = theme.bgSecondary
                  e.currentTarget.style.borderColor = theme.border
                }
              }}
              onFocus={(e) => {
                e.currentTarget.style.background = theme.bgTertiary
                e.currentTarget.style.borderColor = theme.borderHover
              }}
              onBlur={(e) => {
                e.currentTarget.style.background = theme.bgSecondary
                e.currentTarget.style.borderColor = theme.border
              }}
            />
          </div>
        </div>

        {/* Category Panel */}
        <AnimatePresence>
          {showCategory && categories.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ marginBottom: '16px', overflow: 'hidden' }}
            >
              <div style={{
                background: theme.bgSecondary,
                borderRadius: radius.md,
                border: `1px solid ${theme.border}`,
                padding: '12px 16px',
              }}>
                <div style={{
                  marginBottom: '10px',
                  fontSize: '12px',
                  fontFamily: font.mono,
                  color: theme.textMuted,
                }}>
                  {lang === 'zh' ? '按分类筛选' : 'Filter by category'}
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {categories.map(cat => {
                    const isActive = cat.id === activeCategory
                    return (
                      <motion.button
                        key={cat.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCategoryClick(cat.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          background: isActive ? theme.bgTertiary : theme.bgSecondary,
                          borderRadius: radius.sm,
                          border: `1px solid ${isActive ? theme.borderHover : theme.border}`,
                          color: isActive ? theme.textPrimary : theme.textSecondary,
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontFamily: font.ui,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme.bgTertiary
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isActive ? theme.bgTertiary : theme.bgSecondary
                        }}
                      >
                        {cat.name}
                        <span style={{
                          padding: '1px 5px',
                          background: theme.bgSecondary,
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: theme.textMuted,
                        }}>
                          {cat.count}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tag Filter Panel */}
        <AnimatePresence>
          {showFilter && tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              style={{ marginBottom: '16px', overflow: 'hidden' }}
            >
              <div style={{
                background: theme.bgSecondary,
                borderRadius: radius.md,
                border: `1px solid ${theme.border}`,
                padding: '12px 16px',
              }}>
                <div style={{
                  marginBottom: '10px',
                  fontSize: '12px',
                  fontFamily: font.mono,
                  color: theme.textMuted,
                }}>
                  {lang === 'zh' ? '按标签筛选' : 'Filter by tag'}
                </div>
                
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {tags.map(tag => {
                    const isActive = tag.id === activeTag
                    return (
                      <motion.button
                        key={tag.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTagClick(tag.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 8px',
                          background: isActive ? theme.bgTertiary : theme.bgSecondary,
                          borderRadius: radius.sm,
                          border: `1px solid ${isActive ? theme.borderHover : theme.border}`,
                          color: isActive ? theme.textPrimary : theme.textSecondary,
                          cursor: 'pointer',
                          fontSize: '11px',
                          fontFamily: font.ui,
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = theme.bgTertiary
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = isActive ? theme.bgTertiary : theme.bgSecondary
                        }}
                      >
                        {tag.name}
                        <span style={{
                          padding: '1px 5px',
                          background: theme.bgSecondary,
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: theme.textMuted,
                        }}>
                          {tag.count}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Posts List */}
        <AnimatePresence mode="popLayout">
          {paginatedPosts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: theme.textMuted,
              }}
            >
              <p style={{ fontFamily: font.mono }}>
                {lang === 'zh' ? '没有找到文章' : 'No posts found'}
              </p>
            </motion.div>
          ) : (
            paginatedPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                style={{
                  marginBottom: '16px',
                  background: theme.bgSecondary,
                  borderRadius: radius.md,
                  border: `1px solid ${theme.border}`,
                  overflow: 'hidden',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.bgTertiary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = theme.bgSecondary
                }}
              >
                <Link
                  to={`/articles/${post.slug}?${searchParams.toString()}`}
                  style={{
                    display: 'block',
                    padding: isMobile ? '16px' : '20px',
                    textDecoration: 'none',
                  }}
                >
                  {/* Title */}
                  <h2 style={{
                    fontSize: isMobile ? '16px' : '18px',
                    fontWeight: 600,
                    color: theme.textPrimary,
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    {getTitle(post)}
                    {post.top > 0 && (
                      <span style={{
                        padding: '2px 6px',
                        background: theme.bgAccent,
                        color: theme.bgPrimary,
                        borderRadius: '4px',
                        fontSize: '10px',
                        fontFamily: font.ui,
                      }}>
                        {lang === 'zh' ? '置顶' : 'TOP'}
                      </span>
                    )}
                  </h2>

                  {/* Description */}
                  <p style={{
                    fontSize: '13px',
                    color: theme.textSecondary,
                    marginBottom: '12px',
                    lineHeight: 1.5,
                  }}>
                    {getDescription(post)}
                  </p>

                  {/* Meta */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '12px',
                    fontFamily: font.mono,
                  }}>
                    {/* Date */}
                    <span style={{ color: theme.textMuted }}>
                      {formatDate(post.date)}
                    </span>

                    {/* Categories */}
                    {post.categories.length > 0 && (
                      <span style={{
                        padding: '2px 6px',
                        background: theme.bgTertiary,
                        color: theme.textSecondary,
                        borderRadius: '4px',
                        fontSize: '10px',
                      }}>
                        {post.categories[0]}
                      </span>
                    )}

                    {/* Tags */}
                    {post.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        style={{
                          padding: '2px 6px',
                          background: theme.bgTertiary,
                          color: theme.textSecondary,
                          borderRadius: '4px',
                          fontSize: '10px',
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </Link>
              </motion.article>
            ))
          )}
        </AnimatePresence>

        {/* Pagination */}
        {totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '24px',
              padding: '12px',
              background: theme.bgSecondary,
              borderRadius: radius.md,
              border: `1px solid ${theme.border}`,
            }}
          >
            {/* Prev */}
            <motion.button
              whileTap={{ scale: currentPage > 1 ? 0.95 : 1 }}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                background: theme.bgTertiary,
                borderRadius: radius.sm,
                border: `1px solid ${theme.border}`,
                color: currentPage === 1 ? theme.textMuted : theme.textPrimary,
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontFamily: font.mono,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (currentPage > 1) e.currentTarget.style.background = theme.bgHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.bgTertiary
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M15 18l-6-6 6-6" strokeLinecap="round"/>
              </svg>
              <span>{lang === 'zh' ? '上一页' : 'Prev'}</span>
            </motion.button>

            {/* Pages */}
            <div style={{ display: 'flex', gap: '4px' }}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <motion.button
                  key={page}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(page)}
                  style={{
                    width: '28px',
                    height: '28px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: page === currentPage ? theme.bgTertiary : theme.bgTertiary,
                    borderRadius: radius.sm,
                    border: `1px solid ${page === currentPage ? theme.borderHover : theme.border}`,
                    color: page === currentPage ? theme.textPrimary : theme.textSecondary,
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontFamily: font.mono,
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.bgHover
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = theme.bgTertiary
                  }}
                >
                  {page}
                </motion.button>
              ))}
            </div>

            {/* Next */}
            <motion.button
              whileTap={{ scale: currentPage < totalPages ? 0.95 : 1 }}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                background: theme.bgTertiary,
                borderRadius: radius.sm,
                border: `1px solid ${theme.border}`,
                color: currentPage === totalPages ? theme.textMuted : theme.textPrimary,
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                fontSize: '11px',
                fontFamily: font.mono,
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                if (currentPage < totalPages) e.currentTarget.style.background = theme.bgHover
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.bgTertiary
              }}
            >
              <span>{lang === 'zh' ? '下一页' : 'Next'}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Posts