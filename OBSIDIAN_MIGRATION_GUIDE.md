# Obsidian 到 AntfuStyle 主题迁移指南

## 🎯 迁移目标

将你的Obsidian文档结构完美适配到antfustyle主题，实现：
- **Blog页面**：展示所有文章，按时间排序
- **Projects页面**：展示学习内容和项目，支持分层结构和GitHub外链
- **速记笔记页面**：替换highlights页面
- **收集内容页面**：替换shorts页面

## 📁 建议的Obsidian文件夹结构

```
your-obsidian-vault/
├── learn/                     # 学习笔记 → projects页面
│   ├── MCU/
│   │   ├── STM32/
│   │   │   ├── assets/        # 图片资源
│   │   │   ├── index.md       # 分类介绍（可选）
│   │   │   ├── stm32-basics.md
│   │   │   └── stm32-advanced.md
│   │   └── 8051Series/
│   │       ├── assets/
│   │       └── 8051-tutorial.md
│   └── Language/
│       ├── Python/
│       │   ├── assets/
│       │   └── python-notes.md
│       └── C/
│           ├── assets/
│           └── c-programming.md
├── build/                     # 自制项目 → projects页面
│   ├── hardware-project-1/
│   │   ├── assets/
│   │   ├── index.md           # 项目详情
│   │   └── project.json       # GitHub外链信息（可选）
│   └── software-project-1/
│       ├── assets/
│       └── index.md
├── quick-notes/               # 速记笔记 → highlights页面
│   ├── problem-solving/
│   │   ├── debug-tips.md
│   │   └── error-fixes.md
│   └── daily-learnings/
│       └── insights.md
└── collections/               # 收集内容 → shorts页面
    ├── quotes/
    │   └── inspirational-quotes.md
    ├── images/
    │   ├── assets/
    │   └── image-collection.md
    └── snippets/
        └── code-snippets.md
```

## 🔧 必需的Frontmatter配置

### 1. 学习笔记和项目文章（learn/ 和 build/）

```yaml
---
title: "STM32基础入门"                    # 必需，限60字符
description: "STM32单片机基础知识总结"      # SEO描述
pubDate: 2024-01-15                       # 必需，发布日期
lastModDate: 2024-02-01                   # 可选，最后修改日期
category: "MCU/STM32"                     # 必需，用于projects页面分类
projectType: "learning"                   # learning | project | github-only
# 以下为可选字段
subtitle: "从零开始学习STM32"
toc: true                                 # 是否显示目录
share: true                               # 是否显示分享按钮
giscus: true                              # 是否开启评论
ogImage: true                             # 是否生成OG图片
minutesRead: 15                           # 阅读时间（分钟）
radio: false                              # 是否包含音频内容
video: false                              # 是否包含视频内容
platform: ""                             # 音视频平台
draft: false                              # 是否为草稿
# 仅当projectType为github-only时需要
githubLink: "https://github.com/user/repo"
githubIcon: "i-devicon-github"
---
```

### 2. 速记笔记（quick-notes/）

```yaml
---
title: "解决Linux权限问题"
description: "快速解决Linux文件权限的方法"
pubDate: 2024-01-20
category: "问题解决"
noteType: "quick-note"                    # 标识为速记笔记
tags: ["linux", "permissions", "debug"]   # 标签
difficulty: "beginner"                     # beginner | intermediate | advanced
toc: false
share: true
giscus: false
ogImage: false
---
```

### 3. 收集内容（collections/）

```yaml
---
title: "编程名言收集"
description: "激励程序员的名言警句"
pubDate: 2024-01-25
category: "名言"
collectionType: "quotes"                  # quotes | images | snippets | links
source: "网络收集"                         # 来源
toc: false
share: false
giscus: false
ogImage: false
---
```

## 🔄 迁移步骤

### 第1步：准备工作

