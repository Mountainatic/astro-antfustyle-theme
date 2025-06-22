#!/usr/bin/env node

/**
 * Obsidian到AntfuStyle迁移脚本
 *
 * 功能：
 * 1. 转换Obsidian图片语法 ![[image]] -> ![](./assets/image)
 * 2. 转换内部链接语法 [[link]] -> [link](../link.md)
 * 3. 添加必要的frontmatter
 * 4. 复制图片资源到正确位置
 * 5. 创建目录结构
 */

import fs from 'fs-extra'
import path from 'path'
import matter from 'gray-matter'
import { globSync } from 'glob'

const CONFIG = {
  obsidianVault: './obsidian-vault',  // Obsidian库路径
  targetDir: './src/content',         // 目标路径
  assetsDir: './src/content/assets',  // 资源目录
  backupDir: './backup',              // 备份目录
}

class ObsidianMigrator {
  constructor() {
    this.fileMap = new Map() // 文件名到路径的映射
    this.linkMap = new Map() // 内部链接映射
  }

  async migrate() {
    console.log('🚀 开始迁移Obsidian文档到AntfuStyle主题...')

    try {
      // 1. 创建备份
      await this.createBackup()

      // 2. 扫描并建立文件索引
      await this.buildFileIndex()

      // 3. 创建目标目录结构
      await this.createDirectoryStructure()

      // 4. 处理markdown文件
      await this.processMarkdownFiles()

      // 5. 复制图片资源
      await this.copyAssets()

      console.log('✅ 迁移完成！')
      console.log('📝 请检查生成的文件并根据需要调整frontmatter')

    } catch (error) {
      console.error('❌ 迁移失败：', error.message)
      process.exit(1)
    }
  }

  async createBackup() {
    if (fs.existsSync(CONFIG.targetDir)) {
      console.log('📦 创建备份...')
      await fs.copy(CONFIG.targetDir, CONFIG.backupDir)
    }
  }

  async buildFileIndex() {
    console.log('🔍 扫描文件...')

    const mdFiles = globSync('**/*.md', {
      cwd: CONFIG.obsidianVault,
      ignore: ['**/.*', '**/node_modules/**']
    })

    for (const file of mdFiles) {
      const basename = path.basename(file, '.md')
      const fullPath = path.join(CONFIG.obsidianVault, file)
      this.fileMap.set(basename, {
        originalPath: fullPath,
        relativePath: file,
        basename
      })
    }

    console.log(`📁 找到 ${mdFiles.length} 个markdown文件`)
  }

  async createDirectoryStructure() {
    const dirs = [
      'blog',
      'quick-notes',
      'collections',
      'assets'
    ]

    for (const dir of dirs) {
      await fs.ensureDir(path.join(CONFIG.targetDir, dir))
    }
  }

  async processMarkdownFiles() {
    console.log('🔄 处理markdown文件...')

    for (const [filename, fileInfo] of this.fileMap) {
      await this.processFile(fileInfo)
    }
  }

  async processFile(fileInfo) {
    const content = await fs.readFile(fileInfo.originalPath, 'utf-8')
    const { data: frontmatter, content: markdownContent } = matter(content)

    // 确定目标目录
    const targetCategory = this.determineCategory(fileInfo.relativePath)
    const targetPath = this.getTargetPath(fileInfo, targetCategory)

    // 处理内容
    let processedContent = markdownContent
    processedContent = this.convertImageSyntax(processedContent, fileInfo)
    processedContent = this.convertInternalLinks(processedContent)
    processedContent = this.convertObsidianCallouts(processedContent)

    // 生成frontmatter
    const newFrontmatter = this.generateFrontmatter(fileInfo, targetCategory, frontmatter)

    // 生成最终内容
    const finalContent = matter.stringify(processedContent, newFrontmatter)

    // 确保目标目录存在
    await fs.ensureDir(path.dirname(targetPath))

    // 写入文件
    await fs.writeFile(targetPath, finalContent)

    console.log(`✅ 处理完成: ${fileInfo.relativePath} -> ${path.relative(CONFIG.targetDir, targetPath)}`)
  }

  determineCategory(relativePath) {
    const parts = relativePath.split(path.sep)

    // 根据路径确定分类
    if (parts.includes('learn')) {
      return 'blog' // 学习笔记放在blog中，通过category区分
    } else if (parts.includes('build')) {
      return 'blog' // 项目也放在blog中
    } else if (parts.includes('quick-notes') || parts.includes('problems')) {
      return 'quick-notes'
    } else if (parts.includes('collections') || parts.includes('collect')) {
      return 'collections'
    }

    return 'blog' // 默认
  }

