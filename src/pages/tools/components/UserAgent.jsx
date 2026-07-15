import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

// UA 解析器
function parseUserAgent(ua) {
  const result = {
    browser: { name: '', version: '' },
    os: { name: '', version: '' },
    device: { vendor: '', model: '', type: 'desktop' },
    engine: { name: '', version: '' },
    cpu: { architecture: '' }
  }

  // Browser detection
  if (ua.includes('Firefox/')) {
    result.browser.name = 'Firefox'
    result.browser.version = ua.match(/Firefox\/(\d+\.?\d*)/)?.[1] || ''
    result.engine.name = 'Gecko'
    result.engine.version = ua.match(/Gecko\/(\d+)/)?.[1] || ''
  } else if (ua.includes('Edg/')) {
    result.browser.name = 'Edge'
    result.browser.version = ua.match(/Edg\/(\d+\.?\d*)/)?.[1] || ''
    result.engine.name = 'Blink'
  } else if (ua.includes('Chrome/')) {
    result.browser.name = 'Chrome'
    result.browser.version = ua.match(/Chrome\/(\d+\.?\d*)/)?.[1] || ''
    result.engine.name = 'Blink'
  } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
    result.browser.name = 'Safari'
    result.browser.version = ua.match(/Version\/(\d+\.?\d*)/)?.[1] || ''
    result.engine.name = 'WebKit'
  }

  // OS detection
  if (ua.includes('Windows NT 10')) result.os.name = 'Windows 10/11'
  else if (ua.includes('Windows NT 6.3')) result.os.name = 'Windows 8.1'
  else if (ua.includes('Windows NT 6.1')) result.os.name = 'Windows 7'
  else if (ua.includes('Mac OS X')) {
    result.os.name = 'macOS'
    result.os.version = ua.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || ''
  }
  else if (ua.includes('Android')) {
    result.os.name = 'Android'
    result.os.version = ua.match(/Android (\d+\.?\d*)/)?.[1] || ''
  }
  else if (ua.includes('iPhone') || ua.includes('iPad')) {
    result.os.name = 'iOS'
    result.os.version = ua.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || ''
  }
  else if (ua.includes('Linux')) result.os.name = 'Linux'

  // Device type
  if (ua.includes('Mobile')) result.device.type = 'mobile'
  else if (ua.includes('Tablet')) result.device.type = 'tablet'
  else if (ua.includes('SmartTV')) result.device.type = 'smarttv'

  // CPU architecture
  if (ua.includes('x86_64') || ua.includes('Win64')) result.cpu.architecture = 'x64'
  else if (ua.includes('arm')) result.cpu.architecture = 'arm'

  return result
}

const EXAMPLE_UAS = [
  { label: 'Chrome Windows', value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' },
  { label: 'Safari macOS', value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15' },
  { label: 'Firefox Linux', value: 'Mozilla/5.0 (X11; Linux x86_64; rv:121.0) Gecko/20100101 Firefox/121.0' },
  { label: 'iPhone Safari', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' },
  { label: 'Android Chrome', value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36' },
  { label: 'Googlebot', value: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
]

const UserAgent = () => {
  const { theme, radius, font } = useTheme()
  const [input, setInput] = React.useState('')
  const [result, setResult] = React.useState(null)

  const handleParse = () => {
    if (!input.trim()) {
      setResult(null)
      return
    }
    setResult(parseUserAgent(input))
  }

  const inputStyle = {
    width: '100%',
    padding: '12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    color: theme.textPrimary,
    fontFamily: font.mono,
    fontSize: '12px',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  }

  const cardStyle = {
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    padding: '16px',
    transition: 'border-color 0.15s ease',
  }

  const primaryButtonStyle = {
    padding: '8px 20px',
    background: theme.bgAccent,
    color: theme.bgPrimary,
    border: 'none',
    borderRadius: radius.sm,
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: font.ui,
    fontWeight: 500,
    marginBottom: '16px',
    transition: 'background 0.15s ease',
  }

  const secondaryButtonStyle = {
    padding: '6px 12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.sm,
    color: theme.textSecondary,
    fontSize: '11px',
    fontFamily: font.ui,
    cursor: 'pointer',
    transition: 'background 0.15s ease, border-color 0.15s ease',
  }

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={handleParse}
        onMouseEnter={e => e.currentTarget.style.background = theme.bgAccentHover}
        onMouseLeave={e => e.currentTarget.style.background = theme.bgAccent}
        style={primaryButtonStyle}
      >
        解析
      </button>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: theme.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          User Agent 字符串
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onFocus={e => e.currentTarget.style.borderColor = theme.borderHover}
          onBlur={e => e.currentTarget.style.borderColor = theme.border}
          placeholder="粘贴 User Agent 字符串..."
          style={{ ...inputStyle, minHeight: '80px' }}
          spellCheck={false}
        />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', fontSize: '11px', color: theme.textMuted, marginBottom: '8px' }}>
          示例 User Agent
        </label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {EXAMPLE_UAS.map(ua => (
            <button
              key={ua.label}
              onClick={() => setInput(ua.value)}
              onMouseEnter={e => {
                e.currentTarget.style.background = theme.bgHover
                e.currentTarget.style.borderColor = theme.borderHover
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = theme.bgSecondary
                e.currentTarget.style.borderColor = theme.border
              }}
              style={secondaryButtonStyle}
            >
              {ua.label}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
          {[
            { title: '浏览器', data: result.browser },
            { title: '操作系统', data: result.os },
            { title: '设备', data: result.device },
            { title: '渲染引擎', data: result.engine },
          ].map(({ title, data }) => (
            <div key={title} style={cardStyle}>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '8px' }}>{title}</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: theme.textPrimary }}>{data.name || '未知'}</div>
              <div style={{ fontSize: '12px', color: theme.textMuted }}>版本: {data.version || '-'}</div>
              {data.type && <div style={{ fontSize: '12px', color: theme.textMuted }}>类型: {data.type}</div>}
            </div>
          ))}
          {result.cpu.architecture && (
            <div style={cardStyle}>
              <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '8px' }}>CPU 架构</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: theme.textPrimary }}>{result.cpu.architecture}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default UserAgent