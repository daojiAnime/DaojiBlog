---
title: 基于 PaddleNLP 的中文敏感数据智能脱敏系统
tags:
  - Python
  - PaddleNLP
  - NLP
  - 数据安全
  - 开源项目
categories:
  - 技术实践
keywords: '敏感数据脱敏, PaddleNLP, NER, 数据安全, 隐私保护, Gradio, Docker'
description: >-
  本文详细介绍一个基于 PaddleNLP 的中文敏感数据智能脱敏系统的设计与实现。该系统采用正则匹配 + NLP
  命名实体识别的双重识别策略，支持四种脱敏模式，提供 Web 界面和 Docker 一键部署能力。
cover: ''
toc: true
toc_number: true
comments: true
abbrlink: 26158
date: 2025-12-18 16:09:38
updated: 2025-12-18 16:09:38
top_img:
toc_style_simple:
copyright:
copyright_author:
copyright_author_href:
copyright_url:
copyright_info:
mathjax:
katex:
aplayer:
highlight_shrink:
aside:
---

<!--
================ SEO 写作提示 ================

1. 【标题优化】
   - 包含主关键词，控制在 60 字符内
   - 使用数字、疑问句等吸引点击

2. 【Description】(50-160 字符)
   - 概括文章核心内容
   - 包含主关键词
   - 引导用户点击

3. 【Keywords】(3-5 个)
   - 使用逗号分隔
   - 包含长尾关键词
   - 示例: 'Python类型检查, mypy教程, 类型注解'

4. 【首段优化】
   - 前 150 字内包含主关键词
   - 概述文章要解决的问题

5. 【内容结构】
   - 使用 H2/H3 标题组织内容
   - 图片添加 alt 描述
   - 适当使用列表和代码块

===============================================
-->


{% note info flat %}
**本文导读**：介绍一个开源的中文敏感数据智能脱敏系统，结合 {% label 正则匹配 blue %} 和 {% label 深度学习NER purple %} 双重识别策略，支持四种脱敏模式，提供 Web 和 Docker 一键部署。
{% endnote %}

## 前言

在数据驱动的时代，**个人隐私保护**已成为不可忽视的议题。无论是企业的日志系统、客服对话记录，还是数据分析报告，都可能包含大量敏感信息——手机号、身份证号、银行卡号、姓名等。

{% note warning flat %}
《个人信息保护法》和《数据安全法》的实施，对数据脱敏提出了更高要求。传统的正则匹配方案虽然能处理结构化数据（如手机号），但面对「张三给李四转了 5000 元」这类非结构化文本时往往力不从心。
{% endnote %}

本文将介绍一个我开发的开源项目——**敏感数据智能脱敏系统**，它结合了**正则匹配**和**深度学习 NER（命名实体识别）**的优势，实现了对中文文本的智能脱敏处理。

