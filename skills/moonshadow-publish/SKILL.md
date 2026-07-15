---
name: "moonshadow-publish"
description: "Publish articles, tools, and music to MoonShadow blog. Invoke when user wants to add new content or update existing content in the blog project."
---

# MoonShadow 发布助手

这个 skill 用于管理 MoonShadow 博客项目的内容发布。

## 功能

- 发布文章（支持多语言）
- 发布音乐
- 发布友链
- 支持私有数据仓库和主仓库直接修改两种模式

## 仓库模式

### 模式一：主仓库直接修改

适用于用户直接 Fork 仓库使用的情况。

**文件位置：**
- 文章：`articles/<slug>/index.zh.md` + `index.en.md`（多语言）
- 音乐：`music/<filename>.mp3` + `music/<filename>.lrc`（可选）
- 友链：`src/data/links.json`
- 音乐配置：`src/data/music.json`

### 模式二：私有数据仓库

适用于用户配置了 `DATA_REPO_TOKEN` 的情况。

**文件位置：**
- 文章：`articles/<slug>/index.zh.md` + `index.en.md`（多语言）
- 音乐：`music/<filename>.mp3`
- 友链：`links.json`
- 音乐配置：`music.json`

## 发布文章

### 多语言文章（推荐）

创建两个文件：

**中文版 `articles/<slug>/index.zh.md`：**
```markdown
---
title:
  zh: "文章标题"
  en: "Article Title"
slug: "article-slug"
description:
  zh: "文章描述"
  en: "Article description"
date: "2026-01-01"
categories:
  - "Tech"
tags:
  - "标签1"
  - "标签2"
cover: ""
---

## 正文标题

正文内容...
```

**英文版 `articles/<slug>/index.en.md`：**
```markdown
---
title:
  zh: "文章标题"
  en: "Article Title"
slug: "article-slug"
description:
  zh: "文章描述"
  en: "Article description"
date: "2026-01-01"
categories:
  - "Tech"
tags:
  - "Tag1"
  - "Tag2"
cover: ""
---

## Section Title

Content...
```

### 文章 Front Matter 字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | 是 | 多语言对象 `{zh, en}` |
| `slug` | 是 | URL 友好的唯一标识符 |
| `description` | 是 | 多语言对象 `{zh, en}` |
| `date` | 是 | 发布日期，格式：YYYY-MM-DD |
| `categories` | 否 | 分类数组，可选值：Tech, Dev, Life, Other |
| `tags` | 否 | 标签数组 |
| `cover` | 否 | 封面图片路径 |

### 文章 slug 规则

- 只能包含小写字母、数字和连字符
- 用于生成 URL：`/articles/<slug>`

## 发布音乐

### 1. 添加音乐文件

将音乐文件放到 `music/` 目录：
- `<song-name>.mp3` - 音乐文件（必需）
- `<song-name>.lrc` - 歌词文件（可选）

### 2. 更新音乐配置

编辑 `src/data/music.json`（主仓库）或 `music.json`（私有仓库）：

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
      "file": "song-name.mp3",
      "lrc": "song-name.lrc"
    }
  ]
}
```

### 音乐配置字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `id` | 是 | 唯一标识符 |
| `title` | 是 | 歌曲名称 |
| `artist` | 否 | 艺术家 |
| `file` | 是 | 音乐文件名（相对于 music/ 目录） |
| `lrc` | 否 | 歌词文件名（相对于 music/ 目录） |

### 播放模式

- `order` - 顺序播放
- `loop` - 单曲循环
- `random` - 随机播放

## 发布友链

编辑 `src/data/links.json`（主仓库）或 `links.json`（私有仓库）：

```json
[
  {
    "name": "友站名称",
    "url": "https://example.com",
    "desc": {
      "zh": "友站描述（中文）",
      "en": "Site description"
    },
    "logo": "/logo.svg",
    "gradient": "linear-gradient(135deg, #667eea, #764ba2)"
  }
]
```

### 友链字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `name` | 是 | 友站名称 |
| `url` | 是 | 友站链接 |
| `desc` | 是 | 多语言描述对象 `{zh, en}` |
| `logo` | 否 | Logo 图片路径或 URL |
| `gradient` | 否 | 背景渐变 CSS |

## 判断仓库模式

在执行发布操作前，需要判断用户使用的是哪种模式：

1. **检查环境变量**：查看是否配置了 `DATA_REPO_TOKEN`
2. **询问用户**：直接询问用户是修改主仓库还是私有仓库

## 执行流程

1. **确认发布类型**：文章/音乐/友链
2. **确认仓库模式**：主仓库/私有数据仓库
3. **收集必要信息**：标题、内容、标签等
4. **创建/修改文件**：根据模式选择正确的路径
5. **验证格式**：确保 JSON 格式正确、Markdown 格式正确
6. **提交更改**：提交并推送到仓库

## 注意事项

- 文章 slug 只能包含小写字母、数字和连字符
- 音乐文件支持 MP3 格式，歌词支持 LRC 格式
- 多语言内容必须同时提供 `zh` 和 `en` 两个版本
- 私有仓库的更改需要 Cloudflare Pages 重新部署后生效
- 文章 front matter 中的 `title` 和 `description` 推荐使用多语言对象格式