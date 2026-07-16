import { motion } from 'framer-motion'
import { useTheme, FONT } from '../context/ThemeContext'

/**
 * 统一的页面头部组件
 * @param {string} title - 页面标题
 * @param {string} subtitle - 副标题（可选，显示在标题右侧）
 * @param {ReactNode} actions - 右侧操作按钮（可选）
 */
function PageHeader({ title, subtitle, actions }) {
  const { theme, font } = useTheme()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ marginBottom: '32px' }}
    >
      {/* 标题区域 */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* 左侧：标题 + 装饰条 */}
        <div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: '12px',
            marginBottom: '8px',
          }}>
            <h1 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: theme.textPrimary,
              fontFamily: font.ui,
              margin: 0,
              lineHeight: 1.2,
            }}>
              {title}
            </h1>
            {subtitle && (
              <span style={{
                color: theme.textMuted,
                fontSize: '13px',
                fontFamily: font.ui,
              }}>
                {subtitle}
              </span>
            )}
          </div>
          {/* 装饰条 */}
          <div style={{
            width: '32px',
            height: '3px',
            background: theme.bgAccent,
            borderRadius: '2px',
          }} />
        </div>

        {/* 右侧：操作按钮 */}
        {actions && (
          <div style={{ 
            display: 'flex', 
            gap: '6px',
            flexShrink: 0,
          }}>
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  )
}

export default PageHeader