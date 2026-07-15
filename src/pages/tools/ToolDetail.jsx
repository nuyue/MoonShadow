import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { getToolById } from '../../utils/tools'
import toolComponents from './index'
import { useTheme } from '../../context/ThemeContext'
import { useLang } from '../../context/LanguageContext'

export default function ToolDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [isMobile, setIsMobile] = useState(false)
  const tool = getToolById(id)
  const toolData = toolComponents[id]

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!tool || !toolData) {
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
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: theme.textPrimary, marginBottom: '16px', fontFamily: font.ui }}>
            404
          </h1>
          <p style={{ color: theme.textMuted, fontFamily: font.ui, marginBottom: '24px' }}>
            {lang === 'zh' ? '工具未找到' : 'Tool not found'}
          </p>
          <Link
            to="/tools"
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
            {lang === 'zh' ? '返回工具列表' : 'Back to tools'}
          </Link>
        </div>
      </div>
    )
  }

  const Component = toolData.component

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
      <div style={{ maxWidth: isMobile ? '100%' : '800px', margin: '0 auto' }}>
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
            {lang === 'zh' ? tool.name.zh : tool.name.en}
          </h1>
          
          {/* 装饰条 */}
          <div style={{
            width: '32px',
            height: '3px',
            background: theme.categoryColor || theme.bgAccent,
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
            {/* Category */}
            {tool.category && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: theme.bgSecondary,
                borderRadius: radius.sm,
                fontSize: '12px',
                fontFamily: font.ui,
                color: theme.textSecondary,
              }}>
                <span style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '2px',
                  background: tool.category.color,
                }} />
                {lang === 'zh' ? tool.category.name.zh : tool.category.name.en}
              </div>
            )}

            {/* Description */}
            <div style={{
              fontSize: '13px',
              fontFamily: font.ui,
              color: theme.textMuted,
            }}>
              {lang === 'zh' ? tool.desc.zh : tool.desc.en}
            </div>
          </div>
        </header>

        {/* Content */}
        <div style={{
          background: theme.bgSecondary,
          borderRadius: radius.md,
          border: `1px solid ${theme.border}`,
        }}>
          <Component />
        </div>
      </div>
    </motion.div>
  )
}