1. **安装Obsidian插件**：
   - Templater（用于frontmatter模板）
   - YAML Front Matter（编辑frontmatter）
   - Auto Front Matter（自动添加frontmatter）

2. **创建frontmatter模板**：
   在Obsidian中创建模板文件，自动生成所需的frontmatter。

### 第2步：修改antfustyle配置

修改 `src/content.config.ts` 添加新的集合：

```typescript
// 添加速记笔记集合
const quickNotes = defineCollection({
  loader: glob({ base: './src/content/quick-notes', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchema,
})

// 添加收集内容集合
const collections = defineCollection({
  loader: glob({ base: './src/content/collections', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchema,
})

export const collections = {
  // ... 现有配置
  quickNotes,
  collections,
}
```

### 第3步：修改页面配置

修改 `src/config.ts` 中的导航：

```typescript
export const UI: Ui = {
  internalNavs: [
    // ... 现有配置
    {
      path: '/highlights',
      title: '速记笔记',
      displayMode: 'iconToTextOnMobile',
      text: '速记笔记',
      icon: 'i-ri-lightbulb-line',
    },
    {
      path: '/shorts',
      title: '收集内容',
      displayMode: 'iconToTextOnMobile',
      text: '收集内容',
      icon: 'i-material-symbols-collections-bookmark',
    },
  ],
}
```

### 第4步：创建自定义数据处理函数

在 `src/utils/data.ts` 中添加：

```typescript
/**
 * 从学习笔记和项目中生成projects数据
 */
export async function getProjectsFromContent() {
  const learnPosts = await getCollection('blog', ({ data, id }) => 
    data.category?.startsWith('learn/') || id.startsWith('learn/')
  )
  const buildPosts = await getCollection('blog', ({ data, id }) => 
    data.category?.startsWith('build/') || id.startsWith('build/')
  )
  
  // 生成分层结构的项目数据
  const projects: ProjectSchema[] = []
  
  // 处理学习笔记
  for (const post of learnPosts) {
    if (post.data.projectType === 'github-only') {
      projects.push({
        id: post.data.title,
        link: post.data.githubLink!,
        desc: post.data.description,
        icon: post.data.githubIcon || 'i-devicon-github',
        category: post.data.category || 'Others'
      })
    } else {
      projects.push({
        id: post.data.title,
        link: `/blog/${post.id}`,
        desc: post.data.description,
        icon: getCategoryIcon(post.data.category),
        category: post.data.category || 'Others'
      })
    }
  }
  
  // 处理项目
  for (const post of buildPosts) {
    projects.push({
      id: post.data.title,
      link: post.data.githubLink || `/blog/${post.id}`,
      desc: post.data.description,
      icon: post.data.githubIcon || 'i-material-symbols-build',
      category: post.data.category || 'Projects'
    })
  }
  
  return projects
}

function getCategoryIcon(category?: string): string {
  if (!category) return 'i-material-symbols-article'
  
  const iconMap: Record<string, string> = {
    'MCU': 'i-material-symbols-memory',
    'STM32': 'i-simple-icons-stmicroelectronics',
    '8051': 'i-material-symbols-developer-board',
    'Python': 'i-logos-python',
    'C': 'i-devicon-c',
    'JavaScript': 'i-logos-javascript',
    // 添加更多映射
  }
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (category.includes(key)) return icon
  }
  
  return 'i-material-symbols-article'
}
```

### 第5步：修改页面组件

修改 `src/pages/highlights.mdx` 和 `src/pages/shorts.mdx`：

```astro
---
// highlights.mdx - 速记笔记页面
title: 速记笔记
subtitle: 解决问题的经验记录和快速学习笔记
description: 开发过程中遇到问题的解决方案和快速学习笔记
---

import BaseLayout from '~/layouts/BaseLayout.astro'
import StandardLayout from '~/layouts/StandardLayout.astro'
import ListView from '~/components/views/ListView.astro'

<BaseLayout
  title={frontmatter.title}
  description={frontmatter.description}
  bgType={frontmatter.bgType}
  ogImage={frontmatter.ogImage}
>
  <StandardLayout
    title={frontmatter.title}
    subtitle={frontmatter.subtitle}
    isCentered={true}
  >
    <ListView collectionType="quickNotes" pageToc={frontmatter.toc} />
  </StandardLayout>
</BaseLayout>
```

