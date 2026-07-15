import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

// cURL 解析和转换
function parseCurl(curlCommand) {
  const result = {
    url: '',
    method: 'GET',
    headers: {},
    body: '',
  }

  // 清理命令
  let cmd = curlCommand.trim().replace(/\\\s*\n/g, ' ')

  // 提取 URL
  const urlMatch = cmd.match(/(?:curl\s+['"]?|'[^']*'|"[^"]*")\s*(https?:\/\/[^\s'"]+)/i)
  if (urlMatch) result.url = urlMatch[1]

  // 提取方法
  const methodMatch = cmd.match(/-X\s+['"]?(\w+)['"]?/i)
  if (methodMatch) result.method = methodMatch[1].toUpperCase()

  // 提取 headers
  const headerMatches = cmd.matchAll(/-H\s+['"]([^'"]+)['"]/g)
  for (const match of headerMatches) {
    const header = match[1]
    const [key, value] = header.split(':').map(s => s.trim())
    if (key && value) result.headers[key] = value
  }

  // 提取 body
  const dataMatch = cmd.match(/(?:--data-raw|--data|-d)\s+['"]([^'"]+)['"]/i)
  if (dataMatch) result.body = dataMatch[1]

  return result
}

// 生成 Fetch
function generateFetch(parsed) {
  const lines = []
  lines.push(`fetch('${parsed.url}', {`)
  lines.push(`  method: '${parsed.method}',`)
  if (Object.keys(parsed.headers).length > 0) {
    lines.push('  headers: {')
    for (const [key, value] of Object.entries(parsed.headers)) {
      lines.push(`    '${key}': '${value}',`)
    }
    lines.push('  },')
  }
  if (parsed.body) {
    lines.push(`  body: '${parsed.body}',`)
  }
  lines.push('})')
  lines.push('.then(response => response.json())')
  lines.push('.then(data => console.log(data))')
  lines.push('.catch(error => console.error(error))')
  return lines.join('\n')
}

// 生成 Axios
function generateAxios(parsed) {
  const lines = []
  lines.push(`axios({`)
  lines.push(`  url: '${parsed.url}',`)
  lines.push(`  method: '${parsed.method}',`)
  if (Object.keys(parsed.headers).length > 0) {
    lines.push('  headers: {')
    for (const [key, value] of Object.entries(parsed.headers)) {
      lines.push(`    '${key}': '${value}',`)
    }
    lines.push('  },')
  }
  if (parsed.body) {
    lines.push(`  data: ${parsed.body.startsWith('{') ? parsed.body : `'${parsed.body}'`},`)
  }
  lines.push('})')
  lines.push('.then(response => console.log(response.data))')
  lines.push('.catch(error => console.error(error))')
  return lines.join('\n')
}

// 生成 Python
function generatePython(parsed) {
  const lines = []
  lines.push('import requests')
  lines.push('')
  lines.push(`response = requests.request(`)
  lines.push(`  '${parsed.method}',`)
  lines.push(`  '${parsed.url}',`)
  if (Object.keys(parsed.headers).length > 0) {
    lines.push('  headers={')
    for (const [key, value] of Object.entries(parsed.headers)) {
      lines.push(`    '${key}': '${value}',`)
    }
    lines.push('  },')
  }
  if (parsed.body) {
    lines.push(`  data='${parsed.body}',`)
  }
  lines.push(')')
  lines.push('')
  lines.push('print(response.json())')
  return lines.join('\n')
}

// 生成 Go
function generateGo(parsed) {
  const lines = []
  lines.push('package main')
  lines.push('')
  lines.push('import "net/http"')
  lines.push('import "io"')
  lines.push('')
  lines.push('func main() {')
  lines.push(`  client := &http.Client{}`)
  lines.push(`  req, err := http.NewRequest("${parsed.method}", "${parsed.url}", nil)`)
  lines.push('  if err != nil {')
  lines.push('    panic(err)')
  lines.push('  }')
  if (Object.keys(parsed.headers).length > 0) {
    for (const [key, value] of Object.entries(parsed.headers)) {
      lines.push(`  req.Header.Add("${key}", "${value}")`)
    }
  }
  lines.push('  resp, err := client.Do(req)')
  lines.push('  if err != nil {')
  lines.push('    panic(err)')
  lines.push('  }')
  lines.push('  defer resp.Body.Close()')
  lines.push('  body, err := io.ReadAll(resp.Body)')
  lines.push('  if err != nil {')
  lines.push('    panic(err)')
  lines.push('  }')
  lines.push('  println(string(body))')
  lines.push('}')
  return lines.join('\n')
}

const TABS = [
  { key: 'fetch', label: 'Fetch' },
  { key: 'axios', label: 'Axios' },
  { key: 'python', label: 'Python' },
  { key: 'go', label: 'Go' },
]

const EXAMPLE_CURL = `curl 'https://api.example.com/users' \\
  -H 'Content-Type: application/json' \\
  -H 'Authorization: Bearer token123' \\
  --data-raw '{"name":"test"}'`

const CurlConverter = () => {
  const { theme, radius, font } = useTheme()
  const [input, setInput] = React.useState('')
  const [activeTab, setActiveTab] = React.useState('fetch')
  const [error, setError] = React.useState('')
  const [copied, setCopied] = React.useState(false)

  const outputs = React.useMemo(() => {
    setError('')
    if (!input.trim()) return null
    try {
      const parsed = parseCurl(input)
      if (!parsed.url) {
        setError('未能解析出 URL')
        return null
      }
      return {
        fetch: generateFetch(parsed),
        axios: generateAxios(parsed),
        python: generatePython(parsed),
        go: generateGo(parsed),
      }
    } catch (e) {
      setError(e.message)
      return null
    }
  }, [input])

  const copyOutput = () => {
    if (!outputs || !outputs[activeTab]) return
    navigator.clipboard.writeText(outputs[activeTab])
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const textareaStyle = {
    width: '100%',
    minHeight: '100px',
    padding: '12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    color: theme.textPrimary,
    fontFamily: font.mono,
    fontSize: '13px',
    resize: 'vertical',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  }

  const outputTextareaStyle = {
    ...textareaStyle,
    minHeight: '250px',
  }

  const buttonStyle = {
    padding: '8px 16px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.sm,
    color: theme.textSecondary,
    fontFamily: font.ui,
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s, color 0.2s',
  }

  const activeTabStyle = {
    padding: '8px 16px',
    background: theme.bgAccent,
    border: 'none',
    borderRadius: radius.sm,
    color: theme.bgPrimary,
    fontFamily: font.ui,
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          style={buttonStyle}
          onClick={() => setInput(EXAMPLE_CURL)}
          onMouseEnter={e => {
            e.currentTarget.style.background = theme.bgTertiary
            e.currentTarget.style.borderColor = theme.borderHover
            e.currentTarget.style.color = theme.textPrimary
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = theme.bgSecondary
            e.currentTarget.style.borderColor = theme.border
            e.currentTarget.style.color = theme.textSecondary
          }}
        >
          示例
        </button>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <label style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px', display: 'block', fontFamily: font.ui }}>
          cURL 命令
        </label>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="粘贴 cURL 命令..."
          style={textareaStyle}
          spellCheck={false}
          onFocus={e => {
            e.target.style.borderColor = theme.borderHover
            e.target.style.boxShadow = `0 0 0 2px ${theme.borderHover}`
          }}
          onBlur={e => {
            e.target.style.borderColor = theme.border
            e.target.style.boxShadow = 'none'
          }}
        />
      </div>

      {error && (
        <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.15)', border: `1px solid rgba(239, 68, 68, 0.3)`, borderRadius: radius.md, color: '#ef4444', marginBottom: '12px', fontFamily: font.ui }}>
          {error}
        </div>
      )}

      {outputs && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={activeTab === tab.key ? activeTabStyle : buttonStyle}
                onMouseEnter={e => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = theme.bgTertiary
                    e.currentTarget.style.borderColor = theme.borderHover
                    e.currentTarget.style.color = theme.textPrimary
                  } else {
                    e.currentTarget.style.background = theme.bgAccentHover
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== tab.key) {
                    e.currentTarget.style.background = theme.bgSecondary
                    e.currentTarget.style.borderColor = theme.border
                    e.currentTarget.style.color = theme.textSecondary
                  } else {
                    e.currentTarget.style.background = theme.bgAccent
                  }
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <textarea
              value={outputs[activeTab]}
              readOnly
              style={outputTextareaStyle}
            />
            <button
              onClick={copyOutput}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '6px 12px',
                background: theme.bgTertiary,
                border: `1px solid ${theme.border}`,
                borderRadius: radius.sm,
                color: theme.textSecondary,
                fontFamily: font.ui,
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'background 0.2s, border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = theme.bgHover
                e.currentTarget.style.borderColor = theme.borderHover
                e.currentTarget.style.color = theme.textPrimary
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = theme.bgTertiary
                e.currentTarget.style.borderColor = theme.border
                e.currentTarget.style.color = theme.textSecondary
              }}
            >
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CurlConverter
