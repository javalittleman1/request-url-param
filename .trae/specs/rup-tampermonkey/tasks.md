# RUP Tampermonkey 脚本 - 实现计划（分解与优先级任务列表）

## [x] 任务 1：配置脚手架与全局基础设施
- **Priority**: high
- **Depends On**: None
- **Description**: 
  - 更新 `vite.config.js`：将 `@match` 改为 `*://*/*`；更新 `@name`、`@namespace`、`@icon`（兔子 icon base64 SVG）；追加必要的 `@grant`（GM_registerMenuCommand、GM_setValue、GM_getValue、GM_addStyle、GM_listValues、GM_deleteValue、GM_notification 可选）
  - 更新 `package.json` 的 `name` 字段为 `rup-tampermonkey`，`version` 为 `0.1.0`
  - 创建存储模块 `src/storage/index.js`：封装 `GM_setValue` / `GM_getValue` / `GM_deleteValue`，提供域名配置读写 API（按 hostname 粒度）
  - 创建 URL 工具模块 `src/utils/url.js`：解析 URL 参数为对象、对象序列化回 URL 查询串、实现三种修改策略的纯函数（含删除空值分支）
  - 存储数据结构定义：
    ```
    {
      enabledDomains: [ "example.com" ],
      domainConfigs: {
        "example.com": {
          modifyList: [{ key, value }],
          strategy: "match_only" | "list_only" | "match_and_diff",
          removeEmpty: false,
          lastUrl: "https://example.com/path?a=1"
        }
      }
    }
    ```
- **Acceptance Criteria Addressed**: AC-2、AC-3、AC-10、AC-11、AC-12、AC-13、AC-16
- **Test Requirements**:
  - `programmatic` TR-1.1: `url.js` 中三个策略函数 + 删除空值分支，针对 4 组用例（AC-11/12/13/10 的 Given）做单元验证，纯函数断言
  - `programmatic` TR-1.2: 存储模块提供 `getConfig(hostname)` / `saveConfig(hostname, cfg)` / `setDomainEnabled(hostname, bool)` / `isDomainEnabled(hostname)` 四个函数，签名正确
  - `programmatic` TR-1.3: 执行 `pnpm build` 不报错，输出的 `dist/*.user.js` 文件头部 `@match` 为 `*://*/*`，`@grant` 列表包含 5+ GM API
- **Notes**: 纯函数必须幂等、无副作用，方便后续手动写测试

## [x] 任务 2：SVG 图标资源与菜单注册
- **Priority**: high
- **Depends On**: Task 1
- **Description**:
  - 在 `src/assets/icons/` 目录下创建 5 个 SVG 图标组件（以 data URL 或 Vue 组件导出）：
    1. 飞跑兔子 icon（主菜单 icon + 页面浮动按钮旁装饰）
    2. 黑色笔 icon（修改此页参数 - 默认）
    3. 绿色笔 icon（修改此页参数 - 启用态）
    4. 磁盘 icon（备份与恢复）
    5. 手指 icon（发起请求按钮）
    6. 齿轮 icon（修改子按钮）
  - 创建菜单模块 `src/menu/index.js`：调用 `GM_registerMenuCommand` 注册三个入口（注意：Tampermonkey 原生没有层级菜单，需要用 emoji/前缀模拟「RUP: 修改此页参数」和「RUP: 备份与恢复」两项）
  - 菜单状态管理：根据当前 hostname 是否启用，动态切换黑笔/绿笔的文字前缀（因 GM API 不支持动态改 icon，用 🖊️ / 🟢🖊️ emoji 占位 + 菜单文字如「RUP: [黑笔] 修改此页参数」/「RUP: [绿笔] 修改此页参数」）
  - 点击「修改此页参数」时：切换启用状态 → 调用存储 → 触发页面层（事件总线）的 `rup:domain-toggle` 事件
  - 点击「备份与恢复」时：触发 `rup:open-backup` 事件
- **Acceptance Criteria Addressed**: AC-1、AC-2、AC-3
- **Test Requirements**:
  - `human-judgement` TR-2.1: 打开任意网页，Tampermonkey 菜单中可看到「RUP:」前缀的 2 个子菜单项，启用后文字变绿笔状态
  - `programmatic` TR-2.2: 首次点击启用 → `isDomainEnabled(hostname)` 返回 true；再次点击返回 false；每次切换触发对应事件
  - `programmatic` TR-2.3: 切换 10 次后，存储中 `enabledDomains` 数组不出现重复项
- **Notes**: GM_registerMenuCommand 在每次刷新页面重新注册；绿笔/黑笔的视觉差异用 emoji + 文字颜色描述即可

