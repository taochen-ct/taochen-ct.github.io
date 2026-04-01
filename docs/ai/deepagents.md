# Deep Agents

> An opinionated, ready-to-run agent harness built with LangChain and LangGraph.

## Overview

[Deep Agents](https://github.com/langchain-ai/deepagents) 是 LangChain 官方开源的 Agent 框架，定位为 "The batteries-included agent harness"（自带电池的 Agent 框架）。该项目受 Claude Code 启发，旨在打造一个开箱即用、高度可扩展的通用 Agent。

| 属性 | 值 |
|------|-----|
| GitHub | [langchain-ai/deepagents](https://github.com/langchain-ai/deepagents) |
| Star | 18,462 |
| License | MIT |
| 语言 | Python |
| 依赖 | LangChain, LangGraph |

## 核心特性

### Planning
任务分解和进度跟踪，使用 `write_todos` 工具：
- 自动将复杂任务拆分为子任务
- 跟踪任务完成进度
- 支持任务依赖管理

### Filesystem
完整的文件系统操作工具集：
- `read_file` - 读取文件内容
- `write_file` - 写入文件
- `edit_file` - 编辑文件
- `ls` - 列出目录
- `glob` - 模式匹配
- `grep` - 文本搜索

### Shell Access
通过 `execute` 工具执行 shell 命令：
- 支持沙箱执行环境
- 可配置命令白名单
- 输出重定向和错误处理

### Sub-agents
支持委托子任务：
- `task` 工具创建子 Agent
- 隔离的上下文窗口
- 支持嵌套调用

### Context Management
智能上下文管理：
- 自动摘要长对话
- 大输出保存到文件
- 上下文窗口优化

## 快速开始

```bash
pip install deepagents
```

```python
from deepagents import create_deep_agent

agent = create_deep_agent()
result = agent.invoke({
    "messages": [{"role": "user", "content": "Research LangGraph and write a summary"}]
})
```

### 自定义配置

```python
from langchain.chat_models import init_chat_model

agent = create_deep_agent(
    model=init_chat_model("openai:gpt-4o"),
    tools=[my_custom_tool],
    system_prompt="You are a research assistant.",
)
```

## 项目结构

```
deepagents/
├── libs/
│   ├── deepagents/           # 核心 SDK
│   │   └── deepagents/
│   │       ├── backends/     # 后端实现
│   │       │   ├── filesystem.py   # 文件系统后端
│   │       │   ├── local_shell.py   # 本地 Shell
│   │       │   ├── sandbox.py       # 沙箱执行
│   │       │   ├── store.py         # 存储
│   │       │   └── ...
│   │       ├── middleware/   # 中间件
│   │       │   ├── subagents.py     # 子代理
│   │       │   ├── memory.py        # 内存管理
│   │       │   ├── summarization.py # 摘要
│   │       │   └── ...
│   │       ├── graph.py       # LangGraph 图定义
│   │       └── _models.py     # 数据模型
│   ├── cli/                  # CLI 终端工具
│   ├── acp/                  # ACP 协议实现
│   └── evals/                # 评估测试
└── examples/                 # 示例
```

## 核心模块

### Backends

| 模块 | 功能 |
|------|------|
| `filesystem.py` | 文件系统操作后端 |
| `local_shell.py` | 本地 shell 执行 |
| `sandbox.py` | 沙箱执行环境 |
| `store.py` | 状态存储 |
| `langsmith.py` | LangSmith 集成 |

### Middleware

| 模块 | 功能 |
|------|------|
| `subagents.py` | 子代理管理 |
| `memory.py` | 内存管理 |
| `summarization.py` | 对话摘要 |
| `async_subagents.py` | 异步子代理 |
| `skills.py` | 技能系统 |

## CLI 工具

Deep Agents 提供了一个类似 Claude Code 的终端 Agent：

```bash
curl -LsSf https://raw.githubusercontent.com/langchain-ai/deepagents/main/libs/cli/scripts/install.sh | bash
```

特性：
- **交互式 TUI** - 丰富的终端界面，流式响应
- **Web 搜索** - 获取实时信息
- **无头模式** - 支持脚本和 CI/CD
- **远程沙箱** - 安全的代码执行环境
- **持久记忆** - 跨会话记忆
- **人类介入** - 任务审批

## 技术特点

- **100% 开源** - MIT 许可
- **Provider 无关** - 支持任何支持 tool calling 的 LLM
- **基于 LangGraph** - 原生支持流式、持久化、checkpointing
- **MCP 支持** - 通过 `langchain-mcp-adapters` 集成

## 与 LangChain 的关系

Deep Agents 构建在 LangChain 和 LangGraph 之上：

```python
# create_deep_agent 返回一个编译后的 LangGraph 图
agent = create_deep_agent()

# 支持所有 LangGraph 特性
async for chunk in agent.astream_events({"messages": [...]}):
    print(chunk)
```

这意味着可以无缝使用：
- Streaming
- LangGraph Studio
- Checkpointers
- 所有 LangGraph 特性

## 安全模型

Deep Agents 采用 "trust the LLM" 模型：
- Agent 可以做任何工具允许的事
- 边界在工具/沙箱级别强制
- 不依赖模型自我约束

详见 [THREAT_MODEL.md](https://github.com/langchain-ai/deepagents/blob/main/libs/deepagents/THREAT_MODEL.md)

## 参考

- [官方文档](https://docs.langchain.com/oss/python/deepagents/overview)
- [API 参考](https://reference.langchain.com/python/deepagents/)
- [deepagents.js](https://github.com/langchain-ai/deepagentsjs) - JS/TS 版本