import React from 'react'
import { useTheme, RADIUS, FONT } from '../../../context/ThemeContext'

const fontPairs = [
  { name: '现代简约', heading: 'Inter', body: 'Open Sans', category: 'sans-serif' },
  { name: '优雅衬线', heading: 'Playfair Display', body: 'Source Sans Pro', category: 'serif' },
  { name: '科技感', heading: 'Roboto', body: 'Roboto Mono', category: 'sans-serif' },
  { name: '自然舒适', heading: 'Nunito', body: 'Lato', category: 'sans-serif' },
  { name: '经典复古', heading: 'Merriweather', body: 'Lora', category: 'serif' },
  { name: '粗犷有力', heading: 'Oswald', body: 'Raleway', category: 'sans-serif' },
  { name: '清新文艺', heading: 'Quicksand', body: 'Work Sans', category: 'sans-serif' },
  { name: '高端奢华', heading: 'Cormorant Garamond', body: 'Proza Libre', category: 'serif' },
  { name: '活泼俏皮', heading: 'Fredoka One', body: 'Quicksand', category: 'display' },
  { name: '专业商务', heading: 'Montserrat', body: 'Open Sans', category: 'sans-serif' },
]

const categories = ['全部', 'sans-serif', 'serif', 'display', 'monospace']

const FontPair = () => {
  const { theme, radius, font } = useTheme()
  const [selectedPair, setSelectedPair] = React.useState(0)
  const [category, setCategory] = React.useState('全部')
  const [customHeading, setCustomHeading] = React.useState('')
  const [customBody, setCustomBody] = React.useState('')
  const [useCustom, setUseCustom] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  const heading = useCustom ? customHeading : fontPairs[selectedPair]?.heading || 'Inter'
  const body = useCustom ? customBody : fontPairs[selectedPair]?.body || 'Open Sans'

  const filteredPairs = React.useMemo(() => {
    if (category === '全部') return fontPairs
    return fontPairs.filter(p => p.category === category)
  }, [category])

  const generateCode = () => {
    const html = `<link href="https://fonts.googleapis.com/css2?family=${heading.replace(/ /g, '+')}:wght@400;700&family=${body.replace(/ /g, '+')}:wght@400;700&display=swap" rel="stylesheet">

<style>
  h1, h2, h3, h4, h5, h6 {
    font-family: '${heading}', sans-serif;
  }
  body, p {
    font-family: '${body}', sans-serif;
  }
</style>`
    navigator.clipboard.writeText(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sampleText = {
    heading: 'The Quick Brown Fox',
    body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  }

  const selectStyle = {
    padding: '8px 12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.sm,
    color: theme.textPrimary,
    fontSize: '13px',
    outline: 'none',
    flex: 1,
  }

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.sm,
    color: theme.textPrimary,
    fontSize: '13px',
    outline: 'none',
  }

  const buttonStyle = {
    padding: '8px 16px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.sm,
    color: theme.textSecondary,
    fontSize: '12px',
    cursor: 'pointer',
  }

  const primaryButtonStyle = {
    padding: '8px 16px',
    background: theme.bgAccent,
    border: 'none',
    borderRadius: radius.sm,
    color: theme.bgPrimary,
    fontSize: '12px',
    cursor: 'pointer',
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <button
          onClick={() => setUseCustom(!useCustom)}
          style={useCustom ? primaryButtonStyle : buttonStyle}
        >
          自定义
        </button>
      </div>

      {useCustom ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '500', marginBottom: '8px', display: 'block' }}>标题字体</label>
            <input
              type="text"
              value={customHeading}
              onChange={e => setCustomHeading(e.target.value)}
              placeholder="例如：Inter"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '500', marginBottom: '8px', display: 'block' }}>正文字体</label>
            <input
              type="text"
              value={customBody}
              onChange={e => setCustomBody(e.target.value)}
              placeholder="例如：Open Sans"
              style={inputStyle}
            />
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', marginBottom: '16px' }}>
          {filteredPairs.map((pair, index) => {
            const globalIndex = fontPairs.findIndex(p => p.name === pair.name)
            return (
              <button
                key={pair.name}
                onClick={() => setSelectedPair(globalIndex)}
                style={{
                  padding: '12px',
                  background: fontPairs[selectedPair]?.name === pair.name ? 'rgba(59, 130, 246, 0.15)' : theme.bgSecondary,
                  border: `1px solid ${fontPairs[selectedPair]?.name === pair.name ? '#3b82f6' : theme.border}`,
                  borderRadius: radius.md,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: '12px', fontWeight: '500', color: theme.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pair.name}</div>
                <div style={{ fontSize: '10px', color: theme.textMuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pair.heading}</div>
              </button>
            )
          })}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '500', marginBottom: '8px', display: 'block' }}>预览</label>
        <div style={{ background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.md, padding: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px', fontFamily: heading }}>{sampleText.heading}</h1>
          <p style={{ fontSize: '14px', lineHeight: '1.6', fontFamily: body }}>{sampleText.body}</p>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: theme.textMuted, marginTop: '16px' }}>
            <span>标题字体：{heading}</span>
            <span>正文字体：{body}</span>
          </div>
        </div>
      </div>

      <button style={primaryButtonStyle} onClick={generateCode}>
        {copied ? '已复制' : '复制 HTML/CSS'}
      </button>

      <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '12px' }}>
        字体来源：<a href="https://fonts.google.com" target="_blank" rel="noopener noreferrer" style={{ color: theme.bgAccent }}>Google Fonts</a>
      </div>
    </div>
  )
}

export default FontPair