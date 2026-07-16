import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

// IP 子网计算
function calculateSubnet(ip, cidr) {
  const cidrNum = parseInt(cidr)
  if (isNaN(cidrNum) || cidrNum < 0 || cidrNum > 32) {
    return { ok: false, error: 'CIDR 必须在 0-32 之间' }
  }

  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
    return { ok: false, error: '无效的 IP 地址格式' }
  }

  const ipNum = (parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]
  const mask = cidrNum === 0 ? 0 : (~0 << (32 - cidrNum)) >>> 0
  const network = (ipNum & mask) >>> 0
  const broadcast = (network | (~mask >>> 0)) >>> 0

  const numToIp = (num) => [
    (num >>> 24) & 255,
    (num >>> 16) & 255,
    (num >>> 8) & 255,
    num & 255
  ].join('.')

  const totalHosts = Math.pow(2, 32 - cidrNum)
  const usableHosts = cidrNum >= 31 ? totalHosts : totalHosts - 2

  return {
    ok: true,
    value: {
      networkAddress: numToIp(network),
      broadcastAddress: numToIp(broadcast),
      subnetMask: numToIp(mask),
      firstHost: cidrNum >= 31 ? numToIp(network) : numToIp(network + 1),
      lastHost: cidrNum >= 31 ? numToIp(broadcast) : numToIp(broadcast - 1),
      usableHosts,
      totalHosts,
      cidr: cidrNum,
    }
  }
}

const IpSubnet = () => {
  const { theme, radius, font } = useTheme()
  const [ip, setIp] = React.useState('192.168.1.100')
  const [cidr, setCidr] = React.useState(24)
  const [result, setResult] = React.useState(null)
  const [error, setError] = React.useState('')

  const handleCalculate = () => {
    const calcResult = calculateSubnet(ip, cidr)
    if (calcResult.ok) {
      setResult(calcResult.value)
      setError('')
    } else {
      setError(calcResult.error)
      setResult(null)
    }
  }

  React.useEffect(() => {
    handleCalculate()
  }, [ip, cidr])

  const cardStyle = {
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    padding: '16px',
    transition: 'border-color 0.15s ease',
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.md,
    color: theme.textPrimary,
    fontFamily: font.ui,
    fontSize: '13px',
    outline: 'none',
    transition: 'border-color 0.15s ease',
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: theme.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            IP 地址
          </label>
          <input
            type="text"
            value={ip}
            onChange={e => setIp(e.target.value)}
            onFocus={e => e.currentTarget.style.borderColor = theme.borderHover}
            onBlur={e => e.currentTarget.style.borderColor = theme.border}
            placeholder="192.168.1.100"
            style={inputStyle}
          />
        </div>
        <div style={{ width: '120px' }}>
          <label style={{ display: 'block', fontSize: '11px', color: theme.textMuted, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            CIDR
          </label>
          <input
            type="number"
            value={cidr}
            onChange={e => setCidr(e.target.value)}
            min={0}
            max={32}
            onFocus={e => e.currentTarget.style.borderColor = theme.borderHover}
            onBlur={e => e.currentTarget.style.borderColor = theme.border}
            style={inputStyle}
          />
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(239, 68, 68, 0.15)',
          border: `1px solid rgba(239, 68, 68, 0.3)`,
          borderRadius: radius.md,
          color: '#ef4444',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {result && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: '网络地址', value: result.networkAddress },
              { label: '广播地址', value: result.broadcastAddress },
              { label: '子网掩码', value: result.subnetMask },
              { label: '第一个可用主机', value: result.firstHost },
              { label: '最后一个可用主机', value: result.lastHost },
              { label: '可用主机数', value: result.usableHosts.toLocaleString() },
              { label: '总主机数', value: result.totalHosts.toLocaleString() },
              { label: 'CIDR 表示', value: `/${result.cidr}` },
            ].map(item => (
              <div key={item.label} style={cardStyle}>
                <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: font.ui, fontSize: '14px', fontWeight: 600, color: theme.textPrimary }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div style={cardStyle}>
            <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              常用 CIDR 参考
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
              {[
                { cidr: '/24', hosts: '256 个地址' },
                { cidr: '/25', hosts: '128 个地址' },
                { cidr: '/26', hosts: '64 个地址' },
                { cidr: '/27', hosts: '32 个地址' },
                { cidr: '/28', hosts: '16 个地址' },
                { cidr: '/29', hosts: '8 个地址' },
                { cidr: '/30', hosts: '4 个地址' },
                { cidr: '/16', hosts: '65536 个地址' },
              ].map(item => (
                <div key={item.cidr} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: theme.textMuted, fontFamily: font.ui }}>{item.cidr}</span>
                  <span style={{ color: theme.textPrimary }}>{item.hosts}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default IpSubnet