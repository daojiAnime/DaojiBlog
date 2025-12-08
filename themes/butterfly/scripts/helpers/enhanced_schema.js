'use strict';

/**
 * Enhanced Schema.org Structured Data Helper
 * 增强的结构化数据助手，用于生成 TechArticle Schema
 *
 * @description 为技术博客文章生成详细的 JSON-LD 结构化数据
 */

hexo.extend.helper.register('enhanced_article_schema', function(page) {
  // 仅对文章页面生成 Schema
  if (page.layout !== 'post') return '';

  const config = this.config;
  const theme = this.theme;

  // 获取文章图片
  const getImage = () => {
    if (page.cover) return page.cover;
    if (theme.avatar && theme.avatar.img) return theme.avatar.img;
    return config.url + '/img/default-cover.png';
  };

  // 计算字数（大致估算）
  const getWordCount = () => {
    if (!page.content) return 0;
    // 移除 HTML 标签后计算字符数
    const text = page.content.replace(/<[^>]*>/g, '');
    return text.length;
  };

  // 构建 Schema 对象
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "headline": page.title,
    "url": page.permalink,
    "image": getImage(),
    "datePublished": page.date ? page.date.toISOString() : new Date().toISOString(),
    "dateModified": (page.updated || page.date) ? (page.updated || page.date).toISOString() : new Date().toISOString(),
    "author": {
      "@type": "Person",
      "name": config.author || "盗计",
      "url": config.url
    },
    "publisher": {
      "@type": "Organization",
      "name": config.title,
      "logo": {
        "@type": "ImageObject",
        "url": theme.avatar ? theme.avatar.img : config.url + '/img/logo.png'
      }
    },
    "description": page.description || page.excerpt || '',
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": page.permalink
    },
    "wordCount": getWordCount(),
    "inLanguage": "zh-CN"
  };

  // 添加关键词（如果存在）
  if (page.keywords) {
    schema.keywords = page.keywords;
  } else if (page.tags && page.tags.length) {
    schema.keywords = page.tags.map(tag => tag.name).join(', ');
  }

  // 添加分类信息
  if (page.categories && page.categories.length) {
    const categories = [];
    page.categories.forEach(cat => {
      categories.push(cat.name);
    });
    schema.articleSection = categories.join(' > ');
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 0)}</script>`;
});
