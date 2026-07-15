# MoonShadow (月影)

采用现代主题设计构建的博客与开发者工具箱。

## 特性

- **现代 UI 设计** - 简约风格，现代圆角设计
- **主题切换** - 亮色/暗色主题自由切换
- **多语言支持** - 中文/英文双语界面
- **Markdown 写作** - 支持 GFM 语法、代码高亮
- **音乐播放器** - 内置背景音乐播放
- **开发者工具箱** - 26+ 在线工具，覆盖开发常用场景
- **Vite + React 19** - 极速开发体验
- **响应式设计** - 适配桌面端和移动端

## 在线工具箱

内置 26+ 开发者常用工具，分为 14 个类别：

| 类别 | 工具 | 说明 |
|------|------|------|
| 条码/二维码 | 条码/二维码工具 | 生成/识别二维码和条码，支持自定义 Logo |
| 编码转换 | 编码转换工具 | 多种编码格式转换 |
| 加密解密 | 加密解密工具 | 哈希、AES、Bcrypt、HMAC、JWT |
| 格式化 | 格式化工具 | JSON/JS/CSS/SQL/XML/YAML/TOML 格式化转换 |
| 文本处理 | 文本处理工具 | 文本统计/转换/正则等 |
| 文件处理 | 文件解析器 | 解析 PE/ELF/Mach-O 可执行文件 |
| 数值计算 | 数值计算工具 | 进制转换/数学计算/GCD 等 |
| CSS 工具 | CSS 工具集 | 颜色/调色板/对比度/渐变/阴影/单位换算 |
| JSON 工具 | JSON 工具集 | Schema 生成/验证/JSONPath/合并/转换 |
| 常用表 | 常用表 | ASCII/HTTP 状态码/MIME/端口参考 |
| 开发工具 | 开发工具集 | 生成各种配置文件 |
| 时间日期 | 时间戳转换、日期计算、时长格式化、时间格式转换、时区转换、Cron 解析 | 6 个时间相关工具 |
| Web 开发 | URL 解析、User Agent 解析、HTTP 请求头、IP 子网计算 | 4 个 Web 开发工具 |
| 开发辅助 | cURL 转换、OpenAPI 查看器、图标搜索、字体搭配 | 4 个开发辅助工具 |
| SVG 工具 | SVG 优化、SVG 转 Data URI | 2 个 SVG 工具 |

## 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.1 | 前端框架 |
| React Router | 7.x | 路由管理 |
| Vite | 7.x | 构建工具 |
| Tailwind CSS | 4.x | 样式框架 |
| Framer Motion | 12.x | 动画库 |
| Lucide React | 0.525 | 图标库 |
| Marked | 18.x | Markdown 解析 |
| Highlight.js | 11.x | 代码高亮 |
| dayjs | 1.11 | 日期处理 |
| qrcode | 1.5 | 二维码生成 |
| jsqr | 1.4 | 二维码识别 |
| jsbarcode | 3.12 | 条码生成 |
| bcryptjs | 3.0 | 密码哈希 |
| papaparse | 5.5 | CSV 解析 |

## 项目结构

```
moonshadow/
├── articles/               # 文章目录
│   └── <slug>/
│       └── index.md        # 文章内容
├── music/                  # 背景音乐
├── public/                 # 静态资源
├── src/
│   ├── components/         # 公共组件
│   │   ├── Background.jsx  # 背景组件
│   │   ├── Breadcrumb.jsx  # 面包屑导航
│   │   ├── Layout.jsx      # 布局组件
│   │   ├── PageHeader.jsx  # 页面头部
│   │   └── Sidebar.jsx     # 侧边栏
│   ├── context/            # React Context
│   │   ├── LanguageContext.jsx  # 语言上下文
│   │   └── ThemeContext.jsx     # 主题上下文
│   ├── pages/              # 页面组件
│   │   ├── tools/          # 工具页面 (26+ 工具)
│   │   ├── Home.jsx        # 首页
│   │   ├── Posts.jsx       # 文章列表
│   │   ├── Post.jsx        # 文章详情
│   │   ├── Tools.jsx       # 工具箱主页
│   │   ├── About.jsx       # 关于页面
│   │   └── Links.jsx       # 友链页面
│   ├── utils/              # 工具函数
│   │   ├── core.js         # 核心工具
│   │   └── tools.js        # 工具配置
│   └── App.jsx             # 应用入口
├── .trae/
│   └── skills/             # Trae Skills
└── .gitea/
    └── workflows/          # CI/CD 配置
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

## 文章格式

每篇文章需要包含 YAML front matter。支持多语言：

**方式一：单文件（默认语言）**
```
articles/
└── my-post/
    └── index.md
