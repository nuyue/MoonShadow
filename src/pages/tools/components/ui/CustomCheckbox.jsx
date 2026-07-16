import React from 'react'
import { useTheme } from '../../../../context/ThemeContext'

// 自定义复选框组件
export default function CustomCheckbox({ checked, onChange, label }) {
  const { theme, radius, font } = useTheme()

  const handleClick = () => {
    onChange(!checked)
  }

  return (
    <div
      onClick={handleClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 8px',
        fontSize: '12px',
        color: theme.textSecondary,
        fontFamily: font.ui,
        cursor: 'pointer',
        borderRadius: radius.sm,
        transition: 'background 0.15s',
        userSelect: 'none',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = theme.bgTertiary}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      <span
        style={{
          width: '14px',
          height: '14px',
          borderRadius: '3px',
          border: `1.5px solid ${checked ? theme.bgAccent : theme.border}`,
          background: checked ? theme.bgAccent : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
      >
        {checked && (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={theme.bgPrimary} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </span>
      <span>{label}</span>
    </div>
  )
}
