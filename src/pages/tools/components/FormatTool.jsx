import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'
import ToggleGroup from './ui/ToggleGroup'
import CustomSelect from './ui/CustomSelect'
import NumberInput from './ui/NumberInput'
import {
  formatJson, minifyJson,
  formatSql, minifySql,
  formatXml, minifyXml,
  yamlToJson, jsonToYaml,
  parseToml, jsonToToml,
} from '../../../utils/core'

export default function FormatTool() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [activeTool, setActiveTool] = React.useState('json')
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [error, setError] = React.useState('')
  const [mode, setMode] = React.useState('format')
  const [indent, setIndent] = React.useState(2)

  const tools = [
    { id: 'json', name: 'JSON' },
    { id: 'js', name: 'JS' },
    { id: 'css', name: 'CSS' },
    { id: 'sql', name: 'SQL' },
    { id: 'xml', name: 'XML' },
    { id: 'yaml', name: 'YAML' },
    { id: 'toml', name: 'TOML' },
  ]

  const modeOptions = {
    json: [
      { value: 'format', label: lang === 'zh' ? '格式化' : 'Format' },
      { value: 'minify', label: lang === 'zh' ? '压缩' : 'Minify' },
    ],
    js: [
      { value: 'format', label: lang === 'zh' ? '格式化' : 'Format' },
      { value: 'minify', label: lang === 'zh' ? '压缩' : 'Minify' },
    ],
    css: [
      { value: 'format', label: lang === 'zh' ? '格式化' : 'Format' },
      { value: 'minify', label: lang === 'zh' ? '压缩' : 'Minify' },
    ],
    sql: [
      { value: 'format', label: lang === 'zh' ? '格式化' : 'Format' },
      { value: 'minify', label: lang === 'zh' ? '压缩' : 'Minify' },
    ],
    xml: [
      { value: 'format', label: lang === 'zh' ? '格式化' : 'Format' },
      { value: 'minify', label: lang === 'zh' ? '压缩' : 'Minify' },
    ],
    yaml: [
      { value: 'yaml2json', label: 'YAML→JSON' },
      { value: 'json2yaml', label: 'JSON→YAML' },
    ],
    toml: [
      { value: 'toml2json', label: 'TOML→JSON' },
      { value: 'json2toml', label: 'JSON→TOML' },
    ],
  }

  // CSS 格式化
  const formatCss = (css) => {
    try {
      let formatted = css.replace(/\/\*[\s\S]*?\*\//g, '')
      formatted = formatted.replace(/\s*{\s*/g, ' {\n  ')
      formatted = formatted.replace(/\s*}\s*/g, '\n}\n')
      formatted = formatted.replace(/;\s*/g, ';\n  ')
      formatted = formatted.replace(/\n\s*\n/g, '\n')
      formatted = formatted.replace(/\n  \n}/g, '\n}')
      formatted = formatted.trim()
      return { ok: true, value: formatted }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  // CSS 压缩
  const minifyCss = (css) => {
    try {
      const minified = css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s*([{};:,>~+])\s*/g, '$1')
        .replace(/\s+/g, ' ')
        .replace(/;\}/g, '}')
        .trim()
      return { ok: true, value: minified }
    } catch (e) {
      return { ok: false, error: e.message }
    }
  }

  const handleProcess = () => {
    if (!input.trim()) return
    setError('')
    setOutput('')

    let result
    switch (activeTool) {
      case 'json':
        result = mode === 'format' ? formatJson(input, indent) : minifyJson(input)
        break
      case 'js':
        result = mode === 'format' ? formatJson(input, indent) : minifyJson(input)
        break
      case 'css':
        result = mode === 'format' ? formatCss(input) : minifyCss(input)
        break
      case 'sql':
        result = mode === 'format' ? formatSql(input) : minifySql(input)
        break
      case 'xml':
        result = mode === 'format' ? formatXml(input, indent) : minifyXml(input)
        break
      case 'yaml':
        result = mode === 'yaml2json' ? yamlToJson(input) : jsonToYaml(input)
        break
      case 'toml':
        result = mode === 'toml2json' ? parseToml(input) : jsonToToml(input)
        break
      default:
        result = { ok: false, error: 'Unknown tool' }
    }

    if (result.ok) {
      setOutput(result.value)
    } else {
      setError(result.error)
    }
  }

  const copyOutput = () => {
    if (output) navigator.clipboard.writeText(output)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  const getInputPlaceholder = () => {
    const placeholders = {
      json: lang === 'zh' ? '输入 JSON...' : 'Enter JSON...',
      js: lang === 'zh' ? '输入 JavaScript...' : 'Enter JavaScript...',
      css: lang === 'zh' ? '输入 CSS...' : 'Enter CSS...',
      sql: lang === 'zh' ? '输入 SQL...' : 'Enter SQL...',
      xml: lang === 'zh' ? '输入 XML...' : 'Enter XML...',
      yaml: mode === 'yaml2json' ? (lang === 'zh' ? '输入 YAML...' : 'Enter YAML...') : (lang === 'zh' ? '输入 JSON...' : 'Enter JSON...'),
      toml: mode === 'toml2json' ? (lang === 'zh' ? '输入 TOML...' : 'Enter TOML...') : (lang === 'zh' ? '输入 JSON...' : 'Enter JSON...'),
    }
    return placeholders[activeTool] || ''
  }

  const getOutputLabel = () => {
    const labels = {
      json: lang === 'zh' ? '输出结果' : 'Output',
      js: lang === 'zh' ? '输出结果' : 'Output',
      css: lang === 'zh' ? '输出结果' : 'Output',
      sql: lang === 'zh' ? '输出结果' : 'Output',
      xml: lang === 'zh' ? '输出结果' : 'Output',
      yaml: mode === 'yaml2json' ? 'JSON' : 'YAML',
      toml: mode === 'toml2json' ? 'JSON' : 'TOML',
    }
    return labels[activeTool] || 'Output'
  }

  const styles = {
    container: {
      padding: '20px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
    },
    btnPrimary: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '6px 12px',
      background: theme.bgAccent,
      color: theme.bgPrimary,
      border: 'none',
      borderRadius: radius.sm,
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: font.ui,
      fontWeight: 500,
    },
    btnSecondary: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '6px 12px',
      background: theme.bgSecondary,
      color: theme.textPrimary,
      border: `1px solid ${theme.border}`,
      borderRadius: radius.sm,
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: font.ui,
      fontWeight: 500,
    },
    inputLabel: {
      fontSize: '11px',
      fontFamily: font.mono,
      color: theme.textMuted,
      marginBottom: '6px',
    },
    textarea: {
      width: '100%',
      padding: '12px',
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: radius.md,
      color: theme.textPrimary,
      fontFamily: font.mono,
      fontSize: '13px',
      lineHeight: 1.6,
      resize: 'vertical',
      outline: 'none',
      boxSizing: 'border-box',
      minHeight: '150px',
    },
    textareaReadonly: {
      width: '100%',
      padding: '12px',
      background: theme.bgTertiary,
      border: `1px solid ${theme.border}`,
      borderRadius: radius.md,
      color: theme.textPrimary,
      fontFamily: font.mono,
      fontSize: '13px',
      lineHeight: 1.6,
      resize: 'none',
      outline: 'none',
      boxSizing: 'border-box',
      minHeight: '150px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      flex: 1,
      minHeight: 0,
    },
    panel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      minHeight: 0,
    },
    error: {
      padding: '8px 12px',
      background: theme.bgTertiary,
      borderRadius: radius.sm,
      color: '#EF4444',
      fontSize: '12px',
      fontFamily: font.mono,
    },
  }

  // 切换工具时重置模式
  React.useEffect(() => {
    setMode(modeOptions[activeTool]?.[0]?.value || 'format')
  }, [activeTool])

  return (
    <div style={styles.container}>
      {/* 工具选择 */}
      <div style={styles.toolbar}>
        <ToggleGroup
          value={activeTool}
          onChange={setActiveTool}
          options={tools.map(t => ({ value: t.id, label: t.name }))}
        />
      </div>

      {/* 参数区域 */}
      <div style={styles.toolbar}>
        <ToggleGroup
          value={mode}
          onChange={setMode}
          options={modeOptions[activeTool] || []}
        />
        {['json', 'js', 'xml'].includes(activeTool) && mode === 'format' && (
          <>
            <span style={{ fontSize: '12px', color: theme.textSecondary, fontFamily: font.mono }}>
              {lang === 'zh' ? '缩进:' : 'Indent:'}
            </span>
            <NumberInput
              value={indent}
              onChange={setIndent}
              min={1}
              max={8}
            />
          </>
        )}
        <button onClick={handleProcess} style={styles.btnPrimary}>
          {lang === 'zh' ? '执行' : 'Process'}
        </button>
        <button onClick={clearAll} style={styles.btnSecondary}>
          {lang === 'zh' ? '清空' : 'Clear'}
        </button>
      </div>

      {/* 输入输出区域 */}
      <div style={styles.grid}>
        <div style={styles.panel}>
          <div style={styles.inputLabel}>{lang === 'zh' ? '输入' : 'Input'}</div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={getInputPlaceholder()}
            style={styles.textarea}
            spellCheck={false}
          />
        </div>
        <div style={styles.panel}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={styles.inputLabel}>{getOutputLabel()}</span>
            {output && (
              <button onClick={copyOutput} style={{
                padding: '4px 8px',
                background: 'transparent',
                border: `1px solid ${theme.border}`,
                borderRadius: radius.sm,
                color: theme.textSecondary,
                cursor: 'pointer',
                fontSize: '11px',
                fontFamily: font.mono,
              }}>
                {lang === 'zh' ? '复制' : 'Copy'}
              </button>
            )}
          </div>
          {error ? (
            <div style={styles.error}>{error}</div>
          ) : (
            <textarea
              value={output}
              readOnly
              placeholder={lang === 'zh' ? '输出结果...' : 'Output result...'}
              style={styles.textareaReadonly}
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  )
}