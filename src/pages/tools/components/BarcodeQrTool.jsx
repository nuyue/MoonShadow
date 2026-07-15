import React from 'react'
import QRCode from 'qrcode'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'
import ToggleGroup from './ui/ToggleGroup'
import CustomSelect from './ui/CustomSelect'
import CustomCheckbox from './ui/CustomCheckbox'

// ===================== 条码编码 =====================

const BARCODE_FORMATS = {
  CODE128: { name: 'Code 128', desc: '高密度字母数字' },
  CODE39: { name: 'Code 39', desc: '字母数字条码' },
  EAN13: { name: 'EAN-13', desc: '13位商品码' },
  EAN8: { name: 'EAN-8', desc: '8位商品码' },
  UPC: { name: 'UPC-A', desc: '12位北美码' },
  ITF14: { name: 'ITF-14', desc: '14位物流码' },
}

const DEFAULT_VALUES = {
  CODE128: 'ABC-12345', CODE39: 'ABC123', EAN13: '5901234123457',
  EAN8: '12345670', UPC: '123456789012', ITF14: '12345678901231',
}

const CODE128_PATTERNS = [
  '11011001100','11001101100','11001100110','10010011000','10010001100','10001001100','10011001000','10011000100','10001100100','11001001000',
  '11001000100','11000100100','10110011100','10011011100','10011001110','10111001100','10011101100','10011100110','11001110010','11001011100',
  '11001001110','11011100100','11001110100','11101101110','11101001110','11100101110','11100110110','11100110010','11011011000','11011000110',
  '11000110110','10100011000','10001011000','10001000110','10110001000','10001101000','10001100010','11010001000','11000101000','11000100010',
  '10110111000','10110001110','10001101110','10111011000','10111000110','10001110110','11101110110','11010001110','11000101110','11011101000',
  '11011100010','11011101110','11101011000','11101000110','11100010110','11101101000','11101100010','11100011010','11101111010','11001000010',
  '11110001010','10100110000','10100001100','10010110000','10010000110','10000101100','10000100110','10110010000','10110000100','10011010000',
  '10011000010','10000110100','10000110010','11000010010','11001010000','11110111010','11000010100','10001111010','10100111100','10010111100',
  '10010011110','10111100100','10011110100','10011110010','11110100100','11110010100','11110010010','11011011110','11011110110','11110110110',
  '10101111000','10100011110','10001011110','10111101000','10111100010','11110101000','11110100010','10111011110','10111101110','11101011110',
  '11110101110','11010000100','11010010000','11010011100',
]
const CODE128_START_B = 104, CODE128_STOP = 106

function encodeCode128B(text) {
  const values = [CODE128_START_B]
  let checksum = CODE128_START_B
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i)
    const value = charCode >= 32 && charCode <= 127 ? charCode - 32 : 0
    values.push(value)
    checksum += value * (i + 1)
  }
  values.push(checksum % 103, CODE128_STOP)
  return values.map(v => CODE128_PATTERNS[v]).join('')
}

const CODE39_PATTERNS = {
  '0':'101001101101','1':'110100101011','2':'101100101011','3':'110110010101','4':'101001101011','5':'110100110101','6':'101100110101','7':'101001011011',
  '8':'110100101101','9':'101100101101','A':'110101001011','B':'101101001011','C':'110110100101','D':'101011001011','E':'110101100101','F':'101101100101',
  'G':'101010011011','H':'110101001101','I':'101101001101','J':'101011001101','K':'110101010011','L':'101101010011','M':'110110101001','N':'101011010011',
  'O':'110101101001','P':'101101101001','Q':'101010110011','R':'110101011001','S':'101101011001','T':'101011011001','U':'110010101011','V':'100110101011',
  'W':'110011010101','X':'100101101011','Y':'110010110101','Z':'100110110101','-':'100101011011','.':'110010101101',' ':'100110101101','$':'100101001101',
  '/':'100100101011','+':'100101001011','%':'100101010011','*':'110010100101',
}

function encodeCode39(text) {
  let pattern = CODE39_PATTERNS['*']
  for (const ch of text.toUpperCase()) {
    if (CODE39_PATTERNS[ch]) pattern += '0' + CODE39_PATTERNS[ch]
  }
  return pattern + '0' + CODE39_PATTERNS['*']
}

const EAN13_L = ['0001101','0011001','0010011','0111101','0100011','0110001','0101111','0111011','0110111','0001011']
const EAN13_G = ['0100111','0110011','0011011','0100001','0011101','0111001','0000101','0010001','0001001','0010111']
const EAN13_R = ['1110010','1100110','1101100','1000010','1011100','1001110','1010000','1000100','1001000','1110100']
const EAN13_PARITY = ['LLLLLL','LLGLGG','LLGGLG','LLGGGL','LGLLGG','LGGLLG','LGGGLL','LGLGLG','LGLGGL','LGGLGL']

function encodeEAN13(text) {
  const digits = text.replace(/\D/g, '').padStart(13, '0').slice(0, 13)
  const parity = EAN13_PARITY[parseInt(digits[0])]
  let pattern = '101'
  for (let i = 0; i < 6; i++) pattern += parity[i] === 'L' ? EAN13_L[parseInt(digits[i+1])] : EAN13_G[parseInt(digits[i+1])]
  pattern += '01010'
  for (let i = 0; i < 6; i++) pattern += EAN13_R[parseInt(digits[i+7])]
  return pattern + '101'
}

