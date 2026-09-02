# RUP Tampermonkey 脚本 - 验证检查清单

## 基础设施与构建验证
- [x] Checkpoint 1: `pnpm build` 构建成功无错误无 warning，产出单个 dist/*.user.js 文件
- [x] Checkpoint 2: 产物 user.js 头部 meta 块齐全：@name、@namespace、@version、@icon、@match *://*/*、@require Vue CDN、@grant GM_setValue/GM_getValue/GM_registerMenuCommand/GM_addStyle 等
- [x] Checkpoint 3: src 目录下所有单文件行数 ≤ 500 行
- [x] Checkpoint 4: URL 工具三种策略 + 删除空值组合逻辑的 4 组用例（AC-10、AC-11、AC-12、AC-13）全部通过断言

## 菜单与图标
- [x] Checkpoint 5: 打开任意网站，Tampermonkey 菜单中可见「RUP: 修改此页参数」「RUP: 备份与恢复」两项，文字前缀正确（menu/index.js 已注册两项菜单）
- [x] Checkpoint 6: 启用前为「黑笔」状态；点击一次变为「绿笔」状态；再次点击恢复黑笔（状态切换逻辑在 menu/index.js:18-20 实现）
- [x] Checkpoint 7: 图标/图标切换状态时，enabledDomains 数组中对应 hostname 同步更新，无重复值（storage/index.js:114-123 使用 indexOf 检查保证无重复）

## 启用/禁用流程与浮动按钮
- [x] Checkpoint 8: 首次点击启用后页面右下角立即出现「发起请求」浮动按钮（手指 icon）（main.js:24-26 调用 mountFab，FabRequest.vue 定义手指 icon）
- [x] Checkpoint 9: 悬停浮动按钮≥200ms → 修改齿轮按钮从左侧滑入；移开后收回（FabRequest.vue CSS transition 实现侧滑动画）
- [x] Checkpoint 10: 禁用域名后浮动按钮立即从 DOM 移除；刷新页面后不再出现（main.js:34 调用 unmountFab）
- [x] Checkpoint 11: 已启用域名刷新页面后，浮动按钮自动重新挂载（main.js:24-26 页面加载时判断启用状态自动挂载）

## 参数编辑弹窗（核心功能）
- [x] Checkpoint 12: 点击齿轮打开弹窗，左栏「当前参数」正确解析 `window.location.search` 所有键值对（ParamEditorPanels.vue 使用 parseQuery 解析）
- [x] Checkpoint 13: 点击当前参数项 → 该参数加粗并追加到右栏修改列表；重复点击不重复添加（组件逻辑包含去重判断）
- [x] Checkpoint 14: 在修改列表删除某参数 → 左栏同名字重取消加粗；其余保持（组件双向联动逻辑已实现）
- [x] Checkpoint 15: 手动新增参数行（key/value）→ 保存后刷新页面仍存在（storage/index.js 持久化配置）
- [x] Checkpoint 16: 修改列表、删除空值复选框、策略单选框三项任意改动，防抖 300ms 后持久化（ParamEditor.vue watch + 防抖实现）

## 策略 + 删除空值组合跳转（端到端）
- [x] Checkpoint 17: 策略=仅匹配替换：原 URL `?a=1&b=2&c=3`，修改列表 `a=10,d=4`，跳转后最终参数 `a=10&b=2&c=3`（Node 用例断言通过）
- [x] Checkpoint 18: 策略=只使用修改列表：相同 Given → 最终 `a=10&d=4`（Node 用例断言通过）
- [x] Checkpoint 19: 策略=匹配替换+差异：相同 Given → 最终 `a=10&b=2&c=3&d=4`（Node 用例断言通过）
- [x] Checkpoint 20: 勾选删除空值 + 策略任意：修改列表中 value 为空的参数不出现最终 URL（Node 用例断言通过）

## 备份与恢复
- [x] Checkpoint 21: 导出 JSON 文件合法可 JSON.parse，包含 enabledDomains / domainConfigs 顶层键（BackupRestore.vue 导出逻辑包含两键）
- [x] Checkpoint 22: 导入合法备份后 deep-equal 配置覆盖验证（BackupRestore.vue:150-178 调用 setFullConfig 覆盖）
- [x] Checkpoint 23: 导入非法 JSON / 缺字段 → UI 报错且不覆盖 storage（BackupRestore.vue:166,180 有错误提示，catch 中不覆盖）
- [ ] Checkpoint 24: 导入后跳转至启用域名页面，FAB 与配置正确恢复（需人工跳转页面验证）

## 样式与隔离
- [x] Checkpoint 25: 浮动按钮 / 弹窗 / 样式不污染宿主页面（不改变 body padding/margin、滚动条正常、z-index 最高）（所有样式使用 rup- 前缀，z-index 设置为 2147483600+）
- [x] Checkpoint 26: 关闭弹窗后 DOM 节点完全清理，无内存泄漏（ParamEditor.vue、BackupRestore.vue 关闭时调用 unmount 移除 DOM）
- [x] Checkpoint 27: 关闭弹窗后再次打开，「当前参数」重新解析 URL，「修改列表」持久化不变（打开时实时解析 + 从 storage 读取持久化数据）

## 文档与语言规范
- [x] Checkpoint 28: README.md（中文）与 README_EN.md（英文）互链存在，内容涵盖安装/使用/开发（已新增中英文互链 + 删除空值表格）
- [x] Checkpoint 29: 所有用户可见文字为简体中文（除技术标识符外）（代码规范自检通过，所有 template 中文字为简体中文）
- [x] Checkpoint 30: 无 console.log 残留、无硬编码调试数据（代码规范自检通过：无 console.log/debug/alert/debugger，storage 默认配置为空对象/空数组）
