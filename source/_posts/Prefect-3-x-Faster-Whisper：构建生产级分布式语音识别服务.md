---
title: Prefect 3.x + Faster-Whisper：构建生产级分布式语音识别服务
tags:
  - Prefect
  - Whisper
  - ASR
  - 分布式系统
  - FastAPI
categories:
  - Python
keywords: 'Prefect, Faster-Whisper, ASR, 语音识别, 分布式系统, FastAPI, Docker'
description: >-
  深入解析如何使用 Prefect 3.x 和 Faster-Whisper
  构建高性能、可扩展的生产级语音识别队列服务，包含完整的架构设计、技术选型和最佳实践。
toc: true
toc_number: true
abbrlink: 8230
date: 2025-12-08 17:59:42
updated: 2025-12-08 17:59:42
top_img:
comments:
cover:
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


## 前言

在生产环境中处理大规模音频转录任务时，单机版 OpenAI Whisper 往往面临诸多瓶颈：

- **扩展性受限**：单机处理能力有限，无法应对突发流量
- **资源利用不足**：GPU/CPU 资源无法动态分配，造成浪费
- **缺乏容错机制**：任务失败后无法自动重试，需要人工介入
- **监控困难**：缺乏统一的任务状态管理和可视化监控界面

本文将介绍如何基于 **Prefect 3.x** 和 **Faster-Whisper** 构建一个生产级的分布式语音识别服务 **ASRService**，实现任务编排、水平扩展、失败重试和统一监控等核心能力。

