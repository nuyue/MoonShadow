import React from 'react'
import { dateDifference, addDays, addMonths, addYears } from '../../../utils/core'
import { useTheme } from '../../../context/ThemeContext'

/**
 * 日期计算工具组件
 * 支持日期差值计算和日期加减
 */
const DateCalc = () => {
  const { theme, radius, font } = useTheme()
  const [mode, setMode] = React.useState('diff')
  const [date1, setDate1] = React.useState(new Date().toISOString().split('T')[0])
  const [date2, setDate2] = React.useState(new Date().toISOString().split('T')[0])
  const [baseDate, setBaseDate] = React.useState(new Date().toISOString().split('T')[0])
  const [addDays_, setAddDays] = React.useState(0)
  const [addMonths_, setAddMonths] = React.useState(0)
  const [addYears_, setAddYears] = React.useState(0)
  const [diffResult, setDiffResult] = React.useState(null)
  const [addResult, setAddResult] = React.useState(null)

  const handleDiff = () => {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    setDiffResult(dateDifference(d1, d2))
  }

  const handleAdd = () => {
    let result = new Date(baseDate)
    result = addDays(result, addDays_)
    result = addMonths(result, addMonths_)
    result = addYears(result, addYears_)
    setAddResult(result)
  }

  const reset = () => {
    setMode('diff')
    setDate1(new Date().toISOString().split('T')[0])
    setDate2(new Date().toISOString().split('T')[0])
    setBaseDate(new Date().toISOString().split('T')[0])
    setAddDays(0)
    setAddMonths(0)
    setAddYears(0)
    setDiffResult(null)
    setAddResult(null)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: theme.bgSecondary,
    color: theme.textPrimary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    fontSize: '14px',
    fontFamily: font.ui,
    outline: 'none',
    transition: 'border-color 0.15s, background 0.15s',
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '6px',
    fontSize: '12px',
    fontWeight: 500,
    color: theme.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: font.ui,
  }

  const resultCardStyle = {
    padding: '12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
  }

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <button
          onClick={mode === 'diff' ? handleDiff : handleAdd}
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
          计算
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: theme.bgSecondary,
          borderRadius: radius.md,
          padding: '4px',
          border: `1px solid ${theme.border}`,
        }}>
          <button
            onClick={() => setMode('diff')}
            style={{
              padding: '8px 12px',
              borderRadius: radius.sm,
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: font.ui,
              background: mode === 'diff' ? theme.bgAccent : 'transparent',
              color: mode === 'diff' ? theme.bgPrimary : theme.textSecondary,
              cursor: 'pointer',
              border: 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            日期差值
          </button>
          <button
            onClick={() => setMode('add')}
            style={{
              padding: '8px 12px',
              borderRadius: radius.sm,
              fontSize: '13px',
              fontWeight: 500,
              fontFamily: font.ui,
              background: mode === 'add' ? theme.bgAccent : 'transparent',
              color: mode === 'add' ? theme.bgPrimary : theme.textSecondary,
              cursor: 'pointer',
              border: 'none',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            日期加减
          </button>
        </div>
      </div>

      {mode === 'diff' ? (
        <div>
          {/* Date inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>开始日期</label>
              <input
                type="date"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = theme.borderHover; e.currentTarget.style.background = theme.bgTertiary }}
                onBlur={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgSecondary }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>结束日期</label>
              <input
                type="date"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = theme.borderHover; e.currentTarget.style.background = theme.bgTertiary }}
                onBlur={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgSecondary }}
              />
            </div>
          </div>

          {/* Results */}
          {diffResult && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '16px' }}>
              {[
                { label: '年', value: diffResult.years },
                { label: '月', value: diffResult.months },
                { label: '日', value: diffResult.days },
                { label: '总天数', value: diffResult.totalDays },
                { label: '周', value: diffResult.weeks },
                { label: '小时', value: diffResult.hours },
                { label: '分钟', value: diffResult.minutes },
                { label: '秒', value: diffResult.seconds },
              ].map(item => (
                <div key={item.label} style={resultCardStyle}>
                  <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px', fontFamily: font.ui }}>
                    {item.label}
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 600, color: theme.textPrimary, fontFamily: font.ui }}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Base date */}
          <div style={{ marginBottom: '12px' }}>
            <label style={labelStyle}>基准日期</label>
            <input
              type="date"
              value={baseDate}
              onChange={(e) => setBaseDate(e.target.value)}
              style={inputStyle}
              onFocus={e => { e.currentTarget.style.borderColor = theme.borderHover; e.currentTarget.style.background = theme.bgTertiary }}
              onBlur={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgSecondary }}
            />
          </div>

          {/* Add inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>加年</label>
              <input
                type="number"
                value={addYears_}
                onChange={(e) => setAddYears(Number(e.target.value))}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = theme.borderHover; e.currentTarget.style.background = theme.bgTertiary }}
                onBlur={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgSecondary }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>加月</label>
              <input
                type="number"
                value={addMonths_}
                onChange={(e) => setAddMonths(Number(e.target.value))}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = theme.borderHover; e.currentTarget.style.background = theme.bgTertiary }}
                onBlur={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgSecondary }}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <label style={labelStyle}>加日</label>
              <input
                type="number"
                value={addDays_}
                onChange={(e) => setAddDays(Number(e.target.value))}
                style={inputStyle}
                onFocus={e => { e.currentTarget.style.borderColor = theme.borderHover; e.currentTarget.style.background = theme.bgTertiary }}
                onBlur={e => { e.currentTarget.style.borderColor = theme.border; e.currentTarget.style.background = theme.bgSecondary }}
              />
            </div>
          </div>

          {/* Result */}
          {addResult && (
            <div style={{ ...resultCardStyle, marginTop: '16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 500, color: theme.textMuted, textTransform: 'uppercase', marginBottom: '4px', fontFamily: font.ui }}>
                结果日期
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: theme.textPrimary, fontFamily: font.ui }}>
                {addResult.toLocaleDateString('zh-CN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default DateCalc
