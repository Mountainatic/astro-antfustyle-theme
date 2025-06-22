import { getCollection, render } from 'astro:content'
import { resolvePath } from './path'

import type { CollectionEntry, CollectionKey } from 'astro:content'
import type { CardItemData } from '~/components/views/CardItem.astro'
import type { ProjectSchema } from '~/content/schema'

type CollectionEntryList<K extends CollectionKey = CollectionKey> =
  CollectionEntry<K>[]

/**
 * 从学习笔记和项目中生成projects数据
 */
export async function getProjectsFromContent(): Promise<ProjectSchema[]> {
  const allBlogPosts = await getCollection('blog')

  // 筛选学习笔记和项目
  const learnPosts = allBlogPosts.filter(post =>
    post.data.category?.startsWith('learn/') ||
    post.id.startsWith('learn/') ||
    post.data.projectType === 'learning'
  )

  const buildPosts = allBlogPosts.filter(post =>
    post.data.category?.startsWith('build/') ||
    post.id.startsWith('build/') ||
    post.data.projectType === 'project'
  )

  const projects: ProjectSchema[] = []

  // 处理学习笔记
  for (const post of learnPosts) {
    if (post.data.projectType === 'github-only' && post.data.githubLink) {
      projects.push({
        id: post.data.title,
        link: post.data.githubLink,
        desc: post.data.description || post.data.subtitle || '',
        icon: post.data.githubIcon || 'i-devicon-github',
        category: formatCategory(post.data.category) || 'Learning'
      })
    } else {
      projects.push({
        id: post.data.title,
        link: `/blog/${post.id}`,
        desc: post.data.description || post.data.subtitle || '',
        icon: getCategoryIcon(post.data.category),
        category: formatCategory(post.data.category) || 'Learning'
      })
    }
  }

  // 处理项目
  for (const post of buildPosts) {
    const link = post.data.githubLink || `/blog/${post.id}`
    const icon = post.data.githubLink ?
      (post.data.githubIcon || 'i-devicon-github') :
      'i-material-symbols-build'

    projects.push({
      id: post.data.title,
      link: link,
      desc: post.data.description || post.data.subtitle || '',
      icon: icon,
      category: formatCategory(post.data.category) || 'Projects'
    })
  }

  return projects
}

/**
 * 根据category路径生成合适的图标
 */
function getCategoryIcon(category?: string): string {
  if (!category) return 'i-material-symbols-article'

  const iconMap: Record<string, string> = {
    // MCU相关
    'MCU': 'i-material-symbols-memory',
    'STM32': 'i-simple-icons-stmicroelectronics',
    '8051': 'i-material-symbols-developer-board',
    'Arduino': 'i-devicon-arduino',
    'RaspberryPi': 'i-devicon-raspberrypi',

    // 编程语言
    'Python': 'i-logos-python',
    'JavaScript': 'i-logos-javascript',
    'TypeScript': 'i-logos-typescript-icon',
    'C': 'i-devicon-c',
    'C++': 'i-devicon-cplusplus',
    'Java': 'i-logos-java',
    'Rust': 'i-logos-rust',
    'Go': 'i-logos-go',

    // 前端框架
    'React': 'i-logos-react',
    'Vue': 'i-logos-vue',
    'Astro': 'i-devicon-astro',
    'Next': 'i-devicon-nextjs',

    // 工具和平台
    'Linux': 'i-logos-linux-tux',
    'Docker': 'i-logos-docker-icon',
    'Git': 'i-devicon-git',
    'VSCode': 'i-vscode-icons-file-type-vscode',

    // 数据库
    'MySQL': 'i-logos-mysql',
    'PostgreSQL': 'i-logos-postgresql',
    'MongoDB': 'i-devicon-mongodb',

    // 学习分类
    'Algorithm': 'i-material-symbols-algorithm',
    'DataStructure': 'i-material-symbols-account-tree',
    'Network': 'i-material-symbols-network-node',
    'Security': 'i-material-symbols-security',
  }

  // 检查是否包含任何关键词
  for (const [key, icon] of Object.entries(iconMap)) {
    if (category.toLowerCase().includes(key.toLowerCase())) {
      return icon
    }
  }

  // 根据路径层级选择默认图标
  if (category.includes('/')) {
    const parts = category.split('/')
    if (parts[0] === 'learn') return 'i-material-symbols-school'
    if (parts[0] === 'build') return 'i-material-symbols-build'
  }

  return 'i-material-symbols-article'
}

/**
 * 格式化category显示名称
 */
function formatCategory(category?: string): string {
  if (!category) return 'Others'

  // 移除learn/或build/前缀
  let formatted = category.replace(/^(learn\/|build\/)/, '')

  // 将/替换为更友好的显示
  formatted = formatted.replace(/\//g, ' > ')

  // 首字母大写
  return formatted.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

/**
 * 从快速笔记生成卡片数据
 */
export async function getQuickNotesCards(): Promise<CardItemData[]> {
  const quickNotes = await getCollection('quickNotes')
  const cards: CardItemData[] = []

  for (const note of quickNotes) {
    const basePath = resolvePath('/blog')
    cards.push({
      link: `${basePath}/${note.id}`,
      text: note.data.title,
      html: `<h3>${note.data.title}</h3><p>${note.data.description}</p>`,
      date: note.data.pubDate,
      category: note.data.category,
      tags: note.data.tags,
    })
  }

  return cards.sort((a, b) =>
    new Date(b.date).valueOf() - new Date(a.date).valueOf()
  )
}

/**
 * 从收集内容生成卡片数据
 */
export async function getCollectionsCards(): Promise<CardItemData[]> {
  const collections = await getCollection('collections')
  const cards: CardItemData[] = []

  for (const collection of collections) {
    const { headings } = await render(collection)
    const basePath = resolvePath('/blog')

    // 为每个主要标题创建一个卡片
    const mainHeadings = headings.filter(h => h.depth === 2)

    if (mainHeadings.length > 0) {
      for (const heading of mainHeadings) {
        cards.push({
          link: `${basePath}/${collection.id}#${heading.slug}`,
          text: heading.text,
          html: `<h3>${heading.text}</h3><p>来自：${collection.data.title}</p>`,
          date: collection.data.pubDate,
          category: collection.data.category,
          source: collection.data.source,
        })
      }
    } else {
      // 如果没有标题，创建一个基于文章标题的卡片
      cards.push({
        link: `${basePath}/${collection.id}`,
        text: collection.data.title,
        html: `<h3>${collection.data.title}</h3><p>${collection.data.description}</p>`,
        date: collection.data.pubDate,
        category: collection.data.category,
        source: collection.data.source,
      })
    }
  }

  return cards.sort((a, b) =>
    new Date(b.date).valueOf() - new Date(a.date).valueOf()
  )
}