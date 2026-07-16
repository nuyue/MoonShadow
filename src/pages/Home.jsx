import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTheme, RADIUS, FONT } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, FileText, Code2, User } from 'lucide-react'

function Home() {
  const { theme, radius, font } = useTheme()
  const { lang, t } = useLang()
  const navigate = useNavigate()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const features = [
    {
      icon: FileText,
      title: lang === 'zh' ? '文章' : 'Posts',
      desc: lang === 'zh' ? '技术笔记与思考' : 'Technical notes & thoughts',
      link: '/articles',
    },
    {
      icon: Code2,
      title: lang === 'zh' ? '工具' : 'Tools',
      desc: lang === 'zh' ? '实用开发工具' : 'Practical dev tools',
      link: '/tools',
    },
    {
      icon: User,
      title: lang === 'zh' ? '关于' : 'About',
      desc: lang === 'zh' ? '了解更多' : 'Learn more',
      link: '/about',
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: isMobile ? 'calc(100vh - 56px)' : '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: isMobile ? '32px 16px' : '48px 32px',
        background: theme.bgPrimary,
      }}
    >
      <div style={{
        maxWidth: '560px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.6 }}
          style={{
            width: '80px',
            height: '80px',
            margin: '0 auto',
            marginBottom: '24px',
            borderRadius: radius.lg,
            overflow: 'hidden',
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img 
            src="/favicon.ico" 
            alt="Avatar"
            style={{
              width: '60px',
              height: '60px',
              objectFit: 'contain',
            }}
          />
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            fontSize: '15px',
            color: theme.textSecondary,
            lineHeight: 1.6,
            marginBottom: '32px',
          }}
        >
          {t('home.subtitle')}
        </motion.p>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginBottom: '32px',
          }}
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.link}
              onClick={() => navigate(feature.link)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1, type: 'tween', duration: 0.3 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                background: theme.bgSecondary,
                borderRadius: radius.md,
                border: `1px solid ${theme.border}`,
                cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = theme.bgTertiary
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = theme.bgSecondary
              }}
            >
              {/* Icon */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: radius.sm,
                background: theme.bgTertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <feature.icon size={16} strokeWidth={1.5} color={theme.textSecondary} />
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: theme.textPrimary,
                }}>
                  {feature.title}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: theme.textMuted,
                  fontFamily: font.ui,
                }}>
                  {feature.desc}
                </div>
              </div>

              {/* Arrow */}
              <ArrowRight size={14} color={theme.textMuted} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Home