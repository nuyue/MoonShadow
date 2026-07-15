import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, FileText, Info, Link2, Github, Menu, X, Sun, Moon, Languages, Wrench, Music, Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Repeat, Repeat1, Shuffle } from 'lucide-react'
import { useTheme, THEMES, RADIUS, FONT } from '../context/ThemeContext'
import { useLang } from '../context/LanguageContext'
import { musicList as musicConfig } from 'virtual:posts-data'
import Breadcrumb from './Breadcrumb'

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, themeId, setTheme, themes, radius, font } = useTheme()
  const { lang, setLang, t } = useLang()
  const [isMobile, setIsMobile] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // 音乐播放器状态
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState((musicConfig?.defaultVolume || 50) / 100)
  const [isMuted, setIsMuted] = useState(false)
  const [showPlayerPanel, setShowPlayerPanel] = useState(false)
  const [currentLyric, setCurrentLyric] = useState('')
  // 播放模式: 'order' 顺序, 'loop' 单曲循环, 'random' 随机
  const [playMode, setPlayMode] = useState(musicConfig?.defaultMode || 'loop')

  // 获取歌曲列表
  const songs = musicConfig?.songs || []
  
  // 是否显示音乐播放器（只有在有音乐时才显示）
  const showMusicPlayer = songs.length > 0

  // 解析歌词
  const parseLyrics = (lrcText) => {
    if (!lrcText) return []
    const lines = lrcText.split('\n')
    const lyrics = []
    for (const line of lines) {
      const match = line.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/)
      if (match) {
        const minutes = parseInt(match[1])
        const seconds = parseInt(match[2])
        const ms = parseInt(match[3].padEnd(3, '0'))
        const time = minutes * 60 + seconds + ms / 1000
        const text = match[4].trim()
        if (text) {
          lyrics.push({ time, text })
        }
      }
    }
    return lyrics.sort((a, b) => a.time - b.time)
  }

  // 获取当前歌词
  const getCurrentLyric = () => {
    const track = songs?.[currentTrack]
    if (!track?.lyrics) return ''
    const lyrics = parseLyrics(track.lyrics)
    for (let i = lyrics.length - 1; i >= 0; i--) {
      if (currentTime >= lyrics[i].time) {
        return lyrics[i].text
      }
    }
    return ''
  }

  const NAV_ITEMS = [
    { path: '/', icon: Home, label: t('nav.home') },
    { path: '/articles', icon: FileText, label: t('nav.posts') },
    { path: '/tools', icon: Wrench, label: lang === 'zh' ? '工具' : 'Tools' },
    { path: '/links', icon: Link2, label: lang === 'zh' ? '友链' : 'Links' },
    { path: '/about', icon: Info, label: t('nav.about') },
  ]

  // 只有两个主题，直接切换
  const toggleTheme = () => {
    setTheme(themeId === 'light' ? 'dark' : 'light')
  }

  const ThemeIcon = themeId === 'light' ? Sun : Moon

  // 音乐播放器控制函数
  const togglePlay = () => {
    if (!showMusicPlayer) return
    setIsPlaying(!isPlaying)
  }

  // 根据播放模式获取下一首
  const getNextTrackIndex = () => {
    if (playMode === 'loop') {
      return currentTrack
    } else if (playMode === 'random') {
      let nextIndex
      do {
        nextIndex = Math.floor(Math.random() * songs.length)
      } while (nextIndex === currentTrack && songs.length > 1)
      return nextIndex
    } else {
      return (currentTrack + 1) % songs.length
    }
  }

  const playNext = () => {
    if (!showMusicPlayer) return
    // 根据播放模式获取下一首
    const nextIndex = getNextTrackIndex()
    setCurrentTrack(nextIndex)
    setIsPlaying(true)
  }

  const playPrev = () => {
    if (!showMusicPlayer) return
    // 手动点击上一曲时，直接播放上一首
    const prevIndex = (currentTrack - 1 + songs.length) % songs.length
    setCurrentTrack(prevIndex)
    setIsPlaying(true)
  }

  // 当歌曲切换时，更新音频源并播放
  useEffect(() => {
    if (!audioRef.current || !showMusicPlayer) return
    audioRef.current.src = songs[currentTrack].url
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    }
  }, [currentTrack])

  // 当播放状态改变时，播放或暂停
  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play().catch(() => {})
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  // 切换播放模式
  const togglePlayMode = () => {
    const modes = ['order', 'loop', 'random']
    const currentIndex = modes.indexOf(playMode)
    const nextMode = modes[(currentIndex + 1) % modes.length]
    setPlayMode(nextMode)
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      // 更新当前歌词
      const lyric = getCurrentLyric()
      setCurrentLyric(lyric)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value)
    setCurrentTime(time)
    if (audioRef.current) {
      audioRef.current.currentTime = time
    }
  }

  const handleVolumeChange = (e) => {
    const vol = parseFloat(e.target.value)
    setVolume(vol)
    if (audioRef.current) {
      audioRef.current.volume = vol
    }
    if (vol > 0 && isMuted) {
      setIsMuted(false)
      if (audioRef.current) {
        audioRef.current.muted = false
      }
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
    }
  }

  const formatTime = (time) => {
    const mins = Math.floor(time / 60)
    const secs = Math.floor(time % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // 初始化音频音量
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [])

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div data-theme={themeId} style={{
      display: 'flex',
      minHeight: '100vh',
      background: theme.bgPrimary,
      color: theme.textPrimary,
      fontFamily: font.ui,
      fontSize: '14px',
    }}>
      {/* Mobile Header */}
      {isMobile && (
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '48px',
          background: theme.bgSecondary,
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          zIndex: 200,
        }}>
          {/* Left: Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <Breadcrumb isMobile={true} />
          </div>
          
          {/* Right: Music + Theme + Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
            {/* Music button */}
            {showMusicPlayer && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowPlayerPanel(!showPlayerPanel)}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: showPlayerPanel ? theme.bgTertiary : 'transparent',
                  border: 'none',
                  borderRadius: radius.sm,
                  color: isPlaying ? theme.bgAccent : theme.textSecondary,
                  cursor: 'pointer',
                }}
              >
                <Music size={16} strokeWidth={1.5} />
              </motion.button>
            )}
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderRadius: radius.sm,
                color: theme.textSecondary,
                cursor: 'pointer',
              }}
            >
              <ThemeIcon size={16} strokeWidth={1.5} />
            </motion.button>
            
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderRadius: radius.sm,
                color: theme.textSecondary,
                cursor: 'pointer',
              }}
            >
              {menuOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
            </button>
          </div>
        </header>
      )}

      {/* Mobile Music Player Panel */}
      <AnimatePresence>
        {isMobile && showMusicPlayer && showPlayerPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onClick={() => setShowPlayerPanel(false)}
            style={{
              position: 'fixed',
              top: '48px',
              left: 0,
              right: 0,
              background: theme.bgSecondary,
              borderBottom: `1px solid ${theme.border}`,
              padding: '12px',
              zIndex: 199,
              maxHeight: '70vh',
              overflowY: 'auto',
            }}
          >
            <div onClick={(e) => e.stopPropagation()}>
              {/* 歌曲信息 */}
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: theme.textPrimary, marginBottom: '2px' }}>
                  {songs[currentTrack].title}
                </div>
                <div style={{ fontSize: '11px', color: theme.textMuted }}>
                  {songs[currentTrack].artist}
                </div>
              </div>

              {/* 进度条 */}
              <div style={{ marginBottom: '8px' }}>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  style={{
                    width: '100%',
                    height: '4px',
                    background: theme.bgTertiary,
                    borderRadius: '2px',
                    cursor: 'pointer',
                    accentColor: theme.bgAccent,
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: theme.textMuted, marginTop: '2px' }}>
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* 控制按钮 */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                <button
                  onClick={togglePlayMode}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: playMode === 'order' ? 'transparent' : theme.bgTertiary, 
                    border: 'none', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                  }}
                >
                  {playMode === 'order' && <Repeat size={14} color={theme.textMuted} />}
                  {playMode === 'loop' && <Repeat1 size={14} color={theme.bgAccent} />}
                  {playMode === 'random' && <Shuffle size={14} color={theme.bgAccent} />}
                </button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={playPrev}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: theme.bgTertiary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <SkipBack size={14} color={theme.textPrimary} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={togglePlay}
                  style={{ width: '48px', height: '48px', borderRadius: '50%', background: theme.bgAccent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  {isPlaying ? <Pause size={18} color={theme.bgPrimary} /> : <Play size={18} color={theme.bgPrimary} style={{ marginLeft: '2px' }} />}
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={playNext}
                  style={{ width: '36px', height: '36px', borderRadius: '50%', background: theme.bgTertiary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <SkipForward size={14} color={theme.textPrimary} />
                </motion.button>
                <button
                  onClick={toggleMute}
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    borderRadius: '50%', 
                    background: 'transparent', 
                    border: 'none', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                  }}
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX size={14} color={theme.textMuted} />
                  ) : (
                    <Volume2 size={14} color={theme.textMuted} />
                  )}
                </button>
              </div>

              {/* 歌词显示 */}
              <div style={{ 
                textAlign: 'center', 
                marginTop: '10px',
                padding: '10px',
                background: theme.bgTertiary,
                borderRadius: radius.sm,
              }}>
                {songs[currentTrack]?.lyrics && currentLyric ? (
                  <span style={{
                    fontSize: '12px',
                    color: theme.textSecondary,
                    fontStyle: 'italic',
                  }}>
                    ♪ {currentLyric}
                  </span>
                ) : (
                  <span style={{
                    fontSize: '11px',
                    color: theme.textMuted,
                  }}>
                    {lang === 'zh' ? '暂无歌词' : 'No lyrics'}
                  </span>
                )}
              </div>

              {/* 歌曲列表 */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '11px', color: theme.textMuted, marginBottom: '8px', fontFamily: font.mono }}>
                  {lang === 'zh' ? '播放列表' : 'Playlist'}
                </div>
                {songs.map((track, index) => (
                  <div
                    key={track.id || index}
                    onClick={() => {
                      setCurrentTrack(index)
                      setIsPlaying(true)
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px',
                      borderRadius: radius.sm,
                      cursor: 'pointer',
                      background: index === currentTrack ? theme.bgTertiary : 'transparent',
                      marginBottom: '4px',
                    }}
                  >
                    <div style={{ 
                      width: '24px', 
                      height: '24px', 
                      borderRadius: '4px',
                      background: theme.bgTertiary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {index === currentTrack && isPlaying ? (
                        <div style={{ 
                          width: '4px', 
                          height: '10px', 
                          background: theme.bgAccent,
                          borderRadius: '1px',
                        }} />
                      ) : (
                        <span style={{ fontSize: '10px', color: theme.textMuted }}>{index + 1}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ 
                        fontSize: '12px', 
                        color: index === currentTrack ? theme.textPrimary : theme.textSecondary,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {track.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobile && menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: '48px',
              left: 0,
              right: 0,
              bottom: '24px',
              background: theme.bgPrimary,
              zIndex: 150,
              padding: '16px 12px',
            }}
          >
            <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
                const isActive = location.pathname === path
                return (
                  <button
                    key={path}
                    onClick={() => { navigate(path); setMenuOpen(false) }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: isActive ? theme.bgTertiary : theme.bgSecondary,
                      borderRadius: radius.sm,
                      color: isActive ? theme.textPrimary : theme.textSecondary,
                      textDecoration: 'none',
                      fontSize: '14px',
                      fontWeight: isActive ? 500 : 400,
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    <span>{label}</span>
                  </button>
                )
              })}
              
              <div style={{ height: '1px', background: theme.border, margin: '8px 0' }} />
              
              <button
                onClick={() => { setLang(lang === 'zh' ? 'en' : 'zh'); setMenuOpen(false) }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  background: theme.bgSecondary,
                  borderRadius: radius.sm,
                  color: theme.textSecondary,
                  textDecoration: 'none',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Languages size={18} strokeWidth={1.5} />
                <span>{lang === 'zh' ? 'English' : '中文'}</span>
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <aside style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '48px',
          background: theme.bgSecondary,
          borderRight: `1px solid ${theme.border}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          paddingBottom: '36px',
          zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{ padding: '4px', marginBottom: '16px' }}>
            <button onClick={() => navigate('/')} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>
              <img src="/favicon.ico" alt="怒月" style={{ width: '28px', height: '28px', borderRadius: '4px' }} />
            </button>
          </div>
          
          {/* Navigation */}
          <nav style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: '0 4px',
          }}>
            {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
              const isActive = location.pathname === path
              return (
                <motion.div
                  key={path}
                  whileHover={{ scale: 1.05 }}
                  style={{ position: 'relative' }}
                >
                  <button
                    onClick={() => navigate(path)}
                    style={{
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: radius.sm,
                      color: isActive ? theme.textPrimary : theme.textSecondary,
                      background: isActive ? theme.bgTertiary : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'background 0.15s, color 0.15s',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = theme.bgHover
                        e.currentTarget.style.color = theme.textPrimary
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = theme.textSecondary
                      }
                    }}
                  >
                    <Icon size={18} strokeWidth={1.5} />
                    
                    {isActive && (
                      <div style={{
                        position: 'absolute',
                        left: '-4px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '2px',
                        height: '16px',
                        background: theme.bgAccent,
                        borderRadius: '0 1px 1px 0',
                      }} />
                    )}
                  </button>
                  
                  <div style={{
                    position: 'absolute',
                    left: '44px',
                    top: '6px',
                    padding: '4px 8px',
                    background: theme.bgTertiary,
                    color: theme.textPrimary,
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: font.mono,
                    whiteSpace: 'nowrap',
                    border: `1px solid ${theme.border}`,
                    opacity: 0,
                    pointerEvents: 'none',
                    transition: 'opacity 0.15s',
                    zIndex: 10,
                  }}
                  className="tooltip"
                  >
                    {label}
                  </div>
                </motion.div>
              )
            })}
          </nav>
          
          {/* Bottom controls */}
          <div style={{
            paddingTop: '12px',
            borderTop: `1px solid ${theme.border}`,
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            padding: '0 4px',
          }}>
            <motion.div whileHover={{ scale: 1.05 }} style={{ position: 'relative' }}>
              <button
                onClick={toggleTheme}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: radius.sm,
                  color: theme.textSecondary,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.bgHover
                  e.currentTarget.style.color = theme.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.textSecondary
                }}
              >
                <ThemeIcon size={18} strokeWidth={1.5} />
              </button>
              <div style={{
                position: 'absolute',
                left: '44px',
                top: '6px',
                padding: '4px 8px',
                background: theme.bgTertiary,
                color: theme.textPrimary,
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: font.mono,
                whiteSpace: 'nowrap',
                border: `1px solid ${theme.border}`,
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.15s',
                zIndex: 10,
              }}
              className="tooltip"
              >
                {t('theme.label')}: {themeId === 'light' ? (lang === 'zh' ? '亮色' : 'Light') : (lang === 'zh' ? '暗色' : 'Dark')}
              </div>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} style={{ position: 'relative' }}>
              <button
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: radius.sm,
                  color: theme.textSecondary,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.bgHover
                  e.currentTarget.style.color = theme.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.textSecondary
                }}
              >
                <Languages size={18} strokeWidth={1.5} />
              </button>
              <div style={{
                position: 'absolute',
                left: '44px',
                top: '6px',
                padding: '4px 8px',
                background: theme.bgTertiary,
                color: theme.textPrimary,
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: font.mono,
                whiteSpace: 'nowrap',
                border: `1px solid ${theme.border}`,
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.15s',
                zIndex: 10,
              }}
              className="tooltip"
              >
                {lang === 'zh' ? '中文' : 'English'}
              </div>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} style={{ position: 'relative' }}>
              <button
                onClick={() => window.open('https://github.com/nuyue/MoonShadow', '_blank', 'noopener,noreferrer')}
                style={{
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: radius.sm,
                  color: theme.textSecondary,
                  cursor: 'pointer',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.bgHover
                  e.currentTarget.style.color = theme.textPrimary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = theme.textSecondary
                }}
              >
                <Github size={18} strokeWidth={1.5} />
              </button>
              <div style={{
                position: 'absolute',
                left: '44px',
                top: '6px',
                padding: '4px 8px',
                background: theme.bgTertiary,
                color: theme.textPrimary,
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: font.mono,
                whiteSpace: 'nowrap',
                border: `1px solid ${theme.border}`,
                opacity: 0,
                pointerEvents: 'none',
                transition: 'opacity 0.15s',
                zIndex: 10,
              }}
              className="tooltip"
              >
                GitHub
              </div>
            </motion.div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <main style={{
        marginLeft: isMobile ? 0 : '48px',
        marginTop: isMobile ? '48px' : 0,
        marginBottom: '24px',
        minHeight: isMobile ? 'calc(100vh - 72px)' : 'calc(100vh - 24px)',
        flex: 1,
        overflowY: 'auto',
      }}>
        <Outlet />
      </main>

      {/* Status Bar - JetBrains Style */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: isMobile ? 0 : '48px',
        right: 0,
        height: '24px',
        background: theme.bgSecondary,
        borderTop: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        fontSize: '11px',
        fontFamily: font.mono,
        color: theme.textMuted,
        zIndex: 100,
        whiteSpace: 'nowrap',
      }}>
        {/* 左边：面包屑导航（桌面端显示） */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1 }}>
            <Breadcrumb />
          </div>
        )}

        {/* 右边：音乐播放器（桌面端显示） */}
        {!isMobile && (
          <div 
            onMouseEnter={() => setShowPlayerPanel(true)}
            onMouseLeave={() => setShowPlayerPanel(false)}
            style={{ display: 'flex', alignItems: 'center', flexShrink: 0, position: 'relative' }}
          >
            {showMusicPlayer && (
              <div
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '2px 6px',
                  borderRadius: radius.xs,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  background: showPlayerPanel ? theme.bgTertiary : 'transparent',
                }}
              >
                <Music size={12} color={isPlaying ? theme.bgAccent : theme.textSecondary} strokeWidth={1.5} />
              </div>
            )}

            {/* 悬浮播放器面板 */}
            <AnimatePresence>
              {showMusicPlayer && showPlayerPanel && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    position: 'absolute',
                    bottom: '28px',
                    right: 0,
                    width: '300px',
                    background: theme.bgSecondary,
                    borderRadius: radius.md,
                    border: `1px solid ${theme.border}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                    padding: '12px',
                    zIndex: 1000,
                  }}
                >
                  {/* 歌曲信息 */}
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: theme.textPrimary, marginBottom: '2px' }}>
                      {songs[currentTrack].title}
                    </div>
                    <div style={{ fontSize: '10px', color: theme.textMuted }}>
                      {songs[currentTrack].artist}
                    </div>
                  </div>

                  {/* 进度条 */}
                  <div style={{ marginBottom: '8px' }}>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      style={{
                        width: '100%',
                        height: '4px',
                        background: theme.bgTertiary,
                        borderRadius: '2px',
                        cursor: 'pointer',
                        accentColor: theme.bgAccent,
                      }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: theme.textMuted, marginTop: '2px' }}>
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                  </div>

                  {/* 控制按钮 */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <button
                      onClick={togglePlayMode}
                      style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: playMode === 'order' ? 'transparent' : theme.bgTertiary, 
                        border: 'none', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        cursor: 'pointer',
                        transition: 'transform 0.15s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                      title={playMode === 'order' ? (lang === 'zh' ? '顺序播放' : 'Order') : playMode === 'loop' ? (lang === 'zh' ? '单曲循环' : 'Loop') : (lang === 'zh' ? '随机播放' : 'Random')}
                    >
                      {playMode === 'order' && <Repeat size={12} color={theme.textMuted} />}
                      {playMode === 'loop' && <Repeat1 size={12} color={theme.bgAccent} />}
                      {playMode === 'random' && <Shuffle size={12} color={theme.bgAccent} />}
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={playPrev}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', background: theme.bgTertiary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <SkipBack size={12} color={theme.textPrimary} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={togglePlay}
                      style={{ width: '36px', height: '36px', borderRadius: '50%', background: theme.bgAccent, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      {isPlaying ? <Pause size={14} color={theme.bgPrimary} /> : <Play size={14} color={theme.bgPrimary} style={{ marginLeft: '2px' }} />}
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={playNext}
                      style={{ width: '28px', height: '28px', borderRadius: '50%', background: theme.bgTertiary, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                    >
                      <SkipForward size={12} color={theme.textPrimary} />
                    </motion.button>
                  </div>

                  {/* 歌词显示 - 始终显示，有歌词显示歌词，无歌词显示占位 */}
                  <div style={{ 
                    textAlign: 'center', 
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: `1px solid ${theme.border}`,
                    minHeight: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {songs[currentTrack]?.lyrics && currentLyric ? (
                      <span style={{
                        fontSize: '11px',
                        color: theme.textSecondary,
                        fontStyle: 'italic',
                      }}>
                        ♪ {currentLyric}
                      </span>
                    ) : (
                      <span style={{
                        fontSize: '10px',
                        color: theme.textMuted,
                      }}>
                        {lang === 'zh' ? '暂无歌词' : 'No lyrics'}
                      </span>
                    )}
                  </div>

                  {/* 音量调节 */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginTop: '8px', 
                    paddingTop: '8px', 
                    borderTop: `1px solid ${theme.border}` 
                  }}>
                    {isMuted || volume === 0 ? (
                      <VolumeX size={12} color={theme.textMuted} />
                    ) : (
                      <Volume2 size={12} color={theme.textMuted} />
                    )}
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      style={{
                        flex: 1,
                        height: '4px',
                        background: theme.bgTertiary,
                        borderRadius: '2px',
                        cursor: 'pointer',
                        accentColor: theme.bgAccent,
                      }}
                    />
                    <span style={{ fontSize: '10px', color: theme.textMuted, width: '30px', textAlign: 'right' }}>
                      {Math.round((isMuted ? 0 : volume) * 100)}%
                    </span>
                  </div>

                  {/* 歌曲列表 */}
                  <div style={{ 
                    marginTop: '8px', 
                    paddingTop: '8px', 
                    borderTop: `1px solid ${theme.border}`,
                    maxHeight: '120px',
                    overflowY: 'auto',
                  }}>
                    {songs.map((track, index) => (
                      <div
                        key={track.id || index}
                        onClick={() => {
                          setCurrentTrack(index)
                          setIsPlaying(true)
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '6px 8px',
                          borderRadius: radius.sm,
                          cursor: 'pointer',
                          background: index === currentTrack ? theme.bgTertiary : 'transparent',
                          transition: 'background 0.15s',
                          marginBottom: '2px',
                        }}
                        onMouseEnter={(e) => {
                          if (index !== currentTrack) {
                            e.currentTarget.style.background = theme.bgTertiary
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (index !== currentTrack) {
                            e.currentTarget.style.background = 'transparent'
                          }
                        }}
                      >
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '2px',
                          background: theme.bgTertiary,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {index === currentTrack && isPlaying ? (
                            <div style={{ 
                              width: '4px', 
                              height: '8px', 
                              background: theme.bgAccent,
                              borderRadius: '1px',
                            }} />
                          ) : (
                            <span style={{ fontSize: '9px', color: theme.textMuted }}>{index + 1}</span>
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '11px', 
                            color: index === currentTrack ? theme.textPrimary : theme.textSecondary,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}>
                            {track.title}
                          </div>
                        </div>
                        {index === currentTrack && (
                          <div style={{ 
                            display: 'flex', 
                            gap: '2px',
                          }}>
                            {[1,2,3].map(i => (
                              <div
                                key={i}
                                style={{
                                  width: '2px',
                                  height: `${6 + Math.random() * 6}px`,
                                  background: theme.bgAccent,
                                  borderRadius: '1px',
                                  animation: `equalizer-${i} 0.5s ease-in-out infinite`,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 移动端状态栏占位 */}
        {isMobile && <div style={{ flex: 1 }} />}
      </footer>

      {/* 隐藏的 audio 元素 - 只在有音乐时渲染 */}
      {showMusicPlayer && (
        <audio 
          ref={audioRef}
          src={songs[currentTrack].url}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={playNext}
          style={{ display: 'none' }}
        />
      )}

      {/* Tooltip hover styles */}
      <style>{`
        .tooltip:hover { opacity: 1 !important; }
        a:hover .tooltip, button:hover .tooltip { opacity: 1 !important; }
        
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: ${theme.bgSecondary}; }
        ::-webkit-scrollbar-thumb { background: ${theme.bgTertiary}; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: ${theme.bgHover}; }
        
        ::selection { background: rgba(59, 130, 246, 0.3); color: ${theme.textPrimary}; }
      `}</style>
    </div>
  )
}

export default Layout