import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'
import { countTextStats, textCaseConvert } from '../../../utils/core'
import ToggleGroup from './ui/ToggleGroup'
import CustomSelect from './ui/CustomSelect'

// 文本差异对比
function diffText(oldText, newText, mode = 'lines') {
  const oldArr = mode === 'lines' ? oldText.split('\n') : mode === 'words' ? oldText.split(/\s+/) : oldText.split('')
  const newArr = mode === 'lines' ? newText.split('\n') : mode === 'words' ? newText.split(/\s+/) : newText.split('')
  const result = []
  let i = 0, j = 0
  while (i < oldArr.length || j < newArr.length) {
    if (i < oldArr.length && j < newArr.length && oldArr[i] === newArr[j]) {
      result.push({ type: 'unchanged', value: oldArr[i] })
      i++; j++
    } else if (j < newArr.length && (i >= oldArr.length || oldArr.slice(i).indexOf(newArr[j]) === -1)) {
      result.push({ type: 'added', value: newArr[j] })
      j++
    } else if (i < oldArr.length) {
      result.push({ type: 'removed', value: oldArr[i] })
      i++
    }
  }
  return result
}

export default function TextTool() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [tool, setTool] = React.useState('stats')
  const [input, setInput] = React.useState('')
  const [input2, setInput2] = React.useState('')
  const [output, setOutput] = React.useState('')

  // 文本统计
  const [stats, setStats] = React.useState(null)

  // 行处理
  const [lineMode, setLineMode] = React.useState('sort')

  // 字符串转义
  const [escapeMode, setEscapeMode] = React.useState('escape')
  const [escapeFormat, setEscapeFormat] = React.useState('json')

  // 文本转换
  const [transformOp, setTransformOp] = React.useState('trim')

  // 正则测试
  const [regexPattern, setRegexPattern] = React.useState('')
  const [regexFlags, setRegexFlags] = React.useState('g')
  const [regexMatches, setRegexMatches] = React.useState([])
  const [regexError, setRegexError] = React.useState('')
  const [replaceText, setReplaceText] = React.useState('')
  const [replacedText, setReplacedText] = React.useState('')

  // 文本统计
  React.useEffect(() => {
    if (tool === 'stats') {
      if (input) {
        setStats(countTextStats(input))
      } else {
        setStats(null)
      }
    }
  }, [input, tool])

  // 大小写转换
  React.useEffect(() => {
    if (tool === 'case') {
      const modes = ['upper', 'lower', 'title', 'sentence', 'camel', 'pascal', 'snake', 'kebab', 'constant']
      const labels = { upper: 'UPPER', lower: 'lower', title: 'Title Case', sentence: 'Sentence case', camel: 'camelCase', pascal: 'PascalCase', snake: 'snake_case', kebab: 'kebab-case', constant: 'CONSTANT_CASE' }
      const converted = {}
      for (const mode of modes) {
        converted[labels[mode]] = textCaseConvert(input, mode)
      }
      setOutput(JSON.stringify(converted, null, 2))
    }
  }, [input, tool])

  // 行处理
  React.useEffect(() => {
    if (tool === 'lines') {
      if (!input.trim()) { setOutput(''); return }
      const lines = input.split('\n')
      let result = []
      switch (lineMode) {
        case 'sort': result = [...lines].sort(); break
        case 'sortReverse': result = [...lines].sort().reverse(); break
        case 'unique': result = [...new Set(lines)]; break
        case 'reverse': result = [...lines].reverse(); break
        case 'shuffle': result = [...lines].sort(() => Math.random() - 0.5); break
        case 'filterEmpty': result = lines.filter(l => l.trim()); break
        default: result = lines
      }
      setOutput(result.join('\n'))
    }
  }, [input, lineMode, tool])

  // 字符串转义
  const escapeString = (str, format) => {
    switch (format) {
      case 'json': return JSON.stringify(str)
      case 'js': return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t')
      case 'html': return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
      case 'url': return encodeURIComponent(str)
      default: return str
    }
  }
  const unescapeString = (str, format) => {
    switch (format) {
      case 'json': try { return JSON.parse(str) } catch { return str }
      case 'js': return str.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\\/g, '\\')
      case 'html': return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      case 'url': return decodeURIComponent(str)
      default: return str
    }
  }
  React.useEffect(() => {
    if (tool === 'escape') {
      if (!input) { setOutput(''); return }
      setOutput(escapeMode === 'escape' ? escapeString(input, escapeFormat) : unescapeString(input, escapeFormat))
    }
  }, [input, escapeMode, escapeFormat, tool])

  // 文本转换
  React.useEffect(() => {
    if (tool === 'transform') {
      if (!input) { setOutput(''); return }
      let result = input
      switch (transformOp) {
        case 'trim': result = input.trim(); break
        case 'trimLines': result = input.split('\n').map(line => line.trim()).join('\n'); break
        case 'removeEmpty': result = input.split('\n').filter(line => line.trim()).join('\n'); break
        case 'addLineNumber': result = input.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n'); break
        case 'removeLineNumber': result = input.split('\n').map(line => line.replace(/^\d+\.\s*/, '')).join('\n'); break
        case 'addPrefix': result = input.split('\n').map(line => `> ${line}`).join('\n'); break
        case 'addSuffix': result = input.split('\n').map(line => `${line};`).join('\n'); break
        case 'joinLines': result = input.split('\n').join(' '); break
        case 'splitWords': result = input.split(/\s+/).join('\n'); break
        default: result = input
      }
      setOutput(result)
    }
  }, [input, transformOp, tool])

  // 正则测试
  React.useEffect(() => {
    if (tool === 'regex') {
      if (!regexPattern || !input) {
        setRegexMatches([])
        setRegexError('')
        setReplacedText('')
        return
      }
      try {
        const regex = new RegExp(regexPattern, regexFlags)
        const allMatches = []
        let match
        if (regexFlags.includes('g')) {
          while ((match = regex.exec(input)) !== null) {
            allMatches.push({ value: match[0], index: match.index, groups: match.groups || null })
          }
        } else {
          match = regex.exec(input)
          if (match) allMatches.push({ value: match[0], index: match.index, groups: match.groups || null })
        }
        setRegexMatches(allMatches)
        setRegexError('')
        setReplacedText(replaceText ? input.replace(regex, replaceText) : '')
      } catch (e) {
        setRegexError(e.message)
        setRegexMatches([])
        setReplacedText('')
      }
    }
  }, [input, regexPattern, regexFlags, replaceText, tool])

  const styles = {
    container: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
    toolbar: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
    textarea: {
      width: '100%', minHeight: '200px', padding: '12px', background: theme.bgSecondary,
      color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
      fontFamily: font.mono, fontSize: '13px', resize: 'vertical', outline: 'none',
    },
    textareaOutput: {
      width: '100%', minHeight: '200px', padding: '12px', background: theme.bgTertiary,
      color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
      fontFamily: font.mono, fontSize: '13px', resize: 'vertical',
    },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' },
    statCard: {
      background: theme.bgSecondary, padding: '12px', borderRadius: radius.md,
      textAlign: 'center', border: `1px solid ${theme.border}`,
    },
    diffLine: (type) => ({
      padding: '2px 8px', fontFamily: font.mono, fontSize: '12px',
      background: type === 'added' ? '#22C55E20' : type === 'removed' ? '#EF444420' : 'transparent',
      color: type === 'added' ? '#22C55E' : type === 'removed' ? '#EF4444' : theme.textPrimary,
    }),
  }

  const toolOptions = [
    { value: 'stats', label: lang === 'zh' ? '文本统计' : 'Stats' },
    { value: 'case', label: lang === 'zh' ? '大小写转换' : 'Case' },
    { value: 'lines', label: lang === 'zh' ? '行处理' : 'Lines' },
    { value: 'escape', label: lang === 'zh' ? '转义处理' : 'Escape' },
    { value: 'transform', label: lang === 'zh' ? '文本转换' : 'Transform' },
    { value: 'regex', label: lang === 'zh' ? '正则测试' : 'Regex' },
    { value: 'diff', label: lang === 'zh' ? '文本对比' : 'Diff' },
  ]

  const lineOptions = [
    { value: 'sort', label: lang === 'zh' ? '排序' : 'Sort' },
    { value: 'sortReverse', label: lang === 'zh' ? '逆序' : 'Reverse' },
    { value: 'unique', label: lang === 'zh' ? '去重' : 'Unique' },
    { value: 'reverse', label: lang === 'zh' ? '反转' : 'Reverse Lines' },
    { value: 'shuffle', label: lang === 'zh' ? '随机' : 'Shuffle' },
    { value: 'filterEmpty', label: lang === 'zh' ? '删空行' : 'Filter Empty' },
  ]

  const escapeFormatOptions = [
    { value: 'json', label: 'JSON' },
    { value: 'js', label: 'JavaScript' },
    { value: 'html', label: 'HTML' },
    { value: 'url', label: 'URL' },
  ]

  const transformOptions = [
    { value: 'trim', label: lang === 'zh' ? '去首尾空白' : 'Trim' },
    { value: 'trimLines', label: lang === 'zh' ? '每行去空白' : 'Trim Lines' },
    { value: 'removeEmpty', label: lang === 'zh' ? '删空行' : 'Remove Empty' },
    { value: 'addLineNumber', label: lang === 'zh' ? '加行号' : 'Add Line #' },
    { value: 'removeLineNumber', label: lang === 'zh' ? '删行号' : 'Remove Line #' },
    { value: 'addPrefix', label: lang === 'zh' ? '加前缀' : 'Add Prefix' },
    { value: 'addSuffix', label: lang === 'zh' ? '加后缀' : 'Add Suffix' },
    { value: 'joinLines', label: lang === 'zh' ? '合并行' : 'Join Lines' },
    { value: 'splitWords', label: lang === 'zh' ? '拆分词' : 'Split Words' },
  ]

  return (
    <div style={styles.container}>
      {/* 工具选择 */}
      <ToggleGroup options={toolOptions} value={tool} onChange={setTool} />

      {/* 工具特定选项 */}
      {tool === 'lines' && (
        <div style={styles.toolbar}>
          <ToggleGroup options={lineOptions} value={lineMode} onChange={setLineMode} />
        </div>
      )}

      {tool === 'escape' && (
        <div style={styles.toolbar}>
          <ToggleGroup options={[{ value: 'escape', label: lang === 'zh' ? '转义' : 'Escape' }, { value: 'unescape', label: lang === 'zh' ? '反转义' : 'Unescape' }]} value={escapeMode} onChange={setEscapeMode} />
          <CustomSelect value={escapeFormat} onChange={setEscapeFormat} options={escapeFormatOptions} />
        </div>
      )}

      {tool === 'transform' && (
        <div style={styles.toolbar}>
          <CustomSelect value={transformOp} onChange={setTransformOp} options={transformOptions} />
        </div>
      )}

      {tool === 'regex' && (
        <div style={styles.toolbar}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: theme.bgAccent, fontFamily: font.mono }}>/</span>
            <input
              type="text"
              value={regexPattern}
              onChange={e => setRegexPattern(e.target.value)}
              placeholder={lang === 'zh' ? '正则表达式' : 'Regex pattern'}
              style={{ width: '200px', padding: '6px 10px', background: theme.bgSecondary, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, fontSize: '12px', outline: 'none' }}
            />
            <span style={{ color: theme.bgAccent, fontFamily: font.mono }}>/</span>
          </div>
          <input
            type="text"
            value={regexFlags}
            onChange={e => setRegexFlags(e.target.value.replace(/[^gimsu]/g, ''))}
            placeholder="flags"
            style={{ width: '60px', padding: '6px 10px', background: theme.bgSecondary, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, fontSize: '12px', outline: 'none' }}
          />
          <input
            type="text"
            value={replaceText}
            onChange={e => setReplaceText(e.target.value)}
            placeholder={lang === 'zh' ? '替换为...' : 'Replace with...'}
            style={{ width: '150px', padding: '6px 10px', background: theme.bgSecondary, color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, fontSize: '12px', outline: 'none' }}
          />
        </div>
      )}

      {/* 文本对比需要两个输入框 */}
      {tool === 'diff' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={lang === 'zh' ? '原始文本' : 'Original text'}
            style={styles.textarea}
            spellCheck={false}
          />
          <textarea
            value={input2}
            onChange={e => setInput2(e.target.value)}
            placeholder={lang === 'zh' ? '新文本' : 'New text'}
            style={styles.textarea}
            spellCheck={false}
          />
        </div>
      ) : (
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={lang === 'zh' ? '输入文本...' : 'Enter text...'}
          style={styles.textarea}
          spellCheck={false}
        />
      )}

      {/* 结果显示 */}
      {tool === 'stats' && stats && (
        <div style={styles.grid}>
          {[
            { label: lang === 'zh' ? '字符数' : 'Chars', value: stats.chars },
            { label: lang === 'zh' ? '字符(无空格)' : 'No Space', value: stats.charsNoSpace },
            { label: lang === 'zh' ? '词数' : 'Words', value: stats.words },
            { label: lang === 'zh' ? '行数' : 'Lines', value: stats.lines },
            { label: lang === 'zh' ? '字节数' : 'Bytes', value: stats.bytes },
          ].map((item, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: theme.bgAccent, fontFamily: font.mono }}>{item.value}</div>
              <div style={{ color: theme.textSecondary, fontSize: '12px', fontFamily: font.ui }}>{item.label}</div>
            </div>
          ))}
        </div>
      )}

      {tool === 'case' && output && (
        <textarea value={output} readOnly style={styles.textareaOutput} />
      )}

      {tool === 'lines' && (
        <textarea value={output} readOnly style={styles.textareaOutput} />
      )}

      {tool === 'escape' && (
        <textarea value={output} readOnly style={styles.textareaOutput} />
      )}

      {tool === 'transform' && (
        <textarea value={output} readOnly style={styles.textareaOutput} />
      )}

      {tool === 'regex' && (
        <>
          {regexError && <div style={{ padding: '8px 12px', background: '#FEE2E2', borderRadius: radius.sm, color: '#DC2626', fontFamily: font.mono, fontSize: '12px' }}>{regexError}</div>}
          {regexMatches.length > 0 && (
            <div style={{ background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}`, padding: '12px' }}>
              <div style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '8px', fontFamily: font.ui }}>
                {lang === 'zh' ? `找到 ${regexMatches.length} 个匹配` : `${regexMatches.length} matches`}
              </div>
              {regexMatches.slice(0, 50).map((m, i) => (
                <div key={i} style={{ padding: '4px 8px', fontFamily: font.mono, fontSize: '12px' }}>
                  <span style={{ color: theme.textMuted }}>[{m.index}]</span>
                  <span style={{ color: theme.bgAccent, marginLeft: '8px' }}>{m.value}</span>
                </div>
              ))}
            </div>
          )}
          {replacedText && (
            <textarea value={replacedText} readOnly style={styles.textareaOutput} />
          )}
        </>
      )}

      {tool === 'diff' && (input || input2) && (
        <div style={{ background: theme.bgSecondary, borderRadius: radius.md, border: `1px solid ${theme.border}`, padding: '12px', maxHeight: '400px', overflow: 'auto' }}>
          {diffText(input, input2, 'lines').map((line, i) => (
            <div key={i} style={styles.diffLine(line.type)}>
              {line.type === 'added' && '+ '}
              {line.type === 'removed' && '- '}
              {line.type === 'unchanged' && '  '}
              {line.value}
            </div>
          ))}
        </div>
      )}

      {/* 清空按钮 */}
      <button
        onClick={() => { setInput(''); setInput2(''); setOutput(''); setStats(null); setRegexMatches([]); setReplacedText(''); }}
        style={{
          padding: '6px 12px', background: theme.bgSecondary, color: theme.textSecondary,
          border: `1px solid ${theme.border}`, borderRadius: radius.sm, cursor: 'pointer',
          fontFamily: font.ui, fontSize: '12px',
        }}
      >
        {lang === 'zh' ? '清空' : 'Clear'}
      </button>
    </div>
  )
}