## [x] 任务 3：页面内发起请求浮动按钮组件
- **Priority**: high
- **Depends On**: Task 1、Task 2
- **Description**:
  - 创建 Vue 组件 `src/components/FabRequest.vue`（Floating Action Button）：
    - 容器固定在右下角 `bottom:32px; right:32px`，z-index 极大（如 2147483600）
    - 主按钮：手指 icon + 悬停容器展开；子按钮：齿轮 icon「修改」
    - 主按钮点击：从 storage 拿当前域名配置 → 调用 `url.js` 的策略函数计算新 URL → `window.location.href = newUrl`
    - 悬停主按钮 ≥ 200ms，修改按钮从左滑入（CSS transition: transform/opacity）；离开 ≤ 500ms 滑出
    - 子按钮点击：emit `open-editor` 事件
  - 创建挂载器 `src/mount/fab.js`：提供 `mountFab()` / `unmountFab()` 方法，在 `document.body` 下创建一个新的独立 div 作为 Vue App 挂载点（避免影响宿主）
  - 集成到事件总线：当收到 `rup:domain-toggle` 且为启用 → mountFab；禁用 → unmountFab
  - 页面首次加载时检查当前 hostname 是否已启用，若启用自动 mount
- **Acceptance Criteria Addressed**: AC-2、AC-3、AC-4、AC-5、AC-16
- **Test Requirements**:
  - `human-judgement` TR-3.1: 浮动按钮在右下角，悬停滑出齿轮修改按钮，移开收回；无样式与宿主页面冲突（滚动不抖动、按钮 z-index 始终最高）
  - `programmatic` TR-3.2: 点击主按钮 → `window.location.href` 被正确设置为策略计算后的 URL（可用 sinon-like 钩子或手动验证日志）
  - `programmatic` TR-3.3: 禁用域名后 DOM 中 Fab 的根 div 被移除；启用后重新出现
- **Notes**: 样式使用 BEM 类名前缀 `rup-fab__*`，并通过 `GM_addStyle` 注入或 scoped style

## [x] 任务 4：参数编辑弹窗组件
- **Priority**: high
- **Depends On**: Task 3
- **Description**:
  - 创建 Vue 组件 `src/components/ParamEditor.vue`（弹窗）：
    - 遮罩层半透明黑色，点击遮罩关闭弹窗；居中或右上固定宽度 820px
    - 左右两栏布局：
      - 左栏「当前参数」：标题 + 列表；每一行 key（粗）= value；点击一行 → 若 key 不在修改列表中则加入；在则不重复加入；被加入的行整体加粗 (`font-weight: 700`)
      - 右栏「修改列表」：标题 + 列表 + 底部工具栏；每一行两输入框（key / value）+ 删除按钮；顶部有「新增参数」按钮
      - 删除同步：点击修改列表中的删除 → 若当前参数中存在同 key 且为加粗，取消加粗（通过 `selectedKeys` Set 维护）
    - 底部工具栏：
      - 「删除空值」复选框（CheckBox）：绑定 `removeEmpty` boolean
      - 「修改策略」单选按钮组：
        - ◉ 仅匹配替换（match_only）默认
        - ○ 只使用本修改列表的参数（list_only）
        - ○ 匹配替换+差异参数（match_and_diff）
      - 底部「应用修改」按钮 = 同等于直接点击发起请求（计算 URL + 跳转）；「取消」按钮关闭弹窗
    - 打开弹窗时：解析 `window.location.href` 获取当前参数填充左栏；从 storage 读取修改列表/策略/删除空值填充右栏
    - 任何修改（新增、删除、改值、策略、复选框）实时写入 storage（防抖 300ms）
  - 创建挂载器 `src/mount/editor.js`：`openEditor()` / `closeEditor()`
- **Acceptance Criteria Addressed**: AC-6、AC-7、AC-8、AC-9、AC-10、AC-16
- **Test Requirements**:
  - `programmatic` TR-4.1: 对 URL `https://ex.com/path?a=1&b=2&c=3`，打开弹窗左栏必须渲染 3 条；点击 a、b 加入右栏 → 左栏 a/b 加粗 → 右栏 2 条 → 删 a → 左栏 a 取消加粗、b 仍加粗
  - `programmatic` TR-4.2: 修改列表手动新增 d=4，关闭弹窗再打开 → d=4 仍在
  - `programmatic` TR-4.3: 切换策略与删除空值开关，刷新页面后保持不变
  - `human-judgement` TR-4.4: 弹窗样式不污染宿主页面（不改变 body 的 padding/margin/滚动条），关闭后 DOM 元素清理干净

