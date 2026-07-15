import { motion } from 'framer-motion'
import { ExternalLink, Mail } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useTheme, RADIUS, FONT } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import PageHeader from '../components/PageHeader'
import { linksData } from 'virtual:posts-data'

function Links() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // 友情链接数据
  const friendLinks = linksData.map(link => ({
    ...link,
    desc: typeof link.desc === 'object' ? link.desc[lang] || link.desc.en : link.desc
  }))

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
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
          title={lang === 'zh' ? '友情链接' : 'Friend Links'}
          subtitle={lang === 'zh' ? `${friendLinks.length} 个链接` : `${friendLinks.length} links`}
          actions={
            <motion.a
              href="mailto:admin@nuyue.com"
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '4px 8px',
                background: theme.bgSecondary,
                borderRadius: radius.sm,
                border: `1px solid ${theme.border}`,
                color: theme.textSecondary,
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: font.ui,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.bgTertiary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.bgSecondary
              }}
            >
              <Mail size={12} strokeWidth={1.5} />
              <span>{lang === 'zh' ? '申请友链' : 'Apply'}</span>
            </motion.a>
          }
        />

        {/* Links Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: '16px',
          }}
        >
          {friendLinks.map((link, i) => (
            <motion.a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'block',
                padding: '20px',
                background: theme.bgSecondary,
                borderRadius: radius.lg,
                border: `1px solid ${theme.border}`,
                textDecoration: 'none',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.bgTertiary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.bgSecondary
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                {/* Icon */}
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: radius.md,
                  background: link.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <img 
                    src={link.logo} 
                    alt={link.name}
                    style={{
                      width: '28px',
                      height: '28px',
                      objectFit: 'contain',
                    }}
                  />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '6px',
                  }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: 600,
                      fontFamily: font.mono,
                      color: theme.textPrimary,
                    }}>
                      {link.name}
                    </span>
                    <ExternalLink 
                      size={14} 
                      strokeWidth={1.5} 
                      style={{ 
                        color: theme.textMuted,
                        flexShrink: 0,
                      }} 
                    />
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: theme.textMuted,
                    fontFamily: font.mono,
                    margin: 0,
                    lineHeight: 1.5,
                  }}>
                    {link.desc}
                  </p>
                </div>
              </div>
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

export default Links