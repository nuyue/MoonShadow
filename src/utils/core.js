// 工具核心函数库 - 从 it-toolbox 移植

import * as jsYaml from 'js-yaml'

// ==================== 通用类型 ====================
export function ok(value) {
  return { ok: true, value }
}

export function err(error) {
  return { ok: false, error }
}

// ==================== 编码转换 ====================
export function encodeBase64(input) {
  try {
    const bytes = new TextEncoder().encode(input)
    let binary = ''
    bytes.forEach(b => { binary += String.fromCharCode(b) })
    return { ok: true, value: btoa(binary) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function decodeBase64(input) {
  try {
    const binary = atob(input.trim())
    const bytes = Uint8Array.from(binary, c => c.charCodeAt(0))
    return { ok: true, value: new TextDecoder().decode(bytes) }
  } catch {
    return { ok: false, error: '无效的 Base64 字符串' }
  }
}

export function encodeUrl(input) {
  try {
    return { ok: true, value: encodeURIComponent(input) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function decodeUrl(input) {
  try {
    return { ok: true, value: decodeURIComponent(input) }
  } catch {
    return { ok: false, error: '无效的 URL 编码字符串' }
  }
}

export function encodeUrlFull(input) {
  try {
    return { ok: true, value: encodeURI(input) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function decodeUrlFull(input) {
  try {
    return { ok: true, value: decodeURI(input) }
  } catch {
    return { ok: false, error: '无效的 URL 编码字符串' }
  }
}

// HTML 实体
const HTML_ENTITIES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  '©': '&copy;', '®': '&reg;', '™': '&trade;', '€': '&euro;', '£': '&pound;',
  '¥': '&yen;', '¢': '&cent;', '§': '&sect;', '¶': '&para;', '°': '&deg;',
}

const HTML_ENTITIES_REVERSE = Object.fromEntries(
  Object.entries(HTML_ENTITIES).map(([k, v]) => [v, k])
)

export function encodeHtmlEntities(input) {
  let result = input.replace(/&/g, '&amp;')
  for (const [char, entity] of Object.entries(HTML_ENTITIES)) {
    if (char !== '&') result = result.split(char).join(entity)
  }
  return { ok: true, value: result }
}

export function decodeHtmlEntities(input) {
  let result = input
  for (const [entity, char] of Object.entries(HTML_ENTITIES_REVERSE)) {
    result = result.split(entity).join(char)
  }
  result = result.replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
  result = result.replace(/&#x([0-9a-fA-F]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)))
  return { ok: true, value: result }
}

// Hex 编码
export function encodeHex(input, separator = '') {
  try {
    const bytes = new TextEncoder().encode(input)
    const hex = Array.from(bytes).map(b => b.toString(16).padStart(2, '0'))
    return { ok: true, value: hex.join(separator) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function decodeHex(input) {
  try {
    const clean = input.replace(/[\s:,-]/g, '')
    if (clean.length % 2 !== 0) return { ok: false, error: 'Hex 字符串长度必须是偶数' }
    const bytes = new Uint8Array(clean.length / 2)
    for (let i = 0; i < clean.length; i += 2) {
      bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16)
    }
    return { ok: true, value: new TextDecoder().decode(bytes) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// 二进制
export function textToBinary(input, separator = ' ') {
  try {
    const bytes = new TextEncoder().encode(input)
    const binary = Array.from(bytes).map(b => b.toString(2).padStart(8, '0'))
    return { ok: true, value: binary.join(separator) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function binaryToText(input) {
  try {
    const clean = input.replace(/[^01]/g, '')
    if (clean.length % 8 !== 0) return { ok: false, error: '二进制字符串长度必须是8的倍数' }
    const bytes = new Uint8Array(clean.length / 8)
    for (let i = 0; i < clean.length; i += 8) {
      bytes[i / 8] = parseInt(clean.slice(i, i + 8), 2)
    }
    return { ok: true, value: new TextDecoder().decode(bytes) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ROT13
export function rot13(input) {
  const result = input.split('').map(char => {
    const code = char.charCodeAt(0)
    if (code >= 65 && code <= 90) {
      return String.fromCharCode(((code - 65 + 13) % 26) + 65)
    }
    if (code >= 97 && code <= 122) {
      return String.fromCharCode(((code - 97 + 13) % 26) + 97)
    }
    return char
  })
  return { ok: true, value: result.join('') }
}

// 摩斯密码
const MORSE_CODE = {
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
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
}

const MORSE_CODE_REVERSE = Object.fromEntries(Object.entries(MORSE_CODE).map(([k, v]) => [v, k]))

export function textToMorse(input) {
  try {
    const chars = input.toUpperCase().split('')
    const result = chars.map(char => {
      if (char === ' ') return '/'
      return MORSE_CODE[char] || char
    })
    return { ok: true, value: result.join(' ') }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function morseToText(input) {
  try {
    const words = input.split(' / ')
    const result = words.map(word => {
      const letters = word.split(' ')
      return letters.map(code => MORSE_CODE_REVERSE[code] || code).join('')
    })
    return { ok: true, value: result.join(' ') }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ==================== 哈希计算 ====================
export async function calculateHash(input, algorithm = 'SHA-256') {
  try {
    const data = new TextEncoder().encode(input)
    const buffer = await crypto.subtle.digest(algorithm, data)
    const hash = Array.from(new Uint8Array(buffer)).map(b => b.toString(16).padStart(2, '0')).join('')
    return { ok: true, value: hash }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ==================== 时间戳 ====================
export function timestampToDate(timestamp) {
  const ts = parseInt(timestamp)
  if (isNaN(ts)) return { ok: false, error: '无效的时间戳' }
  
  let date
  if (ts > 1e12) {
    // 毫秒级
    date = new Date(ts)
  } else if (ts > 1e9 && ts < 1e12) {
    // 秒级
    date = new Date(ts * 1000)
  } else {
    // 默认秒级
    date = new Date(ts * 1000)
  }
  
  return { ok: true, value: date }
}

export function dateToTimestamp(date, unit = 's') {
  const ts = Math.floor(date.getTime() / 1000)
  return unit === 'ms' ? ts * 1000 : ts
}

// ==================== 日期计算 ====================
export function dateDifference(date1, date2) {
  const ms = Math.abs(date2.getTime() - date1.getTime())
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const totalDays = Math.floor(hours / 24)
  const weeks = Math.floor(totalDays / 7)
  
  let years = date2.getFullYear() - date1.getFullYear()
  let months = date2.getMonth() - date1.getMonth()
  let days = date2.getDate() - date1.getDate()
  
  if (days < 0) {
    months--
    const prevMonth = new Date(date2.getFullYear(), date2.getMonth(), 0)
    days += prevMonth.getDate()
  }
  if (months < 0) {
    years--
    months += 12
  }
  
  return { years, months, days, totalDays, weeks, hours, minutes, seconds }
}

export function addDays(date, days) {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export function addMonths(date, months) {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

export function addYears(date, years) {
  const result = new Date(date)
  result.setFullYear(result.getFullYear() + years)
  return result
}

// ==================== 时长格式化 ====================
export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function parseDuration(input) {
  try {
    if (/^\d+$/.test(input)) {
      return { ok: true, value: parseInt(input, 10) }
    }
    
    const match = input.match(/^(\d+):(\d+)(?::(\d+))?$/)
    if (match) {
      const h = parseInt(match[1], 10)
      const m = parseInt(match[2], 10)
      const s = match[3] ? parseInt(match[3], 10) : 0
      return { ok: true, value: h * 3600 + m * 60 + s }
    }
    
    return { ok: false, error: '无效的时长格式' }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function humanizeDuration(seconds) {
  if (seconds < 60) return `${seconds} 秒`
  if (seconds < 3600) return `${Math.floor(seconds / 60)} 分钟`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小时`
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)} 天`
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)} 个月`
  return `${Math.floor(seconds / 31536000)} 年`
}

// ==================== 时间格式转换 ====================
export function padZero(num, len = 2) {
  return num.toString().padStart(len, '0')
}

export function formatDateToISO8601(date) {
  return date.toISOString()
}

export function formatDateToRFC2822(date) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  
  const day = days[date.getUTCDay()]
  const d = padZero(date.getUTCDate())
  const month = months[date.getUTCMonth()]
  const year = date.getUTCFullYear()
  const time = `${padZero(date.getUTCHours())}:${padZero(date.getUTCMinutes())}:${padZero(date.getUTCSeconds())}`
  
  return `${day}, ${d} ${month} ${year} ${time} +0000`
}

export function formatDateToHTTP(date) {
  return date.toUTCString()
}

export function formatDateToSQL(date) {
  const year = date.getUTCFullYear()
  const month = padZero(date.getUTCMonth() + 1)
  const day = padZero(date.getUTCDate())
  const hours = padZero(date.getUTCHours())
  const minutes = padZero(date.getUTCMinutes())
  const seconds = padZero(date.getUTCSeconds())
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

export function formatDateToSQLTimestamp(date) {
  const year = date.getUTCFullYear()
  const month = padZero(date.getUTCMonth() + 1)
  const day = padZero(date.getUTCDate())
  const hours = padZero(date.getUTCHours())
  const minutes = padZero(date.getUTCMinutes())
  const seconds = padZero(date.getUTCSeconds())
  const ms = padZero(date.getUTCMilliseconds(), 3)
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${ms}`
}

export function formatDateToUnixTimestamp(date) {
  return Math.floor(date.getTime() / 1000).toString()
}

export function formatDateToUnixMs(date) {
  return date.getTime().toString()
}

export function formatDateToExcel(date) {
  const excelEpoch = new Date(1899, 11, 30)
  const diff = date.getTime() - excelEpoch.getTime()
  return (diff / (1000 * 60 * 60 * 24)).toFixed(6)
}

export function formatDateToJulian(date) {
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  const day = date.getUTCDate()
  
  const a = Math.floor((14 - month) / 12)
  const y = year + 4800 - a
  const m = month + 12 * a - 3
  
  const julianDay = day + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045
  
  const hours = date.getUTCHours()
  const minutes = date.getUTCMinutes()
  const seconds = date.getUTCSeconds()
  
  const fraction = (hours + minutes / 60 + seconds / 3600) / 24
  
  return (julianDay + fraction).toFixed(8)
}

export function formatDateToLocal(date) {
  return date.toLocaleString()
}

export function formatDateToCustom(date, format) {
  const replacements = {
    'YYYY': date.getUTCFullYear().toString(),
    'YY': date.getUTCFullYear().toString().slice(-2),
    'MM': padZero(date.getUTCMonth() + 1),
    'M': (date.getUTCMonth() + 1).toString(),
    'DD': padZero(date.getUTCDate()),
    'D': date.getUTCDate().toString(),
    'HH': padZero(date.getUTCHours()),
    'H': date.getUTCHours().toString(),
    'hh': padZero(date.getUTCHours() % 12 || 12),
    'h': (date.getUTCHours() % 12 || 12).toString(),
    'mm': padZero(date.getUTCMinutes()),
    'm': date.getUTCMinutes().toString(),
    'ss': padZero(date.getUTCSeconds()),
    's': date.getUTCSeconds().toString(),
    'SSS': padZero(date.getUTCMilliseconds(), 3),
    'A': date.getUTCHours() >= 12 ? 'PM' : 'AM',
    'a': date.getUTCHours() >= 12 ? 'pm' : 'am',
  }
  
  let result = format
  for (const [key, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(key, 'g'), value)
  }
  return result
}

export function parseTimeInput(value) {
  const trimmed = value.trim()
  if (!trimmed) return null
  
  if (/^\d+$/.test(trimmed)) {
    const num = parseInt(trimmed)
    if (num > 1e12 && num < 1e14) {
      return new Date(num)
    }
    if (num > 1e9 && num < 1e11) {
      return new Date(num * 1000)
    }
  }
  
  const parsed = new Date(trimmed)
  if (!isNaN(parsed.getTime())) {
    return parsed
  }
  
  return null
}

// ==================== 时区转换 ====================
export const TIMEZONES = [
  { value: 'Asia/Shanghai', label: '北京时间 (UTC+8)', offset: 8 },
  { value: 'Asia/Tokyo', label: '东京 (UTC+9)', offset: 9 },
  { value: 'Asia/Seoul', label: '首尔 (UTC+9)', offset: 9 },
  { value: 'Asia/Singapore', label: '新加坡 (UTC+8)', offset: 8 },
  { value: 'Asia/Hong_Kong', label: '香港 (UTC+8)', offset: 8 },
  { value: 'Asia/Dubai', label: '迪拜 (UTC+4)', offset: 4 },
  { value: 'Europe/London', label: '伦敦 (UTC+0/+1)', offset: 0 },
  { value: 'Europe/Paris', label: '巴黎 (UTC+1/+2)', offset: 1 },
  { value: 'Europe/Berlin', label: '柏林 (UTC+1/+2)', offset: 1 },
  { value: 'Europe/Moscow', label: '莫斯科 (UTC+3)', offset: 3 },
  { value: 'America/New_York', label: '纽约 (UTC-5/-4)', offset: -5 },
  { value: 'America/Los_Angeles', label: '洛杉矶 (UTC-8/-7)', offset: -8 },
  { value: 'America/Chicago', label: '芝加哥 (UTC-6/-5)', offset: -6 },
  { value: 'America/Sao_Paulo', label: '圣保罗 (UTC-3)', offset: -3 },
  { value: 'Australia/Sydney', label: '悉尼 (UTC+10/+11)', offset: 10 },
  { value: 'Pacific/Auckland', label: '奥克兰 (UTC+12/+13)', offset: 12 },
  { value: 'UTC', label: 'UTC', offset: 0 },
]

// ==================== Cron 解析 ====================
const CRON_MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']
const CRON_DAYS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function parseCronField(field, min, max) {
  if (field === '*') return { type: 'every', values: [] }
  
  if (field.includes('/')) {
    const [base, step] = field.split('/')
    if (base === '*') {
      return { type: 'step', values: Array.from({ length: Math.floor((max - min) / parseInt(step)) + 1 }, (_, i) => min + i * parseInt(step)) }
    }
    return { type: 'step', values: [parseInt(base), parseInt(step)] }
  }
  
  if (field.includes('-')) {
    const [start, end] = field.split('-').map(Number)
    return { type: 'range', values: Array.from({ length: end - start + 1 }, (_, i) => start + i) }
  }
  
  if (field.includes(',')) {
    return { type: 'list', values: field.split(',').map(Number) }
  }
  
  return { type: 'exact', values: [parseInt(field)] }
}

function describeCronField(field, type) {
  const parsed = parseCronField(field, 0, 59)
  
  if (parsed.type === 'every') return '每' + type
  if (parsed.type === 'exact') return parsed.values[0] + (type === '月' ? `月 (${CRON_MONTHS[parsed.values[0] - 1]})` : type)
  if (parsed.type === 'range') return `${parsed.values[0]}-${parsed.values[parsed.values.length - 1]} ${type}`
  if (parsed.type === 'list') return parsed.values.join(', ') + ' ' + type
  if (parsed.type === 'step') return `每 ${parsed.values[1] || 1} ${type}`
  
  return field
}

export function parseCron(expression, count = 5) {
  try {
    const parts = expression.trim().split(/\s+/)
    if (parts.length < 5) {
      return { ok: false, error: 'Cron 表达式至少需要 5 个字段' }
    }
    
    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts
    
    const fields = {
      minute,
      hour,
      dayOfMonth,
      month,
      dayOfWeek,
    }
    
    // 生成描述
    const minuteDesc = describeCronField(minute, '分钟')
    const hourDesc = describeCronField(hour, '小时')
    const dayDesc = describeCronField(dayOfMonth, '日')
    const monthDesc = describeCronField(month, '月')
    const weekDesc = describeCronField(dayOfWeek, '周')
    
    let description = `${minuteDesc} ${hourDesc} ${dayDesc} ${monthDesc} ${weekDesc}`
    
    // 计算下次执行时间
    const nextDates = []
    let current = new Date()
    current.setSeconds(0)
    current.setMilliseconds(0)
    
    // 简化的下次执行时间计算
    const minuteValues = parseCronField(minute, 0, 59)
    const hourValues = parseCronField(hour, 0, 23)
    const dayValues = parseCronField(dayOfMonth, 1, 31)
    
    for (let i = 0; i < 1000 && nextDates.length < count; i++) {
      current = new Date(current.getTime() + 60000) // 加一分钟
      
      const m = current.getMinutes()
      const h = current.getHours()
      const d = current.getDate()
      const mon = current.getMonth() + 1
      const dow = current.getDay()
      
      const matchMinute = minuteValues.type === 'every' || minuteValues.values.includes(m)
      const matchHour = hourValues.type === 'every' || hourValues.values.includes(h)
      const matchDay = dayValues.type === 'every' || dayValues.values.includes(d)
      const matchMonth = parseCronField(month, 1, 12).type === 'every' || parseCronField(month, 1, 12).values.includes(mon)
      const matchDow = parseCronField(dayOfWeek, 0, 6).type === 'every' || parseCronField(dayOfWeek, 0, 6).values.includes(dow)
      
      if (matchMinute && matchHour && matchDay && matchMonth && matchDow) {
        nextDates.push(new Date(current))
      }
    }
    
    return { ok: true, value: { expression, description, fields, nextDates } }
  } catch (e) {
    return { ok: false, error: '无效的 Cron 表达式: ' + e.message }
  }
}

// ==================== JSON 工具 ====================
export function formatJson(input, indent = 2) {
  try {
    const parsed = JSON.parse(input)
    return { ok: true, value: JSON.stringify(parsed, null, indent) }
  } catch (e) {
    return { ok: false, error: 'JSON 格式错误: ' + e.message }
  }
}

export function minifyJson(input) {
  try {
    const parsed = JSON.parse(input)
    return { ok: true, value: JSON.stringify(parsed) }
  } catch (e) {
    return { ok: false, error: 'JSON 格式错误: ' + e.message }
  }
}

// ==================== 文本工具 ====================
export function countTextStats(text) {
  const chars = text.length
  const charsNoSpace = text.replace(/\s/g, '').length
  const words = text.trim().split(/\s+/).filter(Boolean).length
  const lines = text.split('\n').length
  const bytes = new TextEncoder().encode(text).length
  
  return { chars, charsNoSpace, words, lines, bytes }
}

export function textCaseConvert(text, mode) {
  switch (mode) {
    case 'upper': return text.toUpperCase()
    case 'lower': return text.toLowerCase()
    case 'title': return text.replace(/\w\S*/g, t => t.charAt(0).toUpperCase() + t.substr(1).toLowerCase())
    case 'sentence': return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    case 'camel': return text.replace(/[-_\s](\w)/g, (_, c) => c.toUpperCase())
    case 'pascal': return text.replace(/[-_\s](\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, c => c.toUpperCase())
    case 'snake': return text.replace(/[-\s]/g, '_').replace(/([A-Z])/g, '_$1').toLowerCase().replace(/_+/g, '_')
    case 'kebab': return text.replace(/[_\s]/g, '-').replace(/([A-Z])/g, '-$1').toLowerCase().replace(/-+/g, '-')
    case 'constant': return text.replace(/[-\s]/g, '_').replace(/([A-Z])/g, '_$1').toUpperCase().replace(/_+/g, '_')
    default: return text
  }
}

// ==================== 进制转换 ====================
export function convertBase(num, fromBase, toBase) {
  try {
    const decimal = parseInt(num, fromBase)
    if (isNaN(decimal)) return { ok: false, error: '无效数字' }
    return { ok: true, value: decimal.toString(toBase) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

const DIGITS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// 扩展进制转换 - 支持小数
export function convertToDecimal(value, fromBase) {
  if (!value || fromBase < 2 || fromBase > 36) return NaN
  
  const isNegative = value.startsWith('-')
  const cleanValue = isNegative ? value.slice(1) : value
  const parts = cleanValue.split('.')
  
  let integerPart = 0
  let fractionalPart = 0
  
  const integerStr = parts[0] || '0'
  for (let i = 0; i < integerStr.length; i++) {
    const char = integerStr[i].toUpperCase()
    const digitValue = DIGITS.indexOf(char)
    if (digitValue === -1 || digitValue >= fromBase) return NaN
    integerPart = integerPart * fromBase + digitValue
  }
  
  if (parts[1]) {
    for (let i = 0; i < parts[1].length; i++) {
      const char = parts[1][i].toUpperCase()
      const digitValue = DIGITS.indexOf(char)
      if (digitValue === -1 || digitValue >= fromBase) return NaN
      fractionalPart += digitValue / Math.pow(fromBase, i + 1)
    }
  }
  
  const result = integerPart + fractionalPart
  return isNegative ? -result : result
}

export function convertFromDecimal(decimal, toBase, precision = 10) {
  if (isNaN(decimal)) return 'NaN'
  if (!isFinite(decimal)) return decimal > 0 ? 'Infinity' : '-Infinity'
  if (decimal === 0) return '0'
  
  const isNegative = decimal < 0
  const value = Math.abs(decimal)
  
  const integerPart = Math.floor(value)
  const fractionalPart = value - integerPart
  
  let integerStr = ''
  let remaining = integerPart
  
  if (remaining === 0) {
    integerStr = '0'
  } else {
    while (remaining > 0) {
      integerStr = DIGITS[remaining % toBase] + integerStr
      remaining = Math.floor(remaining / toBase)
    }
  }
  
  let fractionalStr = ''
  let frac = fractionalPart
  for (let i = 0; i < precision && frac > 0; i++) {
    frac *= toBase
    const digit = Math.floor(frac)
    fractionalStr += DIGITS[digit]
    frac -= digit
  }
  
  let result = integerStr
  if (fractionalStr) {
    result += '.' + fractionalStr
  }
  
  return isNegative ? '-' + result : result
}

export function convertBaseExt(value, fromBase, toBase, precision = 10) {
  const decimal = convertToDecimal(value, fromBase)
  return convertFromDecimal(decimal, toBase, precision)
}

// ==================== GCD/LCM ====================
export function gcd(a, b) {
  a = Math.abs(Math.round(a))
  b = Math.abs(Math.round(b))
  while (b) {
    const t = b
    b = a % b
    a = t
  }
  return a
}

export function gcdMultiple(numbers) {
  if (numbers.length === 0) return 0
  if (numbers.length === 1) return Math.abs(numbers[0])
  return numbers.reduce((acc, num) => gcd(acc, num))
}

export function lcm(a, b) {
  if (a === 0 || b === 0) return 0
  return Math.abs(a * b) / gcd(a, b)
}

export function lcmMultiple(numbers) {
  if (numbers.length === 0) return 0
  if (numbers.length === 1) return Math.abs(numbers[0])
  return numbers.reduce((acc, num) => lcm(acc, num))
}

export function primeFactors(n) {
  const factors = new Map()
  let num = Math.abs(n)
  
  for (let i = 2; i <= Math.sqrt(num); i++) {
    while (num % i === 0) {
      factors.set(i, (factors.get(i) || 0) + 1)
      num /= i
    }
  }
  
  if (num > 1) {
    factors.set(num, (factors.get(num) || 0) + 1)
  }
  
  return factors
}

// ==================== 质数检测 ====================
export function isPrime(n) {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) return false
  }
  return true
}

export function primeFactorsArray(n) {
  const factors = []
  let num = Math.abs(n)
  
  for (let i = 2; i <= Math.sqrt(num); i++) {
    while (num % i === 0) {
      factors.push(i)
      num /= i
    }
  }
  
  if (num > 1) {
    factors.push(num)
  }
  
  return factors
}

export function generatePrimes(start, count) {
  const primes = []
  let current = Math.max(2, start)
  
  while (primes.length < count && current < Number.MAX_SAFE_INTEGER) {
    if (isPrime(current)) {
      primes.push(current)
    }
    current++
  }
  
  return primes
}

export function findPreviousPrime(n) {
  for (let i = n - 1; i >= 2; i--) {
    if (isPrime(i)) return i
  }
  return null
}

export function findNextPrime(n) {
  let current = n + 1
  while (!isPrime(current)) {
    current++
  }
  return current
}

export function formatPrimeFactors(factors) {
  if (factors.length === 0) return '1'
  
  const counts = new Map()
  for (const f of factors) {
    counts.set(f, (counts.get(f) || 0) + 1)
  }
  
  return Array.from(counts.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([prime, exp]) => exp > 1 ? `${prime}^${exp}` : `${prime}`)
    .join(' × ')
}

// ==================== 罗马数字 ====================
const ROMAN_NUMERALS = [
  ['M', 1000],
  ['CM', 900],
  ['D', 500],
  ['CD', 400],
  ['C', 100],
  ['XC', 90],
  ['L', 50],
  ['XL', 40],
  ['X', 10],
  ['IX', 9],
  ['V', 5],
  ['IV', 4],
  ['I', 1],
]

export function toRoman(num) {
  if (num < 1 || num > 3999999) return '超出范围'
  
  let result = ''
  let remaining = num
  
  for (const [symbol, value] of ROMAN_NUMERALS) {
    while (remaining >= value) {
      result += symbol
      remaining -= value
    }
  }
  
  return result || 'N'
}

export function fromRoman(roman) {
  const romanUpper = roman.toUpperCase()
  const romanMap = new Map(ROMAN_NUMERALS)
  let result = 0
  
  for (let i = 0; i < romanUpper.length; i++) {
    const currentVal = romanMap.get(romanUpper[i])
    if (!currentVal) return null
    
    const nextVal = i + 1 < romanUpper.length ? romanMap.get(romanUpper[i + 1]) : 0
    
    if (nextVal && currentVal < nextVal) {
      return null
    }
    
    result += currentVal
  }
  
  return result
}

// ==================== 数字单位换算 ====================
export const UNIT_CATEGORIES = {
  length: {
    label: '长度',
    baseUnit: 'm',
    units: {
      km: { name: '千米', symbol: 'km', toBase: 1000 },
      m: { name: '米', symbol: 'm', toBase: 1 },
      cm: { name: '厘米', symbol: 'cm', toBase: 0.01 },
      mm: { name: '毫米', symbol: 'mm', toBase: 0.001 },
      mi: { name: '英里', symbol: 'mi', toBase: 1609.344 },
      yd: { name: '码', symbol: 'yd', toBase: 0.9144 },
      ft: { name: '英尺', symbol: 'ft', toBase: 0.3048 },
      in: { name: '英寸', symbol: 'in', toBase: 0.0254 },
      nm: { name: '海里', symbol: 'nm', toBase: 1852 },
    },
  },
  weight: {
    label: '重量',
    baseUnit: 'kg',
    units: {
      t: { name: '吨', symbol: 't', toBase: 1000 },
      kg: { name: '千克', symbol: 'kg', toBase: 1 },
      g: { name: '克', symbol: 'g', toBase: 0.001 },
      mg: { name: '毫克', symbol: 'mg', toBase: 0.000001 },
      lb: { name: '磅', symbol: 'lb', toBase: 0.453592 },
      oz: { name: '盎司', symbol: 'oz', toBase: 0.0283495 },
      jin: { name: '斤', symbol: '斤', toBase: 0.5 },
      liang: { name: '两', symbol: '两', toBase: 0.05 },
    },
  },
  temperature: {
    label: '温度',
    baseUnit: 'c',
    units: {
      c: { name: '摄氏度', symbol: '°C', toBase: 1 },
      f: { name: '华氏度', symbol: '°F', toBase: 1 },
      k: { name: '开尔文', symbol: 'K', toBase: 1 },
    },
  },
  speed: {
    label: '速度',
    baseUnit: 'm/s',
    units: {
      'm/s': { name: '米/秒', symbol: 'm/s', toBase: 1 },
      'km/h': { name: '千米/时', symbol: 'km/h', toBase: 0.277778 },
      mph: { name: '英里/时', symbol: 'mph', toBase: 0.44704 },
      kn: { name: '节', symbol: 'kn', toBase: 0.514444 },
      'ft/s': { name: '英尺/秒', symbol: 'ft/s', toBase: 0.3048 },
      mach: { name: '马赫', symbol: 'Ma', toBase: 340.29 },
    },
  },
  area: {
    label: '面积',
    baseUnit: 'm2',
    units: {
      km2: { name: '平方千米', symbol: 'km²', toBase: 1000000 },
      m2: { name: '平方米', symbol: 'm²', toBase: 1 },
      cm2: { name: '平方厘米', symbol: 'cm²', toBase: 0.0001 },
      ha: { name: '公顷', symbol: 'ha', toBase: 10000 },
      acre: { name: '英亩', symbol: 'acre', toBase: 4046.86 },
      ft2: { name: '平方英尺', symbol: 'ft²', toBase: 0.092903 },
      mu: { name: '亩', symbol: '亩', toBase: 666.667 },
    },
  },
  volume: {
    label: '体积',
    baseUnit: 'L',
    units: {
      m3: { name: '立方米', symbol: 'm³', toBase: 1000 },
      L: { name: '升', symbol: 'L', toBase: 1 },
      mL: { name: '毫升', symbol: 'mL', toBase: 0.001 },
      gal: { name: '加仑(美)', symbol: 'gal', toBase: 3.78541 },
      qt: { name: '夸脱', symbol: 'qt', toBase: 0.946353 },
      pt: { name: '品脱', symbol: 'pt', toBase: 0.473176 },
      cup: { name: '杯', symbol: 'cup', toBase: 0.236588 },
    },
  },
  time: {
    label: '时间',
    baseUnit: 's',
    units: {
      y: { name: '年', symbol: 'y', toBase: 31536000 },
      mo: { name: '月', symbol: 'mo', toBase: 2592000 },
      w: { name: '周', symbol: 'w', toBase: 604800 },
      d: { name: '天', symbol: 'd', toBase: 86400 },
      h: { name: '小时', symbol: 'h', toBase: 3600 },
      min: { name: '分钟', symbol: 'min', toBase: 60 },
      s: { name: '秒', symbol: 's', toBase: 1 },
      ms: { name: '毫秒', symbol: 'ms', toBase: 0.001 },
    },
  },
  pressure: {
    label: '压力',
    baseUnit: 'Pa',
    units: {
      Pa: { name: '帕斯卡', symbol: 'Pa', toBase: 1 },
      kPa: { name: '千帕', symbol: 'kPa', toBase: 1000 },
      MPa: { name: '兆帕', symbol: 'MPa', toBase: 1000000 },
      bar: { name: '巴', symbol: 'bar', toBase: 100000 },
      psi: { name: '磅/平方英寸', symbol: 'psi', toBase: 6894.76 },
      atm: { name: '标准大气压', symbol: 'atm', toBase: 101325 },
      mmHg: { name: '毫米汞柱', symbol: 'mmHg', toBase: 133.322 },
    },
  },
}

export function convertTemperature(value, from, to) {
  let celsius
  
  switch (from) {
    case 'c': celsius = value; break
    case 'f': celsius = (value - 32) * 5 / 9; break
    case 'k': celsius = value - 273.15; break
    default: return NaN
  }
  
  switch (to) {
    case 'c': return celsius
    case 'f': return celsius * 9 / 5 + 32
    case 'k': return celsius + 273.15
    default: return NaN
  }
}

export function convertUnit(value, from, to, category) {
  if (category === 'temperature') {
    return convertTemperature(value, from, to)
  }
  
  const cat = UNIT_CATEGORIES[category]
  const fromUnit = cat.units[from]
  const toUnit = cat.units[to]
  
  if (!fromUnit || !toUnit) return NaN
  
  const baseValue = value * fromUnit.toBase
  return baseValue / toUnit.toBase
}

export function formatUnitNumber(num) {
  if (isNaN(num) || !isFinite(num)) return '-'
  
  if (Math.abs(num) < 0.000001 || Math.abs(num) > 1e12) {
    return num.toExponential(6)
  }
  
  if (Number.isInteger(num)) {
    return num.toLocaleString()
  }
  
  const str = num.toPrecision(10)
  return parseFloat(str).toLocaleString(undefined, { maximumFractionDigits: 10 })
}

// ==================== 数据存储换算 ====================
export const STORAGE_UNITS = [
  { name: 'Bit', symbol: 'b', siBase: 0.125, binaryBase: 0.125 },
  { name: 'Byte', symbol: 'B', siBase: 1, binaryBase: 1 },
  { name: 'Kilobyte', symbol: 'KB', siBase: 1000, binaryBase: 1024 },
  { name: 'Megabyte', symbol: 'MB', siBase: 1000000, binaryBase: 1048576 },
  { name: 'Gigabyte', symbol: 'GB', siBase: 1000000000, binaryBase: 1073741824 },
  { name: 'Terabyte', symbol: 'TB', siBase: 1000000000000, binaryBase: 1099511627776 },
  { name: 'Petabyte', symbol: 'PB', siBase: 1000000000000000, binaryBase: 1125899906842624 },
  { name: 'Exabyte', symbol: 'EB', siBase: 1e18, binaryBase: 1152921504606847000 },
]

export function convertStorage(value, fromUnit, toUnit, system = 'binary') {
  const from = STORAGE_UNITS.find(u => u.symbol === fromUnit)
  const to = STORAGE_UNITS.find(u => u.symbol === toUnit)
  
  if (!from || !to) return NaN
  
  const fromBase = system === 'si' ? from.siBase : from.binaryBase
  const toBase = system === 'si' ? to.siBase : to.binaryBase
  
  const bytes = value * fromBase
  return bytes / toBase
}

export function findBestStorageUnit(bytes, system = 'binary') {
  const units = STORAGE_UNITS.slice(1).reverse()
  
  for (const unit of units) {
    const base = system === 'si' ? unit.siBase : unit.binaryBase
    if (bytes >= base) {
      return { value: bytes / base, unit }
    }
  }
  
  return { value: bytes, unit: STORAGE_UNITS[1] }
}

export function formatStorageNumber(num) {
  if (isNaN(num) || !isFinite(num)) return '-'
  
  if (Math.abs(num) < 0.000001) {
    return num.toExponential(4)
  }
  
  if (Math.abs(num) >= 1e15) {
    return num.toExponential(4)
  }
  
  if (Number.isInteger(num)) {
    return num.toLocaleString()
  }
  
  const str = num.toPrecision(8)
  return parseFloat(str).toLocaleString(undefined, { maximumFractionDigits: 8 })
}

// ==================== IEEE 754 浮点数 ====================
export function floatToBinary(num, precision = 'double') {
  if (isNaN(num)) {
    if (precision === 'single') {
      return {
        sign: '0',
        exponent: '11111111',
        mantissa: '00000000000000000000001',
        signValue: 0,
        exponentValue: 255,
        exponentBias: 127,
        mantissaValue: 1,
        actualExponent: 0,
        isDenormalized: false,
        isInfinity: false,
        isNaN: true,
        decimalValue: NaN,
        hexValue: '0x7FC00000',
      }
    } else {
      return {
        sign: '0',
        exponent: '11111111111',
        mantissa: '0000000000000000000000000000000000000000000000000001',
        signValue: 0,
        exponentValue: 2047,
        exponentBias: 1023,
        mantissaValue: 1,
        actualExponent: 0,
        isDenormalized: false,
        isInfinity: false,
        isNaN: true,
        decimalValue: NaN,
        hexValue: '0x7FF8000000000001',
      }
    }
  }

  if (!isFinite(num)) {
    const sign = num < 0 ? 1 : 0
    if (precision === 'single') {
      return {
        sign: sign.toString(),
        exponent: '11111111',
        mantissa: '00000000000000000000000',
        signValue: sign,
        exponentValue: 255,
        exponentBias: 127,
        mantissaValue: 0,
        actualExponent: 0,
        isDenormalized: false,
        isInfinity: true,
        isNaN: false,
        decimalValue: num,
        hexValue: sign === 0 ? '0x7F800000' : '0xFF800000',
      }
    } else {
      return {
        sign: sign.toString(),
        exponent: '11111111111',
        mantissa: '0000000000000000000000000000000000000000000000000000',
        signValue: sign,
        exponentValue: 2047,
        exponentBias: 1023,
        mantissaValue: 0,
        actualExponent: 0,
        isDenormalized: false,
        isInfinity: false,
        isNaN: false,
        decimalValue: num,
        hexValue: sign === 0 ? '0x7FF0000000000000' : '0xFFF0000000000000',
      }
    }
  }

  const buffer = new ArrayBuffer(8)
  const view = new DataView(buffer)

  if (precision === 'single') {
    view.setFloat32(0, num, false)
    const bits = view.getUint32(0, false)
    const sign = (bits >>> 31) & 1
    const exponent = (bits >>> 23) & 0xFF
    const mantissa = bits & 0x7FFFFF

    const signStr = sign.toString()
    const expStr = exponent.toString(2).padStart(8, '0')
    const mantStr = mantissa.toString(2).padStart(23, '0')

    const isDenormalized = exponent === 0
    const actualExp = isDenormalized ? -126 : exponent - 127

    return {
      sign: signStr,
      exponent: expStr,
      mantissa: mantStr,
      signValue: sign,
      exponentValue: exponent,
      exponentBias: 127,
      mantissaValue: mantissa,
      actualExponent: actualExp,
      isDenormalized,
      isInfinity: false,
      isNaN: false,
      decimalValue: num,
      hexValue: '0x' + bits.toString(16).toUpperCase().padStart(8, '0'),
    }
  } else {
    view.setFloat64(0, num, false)
    const highBits = view.getUint32(0, false)
    const lowBits = view.getUint32(4, false)

    const sign = (highBits >>> 31) & 1
    const exponent = (highBits >>> 20) & 0x7FF
    const mantissaHigh = highBits & 0xFFFFF
    const mantissa = (BigInt(mantissaHigh) << 32n) | BigInt(lowBits)

    const signStr = sign.toString()
    const expStr = exponent.toString(2).padStart(11, '0')
    const mantStr = mantissa.toString(2).padStart(52, '0')

    const isDenormalized = exponent === 0
    const actualExp = isDenormalized ? -1022 : exponent - 1023

    const hexValue = '0x' + 
      highBits.toString(16).toUpperCase().padStart(8, '0') +
      lowBits.toString(16).toUpperCase().padStart(8, '0')

    return {
      sign: signStr,
      exponent: expStr,
      mantissa: mantStr,
      signValue: sign,
      exponentValue: exponent,
      exponentBias: 1023,
      mantissaValue: Number(mantissa),
      actualExponent: actualExp,
      isDenormalized,
      isInfinity: false,
      isNaN: false,
      decimalValue: num,
      hexValue,
    }
  }
}

export function binaryToFloat(sign, exponent, mantissa, precision = 'double') {
  try {
    const signBit = parseInt(sign, 2)
    const expBits = parseInt(exponent, 2)
    const mantBits = parseInt(mantissa, 2)

    const buffer = new ArrayBuffer(8)
    const view = new DataView(buffer)

    if (precision === 'single') {
      const bits = (signBit << 31) | (expBits << 23) | mantBits
      view.setUint32(0, bits, false)
      return view.getFloat32(0, false)
    } else {
      const highBits = (signBit << 31) | (expBits << 20) | (mantBits >>> 32)
      const lowBits = mantBits & 0xFFFFFFFF
      view.setUint32(0, highBits, false)
      view.setUint32(4, lowBits, false)
      return view.getFloat64(0, false)
    }
  } catch {
    return null
  }
}

// ==================== 宽高比 ====================
export const COMMON_RESOLUTIONS = [
  { name: 'HD', width: 1280, height: 720, category: '16:9' },
  { name: 'Full HD', width: 1920, height: 1080, category: '16:9' },
  { name: '2K', width: 2560, height: 1440, category: '16:9' },
  { name: '4K UHD', width: 3840, height: 2160, category: '16:9' },
  { name: '8K UHD', width: 7680, height: 4320, category: '16:9' },
  { name: 'SVGA', width: 800, height: 600, category: '4:3' },
  { name: 'XGA', width: 1024, height: 768, category: '4:3' },
  { name: 'SXGA', width: 1280, height: 1024, category: '5:4' },
  { name: 'UXGA', width: 1600, height: 1200, category: '4:3' },
  { name: 'iPhone 14', width: 1170, height: 2532, category: '9:19.5' },
  { name: 'iPhone 14 Pro', width: 1179, height: 2556, category: '9:19.5' },
  { name: 'iPhone SE', width: 750, height: 1334, category: '9:16' },
  { name: 'iPad Pro 11"', width: 1668, height: 2388, category: '3:4' },
  { name: 'iPad Pro 12.9"', width: 2048, height: 2732, category: '3:4' },
  { name: 'Android HD', width: 720, height: 1280, category: '9:16' },
  { name: 'Android FHD', width: 1080, height: 1920, category: '9:16' },
  { name: 'Android QHD', width: 1440, height: 2560, category: '9:16' },
  { name: 'Square', width: 1080, height: 1080, category: '1:1' },
  { name: 'Instagram Post', width: 1080, height: 1350, category: '4:5' },
  { name: 'Instagram Story', width: 1080, height: 1920, category: '9:16' },
  { name: 'YouTube Thumbnail', width: 1280, height: 720, category: '16:9' },
  { name: 'Twitter Header', width: 1500, height: 500, category: '3:1' },
  { name: 'Facebook Cover', width: 820, height: 312, category: '2.6:1' },
  { name: 'LinkedIn Banner', width: 1584, height: 396, category: '4:1' },
  { name: 'A4 300dpi', width: 2480, height: 3508, category: '1:1.41' },
  { name: 'A3 300dpi', width: 3508, height: 4961, category: '1:1.41' },
  { name: 'Letter 300dpi', width: 2550, height: 3300, category: '1:1.29' },
]

export function simplifyRatio(width, height) {
  const divisor = gcd(width, height)
  return {
    w: Math.round(width / divisor),
    h: Math.round(height / divisor),
  }
}

export function getResolutionsForRatio(ratioW, ratioH) {
  const targetRatio = ratioW / ratioH
  const results = []
  
  const heights = [480, 720, 1080, 1440, 2160, 4320]
  for (const h of heights) {
    const w = Math.round(h * targetRatio)
    results.push({ width: w, height: h })
  }
  
  return results
}

export function findMatchingResolutions(width, height) {
  const targetRatio = width / height
  return COMMON_RESOLUTIONS.filter(res => {
    const resRatio = res.width / res.height
    return Math.abs(resRatio - targetRatio) < 0.01
  })
}

// ==================== ASCII 表 ====================
export function getAsciiTable() {
  const table = []
  const descriptions = {
    0: 'NULL', 1: 'SOH', 2: 'STX', 3: 'ETX', 4: 'EOT', 5: 'ENQ', 6: 'ACK', 7: 'BEL',
    8: 'BS', 9: 'HT', 10: 'LF', 11: 'VT', 12: 'FF', 13: 'CR', 14: 'SO', 15: 'SI',
    16: 'DLE', 17: 'DC1', 18: 'DC2', 19: 'DC3', 20: 'DC4', 21: 'NAK', 22: 'SYN', 23: 'ETB',
    24: 'CAN', 25: 'EM', 26: 'SUB', 27: 'ESC', 28: 'FS', 29: 'GS', 30: 'RS', 31: 'US',
    32: 'Space', 127: 'DEL',
  }

  for (let i = 0; i <= 127; i++) {
    table.push({
      code: i,
      char: i >= 32 && i !== 127 ? String.fromCharCode(i) : '',
      description: descriptions[i] || '',
      htmlEntity: i < 32 ? '' : `&#${i};`,
      hex: `0x${i.toString(16).toUpperCase().padStart(2, '0')}`,
    })
  }
  return table
}

// ==================== 颜色工具 ====================
// 解析 HEX 颜色
export function parseHex(hex) {
  try {
    let h = hex.replace('#', '')
    if (h.length === 3) {
      h = h.split('').map(c => c + c).join('')
    }
    if (h.length !== 6) {
      return { ok: false, error: '无效的 hex 颜色' }
    }
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return { ok: true, value: { r, g, b } }
  } catch {
    return { ok: false, error: '无效的 hex 颜色' }
  }
}

// RGB 转 HEX
export function rgbToHex(rgb) {
  const toHex = (n) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0')
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`
}

// RGB 转 HSL
export function rgbToHsl(rgb) {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const l = (max + min) / 2

  if (max === min) {
    return { h: 0, s: 0, l: Math.round(l * 100) }
  }

  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

  let h = 0
  switch (max) {
    case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
    case g: h = ((b - r) / d + 2) / 6; break
    case b: h = ((r - g) / d + 4) / 6; break
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

// HSL 转 RGB
export function hslToRgb(hsl) {
  const h = hsl.h / 360
  const s = hsl.s / 100
  const l = hsl.l / 100

  let r, g, b

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1/6) return p + (q - p) * 6 * t
      if (t < 1/2) return q
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1/3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1/3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  }
}

// RGB 转 HSV
export function rgbToHsv(rgb) {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min

  const v = max
  const s = max === 0 ? 0 : d / max

  let h = 0
  if (max !== min) {
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
}

// RGB 转 CMYK
export function rgbToCmyk(rgb) {
  const r = rgb.r / 255
  const g = rgb.g / 255
  const b = rgb.b / 255

  const k = 1 - Math.max(r, g, b)

  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 }
  }

  const c = (1 - r - k) / (1 - k)
  const m = (1 - g - k) / (1 - k)
  const y = (1 - b - k) / (1 - k)

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  }
}

// 颜色转换
export function convertColor(hex) {
  const rgbResult = parseHex(hex)
  if (!rgbResult.ok) return rgbResult

  const rgb = rgbResult.value
  return {
    ok: true,
    value: {
      hex: rgbToHex(rgb),
      rgb,
      hsl: rgbToHsl(rgb),
      hsv: rgbToHsv(rgb),
      cmyk: rgbToCmyk(rgb),
    }
  }
}

// 生成调色板
export function generateColorPalette(baseColor, scheme) {
  const rgb = parseHex(baseColor)
  if (!rgb.ok) return []

  const hsl = rgbToHsl(rgb.value)
  const colors = []

  switch (scheme) {
    case 'analogous':
      colors.push(
        rgbToHex(hslToRgb({ h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l })),
        baseColor,
        rgbToHex(hslToRgb({ h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l }))
      )
      break
    case 'complementary':
      colors.push(
        baseColor,
        rgbToHex(hslToRgb({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l }))
      )
      break
    case 'triadic':
      colors.push(
        baseColor,
        rgbToHex(hslToRgb({ h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l })),
        rgbToHex(hslToRgb({ h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l }))
      )
      break
    case 'tetradic':
      colors.push(
        baseColor,
        rgbToHex(hslToRgb({ h: (hsl.h + 90) % 360, s: hsl.s, l: hsl.l })),
        rgbToHex(hslToRgb({ h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l })),
        rgbToHex(hslToRgb({ h: (hsl.h + 270) % 360, s: hsl.s, l: hsl.l }))
      )
      break
    case 'split-complementary':
      colors.push(
        baseColor,
        rgbToHex(hslToRgb({ h: (hsl.h + 150) % 360, s: hsl.s, l: hsl.l })),
        rgbToHex(hslToRgb({ h: (hsl.h + 210) % 360, s: hsl.s, l: hsl.l }))
      )
      break
    case 'monochromatic':
      const lValues = [20, 35, 50, 65, 80]
      lValues.forEach(lv => {
        colors.push(rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l: Math.min(100, Math.max(0, lv)) })))
      })
      break
    case 'shades':
      const steps = 10
      for (let i = 0; i < steps; i++) {
        const l = Math.max(0, Math.min(100, hsl.l + (i - steps/2) * 10))
        colors.push(rgbToHex(hslToRgb({ h: hsl.h, s: hsl.s, l })))
      }
      break
    default:
      colors.push(baseColor)
  }

  return colors
}

// 计算亮度
function getLuminance(rgb) {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// 计算对比度
export function getContrastRatio(foreground, background) {
  const fgRgb = parseHex(foreground)
  const bgRgb = parseHex(background)

  if (!fgRgb.ok) return { ok: false, error: '无效的前景色' }
  if (!bgRgb.ok) return { ok: false, error: '无效的背景色' }

  const fgLum = getLuminance(fgRgb.value)
  const bgLum = getLuminance(bgRgb.value)

  const lighter = Math.max(fgLum, bgLum)
  const darker = Math.min(fgLum, bgLum)

  const ratio = (lighter + 0.05) / (darker + 0.05)
  return { ok: true, value: ratio }
}

// 检查对比度等级
export function checkContrast(foreground, background) {
  const ratioResult = getContrastRatio(foreground, background)
  if (!ratioResult.ok) return ratioResult

  const ratio = ratioResult.value

  return {
    ok: true,
    value: {
      ratio,
      aaNormal: ratio >= 4.5,
      aaLarge: ratio >= 3,
      aaaNormal: ratio >= 7,
      aaaLarge: ratio >= 4.5,
    },
  }
}

// 色盲模拟
export function simulateColorBlindness(hex, type) {
  const rgbResult = parseHex(hex)
  if (!rgbResult.ok) return hex

  const { r, g, b } = rgbResult.value

  const matrices = {
    protanopia: [[0.567, 0.433, 0], [0.558, 0.442, 0], [0, 0.242, 0.758]],
    deuteranopia: [[0.625, 0.375, 0], [0.7, 0.3, 0], [0, 0.3, 0.7]],
    tritanopia: [[0.95, 0.05, 0], [0, 0.433, 0.567], [0, 0.475, 0.525]],
    protanomaly: [[0.817, 0.183, 0], [0.333, 0.667, 0], [0, 0.125, 0.875]],
    deuteranomaly: [[0.8, 0.2, 0], [0.258, 0.742, 0], [0, 0.142, 0.858]],
    tritanomaly: [[0.967, 0.033, 0], [0, 0.733, 0.267], [0, 0.183, 0.817]],
    achromatopsia: [[0.299, 0.587, 0.114], [0.299, 0.587, 0.114], [0.299, 0.587, 0.114]],
    achromatomaly: [[0.618, 0.32, 0.062], [0.163, 0.775, 0.062], [0.163, 0.32, 0.516]],
  }

  const matrix = matrices[type]
  if (!matrix) return hex

  const newR = Math.round(matrix[0][0] * r + matrix[0][1] * g + matrix[0][2] * b)
  const newG = Math.round(matrix[1][0] * r + matrix[1][1] * g + matrix[1][2] * b)
  const newB = Math.round(matrix[2][0] * r + matrix[2][1] * g + matrix[2][2] * b)

  return rgbToHex({ r: Math.min(255, Math.max(0, newR)), g: Math.min(255, Math.max(0, newG)), b: Math.min(255, Math.max(0, newB)) })
}

// CSS 渐变生成
export function generateCssGradient(config) {
  const stopsStr = config.stops
    .map(s => `${s.color} ${s.position}%`)
    .join(', ')

  switch (config.type) {
    case 'linear':
      return `linear-gradient(${config.angle}deg, ${stopsStr})`
    case 'radial':
      return `radial-gradient(circle, ${stopsStr})`
    case 'conic':
      return `conic-gradient(from ${config.angle}deg, ${stopsStr})`
    default:
      return `linear-gradient(${stopsStr})`
  }
}

// CSS clip-path 生成
export function generateClipPath(config) {
  switch (config.type) {
    case 'polygon':
      const points = config.polygon.map(p => `${p.x}% ${p.y}%`).join(', ')
      return `polygon(${points})`
    case 'circle':
      return `circle(${config.radius}% at ${config.cx}% ${config.cy}%)`
    case 'ellipse':
      return `ellipse(${config.rx}% ${config.ry}% at ${config.cx}% ${config.cy}%)`
    case 'inset':
      const { top, right, bottom, left, borderRadius } = config
      if (borderRadius > 0) {
        return `inset(${top}% ${right}% ${bottom}% ${left}% round ${borderRadius}px)`
      }
      return `inset(${top}% ${right}% ${bottom}% ${left}%)`
    default:
      return 'none'
  }
}

// Box Shadow 生成
export function generateBoxShadow(configs) {
  return configs
    .map(c => `${c.inset ? 'inset ' : ''}${c.x}px ${c.y}px ${c.blur}px ${c.spread}px ${c.color}`)
    .join(', ')
}

// Tailwind 颜色表
export const TAILWIND_COLORS = {
  slate: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
    400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
    800: '#1e293b', 900: '#0f172a', 950: '#020617',
  },
  gray: {
    50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db',
    400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151',
    800: '#1f2937', 900: '#111827', 950: '#030712',
  },
  zinc: {
    50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8',
    400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46',
    800: '#27272a', 900: '#18181b', 950: '#09090b',
  },
  red: {
    50: '#fef2f2', 100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5',
    400: '#f87171', 500: '#ef4444', 600: '#dc2626', 700: '#b91c1c',
    800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a',
  },
  orange: {
    50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
    400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
    800: '#9a3412', 900: '#7c2d12', 950: '#431407',
  },
  amber: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
    400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309',
    800: '#92400e', 900: '#78350f', 950: '#451a03',
  },
  yellow: {
    50: '#fefce8', 100: '#fef9c3', 200: '#fef08a', 300: '#fde047',
    400: '#facc15', 500: '#eab308', 600: '#ca8a04', 700: '#a16207',
    800: '#854d0e', 900: '#713f12', 950: '#422006',
  },
  lime: {
    50: '#f7fee7', 100: '#ecfccb', 200: '#d9f99d', 300: '#bef264',
    400: '#a3e635', 500: '#84cc16', 600: '#65a30d', 700: '#4d7c0f',
    800: '#3f6212', 900: '#365314', 950: '#1a2e05',
  },
  green: {
    50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
    400: '#4ade80', 500: '#22c55e', 600: '#16a34a', 700: '#15803d',
    800: '#166534', 900: '#14532d', 950: '#052e16',
  },
  emerald: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
    400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
    800: '#065f46', 900: '#064e3b', 950: '#022c22',
  },
  teal: {
    50: '#f0fdfa', 100: '#ccfbf1', 200: '#99f6e4', 300: '#5eead4',
    400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e',
    800: '#115e59', 900: '#134e4a', 950: '#042f2e',
  },
  cyan: {
    50: '#ecfeff', 100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9',
    400: '#22d3ee', 500: '#06b6d4', 600: '#0891b2', 700: '#0e7490',
    800: '#155e75', 900: '#164e63', 950: '#083344',
  },
  sky: {
    50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc',
    400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 700: '#0369a1',
    800: '#075985', 900: '#0c4a6e', 950: '#082f49',
  },
  blue: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
    400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
    800: '#1e40af', 900: '#1e3a8a', 950: '#172554',
  },
  indigo: {
    50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
    400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
    800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
  },
  violet: {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd',
    400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9',
    800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065',
  },
  purple: {
    50: '#faf5ff', 100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe',
    400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce',
    800: '#6b21a8', 900: '#581c87', 950: '#3b0764',
  },
  fuchsia: {
    50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc',
    400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf',
    800: '#86198f', 900: '#701a75', 950: '#4a044e',
  },
  pink: {
    50: '#fdf2f8', 100: '#fce7f3', 200: '#fbcfe8', 300: '#f9a8d4',
    400: '#f472b6', 500: '#ec4899', 600: '#db2777', 700: '#be185d',
    800: '#9d174d', 900: '#831843', 950: '#500724',
  },
  rose: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af',
    400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c',
    800: '#9f1239', 900: '#881337', 950: '#4c0519',
  },
}

// ==================== AES 加解密 ====================
async function deriveKey(password, salt) {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  )
  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

export async function aesEncrypt(plaintext, password) {
  try {
    const encoder = new TextEncoder()
    const salt = crypto.getRandomValues(new Uint8Array(16))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const key = await deriveKey(password, salt)
    
    const encrypted = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      encoder.encode(plaintext)
    )
    
    const combined = new Uint8Array(salt.length + iv.length + encrypted.byteLength)
    combined.set(salt, 0)
    combined.set(iv, salt.length)
    combined.set(new Uint8Array(encrypted), salt.length + iv.length)
    
    const base64 = btoa(String.fromCharCode(...combined))
    return { ok: true, value: base64 }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function aesDecrypt(ciphertext, password) {
  try {
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0))
    const salt = combined.slice(0, 16)
    const iv = combined.slice(16, 28)
    const data = combined.slice(28)
    
    const key = await deriveKey(password, salt)
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    )
    
    return { ok: true, value: new TextDecoder().decode(decrypted) }
  } catch (e) {
    return { ok: false, error: '解密失败: ' + e.message }
  }
}

// ==================== HMAC ====================
export async function hmacSha256(message, secret) {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
    const hex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return { ok: true, value: hex }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export async function hmacSha512(message, secret) {
  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
    const hex = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    return { ok: true, value: hex }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ==================== JWT 解析 ====================
export function parseJwt(token) {
  try {
    const parts = token.trim().split('.')
    if (parts.length !== 3) {
      return { ok: false, error: '无效的 JWT 格式: 必须包含 3 部分' }
    }

    const decode = (str) => {
      const padded = str.replace(/-/g, '+').replace(/_/g, '/').padEnd(str.length + (4 - str.length % 4) % 4, '=')
      return JSON.parse(atob(padded))
    }

    const header = decode(parts[0])
    const payload = decode(parts[1])

    let isExpired = false
    let expiresAt = null
    let issuedAt = null

    if (payload.exp) {
      expiresAt = new Date(payload.exp * 1000)
      isExpired = expiresAt < new Date()
    }
    if (payload.iat) {
      issuedAt = new Date(payload.iat * 1000)
    }

    return {
      ok: true,
      value: {
        header,
        payload,
        signature: parts[2],
        raw: {
          header: parts[0],
          payload: parts[1],
          signature: parts[2],
        },
        isExpired,
        expiresAt,
        issuedAt,
      }
    }
  } catch (e) {
    return { ok: false, error: 'JWT 解析失败: ' + e.message }
  }
}

// ==================== RSA 密钥生成 ====================
export async function generateRsaKeyPair(modulusLength = 2048) {
  try {
    const keyPair = await crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength,
        publicExponent: new Uint8Array([1, 0, 1]),
        hash: 'SHA-256',
      },
      true,
      ['encrypt', 'decrypt']
    )
    
    const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey)
    const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey)
    
    const publicKey = `-----BEGIN PUBLIC KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(publicKeyBuffer))).match(/.{1,64}/g).join('\n')}\n-----END PUBLIC KEY-----`
    const privateKey = `-----BEGIN PRIVATE KEY-----\n${btoa(String.fromCharCode(...new Uint8Array(privateKeyBuffer))).match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`
    
    const publicKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.publicKey)
    const privateKeyJwk = await crypto.subtle.exportKey('jwk', keyPair.privateKey)
    
    return {
      ok: true,
      value: { publicKey, privateKey, publicKeyJwk, privateKeyJwk },
    }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ==================== SSH 密钥生成 ====================
// SSH wire-format helpers
function sshWriteUint32(n) {
  return new Uint8Array([(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff])
}

function sshWriteString(s) {
  const bytes = new TextEncoder().encode(s)
  const len = sshWriteUint32(bytes.length)
  const out = new Uint8Array(len.length + bytes.length)
  out.set(len, 0)
  out.set(bytes, len.length)
  return out
}

function sshWriteBytes(bytes) {
  const len = sshWriteUint32(bytes.length)
  const out = new Uint8Array(len.length + bytes.length)
  out.set(len, 0)
  out.set(bytes, len.length)
  return out
}

function sshConcat(...arrays) {
  const total = arrays.reduce((s, a) => s + a.length, 0)
  const out = new Uint8Array(total)
  let offset = 0
  for (const a of arrays) {
    out.set(a, offset)
    offset += a.length
  }
  return out
}

function sshEncodeBase64(bytes) {
  return btoa(String.fromCharCode(...bytes))
}

async function buildEd25519Keys(keyPair) {
  const rawPub = new Uint8Array(await crypto.subtle.exportKey('raw', keyPair.publicKey))
  const pkcs8 = new Uint8Array(await crypto.subtle.exportKey('pkcs8', keyPair.privateKey))
  const seed = pkcs8.slice(pkcs8.length - 32)

  const pubWire = sshConcat(sshWriteString('ssh-ed25519'), sshWriteBytes(rawPub))
  const publicKey = `ssh-ed25519 ${sshEncodeBase64(pubWire)} generated@jetbrains-blog`

  const fpBuf = await crypto.subtle.digest('SHA-256', pubWire)
  const fingerprint = `SHA256:${sshEncodeBase64(new Uint8Array(fpBuf))}`

  const keyType = sshWriteString('ssh-ed25519')
  const pubSection = sshWriteBytes(rawPub)
  const privSection = sshWriteBytes(sshConcat(seed, rawPub))
  const comment = sshWriteString('generated@jetbrains-blog')
  const checkInt = crypto.getRandomValues(new Uint8Array(4))
  const checkIntU32 = new DataView(checkInt.buffer).getUint32(0)
  const checkBytes = sshWriteUint32(checkIntU32)

  const privateBlock = sshConcat(checkBytes, checkBytes, keyType, pubSection, privSection, comment)
  const padded = new Uint8Array(Math.ceil(privateBlock.length / 8) * 8)
  padded.set(privateBlock)
  for (let i = privateBlock.length; i < padded.length; i++) padded[i] = (i - privateBlock.length + 1) & 0xff

  const header = new TextEncoder().encode('openssh-key-v1\0')
  const cipherNone = sshWriteString('none')
  const kdfNone = sshWriteString('none')
  const kdfOptions = sshWriteBytes(new Uint8Array(0))
  const numKeys = sshWriteUint32(1)
  const pubKeyBlob = sshWriteBytes(pubWire)

  const privatePayload = sshConcat(header, cipherNone, kdfNone, kdfOptions, numKeys, pubKeyBlob, sshWriteBytes(padded))
  const privateKeyB64 = sshEncodeBase64(privatePayload).match(/.{1,70}/g).join('\n')
  const privateKey = `-----BEGIN OPENSSH PRIVATE KEY-----\n${privateKeyB64}\n-----END OPENSSH PRIVATE KEY-----`

  return { publicKey, privateKey, fingerprint }
}

async function buildRsaKeys(modulusLength) {
  const keyPair = await crypto.subtle.generateKey({
    name: 'RSASSA-PKCS1-v1_5',
    modulusLength,
    publicExponent: new Uint8Array([1, 0, 1]),
    hash: 'SHA-256',
  }, true, ['sign', 'verify'])

  const spkiBuf = new Uint8Array(await crypto.subtle.exportKey('spki', keyPair.publicKey))
  const pkcs8Buf = new Uint8Array(await crypto.subtle.exportKey('pkcs8', keyPair.privateKey))

  function parseDerLen(data, offset) {
    const b = data[offset]
    if (!(b & 0x80)) return { len: b, next: offset + 1 }
    const nb = b & 0x7f
    let len = 0
    for (let i = 0; i < nb; i++) len = (len << 8) | data[offset + 1 + i]
    return { len, next: offset + 1 + nb }
  }

  let pos = 1
  const { next: afterOuterLen } = parseDerLen(spkiBuf, pos)
  pos = afterOuterLen
  pos++
  const { len: algLen, next: afterAlgLen } = parseDerLen(spkiBuf, pos)
  pos = afterAlgLen + algLen
  pos++
  const { next: afterBsLen } = parseDerLen(spkiBuf, pos)
  pos = afterBsLen
  pos++
  const { next: afterRsaSeqLen } = parseDerLen(spkiBuf, pos)
  pos = afterRsaSeqLen
  pos++
  const { len: nLen, next: afterNLen } = parseDerLen(spkiBuf, pos)
  const n = spkiBuf.slice(afterNLen, afterNLen + nLen)
  pos = afterNLen + nLen
  pos++
  const { len: eLen, next: afterELen } = parseDerLen(spkiBuf, pos)
  const e = spkiBuf.slice(afterELen, afterELen + eLen)

  function mpint(bytes) {
    let start = 0
    while (start < bytes.length - 1 && bytes[start] === 0) start++
    const trimmed = bytes.slice(start)
    const needPad = trimmed[0] & 0x80
    const b = needPad ? sshConcat(new Uint8Array([0]), trimmed) : trimmed
    return sshWriteBytes(b)
  }

  const pubWire = sshConcat(sshWriteString('ssh-rsa'), mpint(e), mpint(n))
  const publicKey = `ssh-rsa ${sshEncodeBase64(pubWire)} generated@jetbrains-blog`

  const fpBuf = await crypto.subtle.digest('SHA-256', pubWire)
  const fingerprint = `SHA256:${sshEncodeBase64(new Uint8Array(fpBuf))}`

  const privB64 = sshEncodeBase64(pkcs8Buf).match(/.{1,64}/g).join('\n')
  const privateKey = `-----BEGIN PRIVATE KEY-----\n${privB64}\n-----END PRIVATE KEY-----`

  return { publicKey, privateKey, fingerprint }
}

export async function generateSshKeyPair(type = 'ed25519') {
  try {
    if (type === 'ed25519') {
      const keyPair = await crypto.subtle.generateKey(
        { name: 'Ed25519' },
        true,
        ['sign', 'verify']
      )
      const keys = await buildEd25519Keys(keyPair)
      return { ok: true, value: keys }
    } else {
      const keys = await buildRsaKeys(4096)
      return { ok: true, value: keys }
    }
  } catch (e) {
    const msg = e.message
    if (msg.includes('Ed25519') || msg.includes('algorithm')) {
      return { ok: false, error: 'Ed25519 需要 Chrome 113+、Firefox 119+ 或 Safari 17+，请升级浏览器或改用 RSA 密钥。' }
    }
    return { ok: false, error: msg }
  }
}

// ==================== MD5 哈希 (纯 JS 实现) ====================
export function md5(input) {
  try {
    const bytes = new TextEncoder().encode(input)
    const result = md5Bytes(bytes)
    return { ok: true, value: result }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

function md5Bytes(bytes) {
  const K = new Uint32Array([
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391,
  ])

  const S = new Uint8Array([
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ])

  const padLen = bytes.length + 9
  const padBytes = ((padLen + 63) & ~63) - padLen + 8
  const totalLen = bytes.length + 1 + padBytes + 8
  const data = new Uint8Array(totalLen)
  data.set(bytes)
  data[bytes.length] = 0x80
  const view = new DataView(data.buffer)
  view.setUint32(totalLen - 8, bytes.length * 8, true)

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  function leftRotate(x, c) {
    return ((x << c) | (x >>> (32 - c))) >>> 0
  }

  for (let offset = 0; offset < totalLen; offset += 64) {
    const M = new Uint32Array(16)
    for (let i = 0; i < 16; i++) {
      M[i] = view.getUint32(offset + i * 4, true)
    }

    let A = a0, B = b0, C = c0, D = d0

    for (let i = 0; i < 64; i++) {
      let F, g
      if (i < 16) {
        F = (B & C) | (~B & D)
        g = i
      } else if (i < 32) {
        F = (D & B) | (~D & C)
        g = (5 * i + 1) % 16
      } else if (i < 48) {
        F = B ^ C ^ D
        g = (3 * i + 5) % 16
      } else {
        F = C ^ (B | ~D)
        g = (7 * i) % 16
      }
      F = (F + A + K[i] + M[g]) >>> 0
      A = D
      D = C
      C = B
      B = (B + leftRotate(F, S[i])) >>> 0
    }

    a0 = (a0 + A) >>> 0
    b0 = (b0 + B) >>> 0
    c0 = (c0 + C) >>> 0
    d0 = (d0 + D) >>> 0
  }

  const result = new Uint8Array(16)
  const resultView = new DataView(result.buffer)
  resultView.setUint32(0, a0, true)
  resultView.setUint32(4, b0, true)
  resultView.setUint32(8, c0, true)
  resultView.setUint32(12, d0, true)

  return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ==================== YAML/JSON 转换 ====================
export function yamlToJson(yaml) {
  try {
    const parsed = jsYaml.load(yaml)
    return { ok: true, value: JSON.stringify(parsed, null, 2) }
  } catch (e) {
    return { ok: false, error: 'YAML 解析错误: ' + e.message }
  }
}

export function jsonToYaml(json) {
  try {
    const parsed = JSON.parse(json)
    const yaml = jsYaml.dump(parsed, { indent: 2, lineWidth: -1 })
    return { ok: true, value: yaml }
  } catch (e) {
    return { ok: false, error: 'JSON 解析错误: ' + e.message }
  }
}

// ==================== XML 格式化 ====================
export function formatXml(xml, indent = 2) {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    const error = doc.querySelector('parsererror')
    if (error) {
      return { ok: false, error: 'XML 解析错误: ' + error.textContent }
    }
    
    const format = (node, level) => {
      const indentStr = ' '.repeat(indent * level)
      
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent?.trim()
        return text ? text : ''
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node
        const children = Array.from(element.childNodes)
          .filter(c => c.nodeType === Node.ELEMENT_NODE || (c.nodeType === Node.TEXT_NODE && c.textContent?.trim()))
        
        let result = `${indentStr}<${element.tagName}`
        
        for (const attr of Array.from(element.attributes)) {
          result += ` ${attr.name}="${attr.value}"`
        }
        
        if (children.length === 0) {
          result += ' />\n'
        } else if (children.length === 1 && children[0].nodeType === Node.TEXT_NODE) {
          result += `>${children[0].textContent?.trim()}</${element.tagName}>\n`
        } else {
          result += '>\n'
          for (const child of children) {
            result += format(child, level + 1)
          }
          result += `${indentStr}</${element.tagName}>\n`
        }
        return result
      }
      
      return ''
    }
    
    const result = format(doc.documentElement, 0)
    return { ok: true, value: result }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function minifyXml(xml) {
  try {
    return { ok: true, value: xml.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim() }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ==================== SQL 格式化 ====================
export function formatSql(sql, language = 'sql') {
  try {
    // 基本格式化逻辑 - 不依赖外部库
    const keywords = [
      'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER',
      'ON', 'GROUP', 'BY', 'ORDER', 'HAVING', 'INSERT', 'UPDATE', 'DELETE', 'CREATE',
      'ALTER', 'DROP', 'TABLE', 'INDEX', 'VIEW', 'INTO', 'VALUES', 'SET', 'AS', 'IN',
      'NOT', 'NULL', 'IS', 'LIKE', 'BETWEEN', 'EXISTS', 'DISTINCT', 'COUNT', 'SUM',
      'AVG', 'MIN', 'MAX', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'UNION', 'ALL',
      'LIMIT', 'OFFSET', 'WITH', 'RECURSIVE', 'RETURNING', 'PRIMARY', 'KEY', 'FOREIGN',
      'REFERENCES', 'UNIQUE', 'DEFAULT', 'CHECK', 'CONSTRAINT', 'CASCADE', 'TRUNCATE'
    ]
    
    let formatted = sql.toUpperCase()
    
    // 为关键词前添加换行
    keywords.forEach(kw => {
      formatted = formatted.replace(new RegExp(`\\b${kw}\\b`, 'g'), `\n${kw}`)
    })
    
    // 清理多余的换行
    formatted = formatted.replace(/\n\s*\n/g, '\n')
    
    // 添加适当的缩进
    const lines = formatted.split('\n').map(line => line.trim()).filter(Boolean)
    let indentLevel = 0
    const indentedLines = lines.map(line => {
      // 减少缩进的关键词
      if (['FROM', 'WHERE', 'AND', 'OR', 'GROUP', 'ORDER', 'HAVING', 'LEFT', 'RIGHT', 'INNER', 'JOIN', 'ON', 'LIMIT', 'OFFSET'].includes(line.split(' ')[0])) {
        indentLevel = 1
      } else if (line.startsWith('SELECT')) {
        indentLevel = 0
      }
      return '  '.repeat(indentLevel) + line
    })
    
    return { ok: true, value: indentedLines.join('\n') }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

export function minifySql(sql) {
  try {
    return { ok: true, value: sql.replace(/\s+/g, ' ').replace(/\s*([(),])\s*/g, '$1').trim() }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

// ==================== TOML/JSON 转换 ====================
class TomlParser {
  constructor(src) {
    this.src = src
    this.pos = 0
  }

  get done() { return this.pos >= this.src.length }
  peek() { return this.src[this.pos] }
  advance() { return this.src[this.pos++] }

  skipWhitespace() {
    while (!this.done && (this.peek() === ' ' || this.peek() === '\t')) this.advance()
  }

  skipWhitespaceAndNewlines() {
    while (!this.done && /[ \t\r\n]/.test(this.peek())) this.advance()
  }

  skipComment() {
    if (this.peek() === '#') {
      while (!this.done && this.peek() !== '\n') this.advance()
    }
  }

  skipLineEnd() {
    this.skipWhitespace()
    this.skipComment()
    if (!this.done && (this.peek() === '\r' || this.peek() === '\n')) {
      if (this.peek() === '\r') this.advance()
      if (!this.done && this.peek() === '\n') this.advance()
    }
  }

  parseKey() {
    const keys = []
    keys.push(this.parseSimpleKey())
    while (!this.done && this.peek() === '.') {
      this.advance()
      this.skipWhitespace()
      keys.push(this.parseSimpleKey())
    }
    return keys
  }

  parseSimpleKey() {
    this.skipWhitespace()
    if (this.peek() === '"') return this.parseBasicString()
    if (this.peek() === "'") return this.parseLiteralString()
    let key = ''
    while (!this.done && /[a-zA-Z0-9_-]/.test(this.peek())) key += this.advance()
    if (!key) throw new Error(`Invalid key at position ${this.pos}`)
    return key
  }

  parseBasicString() {
    this.advance()
    if (this.src.startsWith('""', this.pos)) {
      this.pos += 2
      return this.parseMultilineBasicString()
    }
    let s = ''
    while (!this.done && this.peek() !== '"') {
      if (this.peek() === '\\') {
        this.advance()
        const esc = this.advance()
        switch (esc) {
          case 'b': s += '\b'; break
          case 't': s += '\t'; break
          case 'n': s += '\n'; break
          case 'f': s += '\f'; break
          case 'r': s += '\r'; break
          case '"': s += '"'; break
          case '\\': s += '\\'; break
          case 'u': s += String.fromCodePoint(parseInt(this.src.slice(this.pos, this.pos + 4), 16)); this.pos += 4; break
          case 'U': s += String.fromCodePoint(parseInt(this.src.slice(this.pos, this.pos + 8), 16)); this.pos += 8; break
          default: throw new Error(`Invalid escape \\${esc}`)
        }
      } else {
        s += this.advance()
      }
    }
    if (this.done) throw new Error('Unterminated string')
    this.advance()
    return s
  }

  parseMultilineBasicString() {
    if (!this.done && this.peek() === '\n') this.advance()
    else if (!this.done && this.peek() === '\r' && this.src[this.pos + 1] === '\n') this.pos += 2
    let s = ''
    while (!this.done) {
      if (this.src.startsWith('"""', this.pos)) { this.pos += 3; return s }
      if (this.peek() === '\\') {
        this.advance()
        if (this.peek() === '\n' || this.peek() === '\r' || this.peek() === ' ' || this.peek() === '\t') {
          while (!this.done && /[ \t\r\n]/.test(this.peek())) this.advance()
          continue
        }
        const esc = this.advance()
        switch (esc) {
          case 'n': s += '\n'; break
          case 't': s += '\t'; break
          case '"': s += '"'; break
          case '\\': s += '\\'; break
          default: s += esc
        }
      } else {
        s += this.advance()
      }
    }
    throw new Error('Unterminated multiline string')
  }

  parseLiteralString() {
    this.advance()
    if (this.src.startsWith("''", this.pos)) {
      this.pos += 2
      return this.parseMultilineLiteralString()
    }
    let s = ''
    while (!this.done && this.peek() !== "'") s += this.advance()
    if (this.done) throw new Error('Unterminated literal string')
    this.advance()
    return s
  }

  parseMultilineLiteralString() {
    if (!this.done && this.peek() === '\n') this.advance()
    else if (!this.done && this.peek() === '\r' && this.src[this.pos + 1] === '\n') this.pos += 2
    let s = ''
    while (!this.done) {
      if (this.src.startsWith("'''", this.pos)) { this.pos += 3; return s }
      s += this.advance()
    }
    throw new Error('Unterminated multiline literal string')
  }

  parseValue() {
    this.skipWhitespace()
    const ch = this.peek()

    if (ch === '"') return this.parseBasicString()
    if (ch === "'") return this.parseLiteralString()
    if (ch === '[') return this.parseArray()
    if (ch === '{') return this.parseInlineTable()

    if (this.src.startsWith('true', this.pos) && !/[a-zA-Z0-9_-]/.test(this.src[this.pos + 4] ?? '')) { this.pos += 4; return true }
    if (this.src.startsWith('false', this.pos) && !/[a-zA-Z0-9_-]/.test(this.src[this.pos + 5] ?? '')) { this.pos += 5; return false }

    let tok = ''
    while (!this.done && /[-0-9a-zA-Z_.:+TZ]/.test(this.peek())) tok += this.advance()

    if (!tok) throw new Error(`Unexpected character '${ch}' at position ${this.pos}`)

    if (/^\d{4}-\d{2}-\d{2}/.test(tok)) {
      const d = new Date(tok)
      return isNaN(d.getTime()) ? tok : d.toISOString()
    }

    if (/[._]/.test(tok) || tok === 'inf' || tok === '-inf' || tok === '+inf' || tok === 'nan') {
      if (tok === 'inf' || tok === '+inf') return Infinity
      if (tok === '-inf') return -Infinity
      if (tok === 'nan') return NaN
      return parseFloat(tok.replace(/_/g, ''))
    }

    if (tok.startsWith('0x')) return parseInt(tok.slice(2), 16)
    if (tok.startsWith('0o')) return parseInt(tok.slice(2), 8)
    if (tok.startsWith('0b')) return parseInt(tok.slice(2), 2)

    const n = parseInt(tok.replace(/_/g, ''), 10)
    if (!isNaN(n)) return n

    throw new Error(`Cannot parse value: ${tok}`)
  }

  parseArray() {
    this.advance()
    const arr = []
    this.skipWhitespaceAndNewlines()
    while (!this.done && this.peek() !== ']') {
      this.skipComment()
      this.skipWhitespaceAndNewlines()
      if (this.peek() === ']') break
      arr.push(this.parseValue())
      this.skipWhitespaceAndNewlines()
      this.skipComment()
      this.skipWhitespaceAndNewlines()
      if (this.peek() === ',') { this.advance(); this.skipWhitespaceAndNewlines() }
    }
    if (this.done) throw new Error('Unterminated array')
    this.advance()
    return arr
  }

  parseInlineTable() {
    this.advance()
    const table = {}
    this.skipWhitespace()
    while (!this.done && this.peek() !== '}') {
      const keys = this.parseKey()
      this.skipWhitespace()
      if (this.advance() !== '=') throw new Error('Expected = in inline table')
      const val = this.parseValue()
      setNestedToml(table, keys, val)
      this.skipWhitespace()
      if (this.peek() === ',') { this.advance(); this.skipWhitespace() }
    }
    if (this.done) throw new Error('Unterminated inline table')
    this.advance()
    return table
  }

  parse() {
    const root = {}
    let current = root
    let currentPath = []

    while (!this.done) {
      this.skipWhitespace()
      if (this.done) break
      const ch = this.peek()

      if (ch === '#' || ch === '\n' || ch === '\r') {
        this.skipComment()
        if (!this.done && (this.peek() === '\n' || this.peek() === '\r')) {
          if (this.peek() === '\r') this.advance()
          if (!this.done && this.peek() === '\n') this.advance()
        }
        continue
      }

      if (ch === '[' && this.src[this.pos + 1] === '[') {
        this.pos += 2
        const keys = this.parseKey()
        if (this.advance() !== ']' || this.advance() !== ']') throw new Error('Expected ]] to close array of tables')
        this.skipLineEnd()
        currentPath = keys
        let node = root
        for (let i = 0; i < keys.length - 1; i++) {
          if (!(keys[i] in node)) node[keys[i]] = {}
          node = node[keys[i]]
        }
        const last = keys[keys.length - 1]
        if (!(last in node)) node[last] = []
        const arr = node[last]
        const newTable = {}
        arr.push(newTable)
        current = newTable
        void currentPath
        continue
      }

      if (ch === '[') {
        this.advance()
        const keys = this.parseKey()
        if (this.advance() !== ']') throw new Error('Expected ] to close table header')
        this.skipLineEnd()
        currentPath = keys
        current = root
        for (const key of keys) {
          if (!(key in current)) current[key] = {}
          const next = current[key]
          if (Array.isArray(next)) current = next[next.length - 1]
          else current = next
        }
        continue
      }

      const keys = this.parseKey()
      this.skipWhitespace()
      if (this.advance() !== '=') throw new Error(`Expected = after key "${keys.join('.')}"`)
      const val = this.parseValue()
      setNestedToml(current, keys, val)
      this.skipLineEnd()
    }

    return root
  }
}

function setNestedToml(obj, keys, val) {
  let node = obj
  for (let i = 0; i < keys.length - 1; i++) {
    if (!(keys[i] in node)) node[keys[i]] = {}
    const next = node[keys[i]]
    if (Array.isArray(next)) node = next[next.length - 1]
    else node = next
  }
  const last = keys[keys.length - 1]
  if (last in node) throw new Error(`Duplicate key: ${keys.join('.')}`)
  node[last] = val
}

export function parseToml(input) {
  try {
    return { ok: true, value: new TomlParser(input).parse() }
  } catch (e) {
    return { ok: false, error: 'TOML 解析错误: ' + e.message }
  }
}

function jsonValueToToml(val) {
  if (val === null) return 'null'
  if (typeof val === 'boolean') return val ? 'true' : 'false'
  if (typeof val === 'number') return isFinite(val) ? String(val) : (val > 0 ? 'inf' : '-inf')
  if (typeof val === 'string') {
    return '"' + val.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') + '"'
  }
  if (Array.isArray(val)) {
    const allPrimitive = val.every(v => typeof v !== 'object' || v === null)
    if (allPrimitive) {
      return '[' + val.map(v => jsonValueToToml(v)).join(', ') + ']'
    }
    return '[]'
  }
  if (typeof val === 'object') {
    return '{' + Object.entries(val).map(([k, v]) => `${k} = ${jsonValueToToml(v)}`).join(', ') + '}'
  }
  return String(val)
}

export function jsonToToml(obj) {
  try {
    const parsed = typeof obj === 'string' ? JSON.parse(obj) : obj
    const lines = []
    const tableEntries = []
    const arrayTableEntries = []

    for (const [key, val] of Object.entries(parsed)) {
      if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
        arrayTableEntries.push([key, val])
      } else if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
        tableEntries.push([key, val])
      } else {
        lines.push(`${key} = ${jsonValueToToml(val)}`)
      }
    }

    const sections = []

    for (const [key, tableVal] of tableEntries) {
      const nested = []
      const subTableEntries = []
      const subArrayTableEntries = []

      for (const [k, v] of Object.entries(tableVal)) {
        if (Array.isArray(v) && v.length > 0 && typeof v[0] === 'object' && v[0] !== null) {
          subArrayTableEntries.push([k, v])
        } else if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
          subTableEntries.push([k, v])
        } else {
          nested.push(`${k} = ${jsonValueToToml(v)}`)
        }
      }

      sections.push(`[${key}]\n${nested.join('\n')}`)

      for (const [k, tableArr] of subArrayTableEntries) {
        for (const item of tableArr) {
          const itemLines = Object.entries(item).map(([ik, iv]) => `${ik} = ${jsonValueToToml(iv)}`)
          sections.push(`[[${key}.${k}]]\n${itemLines.join('\n')}`)
        }
      }

      for (const [k, v] of subTableEntries) {
        const subLines = Object.entries(v).map(([sk, sv]) => `${sk} = ${jsonValueToToml(sv)}`)
        sections.push(`[${key}.${k}]\n${subLines.join('\n')}`)
      }
    }

    for (const [key, arr] of arrayTableEntries) {
      for (const item of arr) {
        const itemLines = Object.entries(item).map(([k, v]) => `${k} = ${jsonValueToToml(v)}`)
        sections.push(`[[${key}]]\n${itemLines.join('\n')}`)
      }
    }

    const result = [lines.join('\n'), ...sections].filter(Boolean)
    return { ok: true, value: result.join('\n\n') }
  } catch (e) {
    return { ok: false, error: 'JSON 解析错误: ' + e.message }
  }
}

// ==================== Markdown 净化 ====================
export function sanitizeMarkdownHtml(html) {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '')
}