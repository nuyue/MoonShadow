import React from 'react'
import { useTheme, RADIUS, FONT } from '../../../context/ThemeContext'

// 简易二维码生成器（使用 Canvas API）
function generateQRCode(text, size, fgColor, bgColor, errorCorrection) {
  // 简化版：使用外部 API 或返回占位符
  // 实际项目中应使用 qrcode 库
  return null
}

const Qrcode = () => {
  const { theme, radius, font } = useTheme()
  const [contentType, setContentType] = React.useState('text')
  const [text, setText] = React.useState('')
  const [wifiConfig, setWifiConfig] = React.useState({ ssid: '', password: '', security: 'WPA', hidden: false })
  const [vcardConfig, setVCardConfig] = React.useState({ name: '', phone: '', email: '', organization: '', url: '' })
  const [size, setSize] = React.useState(256)
  const [fgColor, setFgColor] = React.useState('#000000')
  const [bgColor, setBgColor] = React.useState('#ffffff')
  const [error, setError] = React.useState('')
  const [copied, setCopied] = React.useState(false)

  const generateWifiString = () => {
    const hidden = wifiConfig.hidden ? 'H:true;' : ''
    return `WIFI:T:${wifiConfig.security};S:${wifiConfig.ssid};P:${wifiConfig.password};${hidden};`
  }

  const generateVCardString = () => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      vcardConfig.name && `FN:${vcardConfig.name}`,
      vcardConfig.phone && `TEL:${vcardConfig.phone}`,
      vcardConfig.email && `EMAIL:${vcardConfig.email}`,
      vcardConfig.organization && `ORG:${vcardConfig.organization}`,
      vcardConfig.url && `URL:${vcardConfig.url}`,
      'END:VCARD',
    ].filter(Boolean)
    return lines.join('\n')
  }

  const getContent = () => {
    switch (contentType) {
      case 'wifi': return generateWifiString()
      case 'vcard': return generateVCardString()
      default: return text
    }
  }

  const content = getContent()
  const qrDataUrl = content.trim() ? `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(content)}&color=${fgColor.slice(1)}&bgcolor=${bgColor.slice(1)}` : ''

  const downloadQRCode = () => {
    if (!qrDataUrl) return
    const a = document.createElement('a')
    a.href = qrDataUrl
    a.download = `qrcode-${Date.now()}.png`
    a.click()
  }

  const copyQRCode = async () => {
    if (!qrDataUrl) return
    try {
      const response = await fetch(qrDataUrl)
      const blob = await response.blob()
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob }),
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }

  const textareaStyle = {
    width: '100%',
    minHeight: '120px',
    padding: '12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    color: theme.textPrimary,
    fontFamily: font.ui,
    fontSize: '13px',
    resize: 'vertical',
    outline: 'none',
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.sm,
    color: theme.textPrimary,
    fontSize: '13px',
    outline: 'none',
  }

  const selectStyle = {
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

  const tabStyle = (active) => ({
    padding: '8px 16px',
    background: active ? theme.bgAccent : 'transparent',
    border: 'none',
    borderRadius: radius.sm,
    color: active ? theme.bgPrimary : theme.textMuted,
    fontSize: '12px',
    cursor: 'pointer',
  })

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: theme.bgSecondary, padding: '4px', borderRadius: radius.md }}>
        {[
          { type: 'text', label: '文本' },
          { type: 'url', label: 'URL' },
          { type: 'wifi', label: 'WiFi' },
          { type: 'vcard', label: '名片' },
        ].map(({ type, label }) => (
          <button key={type} onClick={() => setContentType(type)} style={tabStyle(contentType === type)}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          {contentType === 'wifi' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>WiFi 名称 (SSID)</label>
                <input type="text" value={wifiConfig.ssid} onChange={e => setWifiConfig({ ...wifiConfig, ssid: e.target.value })} placeholder="输入 WiFi 名称" style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>密码</label>
                <input type="password" value={wifiConfig.password} onChange={e => setWifiConfig({ ...wifiConfig, password: e.target.value })} placeholder="输入 WiFi 密码" style={inputStyle} />
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>加密类型</label>
                  <select value={wifiConfig.security} onChange={e => setWifiConfig({ ...wifiConfig, security: e.target.value })} style={selectStyle}>
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">无密码</option>
                  </select>
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.textSecondary }}>
                  <input type="checkbox" checked={wifiConfig.hidden} onChange={e => setWifiConfig({ ...wifiConfig, hidden: e.target.checked })} />
                  隐藏网络
                </label>
              </div>
            </div>
          ) : contentType === 'vcard' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>姓名</label>
                  <input type="text" value={vcardConfig.name} onChange={e => setVCardConfig({ ...vcardConfig, name: e.target.value })} placeholder="张三" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>电话</label>
                  <input type="tel" value={vcardConfig.phone} onChange={e => setVCardConfig({ ...vcardConfig, phone: e.target.value })} placeholder="13800138000" style={inputStyle} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>邮箱</label>
                <input type="email" value={vcardConfig.email} onChange={e => setVCardConfig({ ...vcardConfig, email: e.target.value })} placeholder="example@email.com" style={inputStyle} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>公司</label>
                  <input type="text" value={vcardConfig.organization} onChange={e => setVCardConfig({ ...vcardConfig, organization: e.target.value })} placeholder="公司名称" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>网站</label>
                  <input type="url" value={vcardConfig.url} onChange={e => setVCardConfig({ ...vcardConfig, url: e.target.value })} placeholder="https://example.com" style={inputStyle} />
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '8px', display: 'block' }}>
                {contentType === 'url' ? 'URL 地址' : '文本内容'}
              </label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder={contentType === 'url' ? 'https://example.com' : '输入要编码的文本...'}
                style={textareaStyle}
              />
            </div>
          )}

          {/* 样式设置 */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: `1px solid ${theme.border}` }}>
            <h4 style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '12px', fontWeight: '500' }}>样式设置</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px', display: 'block' }}>尺寸: {size}px</label>
                <input type="range" min="128" max="512" step="32" value={size} onChange={e => setSize(Number(e.target.value))} style={{ width: '100%' }} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px', display: 'block' }}>前景色</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ width: '40px', height: '32px', border: 'none', borderRadius: radius.sm, cursor: 'pointer' }} />
                  <input type="text" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ ...inputStyle, flex: 1, fontFamily: font.ui }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px', display: 'block' }}>背景色</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ width: '40px', height: '32px', border: 'none', borderRadius: radius.sm, cursor: 'pointer' }} />
                  <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ ...inputStyle, flex: 1, fontFamily: font.ui }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          {qrDataUrl ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ background: theme.bgPrimary, padding: '16px', borderRadius: radius.md, marginBottom: '16px' }}>
                <img src={qrDataUrl} alt="QR Code" style={{ maxWidth: '100%', width: Math.min(size, 300) }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                <button style={primaryButtonStyle} onClick={downloadQRCode}>下载</button>
                <button style={buttonStyle} onClick={copyQRCode}>{copied ? '已复制' : '复制图片'}</button>
              </div>
            </div>
          ) : (
            <div style={{ width: '200px', height: '200px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ textAlign: 'center', color: theme.textMuted }}>
                <div style={{ fontSize: '48px', marginBottom: '8px', opacity: 0.5 }}>⬛</div>
                <p style={{ fontSize: '12px', margin: 0 }}>输入内容生成二维码</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Qrcode