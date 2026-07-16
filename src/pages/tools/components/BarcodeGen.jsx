import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

// 条码格式定义
const BARCODE_FORMATS = {
  CODE128: { name: 'Code 128', description: '高密度字母数字条码', example: 'ABC-12345' },
  CODE39: { name: 'Code 39', description: '字母数字条码，支持特殊字符', example: 'ABC123' },
  EAN13: { name: 'EAN-13', description: '13位国际商品条码', example: '5901234123457' },
  EAN8: { name: 'EAN-8', description: '8位短商品条码', example: '12345670' },
  UPC: { name: 'UPC-A', description: '12位北美商品条码', example: '123456789012' },
  ITF14: { name: 'ITF-14', description: '14位物流包装条码', example: '12345678901231' },
  pharmacode: { name: 'Pharmacode', description: '药品包装条码(3-131070)', example: '1234' },
  codabar: { name: 'Codabar', description: '数字条码，常用于图书馆', example: 'A12345B' },
}

const DEFAULT_VALUES = {
  CODE128: 'ABC-12345',
  CODE39: 'ABC123',
  EAN13: '5901234123457',
  EAN8: '12345670',
  UPC: '123456789012',
  ITF14: '12345678901231',
  pharmacode: '1234',
  codabar: 'A12345B',
}

// 简易条码生成器 - 使用 Canvas 绘制
// Code 128 编码表
const CODE128_PATTERNS = [
  '11011001100', '11001101100', '11001100110', '10010011000', '10010001100',
  '10001001100', '10011001000', '10011000100', '10001100100', '11001001000',
  '11001000100', '11000100100', '10110011100', '10011011100', '10011001110',
  '10111001100', '10011101100', '10011100110', '11001110010', '11001011100',
  '11001001110', '11011100100', '11001110100', '11101101110', '11101001110',
  '11100101110', '11100110110', '11100110010', '11011011000', '11011000110',
  '11000110110', '10100011000', '10001011000', '10001000110', '10110001000',
  '10001101000', '10001100010', '11010001000', '11000101000', '11000100010',
  '10110111000', '10110001110', '10001101110', '10111011000', '10111000110',
  '10001110110', '11101110110', '11010001110', '11000101110', '11011101000',
  '11011100010', '11011101110', '11101011000', '11101000110', '11100010110',
  '11101101000', '11101100010', '11100011010', '11101111010', '11001000010',
  '11110001010', '10100110000', '10100001100', '10010110000', '10010000110',
  '10000101100', '10000100110', '10110010000', '10110000100', '10011010000',
  '10011000010', '10000110100', '10000110010', '11000010010', '11001010000',
  '11110111010', '11000010100', '10001111010', '10100111100', '10010111100',
  '10010011110', '10111100100', '10011110100', '10011110010', '11110100100',
  '11110010100', '11110010010', '11011011110', '11011110110', '11110110110',
  '10101111000', '10100011110', '10001011110', '10111101000', '10111100010',
  '11110101000', '11110100010', '10111011110', '10111101110', '11101011110',
  '11110101110', '11010000100', '11010010000', '11010011100',
]

const CODE128_START_B = 104
const CODE128_STOP = 106

function encodeCode128B(text) {
  const values = [CODE128_START_B]
  let checksum = CODE128_START_B

  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    const value = charCode >= 32 && charCode <= 127 ? charCode - 32 : 0
    values.push(value)
    checksum += value * (i + 1)
  }

  checksum = checksum % 103
  values.push(checksum)
  values.push(CODE128_STOP)

  let pattern = ''
  for (const v of values) {
    pattern += CODE128_PATTERNS[v]
  }

  return pattern
}

// Code 39 编码表
const CODE39_PATTERNS = {
  '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
  '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
  '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
  'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
  'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
  'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
  'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
  'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
  'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
  '-': '100101011011', '.': '110010101101', ' ': '100110101101', '$': '100101001101',
  '/': '100100101011', '+': '100101001011', '%': '100101010011',
  '*': '110010100101',
}

function encodeCode39(text) {
  const upper = text.toUpperCase()
  let pattern = CODE39_PATTERNS['*']
  for (const ch of upper) {
    if (CODE39_PATTERNS[ch]) {
      pattern += '0' + CODE39_PATTERNS[ch]
    }
  }
  pattern += '0' + CODE39_PATTERNS['*']
  return pattern
}

// EAN-13 编码
const EAN13_L = ['0001101', '0011001', '0010011', '0111101', '0100011', '0110001', '0101111', '0111011', '0110111', '0001011']
const EAN13_G = ['0100111', '0110011', '0011011', '0100001', '0011101', '0111001', '0000101', '0010001', '0001001', '0010111']
const EAN13_R = ['1110010', '1100110', '1101100', '1000010', '1011100', '1001110', '1010000', '1000100', '1001000', '1110100']
const EAN13_PARITY = ['LLLLLL', 'LLGLGG', 'LLGGLG', 'LLGGGL', 'LGLLGG', 'LGGLLG', 'LGGGLL', 'LGLGLG', 'LGLGGL', 'LGGLGL']

