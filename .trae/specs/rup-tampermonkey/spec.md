# RUP Tampermonkey 脚本 - 产品需求文档

## Overview
- **Summary**: 开发一款名为 RUP（Request URL Param）的 Tampermonkey 油猴脚本，用于在浏览器中便捷地修改 GET 请求的 URL 参数。脚本提供可视化参数编辑界面，支持多种参数修改策略，并可通过 JSON 格式进行配置的备份与恢复。
- **Purpose**: 解决 Web 开发和测试过程中频繁手动修改 URL 参数的效率问题，提供直观的可视化操作界面，支持多种参数替换策略，并可保存/恢复多域名的参数配置。
- **Target Users**: Web 前端开发者、后端开发者、测试工程师、需要频繁操作 URL 参数的运营人员。

## Goals
- 实现 Tampermonkey 菜单系统（RUP 主菜单 + 两个子菜单）
- 实现域名级别的参数修改开关（启用/禁用）
- 实现页面内「发起请求」浮动按钮及侧滑「修改」按钮
- 实现参数编辑弹窗：当前参数列表、修改列表、增删改操作
- 实现三种修改策略：仅匹配替换、只使用修改列表、匹配替换+差异参数
- 实现「删除空值」复选框功能
- 实现配置的 JSON 导入导出（备份与恢复）
- 数据持久化（使用 GM_setValue / GM_getValue 存储配置）

## Non-Goals (Out of Scope)
- 不支持 POST / PUT 等非 GET 请求的参数修改
- 不支持修改请求头、Cookie、Body 等其他请求要素
- 不提供云同步功能（仅本地存储）
- 不支持批量多标签页同时操作
- 不提供自动化测试运行功能

## Background & Context
- 项目基于 Vite + Vue 3 + vite-plugin-monkey 脚手架构建，已具备基础的 Vue 组件开发和油猴脚本打包能力
- 脚手架默认匹配 Google 域名，需要改为全域名匹配（`*://*/*`）或由用户自行配置
- 使用 Tampermonkey 的 `GM_registerMenuCommand` API 注册菜单，`GM_setValue` / `GM_getValue` 做数据持久化
- 使用 `GM_addStyle` 注入样式，避免样式污染宿主页面

## Functional Requirements
- **FR-1**: Tampermonkey 菜单注册：主菜单「RUP」（飞跑兔子图标），包含两个子菜单「修改此页参数」（笔图标，黑/绿切换）和「备份与恢复」（磁盘图标）
- **FR-2**: 点击「修改此页参数」子菜单，首次点击时图标从黑笔变绿笔，记录当前域名为启用状态，并在页面右下角注入「发起请求」浮动按钮（手指图标）
- **FR-3**: 若域名已启用，再次点击「修改此页参数」则图标从绿笔变回黑笔，禁用该域名，并移除页面上的「发起请求」按钮
- **FR-4**: 「发起请求」按钮支持两种交互：直接点击 = 根据修改列表策略修改 URL 并跳转；鼠标悬停 = 从按钮左侧侧滑出「修改」子按钮（齿轮图标）
- **FR-5**: 点击「修改」按钮弹出参数编辑弹窗，左侧显示「当前参数」列表（从当前 URL 解析），右侧显示「修改列表」
- **FR-6**: 点击「当前参数」中的参数项，该参数在当前列表中加粗显示，同时追加一条记录到「修改列表」
- **FR-7**: 「修改列表」支持：修改参数值、手动新增参数行、删除单条参数
- **FR-8**: 当从「修改列表」删除某参数时，若「当前参数」中存在同名参数且处于加粗状态，应取消加粗
- **FR-9**: 「修改列表」底部提供「删除空值」复选框（默认未勾选）
- **FR-10**: 「修改列表」底部提供「修改策略」单选按钮组：「仅匹配替换」（默认）、「只使用本修改列表的参数」、「匹配替换+差异参数」
- **FR-11**: 直接点击「发起请求」按钮时，根据复选框和策略组合，计算最终 URL 并执行 `window.location.href` 跳转
- **FR-12**: 「备份与恢复」子菜单点击后弹出弹窗，支持：导出当前所有配置为 JSON 文件下载、选择 JSON 文件导入并覆盖配置
- **FR-13**: 备份 JSON 结构包含：启用域名列表、每个域名下的完整请求 URL（可选）、对应域名的修改参数列表（含策略和删除空值开关）
- **FR-14**: 页面刷新后，已启用的域名应自动恢复「发起请求」按钮，修改列表内容保持不变

