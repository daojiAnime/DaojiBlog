# 标签外挂

> 来源：https://butterfly.js.org/posts/ceeb73f/

标签外挂是 Hexo 独有的功能，可扩展 Markdown 语法。

## Note 提示框

Bootstrap 风格的提示框。

**语法：**
```markdown
{% note [class] [style] %}
内容
{% endnote %}
```

**class 选项：** `default`, `primary`, `success`, `info`, `warning`, `danger`

**style 选项：** `simple`, `modern`, `flat`, `disabled`

**示例：**
```markdown
{% note info flat %}
这是一条信息提示
{% endnote %}

{% note warning modern %}
这是一条警告提示
{% endnote %}

{% note danger simple %}
这是一条危险提示
{% endnote %}
```

**带图标：**
```markdown
{% note info fa-solid fa-lightbulb %}
带自定义图标的提示
{% endnote %}
```

## Gallery 图库

响应式图片画廊。

**本地语法：**
```markdown
{% gallery %}
![图片描述](/img/1.jpg)
![图片描述](/img/2.jpg)
{% endgallery %}
```

**远程 JSON：**
```markdown
{% gallery url="https://xxx.json" %}
{% endgallery %}
```

## Tag-hide 隐藏内容

### 行内隐藏

```markdown
{% hideInline 隐藏内容, 按钮文字, 颜色 %}
```

### 块级隐藏

```markdown
{% hideBlock 按钮文字, 颜色 %}
隐藏的块级内容
{% endhideBlock %}
```

### 折叠面板

```markdown
{% hideToggle 标题, 颜色 %}
可折叠的内容
{% endhideToggle %}
```

**颜色选项：** `default`, `blue`, `pink`, `red`, `purple`, `orange`, `green`

## Mermaid 图表

支持流程图、时序图、状态图、甘特图、饼图等。

**语法：**
```markdown
{% mermaid %}
graph TD
A[开始] --> B{判断}
B -->|是| C[执行]
B -->|否| D[结束]
{% endmermaid %}
```

**时序图：**
```markdown
{% mermaid %}
sequenceDiagram
Alice->>John: Hello John
John-->>Alice: Hi Alice
{% endmermaid %}
```

**需先在配置中启用：**
```yaml
mermaid:
  enable: true
  CDN:
```

## Tabs 选项卡

**语法：**
```markdown
{% tabs 唯一ID %}
<!-- tab 标签1 -->
第一个选项卡内容
<!-- endtab -->
<!-- tab 标签2 -->
第二个选项卡内容
<!-- endtab -->
{% endtabs %}
```

**带图标：**
```markdown
{% tabs test %}
<!-- tab 搜索@fas fa-search -->
搜索内容
<!-- endtab -->
<!-- tab 设置@fas fa-cog -->
设置内容
<!-- endtab -->
{% endtabs %}
```

**指定默认选项卡：**
```markdown
{% tabs test, 2 %}
<!-- 第二个选项卡默认激活 -->
{% endtabs %}
```

## Button 按钮

**语法：**
```markdown
{% btn [url], [文字], [图标], [颜色] %}
```

**示例：**
```markdown
{% btn https://example.com, 访问网站, fas fa-link, blue %}

{% btn https://example.com, 下载, fas fa-download, green larger %}
```

**颜色选项：** `default`, `blue`, `pink`, `red`, `purple`, `orange`, `green`

**大小选项：** `larger`

## Label 行内标签

高亮文字背景色。

**语法：**
```markdown
{% label 文字 颜色 %}
```

**示例：**
```markdown
这是 {% label 重要 red %} 的内容

{% label 默认 default %} {% label 蓝色 blue %} {% label 绿色 green %}
```

## Timeline 时间线

**语法：**
```markdown
{% timeline 标题, 颜色 %}
<!-- timeline 2024-01-01 -->
第一个时间点内容
<!-- endtimeline -->
<!-- timeline 2024-02-01 -->
第二个时间点内容
<!-- endtimeline -->
{% endtimeline %}
```

## Flink 友链

在任意位置插入友链列表。

**语法：**
```markdown
{% flink %}
- class_name: 分类名
  link_list:
    - name: 网站名
      link: https://example.com
      avatar: /img/avatar.jpg
      descr: 描述
{% endflink %}
```

## ABCJS 乐谱

渲染 ABC 记谱法。

**语法：**
```markdown
{% abcjs %}
X:1
T:音乐标题
M:4/4
K:C
CDEF GABc
{% endabcjs %}
```

## Series 文章系列

显示相关文章列表。

**语法：**
```markdown
{% series 系列标识 %}
```

文章 Front-Matter 添加：
```yaml
series: 系列标识
```

## Chartjs 图表

使用 Chart.js 创建图表。

**语法：**
```markdown
{% chart 90% 300 %}
{
  "type": "bar",
  "data": {
    "labels": ["A", "B", "C"],
    "datasets": [{
      "label": "数据",
      "data": [10, 20, 30]
    }]
  }
}
{% endchart %}
```

## 配置启用

大部分标签外挂需在 `_config.butterfly.yml` 中启用：

```yaml
# Note 配置
note:
  style: flat
  icons: true
  border_radius: 3
  light_bg_offset: 0

# 外挂标签
tag_plugins:
  enable: true
  CDN:
    mermaid:
    abcjs:
    chartjs:
```
