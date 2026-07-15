import { useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight, Home, FileText, Wrench, Link2, Info } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import { getToolById } from '../utils/tools'
import { posts } from 'virtual:posts-data'

// 路由配置
const ROUTE_CONFIG = {
  '/': { icon: Home, label: { zh: '首页', en: 'Home' } },
  '/articles': { icon: FileText, label: { zh: '文章', en: 'Articles' } },
  '/tools': { icon: Wrench, label: { zh: '工具', en: 'Tools' } },
  '/links': { icon: Link2, label: { zh: '友链', en: 'Links' } },
  '/about': { icon: Info, label: { zh: '关于', en: 'About' } },
}

/**
 * 面包屑导航组件 - JetBrains 风格
 */
function Breadcrumb({ isMobile = false }) {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const location = useLocation()
  const navigate = useNavigate()

  // 解析路径生成面包屑
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter(x => x)
    const breadcrumbs = []

    // 首页特殊处理
    if (location.pathname === '/') {
      breadcrumbs.push({
        path: '/',
        label: ROUTE_CONFIG['/'].label[lang],
        icon: ROUTE_CONFIG['/'].icon,
        isCurrent: true,
      })
      return breadcrumbs
    }

    // 构建路径
    let currentPath = ''
    for (let i = 0; i < pathnames.length; i++) {
      const segment = pathnames[i]
      currentPath += '/' + segment

      // 一级页面（首页、文章、工具等）- 平级显示
      if (i === 0 && ROUTE_CONFIG[currentPath]) {
        breadcrumbs.push({
          path: currentPath,
          label: ROUTE_CONFIG[currentPath].label[lang],
          icon: ROUTE_CONFIG[currentPath].icon,
        })
      }
      // 工具详情页
      else if (pathnames[0] === 'tools' && i === 1) {
        const tool = getToolById(segment)
        breadcrumbs.push({
          path: currentPath,
          label: tool?.name?.[lang] || tool?.name?.zh || tool?.name?.en || segment,
          isCurrent: true,
        })
      }
      // 文章详情页
      else if (pathnames[0] === 'posts' && i === 1) {
        const post = posts.find(p => p.slug === segment)
        breadcrumbs.push({
          path: currentPath,
          label: post?.title || segment,
          isCurrent: true,
        })
      }
      // 其他情况
      else if (i === pathnames.length - 1) {
        breadcrumbs.push({
          path: currentPath,
          label: segment,
          isCurrent: true,
        })
      }
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '2px',
        height: '100%',
        flex: 1,
        minWidth: 0,
      }}
    >
      {breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1
        const Icon = item.icon
        // 顶级页面（一级路由）不显示激活效果
        const isTopLevel = ROUTE_CONFIG[item.path] && isLast

        return (
          <div
            key={item.path + index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              flexShrink: isLast ? 1 : 0,
              minWidth: 0,
            }}
          >
            {/* 分隔符 */}
            {index > 0 && (
              <ChevronRight
                size={isMobile ? 14 : 12}
                strokeWidth={1.5}
                color={theme.textMuted}
                style={{ flexShrink: 0 }}
              />
            )}

            {/* 面包屑项 - 顶级页面或非最后一项用链接样式 */}
            {(isTopLevel || !isLast) ? (
              <button
                onClick={() => navigate(item.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '6px' : '4px',
                  fontSize: isMobile ? '14px' : '11px',
                  fontFamily: font.ui,
                  color: theme.textSecondary,
                  textDecoration: 'none',
                  padding: isMobile ? '4px 8px' : '2px 6px',
                  borderRadius: radius.xs,
                  transition: 'all 0.15s',
                  flexShrink: 0,
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.bgTertiary
                  e.currentTarget.style.color = theme.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.textSecondary
                }}
              >
                {Icon && <Icon size={isMobile ? 16 : 12} strokeWidth={1.5} />}
                <span>{item.label}</span>
              </button>
            ) : (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: isMobile ? '6px' : '4px',
                  fontSize: isMobile ? '14px' : '11px',
                  fontFamily: font.ui,
                  color: theme.textPrimary,
                  fontWeight: isMobile ? 600 : 500,
                  padding: isMobile ? '4px 8px' : '2px 6px',
                  borderRadius: radius.xs,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  background: isMobile ? theme.bgTertiary : 'transparent',
                }}
                title={item.label}
              >
                {Icon && <Icon size={isMobile ? 16 : 12} strokeWidth={1.5} />}
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              </span>
            )}
          </div>
        )
      })}
    </motion.nav>
  )
}

export default Breadcrumb
