import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { useTheme, RADIUS, FONT } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'

function About() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const languages = ['C', 'C++', 'PHP', 'Go', 'Python', 'JavaScript', 'TypeScript']

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
        maxWidth: '640px',
        width: '100%',
        textAlign: 'center',
      }}>
        {/* Avatar */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', duration: 0.5 }}
          style={{
            width: '120px',
            height: '120px',
            margin: '0 auto',
            marginBottom: '32px',
            borderRadius: radius.lg,
            overflow: 'hidden',
          }}
        >
          <img 
            src="/favicon.ico" 
            alt="Avatar"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </motion.div>

        {/* Separator */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.2 }}
          style={{
            width: '100%',
            maxWidth: '400px',
            height: '1px',
            background: theme.border,
            margin: '0 auto 24px auto',
          }}
        />

        {/* Languages */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          {languages.map(l => (
            <span
              key={l}
              style={{
                padding: '6px 12px',
                background: theme.bgSecondary,
                borderRadius: radius.sm,
                fontSize: '12px',
                fontFamily: font.mono,
                color: theme.textSecondary,
                border: `1px solid ${theme.border}`,
                transition: 'background 0.15s, border-color 0.15s',
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
              {l}
            </span>
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}

export default About