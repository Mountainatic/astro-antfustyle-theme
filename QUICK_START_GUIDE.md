# 快速开始指南 - Obsidian 迁移到 AntfuStyle

## 🎯 核心发现

经过对antfustyle主题的深入分析，我发现：

### ✅ 好消息！
1. **完美支持Obsidian语法**：主题已配置`rehype-callouts`插件，完全支持`>[!note]`等Obsidian callouts语法
2. **灵活的内容结构**：可以通过修改配置轻松适配你的需求
3. **强大的markdown渲染**：支持代码块、图片标注、视频嵌入等高级功能

### 📋 需要修改的核心文件

#### 1. 修改 `src/content.config.ts`
```javascript
// 在现有代码基础上添加新集合
const quickNotes = defineCollection({
  loader: glob({ base: './src/content/quick-notes', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchema,
})

const collections = defineCollection({
  loader: glob({ base: './src/content/collections', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchema,
})

// 在exports中添加
export const collections = {
  // ... 现有配置
  quickNotes,
  collections, // 重命名为collectionsContent避免冲突
}
```

#### 2. 修改 `src/config.ts`
```javascript
// 修改导航标题
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
```

#### 3. 修改 `src/pages/highlights.mdx`
```astro
---
title: 速记笔记
subtitle: 问题解决经验与快速学习记录
description: 开发过程中遇到问题的解决方案和快速学习笔记
---

import ListView from '~/components/views/ListView.astro'

<ListView collectionType="quickNotes" pageToc={frontmatter.toc} />
```

#### 4. 修改 `src/components/views/ListView.astro`
在文件中添加对`quickNotes`和`collections`的支持（仿照现有的blog和changelog处理）

#### 5. 修改 `src/components/views/CardView.astro`
添加对`collections`集合的处理逻辑

## 🏗️ 建议的文件夹结构

### Obsidian库结构
```
obsidian-vault/
├── learn/
│   ├── MCU/STM32/
│   └── Language/Python/
├── build/
│   ├── hardware-projects/
│   └── software-projects/
├── quick-notes/
│   ├── problem-solving/
│   └── debug-tips/
└── collections/
    ├── quotes/
    └── code-snippets/
```

### 迁移后的antfustyle结构
```
src/content/
├── blog/              # 所有学习笔记和项目
│   ├── learn/
│   │   ├── MCU/STM32/
│   │   └── Language/Python/
│   └── build/
│       ├── hardware-projects/
│       └── software-projects/
├── quick-notes/       # 速记笔记
├── collections/       # 收集内容
└── assets/           # 图片资源
```

## 📝 Frontmatter 模板

### 学习笔记 (learn/)
```yaml
---
title: "STM32基础入门"
description: "STM32单片机基础知识总结"
pubDate: 2024-01-15
category: "learn/MCU/STM32"
projectType: "learning"
toc: true
share: true
giscus: true
ogImage: true
---
```

### 项目 (build/)
```yaml
---
title: "智能温控器项目"
description: "基于STM32的温度控制系统"
pubDate: 2024-01-20
category: "build/hardware"
projectType: "project"
githubLink: "https://github.com/user/temp-controller"
githubIcon: "i-devicon-github"
toc: true
share: true
giscus: true
ogImage: true
---
```

### 速记笔记 (quick-notes/)
```yaml
---
title: "解决Linux权限问题"
description: "快速解决Linux文件权限的方法"
pubDate: 2024-01-20
category: "问题解决"
noteType: "quick-note"
tags: ["linux", "permissions"]
difficulty: "beginner"
toc: false
share: true
giscus: false
ogImage: false
---
```

## 🎨 页面效果

### Blog页面
- 显示所有文章（学习笔记+项目+速记笔记+收集内容）
- 按时间倒序排列
- 支持年份分组

### Projects页面
- 按category分组展示学习内容和项目
- 支持GitHub外链和本地文章链接
- 自动生成图标和描述

### 速记笔记页面（原highlights）
- 列表形式展示速记笔记
- 支持按分类筛选
- 突出问题解决相关内容

### 收集内容页面（原shorts）
- 网格形式展示收集的内容
- 支持图片、代码片段、文章等多种类型

## 🚀 迁移步骤

1. **备份现有项目**
2. **按照上述修改核心配置文件**
3. **创建对应的内容目录结构**
4. **复制Obsidian文档，添加frontmatter**
5. **转换图片语法**：`![[image.png]]` → `![](./assets/image.png)`
6. **测试运行**：`pnpm dev`

## 🔧 自动化工具

我已为你准备了：
- 自动迁移脚本（`migration-examples/migrate-obsidian.js`）
- Obsidian模板文件（用于新文章的frontmatter生成）
- 修改后的组件示例

## 💡 关键优势

这个方案的最大优势是：
1. **保持Obsidian工作流**：继续在Obsidian中写作，只需添加frontmatter
2. **完美语法支持**：callouts、代码块、图片等都能正确渲染
3. **灵活分类系统**：通过category实现多层分类
4. **统一管理**：所有内容都在blog collection中，便于搜索和管理

准备好开始迁移了吗？有任何问题随时问我！
