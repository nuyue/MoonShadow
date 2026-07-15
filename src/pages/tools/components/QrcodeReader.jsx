import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

const QrcodeReader = () => {
  const { theme, radius, font } = useTheme()
  const [result, setResult] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [cameraActive, setCameraActive] = React.useState(false)
  const [imageUrl, setImageUrl] = React.useState('')
  const [copied, setCopied] = React.useState(false)
  const fileInputRef = React.useRef(null)
  const videoRef = React.useRef(null)
  const canvasRef = React.useRef(null)
  const streamRef = React.useRef(null)

  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setCameraActive(false)
  }, [])

  React.useEffect(() => {
    return () => stopCamera()
  }, [stopCamera])

  // 简易二维码识别：通过 Canvas 读取图片像素，使用基础检测算法
  // 实际项目中应使用 jsqr 库进行精确识别
  const detectQRFromImageData = (imageData, width, height) => {
    // 简化版：无法在纯前端无依赖情况下实现完整 QR 解码
    // 返回 null 表示需要外部库支持
    return null
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')
    setResult('')
    setImageUrl('')

    try {
      const url = URL.createObjectURL(file)
      setImageUrl(url)

      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          setError('无法创建画布上下文')
          setLoading(false)
          return
        }
        ctx.drawImage(img, 0, 0)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

        // 尝试使用 jsqr（如果可用）
        if (window.jsQR) {
          const code = window.jsQR(imageData.data, imageData.width, imageData.height)
          if (code) {
            setResult(code.data)
          } else {
            setError('未能在图片中识别到二维码')
          }
        } else {
          // 使用在线 API 作为备选方案
          const formData = new FormData()
          formData.append('file', file)
          fetch('https://api.qrserver.com/v1/read-qr-code/', {
            method: 'POST',
            body: formData,
          })
            .then(res => res.json())
            .then(data => {
              if (data && data[0] && data[0].symbol && data[0].symbol[0] && data[0].symbol[0].data) {
                setResult(data[0].symbol[0].data)
              } else {
                setError('未能在图片中识别到二维码')
              }
              setLoading(false)
            })
            .catch(() => {
              setError('识别服务请求失败，请检查网络连接')
              setLoading(false)
            })
          return
        }
        setLoading(false)
      }
      img.onerror = () => {
        setError('图片加载失败')
        setLoading(false)
      }
      img.src = url
    } catch {
      setError('处理图片时发生错误')
      setLoading(false)
    }
  }

  const startCamera = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setCameraActive(true)
        setError('')
        setResult('')
      }
    } catch {
      setError('无法访问摄像头，请检查权限设置')
    }
  }, [])

  const scanFrame = React.useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !cameraActive) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanFrame)
      return
    }

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    ctx.drawImage(video, 0, 0)

    if (window.jsQR) {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = window.jsQR(imageData.data, imageData.width, imageData.height)
      if (code) {
        setResult(code.data)
        stopCamera()
        return
      }
    }

    if (cameraActive) {
      requestAnimationFrame(scanFrame)
    }
  }, [cameraActive, stopCamera])

  React.useEffect(() => {
    if (cameraActive) {
      scanFrame()
    }
  }, [cameraActive, scanFrame])

  const reset = () => {
    setResult('')
    setError('')
    setImageUrl('')
    stopCamera()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDrop = React.useCallback(async (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) {
      const dataTransfer = new DataTransfer()
      dataTransfer.items.add(file)
      if (fileInputRef.current) {
        fileInputRef.current.files = dataTransfer.files
        fileInputRef.current.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  }, [])

  const copyResult = () => {
    if (!result) return
    navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.sm,
    color: theme.textPrimary,
    fontSize: '13px',
    outline: 'none',
  }

  const buttonStyle = {
    padding: '8px 16px',
    background: theme.bgSecondary,
    border: `1px solid ${theme.border}`,
    borderRadius: radius.sm,
    color: theme.textSecondary,
    fontSize: '12px',
    cursor: 'pointer',
  }

  const primaryButtonStyle = {
    padding: '8px 16px',
    background: theme.bgAccent,
    border: 'none',
    borderRadius: radius.sm,
    color: theme.bgPrimary,
    fontSize: '12px',
    cursor: 'pointer',
  }

  const dropZoneStyle = {
    position: 'relative',
    minHeight: '300px',
    background: theme.bgSecondary,
    border: `2px dashed ${theme.border}`,
    borderRadius: radius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{ ...primaryButtonStyle, flex: 1 }}
        >
          上传图片
        </button>
        <button
          onClick={cameraActive ? stopCamera : startCamera}
          style={{
            ...buttonStyle,
            flex: 1,
            ...(cameraActive ? { color: theme.error, borderColor: theme.error } : {}),
          }}
        >
          {cameraActive ? '关闭摄像头' : '摄像头扫码'}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        style={dropZoneStyle}
      >
        {loading ? (
          <div style={{ textAlign: 'center', color: theme.textMuted }}>
            <div style={{ fontSize: '24px', marginBottom: '8px', animation: 'spin 1s linear infinite' }}>⟳</div>
            <p style={{ fontSize: '13px', margin: 0 }}>正在识别...</p>
          </div>
        ) : cameraActive ? (
          <>
            <video
              ref={videoRef}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              playsInline
              muted
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              pointerEvents: 'none',
            }}>
              <div style={{
                width: '192px',
                height: '192px',
                border: `2px solid ${theme.bgAccent}`,
                borderRadius: radius.lg,
                opacity: 0.5,
              }} />
            </div>
          </>
        ) : imageUrl ? (
          <img src={imageUrl} alt="Uploaded" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} />
        ) : (
          <div style={{ textAlign: 'center', color: theme.textMuted }}>
            <div style={{ fontSize: '48px', marginBottom: '12px', opacity: 0.5 }}>📷</div>
            <p style={{ fontSize: '13px', margin: 0 }}>拖拽图片到此处或点击上传</p>
            <p style={{ fontSize: '11px', margin: '4px 0 0', color: theme.textMuted }}>支持 PNG, JPG, GIF 等格式</p>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '12px 16px',
          marginTop: '12px',
          background: `${theme.error}15`,
          border: `1px solid ${theme.error}30`,
          borderRadius: radius.md,
          color: theme.error,
          fontSize: '13px',
        }}>
          <span>✕</span>
          {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '12px', fontWeight: '500', color: theme.textSecondary, margin: 0 }}>识别结果</h4>
            <button onClick={copyResult} style={buttonStyle}>
              {copied ? '✓ 已复制' : '复制'}
            </button>
          </div>
          <div style={{
            padding: '16px',
            background: theme.bgSecondary,
            border: `1px solid ${theme.border}`,
            borderRadius: radius.md,
          }}>
            <p style={{
              color: theme.textPrimary,
              fontFamily: font.mono,
              fontSize: '13px',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}>
              {result}
            </p>
          </div>
        </div>
      )}

      {result && (
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
          <button onClick={reset} style={buttonStyle}>清除重试</button>
          {result.startsWith('http') && (
            <a
              href={result}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...primaryButtonStyle,
                textDecoration: 'none',
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              打开链接
            </a>
          )}
        </div>
      )}
    </div>
  )
}

export default QrcodeReader
