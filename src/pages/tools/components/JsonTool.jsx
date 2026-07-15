import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'
import ToggleGroup from './ui/ToggleGroup'
import CustomSelect from './ui/CustomSelect'

// ===================== JSON Schema 生成 =====================

function inferType(value) {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function inferFormat(value) {
  if (typeof value !== 'string') return undefined
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) return 'date-time'
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'date'
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'email'
  if (/^https?:\/\//.test(value)) return 'uri'
  return undefined
}

function generateSchema(value, options) {
  const type = inferType(value)
  if (value === null) return { type: 'null' }
  if (type === 'string') {
    const schema = { type: 'string' }
    if (options.detectFormat) { const fmt = inferFormat(value); if (fmt) schema.format = fmt }
    if (options.addExamples) schema.examples = [value]
    return schema
  }
  if (type === 'number') {
    const schema = { type: Number.isInteger(value) ? 'integer' : 'number' }
    if (options.addExamples) schema.examples = [value]
    return schema
  }
  if (type === 'boolean') return { type: 'boolean' }
  if (type === 'array') {
    if (value.length === 0) return { type: 'array', items: {} }
    const itemTypes = [...new Set(value.map(inferType))]
    if (itemTypes.length === 1) return { type: 'array', items: generateSchema(value[0], options) }
    return { type: 'array', items: { anyOf: itemTypes.map(t => generateSchema(value.find(v => inferType(v) === t), options)) } }
  }
  if (type === 'object') {
    const properties = {}
    const required = []
    Object.entries(value).forEach(([key, val]) => {
      properties[key] = generateSchema(val, options)
      if (val !== null && val !== undefined) required.push(key)
    })
    const schema = { type: 'object', properties }
    if (required.length > 0) schema.required = required
    return schema
  }
  return {}
}

function JsonSchemaGenPanel() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [addExamples, setAddExamples] = React.useState(false)
  const [detectFormat, setDetectFormat] = React.useState(true)
  const [addDollarSchema, setAddDollarSchema] = React.useState(true)
  const [error, setError] = React.useState('')

  const generate = () => {
    if (!input.trim()) return
    setError('')
    try {
      const parsed = JSON.parse(input)
      const schema = generateSchema(parsed, { addExamples, detectFormat })
      if (addDollarSchema) schema.$schema = 'http://json-schema.org/draft-07/schema#'
      setOutput(JSON.stringify(schema, null, 2))
    } catch (e) { setError(e.message) }
  }

  const textareaStyle = {
    width: '100%', minHeight: '200px', padding: '12px', background: theme.bgSecondary,
    color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
    fontFamily: font.mono, fontSize: '12px', resize: 'vertical', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
          <input type="checkbox" checked={addDollarSchema} onChange={e => setAddDollarSchema(e.target.checked)} /> $schema
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
          <input type="checkbox" checked={detectFormat} onChange={e => setDetectFormat(e.target.checked)} /> {lang === 'zh' ? '检测格式' : 'Detect format'}
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', cursor: 'pointer' }}>
          <input type="checkbox" checked={addExamples} onChange={e => setAddExamples(e.target.checked)} /> examples
        </label>
      </div>

      {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: radius.md, color: '#ef4444', fontSize: '12px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <textarea value={input} onChange={e => { setInput(e.target.value); setOutput('') }} placeholder='{"key": "value"}' style={textareaStyle} spellCheck={false} />
          <button onClick={generate} disabled={!input.trim()} style={{ marginTop: '8px', padding: '8px 16px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer', opacity: input.trim() ? 1 : 0.5 }}>
            {lang === 'zh' ? '生成 Schema' : 'Generate'}
          </button>
        </div>
        <textarea value={output} readOnly placeholder={lang === 'zh' ? '输出...' : 'Output...'} style={{ ...textareaStyle, background: theme.bgTertiary }} />
      </div>
    </div>
  )
}

// ===================== JSON Schema 验证 =====================

function JsonSchemaVerifyPanel() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [jsonInput, setJsonInput] = React.useState('')
  const [schemaInput, setSchemaInput] = React.useState('')
  const [result, setResult] = React.useState(null)
  const [error, setError] = React.useState('')

  const validate = () => {
    setError('')
    setResult(null)
    try {
      const data = JSON.parse(jsonInput)
      const schema = JSON.parse(schemaInput)
      // 简单验证：检查必需字段和类型
      const errors = []
      const validateRecursive = (obj, sch, path = '') => {
        if (sch.type && sch.type !== inferType(obj)) {
          errors.push({ path, message: `Expected ${sch.type}, got ${inferType(obj)}` })
          return
        }
        if (sch.type === 'object' && sch.properties) {
          if (sch.required) {
            for (const req of sch.required) {
              if (obj[req] === undefined) errors.push({ path: `${path}.${req}`, message: 'Missing required field' })
            }
          }
          for (const [key, propSchema] of Object.entries(sch.properties)) {
            if (obj[key] !== undefined) validateRecursive(obj[key], propSchema, `${path}.${key}`)
          }
        }
        if (sch.type === 'array' && sch.items && Array.isArray(obj)) {
          obj.forEach((item, i) => validateRecursive(item, sch.items, `${path}[${i}]`))
        }
      }
      validateRecursive(data, schema)
      setResult({ valid: errors.length === 0, errors })
    } catch (e) { setError(e.message) }
  }

  const textareaStyle = {
    width: '100%', minHeight: '150px', padding: '12px', background: theme.bgSecondary,
    color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
    fontFamily: font.mono, fontSize: '12px', resize: 'vertical', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: radius.md, color: '#ef4444', fontSize: '12px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>{lang === 'zh' ? 'JSON 数据' : 'JSON Data'}</label>
          <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} placeholder='{"key": "value"}' style={textareaStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>JSON Schema</label>
          <textarea value={schemaInput} onChange={e => setSchemaInput(e.target.value)} placeholder='{"type": "object"}' style={textareaStyle} />
        </div>
      </div>

      <button onClick={validate} disabled={!jsonInput.trim() || !schemaInput.trim()} style={{ padding: '8px 16px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer', opacity: jsonInput.trim() && schemaInput.trim() ? 1 : 0.5 }}>
        {lang === 'zh' ? '验证' : 'Validate'}
      </button>

      {result && (
        <div style={{ padding: '12px', background: result.valid ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', borderRadius: radius.md, border: `1px solid ${result.valid ? '#22c55e' : '#ef4444'}` }}>
          <div style={{ fontWeight: 500, color: result.valid ? '#22c55e' : '#ef4444' }}>{result.valid ? (lang === 'zh' ? '验证通过' : 'Valid') : (lang === 'zh' ? '验证失败' : 'Invalid')}</div>
          {!result.valid && result.errors.map((e, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#ef4444', marginTop: '4px' }}>{e.path}: {e.message}</div>
          ))}
        </div>
      )}
    </div>
  )
}

// ===================== JSONPath 查询 =====================

function JsonPathPanel() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [jsonInput, setJsonInput] = React.useState('{\n  "users": [\n    {"id": 1, "name": "Alice"},\n    {"id": 2, "name": "Bob"}\n  ]\n}')
  const [path, setPath] = React.useState('$.users[*].name')
  const [result, setResult] = React.useState('')
  const [error, setError] = React.useState('')

  const execute = () => {
    setError('')
    setResult('')
    try {
      const data = JSON.parse(jsonInput)
      // 简单 JSONPath 实现
      const simplePath = (obj, p) => {
        const parts = p.replace(/^\$\.?/, '').split(/[.\[\]]+/).filter(Boolean)
        let current = obj
        for (const part of parts) {
          if (part === '*') {
            if (Array.isArray(current)) return current
            return Object.values(current)
          }
          if (current === null || current === undefined) return undefined
          current = current[part]
        }
        return current
      }
      const res = simplePath(data, path)
      setResult(JSON.stringify(res, null, 2))
    } catch (e) { setError(e.message) }
  }

  const textareaStyle = {
    width: '100%', minHeight: '150px', padding: '12px', background: theme.bgSecondary,
    color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
    fontFamily: font.mono, fontSize: '12px', resize: 'vertical', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: theme.textMuted }}>JSONPath:</span>
        <input type="text" value={path} onChange={e => setPath(e.target.value)} placeholder="$" style={{ flex: 1, padding: '8px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, background: theme.bgSecondary, color: theme.textPrimary }} />
        <button onClick={execute} style={{ padding: '8px 16px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer' }}>{lang === 'zh' ? '查询' : 'Query'}</button>
      </div>

      {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: radius.md, color: '#ef4444', fontSize: '12px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} style={textareaStyle} />
        <textarea value={result} readOnly placeholder={lang === 'zh' ? '结果...' : 'Result...'} style={{ ...textareaStyle, background: theme.bgTertiary }} />
      </div>
    </div>
  )
}

// ===================== JSON 合并 =====================

function JsonMergePanel() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [json1, setJson1] = React.useState('')
  const [json2, setJson2] = React.useState('')
  const [result, setResult] = React.useState('')
  const [error, setError] = React.useState('')

  const deepMerge = (a, b) => {
    if (typeof a !== 'object' || a === null) return b
    if (typeof b !== 'object' || b === null) return b
    if (Array.isArray(b)) return b
    const res = { ...a }
    for (const key of Object.keys(b)) {
      if (key in res) res[key] = deepMerge(res[key], b[key])
      else res[key] = b[key]
    }
    return res
  }

  const merge = () => {
    setError('')
    setResult('')
    try {
      const a = JSON.parse(json1 || '{}')
      const b = JSON.parse(json2 || '{}')
      const merged = deepMerge(a, b)
      setResult(JSON.stringify(merged, null, 2))
    } catch (e) { setError(e.message) }
  }

  const textareaStyle = {
    width: '100%', minHeight: '120px', padding: '12px', background: theme.bgSecondary,
    color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
    fontFamily: font.mono, fontSize: '12px', resize: 'vertical', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: radius.md, color: '#ef4444', fontSize: '12px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>JSON 1</label>
          <textarea value={json1} onChange={e => setJson1(e.target.value)} placeholder='{}' style={textareaStyle} />
        </div>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block' }}>JSON 2</label>
          <textarea value={json2} onChange={e => setJson2(e.target.value)} placeholder='{}' style={textareaStyle} />
        </div>
      </div>

      <button onClick={merge} style={{ padding: '8px 16px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer' }}>{lang === 'zh' ? '合并' : 'Merge'}</button>

      <textarea value={result} readOnly placeholder={lang === 'zh' ? '合并结果...' : 'Result...'} style={{ ...textareaStyle, background: theme.bgTertiary }} />
    </div>
  )
}

// ===================== JSON 转 CSV =====================

function JsonToCsvPanel() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [jsonInput, setJsonInput] = React.useState('[\n  {"name": "Alice", "age": 30},\n  {"name": "Bob", "age": 25}\n]')
  const [result, setResult] = React.useState('')
  const [error, setError] = React.useState('')

  const convert = () => {
    setError('')
    setResult('')
    try {
      const data = JSON.parse(jsonInput)
      if (!Array.isArray(data) || data.length === 0) throw new Error(lang === 'zh' ? '需要非空数组' : 'Need non-empty array')
      const keys = [...new Set(data.flatMap(Object.keys))]
      const csv = [keys.join(','), ...data.map(row => keys.map(k => {
        const v = row[k]
        const str = v === null || v === undefined ? '' : String(v)
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str
      }).join(','))].join('\n')
      setResult(csv)
    } catch (e) { setError(e.message) }
  }

  const textareaStyle = {
    width: '100%', minHeight: '150px', padding: '12px', background: theme.bgSecondary,
    color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
    fontFamily: font.mono, fontSize: '12px', resize: 'vertical', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: radius.md, color: '#ef4444', fontSize: '12px' }}>{error}</div>}

      <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} placeholder='[{}]' style={textareaStyle} />

      <button onClick={convert} style={{ padding: '8px 16px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer' }}>{lang === 'zh' ? '转换' : 'Convert'}</button>

      <textarea value={result} readOnly placeholder="CSV..." style={{ ...textareaStyle, background: theme.bgTertiary }} />
      {result && <button onClick={() => navigator.clipboard.writeText(result)} style={{ padding: '6px 12px', background: theme.bgSecondary, border: `1px solid ${theme.border}`, borderRadius: radius.sm, cursor: 'pointer' }}>{lang === 'zh' ? '复制' : 'Copy'}</button>}
    </div>
  )
}

