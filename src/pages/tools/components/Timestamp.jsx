import React from 'react'
import { timestampToDate } from '../../../utils/core'
import { useTheme } from '../../../context/ThemeContext'

/**
 * 时间戳转换工具组件
 */
const Timestamp = () => {
  const { theme, radius, font } = useTheme()
  const [timestamp, setTimestamp] = React.useState(Math.floor(Date.now() / 1000).toString())
  const [date, setDate] = React.useState('')
  const [error, setError] = React.useState('')

  const convertTimestamp = () => {
    const result = timestampToDate(timestamp)
    if (result.ok) {
      setDate(result.value.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }))
      setError('')
    } else {
      setError(result.error)
    }
  }

  React.useEffect(() => { convertTimestamp() }, [timestamp])

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: theme.textPrimary, fontFamily: font.ui }}>
          Unix 时间戳
        </label>
        <input
          type="text"
          value={timestamp}
          onChange={e => setTimestamp(e.target.value)}
          placeholder="输入时间戳 (秒或毫秒)"
          style={{
            width: '100%',
            padding: '12px',
            background: theme.bgSecondary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.md,
            fontSize: '14px',
            fontFamily: font.mono,
            outline: 'none',
            transition: 'border-color 0.15s, background 0.15s',
          }}
          onFocus={e => { e.currentTarget.style.borderColor = theme.borderHover; e.currentTarget.style.background = theme.bgTertiary }}
          onBlur={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgSecondary }}
        />
      </div>
      <button
        onClick={() => setTimestamp(Math.floor(Date.now() / 1000).toString())}
        style={{
          padding: '6px 16px',
          background: theme.bgAccent,
          color: theme.bgPrimary,
          border: 'none',
          borderRadius: radius.sm,
          cursor: 'pointer',
          marginBottom: '12px',
          fontFamily: font.ui,
          fontSize: '13px',
          fontWeight: 500,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = theme.bgAccentHover}
        onMouseLeave={e => e.currentTarget.style.background = theme.bgAccent}
      >
        当前时间
      </button>
      {error && <div style={{ color: theme.error, marginBottom: '12px', fontFamily: font.ui, fontSize: '13px' }}>{error}</div>}
      {date && (
        <div style={{
          background: theme.bgSecondary,
          padding: '16px',
          borderRadius: radius.md,
          border: `1px solid ${theme.border}`,
        }}>
          <div style={{ fontWeight: 500, marginBottom: '8px', color: theme.textPrimary, fontFamily: font.ui }}>转换结果</div>
          <div style={{ fontSize: '16px', color: theme.textPrimary, fontFamily: font.mono }}>{date}</div>
        </div>
      )}
    </div>
  )
}

export default Timestamp
