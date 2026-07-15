import React from 'react'
import { parseCron } from '../../../utils/core'
import { useTheme } from '../../../context/ThemeContext'

/**
 * Cron 解析工具组件
 * 支持 Cron 表达式解析和下次执行时间计算
 */
const CronParser = () => {
  const { theme, radius, font } = useTheme()
  const [expression, setExpression] = React.useState('0 9 * * 1-5')
  const [result, setResult] = React.useState(null)
  const [error, setError] = React.useState('')

  // 常用表达式
  const commonExpressions = [
    { label: '每分钟', value: '* * * * *' },
    { label: '每小时', value: '0 * * * *' },
    { label: '每天零点', value: '0 0 * * *' },
    { label: '每天中午12点', value: '0 12 * * *' },
    { label: '每周一零点', value: '0 0 * * 1' },
    { label: '每月1号零点', value: '0 0 1 * *' },
    { label: '工作日早9点', value: '0 9 * * 1-5' },
    { label: '每5分钟', value: '*/5 * * * *' },
    { label: '每30分钟', value: '*/30 * * * *' },
    { label: '每2小时', value: '0 */2 * * *' },
  ]

  const handleParse = () => {
    setError('')
    if (!expression.trim()) {
      setResult(null)
      return
    }
    const parseResult = parseCron(expression, 5)
    if (parseResult.ok) {
      setResult(parseResult.value)
      setError('')
    } else {
      setError(parseResult.error)
      setResult(null)
    }
  }

  const reset = () => {
    setExpression('0 9 * * 1-5')
    setResult(null)
    setError('')
  }

  // 格式化日期
  const formatDate = (date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={handleParse}
          style={{
            padding: '8px 16px',
            background: theme.bgAccent,
            color: theme.bgPrimary,
            border: 'none',
            borderRadius: radius.sm,
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500,
            fontFamily: font.ui,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = theme.bgAccentHover}
          onMouseLeave={e => e.currentTarget.style.background = theme.bgAccent}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          解析
        </button>
        <button
          onClick={reset}
          style={{
            padding: '6px 12px',
            background: theme.bgTertiary,
            color: theme.textSecondary,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.sm,
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: font.ui,
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.bgHover; e.currentTarget.style.color = theme.textPrimary }}
          onMouseLeave={e => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.color = theme.textSecondary }}
        >
          重置
        </button>
      </div>

      {/* Input */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: font.ui }}>
          Cron 表达式
        </label>
        <input
          type="text"
          value={expression}
          onChange={(e) => setExpression(e.target.value)}
          placeholder="输入 Cron 表达式..."
          style={{
            width: '100%',
            padding: '10px 12px',
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

      {/* Common expressions */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: font.ui }}>
          常用表达式
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {commonExpressions.map((item) => (
            <button
              key={item.value}
              onClick={() => setExpression(item.value)}
              style={{
                padding: '6px 12px',
                background: theme.bgSecondary,
                border: `1px solid ${theme.border}`,
                borderRadius: radius.sm,
                cursor: 'pointer',
                fontSize: '12px',
                fontFamily: font.ui,
                color: theme.textSecondary,
                transition: 'background 0.15s, color 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.color = theme.textPrimary; e.currentTarget.style.borderColor = theme.borderHover }}
              onMouseLeave={e => { e.currentTarget.style.background = theme.bgSecondary; e.currentTarget.style.color = theme.textSecondary; e.currentTarget.style.borderColor = theme.border }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          padding: '12px',
          background: theme.bgTertiary,
          border: `1px solid ${theme.border}`,
          borderRadius: radius.md,
          color: theme.error,
          fontSize: '14px',
          fontFamily: font.ui,
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Result */}
      {result && (
        <div>
          {/* Description */}
          <div style={{
            padding: '12px',
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.md,
            marginBottom: '12px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '6px', fontFamily: font.ui }}>
              描述
            </div>
            <div style={{ fontSize: '16px', fontWeight: 500, color: theme.textPrimary, fontFamily: font.ui }}>
              {result.description}
            </div>
          </div>

          {/* Fields */}
          <div style={{
            padding: '12px',
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.md,
            marginBottom: '12px',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '6px', fontFamily: font.ui }}>
              字段解析
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', textAlign: 'center' }}>
              {[
                { name: '分钟', value: result.fields.minute },
                { name: '小时', value: result.fields.hour },
                { name: '日', value: result.fields.dayOfMonth },
                { name: '月', value: result.fields.month },
                { name: '周', value: result.fields.dayOfWeek },
              ].map(field => (
                <div key={field.name} style={{ padding: '8px', background: theme.bgTertiary, borderRadius: radius.sm }}>
                  <div style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px', fontFamily: font.ui }}>{field.name}</div>
                  <div style={{ fontSize: '14px', fontWeight: 500, color: theme.textPrimary, fontFamily: font.mono }}>{field.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Next dates */}
          <div style={{
            padding: '12px',
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.md,
          }}>
            <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '6px', fontFamily: font.ui }}>
              接下来 5 次执行时间
            </div>
            <div>
              {result.nextDates.map((date, i) => (
                <div key={i} style={{ padding: '6px 0', fontSize: '13px', fontFamily: font.mono, color: theme.textPrimary }}>
                  {formatDate(date)}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CronParser