// ===================== JSON 转类型定义 =====================

function JsonToTypePanel() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [jsonInput, setJsonInput] = React.useState('')
  const [typeName, setTypeName] = React.useState('Root')
  const [langType, setLangType] = React.useState('typescript')
  const [result, setResult] = React.useState('')
  const [error, setError] = React.useState('')

  const toType = (value, name = 'Root') => {
    const t = inferType(value)
    if (value === null) return 'null'
    if (t === 'string') return 'string'
    if (t === 'number') return 'number'
    if (t === 'boolean') return 'boolean'
    if (t === 'array') {
      if (value.length === 0) return `${name}[]`
      const itemTypes = [...new Set(value.map(v => toType(v, 'T')))]
      return itemTypes.length === 1 ? `${itemTypes[0]}[]` : `(${itemTypes.join(' | ')})[]`
    }
    if (t === 'object') {
      const props = Object.entries(value).map(([k, v]) => `  ${k}: ${toType(v, k.charAt(0).toUpperCase() + k.slice(1))};`).join('\n')
      return `{\n${props}\n}`
    }
    return 'unknown'
  }

  const convert = () => {
    setError('')
    setResult('')
    try {
      const data = JSON.parse(jsonInput)
      if (langType === 'typescript') {
        setResult(`interface ${typeName} ${toType(data, typeName)}`)
      } else {
        const goStruct = (obj, name) => {
          const props = Object.entries(obj).map(([k, v]) => {
            const t = inferType(v)
            const goType = t === 'string' ? 'string' : t === 'number' ? 'float64' : t === 'boolean' ? 'bool' : t === 'array' ? '[]interface{}' : t === 'object' ? goStruct(v, k) : 'interface{}'
            return `  ${k.charAt(0).toUpperCase() + k.slice(1)} ${goType} \`json:"${k}"\``
          }).join('\n')
          return `type ${name} struct {\n${props}\n}`
        }
        setResult(inferType(data) === 'object' ? goStruct(data, typeName) : toType(data))
      }
    } catch (e) { setError(e.message) }
  }

  const textareaStyle = {
    width: '100%', minHeight: '150px', padding: '12px', background: theme.bgSecondary,
    color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
    fontFamily: font.mono, fontSize: '12px', resize: 'vertical', outline: 'none',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <input type="text" value={typeName} onChange={e => setTypeName(e.target.value)} placeholder="TypeName" style={{ padding: '6px 12px', border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, background: theme.bgSecondary, color: theme.textPrimary }} />
        <CustomSelect value={langType} onChange={setLangType} options={[{ value: 'typescript', label: 'TypeScript' }, { value: 'go', label: 'Go' }]} />
        <button onClick={convert} style={{ padding: '6px 12px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer' }}>{lang === 'zh' ? '转换' : 'Convert'}</button>
      </div>

      {error && <div style={{ padding: '12px', background: 'rgba(239,68,68,0.1)', borderRadius: radius.md, color: '#ef4444', fontSize: '12px' }}>{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <textarea value={jsonInput} onChange={e => setJsonInput(e.target.value)} placeholder='{}' style={textareaStyle} />
        <textarea value={result} readOnly placeholder={lang === 'zh' ? '类型定义...' : 'Type definition...'} style={{ ...textareaStyle, background: theme.bgTertiary }} />
      </div>
    </div>
  )
}

// ===================== 主组件 =====================

export default function JsonTool() {
  const { lang } = useLang()
  const [activeTool, setActiveTool] = React.useState('schema')

  const tools = [
    { value: 'schema', label: lang === 'zh' ? 'Schema 生成' : 'Schema Gen' },
    { value: 'verify', label: lang === 'zh' ? 'Schema 验证' : 'Schema Verify' },
    { value: 'path', label: lang === 'zh' ? 'JSONPath' : 'JSONPath' },
    { value: 'merge', label: lang === 'zh' ? 'JSON 合并' : 'Merge' },
    { value: 'csv', label: lang === 'zh' ? '转 CSV' : 'To CSV' },
    { value: 'type', label: lang === 'zh' ? '转类型' : 'To Type' },
  ]

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <ToggleGroup options={tools} value={activeTool} onChange={setActiveTool} />

      {activeTool === 'schema' && <JsonSchemaGenPanel />}
      {activeTool === 'verify' && <JsonSchemaVerifyPanel />}
      {activeTool === 'path' && <JsonPathPanel />}
      {activeTool === 'merge' && <JsonMergePanel />}
      {activeTool === 'csv' && <JsonToCsvPanel />}
      {activeTool === 'type' && <JsonToTypePanel />}
    </div>
  )
}