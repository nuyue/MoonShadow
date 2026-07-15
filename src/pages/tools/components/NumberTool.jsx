import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'
import { convertBase, gcdMultiple, lcmMultiple, primeFactorsArray, isPrime } from '../../../utils/core'
import ToggleGroup from './ui/ToggleGroup'
import CustomSelect from './ui/CustomSelect'
import NumberInput from './ui/NumberInput'

// 安全的数学表达式求值
function safeEval(expr) {
  try {
    const sanitized = expr.replace(/[^0-9+\-*/%().Math\s\w]/g, '')
    const func = new Function('Math', `"use strict"; return (${sanitized})`)
    return { ok: true, value: func(Math) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// 罗马数字转换
const romanNumerals = [
  { value: 1000, symbol: 'M' }, { value: 900, symbol: 'CM' },
  { value: 500, symbol: 'D' }, { value: 400, symbol: 'CD' },
  { value: 100, symbol: 'C' }, { value: 90, symbol: 'XC' },
  { value: 50, symbol: 'L' }, { value: 40, symbol: 'XL' },
  { value: 10, symbol: 'X' }, { value: 9, symbol: 'IX' },
  { value: 5, symbol: 'V' }, { value: 4, symbol: 'IV' },
  { value: 1, symbol: 'I' },
]

function toRoman(num) {
  if (num < 1 || num > 3999) return null
  let result = ''
  let remaining = num
  for (const { value, symbol } of romanNumerals) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }
  return result
}

function fromRoman(str) {
  const romanMap = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 }
  let result = 0
  let i = 0
  while (i < str.length) {
    if (i + 1 < str.length && romanMap[str.substring(i, i + 2)]) {
      result += romanMap[str.substring(i, i + 2)]
      i += 2
    } else {
      result += romanMap[str[i]] || 0
      i += 1
    }
  }
  return result
}

// 数字单位换算
const numberUnits = {
  '': 1, 'K': 1e3, 'M': 1e6, 'B': 1e9, 'T': 1e12,
  '万': 1e4, '亿': 1e8,
}

export default function NumberTool() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [tool, setTool] = React.useState('base')
  const [input, setInput] = React.useState('')
  const [output, setOutput] = React.useState({})
  const [error, setError] = React.useState('')

  // 进制转换
  const [fromBase, setFromBase] = React.useState(10)

  // 数学表达式
  const [mathExpr, setMathExpr] = React.useState('')

  // GCD/LCM
  const [gcdNumbers, setGcdNumbers] = React.useState(['24', '36'])

  // 罗马数字
  const [romanMode, setRomanMode] = React.useState('toRoman')

  // 数字单位
  const [unitValue, setUnitValue] = React.useState('')
  const [fromUnit, setFromUnit] = React.useState('')
  const [toUnit, setToUnit] = React.useState('万')

  // 质数检测
  const [primeInput, setPrimeInput] = React.useState('')

  // 浮点数可视化
  const [floatInput, setFloatInput] = React.useState('3.14')

  // 进制转换
  React.useEffect(() => {
    if (tool === 'base') {
      if (!input.trim()) { setOutput({}); setError(''); return }
      const bases = [2, 8, 10, 16]
      const labels = { 2: lang === 'zh' ? '二进制' : 'Binary', 8: lang === 'zh' ? '八进制' : 'Octal', 10: lang === 'zh' ? '十进制' : 'Decimal', 16: lang === 'zh' ? '十六进制' : 'Hex' }
      const converted = {}
      for (const base of bases) {
        if (base === fromBase) { converted[labels[base]] = input; continue }
        const result = convertBase(input, fromBase, base)
        if (result.ok) {
          converted[labels[base]] = result.value.toUpperCase()
        } else {
          setError(result.error)
          setOutput({})
          return
        }
      }
      setError('')
      setOutput(converted)
    }
  }, [input, fromBase, tool, lang])

  // 数学表达式
  React.useEffect(() => {
    if (tool === 'math') {
      if (!mathExpr.trim()) { setOutput({}); setError(''); return }
      const result = safeEval(mathExpr)
      if (result.ok) {
        setError('')
        setOutput({ result: typeof result.value === 'number' ? (Number.isInteger(result.value) ? result.value : result.value.toPrecision(10).replace(/\.?0+$/, '')) : result.value })
      } else {
        setError(result.error)
        setOutput({})
      }
    }
  }, [mathExpr, tool])

  // GCD/LCM
  React.useEffect(() => {
    if (tool === 'gcd') {
      const parsed = gcdNumbers.map(n => parseInt(n.trim())).filter(n => !isNaN(n) && n !== 0)
      if (parsed.length < 2) { setOutput({}); return }
      const gcd = gcdMultiple(parsed)
      const lcm = lcmMultiple(parsed)
      const factors = parsed.map(n => `${n} = ${primeFactorsArray(n).join(' × ')}`)
      setOutput({ gcd, lcm, factors })
    }
  }, [gcdNumbers, tool])

  // 罗马数字
  React.useEffect(() => {
    if (tool === 'roman') {
      if (!input.trim()) { setOutput({}); setError(''); return }
      if (romanMode === 'toRoman') {
        const num = parseInt(input)
        if (isNaN(num) || num < 1 || num > 3999) {
          setError(lang === 'zh' ? '请输入1-3999之间的整数' : 'Enter integer 1-3999')
          setOutput({})
        } else {
          setError('')
          setOutput({ roman: toRoman(num) })
        }
      } else {
        const num = fromRoman(input.toUpperCase())
        if (num > 0) {
          setError('')
          setOutput({ number: num })
        } else {
          setError(lang === 'zh' ? '无效的罗马数字' : 'Invalid Roman numeral')
          setOutput({})
        }
      }
    }
  }, [input, romanMode, tool, lang])

  // 数字单位换算
  React.useEffect(() => {
    if (tool === 'unit') {
      if (!unitValue.trim()) { setOutput({}); setError(''); return }
      const num = parseFloat(unitValue)
      if (isNaN(num)) { setError(lang === 'zh' ? '请输入数字' : 'Enter a number'); setOutput({}); return }
      setError('')
      const fromVal = num * (numberUnits[fromUnit] || 1)
      const toVal = fromVal / (numberUnits[toUnit] || 1)
      setOutput({ result: toVal })
    }
  }, [unitValue, fromUnit, toUnit, tool, lang])

  // 质数检测
  React.useEffect(() => {
    if (tool === 'prime') {
      if (!primeInput.trim()) { setOutput({}); return }
      const num = parseInt(primeInput)
      if (isNaN(num) || num < 2) { setOutput({ result: lang === 'zh' ? '请输入≥2的整数' : 'Enter integer ≥ 2' }); return }
      const result = isPrime(num)
      setOutput({ result: result ? (lang === 'zh' ? '是质数' : 'Is prime') : (lang === 'zh' ? '不是质数' : 'Not prime') })
    }
  }, [primeInput, tool, lang])

  // 浮点数可视化
  React.useEffect(() => {
    if (tool === 'float') {
      const num = parseFloat(floatInput)
      if (isNaN(num)) { setOutput({}); return }
      const buffer = new ArrayBuffer(8)
      const view = new DataView(buffer)
      view.setFloat64(0, num, true)
      const bytes = []
      for (let i = 0; i < 8; i++) bytes.push(view.getUint8(i).toString(16).padStart(2, '0').toUpperCase())
      const bits = view.getBigUint64(0, true).toString(2).padStart(64, '0')
      const sign = bits[0]
      const exponent = bits.substring(1, 12)
      const mantissa = bits.substring(12)
      setOutput({
        hex: bytes.join(' '),
        binary: bits,
        sign: sign === '0' ? '+' : '-',
        exponent: parseInt(exponent, 2) - 1023,
        mantissa: mantissa,
      })
    }
  }, [floatInput, tool])

  const styles = {
    container: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
    toolbar: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
    input: {
      flex: 1, padding: '8px 12px', background: theme.bgSecondary, color: theme.textPrimary,
      border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, fontSize: '13px', outline: 'none',
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' },
    card: {
      background: theme.bgSecondary, padding: '12px', borderRadius: radius.md,
      border: `1px solid ${theme.border}`, textAlign: 'center',
    },
    label: { fontSize: '11px', color: theme.textMuted, fontFamily: font.mono },
    value: { fontSize: '16px', color: theme.textPrimary, fontFamily: font.mono, marginTop: '4px', wordBreak: 'break-all' },
    error: { padding: '8px 12px', background: '#FEE2E2', borderRadius: radius.sm, color: '#DC2626', fontFamily: font.mono, fontSize: '12px' },
  }

  const toolOptions = [
    { value: 'base', label: lang === 'zh' ? '进制转换' : 'Base' },
    { value: 'math', label: lang === 'zh' ? '数学计算' : 'Math' },
    { value: 'gcd', label: 'GCD/LCM' },
    { value: 'prime', label: lang === 'zh' ? '质数检测' : 'Prime' },
    { value: 'roman', label: lang === 'zh' ? '罗马数字' : 'Roman' },
    { value: 'unit', label: lang === 'zh' ? '单位换算' : 'Unit' },
    { value: 'float', label: lang === 'zh' ? '浮点数' : 'Float' },
  ]

  const baseOptions = [
    { value: 2, label: lang === 'zh' ? '二进制' : 'Binary' },
    { value: 8, label: lang === 'zh' ? '八进制' : 'Octal' },
    { value: 10, label: lang === 'zh' ? '十进制' : 'Decimal' },
    { value: 16, label: lang === 'zh' ? '十六进制' : 'Hex' },
  ]

  const unitOptions = [
    { value: '', label: lang === 'zh' ? '无' : 'None' },
    { value: 'K', label: 'K (千)' },
    { value: 'M', label: 'M (百万)' },
    { value: 'B', label: 'B (十亿)' },
    { value: '万', label: '万' },
    { value: '亿', label: '亿' },
  ]

  return (
    <div style={styles.container}>
      <ToggleGroup options={toolOptions} value={tool} onChange={setTool} />

      {tool === 'base' && (
        <>
          <div style={styles.toolbar}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={lang === 'zh' ? '输入数字' : 'Enter number'} style={styles.input} />
            <CustomSelect value={fromBase} onChange={setFromBase} options={baseOptions} />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          {Object.keys(output).length > 0 && (
            <div style={styles.grid}>
              {Object.entries(output).map(([k, v]) => (
                <div key={k} style={styles.card}>
                  <div style={styles.label}>{k}</div>
                  <div style={styles.value}>{v}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tool === 'math' && (
        <>
          <input type="text" value={mathExpr} onChange={e => setMathExpr(e.target.value)} placeholder={lang === 'zh' ? '输入数学表达式，如 2+3*4, Math.sqrt(16)' : 'Enter expression, e.g. 2+3*4, Math.sqrt(16)'} style={styles.input} />
          {error && <div style={styles.error}>{error}</div>}
          {output.result !== undefined && (
            <div style={styles.card}>
              <div style={styles.label}>=</div>
              <div style={{ ...styles.value, fontSize: '24px', color: theme.bgAccent }}>{output.result}</div>
            </div>
          )}
        </>
      )}

      {tool === 'gcd' && (
        <>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {gcdNumbers.map((n, i) => (
              <input key={i} type="number" value={n} onChange={e => setGcdNumbers(prev => prev.map((x, j) => j === i ? e.target.value : x))} style={{ ...styles.input, width: '80px' }} />
            ))}
            <button onClick={() => setGcdNumbers(prev => [...prev, ''])} style={{ padding: '6px 12px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontSize: '12px' }}>+</button>
          </div>
          {output.gcd && (
            <div style={styles.grid}>
              <div style={styles.card}>
                <div style={styles.label}>GCD</div>
                <div style={styles.value}>{output.gcd}</div>
              </div>
              <div style={styles.card}>
                <div style={styles.label}>LCM</div>
                <div style={styles.value}>{output.lcm}</div>
              </div>
              {output.factors?.map((f, i) => (
                <div key={i} style={styles.card}>
                  <div style={styles.label}>{lang === 'zh' ? '质因数分解' : 'Prime factors'}</div>
                  <div style={{ ...styles.value, fontSize: '12px' }}>{f}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tool === 'prime' && (
        <>
          <input type="number" value={primeInput} onChange={e => setPrimeInput(e.target.value)} placeholder={lang === 'zh' ? '输入整数' : 'Enter integer'} style={styles.input} />
          {output.result && (
            <div style={styles.card}>
              <div style={{ ...styles.value, fontSize: '16px', color: output.result.includes(lang === 'zh' ? '是' : 'prime') ? '#22C55E' : '#EF4444' }}>{output.result}</div>
            </div>
          )}
        </>
      )}

      {tool === 'roman' && (
        <>
          <ToggleGroup options={[{ value: 'toRoman', label: lang === 'zh' ? '数字转罗马' : 'To Roman' }, { value: 'fromRoman', label: lang === 'zh' ? '罗马转数字' : 'From Roman' }]} value={romanMode} onChange={setRomanMode} />
          <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder={romanMode === 'toRoman' ? (lang === 'zh' ? '输入1-3999' : 'Enter 1-3999') : (lang === 'zh' ? '输入罗马数字' : 'Enter Roman')} style={styles.input} />
          {error && <div style={styles.error}>{error}</div>}
          {output.roman && <div style={{ ...styles.card, fontSize: '32px', color: theme.bgAccent }}>{output.roman}</div>}
          {output.number && <div style={{ ...styles.card, fontSize: '32px', color: theme.bgAccent }}>{output.number}</div>}
        </>
      )}

      {tool === 'unit' && (
        <>
          <div style={styles.toolbar}>
            <input type="number" value={unitValue} onChange={e => setUnitValue(e.target.value)} placeholder={lang === 'zh' ? '输入数字' : 'Enter number'} style={styles.input} />
            <CustomSelect value={fromUnit} onChange={setFromUnit} options={unitOptions} />
            <span style={{ color: theme.textMuted }}>→</span>
            <CustomSelect value={toUnit} onChange={setToUnit} options={unitOptions} />
          </div>
          {output.result !== undefined && (
            <div style={styles.card}>
              <div style={styles.label}>{lang === 'zh' ? '结果' : 'Result'}</div>
              <div style={{ ...styles.value, fontSize: '24px' }}>{output.result}</div>
            </div>
          )}
        </>
      )}

      {tool === 'float' && (
        <>
          <input type="text" value={floatInput} onChange={e => setFloatInput(e.target.value)} placeholder={lang === 'zh' ? '输入浮点数' : 'Enter float'} style={styles.input} />
          {output.hex && (
            <div style={styles.grid}>
              <div style={styles.card}>
                <div style={styles.label}>Hex</div>
                <div style={{ ...styles.value, fontFamily: font.mono, fontSize: '12px' }}>{output.hex}</div>
              </div>
              <div style={styles.card}>
                <div style={styles.label}>Sign</div>
                <div style={styles.value}>{output.sign}</div>
              </div>
              <div style={styles.card}>
                <div style={styles.label}>Exp</div>
                <div style={styles.value}>{output.exponent}</div>
              </div>
              <div style={{ ...styles.card, gridColumn: 'span 2' }}>
                <div style={styles.label}>Mantissa</div>
                <div style={{ ...styles.value, fontFamily: font.mono, fontSize: '10px', wordBreak: 'break-all' }}>{output.mantissa}</div>
              </div>
              <div style={{ ...styles.card, gridColumn: 'span 2' }}>
                <div style={styles.label}>Binary (64-bit)</div>
                <div style={{ ...styles.value, fontFamily: font.mono, fontSize: '10px', wordBreak: 'break-all' }}>{output.binary}</div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}