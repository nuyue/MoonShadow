import React from 'react'
import { useTheme } from '../../../../context/ThemeContext'

// 自定义组合框组件 (多个按钮切换)
export default function ToggleGroup({ value, onChange, options }) {
  const { theme, radius, font } = useTheme()

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
      background: theme.bgTertiary,
      borderRadius: radius.sm,
      padding: '2px',
    }}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '6px 12px',
            background: value === option.value ? theme.bgAccent : 'transparent',
            color: value === option.value ? theme.bgPrimary : theme.textSecondary,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: font.ui,
            fontWeight: 500,
            transition: 'all 0.15s',
          }}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}