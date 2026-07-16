import React from 'react'
import { useTheme } from '../../../../context/ThemeContext'

// 自定义选择框组件
export default function CustomSelect({ value, onChange, options, placeholder }) {
  const { theme, radius, font } = useTheme()
  const [isOpen, setIsOpen] = React.useState(false)
  const ref = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          padding: '6px 12px',
          minWidth: '100px',
          height: '28px',
          background: theme.bgTertiary,
          border: 'none',
          borderRadius: radius.sm,
          color: selectedOption ? theme.textPrimary : theme.textMuted,
          fontSize: '12px',
          fontFamily: font.ui,
          cursor: 'pointer',
          outline: 'none',
          transition: 'all 0.15s',
        }}
      >
        <span>{selectedOption?.label || placeholder}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.15s', opacity: 0.6 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 4px)',
          left: 0,
          minWidth: '100%',
          background: theme.bgSecondary,
          border: `1px solid ${theme.border}`,
          borderRadius: radius.sm,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          zIndex: 1000,
          animation: 'fadeIn 0.1s ease-out',
        }}>
          {options.map((option, index) => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              style={{
                padding: '6px 12px',
                fontSize: '12px',
                fontFamily: font.ui,
                color: theme.textSecondary,
                cursor: 'pointer',
                transition: 'all 0.1s',
                borderBottom: index < options.length - 1 ? `1px solid ${theme.border}20` : 'none',
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
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