  getTargetPath(fileInfo, category) {
    const relativePath = fileInfo.relativePath
    let targetPath

    if (category === 'blog') {
      // 保持原有目录结构，但移除顶级分类目录
      const pathParts = relativePath.split(path.sep)
      if (pathParts[0] === 'learn' || pathParts[0] === 'build') {
        pathParts.shift() // 移除第一层目录
      }
      targetPath = path.join(CONFIG.targetDir, 'blog', ...pathParts)
    } else {
      targetPath = path.join(CONFIG.targetDir, category, fileInfo.basename + '.md')
    }

    return targetPath
  }

  convertImageSyntax(content, fileInfo) {
    // 转换 ![[image.png]] -> ![](./assets/image.png)
    return content.replace(/!\[\[([^\]]+)\]\]/g, (match, imageName) => {
      // 检查是否有alt text
      const parts = imageName.split('|')
      const filename = parts[0].trim()
      const alt = parts[1] ? parts[1].trim() : ''

      return `![${alt}](./assets/${filename})`
    })
  }

  convertInternalLinks(content) {
    // 转换 [[link]] -> [link](../link.md)
    // 这里简化处理，实际可能需要更复杂的逻辑来解析正确的相对路径
    return content.replace(/\[\[([^\]]+)\]\]/g, (match, linkText) => {
      const parts = linkText.split('|')
      const filename = parts[0].trim()
      const displayText = parts[1] ? parts[1].trim() : filename

      // 查找对应文件
      if (this.fileMap.has(filename)) {
        return `[${displayText}](../${filename}.md)` // 简化的相对路径
      }

      return `[${displayText}](#)` // 如果找不到文件，创建空链接
    })
  }

  convertObsidianCallouts(content) {
    // Obsidian callouts 已经与rehype-callouts兼容，无需转换
    return content
  }

  generateFrontmatter(fileInfo, category, existingFrontmatter = {}) {
    const now = new Date().toISOString().split('T')[0]
    const title = existingFrontmatter.title || fileInfo.basename

    const baseFrontmatter = {
      title,
      description: existingFrontmatter.description || `${title}相关内容`,
      pubDate: existingFrontmatter.pubDate || now,
      lastModDate: existingFrontmatter.lastModDate || '',
      toc: true,
      share: true,
      giscus: true,
      ogImage: true,
      draft: false,
      ...existingFrontmatter
    }

    // 根据分类添加特定字段
    if (category === 'blog') {
      const pathParts = fileInfo.relativePath.split(path.sep)
      let categoryPath = fileInfo.relativePath.replace(/\.md$/, '').replace(/\\/g, '/')

      // 确定项目类型
      let projectType = 'learning'
      if (pathParts.includes('build')) {
        projectType = 'project'
      }

      return {
        ...baseFrontmatter,
        category: categoryPath,
        projectType,
        subtitle: existingFrontmatter.subtitle || '',
        minutesRead: existingFrontmatter.minutesRead || 0,
        radio: false,
        video: false,
        platform: '',
      }
    } else if (category === 'quick-notes') {
      return {
        ...baseFrontmatter,
        category: existingFrontmatter.category || '问题解决',
        noteType: 'quick-note',
        tags: existingFrontmatter.tags || [],
        difficulty: existingFrontmatter.difficulty || 'beginner',
        toc: false,
        giscus: false,
        ogImage: false,
      }
    } else if (category === 'collections') {
      return {
        ...baseFrontmatter,
        category: existingFrontmatter.category || '收集',
        collectionType: existingFrontmatter.collectionType || 'articles',
        source: existingFrontmatter.source || '网络收集',
        toc: false,
        share: false,
        giscus: false,
        ogImage: false,
      }
    }

    return baseFrontmatter
  }

  async copyAssets() {
    console.log('📸 复制图片资源...')

    // 查找所有图片文件
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
    const images = globSync('**/*', {
      cwd: CONFIG.obsidianVault,
      nodir: true
    }).filter(file =>
      imageExtensions.some(ext => file.toLowerCase().endsWith(ext))
    )

    for (const imagePath of images) {
      const sourcePath = path.join(CONFIG.obsidianVault, imagePath)
      const targetPath = path.join(CONFIG.assetsDir, path.basename(imagePath))

      await fs.copy(sourcePath, targetPath)
    }

    console.log(`📸 复制了 ${images.length} 个图片文件`)
  }
}

// 运行迁移
const migrator = new ObsidianMigrator()
migrator.migrate().catch(console.error)

// 使用方法：
// 1. npm install fs-extra gray-matter glob
// 2. 修改CONFIG中的路径
// 3. node migrate-obsidian.js