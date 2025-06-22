<%*
// Templater模板：速记笔记
const title = tp.file.title
const now = tp.date.now("YYYY-MM-DD")
const folder = tp.file.folder()

// 生成category
let category = folder.replace(/quick-notes\//, '').replace(/\\/g, '/')
if (!category) category = "其他"

// 获取问题类型
const noteTypes = ["问题解决", "学习心得", "调试技巧", "配置记录", "错误修复"]
const selectedType = await tp.system.suggester(noteTypes, noteTypes, false, "选择笔记类型")

// 获取难度级别
const difficulties = ["beginner", "intermediate", "advanced"]
const difficulty = await tp.system.suggester(["初级", "中级", "高级"], difficulties, false, "选择难度级别")

// 获取标签
const tagsInput = await tp.system.prompt("输入标签（用逗号分隔）", "")
const tags = tagsInput ? tagsInput.split(',').map(tag => `"${tag.trim()}"`) : []

const desc = await tp.system.prompt("问题描述", `解决${title}相关问题`)
%>
---
title: "<% title %>"
description: "<% desc %>"
pubDate: <% now %>
category: "<% selectedType %>"
noteType: "quick-note"
tags: [<% tags.join(', ') %>]
difficulty: "<% difficulty %>"
toc: false
share: true
giscus: false
ogImage: false
draft: false
---

# <% title %>

## 问题描述

<!-- 详细描述遇到的问题 -->

## 解决方案

<!-- 详细的解决步骤 -->

### 方法一

```bash
# 命令或代码
```

### 方法二（如有）

```bash
# 备选方案
```

## 注意事项

> [!warning] 重要提醒
> 操作时需要注意的事项

## 相关命令/代码

```bash
# 常用相关命令
```

## 参考链接

- [参考1](URL)
- [参考2](URL)

---

*记录时间：<% now %>*
*难度：<% difficulty %>*
*分类：<% selectedType %>*
