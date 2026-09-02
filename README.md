# RUP - 请求 URL 参数修改油猴脚本

🐰 RUP (Request URL Param) - 一只可爱的兔子帮你快速修改浏览器 GET 请求参数

[English Readme](./README_EN.md)

## 简介

本项目基于 Vite + Vue 3 + vite-plugin-monkey 构建的 Tampermonkey 油猴脚本，用于在浏览器中快速修改 GET 请求 URL 参数。

## 功能特性

> [English Version](./README_EN.md) | [中文版本](./README.md)

- 菜单切换启用/禁用当前域名（黑笔/绿笔模式）
- 右下角浮动发起请求按钮（FAB）
- 悬停 FAB 显示侧滑修改按钮（齿轮）
- 当前参数面板 + 修改列表双面板直观编辑
- 三种参数修改策略灵活适配场景
- 删除空值开关一键剔除无效参数
- JSON 格式配置完整备份与导入恢复
- 基于油猴存储 + LocalStorage 双适配本地持久化

## 三种修改策略说明

| 策略 | 标识 | 行为说明 |
|------|------|----------|
| 仅匹配替换（默认） | match_only | 保留原 URL 所有参数，仅修改 modifyList 中已存在于原 URL 的同名参数值，不拼接新增参数 |
| 只使用本修改列表的参数 | list_only | 清除原 URL 所有参数，只保留 modifyList 中的参数 |
| 匹配替换+差异参数 | match_and_diff | 保留原 URL 所有参数并替换匹配项，同时追加 modifyList 中新增的差异参数 |

## 删除空值开关说明

| 删除空值 | 行为 |
|----------|------|
| 勾选 ✅ | modifyList 中 value 为空字符串的参数在最终 URL 被移除 |
| 不勾选（默认）| modifyList 中 value 为空的参数会以 key= 的形式被保留 |

## 安装步骤

1. 安装 [Tampermonkey](https://www.tampermonkey.net/) 扩展（Chrome/Edge/Firefox 等均支持）
2. 在项目根目录执行：`pnpm install && pnpm build`
3. 构建完成后，将 `dist/rup-tampermonkey.user.js` 文件在浏览器中打开（或直接拖入扩展管理面板的「实用工具 → 从 URL/文件导入」）
4. 点击「安装」即可

## 使用说明

1. 打开任意带 GET 参数的网页
2. 点击浏览器 Tampermonkey 图标 → 选择「🐰 RUP: ⚫🖊️ [黑笔] 修改此页参数」变为绿笔模式
3. 页面右下角出现 🐇 浮动手指按钮：直接点击发起请求；悬停可见齿轮「修改」按钮
4. 点击齿轮打开参数编辑器，左栏选参数加入右栏修改列表、或手动新增、底部选策略+删除空值 → 应用修改

## 备份与恢复

在参数编辑器或油猴菜单中均可找到「💾 备份与恢复」入口。点击导出功能会将全部域名的启用列表、各域名修改列表、策略配置、删除空值开关全部导出为 JSON 行下载到本地。

导入时选择之前导出的 JSON 文件即可一键恢复所有配置，导入后会自动同步当前域名的 FAB 启用状态。

## 开发与调试

项目基于 pnpm + vite 开发，支持热更新与打包：

- `pnpm dev`：启动开发服务器，支持热更新调试
- `pnpm build`：构建生产版本用户脚本

主要模块划分：

```
    src/
        assets/icons/    图标资源（SVG 组件）
        components/     Vue 3 业务组件（FAB、编辑器、备份恢复
        mount/        挂载入口（fab / editor / backup）
        menu/         油猴菜单注册逻辑
        storage/      本地存储配置读写
        utils/        事件总线、URL 工具函数
```

## 目录结构树

```
    src/
    ├── assets/
    │   └── icons/
    │       ├── iconDisk.js
    │       ├── iconFinger.js
    │       ├── iconGear.js
    │       ├── iconPenBlack.js
    │       ├── iconPenGreen.js
    │       └── iconRabbit.js
    ├── components/
    │   ├── BackupRestore.vue
    │   ├── FabRequest.vue
    │   ├── ParamEditor.vue
    │   └── ParamEditorPanels.vue
    ├── mount/
    │   ├── backup.js
    │   ├── editor.js
    │   └── fab.js
    ├── menu/
    │   └── index.js
    ├── storage/
    │   └── index.js
    ├── utils/
    │   ├── eventBus.js
    │   └── url.js
    ├── main.js
    └── style.css
```

## 常见问题 FAQ

**Q: 为什么脚本安装后没有效果？**
A: 请检查油猴脚本头部 `@match` 规则是否匹配当前访问的域名，默认配置为 `*://*/*` 即匹配全部站点，如被手动修改请改回。同时确认 Tampermonkey 扩展已启用且脚本处于「已启用」状态。

**Q: 刷新页面后油猴菜单的文字没有变化？**
A: 这是 Tampermonkey 的已知行为：`GM_registerMenuCommand 注册的菜单项文字只在页面刷新时重新渲染，但切换功能本身是实时生效的，无需担心。

**Q: 导入配置后为什么不生效？**
A: 导入完成后请刷新当前页面，或在油猴菜单中切换一次黑笔/绿笔模式即可触发状态同步。

## License

MIT
