import React from 'react'
import { formatDuration, parseDuration, humanizeDuration } from '../../../utils/core'
import { useTheme } from '../../../context/ThemeContext'

/**
 * 时长格式化工具组件
 * 支持秒数转换、时:分:秒格式解析、人性化显示
 */
const DurationFormat = () => {
  const { theme, radius, font } = useTheme()
  const [input, setInput] = React.useState('3661')
  const [inputFormat, setInputFormat] = React.useState('seconds')
  const [error, setError] = React.useState('')

  // 计算秒数
  const getSeconds = () => {
    if (!input.trim()) return 0
    if (inputFormat === 'seconds') {
      const num = parseInt(input, 10)
      return isNaN(num) ? 0 : num
    }
    const result = parseDuration(input)
    return result.ok ? result.value : 0
  }

  const seconds = getSeconds()

  const handleParse = () => {
    setError('')
    if (!input.trim()) return

    if (inputFormat === 'hhmmss') {
      const result = parseDuration(input)
      if (!result.ok) {
        setError(result.error)
      }
    }
  }

  const reset = () => {
    setInput('3661')
    setInputFormat('seconds')
    setError('')
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {inputFormat === 'hhmmss' && (
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
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = theme.bgAccentHover}
            onMouseLeave={e => e.currentTarget.style.background = theme.bgAccent}
          >
            解析
          </button>
        )}
        <button
          onClick={reset}
          style={{
            padding: '6px 12px',
            background: theme.bgTertiary,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.sm,
            cursor: 'pointer',
            fontSize: '12px',
            fontFamily: font.ui,
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = theme.bgHover; e.currentTarget.style.borderColor = theme.borderHover }}
          onMouseLeave={e => { e.currentTarget.style.background = theme.bgTertiary; e.currentTarget.style.borderColor = theme.border }}
        >
          重置
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: theme.bgSecondary, borderRadius: radius.md, padding: '4px', border: `1px solid ${theme.border}` }}>
          <button
            onClick={() => { setInputFormat('seconds'); setError('') }}
            style={{
              padding: '8px 12px',
              borderRadius: radius.sm,
              fontSize: '13px',
              fontWeight: 500,
              background: inputFormat === 'seconds' ? theme.bgAccent : 'transparent',
              color: inputFormat === 'seconds' ? theme.bgPrimary : theme.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: font.ui,
            }}
            onMouseEnter={e => { if (inputFormat !== 'seconds') e.currentTarget.style.background = theme.bgHover }}
            onMouseLeave={e => { if (inputFormat !== 'seconds') e.currentTarget.style.background = 'transparent' }}
          >
            秒数
          </button>
          <button
            onClick={() => { setInputFormat('hhmmss'); setError('') }}
            style={{
              padding: '8px 12px',
              borderRadius: radius.sm,
              fontSize: '13px',
              fontWeight: 500,
              background: inputFormat === 'hhmmss' ? theme.bgAccent : 'transparent',
              color: inputFormat === 'hhmmss' ? theme.bgPrimary : theme.textSecondary,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: font.ui,
            }}
            onMouseEnter={e => { if (inputFormat !== 'hhmmss') e.currentTarget.style.background = theme.bgHover }}
            onMouseLeave={e => { if (inputFormat !== 'hhmmss') e.currentTarget.style.background = 'transparent' }}
          >
            时:分:秒
          </button>
        </div>
      </div>

      {/* Input */}
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 500, color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: font.ui }}>
          输入
        </label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputFormat === 'seconds' ? '输入秒数...' : '输入时长 (如 1:30:45)...'}
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

      {/* Error */}
      {error && (
        <div style={{ padding: '12px', background: theme.bgTertiary, border: `1px solid ${theme.border}`, borderRadius: radius.md, color: theme.error, fontSize: '14px', marginBottom: '12px', fontFamily: font.ui }}>
          {error}
        </div>
      )}

      {/* Conversion results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
        <div style={{ padding: '12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.md }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px', fontFamily: font.ui }}>秒</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: theme.textPrimary, fontFamily: font.ui }}>{seconds}</div>
        </div>
        <div style={{ padding: '12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.md }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px', fontFamily: font.ui }}>分钟</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: theme.textPrimary, fontFamily: font.ui }}>{(seconds / 60).toFixed(2)}</div>
        </div>
        <div style={{ padding: '12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.md }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px', fontFamily: font.ui }}>小时</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: theme.textPrimary, fontFamily: font.ui }}>{(seconds / 3600).toFixed(4)}</div>
        </div>
        <div style={{ padding: '12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.md }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px', fontFamily: font.ui }}>天</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: theme.textPrimary, fontFamily: font.ui }}>{(seconds / 86400).toFixed(4)}</div>
        </div>
      </div>

      {/* Format results */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '16px' }}>
        <div style={{ padding: '12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.md }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px', fontFamily: font.ui }}>格式化 (HH:MM:SS)</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: theme.textPrimary, fontFamily: font.mono }}>{formatDuration(seconds)}</div>
        </div>
        <div style={{ padding: '12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.md }}>
          <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px', fontFamily: font.ui }}>人性化</div>
          <div style={{ fontSize: '18px', fontWeight: 600, color: theme.textPrimary, fontFamily: font.mono }}>{humanizeDuration(seconds)}</div>
        </div>
      </div>

      {/* Reference */}
      <div style={{ padding: '12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.md, marginTop: '16px' }}>
        <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '8px', fontFamily: font.ui }}>常用时长参考</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
            <span style={{ color: theme.textSecondary, fontFamily: font.ui }}>1 分钟</span>
            <span style={{ color: theme.textPrimary, fontFamily: font.mono }}>60 秒</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
            <span style={{ color: theme.textSecondary, fontFamily: font.ui }}>1 小时</span>
            <span style={{ color: theme.textPrimary, fontFamily: font.mono }}>3600 秒</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
            <span style={{ color: theme.textSecondary, fontFamily: font.ui }}>1 天</span>
            <span style={{ color: theme.textPrimary, fontFamily: font.mono }}>86400 秒</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '13px' }}>
            <span style={{ color: theme.textSecondary, fontFamily: font.ui }}>1 周</span>
            <span style={{ color: theme.textPrimary, fontFamily: font.mono }}>604800 秒</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DurationFormat