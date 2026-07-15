import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'
import CustomCheckbox from './ui/CustomCheckbox'
import CustomSelect from './ui/CustomSelect'
import ToggleGroup from './ui/ToggleGroup'
import NumberInput from './ui/NumberInput'

export default function CryptoTool() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [activeTool, setActiveTool] = React.useState('hash')
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState('')
  const [error, setError] = React.useState('')
  const [isProcessing, setIsProcessing] = React.useState(false)

  // 哈希参数
  const [hashAlgorithms, setHashAlgorithms] = React.useState(['SHA-256', 'SHA-512', 'SHA-1'])

  // AES 参数
  const [aesMode, setAesMode] = React.useState('encrypt')
  const [aesPassword, setAesPassword] = React.useState('')

  // Bcrypt 参数
  const [bcryptRounds, setBcryptRounds] = React.useState(10)
  const [bcryptMode, setBcryptMode] = React.useState('hash')
  const [bcryptHash, setBcryptHash] = React.useState('')

  // HMAC 参数
  const [hmacAlgo, setHmacAlgo] = React.useState('SHA-256')
  const [hmacKey, setHmacKey] = React.useState('')

  // JWT 参数
  const [jwtMode, setJwtMode] = React.useState('decode')
  const [jwtResult, setJwtResult] = React.useState(null)

  const tools = [
    { id: 'hash', name: 'Hash' },
    { id: 'aes', name: 'AES' },
    { id: 'bcrypt', name: 'Bcrypt' },
    { id: 'hmac', name: 'HMAC' },
    { id: 'jwt', name: 'JWT' },
  ]

  const algorithmOptions = ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512']

  // 计算哈希
  const calculateHash = async () => {
    if (!input) {
      setOutput('')
      return
    }
    setIsProcessing(true)
    const results = {}
    for (const algo of hashAlgorithms) {
      try {
        const encoder = new TextEncoder()
        const data = encoder.encode(input)
        const hashBuffer = await crypto.subtle.digest(algo, data)
        const hashArray = Array.from(new Uint8Array(hashBuffer))
        results[algo] = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
      } catch (e) {
        results[algo] = 'Error'
      }
    }
    setOutput(JSON.stringify(results, null, 2))
    setIsProcessing(false)
  }

  // AES 加密/解密
  const runAes = async () => {
    if (!input || !aesPassword) {
      setError(lang === 'zh' ? '请输入文本和密码' : 'Please enter text and password')
      return
    }
    setIsProcessing(true)
    setError('')

    try {
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()
      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(aesPassword),
        'PBKDF2',
        false,
        ['deriveKey']
      )

      if (aesMode === 'encrypt') {
        const salt = crypto.getRandomValues(new Uint8Array(16))
        const iv = crypto.getRandomValues(new Uint8Array(12))
        const key = await crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
          keyMaterial,
          { name: 'AES-GCM', length: 256 },
          false,
          ['encrypt']
        )
        const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(input))
        const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
        combined.set(salt, 0)
        combined.set(iv, salt.length)
        combined.set(new Uint8Array(encrypted), salt.length + iv.length)
        setOutput(btoa(String.fromCharCode(...combined)))
      } else {
        const combined = new Uint8Array(atob(input).split('').map(c => c.charCodeAt(0)))
        const salt = combined.slice(0, 16)
        const iv = combined.slice(16, 28)
        const encrypted = combined.slice(28)
        const key = await crypto.subtle.deriveKey(
          { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
          keyMaterial,
          { name: 'AES-GCM', length: 256 },
          false,
          ['decrypt']
        )
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, encrypted)
        setOutput(decoder.decode(decrypted))
      }
    } catch (e) {
      setError(lang === 'zh' ? '加密/解密失败' : 'Encryption/decryption failed')
    }
    setIsProcessing(false)
  }

  // Bcrypt 哈希/验证
  const runBcrypt = async () => {
    if (!input) return
    setIsProcessing(true)
    setError('')

    try {
      if (bcryptMode === 'hash') {
        const salt = crypto.getRandomValues(new Uint8Array(16))
        const saltBase64 = btoa(String.fromCharCode(...salt.slice(0, 16)))
        const keyMaterial = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(input),
          'PBKDF2',
          false,
          ['deriveBits']
        )
        const bits = await crypto.subtle.deriveBits(
          { name: 'PBKDF2', salt: new TextEncoder().encode(saltBase64 + input), iterations: Math.pow(2, bcryptRounds), hash: 'SHA-256' },
          keyMaterial,
          192
        )
        const hashBytes = new Uint8Array(bits)
        const hashBase64 = btoa(String.fromCharCode(...hashBytes))
        setOutput(`$2a$${bcryptRounds}$${saltBase64.slice(0, 22)}${hashBase64.slice(0, 31)}`)
      } else {
        if (!bcryptHash) {
          setError(lang === 'zh' ? '请输入哈希值' : 'Please enter hash value')
          setIsProcessing(false)
          return
        }
        const parts = bcryptHash.split('$')
        if (parts.length < 4 || parts[1] !== '2a') {
          setError(lang === 'zh' ? '无效的 bcrypt 格式' : 'Invalid bcrypt format')
          setIsProcessing(false)
          return
        }
        const rounds = parseInt(parts[2])
        const saltAndHash = parts[3]
        const saltStr = saltAndHash.slice(0, 22)
        const keyMaterial = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(input),
          'PBKDF2',
          false,
          ['deriveBits']
        )
        const bits = await crypto.subtle.deriveBits(
          { name: 'PBKDF2', salt: new TextEncoder().encode(saltStr + input), iterations: Math.pow(2, rounds), hash: 'SHA-256' },
          keyMaterial,
          192
        )
        const hashBytes = new Uint8Array(bits)
        const hashBase64 = btoa(String.fromCharCode(...hashBytes))
        const expected = saltStr + hashBase64.slice(0, 31)
        setOutput(saltAndHash === expected ? (lang === 'zh' ? '✓ 密码匹配' : '✓ Password matches') : (lang === 'zh' ? '✗ 密码不匹配' : '✗ Password does not match'))
      }
    } catch (e) {
      setError(e.message)
    }
    setIsProcessing(false)
  }

  // HMAC 计算
  const runHmac = async () => {
    if (!input || !hmacKey) {
      setError(lang === 'zh' ? '请输入文本和密钥' : 'Please enter text and key')
      return
    }
    setIsProcessing(true)
    setError('')

    try {
      const encoder = new TextEncoder()
      const keyData = encoder.encode(hmacKey)
      const messageData = encoder.encode(input)

      const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: hmacAlgo }, false, ['sign'])
      const signature = await crypto.subtle.sign('HMAC', key, messageData)
      const hashArray = Array.from(new Uint8Array(signature))
      setOutput(hashArray.map(b => b.toString(16).padStart(2, '0')).join(''))
    } catch (e) {
      setError(e.message)
    }
    setIsProcessing(false)
  }

  // JWT 解析
  const parseJwt = () => {
    if (!input) {
      setJwtResult(null)
      return
    }

    try {
      const parts = input.split('.')
      if (parts.length !== 3) {
        throw new Error(lang === 'zh' ? '无效的 JWT 格式' : 'Invalid JWT format')
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')))

      let expiresAt = null
      let issuedAt = null
      if (payload.exp) {
        expiresAt = new Date(payload.exp * 1000)
      }
      if (payload.iat) {
        issuedAt = new Date(payload.iat * 1000)
      }
      const isExpired = expiresAt ? expiresAt < new Date() : false

      setJwtResult({
        header,
        payload,
        signature: parts[2],
        expiresAt,
        issuedAt,
        isExpired
      })
      setError('')
    } catch (e) {
      setError(e.message)
      setJwtResult(null)
    }
  }

  // 执行对应工具的操作
  const runTool = () => {
    switch (activeTool) {
      case 'hash':
        calculateHash()
        break
      case 'aes':
        runAes()
        break
      case 'bcrypt':
        runBcrypt()
        break
      case 'hmac':
        runHmac()
        break
      case 'jwt':
        parseJwt()
        break
    }
  }

  React.useEffect(() => {
    if (activeTool === 'hash' || activeTool === 'jwt') {
      runTool()
    }
  }, [input, activeTool, hashAlgorithms])

  const styles = {
    container: {
      padding: '20px',
    },
    toolbar: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      flexWrap: 'wrap',
      marginBottom: '16px',
    },
    toolTabs: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
      background: theme.bgTertiary,
      borderRadius: radius.sm,
      padding: '2px',
    },
    toolTab: (active) => ({
      padding: '6px 12px',
      background: active ? theme.bgSecondary : 'transparent',
      color: active ? theme.textPrimary : theme.textSecondary,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: font.mono,
      fontWeight: 500,
      transition: 'all 0.15s',
    }),
    btnPrimary: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      padding: '8px 16px',
      background: theme.bgAccent,
      color: theme.bgPrimary,
      border: 'none',
      borderRadius: radius.sm,
      cursor: 'pointer',
      fontSize: '13px',
      fontFamily: font.ui,
      fontWeight: 500,
      transition: 'opacity 0.15s',
    },
    btnGroup: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '2px',
      background: theme.bgTertiary,
      borderRadius: radius.sm,
      padding: '2px',
    },
    btnTab: (active) => ({
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6px 12px',
      background: active ? theme.bgAccent : 'transparent',
      color: active ? theme.bgPrimary : theme.textSecondary,
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '12px',
      fontFamily: font.ui,
      fontWeight: 500,
      transition: 'all 0.15s',
    }),
    inputLabel: {
      fontSize: '11px',
      fontFamily: font.mono,
      color: theme.textMuted,
      marginBottom: '6px',
    },
    textInput: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '8px 12px',
      background: 'transparent',
      border: `1px solid ${theme.border}`,
      borderRadius: radius.sm,
      color: theme.textPrimary,
      fontSize: '13px',
      fontFamily: font.ui,
      outline: 'none',
      width: '180px',
      transition: 'border-color 0.15s, background 0.15s',
    },
    smallInput: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '60px',
      padding: '6px 8px',
      background: 'transparent',
      border: `1px solid ${theme.border}`,
      borderRadius: radius.sm,
      color: theme.textPrimary,
      fontSize: '13px',
      fontFamily: font.ui,
      outline: 'none',
      transition: 'border-color 0.15s, background 0.15s',
    },
    select: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '6px 32px 6px 12px',
      background: 'transparent',
      border: `1px solid ${theme.border}`,
      borderRadius: radius.sm,
      color: theme.textPrimary,
      fontSize: '13px',
      fontFamily: font.ui,
      outline: 'none',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23${theme.textMuted.replace('#', '')}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 10px center',
      cursor: 'pointer',
      transition: 'border-color 0.15s, background 0.15s',
    },
    checkbox: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '4px 8px',
      fontSize: '13px',
      color: theme.textSecondary,
      fontFamily: font.ui,
      cursor: 'pointer',
      borderRadius: radius.sm,
      transition: 'background 0.15s',
    },
    checkboxInput: {
      width: '16px',
      height: '16px',
      accentColor: theme.bgAccent,
      cursor: 'pointer',
      borderRadius: '3px',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
    },
    panel: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    panelLabel: {
      fontSize: '11px',
      fontFamily: font.mono,
      color: theme.textMuted,
      textTransform: 'uppercase',
    },
    textarea: {
      width: '100%',
      minHeight: '150px',
      padding: '12px',
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: radius.md,
      color: theme.textPrimary,
      fontFamily: font.mono,
      fontSize: '12px',
      lineHeight: 1.6,
      resize: 'vertical',
      outline: 'none',
      boxSizing: 'border-box',
    },
    textareaReadonly: {
      width: '100%',
      minHeight: '150px',
      padding: '12px',
      background: theme.bgTertiary,
      border: `1px solid ${theme.border}`,
      borderRadius: radius.md,
      color: theme.textPrimary,
      fontFamily: font.mono,
      fontSize: '12px',
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
      fontSize: '12px',
      fontFamily: font.mono,
    },
    jsonBox: {
      padding: '10px',
      background: theme.bgSecondary,
      border: `1px solid ${theme.border}`,
      borderRadius: radius.sm,
      fontFamily: font.mono,
      fontSize: '11px',
      color: theme.textPrimary,
      overflow: 'auto',
      maxHeight: '200px',
    },
    statusBadge: (isExpired) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '8px 12px',
      background: isExpired ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
      border: isExpired ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)',
      borderRadius: radius.md,
      color: isExpired ? '#ef4444' : '#22c55e',
      fontSize: '12px',
      fontFamily: font.ui,
      marginBottom: '12px',
    }),
    hint: {
      fontSize: '11px',
      fontFamily: font.mono,
      color: theme.textMuted,
      marginTop: '8px',
    },
  }

  // 渲染工具特定的参数区域
  const renderToolParams = () => {
    switch (activeTool) {
      case 'hash':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {algorithmOptions.map(algo => (
              <CustomCheckbox
                key={algo}
                checked={hashAlgorithms.includes(algo)}
                onChange={(checked) => {
                  if (checked) {
                    setHashAlgorithms([...hashAlgorithms, algo])
                  } else {
                    setHashAlgorithms(hashAlgorithms.filter(a => a !== algo))
                  }
                }}
                label={algo}
              />
            ))}
          </div>
        )

      case 'aes':
        return (
          <>
            <ToggleGroup
              value={aesMode}
              onChange={setAesMode}
              options={[
                { value: 'encrypt', label: lang === 'zh' ? '加密' : 'Encrypt' },
                { value: 'decrypt', label: lang === 'zh' ? '解密' : 'Decrypt' },
              ]}
            />
            <input
              type="password"
              value={aesPassword}
              onChange={e => setAesPassword(e.target.value)}
              placeholder={lang === 'zh' ? '输入密码' : 'Enter password'}
              style={styles.textInput}
              onFocus={(e) => { e.target.style.borderColor = theme.bgAccent; e.target.style.background = theme.bgSecondary }}
              onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = 'transparent' }}
            />
            <button onClick={runAes} disabled={!aesPassword || isProcessing} style={{
              ...styles.btnPrimary,
              opacity: (!aesPassword || isProcessing) ? 0.5 : 1,
            }}>
              {isProcessing ? '...' : (aesMode === 'encrypt' ? (lang === 'zh' ? '加密' : 'Encrypt') : (lang === 'zh' ? '解密' : 'Decrypt'))}
            </button>
          </>
        )

      case 'bcrypt':
        return (
          <>
            <ToggleGroup
              value={bcryptMode}
              onChange={setBcryptMode}
              options={[
                { value: 'hash', label: lang === 'zh' ? '生成哈希' : 'Hash' },
                { value: 'verify', label: lang === 'zh' ? '验证' : 'Verify' },
              ]}
            />
            {bcryptMode === 'hash' && (
              <NumberInput
                value={bcryptRounds}
                onChange={setBcryptRounds}
                min={4}
                max={15}
                placeholder={lang === 'zh' ? '轮数' : 'Rounds'}
              />
            )}
          </>
        )

      case 'hmac':
        return (
          <>
            <CustomSelect
              value={hmacAlgo}
              onChange={setHmacAlgo}
              options={[
                { value: 'SHA-1', label: 'SHA-1' },
                { value: 'SHA-256', label: 'SHA-256' },
                { value: 'SHA-384', label: 'SHA-384' },
                { value: 'SHA-512', label: 'SHA-512' },
              ]}
            />
            <input
              type="text"
              value={hmacKey}
              onChange={e => setHmacKey(e.target.value)}
              placeholder={lang === 'zh' ? '输入密钥' : 'Enter key'}
              style={styles.textInput}
              onFocus={(e) => { e.target.style.borderColor = theme.bgAccent; e.target.style.background = theme.bgSecondary }}
              onBlur={(e) => { e.target.style.borderColor = theme.border; e.target.style.background = 'transparent' }}
            />
            <button onClick={runHmac} disabled={!hmacKey || isProcessing} style={{
              ...styles.btnPrimary,
              opacity: (!hmacKey || isProcessing) ? 0.5 : 1,
            }}>
              {lang === 'zh' ? '计算' : 'Calculate'}
            </button>
          </>
        )

      case 'jwt':
        return (
          <span style={{ fontSize: '13px', color: theme.textSecondary, fontFamily: font.ui }}>
            {lang === 'zh' ? '输入 JWT Token 自动解析' : 'Enter JWT Token to auto decode'}
          </span>
        )

      default:
        return null
    }
  }

  // 渲染输出区域
  const renderOutput = () => {
    if (error) {
      return <div style={styles.errorBox}>{error}</div>
    }

    if (activeTool === 'jwt' && jwtResult) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {jwtResult.isExpired && (
            <div style={styles.statusBadge(true)}>
              {lang === 'zh' ? '⚠️ Token 已过期' : '⚠️ Token expired'}
            </div>
          )}
          {!jwtResult.isExpired && jwtResult.expiresAt && (
            <div style={styles.statusBadge(false)}>
              {lang === 'zh' ? '✓ Token 有效' : '✓ Token valid'}
            </div>
          )}
          <div>
            <div style={{ ...styles.panelLabel, marginBottom: '4px' }}>Header</div>
            <pre style={styles.jsonBox}>{JSON.stringify(jwtResult.header, null, 2)}</pre>
          </div>
          <div>
            <div style={{ ...styles.panelLabel, marginBottom: '4px' }}>Payload</div>
            <pre style={styles.jsonBox}>{JSON.stringify(jwtResult.payload, null, 2)}</pre>
          </div>
          {(jwtResult.issuedAt || jwtResult.expiresAt) && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              {jwtResult.issuedAt && (
                <div style={{ padding: '10px', background: theme.bgTertiary, borderRadius: radius.sm }}>
                  <div style={styles.panelLabel}>{lang === 'zh' ? '签发时间' : 'Issued At'}</div>
                  <div style={{ fontSize: '12px', color: theme.textPrimary }}>{jwtResult.issuedAt.toLocaleString()}</div>
                </div>
              )}
              {jwtResult.expiresAt && (
                <div style={{ padding: '10px', background: theme.bgTertiary, borderRadius: radius.sm }}>
                  <div style={styles.panelLabel}>{lang === 'zh' ? '过期时间' : 'Expires At'}</div>
                  <div style={{ fontSize: '12px', color: theme.textPrimary }}>{jwtResult.expiresAt.toLocaleString()}</div>
                </div>
              )}
            </div>
          )}
          <div>
            <div style={{ ...styles.panelLabel, marginBottom: '4px' }}>Signature</div>
            <div style={{ ...styles.jsonBox, wordBreak: 'break-all' }}>{jwtResult.signature}</div>
          </div>
        </div>
      )
    }

    return (
      <textarea
        value={output}
        readOnly
        placeholder={lang === 'zh' ? '输出结果' : 'Output result'}
        style={styles.textareaReadonly}
      />
    )
  }

  // 获取输入提示
  const getInputPlaceholder = () => {
    switch (activeTool) {
      case 'hash':
        return lang === 'zh' ? '输入要计算哈希的文本' : 'Enter text to hash'
      case 'aes':
        return aesMode === 'encrypt'
          ? (lang === 'zh' ? '输入要加密的文本' : 'Enter text to encrypt')
          : (lang === 'zh' ? '输入 Base64 密文' : 'Enter Base64 ciphertext')
      case 'bcrypt':
        return bcryptMode === 'hash'
          ? (lang === 'zh' ? '输入密码' : 'Enter password')
          : (lang === 'zh' ? '输入密码进行验证' : 'Enter password to verify')
      case 'hmac':
        return lang === 'zh' ? '输入要计算 HMAC 的文本' : 'Enter text to calculate HMAC'
      case 'jwt':
        return lang === 'zh' ? '输入 JWT Token' : 'Enter JWT Token'
      default:
        return ''
    }
  }

  return (
    <div style={styles.container}>
      {/* 工具选择 */}
      <div style={styles.toolbar}>
        <div style={styles.toolTabs}>
          {tools.map(tool => (
            <button
              key={tool.id}
              onClick={() => {
                setActiveTool(tool.id)
                setOutput('')
                setError('')
                setJwtResult(null)
              }}
              style={styles.toolTab(activeTool === tool.id)}
            >
              {tool.name}
            </button>
          ))}
        </div>

        {/* 工具特定参数 */}
        {renderToolParams()}
      </div>

      {/* Bcrypt 验证模式需要额外的哈希输入 */}
      {activeTool === 'bcrypt' && bcryptMode === 'verify' && (
        <div style={{ marginBottom: '12px' }}>
          <span style={styles.label}>{lang === 'zh' ? 'Bcrypt 哈希值:' : 'Bcrypt Hash:'}</span>
          <input
            type="text"
            value={bcryptHash}
            onChange={e => setBcryptHash(e.target.value)}
            placeholder="$2a$10$..."
            style={{ ...styles.textInput, width: '100%', marginTop: '6px' }}
          />
        </div>
      )}

      {/* 主内容区 */}
      <div style={styles.grid}>
        <div style={styles.panel}>
          <span style={styles.panelLabel}>{lang === 'zh' ? '输入' : 'Input'}</span>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={getInputPlaceholder()}
            style={styles.textarea}
          />
        </div>

        <div style={styles.panel}>
          <span style={styles.panelLabel}>{lang === 'zh' ? '输出' : 'Output'}</span>
          {renderOutput()}
        </div>
      </div>

      {/* 提示 */}
      {activeTool === 'bcrypt' && (
        <div style={styles.hint}>
          {lang === 'zh'
            ? '⚠️ 使用 PBKDF2 模拟 bcrypt 格式，非标准实现'
            : '⚠️ Uses PBKDF2 to simulate bcrypt format, not standard implementation'}
        </div>
      )}
    </div>
  )
}