{% btn https://github.com/daojiAnime/sensitive-data-masking, GitHub 项目地址, fab fa-github, blue larger %}

---

## 系统概述

### 核心特性

| 特性 | 说明 |
|------|------|
| {% label 双重识别 blue %} | 正则匹配结构化数据 + NLP 识别非结构化实体 |
| {% label 四种策略 green %} | 部分脱敏、完全脱敏、占位符替换、哈希脱敏 |
| {% label Web purple %} | 基于 Gradio 的现代化交互界面 |
| {% label 容器化 blue %} | Docker 多阶段构建，一键部署 |
| {% label 高性能 green %} | 支持 Intel MKLDNN 加速，fast/accurate 双模式 |

### 技术架构

{% mermaid %}
graph TB
    subgraph UI["Web Layer"]
        A[Gradio 6.1+]
    end

    subgraph APP["Application Layer"]
        B[RegexDesensitizer<br/>正则识别]
        C[NLPDesensitizer<br/>PaddleNLP NER]
        D[CompositeDesensitizer<br/>组合脱敏器]
    end

    subgraph ENGINE["Engine Layer"]
        E[PaddlePaddle 2.6+]
        F[PaddleNLP 2.8+]
    end

    A --> D
    B --> D
    C --> D
    D --> E
    D --> F
{% endmermaid %}

---

## 架构设计

### 设计原则

{% note primary flat %}
在设计这个系统时，遵循了以下原则：
1. **开闭原则**: 对扩展开放，对修改关闭——新增脱敏类型只需扩展，无需修改现有代码
2. **单一职责**: 每个脱敏器只负责一种识别策略
3. **依赖倒置**: 高层模块依赖抽象，而非具体实现
{% endnote %}

### 类结构设计

系统采用 {% label 抽象工厂 blue %} + {% label 策略模式 green %} 的组合设计：

{% tabs 数据结构定义 %}
<!-- tab 实体类型@fas fa-tags -->
```python
class EntityType(Enum):
    """支持的敏感信息类型"""
    PERSON = "人名"           # 人物名称
    LOCATION = "地名"         # 地理位置
    ORGANIZATION = "组织机构"  # 公司/机构
    TIME = "时间"             # 时间表达式
    PHONE = "电话"            # 电话号码
    EMAIL = "邮箱"            # 电子邮件
    ID_CARD = "身份证"        # 身份证号码
    BANK_CARD = "银行卡"      # 银行卡号码
```
<!-- endtab -->
<!-- tab 脱敏策略@fas fa-shield-alt -->
```python
class MaskStrategy(Enum):
    """脱敏策略"""
    FULL = "full"           # 完全脱敏: ***
    PARTIAL = "partial"     # 部分脱敏: 张*三
    HASH = "hash"           # 哈希脱敏: [a1b2c3d]
    PLACEHOLDER = "placeholder"  # 占位符: [人名]
```
<!-- endtab -->
<!-- tab 数据类@fas fa-database -->
```python
@dataclass
class Entity:
    """识别出的敏感实体"""
    text: str              # 实体文本内容
    entity_type: EntityType  # 实体类型
    start: int            # 开始位置
    end: int              # 结束位置
    confidence: float = 1.0  # 置信度

@dataclass
class MaskResult:
    """脱敏处理结果"""
    original_text: str      # 原始文本
    masked_text: str        # 脱敏后文本
    entities: list[Entity]  # 识别的所有实体
```
<!-- endtab -->
{% endtabs %}

### 脱敏器继承体系

{% mermaid %}
classDiagram
    class BaseDesensitizer {
        <<abstract>>
        +strategy: MaskStrategy
        +entity_types: list
        +recognize_entities()* list~Entity~
        +mask_text(text, entity) str
        +desensitize(text) MaskResult
        +display_result(result) void
    }

    class RegexDesensitizer {
        +PATTERNS: dict
        +recognize_entities(text) list~Entity~
    }

    class NLPDesensitizer {
        +TAG_MAPPING: dict
        -_ner: Taskflow
        +recognize_entities(text) list~Entity~
    }

    class CompositeDesensitizer {
        -_regex: RegexDesensitizer
        -_nlp: NLPDesensitizer
        +recognize_entities(text) list~Entity~
        -_remove_overlapping() list~Entity~
    }

    BaseDesensitizer <|-- RegexDesensitizer
    BaseDesensitizer <|-- NLPDesensitizer
    BaseDesensitizer <|-- CompositeDesensitizer
{% endmermaid %}

{% note success flat %}
这种设计的优势：
- **易于扩展**: 新增脱敏方式只需继承 `BaseDesensitizer` 并实现 `recognize_entities()`
- **策略可组合**: 四种脱敏策略可独立选择，与识别方式解耦
- **接口统一**: 所有脱敏器对外暴露相同的 `desensitize()` 接口
{% endnote %}

---

## 核心实现

### 正则脱敏器

对于 {% label 结构化敏感数据 blue %}（手机号、身份证、银行卡、邮箱），正则匹配是最准确高效的方案：

```python
class RegexDesensitizer(BaseDesensitizer):
    """基于正则表达式的脱敏器"""

    # 预定义的正则模式
    PATTERNS: dict[EntityType, str] = {
        EntityType.PHONE: r"1[3-9]\d{9}",  # 中国大陆手机号
        EntityType.EMAIL: r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        EntityType.ID_CARD: r"\d{17}[\dXx]",  # 18位身份证
        EntityType.BANK_CARD: r"\d{16,19}",   # 银行卡号
    }

    def recognize_entities(self, text: str) -> list[Entity]:
        entities = []
        for entity_type, pattern in self.PATTERNS.items():
            if entity_type not in self.entity_types:
                continue
            for match in re.finditer(pattern, text):
                entities.append(Entity(
                    text=match.group(),
                    entity_type=entity_type,
                    start=match.start(),
                    end=match.end(),
                    confidence=1.0  # 正则匹配置信度为 100%
                ))
        return entities
```

{% hideToggle 正则模式详解 %}
| 类型 | 正则表达式 | 说明 |
|------|-----------|------|
| 手机号 | `1[3-9]\d{9}` | 以 1 开头，第二位 3-9，共 11 位 |
| 身份证 | `\d{17}[\dXx]` | 17 位数字 + 1 位数字或 X |
| 银行卡 | `\d{16,19}` | 16-19 位连续数字 |
| 邮箱 | RFC 5322 简化版 | 标准邮箱格式 |
{% endhideToggle %}

### NLP 脱敏器

对于 {% label 非结构化敏感数据 purple %}（人名、地名、组织机构等），借助 NLP 的命名实体识别（NER）能力：

```python
class NLPDesensitizer(BaseDesensitizer):
    """基于 PaddleNLP 的脱敏器"""

    TAG_MAPPING: dict[str, EntityType] = {
        "PER": EntityType.PERSON,
        "LOC": EntityType.LOCATION,
        "ORG": EntityType.ORGANIZATION,
        "TIME": EntityType.TIME,
    }

    def __init__(self, strategy, entity_types, ner_mode="fast"):
        super().__init__(strategy, entity_types)
        self._ner = Taskflow("ner", mode=ner_mode)

    def recognize_entities(self, text: str) -> list[Entity]:
        ner_results = self._ner(text)
        entities = []
        for item in ner_results:
            tag = item.get("type")
            if tag in self.TAG_MAPPING:
                entity_type = self.TAG_MAPPING[tag]
                if entity_type in self.entity_types:
                    entities.append(Entity(
                        text=item["text"],
                        entity_type=entity_type,
                        start=item["start"],
                        end=item["end"],
                        confidence=item.get("probability", 0.9)
                    ))
        return entities
```

{% note info flat %}
**NER 模式对比**

| 指标 | fast 模式 | accurate 模式 |
|------|----------|--------------|
| 模型 | BiGRU-CRF (LAC) | ERNIE + CRF |
| 大小 | ~50MB | ~400MB |
| 延迟 | <100ms | 200-500ms |
| 准确率 | ~90% | ~95% |
| 内存 | ~500MB | ~2GB |
| 场景 | {% label 实时服务 green %} | {% label 批量处理 default %} |
{% endnote %}

### 组合脱敏器

{% mermaid %}
flowchart LR
    A[输入文本] --> B[正则识别]
    A --> C[NLP识别]
    B --> D[合并去重]
    C --> D
    D --> E[脱敏处理]
    E --> F[输出结果]

    style B fill:#e1f5fe
    style C fill:#f3e5f5
    style D fill:#fff3e0
{% endmermaid %}

```python
class CompositeDesensitizer(BaseDesensitizer):
    """组合脱敏器: 正则 + NLP"""

    def recognize_entities(self, text: str) -> list[Entity]:
        # 1. 正则识别 (优先级高，准确率 100%)
        regex_entities = self._regex_desensitizer.recognize_entities(text)

        # 2. NLP 识别 (补充非结构化数据)
        paddle_entities = self._paddle_desensitizer.recognize_entities(text)

        # 3. 去重合并 (避免重复识别同一区域)
        all_entities = regex_entities + paddle_entities
        return self._remove_overlapping(all_entities)
```

---

## 脱敏策略详解

{% tabs 脱敏策略 %}
<!-- tab 部分脱敏@fas fa-user-shield -->
**效果**: `张三` → `张*三`，`13812345678` → `138****5678`

```python
def _partial_mask(self, text: str) -> str:
    if len(text) <= 2:
        return text[0] + "*" * (len(text) - 1)
    return text[0] + "*" * (len(text) - 2) + text[-1]
```

{% note success flat %}
**适用场景**: 人工审核、演示展示、客户沟通记录
{% endnote %}
<!-- endtab -->

<!-- tab 完全脱敏@fas fa-eye-slash -->
**效果**: `张三` → `**`，`13812345678` → `***********`

```python
def _full_mask(self, text: str) -> str:
    return "*" * len(text)
```

{% note success flat %}
**适用场景**: 日志记录、公开数据、合规归档
{% endnote %}
<!-- endtab -->

<!-- tab 占位符@fas fa-tag -->
**效果**: `张三` → `[人名]`，`13812345678` → `[电话]`

```python
def _placeholder_mask(self, entity: Entity) -> str:
    return f"[{entity.entity_type.value}]"
```

{% note success flat %}
**适用场景**: 数据分析、NLP 训练数据、统计报表
{% endnote %}
<!-- endtab -->

<!-- tab 哈希脱敏@fas fa-hashtag -->
**效果**: `张三` → `[4f8b2c1a]`

```python
def _hash_mask(self, text: str) -> str:
    hash_val = hashlib.md5(text.encode()).hexdigest()[:8]
    return f"[{hash_val}]"
```

{% note success flat %}
**适用场景**: 数据对账、可追溯场景、A/B 测试
{% endnote %}
<!-- endtab -->
{% endtabs %}

### 策略选择指南

| 场景 | 推荐策略 | 原因 |
|------|---------|------|
| 客服系统日志 | {% label 部分脱敏 blue %} | 保留可读性，便于问题排查 |
| 公开数据报告 | {% label 完全脱敏 default %} | 最大化隐私保护 |
| 数据分析/BI | {% label 占位符 green %} | 保留语义结构，便于统计 |
| 数据血缘追踪 | {% label 哈希脱敏 purple %} | 可关联原始数据，不可逆推 |

---

## Docker 部署

### 多阶段构建

{% hideToggle 查看完整 Dockerfile %}
```dockerfile
# Stage 1: Builder (依赖安装)
FROM --platform=linux/amd64 ghcr.io/astral-sh/uv:python3.10-bookworm-slim AS builder

WORKDIR /app
ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

RUN --mount=type=cache,target=/root/.cache/uv \
    uv sync --frozen --no-dev --group paddle

# Stage 2: Runtime (运行时)
FROM --platform=linux/amd64 python:3.10-slim AS runtime

RUN useradd -m -u 1000 appuser
WORKDIR /app
COPY --from=builder /app/.venv /app/.venv

ENV FLAGS_use_mkldnn=1
ENV OMP_NUM_THREADS=4

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
    CMD curl -f http://localhost:7860/ || exit 1

USER appuser
CMD ["python", "app.py"]
```
{% endhideToggle %}

### 一键部署

{% tabs 部署方式 %}
<!-- tab 脚本部署@fas fa-terminal -->
```bash
git clone https://github.com/daojiAnime/sensitive-data-masking.git
cd sensitive-data-masking
./scripts/start.sh
```
<!-- endtab -->
<!-- tab Docker Compose@fab fa-docker -->
```bash
docker compose up -d
```
<!-- endtab -->
<!-- tab 直接拉取@fas fa-download -->
```bash
docker run -d -p 7860:7860 \
    -e NER_MODE=fast \
    -v ./models:/app/models \
    ghcr.io/daojianime/sensitive-data-masking:latest
```
<!-- endtab -->
{% endtabs %}

{% note warning flat %}
**内存配置建议**

| 模式 | 最小内存 | 推荐内存 |
|------|---------|---------|
| fast | 1GB | 2GB |
| accurate | 2GB | 4GB |
{% endnote %}

---

## 使用示例

### Python API

```python
from demo import CompositeDesensitizer, MaskStrategy, EntityType

# 创建组合脱敏器
desensitizer = CompositeDesensitizer(
    strategy=MaskStrategy.PARTIAL,
    entity_types=[EntityType.PERSON, EntityType.PHONE, EntityType.ID_CARD],
    ner_mode="fast"
)

# 处理文本
text = """
客户张三（身份证号：110101199001011234）于2024年1月15日
来电咨询，联系电话：13812345678，邮箱：zhangsan@example.com。
"""

result = desensitizer.desensitize(text)
print("脱敏后:", result.masked_text)
```

{% hideToggle 查看输出结果 %}
```
脱敏后: 客户张*三（身份证号：1101011990****1234）于2024年1月15日
来电咨询，联系电话：138****5678，邮箱：zhangsan@example.com。

识别实体: [
    Entity(text='张三', type=PERSON, confidence=0.95),
    Entity(text='110101199001011234', type=ID_CARD, confidence=1.0),
    Entity(text='13812345678', type=PHONE, confidence=1.0),
]
```
{% endhideToggle %}

---

## 扩展开发

{% tabs 扩展开发 %}
<!-- tab 添加实体类型@fas fa-plus -->
```python
# 1. 在 EntityType 枚举中添加新类型
class EntityType(Enum):
    ...
    IP_ADDRESS = "IP地址"  # 新增

# 2. 在 RegexDesensitizer 中添加正则模式
class RegexDesensitizer(BaseDesensitizer):
    PATTERNS = {
        ...
        EntityType.IP_ADDRESS: r"\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}",
    }
```
<!-- endtab -->
<!-- tab 添加脱敏策略@fas fa-cog -->
```python
# 1. 在 MaskStrategy 枚举中添加新策略
class MaskStrategy(Enum):
    ...
    TRUNCATE = "truncate"  # 新增：截断策略

# 2. 在 mask_text() 方法中实现
def mask_text(self, text: str, entity: Entity) -> str:
    ...
    if self.strategy == MaskStrategy.TRUNCATE:
        return text[:3] + "..."
```
<!-- endtab -->
{% endtabs %}

---

## 总结

{% note success flat %}
### 核心优势

1. **识别全面**: 覆盖结构化（手机/身份证/银行卡）和非结构化（人名/地名/组织）敏感信息
2. **策略灵活**: 四种脱敏策略适应不同业务场景
3. **开箱即用**: Gradio Web + Docker 一键部署
4. **易于扩展**: 基于设计模式的架构，方便添加新类型和策略
{% endnote %}

### 适用场景

- 企业日志脱敏
- 客服对话记录处理
- 数据分析报告生成
- 合规数据归档
- NLP 训练数据预处理

{% timeline 未来规划, green %}
<!-- timeline 规划中 -->
- 支持更多实体类型（车牌号、社保号等）
- 支持自定义正则规则配置
<!-- endtimeline -->
<!-- timeline 开发中 -->
- 支持批量文件处理
- 支持 API 服务模式
<!-- endtimeline -->
<!-- timeline 优化中 -->
- 性能优化（GPU 加速）
<!-- endtimeline -->
{% endtimeline %}

{% btn https://github.com/daojiAnime/sensitive-data-masking, Star 项目, fab fa-github, green larger %}
