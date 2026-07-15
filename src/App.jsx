import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider } from './context/LanguageContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Posts from './pages/Posts'
import Post from './pages/Post'
import About from './pages/About'
import Links from './pages/Links'
import Tools from './pages/Tools'
import ToolDetail from './pages/tools/ToolDetail'
import './index.css'

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/articles" element={<Posts />} />
              <Route path="/articles/:slug" element={<Post />} />
              <Route path="/links" element={<Links />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/tools/:id" element={<ToolDetail />} />
              <Route path="/about" element={<About />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App