## Non-Functional Requirements
- **NFR-1**: 脚本在 99% 的现代网页上不产生样式冲突（使用 Shadow DOM 或高特异性前缀类名）
- **NFR-2**: 弹窗交互响应时间 < 100ms，URL 参数解析 < 50ms
- **NFR-3**: 单域名下修改列表支持至少 100 条参数记录
- **NFR-4**: 导出 JSON 文件 UTF-8 编码，可被任意 JSON 编辑器打开
- **NFR-5**: 代码模块化，组件职责单一，单个文件 < 500 行
- **NFR-6**: 所有用户可见中文文案，代码标识符/注释使用简体中文

## Constraints
- **Technical**: 必须使用 Vue 3 + Vite + vite-plugin-monkey 技术栈；禁止引入额外 UI 库（纯手写 CSS/SVG 图标）；禁止引入 Element Plus / Ant Design 等重型组件库
- **Business**: 需兼容 Tampermonkey v4.13+ 及 Violentmonkey；`@match` 需默认 `*://*/*`（用户可自行收紧）
- **Dependencies**: 仅使用 Vue 3（通过 externalGlobals CDN 引入）和 Tampermonkey API（GM_registerMenuCommand / GM_setValue / GM_getValue / GM_addStyle）；不新增 npm 包

## Assumptions
- 用户使用的是基于 Chromium 的浏览器（Chrome / Edge / Brave 等），版本不低于 2 年前的稳定版
- 用户已安装 Tampermonkey 或兼容的用户脚本管理器
- 同一域名下，不同路径共享同一套修改列表配置（按 hostname 粒度存储）
- 「发起请求」按钮跳转方式为修改 `window.location.href`，不处理通过 fetch/XHR 发出的请求
- 修改策略中的「差异参数」指：修改列表有、原 URL 没有的参数，需要拼接到最终 URL 上

## Acceptance Criteria

### AC-1: 菜单注册与图标展示
- **Given**: 用户已安装脚本并访问任意网页
- **When**: 打开 Tampermonkey 扩展菜单
- **Then**: 能看到 RUP 主菜单（飞跑兔子 icon），展开后有两个子菜单：「修改此页参数」（黑笔 icon，默认态）和「备份与恢复」（磁盘 icon）
- **Verification**: `human-judgment`

### AC-2: 首次启用参数修改功能
- **Given**: 打开任意网页 A，该域名之前未启用 RUP
- **When**: 点击「修改此页参数」子菜单
- **Then**: 1) 子菜单 icon 从黑笔变为绿笔；2) 页面右下角出现「发起请求」浮动按钮（手指 icon）；3) 刷新页面后按钮仍存在
- **Verification**: `programmatic` + `human-judgment`

### AC-3: 禁用已启用的域名
- **Given**: 域名 A 已启用（绿笔状态 + 发起请求按钮显示）
- **When**: 再次点击「修改此页参数」子菜单
- **Then**: 1) 子菜单 icon 从绿笔变回黑笔；2) 页面右下角「发起请求」按钮被移除；3) 刷新页面后不再出现
- **Verification**: `programmatic` + `human-judgment`

### AC-4: 发起请求按钮的直接点击行为
- **Given**: 域名已启用，修改列表中已配置参数与策略
- **When**: 鼠标直接点击「发起请求」按钮（不悬停）
- **Then**: 浏览器地址栏 URL 根据修改列表策略和删除空值开关计算后执行跳转
- **Verification**: `programmatic`

### AC-5: 修改按钮侧滑显示
- **Given**: 「发起请求」按钮已显示在页面上
- **When**: 鼠标悬停在「发起请求」按钮上
- **Then**: 从「发起请求」按钮左侧平滑滑出「修改」子按钮（齿轮 icon），移开鼠标后收回
- **Verification**: `human-judgment`

### AC-6: 参数编辑弹窗 - 当前参数列表
- **Given**: 当前 URL 为 `https://example.com/path?a=1&b=2&c=3`
- **When**: 点击「修改」按钮打开弹窗
- **Then**: 「当前参数」列表显示三项：a=1、b=2、c=3，每项可点击
- **Verification**: `programmatic`