function encodeEAN8(text) {
  const digits = text.replace(/\D/g, '').padStart(8, '0').slice(0, 8)
  let pattern = '101'
  for (let i = 0; i < 4; i++) pattern += EAN13_L[parseInt(digits[i])]
  pattern += '01010'
  for (let i = 0; i < 4; i++) pattern += EAN13_R[parseInt(digits[i+4])]
  return pattern + '101'
}

function drawBarcode(canvas, pattern, options) {
  const { fgColor, bgColor, barWidth, height, displayValue, value, fontSize } = options
  const ctx = canvas.getContext('2d')
  const totalWidth = pattern.length * barWidth + 20
  const totalHeight = height + (displayValue ? 30 : 0) + 20
  canvas.width = totalWidth
  canvas.height = totalHeight
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, totalWidth, totalHeight)
  ctx.fillStyle = fgColor
  let x = 10
  for (const bit of pattern) {
    if (bit === '1') ctx.fillRect(x, 10, barWidth, height)
    x += barWidth
  }
  if (displayValue) {
    ctx.font = `${fontSize}px monospace`
    ctx.textAlign = 'center'
    ctx.fillText(value, totalWidth / 2, height + 10 + fontSize)
  }
}

// ===================== QR 内容生成 =====================

function generateWifiString(c) {
  return `WIFI:T:${c.security};S:${c.ssid};P:${c.password};${c.hidden ? 'H:true;' : ''};`
}

function generateVCardString(c) {
  return ['BEGIN:VCARD','VERSION:3.0',c.name&&`FN:${c.name}`,c.phone&&`TEL:${c.phone}`,c.email&&`EMAIL:${c.email}`,c.org&&`ORG:${c.org}`,c.url&&`URL:${c.url}`,'END:VCARD'].filter(Boolean).join('\n')
}

// ===================== 艺术二维码绘制 =====================

// 判断坐标是否在三个定位符区域内
function isLocatorArea(row, col, count) {
  return (row < 7 && col < 7) || (row < 7 && col >= count - 7) || (row >= count - 7 && col < 7)
}