## [x] 任务 5：备份与恢复弹窗组件
- **Priority**: medium
- **Depends On**: Task 4
- **Description**:
  - 创建 Vue 组件 `src/components/BackupRestore.vue`：
    - 弹窗布局：标题「RUP 备份与恢复」
    - 区域一（导出）：
      - 「预览 JSON」折叠面板展示当前配置的 JSON 字符串（只读 textarea，带行号或语法高亮可选，默认不高亮）
      - 「导出 .json 文件」按钮：通过 `Blob` + `URL.createObjectURL` + `<a download>` 触发下载，文件名 `rup-config-YYYYMMDD-HHmmss.json`
    - 区域二（导入）：
      - 文件选择 input + 拖放区域（`drop` 事件）
      - 解析 JSON → 校验 schema（必须有 enabledDomains 数组和 domainConfigs 对象）→ 不合法弹红框提示；合法展示「导入后将覆盖当前所有配置，确认继续？」确认框
      - 确认后写回 storage，并发布 `rup:config-imported` 事件（让 FAB 根据当前 hostname 重新挂载/卸载）
  - 创建挂载器 `src/mount/backup.js`：`openBackup()` / `closeBackup()`
  - 订阅菜单事件 `rup:open-backup` → 打开备份弹窗
- **Acceptance Criteria Addressed**: AC-14、AC-15
- **Test Requirements**:
  - `programmatic` TR-5.1: 导出的 JSON 可被 `JSON.parse` 正常解析；包含 `enabledDomains` 与 `domainConfigs` 两个顶层键；结构与存储模块定义一致
  - `programmatic` TR-5.2: 构造一份合法备份 JSON（2 个启用域名，各有 2 条修改列表 + 不同策略 + 删除空值开关）→ 导入后 storage 与备份内容逐字段 deep equal
  - `programmatic` TR-5.3: 导入非法 JSON（字符串）或缺少字段 → 不写 storage 且 UI 提示错误
  - `human-judgement` TR-5.4: 导入后，跳转到对应启用域名的页面 → FAB 自动出现、修改列表/策略/删除空值一致

## [x] 任务 6：主入口装配与最终集成
- **Priority**: high
- **Depends On**: Task 1 - Task 5
- **Description**:
  - 重写 `src/main.js`：顺序执行：
    1) 初始化存储模块（读一次 GM_getValue 看是否为空，空则写默认结构）
    2) 初始化菜单模块（注册 GM 菜单）
    3) 检查当前 hostname 若已启用 → mountFab()
    4) 建立全局简单事件总线（可用 mitt 风格的极简实现，不要装包）
  - 清理 `src/App.vue` 与 `src/components/HelloWorld.vue` 及未使用的默认 SVG（如不用则删除）
  - 重写 `src/style.css` 为全局 reset（仅对 `.rup-*` 前缀类名有效，避免污染）
  - 新增中英文 README（按用户规则必须写）：
    - README.md（中文）：项目介绍、功能截图位占位、安装步骤（build 后把 dist 下的 user.js 拖入 Tampermonkey）、使用说明、开发调试、目录结构
    - README_EN.md（英文）：同上英文版本；中英文互链跳转
  - 更新 `requirements.txt` 规则不适用（纯前端），留空或跳过；确保 `package.json` / `vite.config.js` 字段正确
- **Acceptance Criteria Addressed**: 全量 AC（端到端）
- **Test Requirements**:
  - `programmatic` TR-6.1: `pnpm install && pnpm build` 构建成功无警告，dist 下生成单个 `.user.js` 文件
  - `programmatic` TR-6.2: 将构建产物安装到 Tampermonkey 后，在任意站点（如 `https://example.com?foo=bar`）启用 → 打开修改列表，添加/删除参数 → 跳转正确 → 刷新后保持
  - `human-judgement` TR-6.3: 中英文 README 存在且相互有链接跳转锚点；内容涵盖安装、使用、开发三部分
  - `human-judgement` TR-6.4: 完整手动走查一遍 AC-1 到 AC-16，全部通过

## [x] 任务 7：构建验证与文档收尾
- **Priority**: medium
- **Depends On**: Task 6
- **Description**:
  - 完整构建并产出最终 user.js：验证文件头部 meta 块齐全
  - 在 README 中追加功能总览与策略说明表格（三种策略 + 删除空值的组合说明）
  - 检查所有新增文件的长度，如有超过 500 行的组件，拆分为更小的子组件（例如 ParamEditor 拆成 LeftPanel / RightPanel / Toolbar）
  - 最终代码规范自检：无 console.log 残留、无 dead code、无硬编码测试数据、注释与提交信息全为简体中文
- **Acceptance Criteria Addressed**: NFR-5、NFR-6
- **Test Requirements**:
  - `programmatic` TR-7.1: 扫描 src 目录，单文件行数 ≤ 500
  - `programmatic` TR-7.2: dist 下最终 user.js 的 `==UserScript==` 块包含 name/namespace/match/version/icon/require/grant 等字段
  - `human-judgement` TR-7.3: 代码中所有输出到用户的文字为中文；函数/变量命名语义化
