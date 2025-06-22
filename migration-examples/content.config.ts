import { glob, file } from 'astro/loaders'
import { defineCollection } from 'astro:content'

import { feedLoader } from '@ascorbic/feed-loader'
import { githubReleasesLoader } from 'astro-loader-github-releases'
import { githubPrsLoader } from 'astro-loader-github-prs'

import {
  pageSchema,
  postSchema,
  projectSchema,
  streamSchema,
} from '~/content/schema'

const pages = defineCollection({
  loader: glob({ base: './src/pages', pattern: '**/*.mdx' }),
  schema: pageSchema,
})

const home = defineCollection({
  loader: glob({ base: './src/content/home', pattern: 'index.{md,mdx}' }),
})

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchema,
})

// 新增：速记笔记集合
const quickNotes = defineCollection({
  loader: glob({ base: './src/content/quick-notes', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchema,
})

// 新增：收集内容集合
const collections = defineCollection({
  loader: glob({ base: './src/content/collections', pattern: '**/[^_]*.{md,mdx}' }),
  schema: postSchema,
})

// 保持原有的projects集合，但现在主要从blog内容动态生成
const projects = defineCollection({
  loader: file('src/content/projects/data.json'),
  schema: projectSchema,
})

const changelog = defineCollection({
  loader: glob({
    base: './src/content/changelog',
    pattern: '**/[^_]*.{md,mdx}',
  }),
  schema: postSchema,
})

const streams = defineCollection({
  loader: file('src/content/streams/data.json'),
  schema: streamSchema,
})

const feeds = defineCollection({
  loader: feedLoader({
    url: 'https://astro.build/rss.xml',
  }),
})

const releases = defineCollection({
  loader: githubReleasesLoader({
    mode: 'repoList',
    repos: [
      'withastro/astro',
      'withastro/starlight',
      'lin-stephanie/astro-loaders',
      'lin-stephanie/astro-antfustyle-theme',
    ],
    monthsBack: 2,
    entryReturnType: 'byRelease',
    clearStore: true,
  }),
})

const prs = defineCollection({
  loader: githubPrsLoader({
    search:
      'repo:withastro/astro repo:withastro/starlight repo:lin-stephanie/astro-antfustyle-theme',
    monthsBack: 1,
    clearStore: true,
  }),
})

// 移除原有的highlights collection，改为从quickNotes读取
// const highlights = defineCollection({...})

export const collections = {
  pages,
  home,
  blog,
  quickNotes,
  collections,
  projects,
  changelog,
  streams,
  feeds,
  releases,
  prs,
}