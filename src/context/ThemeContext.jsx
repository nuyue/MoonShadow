import { createContext, useContext, useState, useEffect } from 'react'

// 黑银灰白配色系统 - Minimal Design (只保留亮色和暗色)
export const THEMES = {
  light: {
    id: 'light',
    name: 'Light',
    nameZh: '亮色',
    bgPrimary: '#FFFFFF',
    bgSecondary: '#F8F9FA',
    bgTertiary: '#E9ECEF',
    bgHover: '#DEE2E6',
    bgSelected: '#CED4DA',
    bgAccent: '#212529',
    bgAccentHover: '#343A40',
    textPrimary: '#212529',
    textSecondary: '#6C757D',
    textMuted: '#ADB5BD',
    textAccent: '#212529',
    border: 'rgba(0, 0, 0, 0.08)',
    borderHover: 'rgba(0, 0, 0, 0.15)',
    success: '#495057',
    warning: '#6C757D',
    error: '#343A40',
    code: {
      bg: '#F8F9FA',
      text: '#212529',
      keyword: '#343A40',
      string: '#495057',
      comment: '#ADB5BD',
      number: '#212529',
    }
  },
  dark: {
    id: 'dark',
    name: 'Dark',
    nameZh: '暗色',
    bgPrimary: '#0D0D0D',
    bgSecondary: '#1A1A1A',
    bgTertiary: '#262626',
    bgHover: '#333333',
    bgSelected: '#404040',
    bgAccent: '#C0C0C0',
    bgAccentHover: '#D4D4D4',
    textPrimary: '#FFFFFF',
    textSecondary: '#A3A3A3',
    textMuted: '#737373',
    textAccent: '#E5E5E5',
    border: 'rgba(255, 255, 255, 0.08)',
    borderHover: 'rgba(255, 255, 255, 0.15)',
    success: '#A3A3A3',
    warning: '#C0C0C0',
    error: '#E5E5E5',
    code: {
      bg: '#1A1A1A',
      text: '#E5E5E5',
      keyword: '#C0C0C0',
      string: '#A3A3A3',
      comment: '#737373',
      number: '#D4D4D4',
    }
  }
}

// Radii - JetBrains New UI
export const RADIUS = {
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
}

// Typography
export const FONT = {
  ui: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  mono: "'JetBrains Mono', 'Consolas', monospace",
}

const ThemeContext = createContext(null)

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('jb-theme')
    return saved && THEMES[saved] ? saved : 'dark'
  })

  useEffect(() => {
    localStorage.setItem('jb-theme', theme)
  }, [theme])

  const value = {
    theme: THEMES[theme],
    themeId: theme,
    setTheme,
    themes: Object.keys(THEMES),
    radius: RADIUS,
    font: FONT,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}