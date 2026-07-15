import React from 'react'
import {
  formatDateToISO8601,
  formatDateToRFC2822,
  formatDateToHTTP,
  formatDateToSQL,
  formatDateToSQLTimestamp,
  formatDateToUnixTimestamp,
  formatDateToUnixMs,
  formatDateToExcel,
  formatDateToJulian,
  formatDateToLocal,
  formatDateToCustom,
  parseTimeInput,
} from '../../../utils/core'
import { useTheme } from '../../../context/ThemeContext'

/**
 * 时间格式转换工具组件
 * 支持多种时间格式之间的相互转换
 */
const EpochFormats = () => {
  const { theme, radius, font } = useTheme()
  const [input, setInput] = React.useState('')
  const [date, setDate] = React.useState(new Date())
  const [customFormat, setCustomFormat] = React.useState('YYYY-MM-DD HH:mm:ss')
  const [copied, setCopied] = React.useState(null)

  // 处理输入
  const handleInput = (value) => {
    setInput(value)
    if (value.trim()) {
      const parsed = parseTimeInput(value)
      if (parsed) {
        setDate(parsed)
      }
    }
  }

  // 设置当前时间
  const setCurrentTime = () => {
    const now = new Date()
    setDate(now)
    setInput(now.toISOString())
  }

  // 复制到剪贴板
  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(label)
      setTimeout(() => setCopied(null), 2000)
    } catch (e) {
      console.error('复制失败:', e)
    }
  }

  // 获取所有格式
  const formats = [
    {
      label: 'ISO 8601',
      value: formatDateToISO8601(date),
      description: '国际标准日期时间格式',
    },
    {
      label: 'RFC 2822',
      value: formatDateToRFC2822(date),
      description: '电子邮件标准格式',
    },
    {
      label: 'HTTP Date',
      value: formatDateToHTTP(date),
      description: 'HTTP协议日期头格式',
    },
    {
      label: 'SQL DateTime',
      value: formatDateToSQL(date),
      description: 'SQL数据库日期时间格式',
    },
    {
      label: 'SQL Timestamp',
      value: formatDateToSQLTimestamp(date),
      description: 'SQL时间戳格式（含毫秒）',
    },
    {
      label: 'Unix Timestamp (秒)',
      value: formatDateToUnixTimestamp(date),
      description: 'Unix时间戳（秒级）',
    },
    {
      label: 'Unix Timestamp (毫秒)',
      value: formatDateToUnixMs(date),
      description: 'Unix时间戳（毫秒级）',
    },
    {
      label: 'Excel Serial',
      value: formatDateToExcel(date),
      description: 'Excel日期序列号',
    },
    {
      label: 'Julian Date',
      value: formatDateToJulian(date),
      description: '儒略日',
    },
    {
      label: '本地时间',
      value: formatDateToLocal(date),
      description: '浏览器本地时区',
    },
    {
      label: '自定义格式',
      value: formatDateToCustom(date, customFormat),
      description: '用户自定义格式',
    },
  ]

  const reset = () => {
    setInput('')
    setDate(new Date())
    setCustomFormat('YYYY-MM-DD HH:mm:ss')
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <button
          onClick={setCurrentTime}
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
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
          </svg>
          当前时间
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

      {/* Input and custom format */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: font.ui }}>
            输入时间
          </label>
          <input
            type="text"
            value={input}
            onChange={(e) => handleInput(e.target.value)}
            placeholder="输入时间戳、ISO日期或其他格式..."
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
          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', fontFamily: font.ui }}>
            支持格式：Unix时间戳(秒/毫秒)、ISO 8601、RFC 2822、HTTP Date等
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: font.ui }}>
            自定义格式
          </label>
          <input
            type="text"
            value={customFormat}
            onChange={(e) => setCustomFormat(e.target.value)}
            placeholder="YYYY-MM-DD HH:mm:ss"
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
          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', fontFamily: font.ui }}>
            占位符: YYYY(年) MM(月) DD(日) HH(24时) hh(12时) mm(分) ss(秒) SSS(毫秒) A/a(AM/PM)
          </div>
        </div>
      </div>

      {/* Format cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        {formats.map((format) => (
          <div
            key={format.label}
            style={{
              padding: '12px',
              background: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
              borderRadius: radius.md,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 500, color: theme.textSecondary, fontFamily: font.ui }}>{format.label}</span>
              <button
                onClick={() => copyToClipboard(format.value, format.label)}
                style={{
                  padding: '4px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: copied === format.label ? theme.textPrimary : theme.textMuted,
                  fontSize: '12px',
                  fontFamily: font.ui,
                  transition: 'color 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = theme.textSecondary}
                onMouseLeave={e => e.currentTarget.style.color = copied === format.label ? theme.textPrimary : theme.textMuted}
              >
                {copied === format.label ? '✓' : '复制'}
              </button>
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500, color: theme.textPrimary, fontFamily: font.mono, wordBreak: 'break-all' }}>
              {format.value}
            </div>
            <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px', fontFamily: font.ui }}>
              {format.description}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EpochFormats