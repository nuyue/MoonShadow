import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

// SVG 优化器 - 简化版实现
// 移除不必要的属性、压缩空白、优化路径等

const PRESETS = {
  safe: {
    name: '安全模式',
    desc: '保留 id/class/aria，适合内联 SVG',
  },
  balanced: {
    name: '均衡模式（推荐）',
    desc: '兼顾压缩与兼容性',
  },
  aggressive: {
    name: '激进模式',
    desc: '最大压缩率，可能影响样式引用',
  },
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function optimizeSvg(svg, preset) {
  let result = svg

  // 1. 移除 XML 声明和 DOCTYPE
  result = result.replace(/<\?xml[^>]*\?>/gi, '')
  result = result.replace(/<!DOCTYPE[^>]*>/gi, '')

  // 2. 移除注释
  result = result.replace(/<!--[\s\S]*?-->/g, '')

  // 3. 移除不必要的命名空间
  result = result.replace(/\sxmlns:xlink="[^"]*"/gi, '')
  result = result.replace(/\sxmlns:svg="[^"]*"/gi, '')

  // 4. 移除 Adobe/Sketch 编辑器属性
  result = result.replace(/\s(adobe-|sketch-|inkscape-)[a-z-]+="[^"]*"/gi, '')
  result = result.replace(/\s(enable-background|xml:space)="[^"]*"/gi, '')

  // 5. 压缩空白
  result = result.replace(/>\s+</g, '><')
  result = result.replace(/\s+/g, ' ')

  // 6. 移除空属性
  result = result.replace(/\s[a-z-]+=""/gi, '')

  // 7. 移除默认值属性
  result = result.replace(/\sfill-opacity="1"/gi, '')
  result = result.replace(/\sstroke-opacity="1"/gi, '')
  result = result.replace(/\sopacity="1"/gi, '')

  // 均衡和激进模式的额外优化
  if (preset !== 'safe') {
    // 移除隐藏元素
    result = result.replace(/<[^>]+\sdisplay="none"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    result = result.replace(/<[^>]+\svisibility="hidden"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')
    result = result.replace(/<[^>]+\sopacity="0"[^>]*>[\s\S]*?<\/[^>]+>/gi, '')

    // 简化颜色
    result = result.replace(/#000000/gi, '#000')
    result = result.replace(/#ffffff/gi, '#fff')
    result = result.replace(/#111111/gi, '#111')
    result = result.replace(/#222222/gi, '#222')
    result = result.replace(/#333333/gi, '#333')
    result = result.replace(/#444444/gi, '#444')
    result = result.replace(/#555555/gi, '#555')
    result = result.replace(/#666666/gi, '#666')
    result = result.replace(/#777777/gi, '#777')
    result = result.replace(/#888888/gi, '#888')
    result = result.replace(/#999999/gi, '#999')
    result = result.replace(/#aaaaaa/gi, '#aaa')
    result = result.replace(/#bbbbbb/gi, '#bbb')
    result = result.replace(/#cccccc/gi, '#ccc')
    result = result.replace(/#dddddd/gi, '#ddd')
    result = result.replace(/#eeeeee/gi, '#eee')
    result = result.replace(/#ffffff/gi, '#fff')

    // 移除 transform="translate(0 0)"
    result = result.replace(/\s*transform="translate\(0\s*(,\s*0)?\)"/gi, '')

    // 合并相同样式的 path
    // 简化：移除冗余的 group
    if (preset === 'aggressive') {
      result = result.replace(/<g\s*>\s*<\/g>/gi, '')
      result = result.replace(/<g\s*>([^<]*)<\/g>/gi, '$1')

      // 移除不必要的 clip-path
      result = result.replace(/\sclip-path="url\(#[^)]*\)"/gi, '')

      // 移除 mask
      result = result.replace(/\smask="url\(#[^)]*\)"/gi, '')
    }
  }

  // Safe 模式保留 id/class/aria
  if (preset === 'aggressive') {
    // 激进模式：移除无引用的 id
    const usedIds = new Set()
    const idMatches = result.matchAll(/url\(#([^)]+)\)/g)
    for (const match of idMatches) {
      usedIds.add(match[1])
    }

    result = result.replace(/\sid="([^"]+)"/g, (match, id) => {
      return usedIds.has(id) ? match : ''
    })

    // 移除未使用的定义
    // 简化版本：只处理明显无引用的 defs
  }

  // 清理多余空格
  result = result.trim()

  return result
}

const SvgOptimizer = () => {
  const { theme, radius, font } = useTheme()
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [stats, setStats] = React.useState(null)
  const [error, setError] = React.useState('')
  const [preset, setPreset] = React.useState('balanced')
  const [copied, setCopied] = React.useState(false)

  const handleOptimize = React.useCallback(() => {
    if (!input.trim()) return
    setError('')
    try {
      const result = optimizeSvg(input, preset)
      setOutput(result)
      setStats({
        original: new Blob([input]).size,
        optimized: new Blob([result]).size,
      })
    } catch (e) {
      setError(e.message || '优化失败，请检查 SVG 格式')
    }
  }, [input, preset])

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setInput(ev.target?.result)
      setOutput('')
      setStats(null)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDownload = () => {
    if (!output) return
    const blob = new Blob([output], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'optimized.svg'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = () => {
    if (!output) return
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const savingPct = stats
    ? (((stats.original - stats.optimized) / stats.original) * 100).toFixed(1)
    : null

  const textareaStyle = {
    width: '100%',
    minHeight: '300px',
    padding: '12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    color: theme.textPrimary,
    fontFamily: font.ui,
    fontSize: '12px',
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

  const presetButtonStyle = (active) => ({
    padding: '10px 12px',
    background: active ? theme.bgAccent : theme.bgSecondary,
    border: `1px solid ${active ? 'transparent' : theme.border}`,
    borderRadius: radius.md,
    color: active ? theme.bgPrimary : theme.textSecondary,
    fontSize: '11px',
    cursor: 'pointer',
    textAlign: 'left',
    flex: 1,
  })

  return (
    <div style={{ padding: '20px' }}>
      {/* 预设选择 */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {Object.keys(PRESETS).map(key => (
          <button
            key={key}
            onClick={() => setPreset(key)}
            style={presetButtonStyle(preset === key)}
          >
            <div style={{ fontWeight: '500' }}>{PRESETS[key].name}</div>
            <div style={{ fontSize: '10px', opacity: 0.7, marginTop: '2px' }}>{PRESETS[key].desc}</div>
          </button>
        ))}
      </div>

      {/* 统计信息 */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
          {[
            { label: '原始大小', value: formatBytes(stats.original) },
            { label: '优化后大小', value: formatBytes(stats.optimized) },
            { label: '压缩率', value: `${savingPct}%`, highlight: true },
          ].map(({ label, value, highlight }) => (
            <div key={label} style={{
              padding: '12px',
              background: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
              borderRadius: radius.md,
              textAlign: 'center',
            }}>
              <div style={{
                fontSize: '18px',
                fontWeight: 'bold',
                fontFamily: font.ui,
                color: highlight ? theme.bgAccent : theme.textPrimary,
              }}>{value}</div>
              <div style={{ fontSize: '11px', color: theme.textMuted }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '12px',
          background: `${theme.error}15`,
          border: `1px solid ${theme.error}30`,
          borderRadius: radius.md,
          color: theme.error,
          fontSize: '13px',
        }}>{error}</div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
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
            onChange={e => { setInput(e.target.value); setOutput(''); setStats(null) }}
            placeholder="粘贴 SVG 代码，或点击上传文件..."
            style={textareaStyle}
          />
          {input && input.includes('<svg') && (
            <div style={{
              height: '100px',
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
            <label style={{ fontSize: '11px', fontWeight: '500', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.5px' }}>优化结果</label>
            {output && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={handleCopy} style={{ ...buttonStyle, padding: '4px 8px', fontSize: '11px' }}>
                  {copied ? '✓ 已复制' : '复制'}
                </button>
                <button onClick={handleDownload} style={{ ...buttonStyle, padding: '4px 8px', fontSize: '11px' }}>下载</button>
              </div>
            )}
          </div>
          <textarea
            value={output}
            readOnly
            placeholder="优化结果将显示在这里..."
            style={{ ...textareaStyle, color: output ? theme.textPrimary : theme.textMuted }}
          />
          {output && (
            <div style={{
              height: '100px',
              background: '#fff',
              border: `1px solid ${theme.border}`,
              borderRadius: radius.md,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              overflow: 'hidden',
            }}>
              <div style={{ maxWidth: '100px', maxHeight: '80px' }} dangerouslySetInnerHTML={{ __html: output }} />
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleOptimize}
        disabled={!input.trim()}
        style={{
          ...primaryButtonStyle,
          width: '100%',
          padding: '12px',
          fontSize: '13px',
          opacity: input.trim() ? 1 : 0.5,
          cursor: input.trim() ? 'pointer' : 'not-allowed',
        }}
      >
        优化 SVG
      </button>
    </div>
  )
}

export default SvgOptimizer
