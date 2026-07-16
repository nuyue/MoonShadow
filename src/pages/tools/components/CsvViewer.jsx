import React from 'react'
import Papa from 'papaparse'

const CsvViewer = () => {
  const [input, setInput] = React.useState('')
  const [delimiter, setDelimiter] = React.useState(',')
  const [hasHeader, setHasHeader] = React.useState(true)
  const [parsedData, setParsedData] = React.useState(null)
  const [error, setError] = React.useState('')

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      setInput(event.target?.result || '')
    }
    reader.readAsText(file)
  }

  // 解析 CSV
  React.useEffect(() => {
    if (!input.trim()) {
      setParsedData(null)
      setError('')
      return
    }

    try {
      const result = Papa.parse(input, {
        delimiter,
        header: hasHeader,
        skipEmptyLines: true,
      })

      if (result.errors.length > 0) {
        setError(result.errors[0].message)
        setParsedData(null)
      } else {
        setError('')
        setParsedData({
          data: result.data,
          fields: result.meta.fields,
        })
      }
    } catch (e) {
      setError(e.message)
      setParsedData(null)
    }
  }, [input, delimiter, hasHeader])

  const exportJson = () => {
    if (!parsedData?.data) return
    const json = JSON.stringify(parsedData.data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'data.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const copyJson = () => {
    if (parsedData?.data) {
      navigator.clipboard.writeText(JSON.stringify(parsedData.data, null, 2))
    }
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <label 
          style={{ 
            padding: '6px 16px', 
            background: '#3B82F6', 
            color: 'white', 
            borderRadius: '4px', 
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17,8 12,3 7,8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          上传文件
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </label>
        
        {parsedData?.data && (
          <>
            <button 
              onClick={exportJson}
              style={{ 
                padding: '6px 16px', 
                background: '#10B981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              导出 JSON
            </button>
            <button 
              onClick={copyJson}
              style={{ 
                padding: '6px 16px', 
                background: '#f0f0f0', 
                border: '1px solid #ddd', 
                borderRadius: '4px', 
                cursor: 'pointer' 
              }}
            >
              复制 JSON
            </button>
          </>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            分隔符:
            <select 
              value={delimiter} 
              onChange={e => setDelimiter(e.target.value)} 
              style={{ padding: '4px 8px', border: '1px solid #ddd', borderRadius: '4px' }}
            >
              <option value=",">逗号 (,)</option>
              <option value=";">分号 (;)</option>
              <option value="\t">制表符</option>
              <option value="|">竖线 (|)</option>
            </select>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={hasHeader} 
              onChange={e => setHasHeader(e.target.checked)} 
            />
            首行为表头
          </label>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>CSV 输入</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="输入 CSV 数据或上传文件..."
            style={{ 
              width: '100%', 
              height: '400px', 
              padding: '12px', 
              border: '1px solid #ddd', 
              borderRadius: '4px', 
              fontFamily: font.ui, 
              fontSize: '13px', 
              resize: 'none',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
            {input.length} 字符
          </div>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: '#666', marginBottom: '4px', display: 'block' }}>表格预览</label>
          <div style={{ 
            height: '400px', 
            border: '1px solid #ddd', 
            borderRadius: '4px', 
            overflow: 'auto',
            background: '#fff'
          }}>
            {error ? (
              <div style={{ padding: '12px', color: '#dc2626' }}>{error}</div>
            ) : parsedData?.data ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead style={{ background: '#f5f5f5', position: 'sticky', top: 0 }}>
                  <tr>
                    {parsedData.fields ? (
                      parsedData.fields.map((field, i) => (
                        <th key={i} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
                          {field}
                        </th>
                      ))
                    ) : (
                      parsedData.data[0]?.map((_, i) => (
                        <th key={i} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontWeight: 'bold' }}>
                          列 {i + 1}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody>
                  {parsedData.data.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
                      {Object.values(row).map((cell, j) => (
                        <td key={j} style={{ padding: '8px 12px' }}>
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '12px', color: '#999' }}>暂无数据</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CsvViewer