### 第6步：处理Obsidian语法

**好消息**：antfustyle主题已经完美支持Obsidian的callouts语法！

- `>[!note]` → 自动渲染为美观的提示框
- `>[!tip]` → 技巧提示框
- `>[!warning]` → 警告提示框
- `>[!important]` → 重要信息框
- 支持折叠语法：`>[!note]-` 和 `>[!note]+`

**需要调整的语法**：
- Obsidian的 `![[image.png]]` → 改为 `![](./assets/image.png)`
- Obsidian的内部链接 `[[文章名]]` → 改为标准markdown链接

### 第7步：图片资源处理

1. **创建脚本自动转换图片路径**：
```bash
# 将Obsidian的图片语法转换为相对路径
find . -name "*.md" -exec sed -i 's/!\[\[\([^]]*\)\]\]/![](assets\/\1)/g' {} \;
```

2. **确保每个文件夹都有assets目录**，将图片放在对应位置。

## 🚀 自动化迁移脚本

创建一个迁移脚本来自动处理：

```javascript
// migrate-obsidian.js
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

function migrateObsidianFiles(sourceDir, targetDir) {
  // 递归处理所有markdown文件
  // 1. 添加必需的frontmatter
  // 2. 转换图片语法
  // 3. 转换内部链接
  // 4. 复制图片资源
}

// 运行迁移
migrateObsidianFiles('./obsidian-vault', './src/content')
```

## 📝 测试迁移结果

1. **运行开发服务器**：`pnpm dev`
2. **检查各页面**：
   - `/blog` - 应显示所有文章按时间排序
   - `/projects` - 应显示分类的学习内容和项目
   - `/highlights` - 应显示速记笔记
   - `/shorts` - 应显示收集内容
3. **验证语法渲染**：确保callouts、代码块、图片等正确显示

## 🎨 自定义样式

你可能需要在 `src/styles/markdown.css` 中添加自定义样式：

```css
/* 自定义项目卡片样式 */
.project-card-learning {
  border-left: 4px solid #3b82f6;
}

.project-card-hardware {
  border-left: 4px solid #10b981;
}

/* 自定义速记笔记样式 */
.quick-note-item {
  background: var(--bg-soft);
  border-radius: 8px;
  padding: 1rem;
}
```

## 🔧 高级配置

### 自动生成项目图标

```typescript
// 根据项目类型自动选择图标
function getProjectIcon(category: string, content: string): string {
  if (content.includes('STM32')) return 'i-simple-icons-stmicroelectronics'
  if (content.includes('Arduino')) return 'i-devicon-arduino'
  if (content.includes('Python')) return 'i-logos-python'
  // ... 更多规则
  return 'i-material-symbols-article'
}
```

### 批量生成frontmatter

使用Obsidian的Templater插件创建模板：

```javascript
// 学习笔记模板
<%*
const title = tp.file.title
const now = tp.date.now("YYYY-MM-DD")
const category = tp.file.folder()
%>
---
title: "<% title %>"
description: ""
pubDate: <% now %>
category: "<% category %>"
projectType: "learning"
toc: true
share: true
giscus: true
ogImage: true
---
```

这个迁移方案将帮助你：
1. 保持原有的Obsidian文件夹结构
2. 完美适配antfustyle主题的展示方式
3. 支持所有Obsidian语法（特别是callouts）
4. 实现你想要的分类展示效果
5. 支持GitHub外链项目展示

需要我为任何特定部分提供更详细的说明吗？