```

**方式二：多语言文件**
```
articles/
└── my-post/
    ├── index.zh.md    # 中文版
    └── index.en.md    # 英文版
```

**Front Matter 格式：**

```markdown
---
title: "文章标题"              # 或 title: { zh: "中文标题", en: "English Title" }
slug: "post-slug"
description: "文章描述"        # 或 description: { zh: "中文描述", en: "English desc" }
date: "2026-07-11"
categories:
  - "Tech"
tags:
  - "Tag1"
  - "Tag2"
cover: ""
---

# 文章标题

正文内容...
```

**多语言回退规则：**
- 如果当前语言版本不存在，回退到中文版
- 如果中文版不存在，回退到英文版

### 可用分类

- `Tech` - 技术相关
- `Dev` - 开发相关
- `Life` - 生活随笔
- `Other` - 其他

## 添加工具

工具定义在 `src/utils/tools.js` 中，添加新工具需要：

1. 在 `toolCategories` 中选择或创建合适的分类
2. 添加工具配置：

```javascript
{
  id: 'tool-id',           // 工具唯一标识
  name: { zh: '工具名称', en: 'Tool Name' },
  icon: 'IconName',        // Lucide 图标名称
  desc: { zh: '工具描述', en: 'Tool description' }
}
```

3. 在 `src/pages/tools/` 目录下创建对应的工具组件

## 友链格式

友情链接定义在 `src/data/links.json` 中，格式：

```json
[
  {
    "name": "网站名称",
    "url": "https://example.com",
    "desc": { "zh": "中文描述", "en": "English description" },
    "logo": "/logo.svg",
    "gradient": "linear-gradient(135deg, #color1, #color2)"
  }
]
```

logo 文件放在 `public/` 目录。

## 部署

### 方式一：直接 Fork 使用（简单）

适合想快速部署、自由修改的用户。

1. **Fork 本仓库**

2. **修改内容**（可选）
   - `articles/` - 添加你的文章
   - `src/data/links.json` - 修改友链
   - `music/` - 添加音乐
   - `src/pages/tools/` - 添加新工具

3. **部署到 Cloudflare Pages**
   - 登录 Cloudflare Dashboard → Pages → 创建项目
   - 连接你 Fork 的仓库
   - 构建命令：`npm run build`
   - 输出目录：`dist`

**优点：** 简单直接，所有内容都在一个仓库里

---

### 方式二：Cloudflare Pages + 私有数据仓库（推荐）

适合想将个人数据与开源代码分离的用户。

**步骤：**

1. **Fork 本仓库**

2. **创建私有数据仓库**
   - Fork 模板仓库 [MoonShadow-Data-Example](https://github.com/nuyue/MoonShadow-Data-Example)
   - 将 Fork 的仓库设为私有（Settings → General → Danger Zone → Change repository visibility → Private）
   - 修改内容为你自己的文章/音乐/友链

   也可以不 Fork，手动创建私有仓库，参考模板仓库的文件格式。

3. **部署到 Cloudflare Pages**
   - 登录 Cloudflare Dashboard → Pages → 创建项目
   - 连接你 Fork 的仓库
   - 构建命令：`npm run build`
   - 输出目录：`dist`

4. **配置环境变量**
   在 Cloudflare Pages 项目设置 → Settings → Environment variables 中添加：
   
   > **重要：** 所有变量必须设置为 **Secret** 类型才能在构建时生效
   
   | 变量名 | 类型 | 说明 |
   |--------|------|------|
   | `DATA_REPO_TOKEN` | Secret | GitHub Personal Access Token（需要私有仓库读取权限） |
   | `DATA_REPO_PATH` | Secret | 数据仓库路径，如 `your-name/MoonShadow-Data`（可选，默认 `nuyue/MoonShadow-Data`） |
   | `DATA_ARTICLES_MERGE` | Secret | 是否合并文章：`true` 合并（默认），`false` 覆盖（可选） |
   | `DATA_MUSIC_MERGE` | Secret | 是否合并音乐：`true` 合并（默认），`false` 覆盖（可选） |
   | `DATA_LINKS_MERGE` | Secret | 是否合并友链：`true` 合并（默认），`false` 覆盖（可选） |
   | `DATA_TOOLS_MERGE` | Secret | 是否合并工具：`true` 合并（默认），`false` 覆盖（可选） |

5. **（可选）配置自动构建**
   私有数据仓库更新后自动触发 Cloudflare Pages 构建：
   
   a. 创建 Cloudflare API Token：
      - 登录 Cloudflare Dashboard → My Profile → API Tokens → Create Token
      - 选择 **Edit Cloudflare Workers** 模板
      - 权限：Account - Cloudflare Pages - Edit
   
   b. 在私有数据仓库添加 GitHub Secrets：
      - 进入私有仓库 → Settings → Secrets and variables → Actions
      - 添加：
      
      | Secret | 值 |
      |--------|-----|
      | `CF_API_TOKEN` | Cloudflare API Token |
      | `CF_ACCOUNT_ID` | 你的 Account ID |
      | `CF_PROJECT_NAME` | CF Pages 项目名称（如 `moonshadow`） |
   
   c. 在私有数据仓库添加 GitHub Actions 工作流：
      ```yaml
      # .github/workflows/deploy.yml
      name: Trigger CF Pages Deploy
      on:
        push:
          branches: [main]
      jobs:
        deploy:
          runs-on: ubuntu-latest
          steps:
            - name: Trigger Cloudflare Pages deployment
              run: |
                curl -X POST \
                  "https://api.cloudflare.com/client/v4/accounts/${{ secrets.CF_ACCOUNT_ID }}/pages/projects/${{ secrets.CF_PROJECT_NAME }}/deployments" \
                  -H "Authorization: Bearer ${{ secrets.CF_API_TOKEN }}" \
                  -H "Content-Type: application/json" \
                  --data '{"branch":"main"}'
      ```

6. **重新部署**
   配置环境变量后，触发重新部署即可使用私有数据

**数据合并说明：**
- `true`（默认）：合并私有数据和示例数据
  - 文章：按目录合并
  - 音乐：按文件合并，歌曲按 `id` 去重
  - 友链：按 `name` 去重合并
  - 工具：按 `id` 去重合并
- `false`：完全使用私有仓库数据，覆盖示例数据

**优点：**
- 个人数据私有，别人看不到
- 部署简单，直接在 Cloudflare 配置
- 方便同步主仓库更新

---

### 方式三：GitHub Actions 部署（私有数据）

适合需要更多自定义控制的用户。

**步骤：**

1. **Fork 本仓库**

2. **创建私有数据仓库**（同方式二）

3. **配置 GitHub Secrets**
   在你 Fork 的仓库 Settings → Secrets and variables → Actions 中添加：
   
   | Secret | 说明 |
   |--------|------|
   | `CLOUDFLARE_API_TOKEN` | Cloudflare API Token（需要 Pages 编辑权限） |
   | `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID |
   | `DATA_REPO_TOKEN` | GitHub Personal Access Token（需要私有仓库读取权限） |
   
   可选变量：
   | Variable | 说明 |
   |----------|------|
   | `DATA_REPO_PATH` | 数据仓库路径，如 `your-name/MoonShadow-Data`（默认 `nuyue/MoonShadow-Data`） |

