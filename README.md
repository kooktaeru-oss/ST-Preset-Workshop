# 🧩预设工坊

适用于 SillyTavern 的双端预设管理扩展，首个扩展版本由酒馆助手脚本 **v2.53** 无损迁移而来，当前版本为 **v2.81**。

本仓库是正常浏览器版，不包含 Gecko 后台 iframe 实验补丁。Firefox、雨见等 Gecko／GeckoView 手机浏览器请改用 [Gecko 兼容测试版](https://github.com/yui-ovo/ST-Preset-Workshop-Gecko)，请勿同时安装两个版本。

## 依赖

本扩展继续使用酒馆助手提供的脚本运行环境，因此需要先安装并启用：

- [酒馆助手（JS-Slash-Runner）](https://github.com/N0VI028/JS-Slash-Runner)

安装扩展版前，请在酒馆助手中停用旧的 `🧩预设工坊｜双端适配v2.53` 脚本，避免重复运行。

## 安装

1. 打开 SillyTavern 的“扩展”。
2. 选择“安装扩展”。
3. 粘贴本仓库的 Git URL：`https://github.com/yui-ovo/ST-Preset-Workshop.git`。
4. 安装完成后刷新 SillyTavern。

## 当前版本

- 扩展版本：`2.81.0`
- 迁移基准：`🧩预设工坊｜双端适配v2.53`
- 第一阶段保持原脚本行为，不在迁移过程中重写业务逻辑。
- iOS、iPadOS 与 TauriTavern（WKWebView）会自动启用稳定滚动模式；安卓继续使用原有离屏渲染优化。
- 魔法棒跟随主题时会忽略透明假黑，优先采用酒馆主题色，并同时校验面板、条目卡片与文字对比度。
- 打开缝合后，下方预设的分组内、分组外普通条目开关都会立即同步；柏宝箱分组总开关保持原行为。

## 目录

- `manifest.json`：SillyTavern 扩展清单。
- `dist/index.js`：标准 SillyTavern 扩展启动器。
- `dist/workshop-v2.81.js`：当前业务入口；对照旧版恢复缝合下方普通条目开关的即时视觉反馈，分组内外条目均会立刻刷新。
- `dist/workshop-v2.53.js`：由 v2.53 JSON 的 `content` 原样提取的迁移基准。
- `bridge/`：复用酒馆助手运行环境所需的兼容桥。
- `legacy/`：迁移前的原始酒馆助手脚本，仅用于校验和回退。
- `scripts/validate.mjs`：发布前的基础完整性检查。

## 安全说明

第三方扩展能够在 SillyTavern 页面中运行代码。请只从本项目的正式仓库安装，并在更新前查看版本说明。