### AC-7: 从当前参数添加到修改列表
- **Given**: 弹窗已打开，当前参数有 a=1、b=2、c=3，修改列表为空
- **When**: 依次点击当前参数中的 a=1 和 b=2
- **Then**: 1) a 和 b 在当前参数列表中变为加粗；2) 修改列表中新增两条记录 a=1、b=2，值可编辑
- **Verification**: `programmatic`

### AC-8: 从修改列表删除同步取消加粗
- **Given**: 当前参数 a=1 处于加粗状态，修改列表中有 a=1
- **When**: 在修改列表中点击删除 a=1 这条记录
- **Then**: 1) 修改列表中的 a 行被移除；2) 当前参数列表中的 a 恢复为普通字重（不再加粗）
- **Verification**: `programmatic`

### AC-9: 修改列表手动新增参数
- **Given**: 修改列表弹窗已打开
- **When**: 点击「新增参数」按钮，填入 key=d，value=4
- **Then**: 修改列表新增 d=4 行；关闭弹窗再打开仍然保留
- **Verification**: `programmatic`

### AC-10: 删除空值复选框功能
- **Given**: 修改列表中有 a=1、b=（空值）、c=3；勾选「删除空值」；策略为「仅匹配替换」
- **When**: 点击「发起请求」
- **Then**: 最终 URL 中参数 b 被移除，仅保留 a 和 c 及其他未修改参数
- **Verification**: `programmatic`

### AC-11: 修改策略 - 仅匹配替换（默认）
- **Given**: 原 URL `?a=1&b=2&c=3`；修改列表 a=10、d=4；策略=仅匹配替换；删除空值=关
- **When**: 发起请求
- **Then**: 最终 URL 参数为 `a=10&b=2&c=3`（d 不拼接）
- **Verification**: `programmatic`

### AC-12: 修改策略 - 只使用本修改列表的参数
- **Given**: 原 URL `?a=1&b=2&c=3`；修改列表 a=10、d=4；策略=只使用修改列表；删除空值=关
- **When**: 发起请求
- **Then**: 最终 URL 参数为 `a=10&d=4`（b、c 被清除）
- **Verification**: `programmatic`

### AC-13: 修改策略 - 匹配替换+差异参数
- **Given**: 原 URL `?a=1&b=2&c=3`；修改列表 a=10、d=4；策略=匹配替换+差异；删除空值=关
- **When**: 发起请求
- **Then**: 最终 URL 参数为 `a=10&b=2&c=3&d=4`（a 替换，d 新增，b/c 保留）
- **Verification**: `programmatic`

### AC-14: 备份导出功能
- **Given**: 已有 2 个启用域名的配置，其中域名 A 修改列表有 a=1、策略=仅匹配替换、删除空值=关
- **When**: 点击「备份与恢复」→ 点击「导出 JSON」
- **Then**: 浏览器下载一个 `.json` 文件，内容包含完整的配置结构（启用域名、修改列表、策略、删除空值开关）且格式合法
- **Verification**: `programmatic` + `human-judgment`

### AC-15: 备份导入功能
- **Given**: 有一份合法的 RUP 配置 JSON 文件（包含多个域名配置）
- **When**: 点击「备份与恢复」→ 选择文件并点击「导入」
- **Then**: 导入后脚本内存配置被覆盖，新启用域名立即生效，对应修改列表内容一致
- **Verification**: `programmatic`

### AC-16: 页面刷新后配置保持
- **Given**: 域名 A 已启用，修改列表有 3 条参数并选择策略=匹配替换+差异
- **When**: 用户刷新页面（F5）
- **Then**: 1) 发起请求按钮重新显示；2) 打开弹窗可看到修改列表、策略、删除空值开关与刷新前完全一致
- **Verification**: `programmatic`

## Open Questions
- [ ] 是否需要支持多 URL 路径粒度（同域名不同路径独立配置），还是仅 hostname 粒度？（默认按 hostname）
- [ ] 「发起请求」按钮是否需要可拖拽调整位置？（默认固定右下角，暂不支持拖拽）
- [ ] 修改列表弹窗中，参数 key 是否允许重名？（默认不允许，新覆盖旧）
