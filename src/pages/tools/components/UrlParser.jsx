import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

const UrlParser = () => {
  const { theme, radius, font } = useTheme()
  const [input, setInput] = React.useState('')
  const [parsed, setParsed] = React.useState(null)
  const [error, setError] = React.useState('')

  const parse = () => {
    if (!input.trim()) {
      setParsed(null)
      setError('')
      return
    }
    try {
      const url = new URL(input)
      setParsed({
        协议: url.protocol,
        主机: url.host,
        域名: url.hostname,
        端口: url.port || '(默认)',
        路径: url.pathname,
        查询参数: url.search || '(无)',
        哈希: url.hash || '(无)',
        完整URL: url.href
      })
      setError('')
    } catch (e) {
      setError('无效的 URL')
      setParsed(null)
    }
  }

  React.useEffect(() => { parse() }, [input])

  const styles = {
    container: {
      padding: '20px',
    },
    input: {
      width: '100%',
      padding: '12px',
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: radius.md,
      color: theme.textPrimary,
      fontFamily: font.ui,
      fontSize: '13px',
      outline: 'none',
      boxSizing: 'border-box',
    },
    errorBox: {
      padding: '12px 16px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: radius.md,
      color: '#ef4444',
      fontSize: '13px',
      fontFamily: font.ui,
      marginBottom: '12px',
    },
    resultGrid: {
      display: 'grid',
      gap: '8px',
    },
    resultRow: {
      display: 'flex',
      gap: '12px',
      padding: '8px 12px',
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: radius.md,
    },
    resultKey: {
      width: '80px',
      color: theme.textMuted,
      fontSize: '12px',
      fontFamily: font.ui,
    },
    resultValue: {
      fontFamily: font.ui,
      fontSize: '13px',
      color: theme.textPrimary,
      wordBreak: 'break-all',
    },
  }

  return (
    <div style={styles.container}>
      <input
        type="text"
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="输入 URL 进行解析 (如 https://example.com:8080/path?q=1#hash)"
        style={styles.input}
      />
      {error && <div style={styles.errorBox}>{error}</div>}
      {parsed && (
        <div style={{ ...styles.resultGrid, marginTop: '12px' }}>
          {Object.entries(parsed).map(([key, value]) => (
            <div key={key} style={styles.resultRow}>
              <div style={styles.resultKey}>{key}</div>
              <div style={styles.resultValue}>{value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default UrlParser
