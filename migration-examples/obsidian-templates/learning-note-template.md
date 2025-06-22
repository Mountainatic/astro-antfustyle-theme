<%*
// Templater模板：学习笔记
const title = tp.file.title
const now = tp.date.now("YYYY-MM-DD")
const folder = tp.file.folder()

// 根据文件夹路径自动生成category
let category = folder.replace(/\\/g, '/') // 统一路径分隔符
if (!category.startsWith('learn/')) {
  category = 'learn/' + category
}

// 自动检测项目类型
let projectType = "learning"
if (folder.includes('build') || folder.includes('project')) {
  projectType = "project"
}

// 生成描述提示
const desc = await tp.system.prompt("请输入文章描述", `${title}的学习笔记`)
%>
---
title: "<% title %>"
description: "<% desc %>"
pubDate: <% now %>
lastModDate: ""
category: "<% category %>"
projectType: "<% projectType %>"
subtitle: ""
toc: true
share: true
giscus: true
ogImage: true
minutesRead: 0
radio: false
video: false
platform: ""
draft: false
# 如果是仅GitHub项目，取消注释并填写以下字段：
# githubLink: "https://github.com/username/repo"
# githubIcon: "i-devicon-github"
---

# <% title %>

> [!info] 学习目标
> 在这里描述这篇笔记的学习目标和要点

## 概述

<!-- 在这里写下这个主题的基本概述 -->

## 核心概念

### 概念1

<!-- 详细说明 -->

### 概念2

<!-- 详细说明 -->

## 实践案例

```code
// 在这里放置代码示例
```

> [!tip] 提示
> 重要的提示和技巧

## 常见问题

> [!warning] 注意事项
> 需要注意的问题和坑点

## 相关资源

- [相关链接1](URL)
- [相关链接2](URL)

## 总结

<!-- 总结要点 -->

---

*创建时间：<% now %>*
*分类：<% category %>*
