import React from 'react'
import { useTheme, RADIUS, FONT } from '../../../context/ThemeContext'

// 简易 YAML 解析器
function parseYaml(text) {
  const lines = text.split('\n')
  const result = {}
  let currentKey = null
  let currentObj = result
  let stack = [result]
  let prevIndent = -1

  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const indent = line.search(/\S/)
    const [key, value] = line.trim().split(':').map(s => s.trim())

    if (value !== undefined && value !== '') {
      // 键值对
      if (indent < prevIndent) {
        while (stack.length > 1 && indent <= prevIndent) {
          stack.pop()
          prevIndent -= 2
        }
        currentObj = stack[stack.length - 1]
      }
      let parsedValue = value
      if (value === 'true') parsedValue = true
      else if (value === 'false') parsedValue = false
      else if (!isNaN(value) && value !== '') parsedValue = Number(value)
      else if (value.startsWith('[') && value.endsWith(']')) {
        parsedValue = value.slice(1, -1).split(',').map(s => s.trim())
      }
      else if (value.startsWith('"') && value.endsWith('"')) {
        parsedValue = value.slice(1, -1)
      }
      currentObj[key] = parsedValue
    } else if (key) {
      // 对象开始
      if (indent < prevIndent) {
        while (stack.length > 1 && indent <= prevIndent) {
          stack.pop()
          prevIndent -= 2
        }
        currentObj = stack[stack.length - 1]
      }
      currentObj[key] = {}
      currentObj = currentObj[key]
      stack.push(currentObj)
      prevIndent = indent
    }
  }
  return result
}

