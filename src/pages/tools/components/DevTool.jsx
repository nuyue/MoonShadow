import React from 'react'
import { useTheme } from '../../../context/ThemeContext'
import { useLang } from '../../../context/LanguageContext'
import ToggleGroup from './ui/ToggleGroup'
import CustomSelect from './ui/CustomSelect'

// 模板数据
const TEMPLATES = {
  gitignore: {
    node: `# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
dist/
*.local
.env
.env.local
.env.*.local`,
    python: `# Python
__pycache__/
*.py[cod]
*.so
.Python
build/
dist/
*.egg-info/
.venv/
venv/
.pytest_cache/`,
    java: `# Java
*.class
*.jar
*.war
target/
.idea/
*.iml`,
    rust: `# Rust
/target/
**/*.rs.bk
Cargo.lock
*.pdb`,
    go: `# Go
*.exe
*.exe~
*.dll
*.so
*.dylib
bin/
pkg/`,
    vscode: `# VS Code
.vscode/
*.code-workspace`,
  },
  license: {
    mit: `MIT License

Copyright (c) ${new Date().getFullYear()} [name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`,
    apache: `Apache License
Version 2.0, January 2004
http://www.apache.org/licenses/

Copyright (c) ${new Date().getFullYear()} [name]

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.`,
    bsd: `BSD 3-Clause License

Copyright (c) ${new Date().getFullYear()} [name]

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.`,
  },
  readme: `# Project Name

A brief description of what this project does and who it's for.

## Features

- Feature 1
- Feature 2
- Feature 3

## Installation

\`\`\`bash
npm install package-name
\`\`\`

## Usage

\`\`\`bash
npm start
\`\`\`

## Contributing

Pull requests are welcome.

## License

[MIT](LICENSE)
`,
  changelog: `# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### Added
-

### Changed
-

### Fixed
-

## [1.0.0] - ${new Date().toISOString().split('T')[0]}

### Added
- Initial release
`,
  commitTypes: ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'],
}

const COMMIT_TEMPLATES = [
  { type: 'feat', emoji: '✨', desc: 'A new feature' },
  { type: 'fix', emoji: '🐛', desc: 'A bug fix' },
  { type: 'docs', emoji: '📚', desc: 'Documentation changes' },
  { type: 'style', emoji: '💄', desc: 'Code style changes' },
  { type: 'refactor', emoji: '♻️', desc: 'Code refactoring' },
  { type: 'perf', emoji: '⚡', desc: 'Performance improvements' },
  { type: 'test', emoji: '✅', desc: 'Adding tests' },
  { type: 'chore', emoji: '🔧', desc: 'Maintenance tasks' },
]

// robots.txt 模板
const robotsTemplates = {
  allowAll: `User-agent: *
Allow: /
`,
  disallowAll: `User-agent: *
Disallow: /
`,
  custom: `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
`,
}

// sitemap 模板
const sitemapTemplate = (domain) => `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${domain || 'https://example.com'}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
`

// .htaccess 模板
const htaccessTemplate = `# Enable rewrite engine
RewriteEngine On

# Redirect www to non-www
RewriteCond %{HTTP_HOST} ^www\.(.*)$ [NC]
RewriteRule ^(.*)$ https://%1/$1 [R=301,L]

# Force HTTPS
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript
</IfModule>

# Enable browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
</IfModule>
`

// meta 标签模板
const metaTemplate = (title, desc, url) => `<!-- Primary Meta Tags -->
<title>${title || 'Page Title'}</title>
<meta name="title" content="${title || 'Page Title'}">
<meta name="description" content="${desc || 'Page description'}">

<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="${url || 'https://example.com'}">
<meta property="og:title" content="${title || 'Page Title'}">
<meta property="og:description" content="${desc || 'Page description'}">

<!-- Twitter -->
<meta property="twitter:card" content="summary_large_image">
<meta property="twitter:url" content="${url || 'https://example.com'}">
<meta property="twitter:title" content="${title || 'Page Title'}">
<meta property="twitter:description" content="${desc || 'Page description'}">
`

// SemVer 计算
function bumpVersion(version, type) {
  const parts = version.split('.').map(Number)
  if (parts.length !== 3) return version
  switch (type) {
    case 'major': return `${parts[0] + 1}.0.0`
    case 'minor': return `${parts[0]}.${parts[1] + 1}.0`
    case 'patch': return `${parts[0]}.${parts[1]}.${parts[2] + 1}`
    default: return version
  }
}

