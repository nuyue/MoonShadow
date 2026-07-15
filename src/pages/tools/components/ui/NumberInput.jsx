import React from 'react'
import { useTheme } from '../../../../context/ThemeContext'

// 自定义数值输入组件（带增减按钮）
export default function NumberInput({ value, onChange, min, max, step = 1, placeholder }) {
  const { theme, radius, font } = useTheme()

  const handleDecrease = () => {
    const newValue = value - step
    if (min === undefined || newValue >= min) {
      onChange(newValue)
    }
  }

  const handleIncrease = () => {
    const newValue = value + step
    if (max === undefined || newValue <= max) {
      onChange(newValue)
    }
  }

  const handleChange = (e) => {
    const newValue = parseFloat(e.target.value)
    if (!isNaN(newValue)) {
      onChange(newValue)
    }
  }

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      background: theme.bgTertiary,
      borderRadius: radius.sm,
      overflow: 'hidden',
    }}>
      <button
        type="button"
        onClick={handleDecrease}
        disabled={min !== undefined && value <= min}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          background: 'transparent',
          border: 'none',
          color: (min !== undefined && value <= min) ? theme.textMuted : theme.textSecondary,
          cursor: (min !== undefined && value <= min) ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontFamily: font.mono,
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          if (min === undefined || value > min) {
            e.currentTarget.style.color = theme.textPrimary
          }
        }}
        onMouseLeave={(e) => {
          if (min === undefined || value > min) {
            e.currentTarget.style.color = theme.textSecondary
          }
        }}
      >
        −
      </button>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        style={{
          width: '48px',
          height: '28px',
          background: 'transparent',
          border: 'none',
          color: theme.textPrimary,
          fontSize: '12px',
          fontFamily: font.mono,
          textAlign: 'center',
          outline: 'none',
          padding: '0 4px',
        }}
      />
      <button
        type="button"
        onClick={handleIncrease}
        disabled={max !== undefined && value >= max}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          background: 'transparent',
          border: 'none',
          color: (max !== undefined && value >= max) ? theme.textMuted : theme.textSecondary,
          cursor: (max !== undefined && value >= max) ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontFamily: font.mono,
          transition: 'all 0.15s',
        }}
        onMouseEnter={(e) => {
          if (max === undefined || value < max) {
            e.currentTarget.style.color = theme.textPrimary
          }
        }}
        onMouseLeave={(e) => {
          if (max === undefined || value < max) {
            e.currentTarget.style.color = theme.textSecondary
          }
        }}
      >
        +
      </button>
    </div>
  )
}
