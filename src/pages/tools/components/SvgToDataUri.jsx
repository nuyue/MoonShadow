import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

const FORMAT_LABELS = {
  'base64': 'Base64 Data URI',
  'uri-encoded': 'URL 编码 Data URI',
  'background-css': 'CSS background-image',
  'img-tag': 'React/JSX img',
  'html-img': 'HTML img 标签',
}

function svgToBase64(svg) {
  return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)))
}

function svgToURIEncoded(svg) {
  const encoded = svg
    .replace(/"/g, "'")
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E')
    .replace(/&/g, '%26')
    .replace(/#/g, '%23')
  return `data:image/svg+xml,${encoded}`
}

const SvgToDataUri = () => {
  const { theme, radius, font } = useTheme()
  const [input, setInput] = React.useState('')
  const [format, setFormat] = React.useState('base64')
  const [copied, setCopied] = React.useState(false)

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setInput(ev.target?.result)
    reader.readAsText(file)
    e.target.value = ''
  }

  const getOutput = React.useCallback(() => {
    if (!input.trim() || !input.includes('<svg')) return ''

    try {
      const base64 = svgToBase64(input)
      const uriEncoded = svgToURIEncoded(input)

      switch (format) {
        case 'base64': return base64
        case 'uri-encoded': return uriEncoded
        case 'background-css': return `.element {\n  background-image: url("${uriEncoded}");\n  background-repeat: no-repeat;\n  background-size: contain;\n}`
        case 'img-tag': return `<img src="${base64}" alt="SVG Image" />`
        case 'html-img': return `<img src="${base64}" alt="SVG Image">`
        default: return base64
      }
    } catch {
      return '转换失败，请检查 SVG 是否有效'
    }
  }, [input, format])

  const output = getOutput()

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const textareaStyle = {
    width: '100%',
    minHeight: '300px',
    padding: '12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    color: theme.textPrimary,
    fontFamily: font.mono,
    fontSize: '12px',
    resize: 'vertical',
    outline: 'none',
  }

  const buttonStyle = {
    padding: '6px 12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.sm,
    color: theme.textSecondary,
    fontSize: '12px',
    cursor: 'pointer',
  }

  const formatButtonStyle = (active) => ({
    padding: '6px 12px',
    background: active ? theme.bgAccent : theme.bgSecondary,
    border: `1px solid ${active ? 'transparent' : theme.border}`,
    borderRadius: radius.sm,
    color: active ? theme.bgPrimary : theme.textSecondary,
    fontSize: '12px',
    cursor: 'pointer',
  })

  return (
    <div style={{ padding: '20px' }}>
      {/* 格式选择 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', fontWeight: '500', color: theme.textMuted, marginBottom: '8px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>输出格式</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {Object.keys(FORMAT_LABELS).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              style={formatButtonStyle(format === f)}
            >
              {FORMAT_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* 输入 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '11px', fontWeight: '500', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>输入 SVG</label>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              background: theme.bgTertiary,
              borderRadius: radius.sm,
              cursor: 'pointer',
              fontSize: '11px',
              color: theme.textSecondary,
            }}>
              上传文件
              <input type="file" accept=".svg" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="粘贴 SVG 代码..."
            style={textareaStyle}
          />
          {/* 预览 */}
          {input && input.includes('<svg') && (
            <div style={{
              height: '96px',
              background: '#fff',
              border: `1px solid ${theme.border}`,
              borderRadius: radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              overflow: 'hidden',
            }}>
              <div style={{ maxWidth: '100px', maxHeight: '80px' }} dangerouslySetInnerHTML={{ __html: input }} />
            </div>
          )}
        </div>

        {/* 输出 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <label style={{ fontSize: '11px', fontWeight: '500', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>转换结果</label>
            {output && (
              <button onClick={handleCopy} style={{ ...buttonStyle, padding: '4px 8px', fontSize: '11px' }}>
                {copied ? '✓ 已复制' : '复制'}
              </button>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="Data URI 将显示在这里..."
            style={{ ...textareaStyle, color: output ? theme.textPrimary : theme.textMuted, wordBreak: 'break-all' }}
          />
          {/* 大小信息 */}
          {output && (
            <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: theme.textMuted }}>
              <span>输入: {new Blob([input]).size} B</span>
              <span>输出: {new Blob([output]).size} B</span>
              <span style={{ color: theme.bgAccent }}>
                膨胀率: {((new Blob([output]).size / new Blob([input]).size) * 100).toFixed(0)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SvgToDataUri
