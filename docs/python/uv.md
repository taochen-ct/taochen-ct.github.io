---
title: Package Management (uv)
prev: 'FastAPI'
next: false
---

# `uv` 极速 Python 包管理器速查

`uv` 是由 [Astral](https://astral.sh) 公司（Ruff 的开发者）使用 Rust 编写的超快 Python 包管理和项目管理工具。它旨在替代 `pip`、`pip-tools`、`poetry`、`pipenv` 以及 `virtualenv`，安装速度可提升 **10 ~ 100 倍**。

> 一句话概括：`uv` = `pip` + `virtualenv` + `pyenv` + `poetry` + `pipx` 的极速统一替代品。

---

## 安装与更新

使用官方一键脚本安装最为便捷：

::: code-group

```bash [macOS / Linux]
curl -LsSf https://astral.sh/uv/install.sh | sh
```

```powershell [Windows (PowerShell)]
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
```

:::

安装完成后，可通过以下命令更新：

```bash
uv self update
```

---

## 项目管理（替代 Poetry / Pipenv）

`uv` 提供了类似 Cargo（Rust 包管理器）的现代项目管理体验，自动管理虚拟环境并同步锁定文件。

### 初始化新项目

```bash
uv init my-project
cd my-project
```

这会生成一个包含 `pyproject.toml` 的基础项目结构，并自动创建 `.venv` 虚拟环境。

### 管理依赖

| 操作 | 命令 |
|------|------|
| 添加生产依赖 | `uv add requests` |
| 添加开发依赖 | `uv add pytest --dev` |
| 移除依赖 | `uv remove requests` |
| 同步依赖（根据 `pyproject.toml`） | `uv sync` |

每次 `uv add` / `uv remove` 都会自动更新 `pyproject.toml` 和 `uv.lock` 锁定文件，确保环境一致性。

### 运行项目

使用 `uv run` 可以确保在正确的虚拟环境中执行命令，无需手动激活：

```bash
# 运行脚本
uv run main.py

# 运行依赖包的 CLI 工具
uv run pytest

# 运行单条 Python 命令
uv run python -c "print('hello')"
```

---

## Python 版本管理（替代 pyenv）

`uv` 内置 Python 版本下载与管理，无需单独安装 `pyenv`。

| 操作 | 命令 |
|------|------|
| 查看可用版本 | `uv python list` |
| 安装特定版本 | `uv python install 3.12` |
| 为当前项目固定版本 | `uv python pin 3.11` |
| 查看当前项目使用的版本 | `uv python find` |

固定版本后，`uv` 会自动下载并使用该版本的 Python 来创建虚拟环境。

---

## 工具运行（替代 pipx）

只想临时运行一个 CLI 工具，而不想污染当前项目依赖？`uv` 提供了两种模式：

### 临时运行（`uvx`）

```bash
# 自动下载、缓存并运行，不修改当前项目
uvx ruff check .
uvx httpie GET https://api.github.com
uvx black --check src/
```

### 全局安装（`uv tool`）

```bash
# 将工具安装到独立的隔离环境中
uv tool install ruff
uv tool install httpie

# 查看已安装的工具
uv tool list

# 升级工具
uv tool upgrade ruff

# 卸载工具
uv tool uninstall ruff
```

---

## 传统虚拟环境与 Pip 替代

如果你只想把 `uv` 当作一个极速的 `pip` + `virtualenv` 替代品，可以使用 `uv pip` 和 `uv venv` 子命令。

> ⚠️ **注意**：`uv pip` 的行为与传统 `pip` 一致，**必须先激活虚拟环境**，或使用 `--system` 参数（不推荐用于日常开发）。

```bash
# 1. 创建虚拟环境（默认使用当前系统 Python）
uv venv

# 2. 创建指定版本的虚拟环境
uv venv --python 3.10

# 3. 激活环境（传统方式）
source .venv/bin/activate  # macOS / Linux
.venv\Scripts\activate     # Windows

# 4. 极速安装包
uv pip install requests

# 5. 从 requirements.txt 批量安装
uv pip install -r requirements.txt

# 6. 导出当前依赖
uv pip freeze > requirements.txt

# 7. 编译生成锁定文件（替代 pip-tools）
uv pip compile pyproject.toml -o requirements.txt
```

---

## 常用技巧与清理

### 缓存管理

```bash
# 查看缓存目录
uv cache dir

# 清理全部缓存（解决依赖解析异常时有用）
uv cache clean

# 清理特定包的缓存
uv cache clean requests
```

### 离线模式

在没有网络或强制使用本地缓存时：

```bash
uv pip install --offline requests
uv sync --offline
```

### 查看依赖树

```bash
uv pip tree
```

### 检查环境一致性

```bash
# 检查当前环境是否与 lock 文件一致
uv sync --locked
```

---

## `uv` vs 传统工具 速查对照表

| 场景 | 传统工具 | `uv` 命令 |
|------|----------|-----------|
| 安装包 | `pip install requests` | `uv pip install requests` |
| 创建虚拟环境 | `python -m venv .venv` | `uv venv` |
| 初始化项目 | `poetry init` / `pipenv install` | `uv init` |
| 添加依赖 | `poetry add requests` | `uv add requests` |
| 运行脚本（带环境） | `poetry run python main.py` | `uv run main.py` |
| 安装 Python 版本 | `pyenv install 3.12` | `uv python install 3.12` |
| 固定项目 Python | `.python-version` 手动维护 | `uv python pin 3.11` |
| 运行独立工具 | `pipx run ruff` | `uvx ruff` |
| 全局安装工具 | `pipx install ruff` | `uv tool install ruff` |
| 编译锁定文件 | `pip-compile` | `uv pip compile` |
| 同步锁定文件 | `poetry install` | `uv sync` |

---

## 小结

`uv` 通过 Rust 的高性能实现，将 Python 包管理、项目管理、Python 版本管理、工具运行等多个场景统一到一个工具中，极大简化了开发工作流。对于习惯 Poetry 或 pip-tools 的开发者，`uv` 的 `uv init` / `uv add` / `uv run` / `uv sync` 组合几乎可以实现无缝迁移，同时获得数倍的速度提升。
