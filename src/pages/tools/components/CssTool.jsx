import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'
import ToggleGroup from './ui/ToggleGroup'
import CustomSelect from './ui/CustomSelect'
import { generateColorPalette, getContrastRatio, checkContrast } from '../../../utils/core'

// ===================== 颜色工具函数 =====================

const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2
  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

const wcagLevel = (ratio) => {
  if (ratio >= 7) return { label: 'AAA', color: '#22c55e' }
  if (ratio >= 4.5) return { label: 'AA', color: '#10b981' }
  if (ratio >= 3) return { label: 'AA Large', color: '#eab308' }
  return { label: 'Fail', color: '#ef4444' }
}

// ===================== 颜色选择器子组件 =====================

function ColorPickerPanel() {
  const { theme, radius, font } = useTheme()
  const [hex, setHex] = React.useState('#3B82F6')

  const rgb = hexToRgb(hex)
  const hsl = rgb ? rgbToHsl(rgb.r, rgb.g, rgb.b) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        <input type="color" value={hex} onChange={e => setHex(e.target.value)} style={{ width: '60px', height: '60px', border: 'none', cursor: 'pointer', borderRadius: radius.md }} />
        <input type="text" value={hex} onChange={e => setHex(e.target.value)} style={{ width: '120px', padding: '8px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, fontSize: '16px', background: theme.bgSecondary, color: theme.textPrimary, outline: 'none' }} />
      </div>
      {rgb && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <div style={{ padding: '12px', background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}` }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: theme.textPrimary }}>RGB</div>
            <div style={{ fontFamily: font.mono, color: theme.textSecondary }}>rgb({rgb.r}, {rgb.g}, {rgb.b})</div>
          </div>
          {hsl && (
            <div style={{ padding: '12px', background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}` }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: theme.textPrimary }}>HSL</div>
              <div style={{ fontFamily: font.mono, color: theme.textSecondary }}>hsl({hsl.h}, {hsl.s}%, {hsl.l}%)</div>
            </div>
          )}
          <div style={{ height: '80px', background: hex, borderRadius: radius.md, border: `1px solid ${theme.border}` }} />
        </div>
      )}
    </div>
  )
}

// ===================== 调色板生成子组件 =====================

const SCHEMES = [
  { value: 'analogous', label: '类似色' },
  { value: 'complementary', label: '互补色' },
  { value: 'split-complementary', label: '分裂互补' },
  { value: 'triadic', label: '三色组' },
  { value: 'tetradic', label: '四色组' },
  { value: 'monochromatic', label: '单色系' },
  { value: 'shades', label: '明暗变化' },
]