export default function DevTool() {
  const { theme, radius, font } = useTheme()
  const { lang } = useLang()
  const [tool, setTool] = React.useState('gitignore')
  const [output, setOutput] = React.useState('')

  // gitignore
  const [gitignoreType, setGitignoreType] = React.useState('node')

  // license
  const [licenseType, setLicenseType] = React.useState('mit')

  // commit
  const [commitType, setCommitType] = React.useState('feat')
  const [commitScope, setCommitScope] = React.useState('')
  const [commitDesc, setCommitDesc] = React.useState('')

  // robots
  const [robotsType, setRobotsType] = React.useState('allowAll')

  // sitemap
  const [sitemapDomain, setSitemapDomain] = React.useState('')

  // meta
  const [metaTitle, setMetaTitle] = React.useState('')
  const [metaDesc, setMetaDesc] = React.useState('')
  const [metaUrl, setMetaUrl] = React.useState('')

  // semver
  const [semverVersion, setSemverVersion] = React.useState('1.0.0')
  const [semverBump, setSemverBump] = React.useState('patch')

  // env diff
  const [env1, setEnv1] = React.useState('')
  const [env2, setEnv2] = React.useState('')

  // 更新输出
  React.useEffect(() => {
    switch (tool) {
      case 'gitignore':
        setOutput(TEMPLATES.gitignore[gitignoreType] || '')
        break
      case 'license':
        setOutput(TEMPLATES.license[licenseType] || '')
        break
      case 'readme':
        setOutput(TEMPLATES.readme)
        break
      case 'changelog':
        setOutput(TEMPLATES.changelog)
        break
      case 'commit':
        const scope = commitScope ? `(${commitScope})` : ''
        setOutput(`${commitType}${scope}: ${commitDesc}`)
        break
      case 'robots':
        setOutput(robotsTemplates[robotsType] || '')
        break
      case 'sitemap':
        setOutput(sitemapTemplate(sitemapDomain))
        break
      case 'htaccess':
        setOutput(htaccessTemplate)
        break
      case 'meta':
        setOutput(metaTemplate(metaTitle, metaDesc, metaUrl))
        break
      case 'semver':
        setOutput(bumpVersion(semverVersion, semverBump))
        break
      case 'envdiff':
        if (!env1 || !env2) { setOutput(''); return }
        const lines1 = new Set(env1.split('\n').filter(l => l.trim() && !l.startsWith('#')))
        const lines2 = new Set(env2.split('\n').filter(l => l.trim() && !l.startsWith('#')))
        const added = [...lines2].filter(l => !lines1.has(l))
        const removed = [...lines1].filter(l => !lines2.has(l))
        setOutput([
          lang === 'zh' ? '新增:' : 'Added:',
          ...added.map(l => `+ ${l}`),
          '',
          lang === 'zh' ? '删除:' : 'Removed:',
          ...removed.map(l => `- ${l}`),
        ].join('\n'))
        break
    }
  }, [tool, gitignoreType, licenseType, commitType, commitScope, commitDesc, robotsType, sitemapDomain, metaTitle, metaDesc, metaUrl, semverVersion, semverBump, env1, env2, lang])

  const copy = () => navigator.clipboard.writeText(output)

  const styles = {
    container: { padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
    toolbar: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' },
    textarea: {
      width: '100%', minHeight: '300px', padding: '12px', background: theme.bgSecondary,
      color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
      fontFamily: font.mono, fontSize: '12px', resize: 'vertical', outline: 'none',
    },
    textareaOutput: {
      width: '100%', minHeight: '300px', padding: '12px', background: theme.bgTertiary,
      color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: radius.md,
      fontFamily: font.mono, fontSize: '12px', resize: 'vertical',
    },
    input: {
      padding: '6px 10px', background: theme.bgSecondary, color: theme.textPrimary,
      border: `1px solid ${theme.border}`, borderRadius: radius.sm, fontFamily: font.mono, fontSize: '12px', outline: 'none',
    },
  }

  const toolOptions = [
    { value: 'gitignore', label: '.gitignore' },
    { value: 'license', label: lang === 'zh' ? '协议' : 'License' },
    { value: 'readme', label: 'README' },
    { value: 'changelog', label: 'Changelog' },
    { value: 'commit', label: lang === 'zh' ? '提交信息' : 'Commit' },
    { value: 'robots', label: 'robots.txt' },
    { value: 'sitemap', label: 'Sitemap' },
    { value: 'htaccess', label: '.htaccess' },
    { value: 'meta', label: lang === 'zh' ? 'Meta标签' : 'Meta' },
    { value: 'semver', label: 'SemVer' },
    { value: 'envdiff', label: lang === 'zh' ? '环境变量对比' : 'Env Diff' },
  ]

  return (
    <div style={styles.container}>
      <ToggleGroup options={toolOptions} value={tool} onChange={setTool} />

      {tool === 'gitignore' && (
        <CustomSelect value={gitignoreType} onChange={setGitignoreType} options={[
          { value: 'node', label: 'Node.js' },
          { value: 'python', label: 'Python' },
          { value: 'java', label: 'Java' },
          { value: 'rust', label: 'Rust' },
          { value: 'go', label: 'Go' },
          { value: 'vscode', label: 'VS Code' },
        ]} />
      )}

      {tool === 'license' && (
        <CustomSelect value={licenseType} onChange={setLicenseType} options={[
          { value: 'mit', label: 'MIT' },
          { value: 'apache', label: 'Apache 2.0' },
          { value: 'bsd', label: 'BSD 3-Clause' },
        ]} />
      )}

      {tool === 'commit' && (
        <>
          <div style={styles.toolbar}>
            <CustomSelect value={commitType} onChange={setCommitType} options={COMMIT_TEMPLATES.map(t => ({ value: t.type, label: `${t.emoji} ${t.type}` }))} />
            <input type="text" value={commitScope} onChange={e => setCommitScope(e.target.value)} placeholder={lang === 'zh' ? '范围(可选)' : 'scope (optional)'} style={{ ...styles.input, width: '120px' }} />
          </div>
          <input type="text" value={commitDesc} onChange={e => setCommitDesc(e.target.value)} placeholder={lang === 'zh' ? '描述' : 'description'} style={styles.input} />
        </>
      )}

      {tool === 'robots' && (
        <CustomSelect value={robotsType} onChange={setRobotsType} options={[
          { value: 'allowAll', label: lang === 'zh' ? '允许所有' : 'Allow All' },
          { value: 'disallowAll', label: lang === 'zh' ? '禁止所有' : 'Disallow All' },
          { value: 'custom', label: lang === 'zh' ? '自定义' : 'Custom' },
        ]} />
      )}

      {tool === 'sitemap' && (
        <input type="text" value={sitemapDomain} onChange={e => setSitemapDomain(e.target.value)} placeholder={lang === 'zh' ? '域名 https://example.com' : 'Domain https://example.com'} style={styles.input} />
      )}

      {tool === 'meta' && (
        <>
          <input type="text" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder={lang === 'zh' ? '页面标题' : 'Page Title'} style={styles.input} />
          <input type="text" value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder={lang === 'zh' ? '页面描述' : 'Page Description'} style={styles.input} />
          <input type="text" value={metaUrl} onChange={e => setMetaUrl(e.target.value)} placeholder={lang === 'zh' ? '页面URL' : 'Page URL'} style={styles.input} />
        </>
      )}

      {tool === 'semver' && (
        <div style={styles.toolbar}>
          <input type="text" value={semverVersion} onChange={e => setSemverVersion(e.target.value)} placeholder="1.0.0" style={{ ...styles.input, width: '100px' }} />
          <CustomSelect value={semverBump} onChange={setSemverBump} options={[
            { value: 'major', label: 'Major' },
            { value: 'minor', label: 'Minor' },
            { value: 'patch', label: 'Patch' },
          ]} />
          <span style={{ color: theme.bgAccent, fontFamily: font.mono }}>= {output}</span>
        </div>
      )}

      {tool === 'envdiff' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <textarea value={env1} onChange={e => setEnv1(e.target.value)} placeholder={lang === 'zh' ? '环境变量 1' : 'Env 1'} style={{ ...styles.textarea, minHeight: '150px' }} />
          <textarea value={env2} onChange={e => setEnv2(e.target.value)} placeholder={lang === 'zh' ? '环境变量 2' : 'Env 2'} style={{ ...styles.textarea, minHeight: '150px' }} />
        </div>
      )}

      {output && tool !== 'semver' && tool !== 'envdiff' && (
        <textarea value={output} readOnly style={styles.textareaOutput} />
      )}

      {tool === 'envdiff' && output && (
        <textarea value={output} readOnly style={styles.textareaOutput} />
      )}

      <button onClick={copy} style={{ padding: '6px 12px', background: theme.bgAccent, color: theme.bgPrimary, border: 'none', borderRadius: radius.sm, cursor: 'pointer', fontFamily: font.ui, fontSize: '12px' }}>
        {lang === 'zh' ? '复制' : 'Copy'}
      </button>
    </div>
  )
}