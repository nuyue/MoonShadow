import React from 'react'
import { marked } from 'marked'
import { sanitizeMarkdownHtml } from '../../../utils/core'
import { useTheme } from '../../../context/ThemeContext'
import hljs from 'highlight.js'

const MarkdownPreview = () => {
  const { theme, radius, font } = useTheme()
  const [input, setInput] = React.useState(`# Markdown 预览

这是一个 **Markdown** 预览工具。

## 功能特性

- 支持 GFM 语法
- 代码高亮
- 表格支持

### 代码示例

\`\`\`javascript
function hello() {
  console.log('Hello, World!')
}
\`\`\`

### 表格示例

| 功能 | 状态 |
|------|------|
| 基础语法 | ✅ |
| GFM | ✅ |
| 代码高亮 | ✅ |

> 这是一段引用文本

[访问 GitHub](https://github.com)
`)
  const [html, setHtml] = React.useState('')

  // 配置 marked
  React.useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
      highlight: function(code, lang) {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value
          } catch (e) {
            console.error(e)
          }
        }
        return hljs.highlightAuto(code).value
      }
    })
  }, [])

  // 渲染 Markdown
  React.useEffect(() => {
    if (input.trim()) {
      try {
        const rendered = marked.parse(input)
        const sanitized = sanitizeMarkdownHtml(rendered)
        setHtml(sanitized)
      } catch (e) {
        setHtml('<p>渲染失败</p>')
      }
    } else {
      setHtml('')
    }
  }, [input])

  const copyHtml = () => {
    if (html) navigator.clipboard.writeText(html)
  }

  const downloadHtml = () => {
    const fullHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/github.min.css">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; line-height: 1.6; }
    pre { background: #f5f5f5; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 4px; }
    blockquote { border-left: 4px solid #ddd; margin: 0; padding-left: 1rem; color: #666; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; }
  </style>
</head>
<body>
${html}
</body>
</html>`
    const blob = new Blob([fullHtml], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'markdown-export.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const buttonStyle = (hasContent) => ({
    padding: '6px 16px',
    background: hasContent ? theme.bgAccent : theme.bgTertiary,
    color: hasContent ? theme.bgPrimary : theme.textMuted,
    border: 'none',
    borderRadius: radius.sm,
    cursor: hasContent ? 'pointer' : 'not-allowed',
    fontSize: '12px',
    fontFamily: font.ui,
  })

  const textareaStyle = {
    width: '100%',
    height: '500px',
    padding: '12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    fontFamily: font.mono,
    fontSize: '13px',
    resize: 'none',
    boxSizing: 'border-box',
    color: theme.textPrimary,
    outline: 'none',
  }

  const previewStyle = {
    width: '100%',
    height: '500px',
    padding: '16px',
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    background: theme.bgPrimary,
    overflow: 'auto',
    boxSizing: 'border-box',
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center' }}>
        <button 
          onClick={copyHtml}
          disabled={!html}
          style={buttonStyle(html)}
        >
          复制 HTML
        </button>
        <button 
          onClick={downloadHtml}
          disabled={!html}
          style={buttonStyle(html)}
        >
          导出 HTML
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Markdown 输入</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入 Markdown 文本..."
            style={textareaStyle}
          />
          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '4px' }}>
            {input.length} 字符 | {input.split('\n').length} 行
          </div>
        </div>
        <div>
          <label style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', display: 'block', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.5px' }}>预览</label>
          <div style={previewStyle}>
            <style>{`
              .md-preview h1 { font-size: 2em; font-weight: bold; margin-bottom: 0.5em; border-bottom: 1px solid ${theme.border}; padding-bottom: 0.3em; color: ${theme.textPrimary}; }
              .md-preview h2 { font-size: 1.5em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; border-bottom: 1px solid ${theme.border}; padding-bottom: 0.3em; color: ${theme.textPrimary}; }
              .md-preview h3 { font-size: 1.25em; font-weight: bold; margin-top: 1em; margin-bottom: 0.5em; color: ${theme.textPrimary}; }
              .md-preview p { margin-bottom: 1em; line-height: 1.6; color: ${theme.textPrimary}; }
              .md-preview ul, .md-preview ol { margin-bottom: 1em; padding-left: 2em; color: ${theme.textPrimary}; }
              .md-preview li { margin-bottom: 0.25em; color: ${theme.textPrimary}; }
              .md-preview code { background: ${theme.bgTertiary}; padding: 0.2em 0.4em; border-radius: ${radius.xs}; font-family: ${font.mono}; font-size: 0.9em; color: ${theme.textPrimary}; }
              .md-preview pre { background: ${theme.bgSecondary}; padding: 1em; border-radius: ${radius.md}; overflow-x: auto; margin-bottom: 1em; }
              .md-preview pre code { background: transparent; padding: 0; }
              .md-preview blockquote { border-left: 4px solid ${theme.border}; margin: 0 0 1em 0; padding-left: 1em; color: ${theme.textSecondary}; font-style: italic; }
              .md-preview table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
              .md-preview th, .md-preview td { border: 1px solid ${theme.border}; padding: 0.5em; text-align: left; color: ${theme.textPrimary}; }
              .md-preview th { background: ${theme.bgSecondary}; font-weight: bold; }
              .md-preview a { color: ${theme.textAccent}; text-decoration: none; }
              .md-preview a:hover { text-decoration: underline; }
              .md-preview hr { border: none; border-top: 1px solid ${theme.border}; margin: 1em 0; }
              .md-preview img { max-width: 100%; height: auto; }
            `}</style>
            <div 
              className="md-preview"
              dangerouslySetInnerHTML={{ __html: html }} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default MarkdownPreview