function ColorPalettePanel() {
  const { theme, radius, font } = useTheme()
  const [baseColor, setBaseColor] = React.useState('#6366f1')
  const [scheme, setScheme] = React.useState('analogous')
  const [copiedIdx, setCopiedIdx] = React.useState(null)

  const palette = React.useMemo(() => generateColorPalette(baseColor, scheme), [baseColor, scheme])

  const handleCopy = (hex, idx) => {
    navigator.clipboard.writeText(hex)
    setCopiedIdx(idx)
    setTimeout(() => setCopiedIdx(null), 2000)
  }

  const getContrast = (color1, color2) => {
    const result = getContrastRatio(color1, color2)
    return result.ok ? result.value : 1
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <input type="color" value={baseColor} onChange={e => setBaseColor(e.target.value)} style={{ width: '40px', height: '40px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, cursor: 'pointer', background: 'transparent' }} />
        <input type="text" value={baseColor} onChange={e => setBaseColor(e.target.value)} style={{ width: '100px', padding: '8px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, background: theme.bgSecondary, color: theme.textPrimary, outline: 'none' }} />
        <button onClick={() => navigator.clipboard.writeText(palette.join('\n'))} style={{ padding: '6px 12px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer' }}>{useLang().lang === 'zh' ? '复制全部' : 'Copy All'}</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {SCHEMES.map(s => (
          <button key={s.value} onClick={() => setScheme(s.value)} style={{ padding: '6px 12px', background: scheme === s.value ? theme.bgAccent : theme.bgTertiary, color: scheme === s.value ? theme.bgPrimary : theme.textSecondary, border: 'none', borderRadius: radius.sm, cursor: 'pointer' }}>{s.label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', height: '80px', borderRadius: radius.lg, overflow: 'hidden', border: `1px solid ${theme.border}` }}>
        {palette.map((hex, i) => (
          <div key={hex + i} style={{ flex: 1, backgroundColor: hex, cursor: 'pointer' }} onClick={() => handleCopy(hex, i)} title={hex} />
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${palette.length <= 5 ? palette.length : 5}, 1fr)`, gap: '12px' }}>
        {palette.map((hex, i) => {
          const onWhite = getContrast(hex, '#ffffff')
          const onBlack = getContrast(hex, '#000000')
          const best = onWhite >= onBlack ? { bg: '#ffffff', ratio: onWhite } : { bg: '#000000', ratio: onBlack }
          const wcag = wcagLevel(best.ratio)
          return (
            <div key={hex + i} style={{ textAlign: 'center' }}>
              <div style={{ backgroundColor: hex, height: '60px', borderRadius: radius.md, border: `1px solid ${theme.border}`, cursor: 'pointer', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '8px' }} onClick={() => handleCopy(hex, i)}>
                <span style={{ fontSize: '11px', color: copiedIdx === i ? '#22c55e' : '#666' }}>{copiedIdx === i ? '已复制' : '点击复制'}</span>
              </div>
              <div style={{ marginTop: '4px', fontFamily: font.mono, fontSize: '11px', color: theme.textSecondary }}>{hex.toUpperCase()}</div>
              <div style={{ fontSize: '10px', color: wcag.color }}>{wcag.label}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ===================== 对比度检查子组件 =====================

function ContrastCheckerPanel() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [fg, setFg] = React.useState('#000000')
  const [bg, setBg] = React.useState('#ffffff')

  const result = React.useMemo(() => {
    const contrastResult = checkContrast(fg, bg)
    return contrastResult.ok ? contrastResult.value : null
  }, [fg, bg])

  const getRatioColor = (ratio) => {
    if (ratio >= 7) return '#22c55e'
    if (ratio >= 4.5) return '#10b981'
    if (ratio >= 3) return '#eab308'
    return '#ef4444'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ borderRadius: radius.md, border: `1px solid ${theme.border}`, overflow: 'hidden', background: bg }}>
        <div style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px', color: fg }}>{lang === 'zh' ? '大号文本示例 (18pt+)' : 'Large Text Sample (18pt+)'}</p>
          <p style={{ fontSize: '14px', color: fg }}>{lang === 'zh' ? '正文文本示例，这是实际显示效果预览。' : 'Body text sample, preview of actual display effect.'}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div>
          <label style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '8px', display: 'block' }}>{lang === 'zh' ? '前景色（文字）' : 'Foreground'}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="color" value={fg} onChange={e => setFg(e.target.value)} style={{ width: '40px', height: '40px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, cursor: 'pointer' }} />
            <input type="text" value={fg} onChange={e => setFg(e.target.value)} style={{ flex: 1, padding: '8px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, background: theme.bgSecondary, color: theme.textPrimary }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '8px', display: 'block' }}>{lang === 'zh' ? '背景色' : 'Background'}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input type="color" value={bg} onChange={e => setBg(e.target.value)} style={{ width: '40px', height: '40px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, cursor: 'pointer' }} />
            <input type="text" value={bg} onChange={e => setBg(e.target.value)} style={{ flex: 1, padding: '8px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, background: theme.bgSecondary, color: theme.textPrimary }} />
          </div>
        </div>
      </div>

      {result && (
        <>
          <div style={{ textAlign: 'center', padding: '16px', background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}` }}>
            <div style={{ fontSize: '48px', fontWeight: 'bold', fontFamily: font.mono, color: getRatioColor(result.ratio) }}>{result.ratio.toFixed(2)}:1</div>
            <div style={{ fontSize: '14px', color: theme.textMuted }}>{lang === 'zh' ? '对比度比值' : 'Contrast Ratio'}</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            {[['AA', '大文本', result.aaLarge, '3:1'], ['AA', '正文', result.aaNormal, '4.5:1'], ['AAA', '大文本', result.aaaLarge, '4.5:1'], ['AAA', '正文', result.aaaNormal, '7:1']].map(([level, size, pass, min], i) => (
              <div key={i} style={{ padding: '12px', borderRadius: radius.md, border: `1px solid ${pass ? '#22c55e' : '#ef4444'}`, background: pass ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 500 }}>WCAG {level}</span>
                  <span style={{ fontWeight: 500, color: pass ? '#22c55e' : '#ef4444' }}>{pass ? '✓' : '✗'}</span>
                </div>
                <div style={{ fontSize: '11px', color: theme.textMuted }}>{size} (≥{min})</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ===================== 渐变生成子组件 =====================

function CssGradientPanel() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [type, setType] = React.useState('linear')
  const [angle, setAngle] = React.useState(90)
  const [colors, setColors] = React.useState(['#667eea', '#764ba2'])

  const gradient = type === 'linear' ? `linear-gradient(${angle}deg, ${colors.join(', ')})` : `radial-gradient(circle, ${colors.join(', ')})`

  const cssCode = `background: ${gradient};`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: '150px', background: gradient, borderRadius: radius.md, border: `1px solid ${theme.border}` }} />

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <CustomSelect value={type} onChange={setType} options={[{ value: 'linear', label: 'Linear' }, { value: 'radial', label: 'Radial' }]} />
        {type === 'linear' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>{lang === 'zh' ? '角度' : 'Angle'}:</span>
            <input type="number" value={angle} onChange={e => setAngle(Number(e.target.value))} style={{ width: '60px', padding: '6px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, background: theme.bgSecondary, color: theme.textPrimary }} />
            <span style={{ fontSize: '12px', color: theme.textMuted }}>°</span>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {colors.map((c, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <input type="color" value={c} onChange={e => setColors(colors.map((x, j) => j === i ? e.target.value : x))} style={{ width: '32px', height: '32px', border: 'none', borderRadius: radius.sm, cursor: 'pointer' }} />
            <input type="text" value={c} onChange={e => setColors(colors.map((x, j) => j === i ? e.target.value : x))} style={{ width: '80px', padding: '4px 8px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, fontSize: '11px', background: theme.bgSecondary, color: theme.textPrimary }} />
          </div>
        ))}
        <button onClick={() => setColors([...colors, '#ffffff'])} style={{ padding: '6px 12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.sm, cursor: 'pointer' }}>+</button>
        {colors.length > 2 && <button onClick={() => setColors(colors.slice(0, -1))} style={{ padding: '6px 12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.sm, cursor: 'pointer' }}>-</button>}
      </div>

      <div style={{ padding: '12px', background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}` }}>
        <pre style={{ margin: 0, fontFamily: font.mono, fontSize: '12px', color: theme.textPrimary, overflow: 'auto' }}>{cssCode}</pre>
      </div>

      <button onClick={() => navigator.clipboard.writeText(cssCode)} style={{ padding: '8px 16px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer' }}>{lang === 'zh' ? '复制 CSS' : 'Copy CSS'}</button>
    </div>
  )
}

// ===================== Box Shadow 子组件 =====================

function BoxShadowPanel() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [x, setX] = React.useState(0)
  const [y, setY] = React.useState(4)
  const [blur, setBlur] = React.useState(8)
  const [spread, setSpread] = React.useState(0)
  const [color, setColor] = React.useState('rgba(0,0,0,0.1)')
  const [inset, setInset] = React.useState(false)

  const cssCode = `box-shadow: ${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color};`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ height: '120px', background: theme.bgSecondary, borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100px', height: '60px', background: theme.bgPrimary, borderRadius: radius.md, boxShadow: `${inset ? 'inset ' : ''}${x}px ${y}px ${blur}px ${spread}px ${color}` }} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
        {[['X', x, setX], ['Y', y, setY], ['Blur', blur, setBlur], ['Spread', spread, setSpread]].map(([label, value, setter]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', color: theme.textMuted, width: '50px' }}>{label}:</span>
            <input type="range" min="-50" max="50" value={value} onChange={e => setter(Number(e.target.value))} style={{ flex: 1 }} />
            <input type="number" value={value} onChange={e => setter(Number(e.target.value))} style={{ width: '50px', padding: '4px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, background: theme.bgSecondary, color: theme.textPrimary, fontSize: '12px' }} />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: '12px', color: theme.textMuted }}>Color:</span>
        <input type="color" value={color.startsWith('#') ? color : '#000000'} onChange={e => setColor(e.target.value)} style={{ width: '32px', height: '32px', border: 'none', borderRadius: radius.sm, cursor: 'pointer' }} />
        <input type="text" value={color} onChange={e => setColor(e.target.value)} style={{ flex: 1, padding: '6px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, fontSize: '12px', background: theme.bgSecondary, color: theme.textPrimary }} />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
        <input type="checkbox" checked={inset} onChange={e => setInset(e.target.checked)} />
        <span style={{ fontSize: '13px' }}>Inset</span>
      </label>

      <div style={{ padding: '12px', background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}` }}>
        <pre style={{ margin: 0, fontFamily: font.mono, fontSize: '12px', color: theme.textPrimary }}>{cssCode}</pre>
      </div>

      <button onClick={() => navigator.clipboard.writeText(cssCode)} style={{ padding: '8px 16px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer' }}>{lang === 'zh' ? '复制 CSS' : 'Copy CSS'}</button>
    </div>
  )
}

// ===================== CSS 单位换算子组件 =====================

const CSS_UNITS = ['px', 'em', 'rem', 'pt', 'vh', 'vw', '%']

function CssUnitPanel() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [value, setValue] = React.useState(16)
  const [unit, setUnit] = React.useState('px')
  const [baseSize, setBaseSize] = React.useState(16)

  const conversions = React.useMemo(() => {
    const px = unit === 'px' ? value : unit === 'em' || unit === 'rem' ? value * baseSize : unit === 'pt' ? value * 1.333 : unit === 'vh' || unit === 'vw' || unit === '%' ? null : value
    if (px === null) return null
    return {
      px: px,
      em: px / baseSize,
      rem: px / 16,
      pt: px / 1.333,
    }
  }, [value, unit, baseSize])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input type="number" value={value} onChange={e => setValue(Number(e.target.value))} style={{ width: '100px', padding: '8px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, fontSize: '16px', background: theme.bgSecondary, color: theme.textPrimary }} />
        <CustomSelect value={unit} onChange={setUnit} options={CSS_UNITS.map(u => ({ value: u, label: u }))} />
      </div>

      {(unit === 'em' || unit === '%') && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: theme.textMuted }}>{lang === 'zh' ? '基准字号' : 'Base size'} (px):</span>
          <input type="number" value={baseSize} onChange={e => setBaseSize(Number(e.target.value))} style={{ width: '60px', padding: '6px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, background: theme.bgSecondary, color: theme.textPrimary }} />
        </div>
      )}

      {conversions && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {Object.entries(conversions).map(([u, v]) => (
            <div key={u} style={{ padding: '12px', background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '11px', color: theme.textMuted }}>{u}</div>
              <div style={{ fontSize: '18px', fontFamily: font.mono, color: theme.textPrimary }}>{v.toFixed(4)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===================== 主组件 =====================

export default function CssTool() {
  const { lang } = useLang()
  const [activeTool, setActiveTool] = React.useState('color')

  const tools = [
    { value: 'color', label: lang === 'zh' ? '颜色选择' : 'Color Picker' },
    { value: 'palette', label: lang === 'zh' ? '调色板' : 'Palette' },
    { value: 'contrast', label: lang === 'zh' ? '对比度' : 'Contrast' },
    { value: 'gradient', label: lang === 'zh' ? '渐变' : 'Gradient' },
    { value: 'shadow', label: lang === 'zh' ? '阴影' : 'Shadow' },
    { value: 'unit', label: lang === 'zh' ? '单位换算' : 'Unit' },
  ]

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ToggleGroup options={tools} value={activeTool} onChange={setActiveTool} />
      
      {activeTool === 'color' && <ColorPickerPanel />}
      {activeTool === 'palette' && <ColorPalettePanel />}
      {activeTool === 'contrast' && <ContrastCheckerPanel />}
      {activeTool === 'gradient' && <CssGradientPanel />}
      {activeTool === 'shadow' && <BoxShadowPanel />}
      {activeTool === 'unit' && <CssUnitPanel />}
    </div>
  )
}