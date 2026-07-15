import { createContext, useContext, useState, useEffect } from 'react'

const LANGUAGES = {
  en: {
    id: 'en',
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
  },
  zh: {
    id: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    dir: 'ltr',
  },
}

const translations = {
  en: {
    nav: {
      home: 'Home',
      posts: 'Posts',
      about: 'About',
    },
    home: {
      title: '怒月',
      subtitle: 'In 2077, they voted my city the worst place to live in America. Main issues? Sky high rate of violence and more people living below the poverty line than anywhere else.',
      badge: 'v2026.1',
      techReact: 'React 19',
      techVite: 'Vite 7',
      techDark: 'Dark UI',
      explore: 'Explore Articles',
      terminalLabel: 'terminal',
      ready: 'Ready in 234ms',
    },
    posts: {
      title: 'Articles',
      back: 'Back to list',
      read: 'READ',
      date: 'DATE',
      tags: 'TAGS',
      allPosts: 'All Posts',
      home: 'Home',
    },
    post: {
      date: 'DATE',
      read: 'READ',
      tags: 'TAGS',
      back: 'Back to list',
      allPosts: 'All Posts',
      home: 'Home',
      prev: 'PREVIOUS',
      next: 'NEXT',
      noPrev: 'No previous article',
      noNext: 'No next article',
    },
    about: {
      title: '怒月',
      subtitle: 'A modern blog built with JetBrains New UI 2026 design system',
      subtitle2: 'Powered by React 19 + Vite 7, featuring dark theme and smooth animations',
      articles: 'Articles',
      performance: 'Performance',
      online: 'Online',
      sourceCode: 'Source Code',
      techStack: 'TECH STACK',
    },
    theme: {
      label: 'Theme',
      light: 'Light',
      dark: 'Dark',
      darcula: 'Darcula',
    },
    lang: {
      label: 'Language',
    },
    common: {
      loading: 'Loading...',
    },
  },
  zh: {
    nav: {
      home: '首页',
      posts: '文章',
      about: '关于',
    },
    home: {
      title: '怒月',
      subtitle: '2077年，我的城市被选为全美最不宜居的地方。主要问题？暴力犯罪率飙升，贫困线下的人数比其他任何地方都多。',
      badge: 'v2026.1',
      techReact: 'React 19',
      techVite: 'Vite 7',
      techDark: '深色 UI',
      explore: '浏览文章',
      terminalLabel: '终端',
      ready: '234ms 内就绪',
    },
    posts: {
      title: '文章列表',
      back: '返回列表',
      read: '阅读',
      date: '日期',
      tags: '标签',
      allPosts: '所有文章',
      home: '首页',
    },
    post: {
      date: '日期',
      read: '阅读',
      tags: '标签',
      back: '返回列表',
      allPosts: '所有文章',
      home: '首页',
      prev: '上一篇',
      next: '下一篇',
      noPrev: '没有更早的文章',
      noNext: '没有更新的文章',
    },
    about: {
      title: '怒月',
      subtitle: '采用 JetBrains New UI 2026 设计系统的现代博客',
      subtitle2: '基于 React 19 + Vite 7 构建，支持深色主题和流畅动画',
      articles: '文章',
      performance: '性能',
      online: '在线',
      sourceCode: '源代码',
      techStack: '技术栈',
    },
    theme: {
      label: '主题',
      light: '亮色',
      dark: '暗色',
      darcula: 'Darcula',
    },
    lang: {
      label: '语言',
    },
    common: {
      loading: '加载中...',
    },
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    const saved = localStorage.getItem('jb-lang')
    return saved && LANGUAGES[saved] ? saved : 'zh'
  })

  useEffect(() => {
    localStorage.setItem('jb-lang', lang)
  }, [lang])

  const t = (key) => {
    const keys = key.split('.')
    let value = translations[lang]
    for (const k of keys) {
      value = value?.[k]
    }
    return value || key
  }

  const value = {
    lang,
    langInfo: LANGUAGES[lang],
    setLang,
    languages: Object.keys(LANGUAGES),
    languageList: Object.values(LANGUAGES),
    t,
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLang must be used within a LanguageProvider')
  }
  return context
}