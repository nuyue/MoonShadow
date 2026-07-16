import React from 'react'
import { TIMEZONES } from '../../../utils/core'

/**
 * 时区转换工具组件
 * 支持全球各时区之间的时间转换
 */
const TimezoneConvert = () => {
  const [inputTime, setInputTime] = React.useState(new Date().toISOString().slice(0, 16))
  const [sourceTz, setSourceTz] = React.useState('Asia/Shanghai')
  const [targetTz, setTargetTz] = React.useState('America/New_York')

  // 计算所有时区的时间
  const getConvertedTimes = () => {
    const date = new Date(inputTime)
    return TIMEZONES.map((tz) => ({
      ...tz,
      time: date.toLocaleString('zh-CN', { timeZone: tz.value, hour12: false }),
    }))
  }

  const convertedTimes = getConvertedTimes()

  // 计算选定时区的结果
  const getSelectedResult = () => {
    const date = new Date(inputTime)
    return {
      source: date.toLocaleString('zh-CN', { timeZone: sourceTz, hour12: false }),
      target: date.toLocaleString('zh-CN', { timeZone: targetTz, hour12: false }),
    }
  }

  const selectedResult = getSelectedResult()

  const reset = () => {
    setInputTime(new Date().toISOString().slice(0, 16))
    setSourceTz('Asia/Shanghai')
    setTargetTz('America/New_York')
  }

  // 样式定义
  const styles = {
    container: {
      padding: '20px',
    },
    header: {
      marginBottom: '16px',
    },
    resetButton: {
      padding: '6px 12px',
      background: '#F59E0B',
      color: 'white',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      fontSize: '12px',
    },
    inputGroup: {
      marginBottom: '12px',
    },
    label: {
      display: 'block',
      marginBottom: '6px',
      fontSize: '12px',
      fontWeight: 500,
      color: '#64748B',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #E2E8F0',
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: font.ui,
    },
    select: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid #E2E8F0',
      borderRadius: '6px',
      fontSize: '14px',
      background: 'white',
    },
    grid2: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '12px',
    },
    resultCard: {
      padding: '12px',
      background: '#F8FAFC',
      border: '1px solid #E2E8F0',
      borderRadius: '8px',
    },
    resultCardAccent: {
      padding: '12px',
      background: '#ECFEFF',
      border: '1px solid #CFFAFE',
      borderRadius: '8px',
    },
    resultLabel: {
      fontSize: '11px',
      fontWeight: 500,
      color: '#94A3B8',
      marginBottom: '4px',
    },
    resultLabelAccent: {
      fontSize: '11px',
      fontWeight: 500,
      color: '#06B6D4',
      marginBottom: '4px',
    },
    resultValue: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#1E293B',
      fontFamily: font.ui,
    },
    resultValueAccent: {
      fontSize: '18px',
      fontWeight: 600,
      color: '#0891B2',
      fontFamily: font.ui,
    },
    tzLabel: {
      fontSize: '12px',
      fontWeight: 500,
      color: '#64748B',
      marginBottom: '8px',
    },
    tzGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '8px',
      maxHeight: '300px',
      overflowY: 'auto',
    },
    tzCard: (isSelected) => ({
      padding: '8px',
      background: isSelected ? '#ECFEFF' : '#F8FAFC',
      border: `1px solid ${isSelected ? '#06B6D4' : '#E2E8F0'}`,
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.15s',
    }),
    tzName: {
      fontSize: '11px',
      color: '#64748B',
    },
    tzTime: {
      fontSize: '13px',
      fontWeight: 500,
      color: '#1E293B',
      fontFamily: font.ui,
    },
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={reset} style={styles.resetButton}>
          重置
        </button>
      </div>

      {/* Input time */}
      <div style={styles.inputGroup}>
        <label style={styles.label}>输入时间</label>
        <input
          type="datetime-local"
          value={inputTime}
          onChange={(e) => setInputTime(e.target.value)}
          style={styles.input}
        />
      </div>

      {/* Timezone selectors */}
      <div style={styles.grid2}>
        <div style={styles.inputGroup}>
          <label style={styles.label}>源时区</label>
          <select
            value={sourceTz}
            onChange={(e) => setSourceTz(e.target.value)}
            style={styles.select}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
        <div style={styles.inputGroup}>
          <label style={styles.label}>目标时区</label>
          <select
            value={targetTz}
            onChange={(e) => setTargetTz(e.target.value)}
            style={styles.select}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz.value} value={tz.value}>
                {tz.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected result */}
      <div style={{ ...styles.grid2, marginTop: '16px' }}>
        <div style={styles.resultCard}>
          <div style={styles.resultLabel}>
            {TIMEZONES.find((tz) => tz.value === sourceTz)?.label}
          </div>
          <div style={styles.resultValue}>{selectedResult.source}</div>
        </div>
        <div style={styles.resultCardAccent}>
          <div style={styles.resultLabelAccent}>
            {TIMEZONES.find((tz) => tz.value === targetTz)?.label}
          </div>
          <div style={styles.resultValueAccent}>{selectedResult.target}</div>
        </div>
      </div>

      {/* All timezones */}
      <div style={{ marginTop: '16px' }}>
        <div style={styles.tzLabel}>所有时区</div>
        <div style={styles.tzGrid}>
          {convertedTimes.map((tz) => (
            <div
              key={tz.value}
              style={styles.tzCard(tz.value === targetTz)}
              onClick={() => setTargetTz(tz.value)}
            >
              <div style={styles.tzName}>{tz.label}</div>
              <div style={styles.tzTime}>{tz.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default TimezoneConvert