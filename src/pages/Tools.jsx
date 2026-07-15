import { motion, AnimatePresence } from 'framer-motion'
import { Link, useSearchParams } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTheme, FONT } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import PageHeader from '../components/PageHeader'
import { toolCategories, getAllTools } from '../utils/tools'

function Tools() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [searchParams, setSearchParams] = useSearchParams()
  const [isMobile, setIsMobile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState(null)
  const [showCategory, setShowCategory] = useState(false)
  
  const allTools = getAllTools()

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 过滤工具
  const filteredTools = allTools.filter(tool => {
    if (activeCategory && tool.category !== activeCategory) return false
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (!tool.name.zh.toLowerCase().includes(query) &&
          !tool.name.en.toLowerCase().includes(query) &&
          !tool.desc.zh.toLowerCase().includes(query) &&
          !tool.desc.en.toLowerCase().includes(query)) {
        return false
      }
    }
    return true
  })

  // 处理分类点击
  const handleCategoryClick = (categoryId) => {
    if (categoryId === activeCategory) {
      setActiveCategory(null)
    } else {
      setActiveCategory(categoryId)
    }
  }

  // 清除筛选
  const clearFilters = () => {
    setSearchQuery('')
    setActiveCategory(null)
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
          title={lang === 'zh' ? '工具箱' : 'Tools'}
          subtitle={lang === 'zh' ? `${allTools.length} 个在线工具` : `${allTools.length} online tools`}
          actions={
            <div style={{ display: 'flex', gap: '6px' }}>
              {/* Category toggle */}
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
              
              {/* Clear filters */}
              {(activeCategory || searchQuery) && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={clearFilters}
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
              placeholder={lang === 'zh' ? '搜索工具...' : 'Search tools...'}
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
          {showCategory && (
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
                  {toolCategories.map(cat => {
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
                        <span style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '3px',
                          background: cat.color,
                        }} />
                        {lang === 'zh' ? cat.name.zh : cat.name.en}
                        <span style={{
                          padding: '1px 5px',
                          background: theme.bgSecondary,
                          borderRadius: '4px',
                          fontSize: '10px',
                          color: theme.textMuted,
                        }}>
                          {cat.tools.length}
                        </span>
                      </motion.button>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tools count */}
        <div style={{
          marginBottom: '12px',
          fontSize: '12px',
          fontFamily: font.mono,
          color: theme.textMuted,
        }}>
          {lang === 'zh' 
            ? `共 ${filteredTools.length} 个工具` 
            : `${filteredTools.length} tools`}
        </div>

        {/* Tools List */}
        <AnimatePresence mode="popLayout">
          {filteredTools.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '48px 24px',
                color: theme.textMuted,
              }}
            >
              <svg 
                width="48" 
                height="48" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1"
                style={{ marginBottom: '16px', opacity: 0.5 }}
              >
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35" strokeLinecap="round"/>
              </svg>
              <p style={{ fontFamily: font.mono }}>
                {lang === 'zh' ? '没有找到工具' : 'No tools found'}
              </p>
            </motion.div>
          ) : (
            filteredTools.map((tool, index) => (
              <motion.article
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                style={{
                  marginBottom: '12px',
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
                  to={`/tools/${tool.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: isMobile ? '14px' : '16px',
                    textDecoration: 'none',
                  }}
                >
                  {/* Icon */}
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: radius.sm,
                    background: tool.categoryColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeLinecap="round"/>
                    </svg>
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: isMobile ? '14px' : '15px',
                      fontWeight: 600,
                      color: theme.textPrimary,
                      marginBottom: '4px',
                      fontFamily: font.ui,
                    }}>
                      {lang === 'zh' ? tool.name.zh : tool.name.en}
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: theme.textMuted,
                      fontFamily: font.ui,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {lang === 'zh' ? tool.desc.zh : tool.desc.en}
                    </div>
                  </div>

                  {/* Arrow */}
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke={theme.textMuted}
                    strokeWidth="1.5"
                    style={{ flexShrink: 0 }}
                  >
                    <path d="M9 18l6-6-6-6" strokeLinecap="round"/>
                  </svg>
                </Link>
              </motion.article>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default Tools