const METHOD_COLORS = {
  get: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  post: { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981' },
  put: { bg: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' },
  patch: { bg: 'rgba(249, 115, 22, 0.15)', color: '#f97316' },
  delete: { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
}

const EXAMPLE_SPEC = `openapi: 3.0.0
info:
  title: Sample API
  version: 1.0.0
  description: A sample API to demonstrate OpenAPI viewer
paths:
  /users:
    get:
      summary: List users
      tags: [Users]
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
      responses:
        '200':
          description: A list of users
    post:
      summary: Create user
      tags: [Users]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
      responses:
        '201':
          description: User created
  /users/{id}:
    get:
      summary: Get user by ID
      tags: [Users]
      parameters:
        - name: id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: User found
        '404':
          description: User not found`

const OpenapiViewer = () => {
  const { theme, radius, font } = useTheme()
  const [input, setInput] = React.useState('')
  const [spec, setSpec] = React.useState(null)
  const [error, setError] = React.useState('')
  const [selectedTag, setSelectedTag] = React.useState(null)
  const [expandedEndpoints, setExpandedEndpoints] = React.useState(new Set())

  const parseSpec = (text) => {
    setError('')
    try {
      let parsed
      if (text.trim().startsWith('{')) {
        parsed = JSON.parse(text)
      } else {
        parsed = parseYaml(text)
      }
      if (!parsed.paths && !parsed.info) {
        throw new Error('不是有效的 OpenAPI 规范')
      }
      setSpec(parsed)
    } catch (e) {
      setError(e.message)
      setSpec(null)
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result
      setInput(text)
      parseSpec(text)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const getAllTags = () => {
    if (!spec?.paths) return []
    const tags = new Set(['All'])
    Object.values(spec.paths).forEach(methods => {
      Object.values(methods).forEach(op => {
        if (op?.tags) op.tags.forEach(t => tags.add(t))
      })
    })
    return Array.from(tags)
  }

  const getFilteredEndpoints = () => {
    if (!spec?.paths) return []
    const endpoints = []
    Object.entries(spec.paths).forEach(([path, methods]) => {
      const httpMethods = ['get', 'post', 'put', 'patch', 'delete']
      httpMethods.forEach(method => {
        if (methods[method]) {
          const op = methods[method]
          if (!selectedTag || selectedTag === 'All' || op.tags?.includes(selectedTag)) {
            endpoints.push({ path, method, op })
          }
        }
      })
    })
    return endpoints
  }

  const toggleEndpoint = (index) => {
    const newExpanded = new Set(expandedEndpoints)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedEndpoints(newExpanded)
  }

  const textareaStyle = {
    width: '100%',
    minHeight: '150px',
    padding: '12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    color: theme.textPrimary,
    fontFamily: font.mono,
    fontSize: '13px',
    resize: 'vertical',
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

  const tagButtonStyle = (active) => ({
    padding: '6px 12px',
    background: active ? 'rgba(59, 130, 246, 0.15)' : theme.bgSecondary,
    border: `1px solid ${active ? '#3b82f6' : theme.border}`,
    borderRadius: radius.sm,
    color: active ? '#3b82f6' : theme.textSecondary,
    fontSize: '11px',
    cursor: 'pointer',
  })

  const tags = getAllTags()
  const endpoints = getFilteredEndpoints()

  return (
    <div style={{ padding: '20px' }}>
      {!spec ? (
        <>
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: `1px solid rgba(239, 68, 68, 0.3)`, borderRadius: radius.md, color: '#ef4444', marginBottom: '12px' }}>
              {error}
            </div>
          )}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <label style={{ ...buttonStyle, display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              上传 swagger.json / openapi.yaml
              <input type="file" accept=".json,.yaml,.yml" style={{ display: 'none' }} onChange={handleFileUpload} />
            </label>
            <button style={primaryButtonStyle} onClick={() => { setInput(EXAMPLE_SPEC); parseSpec(EXAMPLE_SPEC) }}>
              加载示例
            </button>
          </div>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="粘贴 OpenAPI JSON 或 YAML..."
            style={textareaStyle}
          />
          {input.trim() && (
            <button style={{ ...primaryButtonStyle, marginTop: '12px' }} onClick={() => parseSpec(input)}>
              解析 OpenAPI
            </button>
          )}
        </>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: theme.textPrimary, margin: 0 }}>{spec.info?.title}</h2>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', padding: '2px 8px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: radius.sm, color: '#3b82f6' }}>
                  v{spec.info?.version}
                </span>
                <span style={{ fontSize: '11px', padding: '2px 8px', background: theme.bgTertiary, borderRadius: radius.sm, color: theme.textMuted }}>
                  {spec.openapi || spec.swagger}
                </span>
                <span style={{ fontSize: '11px', color: theme.textMuted }}>
                  {endpoints.length} 个接口
                </span>
              </div>
              {spec.info?.description && (
                <p style={{ fontSize: '13px', color: theme.textSecondary, margin: '8px 0 0 0' }}>{spec.info.description}</p>
              )}
            </div>
            <button style={buttonStyle} onClick={() => { setSpec(null); setInput(''); setError(''); setSelectedTag(null) }}>
              重新加载
            </button>
          </div>

          {tags.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(tag === 'All' ? null : tag)}
                  style={tagButtonStyle((tag === 'All' && !selectedTag) || tag === selectedTag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {endpoints.map((ep, i) => {
              const methodColor = METHOD_COLORS[ep.method] || { bg: theme.bgTertiary, color: theme.textMuted }
              const isExpanded = expandedEndpoints.has(i)
              const hasDetails = ep.op?.parameters?.length || ep.op?.requestBody || ep.op?.responses

              return (
                <div key={i} style={{ border: `1px solid ${theme.border}`, borderRadius: radius.md, overflow: 'hidden' }}>
                  <button
                    onClick={() => hasDetails && toggleEndpoint(i)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      background: 'transparent',
                      border: 'none',
                      cursor: hasDetails ? 'pointer' : 'default',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      padding: '2px 8px',
                      background: methodColor.bg,
                      border: `1px solid ${methodColor.color}33`,
                      borderRadius: radius.sm,
                      color: methodColor.color,
                      fontSize: '10px',
                      fontWeight: 'bold',
                      textTransform: 'uppercase',
                    }}>
                      {ep.method}
                    </span>
                    <span style={{ flex: 1, fontSize: '13px', fontFamily: font.mono, color: theme.textPrimary }}>
                      {ep.path}
                    </span>
                    {ep.op?.summary && (
                      <span style={{ fontSize: '12px', color: theme.textMuted, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ep.op.summary}
                      </span>
                    )}
                    {hasDetails && (
                      <span style={{ color: theme.textMuted, fontSize: '12px' }}>
                        {isExpanded ? '▼' : '▶'}
                      </span>
                    )}
                  </button>
                  {isExpanded && hasDetails && (
                    <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.border}`, background: theme.bgSecondary }}>
                      {ep.op.description && (
                        <p style={{ fontSize: '12px', color: theme.textSecondary, margin: '0 0 12px 0' }}>{ep.op.description}</p>
                      )}
                      {ep.op.parameters?.length > 0 && (
                        <div style={{ marginBottom: '12px' }}>
                          <p style={{ fontSize: '11px', fontWeight: '500', color: theme.textMuted, marginBottom: '8px' }}>Parameters</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {ep.op.parameters.map((p, j) => (
                              <div key={j} style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                                <span style={{ fontFamily: font.mono, color: theme.textPrimary }}>{p.name}</span>
                                <span style={{ padding: '1px 6px', background: theme.bgTertiary, borderRadius: radius.sm, color: theme.textMuted }}>{p.in}</span>
                                {p.schema?.type && <span style={{ color: '#3b82f6' }}>{p.schema.type}</span>}
                                {p.required && <span style={{ color: '#ef4444' }}>required</span>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {ep.op.responses && (
                        <div>
                          <p style={{ fontSize: '11px', fontWeight: '500', color: theme.textMuted, marginBottom: '8px' }}>Responses</p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {Object.entries(ep.op.responses).map(([code, res]) => (
                              <div key={code} style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                                <span style={{
                                  fontFamily: font.mono,
                                  fontWeight: 'bold',
                                  color: code.startsWith('2') ? '#10b981' : code.startsWith('4') ? '#f59e0b' : code.startsWith('5') ? '#ef4444' : theme.textPrimary
                                }}>
                                  {code}
                                </span>
                                <span style={{ color: theme.textSecondary }}>{res?.description || ''}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
            {endpoints.length === 0 && (
              <div style={{ textAlign: 'center', color: theme.textMuted, padding: '32px' }}>
                没有找到接口
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default OpenapiViewer