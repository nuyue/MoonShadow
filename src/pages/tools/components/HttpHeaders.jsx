import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

const HTTP_HEADERS = [
  // 请求头
  { name: 'Accept', category: 'request', description: '指定客户端能够接收的内容类型', example: 'Accept: text/html, application/json' },
  { name: 'Accept-Encoding', category: 'request', description: '指定客户端支持的编码方式', example: 'Accept-Encoding: gzip, deflate, br' },
  { name: 'Accept-Language', category: 'request', description: '指定客户端首选的语言', example: 'Accept-Language: zh-CN,zh;q=0.9,en;q=0.8' },
  { name: 'Authorization', category: 'request', description: '包含用于验证用户代理身份的凭证', example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
  { name: 'Cache-Control', category: 'request', description: '指定请求和响应的缓存机制', example: 'Cache-Control: no-cache' },
  { name: 'Content-Type', category: 'request', description: '指定请求体的媒体类型', example: 'Content-Type: application/json' },
  { name: 'Cookie', category: 'request', description: '发送存储在客户端的 Cookie', example: 'Cookie: session=abc123' },
  { name: 'Host', category: 'request', description: '指定请求的目标主机和端口', example: 'Host: www.example.com' },
  { name: 'Origin', category: 'request', description: '指示请求来自哪个站点', example: 'Origin: https://example.com' },
  { name: 'Referer', category: 'request', description: '指示请求来源页面', example: 'Referer: https://example.com/page' },
  { name: 'User-Agent', category: 'request', description: '包含发起请求的用户代理信息', example: 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0' },
  
  // 响应头
  { name: 'Access-Control-Allow-Origin', category: 'response', description: '指定允许访问资源的外域', example: 'Access-Control-Allow-Origin: *' },
  { name: 'Age', category: 'response', description: '资源在缓存中的年龄（秒）', example: 'Age: 3600' },
  { name: 'Content-Disposition', category: 'response', description: '指示如何处理响应内容', example: 'Content-Disposition: attachment; filename="file.pdf"' },
  { name: 'Content-Length', category: 'response', description: '响应体的字节大小', example: 'Content-Length: 1234' },
  { name: 'Content-Security-Policy', category: 'response', description: '内容安全策略，防止 XSS 攻击', example: 'Content-Security-Policy: default-src \'self\'' },
  { name: 'ETag', category: 'response', description: '资源的特定版本标识符', example: 'ETag: "abc123"' },
  { name: 'Location', category: 'response', description: '重定向的目标 URL', example: 'Location: https://example.com/new' },
  { name: 'Server', category: 'response', description: '服务器软件信息', example: 'Server: nginx/1.18.0' },
  { name: 'Set-Cookie', category: 'response', description: '设置客户端 Cookie', example: 'Set-Cookie: session=xyz; Path=/; HttpOnly' },
  { name: 'Strict-Transport-Security', category: 'response', description: '强制使用 HTTPS', example: 'Strict-Transport-Security: max-age=31536000' },
  { name: 'X-Content-Type-Options', category: 'response', description: '防止 MIME 类型嗅探', example: 'X-Content-Type-Options: nosniff' },
  { name: 'X-Frame-Options', category: 'response', description: '防止点击劫持', example: 'X-Frame-Options: DENY' },
  { name: 'X-XSS-Protection', category: 'response', description: '启用浏览器 XSS 过滤', example: 'X-XSS-Protection: 1; mode=block' },
  
  // 实体头
  { name: 'Content-Encoding', category: 'entity', description: '资源的压缩方式', example: 'Content-Encoding: gzip' },
  { name: 'Content-Language', category: 'entity', description: '资源的目标语言', example: 'Content-Language: zh-CN' },
  { name: 'Last-Modified', category: 'entity', description: '资源最后修改时间', example: 'Last-Modified: Wed, 21 Oct 2024 07:28:00 GMT' },
  
  // 通用头
  { name: 'Connection', category: 'general', description: '控制网络连接的行为', example: 'Connection: keep-alive' },
  { name: 'Date', category: 'general', description: '消息生成的日期时间', example: 'Date: Wed, 21 Oct 2024 07:28:00 GMT' },
  { name: 'Transfer-Encoding', category: 'general', description: '指定消息体的编码方式', example: 'Transfer-Encoding: chunked' },
  { name: 'Vary', category: 'general', description: '指定影响响应的请求头', example: 'Vary: Accept-Encoding' },
]

const CATEGORY_COLORS = {
  request: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' },
  response: { bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
  entity: { bg: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' },
  general: { bg: 'rgba(156, 163, 175, 0.15)', color: '#9ca3af' },
}

const CATEGORY_LABELS = {
  request: '请求头',
  response: '响应头',
  entity: '实体头',
  general: '通用头',
}

const HttpHeaders = () => {
  const { theme, radius, font } = useTheme()
  const [search, setSearch] = React.useState('')
  const [selectedCategory, setSelectedCategory] = React.useState('')

  const filteredHeaders = React.useMemo(() => {
    return HTTP_HEADERS.filter(h => {
      const matchesSearch = !search || 
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.description.includes(search)
      const matchesCategory = !selectedCategory || h.category === selectedCategory
      return matchesSearch && matchesCategory
    })
  }, [search, selectedCategory])

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="搜索请求头名称或描述..."
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 14px',
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.md,
            color: theme.textPrimary,
            fontFamily: font.ui,
            fontSize: '13px',
            outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = theme.borderHover
            e.target.style.boxShadow = `0 0 0 2px ${theme.borderHover}`
          }}
          onBlur={e => {
            e.target.style.borderColor = theme.border
            e.target.style.boxShadow = 'none'
          }}
        />
        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          style={{
            padding: '10px 14px',
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.md,
            color: theme.textPrimary,
            fontFamily: font.ui,
            fontSize: '13px',
            outline: 'none',
            cursor: 'pointer',
            transition: 'border-color 0.2s, box-shadow 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = theme.borderHover
            e.target.style.boxShadow = `0 0 0 2px ${theme.borderHover}`
          }}
          onBlur={e => {
            e.target.style.borderColor = theme.border
            e.target.style.boxShadow = 'none'
          }}
        >
          <option value="">所有类别</option>
          <option value="request">请求头</option>
          <option value="response">响应头</option>
          <option value="entity">实体头</option>
          <option value="general">通用头</option>
        </select>
      </div>

      <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '12px', fontFamily: font.ui }}>
        共 {filteredHeaders.length} 个请求头
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflow: 'auto' }}>
        {filteredHeaders.map(header => (
          <div
            key={header.name}
            style={{
              background: theme.bgSecondary,
              border: `1px solid ${theme.border}`,
              borderRadius: radius.md,
              padding: '12px 16px',
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = theme.bgTertiary
              e.currentTarget.style.borderColor = theme.borderHover
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = theme.bgSecondary
              e.currentTarget.style.borderColor = theme.border
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontFamily: font.mono, fontWeight: 600, fontSize: '13px', color: theme.textPrimary }}>
                {header.name}
              </span>
              <span style={{
                padding: '2px 8px',
                background: CATEGORY_COLORS[header.category].bg,
                color: CATEGORY_COLORS[header.category].color,
                borderRadius: radius.sm,
                fontSize: '10px',
                fontFamily: font.ui,
              }}>
                {CATEGORY_LABELS[header.category]}
              </span>
            </div>
            <div style={{ fontSize: '12px', color: theme.textSecondary, marginBottom: '8px', fontFamily: font.ui }}>
              {header.description}
            </div>
            {header.example && (
              <div style={{
                padding: '8px 12px',
                background: theme.bgTertiary,
                borderRadius: radius.sm,
                fontFamily: font.mono,
                fontSize: '11px',
                color: theme.textMuted,
                overflow: 'auto',
              }}>
                {header.example}
              </div>
            )}
          </div>
        ))}
        {filteredHeaders.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: theme.textMuted, fontFamily: font.ui }}>
            未找到匹配的请求头
          </div>
        )}
      </div>
    </div>
  )
}

export default HttpHeaders
