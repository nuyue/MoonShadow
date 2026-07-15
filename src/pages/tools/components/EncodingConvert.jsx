import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'

export default function EncodingConvert() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [error, setError] = React.useState('')
  const [activeTool, setActiveTool] = React.useState('base64')
  const [mode, setMode] = React.useState('encode') // encode/decode

  // 工具列表
  const tools = [
    { id: 'base64', name: 'Base64' },
    { id: 'url', name: 'URL' },
    { id: 'html', name: 'HTML' },
    { id: 'hex', name: 'Hex' },
    { id: 'binary', name: 'Binary' },
    { id: 'rot13', name: 'ROT13' },
    { id: 'morse', name: 'Morse' },
    { id: 'unicode', name: 'Unicode' },
  ]

  // 编码转换函数
  const convert = () => {
    if (!input) {
      setOutput('')
      setError('')
      return
    }

    try {
      let result = ''
      switch (activeTool) {
        case 'base64':
          if (mode === 'encode') {
            result = btoa(unescape(encodeURIComponent(input)))
          } else {
            result = decodeURIComponent(escape(atob(input)))
          }
          break

        case 'url':
          if (mode === 'encode') {
            result = encodeURIComponent(input)
          } else {
            result = decodeURIComponent(input)
          }
          break

        case 'html':
          if (mode === 'encode') {
            const htmlEntities = {
              '&': '&amp;',
              '<': '&lt;',
              '>': '&gt;',
              '"': '&quot;',
              "'": '&#39;',
              '/': '&#x2F;',
              '`': '&#x60;',
              '=': '&#x3D;',
            }
            result = input.replace(/[&<>"'`=/]/g, char => htmlEntities[char])
          } else {
            const htmlDecode = {
              '&amp;': '&',
              '&lt;': '<',
              '&gt;': '>',
              '&quot;': '"',
              '&#39;': "'",
              '&#x27;': "'",
              '&#x2F;': '/',
              '&#x60;': '`',
              '&#x3D;': '=',
              '&nbsp;': ' ',
            }
            result = input.replace(/&(?:amp|lt|gt|quot|#39|#x27|#x2F|#x60|#x3D|nbsp);/g, entity => htmlDecode[entity] || entity)
            // 处理数字实体
            result = result.replace(/&#(\d+);/g, (match, num) => String.fromCharCode(parseInt(num, 10)))
            result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)))
          }
          break

        case 'hex':
          if (mode === 'encode') {
            result = Array.from(input).map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ')
          } else {
            const hexStr = input.replace(/\s+/g, '')
            if (!/^[0-9a-fA-F]*$/.test(hexStr)) {
              throw new Error(lang === 'zh' ? '无效的十六进制字符串' : 'Invalid hex string')
            }
            if (hexStr.length % 2 !== 0) {
              throw new Error(lang === 'zh' ? '十六进制字符串长度必须为偶数' : 'Hex string length must be even')
            }
            result = ''
            for (let i = 0; i < hexStr.length; i += 2) {
              result += String.fromCharCode(parseInt(hexStr.substr(i, 2), 16))
            }
          }
          break

        case 'binary':
          if (mode === 'encode') {
            result = Array.from(input).map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ')
          } else {
            const binaryParts = input.trim().split(/\s+/)
            result = binaryParts.map(part => {
              if (!/^[01]+$/.test(part)) {
                throw new Error(lang === 'zh' ? '无效的二进制字符串' : 'Invalid binary string')
              }
              return String.fromCharCode(parseInt(part, 2))
            }).join('')
          }
          break

        case 'rot13':
          result = input.replace(/[a-zA-Z]/g, char => {
            const code = char.charCodeAt(0)
            const base = code >= 97 ? 97 : 65
            return String.fromCharCode(((code - base + 13) % 26) + base)
          })
          break

        case 'morse':
          const morseCode = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
            'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
            'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..',
            '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
            '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
            '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
            '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
            ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
            '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
          }
          const morseDecode = Object.fromEntries(Object.entries(morseCode).map(([k, v]) => [v, k]))

          if (mode === 'encode') {
            result = input.toUpperCase().split('').map(char => morseCode[char] || '').filter(Boolean).join(' ')
          } else {
            const parts = input.trim().split(/\s+/)
            result = parts.map(part => morseDecode[part] || '').join('')
          }
          break

        case 'unicode':
          if (mode === 'encode') {
            result = Array.from(input).map(char => {
              const code = char.codePointAt(0)
              return code > 0xFFFF ? `\\u{${code.toString(16)}}` : `\\u${code.toString(16).padStart(4, '0')}`
            }).join('')
          } else {
            result = input.replace(/\\u\{([0-9a-fA-F]+)\}|\\u([0-9a-fA-F]{4})/g, (match, p1, p2) => {
              const code = parseInt(p1 || p2, 16)
              return String.fromCodePoint(code)
            })
          }
          break

        default:
          result = input
      }
      setOutput(result)
      setError('')
    } catch (e) {
      setError(e.message)
      setOutput('')
    }
  }

  React.useEffect(() => {
    convert()
  }, [input, activeTool, mode])

  // ROT13 和莫斯密码不需要模式切换
  const showModeToggle = !['rot13', 'morse'].includes(activeTool)

  const styles = {
    container: {
      padding: '20px',
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    },
    toolTabs: {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      background: theme.bgTertiary,
      borderRadius: radius.sm,
      padding: '2px',
      flexWrap: 'wrap',
    },
    toolTab: (active) => ({
      padding: '6px 10px',
      background: active ? theme.bgSecondary : 'transparent',
      color: active ? theme.textPrimary : theme.textSecondary,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: font.ui,
      fontWeight: 500,
      transition: 'background 0.15s',
    }),
    modeToggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '2px',
      background: theme.bgTertiary,
      borderRadius: radius.sm,
      padding: '2px',
    },
    modeBtn: (active) => ({
      padding: '6px 12px',
      background: active ? theme.bgAccent : 'transparent',
      color: active ? theme.bgPrimary : theme.textSecondary,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: font.ui,
      fontWeight: 500,
    }),
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
      resize: 'vertical',
      outline: 'none',
      boxSizing: 'border-box',
    },
    errorBox: {
      padding: '12px',
      background: 'rgba(239, 68, 68, 0.1)',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      borderRadius: radius.md,
      color: '#ef4444',
      fontSize: '13px',
      fontFamily: font.mono,
    },
    hint: {
      fontSize: '11px',
      fontFamily: font.mono,
      color: theme.textMuted,
      marginTop: '4px',
    },
  }

  const getPlaceholder = () => {
    if (activeTool === 'base64') {
      return mode === 'encode'
        ? (lang === 'zh' ? '输入要编码的文本' : 'Enter text to encode')
        : (lang === 'zh' ? '输入要解码的 Base64' : 'Enter Base64 to decode')
    }
    if (activeTool === 'url') {
      return mode === 'encode'
        ? (lang === 'zh' ? '输入要编码的 URL' : 'Enter URL to encode')
        : (lang === 'zh' ? '输入要解码的 URL' : 'Enter URL to decode')
    }
    if (activeTool === 'hex') {
      return mode === 'encode'
        ? (lang === 'zh' ? '输入要转换的文本' : 'Enter text to convert')
        : (lang === 'zh' ? '输入十六进制（空格分隔）' : 'Enter hex (space separated)')
    }
    if (activeTool === 'binary') {
      return mode === 'encode'
        ? (lang === 'zh' ? '输入要转换的文本' : 'Enter text to convert')
        : (lang === 'zh' ? '输入二进制（空格分隔）' : 'Enter binary (space separated)')
    }
    if (activeTool === 'morse') {
      return mode === 'encode'
        ? (lang === 'zh' ? '输入要转换的文本（字母数字）' : 'Enter text (alphanumeric)')
        : (lang === 'zh' ? '输入摩斯密码（空格分隔）' : 'Enter morse code (space separated)')
    }
    return lang === 'zh' ? '输入文本' : 'Enter text'
  }

  return (
    <div style={styles.container}>
      <div style={styles.toolbar}>
        {/* 工具选择 */}
        <div style={styles.toolTabs}>
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id)}
              style={styles.toolTab(activeTool === tool.id)}
            >
              {tool.name}
            </button>
          ))}
        </div>

        {/* 编码/解码切换 */}
        {showModeToggle && (
          <div style={styles.modeToggle}>
            <button
              onClick={() => setMode('encode')}
              style={styles.modeBtn(mode === 'encode')}
            >
              {lang === 'zh' ? '编码' : 'Encode'}
            </button>
            <button
              onClick={() => setMode('decode')}
              style={styles.modeBtn(mode === 'decode')}
            >
              {lang === 'zh' ? '解码' : 'Decode'}
            </button>
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={styles.inputLabel}>
          {lang === 'zh' ? '输入' : 'Input'}
        </span>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={getPlaceholder()}
          style={{ ...styles.textarea, minHeight: '120px' }}
        />
      </div>

      {/* 错误提示 */}
      {error && <div style={styles.errorBox}>{error}</div>}

      {/* 输出区 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <span style={styles.inputLabel}>
          {lang === 'zh' ? '输出' : 'Output'}
        </span>
        <textarea
          value={output}
          readOnly
          placeholder={lang === 'zh' ? '输出结果' : 'Output result'}
          style={{ ...styles.textareaReadonly, minHeight: '120px' }}
        />
      </div>

      {/* 提示信息 */}
      <div style={styles.hint}>
        {activeTool === 'rot13' && (lang === 'zh' ? 'ROT13 是一种简单的字母替换加密，编码和解码是相同的操作' : 'ROT13 is a simple letter substitution cipher, encoding and decoding are the same operation')}
        {activeTool === 'morse' && (lang === 'zh' ? '支持字母、数字和常用标点符号' : 'Supports letters, numbers and common punctuation')}
        {activeTool === 'hex' && (lang === 'zh' ? '十六进制编码将每个字符转换为两个十六进制数字' : 'Hex encoding converts each character to two hexadecimal digits')}
        {activeTool === 'binary' && (lang === 'zh' ? '二进制编码将每个字符转换为 8 位二进制' : 'Binary encoding converts each character to 8-bit binary')}
      </div>
    </div>
  )
}
