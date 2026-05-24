import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Wenai · 餐饮门店 AI 经营工作台',
    short_name: 'Wenai',
    description: '围绕餐厅、菜品、门店活动、本地内容、发布凭证和到店跟进生成可执行工作台。',
    start_url: '/',
    display: 'standalone',
    background_color: '#0e0e11',
    theme_color: '#c8975a',
    orientation: 'portrait-primary',
    categories: ['business', 'productivity'],
    lang: 'zh-CN',
    icons: [
      {
        src: '/icon',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: '实验项目',
        short_name: '项目',
        description: '创建项目或从行业模板开始',
        url: '/dashboard',
      },
      {
        name: '导入 CSV',
        short_name: '导入',
        description: '上传平台表现数据并生成决策',
        url: '/factory',
      },
      {
        name: '定价',
        short_name: '定价',
        description: '查看 Free、Starter 和 Growth 权益',
        url: '/pricing',
      },
    ],
  };
}
