---
name: "moonshadow-publish"
description: "Publish articles, tools, and music to MoonShadow blog. Invoke when user wants to add new content or update existing content in the blog project."
---

# MoonShadow 发布助手

这个 skill 用于管理 MoonShadow 博客项目的内容发布。

## 功能

- 发布文章
- 发布工具
- 发布音乐
- 发布友链
- 支持私有数据仓库和主仓库直接修改两种模式

## 安装

将此 skill 复制到你的 AI IDE 的 skills 目录：

```
.ai/skills/moonshadow-publish/SKILL.md
```

或者在项目根目录创建 `.ai/skills/` 目录，然后复制 `skills/moonshadow-publish/` 文件夹。

## 仓库模式

### 模式一：主仓库直接修改

适用于用户直接 Fork 仓库使用的情况。

**文件位置：**
- 文章：`articles/<slug>/index.md` 或 `articles/<slug>/index.zh.md` + `index.en.md`
- 工具：`src/pages/tools/components/<ToolName>.jsx`
- 音乐：`music/<filename>.mp3` + `music/<filename>.lrc`（可选）
- 友链：`src/data/links.json`
- 工具配置：`src/data/tools.json`
- 音乐配置：`src/data/music.json`

### 模式二：私有数据仓库

适用于用户配置了 `DATA_REPO_TOKEN` 的情况。

**文件位置：**
- 文章：`articles/<slug>/index.md`
- 工具：`tools/components/<ToolName>.jsx`
- 音乐：`music/<filename>.mp3`
- 友链：`links.json`
- 工具配置：`tools.json`
- 音乐配置：`music.json`

## 发布文章

### 单语言文章

创建文件 `articles/<slug>/index.md`：

```markdown
---
title: 文章标题
date: 2026-01-01
tags: [tag1, tag2]
excerpt: 文章摘要
---

文章内容...
```

### 多语言文章

创建两个文件：

**中文版 `articles/<slug>/index.zh.md`：**
```markdown
---
title: 文章标题（中文）
date: 2026-01-01
tags: [tag1, tag2]
excerpt: 文章摘要（中文）
---

文章内容（中文）...
```

**英文版 `articles/<slug>/index.en.md`：**
```markdown
---
title: Article Title
date: 2026-01-01
tags: [tag1, tag2]
excerpt: Article excerpt
---

Article content...
```

### 文章 Front Matter 字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `title` | 是 | 文章标题（字符串或多语言对象） |
| `date` | 是 | 发布日期，格式：YYYY-MM-DD |
| `tags` | 否 | 标签数组 |
| `excerpt` | 否 | 文章摘要（字符串或多语言对象） |
| `cover` | 否 | 封面图片路径 |

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
      "id": "unique-id",
      "name": "歌曲名称",
      "artist": "艺术家",
      "src": "/music/song-name.mp3",
      "lrc": "/music/song-name.lrc",
      "cover": "/music/song-name.jpg"
    }
  ]
}
```

### 音乐配置字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `id` | 是 | 唯一标识符 |
| `name` | 是 | 歌曲名称 |
| `artist` | 否 | 艺术家 |
| `src` | 是 | 音乐文件路径 |
| `lrc` | 否 | 歌词文件路径 |
| `cover` | 否 | 封面图片路径 |

## 发布友链

编辑 `src/data/links.json`（主仓库）或 `links.json`（私有仓库）：

```json
[
  {
    "name": "友站名称",
    "url": "https://example.com",
    "avatar": "https://example.com/avatar.jpg",
    "description": {
      "zh": "友站描述（中文）",
      "en": "Site description"
    }
  }
]
```

### 友链字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `name` | 是 | 友站名称 |
| `url` | 是 | 友站链接 |
| `avatar` | 否 | 头像图片链接 |
| `description` | 否 | 描述（字符串或多语言对象） |

## 发布工具

### 1. 创建工具组件

创建文件 `src/pages/tools/components/<ToolName>.jsx`（主仓库）或 `tools/components/<ToolName>.jsx`（私有仓库）：

```jsx
import React, { useState } from 'react'

export default function ToolName() {
  const [value, setValue] = useState('')

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">工具名称</h2>
      {/* 工具界面 */}
    </div>
  )
}
```

### 2. 注册工具

编辑 `src/data/tools.json`（主仓库）或 `tools.json`（私有仓库）：

```json
[
  {
    "id": "tool-name",
    "name": {
      "zh": "工具名称（中文）",
      "en": "Tool Name"
    },
    "description": {
      "zh": "工具描述（中文）",
      "en": "Tool description"
    },
    "category": "文本处理",
    "icon": "tool-icon",
    "component": "ToolName"
  }
]
```

### 工具配置字段

| 字段 | 必需 | 说明 |
|------|------|------|
| `id` | 是 | 唯一标识符 |
| `name` | 是 | 工具名称（多语言对象） |
| `description` | 是 | 工具描述（多语言对象） |
| `category` | 是 | 分类名称 |
| `icon` | 否 | 图标名称 |
| `component` | 是 | 组件名称（必须与文件名匹配） |

### 工具分类

- 文本处理
- 编码转换
- 加密解密
- 时间日期
- 网络工具
- 格式转换
- 图片处理
- 开发工具

## 判断仓库模式

在执行发布操作前，需要判断用户使用的是哪种模式：

1. **检查环境变量**：查看是否配置了 `DATA_REPO_TOKEN`
2. **询问用户**：直接询问用户是修改主仓库还是私有仓库
3. **检查私有仓库是否存在**：检查项目根目录是否有 `.trae/private-repo` 标记

## 执行流程

1. **确认发布类型**：文章/音乐/友链/工具
2. **确认仓库模式**：主仓库/私有数据仓库
3. **收集必要信息**：标题、内容、标签等
4. **创建/修改文件**：根据模式选择正确的路径
5. **验证格式**：确保 JSON 格式正确、文件路径存在
6. **提示提交**：提醒用户提交更改并推送

## 注意事项

- 文章 slug 只能包含小写字母、数字和连字符
- 音乐文件支持 MP3 格式，歌词支持 LRC 格式
- 工具组件名称必须以大写字母开头
- 多语言内容必须同时提供 `zh` 和 `en` 两个版本
- 私有仓库的更改需要在 Cloudflare Pages 重新部署后生效