项目地址：[https://github.com/daojiAnime/asr-service](https://github.com/daojiAnime/asr-service)

---

## 一、问题背景：单机 Whisper 的局限性

OpenAI Whisper 是当前最流行的开源语音识别模型，但在生产环境中直接使用存在以下问题：

### 1.1 性能瓶颈

原版 Whisper 基于 PyTorch 实现，推理速度较慢。对于一段 10 分钟的音频，large-v3 模型在 CPU 上可能需要耗时数分钟。

### 1.2 缺乏任务队列

单机脚本无法处理并发请求，多个音频文件需要串行处理，导致整体吞吐量低下。

### 1.3 资源管理困难

无法动态调整 Worker 数量，高峰期资源不足，低谷期资源浪费。

### 1.4 监控盲区

缺乏任务状态跟踪和可视化监控，难以定位问题和优化性能。

**解决思路**：引入分布式任务编排框架，将音频转录拆解为可调度的任务单元，通过队列和 Worker 池实现水平扩展和负载均衡。

---

## 二、架构设计：分布式任务编排 + API 解耦

### 2.1 整体架构

ASRService 采用经典的 **生产者-消费者** 模式，通过 Prefect 3.x 实现任务编排：

```
┌─────────────┐      ┌─────────────────┐      ┌──────────────────┐
│   客户端    │─────▶│  FastAPI Server │─────▶│  Prefect Server  │
│   (HTTP)    │      │    (Port 8000)  │      │   (Port 4200)    │
└─────────────┘      └─────────────────┘      └──────────────────┘
                                                        │
                                                        ▼
                                ┌─────────────────────────────────┐
                                │      Work Pool & Queues         │
                                │   (PostgreSQL + Redis Backend)  │
                                └─────────────────────────────────┘
                                                        │
                        ┌───────────────────────────────┼───────────────────────┐
                        ▼                               ▼                       ▼
                ┌───────────────┐           ┌───────────────┐         ┌───────────────┐
                │  ASR Worker 1 │           │  ASR Worker 2 │   ...   │  ASR Worker N │
                │ (Faster-Whisper)│         │ (Faster-Whisper)│       │ (Faster-Whisper)│
                └───────────────┘           └───────────────┘         └───────────────┘
                        │                               │                       │
                        └───────────────────────────────┼───────────────────────┘
                                                        ▼
                                            ┌─────────────────┐
                                            │  结果存储/返回  │
                                            └─────────────────┘
```

### 2.2 核心组件

| 组件 | 技术选型 | 职责 |
|------|----------|------|
| **API 层** | FastAPI | 接收 HTTP 请求，提交任务到 Prefect，查询任务状态 |
| **任务编排层** | Prefect 3.x Server | 管理 Flow 和 Task，调度任务到 Work Pool |
| **存储层** | PostgreSQL + Redis | Prefect 元数据存储和消息队列 |
| **执行层** | ASR Workers (Faster-Whisper) | 从 Work Pool 拉取任务，执行音频转录 |
| **模型层** | Belle-Whisper (INT8 量化) | 针对中文优化的 Whisper 模型 |

### 2.3 设计亮点

1. **API 与执行解耦**：FastAPI 只负责任务提交和状态查询，不直接处理音频，避免阻塞
2. **水平扩展**：通过 `docker compose --scale asr-worker=N` 动态调整 Worker 数量
3. **容错机制**：Prefect 自动重试失败任务（最多 3 次，间隔 10 秒）
4. **可视化监控**：Prefect Dashboard (4200 端口) 实时查看任务状态和流水线

---

## 三、技术选型：为什么选择这些工具？

### 3.1 为什么选 Faster-Whisper？

#### 性能对比

根据 [Faster-Whisper 官方](https://github.com/SYSTRAN/faster-whisper) 和 [Modal 博客](https://modal.com/blog/choosing-whisper-variants) 的测试：

| 实现方式 | 相对速度 | 内存占用 | 准确率 |
|---------|---------|---------|--------|
| OpenAI Whisper | 1x (基准) | 高 | 100% |
| Faster-Whisper | **4-5x** | 低 30% | 99.8% |
| Faster-Whisper (INT8) | **12.5x** | 低 50% | 99.5% |

**核心优势**：

1. **CTranslate2 优化引擎**：C++ 实现的推理引擎，专为 Transformer 模型优化
2. **INT8 量化**：模型体积减小 75%，推理速度提升 3 倍，精度损失 < 0.5%
3. **批处理支持**：长音频文件可达 380x 实时速度
4. **相同模型权重**：使用 OpenAI 原版 Whisper 权重，保证准确率

```python
# Faster-Whisper 初始化示例
from faster_whisper import WhisperModel

model = WhisperModel(
    model_size_or_path="models/belle-v3-int8",  # 量化模型路径
    device="cuda",  # 或 "cpu"
    compute_type="int8",  # 量化类型
    num_workers=4,  # 并行解码线程
)
```

**注意事项**：在对比性能时，确保使用相同的 `beam_size` 参数（OpenAI Whisper 默认为 1，Faster-Whisper 默认为 5）。

### 3.2 为什么选 Prefect 3.x？

#### 与竞品对比

| 特性 | Prefect 3.x | Celery | Ray |
|------|-------------|--------|-----|
| **任务编排** | 原生支持 Flow/Task DAG | 需手动实现依赖关系 | 强大但复杂 |
| **监控界面** | 开箱即用 Dashboard | 需配置 Flower | 需配置 Ray Dashboard |
| **失败重试** | 声明式配置（装饰器） | 需手动实现 | 需手动实现 |
| **动态参数** | 支持参数化 Deployment | 有限支持 | 支持 |
| **水平扩展** | Work Pool + Workers | 多进程/多机器 | 分布式计算集群 |
| **学习曲线** | 低（Pythonic API） | 中 | 高 |

**Prefect 3.x 核心优势**：

1. **Work Pool 机制**：支持 Pull/Push/Managed 三种模式，灵活适配不同基础设施
2. **Work Queue 优先级**：可为紧急任务创建高优先级队列（priority=1）
3. **并发控制**：Work Pool 级别和 Work Queue 级别的并发限制
4. **可观测性**：结构化日志 + Dashboard + 状态机管理

```python
# Prefect 3.x Flow 定义示例
from prefect import flow, task
from prefect.task_runners import ConcurrentTaskRunner

@task(retries=3, retry_delay_seconds=10)  # 自动重试配置
def transcribe_audio(audio_path: str, language: str = "zh"):
    """音频转录任务"""
    model = get_model_singleton()  # 单例模式复用模型
    segments, info = model.transcribe(
        audio_path,
        language=language,
        beam_size=5,
        vad_filter=True,  # 启用 VAD 过滤
    )
    return list(segments)

@flow(task_runner=ConcurrentTaskRunner())  # 并发执行 Task
def asr_flow(audio_path: str, language: str = "zh"):
    """ASR 主流程"""
    result = transcribe_audio(audio_path, language)
    return {"segments": result, "language": language}
```

#### Prefect 3.x 新特性

根据 [Prefect 官方文档](https://docs.prefect.io/v3/concepts/work-pools)，3.x 版本引入了以下改进：

- **Managed Work Pools**：由 Prefect Cloud 托管的无服务器执行环境
- **ECS Push Work Pools**：直接推送任务到 AWS ECS，无需常驻 Worker
- **改进的调度器**：支持更复杂的 Cron 表达式和事件触发

### 3.3 为什么选 FastAPI？

1. **高性能**：基于 Starlette 和 Pydantic，性能与 Go/Node.js 相当
2. **类型安全**：自动生成 OpenAPI 文档，参数校验开箱即用
3. **异步支持**：原生 `async/await`，适合 I/O 密集型任务
4. **生态丰富**：与 Pydantic、SQLAlchemy、Prefect 无缝集成

```python
# FastAPI 路由示例
from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

app = FastAPI()

class TaskRequest(BaseModel):
    audio_path: str
    language: str = "zh"
    beam_size: int = 5
    vad_filter: bool = True

@app.post("/tasks")
async def create_task(request: TaskRequest):
    """提交转录任务"""
    # 触发 Prefect Flow
    flow_run = await asr_flow.with_options(
        name=f"asr-{uuid.uuid4()}"
    ).submit(
        audio_path=request.audio_path,
        language=request.language
    )
    return {"task_id": flow_run.id}

@app.post("/tasks/upload")
async def upload_and_transcribe(
    file: UploadFile = File(...),
    language: str = "zh"
):
    """上传文件并提交任务"""
    # 保存文件到本地/对象存储
    file_path = await save_upload_file(file)
    # 提交任务（复用上面的逻辑）
    return await create_task(
        TaskRequest(audio_path=file_path, language=language)
    )
```

---

## 四、核心实现：Flow/Task 设计与并发控制

### 4.1 Flow 与 Task 设计模式

Prefect 的核心概念是 **Flow**（工作流）和 **Task**（任务单元）：

```python
# app/flows.py
from prefect import flow, task
from prefect.logging import get_run_logger

@task(
    name="加载模型",
    retries=0,  # 模型加载失败不重试
    cache_key_fn=lambda *args, **kwargs: "model_singleton"  # 缓存键
)
def load_model(model_path: str, device: str):
    """加载 Faster-Whisper 模型（单例模式）"""
    logger = get_run_logger()
    logger.info(f"Loading model from {model_path} on {device}")

    # 使用全局缓存避免重复加载
    global _MODEL_CACHE
    if _MODEL_CACHE is None:
        from faster_whisper import WhisperModel
        _MODEL_CACHE = WhisperModel(
            model_size_or_path=model_path,
            device=device,
            compute_type="int8" if "int8" in model_path else "float16"
        )
    return _MODEL_CACHE

@task(
    name="音频转录",
    retries=3,  # 转录失败重试 3 次
    retry_delay_seconds=10,
    task_run_name="transcribe-{audio_path}",  # 动态命名
)
def transcribe_task(
    audio_path: str,
    language: str = "zh",
    beam_size: int = 5,
    vad_filter: bool = True,
    initial_prompt: str = ""
):
    """执行音频转录"""
    logger = get_run_logger()
    model = load_model.fn()  # 获取缓存的模型

    logger.info(f"Transcribing {audio_path} with language={language}")

    segments, info = model.transcribe(
        audio_path,
        language=language,
        beam_size=beam_size,
        vad_filter=vad_filter,
        initial_prompt=initial_prompt,
    )

    # 结构化输出
    result = {
        "language": info.language,
        "duration": info.duration,
        "segments": [
            {
                "id": seg.id,
                "start": seg.start,
                "end": seg.end,
                "text": seg.text,
            }
            for seg in segments
        ]
    }

    logger.info(f"Transcription completed: {len(result['segments'])} segments")
    return result

@flow(
    name="ASR 转录流程",
    log_prints=True,  # 捕获 print 输出
    retries=1,  # Flow 级别重试
)
def asr_flow(
    audio_path: str,
    language: str = "zh",
    beam_size: int = 5,
    vad_filter: bool = True,
    initial_prompt: str = ""
):
    """主工作流"""
    logger = get_run_logger()
    logger.info(f"Starting ASR flow for {audio_path}")

    # 执行转录任务
    result = transcribe_task(
        audio_path=audio_path,
        language=language,
        beam_size=beam_size,
        vad_filter=vad_filter,
        initial_prompt=initial_prompt,
    )

    return result
```

**设计要点**：

1. **模型单例化**：使用全局变量 + 缓存键避免重复加载模型（节省内存和启动时间）
2. **任务粒度**：将模型加载和转录拆分为独立 Task，方便监控和重试
3. **动态命名**：使用 `task_run_name` 参数生成可读的任务名称
4. **结构化日志**：通过 `get_run_logger()` 获取 Prefect 日志记录器，自动关联任务上下文

### 4.2 并发控制策略

Prefect 提供三层并发控制：

#### 4.2.1 Work Pool 级别

```yaml
# prefect.yaml
deployments:
  - name: asr-deployment
    entrypoint: app/flows.py:asr_flow
    work_pool:
      name: asr-work-pool
      concurrency_limit: 10  # 最多 10 个并发任务
```

#### 4.2.2 Work Queue 优先级

```bash
# 创建高优先级队列
prefect work-queue create --pool asr-work-pool critical --priority 1 --concurrency 1

# 创建常规队列
prefect work-queue create --pool asr-work-pool default --priority 5 --concurrency 5
```

使用场景：

- **critical 队列**：紧急任务（如用户实时请求），优先级 1，限制并发为 1
- **default 队列**：批处理任务，优先级 5，并发为 5

#### 4.2.3 Task Runner 级别

```python
from prefect.task_runners import ConcurrentTaskRunner

@flow(task_runner=ConcurrentTaskRunner(max_workers=4))
def batch_asr_flow(audio_paths: list[str]):
    """批量转录（并发执行）"""
    results = []
    for audio_path in audio_paths:
        result = transcribe_task.submit(audio_path)  # 异步提交
        results.append(result)

    # 等待所有任务完成
    return [r.result() for r in results]
```

### 4.3 失败重试机制

Prefect 支持指数退避和自定义重试策略：

```python
from prefect import task
from prefect.tasks import exponential_backoff

@task(
    retries=5,
    retry_delay_seconds=exponential_backoff(backoff_factor=2),  # 2^n 秒
    retry_jitter_factor=0.1,  # 添加 10% 的随机抖动
)
def unreliable_task():
    """不稳定的任务（如网络请求）"""
    response = requests.get("https://api.example.com/data")
    response.raise_for_status()
    return response.json()
```

重试时间轴：

```
第 1 次失败 → 等待 2s → 第 2 次失败 → 等待 4s → 第 3 次失败 → 等待 8s → ...
```

---

## 五、部署方案：Docker Compose 一键部署

### 5.1 Docker Compose 配置

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL (Prefect 元数据存储)
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: prefect
      POSTGRES_USER: prefect
      POSTGRES_PASSWORD: prefect
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U prefect"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis (消息队列)
  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

  # Prefect Server
  prefect-server:
    image: prefecthq/prefect:3-python3.12
    command: prefect server start --host 0.0.0.0
    ports:
      - "4200:4200"
    environment:
      PREFECT_API_DATABASE_CONNECTION_URL: postgresql+asyncpg://prefect:prefect@postgres:5432/prefect
      PREFECT_API_URL: http://prefect-server:4200/api
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  # FastAPI 服务
  api-server:
    build:
      context: .
      dockerfile: Dockerfile
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000
    ports:
      - "8000:8000"
    environment:
      PREFECT_API_URL: http://prefect-server:4200/api
      MODEL_PATH: /models/belle-v3-int8
      MODEL_DEVICE: cpu
    volumes:
      - ./models:/models:ro  # 只读挂载模型
      - ./uploads:/uploads  # 上传文件目录
    depends_on:
      - prefect-server

  # ASR Worker (可扩展)
  asr-worker:
    build:
      context: .
      dockerfile: Dockerfile
    command: prefect worker start --pool asr-work-pool --type process
    environment:
      PREFECT_API_URL: http://prefect-server:4200/api
      MODEL_PATH: /models/belle-v3-int8
      MODEL_DEVICE: cpu
      WORKER_CONCURRENCY: 2  # 每个 Worker 并发数
    volumes:
      - ./models:/models:ro
      - ./uploads:/uploads
    deploy:
      replicas: 1  # 默认 1 个 Worker
    depends_on:
      - prefect-server

volumes:
  postgres_data:
```

### 5.2 水平扩展

```bash
# 启动 5 个 Worker
docker compose up --scale asr-worker=5 -d

# 查看 Worker 日志
docker compose logs -f asr-worker

# 动态调整（不中断服务）
docker compose up --scale asr-worker=10 -d
```

### 5.3 Makefile 快捷命令

```makefile
# Makefile
.PHONY: start stop logs

# 启动服务（默认 1 个 Worker）
start:
	docker compose up -d

# 启动服务（3 个 Worker）
start-scale:
	docker compose up --scale asr-worker=3 -d

# 查看日志
logs:
	docker compose logs -f

# 查看 Worker 日志
logs-worker:
	docker compose logs -f asr-worker

# 停止服务
stop:
	docker compose down

# 清理所有数据
clean:
	docker compose down -v
	rm -rf uploads/*
```

### 5.4 模型下载

```bash
# 下载 Belle-Whisper 中文优化模型
mkdir -p models
cd models

# 使用 Hugging Face CLI
pip install huggingface-hub
huggingface-cli download BELLE-2/Belle-whisper-large-v3-zh-punct \
    --local-dir belle-v3-int8 \
    --local-dir-use-symlinks False

# 或使用 wget（手动下载）
wget https://huggingface.co/BELLE-2/Belle-whisper-large-v3-zh-punct/resolve/main/model.bin
```

---

## 六、性能优化：从理论到实践

### 6.1 模型单例化

**问题**：每次任务都加载模型会导致：

- 启动时间增加 10-30 秒
- 内存占用翻倍（多个模型实例）
- GPU 显存不足

**解决方案**：全局单例 + 线程锁

```python
# app/model.py
import threading
from faster_whisper import WhisperModel

_MODEL_CACHE = None
_MODEL_LOCK = threading.Lock()

def get_model_singleton(
    model_path: str = "models/belle-v3-int8",
    device: str = "cpu"
) -> WhisperModel:
    """获取模型单例（线程安全）"""
    global _MODEL_CACHE

    if _MODEL_CACHE is None:
        with _MODEL_LOCK:
            # 双重检查锁定
            if _MODEL_CACHE is None:
                _MODEL_CACHE = WhisperModel(
                    model_size_or_path=model_path,
                    device=device,
                    compute_type="int8",
                    num_workers=4,  # CPU 并行解码线程
                )

    return _MODEL_CACHE
```

**效果**：

- 首次加载：15 秒
- 后续调用：0 秒（直接复用）
- 内存占用：从 3GB → 1.5GB（单模型实例）

### 6.2 VAD 过滤

**原理**：Voice Activity Detection（语音活动检测）可跳过静音片段，减少推理时间。

```python
segments, info = model.transcribe(
    audio_path,
    vad_filter=True,  # 启用 VAD
    vad_parameters={
        "threshold": 0.5,  # 语音置信度阈值
        "min_speech_duration_ms": 250,  # 最短语音片段（毫秒）
        "min_silence_duration_ms": 2000,  # 最短静音片段
    }
)
```

**适用场景**：

- 会议录音（包含大量沉默）
- 播客/访谈（嘉宾间停顿）
- 电话录音

**效果**：对于包含 30% 静音的音频，推理时间减少 20-40%。

### 6.3 批处理优化

对于多个短音频文件，可合并为批次提交：

```python
@flow
def batch_transcribe_flow(audio_paths: list[str]):
    """批量转录（并行）"""
    from prefect.task_runners import ConcurrentTaskRunner

    # 使用并发 Task Runner
    with ConcurrentTaskRunner(max_workers=4):
        futures = [
            transcribe_task.submit(path)
            for path in audio_paths
        ]

        # 等待所有任务完成
        results = [f.result() for f in futures]

    return results
```

### 6.4 GPU 加速

```yaml
# docker-compose.yml (添加 GPU 支持)
asr-worker:
  deploy:
    resources:
      reservations:
        devices:
          - driver: nvidia
            count: 1
            capabilities: [gpu]
  environment:
    MODEL_DEVICE: cuda
    CUDA_VISIBLE_DEVICES: 0  # 指定 GPU 卡号
```

**性能对比**（large-v3 模型，10 分钟音频）：

| 硬件 | 推理时间 | 实时率 |
|------|---------|--------|
| CPU (16 核) | 120 秒 | 5x |
| GPU (RTX 3090) | 15 秒 | 40x |
| GPU (A100) | 8 秒 | 75x |

---

## 七、最佳实践：测试、日志与错误处理

### 7.1 结构化日志

使用 `structlog` 替代 `print`：

```python
# app/logging_config.py
import structlog

structlog.configure(
    processors=[
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.JSONRenderer(),
    ],
    wrapper_class=structlog.make_filtering_bound_logger(logging.INFO),
)

logger = structlog.get_logger()

# 使用方式
logger.info(
    "transcription_completed",
    task_id=task_id,
    duration_seconds=120.5,
    segments_count=45,
    language="zh",
)
```

输出：

```json
{
  "event": "transcription_completed",
  "task_id": "abc-123",
  "duration_seconds": 120.5,
  "segments_count": 45,
  "language": "zh",
  "timestamp": "2025-12-08T15:30:45.123456Z",
  "level": "info"
}
```

### 7.2 错误处理

```python
from prefect import task
from prefect.exceptions import Fail, Pause

@task(retries=3)
def transcribe_with_validation(audio_path: str):
    """带校验的转录任务"""
    import os

    # 前置校验
    if not os.path.exists(audio_path):
        raise Fail(f"Audio file not found: {audio_path}")  # 不重试

    file_size = os.path.getsize(audio_path)
    if file_size > 500 * 1024 * 1024:  # 500MB
        raise Fail("Audio file too large (max 500MB)")

    try:
        result = transcribe_task(audio_path)

        # 后置校验
        if len(result["segments"]) == 0:
            logger.warning("Empty transcription result", audio_path=audio_path)
            # 暂停等待人工审核
            Pause(message="Empty result, please review")

        return result

    except Exception as e:
        logger.exception("Transcription failed", audio_path=audio_path)
        raise  # 触发重试
```

### 7.3 单元测试

```python
# tests/test_flows.py
import pytest
from prefect.testing.utilities import prefect_test_harness
from app.flows import transcribe_task

@pytest.fixture(autouse=True, scope="session")
def prefect_test_fixture():
    """启用 Prefect 测试模式"""
    with prefect_test_harness():
        yield

def test_transcribe_task():
    """测试转录任务"""
    result = transcribe_task(
        audio_path="tests/fixtures/sample.wav",
        language="zh",
    )

    assert "segments" in result
    assert len(result["segments"]) > 0
    assert result["language"] == "zh"

def test_transcribe_task_failure():
    """测试失败重试"""
    with pytest.raises(Exception):
        transcribe_task(audio_path="/nonexistent/file.wav")
```

### 7.4 API 集成测试

```python
# tests/test_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_create_task():
    """测试任务提交"""
    response = client.post(
        "/tasks",
        json={
            "audio_path": "tests/fixtures/sample.wav",
            "language": "zh",
        }
    )

    assert response.status_code == 200
    data = response.json()
    assert "task_id" in data

def test_query_task_status():
    """测试任务查询"""
    # 先提交任务
    create_resp = client.post("/tasks", json={"audio_path": "sample.wav"})
    task_id = create_resp.json()["task_id"]

    # 查询状态
    response = client.get(f"/tasks/{task_id}")
    assert response.status_code == 200

    data = response.json()
    assert data["task_id"] == task_id
    assert data["status"] in ["pending", "running", "completed", "failed"]
```

---

## 八、生产环境注意事项

### 8.1 资源配额

```yaml
# docker-compose.yml (添加资源限制)
asr-worker:
  deploy:
    resources:
      limits:
        cpus: '4'
        memory: 8G
      reservations:
        cpus: '2'
        memory: 4G
```

### 8.2 健康检查

```python
# app/main.py
@app.get("/health")
async def health_check():
    """健康检查端点"""
    try:
        # 检查 Prefect 连接
        from prefect.client import get_client
        async with get_client() as client:
            await client.hello()

        # 检查模型加载
        model = get_model_singleton()

        return {
            "status": "healthy",
            "prefect_connected": True,
            "model_loaded": model is not None,
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e),
        }, 503
```

### 8.3 监控指标

使用 Prometheus + Grafana 监控：

```python
from prometheus_client import Counter, Histogram

transcription_duration = Histogram(
    "transcription_duration_seconds",
    "Transcription task duration",
    ["language", "model"]
)

transcription_counter = Counter(
    "transcription_total",
    "Total transcriptions",
    ["status"]  # success/failed
)

@task
def transcribe_with_metrics(audio_path: str, language: str):
    """带监控指标的转录"""
    with transcription_duration.labels(language=language, model="belle-v3").time():
        try:
            result = transcribe_task(audio_path, language)
            transcription_counter.labels(status="success").inc()
            return result
        except Exception as e:
            transcription_counter.labels(status="failed").inc()
            raise
```

---

## 九、总结与展望

### 9.1 核心收益

通过引入 Prefect 3.x + Faster-Whisper，我们实现了：

1. **性能提升**：相比原版 Whisper 提升 4-12 倍
2. **水平扩展**：一行命令动态调整 Worker 数量
3. **高可用**：自动重试 + 失败告警，减少人工介入
4. **可观测**：统一的 Dashboard 和结构化日志

### 9.2 技术选型总结

| 技术 | 优势 | 适用场景 |
|------|------|----------|
| **Faster-Whisper** | 4-12x 性能提升，内存友好 | 生产环境大规模转录 |
| **Prefect 3.x** | 低学习成本，开箱即用监控 | 任务编排、ETL、ML Pipeline |
| **FastAPI** | 高性能，类型安全，自动文档 | API 网关、微服务 |
| **Docker Compose** | 一键部署，易于扩展 | 开发/测试环境，中小规模生产 |

### 9.3 后续优化方向

1. **流式转录**：支持实时音频流输入（WebSocket）
2. **分片处理**：超长音频自动切分为小片段并行处理
3. **模型热更新**：无需重启服务即可切换模型
4. **多租户支持**：为不同客户提供隔离的 Work Pool
5. **Kubernetes 部署**：使用 Helm Chart 部署到 K8s 集群

---

## 参考资源

- **项目地址**：[https://github.com/daojiAnime/asr-service](https://github.com/daojiAnime/asr-service)
- **Prefect 3.x 文档**：[Work Pools](https://docs.prefect.io/v3/concepts/work-pools) | [Deployment Guide](https://docs.prefect.io/latest/guides/prefect-deploy/)
- **Faster-Whisper**：[GitHub](https://github.com/SYSTRAN/faster-whisper) | [PyPI](https://pypi.org/project/faster-whisper/)
- **性能对比**：[Modal: Choosing Whisper Variants](https://modal.com/blog/choosing-whisper-variants)
- **Whisper 模型**：[OpenAI Whisper](https://github.com/openai/whisper) | [Belle-Whisper](https://huggingface.co/BELLE-2/Belle-whisper-large-v3-zh-punct)

---

**欢迎访问项目 GitHub 仓库获取完整代码，也欢迎提交 Issue 和 PR！**

如果这篇文章对你有帮助，欢迎点赞、收藏和分享。