// 绘制定位符（几何样式）
function drawLocatorGeometric(ctx, x, y, unit, style, fg, bg) {
  const total = 7 * unit, inner = 5 * unit, center = 3 * unit

  // 点阵样式：使用圆点组成定位符
  if (style === 'dots') {
    const pattern = [
      [1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1],
    ]
    ctx.save()
    ctx.fillStyle = bg
    ctx.fillRect(x, y, total, total)
    ctx.fillStyle = fg
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (pattern[r][c] === 1) {
          const px = x + c * unit + unit / 2
          const py = y + r * unit + unit / 2
          ctx.beginPath()
          ctx.arc(px, py, unit * 0.42, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }
    ctx.restore()
    return
  }

  if (style === 'rounded') {
    const r = unit * 1.2
    ctx.fillStyle = fg
    ctx.beginPath(); ctx.roundRect(x, y, total, total, r); ctx.fill()
    ctx.fillStyle = bg
    ctx.beginPath(); ctx.roundRect(x + unit, y + unit, inner, inner, r * 0.7); ctx.fill()
    ctx.fillStyle = fg
    ctx.beginPath(); ctx.roundRect(x + 2 * unit, y + 2 * unit, center, center, r * 0.4); ctx.fill()
  } else if (style === 'circle') {
    const cx = x + total / 2, cy = y + total / 2
    ctx.fillStyle = fg
    ctx.beginPath(); ctx.arc(cx, cy, total / 2, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = bg
    ctx.beginPath(); ctx.arc(cx, cy, total / 2 - unit, 0, Math.PI * 2); ctx.fill()
    ctx.fillStyle = fg
    ctx.beginPath(); ctx.arc(cx, cy, total / 2 - 2 * unit, 0, Math.PI * 2); ctx.fill()
  } else {
    ctx.fillStyle = fg
    ctx.fillRect(x, y, total, total)
    ctx.fillStyle = bg
    ctx.fillRect(x + unit, y + unit, inner, inner)
    ctx.fillStyle = fg
    ctx.fillRect(x + 2 * unit, y + 2 * unit, center, center)
  }
}

// 绘制单个数据码元（几何样式）
function drawModuleGeometric(ctx, x, y, unit, style, fillStyle) {
  ctx.fillStyle = fillStyle
  switch (style) {
    case 'dots':
      ctx.beginPath()
      ctx.arc(x + unit / 2, y + unit / 2, unit * 0.42, 0, Math.PI * 2)
      ctx.fill()
      break
    case 'rounded':
      ctx.beginPath()
      ctx.roundRect(x + unit * 0.05, y + unit * 0.05, unit * 0.9, unit * 0.9, unit * 0.3)
      ctx.fill()
      break
    case 'fluid':
      ctx.beginPath()
      ctx.arc(x + unit / 2, y + unit / 2, unit * 0.55, 0, Math.PI * 2)
      ctx.fill()
      break
    default:
      ctx.fillRect(x, y, unit, unit)
  }
}

// 主绘制函数 — 高分辨率渲染 + 图片替换支持
function drawArtQRCode(canvas, qrData, options) {
  const {
    displaySize, renderScale,
    fgColor, fgColor2, bgColor, useGradient,
    dotStyle, locatorStyle,
    logoImage, logoSize,
    bgImage, bgOpacity,
    locatorImage, // 自定义定位符图片
    dotImage,     // 自定义码元图片
  } = options

  const modules = qrData.modules
  const count = modules.size
  const margin = 2
  const totalUnits = count + margin * 2
  // 计算每个模块的像素大小（基于显示尺寸）
  const unit = Math.floor(displaySize / totalUnits)
  const actualDisplaySize = unit * totalUnits
  // 高分辨率：实际 canvas 像素 = 显示尺寸 × renderScale
  const canvasSize = actualDisplaySize * renderScale

  canvas.width = canvasSize
  canvas.height = canvasSize
  canvas.style.width = actualDisplaySize + 'px'
  canvas.style.height = actualDisplaySize + 'px'

  const ctx = canvas.getContext('2d')
  // 缩放上下文，后续所有绘制用显示坐标
  ctx.scale(renderScale, renderScale)

  // 1. 背景
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, actualDisplaySize, actualDisplaySize)

  // 2. 背景图
  if (bgImage) {
    ctx.globalAlpha = bgOpacity
    ctx.drawImage(bgImage, 0, 0, actualDisplaySize, actualDisplaySize)
    ctx.globalAlpha = 1
  }

  // 3. 准备填充样式
  let fillStyle = fgColor
  if (useGradient && fgColor2) {
    const grad = ctx.createLinearGradient(0, 0, actualDisplaySize, actualDisplaySize)
    grad.addColorStop(0, fgColor)
    grad.addColorStop(1, fgColor2)
    fillStyle = grad
  }

  // 4. 预渲染码元图片到小 canvas（优化性能）
  let dotPatternCanvas = null
  if (dotImage) {
    dotPatternCanvas = document.createElement('canvas')
    dotPatternCanvas.width = unit
    dotPatternCanvas.height = unit
    const dpc = dotPatternCanvas.getContext('2d')
    dpc.drawImage(dotImage, 0, 0, unit, unit)
  }

  // 5. 绘制数据码元（跳过定位符区域）
  const offset = margin * unit
  for (let r = 0; r < count; r++) {
    for (let c = 0; c < count; c++) {
      if (!modules.get(r, c)) continue
      if (isLocatorArea(r, c, count)) continue
      const x = (c + margin) * unit
      const y = (r + margin) * unit

      if (dotPatternCanvas) {
        // 用自定义图片绘制码元
        ctx.drawImage(dotPatternCanvas, x, y)
      } else {
        drawModuleGeometric(ctx, x, y, unit, dotStyle, fillStyle)
      }
    }
  }

  // 6. 绘制定位符
  const locatorPositions = [
    { col: margin, row: margin },                              // 左上
    { col: margin + count - 7, row: margin },                  // 右上
    { col: margin, row: margin + count - 7 },                  // 左下
  ]

  for (const pos of locatorPositions) {
    const lx = pos.col * unit
    const ly = pos.row * unit
    const lSize = 7 * unit

    if (locatorImage) {
      // 用自定义图片替代定位符
      ctx.drawImage(locatorImage, lx, ly, lSize, lSize)
    } else {
      drawLocatorGeometric(ctx, lx, ly, unit, locatorStyle, fillStyle, bgColor)
    }
  }

  // 7. 绘制 Logo（居中）
  if (logoImage) {
    const logoW = actualDisplaySize * logoSize
    const padding = unit * 2
    const cx = actualDisplaySize / 2
    const cy = actualDisplaySize / 2
    const lx = cx - logoW / 2
    const ly = cy - logoW / 2

    ctx.fillStyle = bgColor
    ctx.beginPath()
    ctx.roundRect(lx - padding, ly - padding, logoW + padding * 2, logoW + padding * 2, padding * 0.5)
    ctx.fill()

    ctx.drawImage(logoImage, lx, ly, logoW, logoW)
  }
}

// ===================== 防抖 Hook =====================

function useDebounce(value, delay) {
  const [debounced, setDebounced] = React.useState(value)
  React.useEffect(() => {
    const h = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(h)
  }, [value, delay])
  return debounced
}

// ===================== 主组件 =====================

export default function BarcodeQrTool() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [mode, setMode] = React.useState('qrcode')

  // QR 码状态
  const [qrContent, setQrContent] = React.useState('')
  const [qrType, setQrType] = React.useState('text')
  const [wifiConfig, setWifiConfig] = React.useState({ ssid: '', password: '', security: 'WPA', hidden: false })
  const [vcardConfig, setVcardConfig] = React.useState({ name: '', phone: '', email: '', org: '', url: '' })
  const [qrSize, setQrSize] = React.useState(320)

  // 艺术二维码状态
  const [dotStyle, setDotStyle] = React.useState('square')
  const [locatorStyle, setLocatorStyle] = React.useState('square')
  const [useGradient, setUseGradient] = React.useState(false)
  const [fgColor, setFgColor] = React.useState('#000000')
  const [fgColor2, setFgColor2] = React.useState('#6366F1')
  const [bgColor, setBgColor] = React.useState('#ffffff')

  // DIY: Logo
  const [logoImage, setLogoImage] = React.useState(null)
  const [logoSize, setLogoSize] = React.useState(0.2)

  // DIY: 背景图
  const [customImage, setCustomImage] = React.useState(null)
  const [customImageOpacity, setCustomImageOpacity] = React.useState(0.3)

  // DIY: 自定义定位符图片
  const [locatorImageSrc, setLocatorImageSrc] = React.useState(null)

  // DIY: 自定义码元图片
  const [dotImageSrc, setDotImageSrc] = React.useState(null)

  // 防抖
  const debouncedLogoSize = useDebounce(logoSize, 150)
  const debouncedOpacity = useDebounce(customImageOpacity, 150)

  // 条码状态
  const [barcodeFormat, setBarcodeFormat] = React.useState('CODE128')
  const [barcodeValue, setBarcodeValue] = React.useState('ABC-12345')
  const [barcodeFgColor, setBarcodeFgColor] = React.useState('#000000')
  const [barcodeBgColor, setBarcodeBgColor] = React.useState('#FFFFFF')
  const [barcodeWidth, setBarcodeWidth] = React.useState(2)
  const [barcodeHeight, setBarcodeHeight] = React.useState(100)
  const [barcodeShowText, setBarcodeShowText] = React.useState(true)
  const barcodeCanvasRef = React.useRef(null)
  const qrCanvasRef = React.useRef(null)

  // 识别
  const [scanResult, setScanResult] = React.useState('')
  const [scanError, setScanError] = React.useState('')
  const [scanLoading, setScanLoading] = React.useState(false)
  const [scanImageUrl, setScanImageUrl] = React.useState('')
  const scanFileRef = React.useRef(null)

  // QR 矩阵数据
  const [qrMatrix, setQrMatrix] = React.useState(null)
  const [qrError, setQrError] = React.useState('')

  // 生成 QR 内容
  const getQrContent = () => {
    switch (qrType) {
      case 'wifi': return generateWifiString(wifiConfig)
      case 'vcard': return generateVCardString(vcardConfig)
      default: return qrContent
    }
  }

  // 生成 QR 矩阵（使用 qrcode 库）
  React.useEffect(() => {
    const content = getQrContent().trim()
    if (!content) { setQrMatrix(null); setQrError(''); return }
    try {
      // 有 Logo、自定义定位符图片或自定义码元图片时使用高纠错级别 H (30%容错)
      const needHighEC = logoImage || locatorImageSrc || dotImageSrc
      const ecLevel = needHighEC ? 'H' : 'M'
      const qr = QRCode.create(content, { errorCorrectionLevel: ecLevel })
      setQrMatrix(qr)
      setQrError('')
    } catch (e) {
      setQrError(e.message)
      setQrMatrix(null)
    }
  }, [qrContent, qrType, wifiConfig, vcardConfig, logoImage, locatorImageSrc, dotImageSrc])

  // 预加载图片
  const loadImage = React.useCallback((src) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }, [])

  // 图片对象预加载
  const useImageElement = (src) => {
    const [el, setEl] = React.useState(null)
    React.useEffect(() => {
      if (!src) { setEl(null); return }
      loadImage(src).then(setEl).catch(() => setEl(null))
    }, [src, loadImage])
    return el
  }

  const logoImgEl = useImageElement(logoImage)
  const bgImgEl = useImageElement(customImage)
  const locatorImgEl = useImageElement(locatorImageSrc)
  const dotImgEl = useImageElement(dotImageSrc)

  // 渲染分辨率倍数
  const renderScale = React.useMemo(() => {
    if (typeof window !== 'undefined' && window.devicePixelRatio) {
      return Math.max(2, Math.min(window.devicePixelRatio, 3))
    }
    return 2
  }, [])

  // 绘制艺术二维码
  React.useEffect(() => {
    if (mode !== 'qrcode' || !qrCanvasRef.current || !qrMatrix) return

    drawArtQRCode(qrCanvasRef.current, qrMatrix, {
      displaySize: qrSize,
      renderScale,
      fgColor, fgColor2, bgColor, useGradient,
      dotStyle, locatorStyle,
      logoImage: logoImgEl,
      logoSize: debouncedLogoSize,
      bgImage: bgImgEl,
      bgOpacity: debouncedOpacity,
      locatorImage: locatorImgEl,
      dotImage: dotImgEl,
    })
  }, [mode, qrMatrix, qrSize, renderScale, fgColor, fgColor2, bgColor, useGradient, dotStyle, locatorStyle, logoImgEl, debouncedLogoSize, bgImgEl, debouncedOpacity, locatorImgEl, dotImgEl])

  // 生成条码
  React.useEffect(() => {
    if (mode !== 'barcode' || !barcodeCanvasRef.current) return
    let pattern = null
    try {
      switch (barcodeFormat) {
        case 'CODE128': pattern = encodeCode128B(barcodeValue); break
        case 'CODE39': pattern = encodeCode39(barcodeValue); break
        case 'EAN13': pattern = encodeEAN13(barcodeValue); break
        case 'EAN8': pattern = encodeEAN8(barcodeValue); break
        case 'UPC': pattern = encodeEAN13('0' + barcodeValue.replace(/\D/g, '')); break
        case 'ITF14': pattern = encodeCode128B(barcodeValue); break
        default: pattern = encodeCode128B(barcodeValue)
      }
      if (pattern) {
        drawBarcode(barcodeCanvasRef.current, pattern, {
          fgColor: barcodeFgColor, bgColor: barcodeBgColor,
          barWidth: barcodeWidth, height: barcodeHeight,
          displayValue: barcodeShowText, value: barcodeValue, fontSize: 16,
        })
      }
    } catch (e) { console.error('Barcode error:', e) }
  }, [mode, barcodeFormat, barcodeValue, barcodeFgColor, barcodeBgColor, barcodeWidth, barcodeHeight, barcodeShowText])

  // 下载
  const downloadCanvas = (canvas, filename) => {
    if (!canvas) return
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = filename
    a.click()
  }

  const downloadQr = () => {
    if (qrCanvasRef.current) downloadCanvas(qrCanvasRef.current, `qrcode-${Date.now()}.png`)
  }

  const copyImage = async () => {
    if (!qrCanvasRef.current) return
    try {
      const blob = await new Promise(r => qrCanvasRef.current.toBlob(r, 'image/png'))
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    } catch (e) { console.error('Copy failed:', e) }
  }

  // 识别二维码
  const handleScanUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setScanLoading(true)
    setScanError('')
    setScanResult('')
    setScanImageUrl('')
    try {
      const url = URL.createObjectURL(file)
      setScanImageUrl(url)
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('https://api.qrserver.com/v1/read-qr-code/', { method: 'POST', body: formData })
      const data = await res.json()
      if (data?.[0]?.symbol?.[0]?.data) {
        setScanResult(data[0].symbol[0].data)
      } else {
        setScanError(lang === 'zh' ? '未能识别二维码' : 'QR not detected')
      }
    } catch {
      setScanError(lang === 'zh' ? '识别失败' : 'Scan failed')
    }
    setScanLoading(false)
  }

  const handleFileUpload = (setter) => (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setter(URL.createObjectURL(file))
  }

  // ===================== 样式 =====================

  const styles = {
    container: { padding: '20px' },
    toolbar: {
      display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '16px',
    },
    grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
    input: {
      width: '100%', padding: '8px 12px', background: 'transparent',
      color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.sm,
      fontFamily: font.ui, fontSize: '13px', outline: 'none',
      transition: 'border-color 0.15s, background 0.15s',
    },
    textarea: {
      width: '100%', minHeight: '100px', padding: '12px', background: 'transparent',
      color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
      fontFamily: font.mono, fontSize: '13px', resize: 'vertical', outline: 'none',
      transition: 'border-color 0.15s, background 0.15s',
    },
    label: { fontSize: '11px', fontFamily: font.mono, color: theme.textMuted, marginBottom: '6px', display: 'block' },
    row: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
    preview: {
      background: theme.bgTertiary, border: `1px solid ${theme.border}`,
      borderRadius: radius.md, padding: '16px', display: 'flex',
      alignItems: 'center', justifyContent: 'center', minHeight: '200px',
    },
    button: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      padding: '6px 12px', background: 'transparent', color: theme.textSecondary,
      border: `1px solid ${theme.border}`, borderRadius: radius.sm, cursor: 'pointer', fontSize: '12px',
      fontFamily: font.ui, fontWeight: 500, transition: 'all 0.15s',
    },
    primaryButton: {
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
      padding: '8px 16px', background: theme.bgAccent, color: theme.bgPrimary,
      border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '13px',
      fontFamily: font.ui, fontWeight: 500, transition: 'opacity 0.15s',
    },
    colorInput: { width: '32px', height: '28px', border: 'none', borderRadius: radius.sm, cursor: 'pointer', padding: 0 },
    rangeRow: { display: 'flex', alignItems: 'center', gap: '8px' },
    section: {
      padding: '12px', background: theme.bgTertiary, borderRadius: radius.md,
      border: `1px solid ${theme.border}`,
    },
    sectionTitle: {
      fontSize: '12px', fontWeight: '500', fontFamily: font.ui, color: theme.textSecondary,
      marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px',
    },
    uploadRow: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
    uploadHint: { fontSize: '11px', fontFamily: font.mono, color: theme.textMuted, marginTop: '6px', marginBottom: 0 },
  }

  const modeOptions = [
    { value: 'qrcode', label: lang === 'zh' ? '二维码生成' : 'QR Generate' },
    { value: 'barcode', label: lang === 'zh' ? '条码生成' : 'Barcode' },
    { value: 'scan', label: lang === 'zh' ? '二维码识别' : 'QR Scan' },
  ]

  const qrTypeOptions = [
    { value: 'text', label: lang === 'zh' ? '文本' : 'Text' },
    { value: 'url', label: 'URL' },
    { value: 'wifi', label: 'WiFi' },
    { value: 'vcard', label: lang === 'zh' ? '名片' : 'vCard' },
  ]

  const dotStyleOptions = [
    { value: 'square', label: lang === 'zh' ? '方块' : 'Square' },
    { value: 'rounded', label: lang === 'zh' ? '圆角' : 'Rounded' },
    { value: 'dots', label: lang === 'zh' ? '圆点' : 'Dots' },
    { value: 'fluid', label: lang === 'zh' ? '流体' : 'Fluid' },
  ]

  const locatorStyleOptions = [
    { value: 'square', label: lang === 'zh' ? '方形' : 'Square' },
    { value: 'rounded', label: lang === 'zh' ? '圆角' : 'Rounded' },
    { value: 'circle', label: lang === 'zh' ? '圆形' : 'Circle' },
    { value: 'dots', label: lang === 'zh' ? '点阵' : 'Dots' },
  ]

  const barcodeFormatOptions = Object.entries(BARCODE_FORMATS).map(([k, v]) => ({
    value: k, label: `${v.name} - ${v.desc}`,
  }))

  // 文件上传按钮组件
  const UploadButton = ({ id, onUpload, hasFile, onClear, label }) => (
    <div style={styles.uploadRow}>
      <input type="file" accept="image/*" onChange={onUpload} style={{ display: 'none' }} id={id} />
      <button onClick={() => document.getElementById(id).click()} style={styles.button}>{label}</button>
      {hasFile && (
        <>
          <span style={{ fontSize: '11px', color: theme.textMuted }}>{lang === 'zh' ? '已上传' : 'Uploaded'}</span>
          <button onClick={onClear} style={styles.button}>{lang === 'zh' ? '清除' : 'Clear'}</button>
        </>
      )}
    </div>
  )

  return (
    <div style={styles.container}>
      <ToggleGroup options={modeOptions} value={mode} onChange={setMode} />

      {mode === 'qrcode' && (
        <>
          <ToggleGroup options={qrTypeOptions} value={qrType} onChange={setQrType} />

          <div style={styles.grid}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* QR 内容输入 */}
              {qrType === 'wifi' ? (
                <>
                  <div>
                    <label style={styles.label}>{lang === 'zh' ? 'WiFi名称' : 'SSID'}</label>
                    <input type="text" value={wifiConfig.ssid} onChange={e => setWifiConfig({ ...wifiConfig, ssid: e.target.value })} placeholder={lang === 'zh' ? 'WiFi名称' : 'SSID'} style={styles.input} />
                  </div>
                  <div>
                    <label style={styles.label}>{lang === 'zh' ? '密码' : 'Password'}</label>
                    <input type="password" value={wifiConfig.password} onChange={e => setWifiConfig({ ...wifiConfig, password: e.target.value })} placeholder={lang === 'zh' ? '密码' : 'Password'} style={styles.input} />
                  </div>
                  <div style={styles.row}>
                    <CustomSelect value={wifiConfig.security} onChange={v => setWifiConfig({ ...wifiConfig, security: v })} options={[
                      { value: 'WPA', label: 'WPA/WPA2' },
                      { value: 'WEP', label: 'WEP' },
                      { value: 'nopass', label: lang === 'zh' ? '无密码' : 'No Password' },
                    ]} />
                    <CustomCheckbox checked={wifiConfig.hidden} onChange={v => setWifiConfig({ ...wifiConfig, hidden: v })} label={lang === 'zh' ? '隐藏网络' : 'Hidden'} />
                  </div>
                </>
              ) : qrType === 'vcard' ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input type="text" value={vcardConfig.name} onChange={e => setVcardConfig({ ...vcardConfig, name: e.target.value })} placeholder={lang === 'zh' ? '姓名' : 'Name'} style={styles.input} />
                    <input type="tel" value={vcardConfig.phone} onChange={e => setVcardConfig({ ...vcardConfig, phone: e.target.value })} placeholder={lang === 'zh' ? '电话' : 'Phone'} style={styles.input} />
                  </div>
                  <input type="email" value={vcardConfig.email} onChange={e => setVcardConfig({ ...vcardConfig, email: e.target.value })} placeholder={lang === 'zh' ? '邮箱' : 'Email'} style={styles.input} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <input type="text" value={vcardConfig.org} onChange={e => setVcardConfig({ ...vcardConfig, org: e.target.value })} placeholder={lang === 'zh' ? '公司' : 'Org'} style={styles.input} />
                    <input type="url" value={vcardConfig.url} onChange={e => setVcardConfig({ ...vcardConfig, url: e.target.value })} placeholder={lang === 'zh' ? '网站' : 'URL'} style={styles.input} />
                  </div>
                </>
              ) : (
                <textarea value={qrContent} onChange={e => setQrContent(e.target.value)} placeholder={qrType === 'url' ? 'https://example.com' : (lang === 'zh' ? '输入内容...' : 'Enter content...')} style={styles.textarea} />
              )}

              {/* 码元样式 */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>{lang === 'zh' ? '码元样式' : 'Dot Style'}</div>
                <CustomSelect value={dotStyle} onChange={setDotStyle} options={dotStyleOptions} />
                <div style={{ marginTop: '12px' }}>
                  <UploadButton
                    id="dot-img-upload"
                    onUpload={handleFileUpload(setDotImageSrc)}
                    hasFile={!!dotImageSrc}
                    onClear={() => setDotImageSrc(null)}
                    label={lang === 'zh' ? '上传码元图片' : 'Upload Dot Image'}
                  />
                  {dotImageSrc && (
                    <p style={{ ...styles.uploadHint, color: '#f59e0b' }}>
                      ⚠️ {lang === 'zh' ? '注意：自定义码元可能导致无法识别，建议使用深色图片' : 'Warning: Custom dots may cause scanning failure'}
                    </p>
                  )}
                </div>
              </div>

              {/* 定位符样式 */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>{lang === 'zh' ? '定位符样式' : 'Locator Style'}</div>
                <CustomSelect value={locatorStyle} onChange={setLocatorStyle} options={locatorStyleOptions} />
                <div style={{ marginTop: '12px' }}>
                  <UploadButton
                    id="locator-img-upload"
                    onUpload={handleFileUpload(setLocatorImageSrc)}
                    hasFile={!!locatorImageSrc}
                    onClear={() => setLocatorImageSrc(null)}
                    label={lang === 'zh' ? '上传定位符图片' : 'Upload Locator Image'}
                  />
                  {locatorImageSrc && (
                    <p style={{ ...styles.uploadHint, color: '#f59e0b' }}>
                      ⚠️ {lang === 'zh' ? '注意：自定义定位符可能导致无法识别，建议使用黑白对比明显的图片' : 'Warning: Custom locator may cause scanning failure'}
                    </p>
                  )}
                </div>
              </div>

              {/* 颜色 */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>{lang === 'zh' ? '颜色' : 'Colors'}</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div>
                    <label style={styles.label}>{lang === 'zh' ? '前景色' : 'Foreground'}</label>
                    <div style={styles.row}>
                      <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} style={styles.colorInput} />
                      <input type="text" value={fgColor} onChange={e => setFgColor(e.target.value)} style={{ ...styles.input, flex: 1 }} />
                    </div>
                  </div>
                  <div>
                    <label style={styles.label}>{lang === 'zh' ? '背景色' : 'Background'}</label>
                    <div style={styles.row}>
                      <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} style={styles.colorInput} />
                      <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} style={{ ...styles.input, flex: 1 }} />
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: '8px' }}>
                  <CustomCheckbox checked={useGradient} onChange={setUseGradient} label={lang === 'zh' ? '渐变色' : 'Gradient'} />
                </div>
                {useGradient && (
                  <div style={{ marginTop: '8px' }}>
                    <label style={styles.label}>{lang === 'zh' ? '渐变终止色' : 'Gradient End'}</label>
                    <div style={styles.row}>
                      <input type="color" value={fgColor2} onChange={e => setFgColor2(e.target.value)} style={styles.colorInput} />
                      <input type="text" value={fgColor2} onChange={e => setFgColor2(e.target.value)} style={{ ...styles.input, flex: 1 }} />
                    </div>
                  </div>
                )}
              </div>

              <div style={styles.rangeRow}>
                <label style={{ fontSize: '11px', color: theme.textMuted, minWidth: '80px' }}>{lang === 'zh' ? '尺寸' : 'Size'}: {qrSize}px</label>
                <input type="range" min="128" max="512" step="32" value={qrSize} onChange={e => setQrSize(Number(e.target.value))} style={{ flex: 1 }} />
              </div>

              {/* Logo */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>{lang === 'zh' ? 'Logo（居中）' : 'Logo (Center)'}</div>
                <UploadButton
                  id="logo-upload"
                  onUpload={handleFileUpload(setLogoImage)}
                  hasFile={!!logoImage}
                  onClear={() => setLogoImage(null)}
                  label={lang === 'zh' ? '上传Logo' : 'Upload'}
                />
                {logoImage && (
                  <>
                    <div style={{ ...styles.rangeRow, marginTop: '12px' }}>
                      <label style={{ fontSize: '11px', color: theme.textMuted, minWidth: '80px' }}>{lang === 'zh' ? '大小' : 'Size'}: {Math.round(logoSize * 100)}%</label>
                      <input type="range" min="0.1" max="0.35" step="0.05" value={logoSize} onChange={e => setLogoSize(Number(e.target.value))} style={{ flex: 1 }} />
                    </div>
                    <p style={styles.uploadHint}>
                      {lang === 'zh' ? '已自动切换为高纠错级别(H)以确保可扫描性' : 'Error correction set to H for scannability'}
                    </p>
                  </>
                )}
              </div>

              {/* 背景图 */}
              <div style={styles.section}>
                <div style={styles.sectionTitle}>{lang === 'zh' ? '背景图片' : 'Background Image'}</div>
                <UploadButton
                  id="bg-upload"
                  onUpload={handleFileUpload(setCustomImage)}
                  hasFile={!!customImage}
                  onClear={() => setCustomImage(null)}
                  label={lang === 'zh' ? '上传背景' : 'Upload'}
                />
                {customImage && (
                  <div style={{ ...styles.rangeRow, marginTop: '12px' }}>
                    <label style={{ fontSize: '11px', color: theme.textMuted, minWidth: '80px' }}>{lang === 'zh' ? '透明度' : 'Opacity'}: {Math.round(customImageOpacity * 100)}%</label>
                    <input type="range" min="0.1" max="0.9" step="0.1" value={customImageOpacity} onChange={e => setCustomImageOpacity(Number(e.target.value))} style={{ flex: 1 }} />
                  </div>
                )}
              </div>
            </div>

            {/* 预览 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={styles.preview}>
                {qrMatrix ? (
                  <canvas ref={qrCanvasRef} style={{ maxWidth: '100%' }} />
                ) : qrError ? (
                  <span style={{ color: '#DC2626', fontSize: '13px' }}>{qrError}</span>
                ) : (
                  <span style={{ color: theme.textMuted }}>{lang === 'zh' ? '输入内容生成二维码' : 'Enter content'}</span>
                )}
              </div>
              <div style={styles.row}>
                <button onClick={downloadQr} style={styles.primaryButton}>{lang === 'zh' ? '下载' : 'Download'}</button>
                <button onClick={copyImage} style={styles.button}>{lang === 'zh' ? '复制' : 'Copy'}</button>
              </div>
            </div>
          </div>
        </>
      )}

      {mode === 'barcode' && (
        <>
          <CustomSelect value={barcodeFormat} onChange={v => { setBarcodeFormat(v); setBarcodeValue(DEFAULT_VALUES[v] || '') }} options={barcodeFormatOptions} />

          <div style={styles.grid}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={styles.label}>{lang === 'zh' ? '条码内容' : 'Barcode Content'}</label>
                <input type="text" value={barcodeValue} onChange={e => setBarcodeValue(e.target.value)} placeholder={DEFAULT_VALUES[barcodeFormat]} style={{ ...styles.input, fontSize: '16px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={styles.label}>{lang === 'zh' ? '线条颜色' : 'Line Color'}</label>
                  <div style={styles.row}>
                    <input type="color" value={barcodeFgColor} onChange={e => setBarcodeFgColor(e.target.value)} style={styles.colorInput} />
                    <input type="text" value={barcodeFgColor} onChange={e => setBarcodeFgColor(e.target.value)} style={{ ...styles.input, flex: 1 }} />
                  </div>
                </div>
                <div>
                  <label style={styles.label}>{lang === 'zh' ? '背景颜色' : 'Background'}</label>
                  <div style={styles.row}>
                    <input type="color" value={barcodeBgColor} onChange={e => setBarcodeBgColor(e.target.value)} style={styles.colorInput} />
                    <input type="text" value={barcodeBgColor} onChange={e => setBarcodeBgColor(e.target.value)} style={{ ...styles.input, flex: 1 }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={styles.rangeRow}>
                  <label style={{ fontSize: '11px', color: theme.textMuted, minWidth: '60px' }}>{lang === 'zh' ? '宽度' : 'Width'}: {barcodeWidth}px</label>
                  <input type="range" min="1" max="5" step="0.5" value={barcodeWidth} onChange={e => setBarcodeWidth(Number(e.target.value))} style={{ flex: 1 }} />
                </div>
                <div style={styles.rangeRow}>
                  <label style={{ fontSize: '11px', color: theme.textMuted, minWidth: '60px' }}>{lang === 'zh' ? '高度' : 'Height'}: {barcodeHeight}px</label>
                  <input type="range" min="40" max="200" value={barcodeHeight} onChange={e => setBarcodeHeight(Number(e.target.value))} style={{ flex: 1 }} />
                </div>
              </div>

              <CustomCheckbox checked={barcodeShowText} onChange={setBarcodeShowText} label={lang === 'zh' ? '显示文本' : 'Show Text'} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={styles.preview}>
                <canvas ref={barcodeCanvasRef} style={{ maxWidth: '100%' }} />
              </div>
              <div style={styles.row}>
                <button onClick={() => downloadCanvas(barcodeCanvasRef.current, `barcode-${barcodeFormat}.png`)} style={styles.primaryButton}>PNG</button>
              </div>
            </div>
          </div>
        </>
      )}

      {mode === 'scan' && (
        <>
          <input ref={scanFileRef} type="file" accept="image/*" onChange={handleScanUpload} style={{ display: 'none' }} />
          <button onClick={() => scanFileRef.current?.click()} style={styles.primaryButton}>{lang === 'zh' ? '上传图片识别' : 'Upload Image'}</button>

          <div style={styles.preview}>
            {scanLoading ? (
              <span style={{ color: theme.textMuted }}>{lang === 'zh' ? '识别中...' : 'Scanning...'}</span>
            ) : scanImageUrl ? (
              <img src={scanImageUrl} alt="Upload" style={{ maxWidth: '100%', maxHeight: '300px' }} />
            ) : (
              <span style={{ color: theme.textMuted }}>{lang === 'zh' ? '点击上传二维码图片' : 'Click to upload'}</span>
            )}
          </div>

          {scanError && <div style={{ padding: '8px 12px', background: '#FEE2E2', borderRadius: radius.sm, color: '#DC2626', fontSize: '12px' }}>{scanError}</div>}

          {scanResult && (
            <>
              <div style={{ padding: '12px', background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}` }}>
                <p style={{ color: theme.textPrimary, fontFamily: font.mono, fontSize: '13px', wordBreak: 'break-all', margin: 0 }}>{scanResult}</p>
              </div>
              <div style={styles.row}>
                <button onClick={() => navigator.clipboard.writeText(scanResult)} style={styles.primaryButton}>{lang === 'zh' ? '复制' : 'Copy'}</button>
                {scanResult.startsWith('http') && (
                  <a href={scanResult} target="_blank" rel="noopener noreferrer" style={{ ...styles.button, textDecoration: 'none' }}>{lang === 'zh' ? '打开链接' : 'Open Link'}</a>
                )}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}