4. **推送代码**
   配置完成后，每次推送 main 分支都会自动：
   - 拉取私有仓库数据
   - 构建项目
   - 部署到 Cloudflare Pages

**优点：**
- 完全自动化，推代码即部署
- 适合需要 CI/CD 的用户

---

### 方式四：一键部署

**快速部署（使用示例数据）：**

[![Deploy to Cloudflare Pages](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/nuyue/moonshadow)

点击上方按钮即可一键部署，部署后你将看到：
- 1 篇示例文章（Welcome）
- 4 个示例友链
- 26+ 开发者工具

**私有数据部署：**

[![Deploy with Private Data](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/nuyue/moonshadow)

点击上方按钮部署，项目已通过 `wrangler.toml` 预设以下变量默认值：
- `DATA_REPO_PATH` = `nuyue/MoonShadow-Data`
- `DATA_ARTICLES_MERGE` = `true`
- `DATA_MUSIC_MERGE` = `true`
- `DATA_LINKS_MERGE` = `true`
- `DATA_TOOLS_MERGE` = `true`

部署后只需在 Cloudflare Pages → Settings → Environment variables 中添加：
- `DATA_REPO_TOKEN` - GitHub Personal Access Token（必需）

其他变量如需修改，在 Environment variables 中覆盖即可。

**数据文件格式：**

`links.json`:
```json
[
  {
    "name": "网站名称",
    "url": "https://example.com",
    "desc": { "zh": "中文描述", "en": "English description" },
    "logo": "/logo.svg",
    "gradient": "linear-gradient(135deg, #color1, #color2)"
  }
]
```

`music.json`（可选，音乐播放器配置）:
```json
{
  "autoPlay": false,
  "defaultVolume": 50,
  "defaultMode": "loop",
  "songs": [
    {
      "id": "song-id",
      "title": "歌曲名称",
      "artist": "艺术家",
      "file": "song.mp3",
      "lrc": "song.lrc"
    }
  ]
}
```

`tools.json`（可选，用于自定义工具列表）:
```json
[
  {
    "id": "category-id",
    "name": { "zh": "分类名称", "en": "Category Name" },
    "icon": "IconName",
    "color": "#HexColor",
    "tools": [
      {
        "id": "tool-id",
        "name": { "zh": "工具名称", "en": "Tool Name" },
        "icon": "IconName",
        "desc": { "zh": "工具描述", "en": "Tool description" }
      }
    ]
  }
]
```

`tools/`（可选，完全自定义工具）:
- 如果需要添加自定义工具或修改现有工具，可以将 `tools/` 目录放到私有仓库
- 构建时会覆盖主仓库的工具组件
- 结构参考主仓库的 `src/pages/tools/` 目录

## AI Skill

本项目提供了一个 AI skill，用于快速发布内容。

### 安装

将 `skills/moonshadow-publish/` 复制到你的 AI IDE 的 skills 目录：

```bash
# 在你的项目根目录执行
mkdir -p .ai/skills
cp -r skills/moonshadow-publish .ai/skills/
```

### 功能

- 发布文章（单语言/多语言）
- 发布音乐（支持配置文件）
- 发布友链（支持多语言描述）
- 发布工具（支持自定义组件）
- 支持主仓库直接修改和私有数据仓库两种模式

### 使用

安装后，在 Trae IDE 中直接告诉 AI：

- "发布一篇文章"
- "添加一首音乐"
- "添加一个友链"
- "创建一个新工具"

AI 会自动调用 skill 完成操作。

## 设计规范

本项目采用现代简约设计风格：

- **圆角**: 6px (sm) / 12px (md) / 16px (lg)
- **字体**: 等宽字体 (代码) / 系统字体 (UI)
- **图标**: Lucide Icons, stroke-width: 1.5
- **配色**: 深色主题以黑银灰为主，强调色为蓝紫渐变

## 许可证

MIT License