function encodeEAN13(text) {
  const digits = text.replace(/\D/g, '').padStart(13, '0').slice(0, 13)
  const firstDigit = parseInt(digits[0])
  const parityPattern = EAN13_PARITY[firstDigit]

  let pattern = '101'
  for (let i = 0; i < 6; i++) {
    const d = parseInt(digits[i + 1])
    pattern += parityPattern[i] === 'L' ? EAN13_L[d] : EAN13_G[d]
  }
  pattern += '01010'
  for (let i = 0; i < 6; i++) {
    const d = parseInt(digits[i + 7])
    pattern += EAN13_R[d]
  }
  pattern += '101'
  return pattern
}

// EAN-8 编码
function encodeEAN8(text) {
  const digits = text.replace(/\D/g, '').padStart(8, '0').slice(0, 8)
  let pattern = '101'
  for (let i = 0; i < 4; i++) {
    pattern += EAN13_L[parseInt(digits[i])]
  }
  pattern += '01010'
  for (let i = 0; i < 4; i++) {
    pattern += EAN13_R[parseInt(digits[i + 4])]
  }
  pattern += '101'
  return pattern
}

function drawBarcode(canvas, pattern, options) {
  const { lineColor, background, barWidth, height, displayValue, value, fontSize } = options
  const ctx = canvas.getContext('2d')
  const totalWidth = pattern.length * barWidth + 20
  const totalHeight = height + (displayValue ? 30 : 0) + 20

  canvas.width = totalWidth
  canvas.height = totalHeight

  ctx.fillStyle = background
  ctx.fillRect(0, 0, totalWidth, totalHeight)

  ctx.fillStyle = lineColor
  let x = 10
  for (const bit of pattern) {
    if (bit === '1') {
      ctx.fillRect(x, 10, barWidth, height)
    }
    x += barWidth
  }

  if (displayValue) {
    ctx.fillStyle = lineColor
    ctx.font = `${fontSize}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText(value, totalWidth / 2, height + 10 + fontSize)
  }
}

const BarcodeGen = () => {
  const { theme, radius, font } = useTheme()
  const [format, setFormat] = React.useState('CODE128')
  const [value, setValue] = React.useState('ABC-12345')
  const [lineColor, setLineColor] = React.useState('#000000')
  const [background, setBackground] = React.useState('#FFFFFF')
  const [barWidth, setBarWidth] = React.useState(2)
  const [height, setHeight] = React.useState(100)
  const [displayValue, setDisplayValue] = React.useState(true)
  const [fontSize, setFontSize] = React.useState(16)
  const [error, setError] = React.useState('')
  const [copied, setCopied] = React.useState(false)
  const canvasRef = React.useRef(null)

  React.useEffect(() => {
    setValue(DEFAULT_VALUES[format] || '')
  }, [format])

  const generateBarcode = React.useCallback(() => {
    if (!canvasRef.current || !value.trim()) return
    setError('')

    try {
      let pattern = null
      switch (format) {
        case 'CODE128':
          pattern = encodeCode128B(value)
          break
        case 'CODE39':
          pattern = encodeCode39(value)
          break
        case 'EAN13':
          if (!/^\d{12,13}$/.test(value.replace(/\D/g, ''))) {
            setError('EAN-13 需要12-13位数字')
            return
          }
          pattern = encodeEAN13(value)
          break
        case 'EAN8':
          if (!/^\d{7,8}$/.test(value.replace(/\D/g, ''))) {
            setError('EAN-8 需要7-8位数字')
            return
          }
          pattern = encodeEAN8(value)
          break
        case 'UPC':
          if (!/^\d{11,12}$/.test(value.replace(/\D/g, ''))) {
            setError('UPC-A 需要11-12位数字')
            return
          }
          pattern = encodeEAN13('0' + value.replace(/\D/g, ''))
          break
        case 'ITF14':
          if (!/^\d{13,14}$/.test(value.replace(/\D/g, ''))) {
            setError('ITF-14 需要13-14位数字')
            return
          }
          // 简化：使用 Code128 编码
          pattern = encodeCode128B(value)
          break
        case 'pharmacode':
          const num = parseInt(value)
          if (isNaN(num) || num < 3 || num > 131070) {
            setError('Pharmacode 需要3-131070之间的数字')
            return
          }
          // 简化：使用 Code128 编码
          pattern = encodeCode128B(value)
          break
        case 'codabar':
          pattern = encodeCode39(value.replace(/[^A-Z0-9\-. $/+%]/g, ''))
          break
        default:
          pattern = encodeCode128B(value)
      }

      if (pattern) {
        drawBarcode(canvasRef.current, pattern, {
          lineColor,
          background,
          barWidth,
          height,
          displayValue,
          value,
          fontSize,
        })
      }
    } catch (e) {
      setError(e.message || '生成条码失败')
    }
  }, [value, format, lineColor, background, barWidth, height, displayValue, fontSize])

  React.useEffect(() => {
    generateBarcode()
  }, [generateBarcode])

  const downloadPng = () => {
    if (!canvasRef.current) return
    const a = document.createElement('a')
    a.href = canvasRef.current.toDataURL('image/png')
    a.download = `barcode-${format.toLowerCase()}.png`
    a.click()
  }

  const downloadSvg = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><foreignObject width="100%" height="100%"><img xmlns="http://www.w3.org/1999/xhtml" src="${canvas.toDataURL('image/png')}" width="${canvas.width}" height="${canvas.height}"/></foreignObject></svg>`
    const blob = new Blob([svgContent], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `barcode-${format.toLowerCase()}.svg`
    a.click()
    URL.revokeObjectURL(url)
  }

  const copySvg = () => {
    if (!canvasRef.current) return
    const dataUrl = canvasRef.current.toDataURL('image/png')
    navigator.clipboard.writeText(dataUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
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

  const formatButtonStyle = (active) => ({
    padding: '8px 12px',
    background: active ? theme.bgAccent : theme.bgSecondary,
    border: `1px solid ${active ? 'transparent' : theme.border}`,
    borderRadius: radius.sm,
    color: active ? theme.bgPrimary : theme.textSecondary,
    fontSize: '11px',
    cursor: 'pointer',
    textAlign: 'left',
  })

  return (
    <div style={{ padding: '20px' }}>
      {/* 格式选择 */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '8px', display: 'block', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>条码格式</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
          {Object.keys(BARCODE_FORMATS).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              style={formatButtonStyle(format === f)}
            >
              <div style={{ fontWeight: '500' }}>{BARCODE_FORMATS[f].name}</div>
              <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{BARCODE_FORMATS[f].description}</div>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* 左侧：设置 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '6px', display: 'block', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>条码内容</label>
            <input
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder={BARCODE_FORMATS[format]?.example}
              style={{ ...inputStyle, fontSize: '16px', fontFamily: font.ui, padding: '12px' }}
            />
            <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>
              示例: {BARCODE_FORMATS[format]?.example}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px', display: 'block' }}>线条颜色</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="color" value={lineColor} onChange={e => setLineColor(e.target.value)} style={{ width: '40px', height: '32px', border: 'none', borderRadius: radius.sm, cursor: 'pointer' }} />
                <input type="text" value={lineColor} onChange={e => setLineColor(e.target.value)} style={{ ...inputStyle, flex: 1, fontFamily: font.ui }} />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px', display: 'block' }}>背景颜色</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="color" value={background} onChange={e => setBackground(e.target.value)} style={{ width: '40px', height: '32px', border: 'none', borderRadius: radius.sm, cursor: 'pointer' }} />
                <input type="text" value={background} onChange={e => setBackground(e.target.value)} style={{ ...inputStyle, flex: 1, fontFamily: font.ui }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px', display: 'block' }}>线条宽度: {barWidth}px</label>
              <input type="range" min="1" max="5" step="0.5" value={barWidth} onChange={e => setBarWidth(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div>
              <label style={{ fontSize: '11px', color: theme.textSecondary, marginBottom: '4px', display: 'block' }}>条码高度: {height}px</label>
              <input type="range" min="40" max="200" value={height} onChange={e => setHeight(parseInt(e.target.value))} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: theme.textSecondary, cursor: 'pointer' }}>
              <input type="checkbox" checked={displayValue} onChange={e => setDisplayValue(e.target.checked)} />
              显示文本
            </label>
            {displayValue && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <label style={{ fontSize: '11px', color: theme.textMuted }}>字号:</label>
                <input
                  type="number"
                  min="8"
                  max="32"
                  value={fontSize}
                  onChange={e => setFontSize(parseInt(e.target.value) || 16)}
                  style={{ width: '60px', padding: '4px 8px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.sm, color: theme.textPrimary, fontSize: '12px', outline: 'none' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* 右侧：预览 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <label style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>预览</label>
          <div style={{
            flex: 1,
            background: theme.bgPrimary,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.lg,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '200px',
            overflow: 'auto',
          }}>
            {error ? (
              <div style={{ color: theme.error, fontSize: '13px' }}>{error}</div>
            ) : (
              <canvas ref={canvasRef} style={{ maxWidth: '100%' }} />
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={downloadPng} style={{ ...primaryButtonStyle, flex: 1 }}>下载 PNG</button>
            <button onClick={downloadSvg} style={{ ...primaryButtonStyle, flex: 1 }}>下载 SVG</button>
            <button onClick={copySvg} style={buttonStyle}>{copied ? '✓ 已复制' : '复制'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BarcodeGen
