'use strict';

/**
 * Breadcrumb Schema Helper
 * 面包屑导航结构化数据助手
 *
 * @description 为页面生成 BreadcrumbList JSON-LD 结构化数据
 */

hexo.extend.helper.register('breadcrumb_schema', function(page) {
  const config = this.config;

  // 构建面包屑项目列表
  const items = [{
    "@type": "ListItem",
    "position": 1,
    "name": "首页",
    "item": config.url
  }];

  let position = 2;

  // 添加分类路径
  if (page.categories && page.categories.length) {
    page.categories.forEach((cat) => {
      items.push({
        "@type": "ListItem",
        "position": position++,
        "name": cat.name,
        "item": config.url + '/' + cat.path
      });
    });
  }

  // 添加当前文章（不包含 item 属性，表示当前页面）
  if (page.title) {
    items.push({
      "@type": "ListItem",
      "position": position,
      "name": page.title
    });
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items
  };

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 0)}</script>`;
});

/**
 * Website Schema Helper
 * 网站结构化数据助手
 */
hexo.extend.helper.register('website_schema', function() {
  const config = this.config;
  const theme = this.theme;

  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": config.title,
    "url": config.url,
    "description": config.description,
    "author": {
      "@type": "Person",
      "name": config.author || "盗计"
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": config.url + "/?s={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  // 添加社交链接
  if (theme.social) {
    const sameAs = [];
    for (const key in theme.social) {
      if (theme.social[key]) {
        const url = theme.social[key].split('||')[0].trim();
        if (url.startsWith('http')) {
          sameAs.push(url);
        }
      }
    }
    if (sameAs.length) {
      schema.sameAs = sameAs;
    }
  }

  return `<script type="application/ld+json">${JSON.stringify(schema, null, 0)}</script>`;
});
