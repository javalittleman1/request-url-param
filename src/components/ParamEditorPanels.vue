<template>
  <div class="rup-panels">
    <div class="rup-panel rup-panel--left">
      <h4>当前参数</h4>
      <ul class="rup-list rup-list--left" ref="leftListRef">
        <li
          v-for="(item, idx) in currentParams"
          :key="'cp-' + idx"
          :ref="(el) => setLeftRowRef(el, item.key)"
          :class="{
            'rup-item--selected': selectedKeys.has(item.key),
            'rup-item--focused': focusedModifyKey && item.key === focusedModifyKey,
            'rup-item--flash': item.key === flashKey,
          }"
          :data-flash-key="flashKey && item.key === flashKey ? flashSeq : 0"
          @click="addToModifyList(item)"
        >
          <span class="rup-key">{{ item.key }}</span>
          <span class="rup-eq">=</span>
          <span class="rup-val">{{ item.value }}</span>
        </li>
        <li v-if="currentParams.length === 0" class="rup-empty">
          暂无 URL 查询参数
        </li>
      </ul>
    </div>
    <div class="rup-panel rup-panel--right">
      <h4>
        修改列表
        <span class="rup-add-btn" @click="handleAddParam">+ 新增参数</span>
      </h4>
      <ul class="rup-list">
        <li
          v-for="(item, idx) in modifyList"
          :key="'mp-' + idx"
          class="rup-modify-item"
        >
          <input
            type="text"
            class="inp-key"
            :ref="(el) => setKeyRef(el, idx)"
            v-model="item.key"
            @input="handleKeyInput(idx)"
            @focus="handleModifyFocus(idx, 'key')"
            @blur="handleModifyBlur(idx, 'key')"
            placeholder="参数名"
          />
          <span class="rup-eq">=</span>
          <input
            type="text"
            class="inp-val"
            v-model="item.value"
            @focus="handleModifyFocus(idx, 'value')"
            @blur="handleModifyBlur(idx, 'value')"
            placeholder="参数值"
          />
          <button class="btn-del" @click="handleDeleteParam(idx)" title="删除">
            🗑️
          </button>
        </li>
        <li v-if="modifyList.length === 0" class="rup-empty">
          修改列表为空，点击左侧参数或「+ 新增参数」开始编辑
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { parseQuery } from '../utils/url.js'

const props = defineProps({
  modifyList: {
    type: Array,
    default: () => []
  },
  selectedKeys: {
    type: Set,
    default: () => new Set()
  }
})

const emit = defineEmits([
  'update:modifyList',
  'update:selectedKeys'
])

// ============ Refs 引用 ============
const newKeyRefs = ref({})
const pendingFocusIdx = ref(-1)
const currentParamsSnapshot = ref([])
const leftListRef = ref(null)         // 当前参数面板的滚动容器（ul.rup-list--left）
const leftRowRefs = ref({})           // key=参数名，value=对应 <li> DOM 元素（当前参数面板）

// ============ 焦点联动状态（修改列表 → 当前参数） ============
const focusedModifyKey = ref('')      // 修改列表中正在编辑、且在当前参数中命中的参数名 → 让对应行"框住"
const flashKey = ref('')              // 瞬间闪烁动画触发的参数名
const flashSeq = ref(0)               // 每次闪烁自增，强制让 CSS animation 重新从 0% 播放
let _flashTimer = null
let _blurClearTimer = null

const currentParams = computed(() => currentParamsSnapshot.value)

function setLeftRowRef(el, key) {
  if (!key) return
  if (el) leftRowRefs.value[key] = el
  else delete leftRowRefs.value[key]
}

function refreshCurrentParams() {
  currentParamsSnapshot.value = parseQuery(window.location.href)
  // 刷新后清空旧引用（重建 DOM）
  leftRowRefs.value = {}
}
refreshCurrentParams()

function setKeyRef(el, idx) {
  if (el) {
    newKeyRefs.value[idx] = el
    if (pendingFocusIdx.value === idx) {
      nextTick(() => {
        if (newKeyRefs.value[idx]) {
          newKeyRefs.value[idx].focus()
        }
        pendingFocusIdx.value = -1
      })
    }
  }
}

// ==================================================
// 🌟 核心联动：修改列表输入框 获得焦点 → 定位 + 闪烁 + 框住
// ==================================================
function handleModifyFocus(idx) {
  if (_blurClearTimer) {
    // 如果即将失焦，但又立刻切到同一行另一个输入（key<->value）或同行，不要清除高亮
    clearTimeout(_blurClearTimer)
    _blurClearTimer = null
  }
  const item = props.modifyList[idx]
  if (!item) return
  const k = (item.key || '').trim()
  if (!k) { focusedModifyKey.value = ''; return }
  // 只有在「当前参数」里真正存在的 key，才做定位/闪烁/高亮
  const exists = currentParamsSnapshot.value.some(p => p.key === k)
  if (!exists) { focusedModifyKey.value = ''; return }

  focusedModifyKey.value = k
  // 1. 滚动定位
  scrollCurrentParamIntoView(k)
  // 2. 触发闪烁（每次 focus 都闪一次，通过 seq++ 强制 CSS 动画重放）
  triggerFlash(k)
}

function handleModifyBlur(idx) {
  // 延时 60ms 清空：如果用户只是从同个 row 的 key 跳到 value（Tab），
  // 会立刻触发下一次 focus → handleModifyFocus 先把 timer 清掉，不会丢失高亮
  if (_blurClearTimer) clearTimeout(_blurClearTimer)
  _blurClearTimer = setTimeout(() => {
    focusedModifyKey.value = ''
    _blurClearTimer = null
  }, 60)
}

/**
 * 在「当前参数」面板的滚动容器内，把某个参数名的 <li> 平滑居中滚动到可视区中央
 */
function scrollCurrentParamIntoView(key) {
  nextTick(() => {
    const row = leftRowRefs.value[key]
    const container = leftListRef.value
    if (!row || !container) return
    try {
      // 相对容器计算位置（不使用 window 的 scrollIntoView，避免整个 modal 外层抖）
      const cTop = container.scrollTop
      const cHeight = container.clientHeight
      const rowOffsetTop = row.offsetTop
      const rowHeight = row.offsetHeight
      const targetTop = rowOffsetTop - Math.max(0, (cHeight - rowHeight) / 2)
      if ('scrollTo' in container && typeof container.scrollTo === 'function') {
        try {
          container.scrollTo({ top: targetTop, behavior: 'smooth' })
          return
        } catch (e) { /* 老浏览器不支持 smooth 参数，走 fallback */ }
      }
      // Fallback：分段滚动做一个"弱平滑"效果
      const startTop = cTop
      const delta = targetTop - startTop
      let p = 0
      const duration = 180
      const startTs = Date.now()
      const step = () => {
        p = Math.min(1, (Date.now() - startTs) / duration)
        const ease = 1 - Math.pow(1 - p, 3) // easeOutCubic
        container.scrollTop = startTop + delta * ease
        if (p < 1) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
    } catch (e) { /* 静默 */ }
  })
}

/**
 * 让当前参数面板的某个 key 的行，闪烁一次（黄底高亮 → 复原）
 */
function triggerFlash(key) {
  if (!key) return
  flashSeq.value += 1     // 强制重放动画（配合 :data-flash-key 绑定）
  flashKey.value = key
  if (_flashTimer) clearTimeout(_flashTimer)
  _flashTimer = setTimeout(() => {
    flashKey.value = ''
    _flashTimer = null
  }, 720)
}

// ==================================================
// 原有功能
// ==================================================
function addToModifyList(item) {
  const exists = props.modifyList.some(i => i.key === item.key)
  if (!exists) {
    const newList = [...props.modifyList, { key: item.key, value: item.value }]
    emit('update:modifyList', newList)
  }
  const newSet = new Set(props.selectedKeys)
  newSet.add(item.key)
  emit('update:selectedKeys', newSet)
}

function handleAddParam() {
  const newList = [...props.modifyList, { key: '', value: '' }]
  pendingFocusIdx.value = newList.length - 1
  emit('update:modifyList', newList)
}

function handleKeyInput(idx) {
  const item = props.modifyList[idx]
  const newSet = new Set(props.selectedKeys)
  if (item && item.key) newSet.add(item.key)
  emit('update:selectedKeys', newSet)

  // 正在编辑时，如果 key 变了且正好命中当前参数 → 实时同步高亮 + 闪烁定位一次（更好 UX）
  const k = item ? (item.key || '').trim() : ''
  if (focusedModifyKey.value || k) {
    const prev = focusedModifyKey.value
    focusedModifyKey.value = k && currentParamsSnapshot.value.some(p => p.key === k) ? k : ''
    if (k && focusedModifyKey.value && focusedModifyKey.value !== prev) {
      scrollCurrentParamIntoView(k)
      triggerFlash(k)
    }
  }
}

function handleDeleteParam(idx) {
  const item = props.modifyList[idx]
  const deletedKey = item ? item.key : ''
  const newList = props.modifyList.filter((_, i) => i !== idx)
  emit('update:modifyList', newList)
  if (deletedKey) {
    const hasSameKey = newList.some(i => i.key === deletedKey)
    if (!hasSameKey) {
      const newSet = new Set(props.selectedKeys)
      newSet.delete(deletedKey)
      emit('update:selectedKeys', newSet)
      // 删除的如果正是当前高亮 key → 立即取消框住
      if (focusedModifyKey.value === deletedKey) {
        focusedModifyKey.value = ''
      }
    }
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val) refreshCurrentParams()
  }
)

defineExpose({
  refreshCurrentParams
})
</script>

<style scoped>
.rup-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  height: 100%;
}

.rup-panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.rup-panel--left {
  padding: 8px 12px 8px 4px;
  box-sizing: border-box;
}

.rup-panel--left .rup-list {
  padding: 2px 12px 10px 4px;
  box-sizing: border-box;
}

.rup-panel h4 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 12px 0;
  display: flex;
  align-items: center;
}

.rup-add-btn {
  display: inline-block;
  padding: 4px 10px;
  font-size: 12px;
  background: #eef2ff;
  color: #4f46e5;
  border-radius: 6px;
  margin-left: 8px;
  cursor: pointer;
  user-select: none;
}

.rup-add-btn:hover {
  background: #e0e7ff;
}

.rup-list {
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
}

.rup-list li {
  padding: 8px 10px;
  border-radius: 6px;
  margin-bottom: 4px;
  font-size: 13px;
}

.rup-panel--left .rup-list li {
  cursor: pointer;
  transition: background 0.15s, box-shadow 0.15s, transform 0.15s, outline 0.15s;
  outline: 2px solid transparent;
  outline-offset: -1px;
}

.rup-panel--left .rup-list li:hover {
  background: #f5f5f7;
}

.rup-panel--left .rup-list li.rup-item--selected {
  font-weight: 700;
  color: #2563eb;
}

/* =========================================================
   🌟 新增：修改列表输入框聚焦 → 让左侧当前参数匹配行"框住"
   注意：聚焦框是"向 li 内部收"的 (inset box-shadow + outline-offset 负值)
        这样不会在 list/container 边缘溢出导致 4 条边被滚动容器截断/遮挡
   ========================================================= */
.rup-panel--left .rup-list li.rup-item--focused {
  outline: 2px solid #4f46e5;
  outline-offset: -2px;
  background: #eef2ff;
  box-shadow: inset 0 0 0 2px rgba(79, 70, 229, 0.2);
  border-radius: 8px;
  z-index: 2;
  position: relative;
}

/* =========================================================
   🌟 新增：闪烁一下（黄底+缩放+外发光，播放一次 700ms）
   通过 [data-flash-key] 属性变化强制动画重放
   注意：闪烁的 box-shadow 用 inset（内发光），不溢出到 li 外，避免被滚动容器截断
   ========================================================= */
.rup-panel--left .rup-list li.rup-item--flash[data-flash-key] {
  animation: rup-flash 720ms cubic-bezier(.4,0,.2,1) both;
}

@keyframes rup-flash {
  0% {
    background-color: #fef3c7;
    transform: scale(1);
    box-shadow: inset 0 0 0 0 rgba(251, 191, 36, 0.6);
  }
  35% {
    background-color: #fde68a;
    transform: scale(1.02);
    box-shadow: inset 0 0 0 5px rgba(251, 191, 36, 0.3);
  }
  100% {
    background-color: transparent;
    transform: scale(1);
    box-shadow: inset 0 0 0 0 rgba(251, 191, 36, 0);
  }
}

/* 如果该 li 同时被选中(selected)+聚焦(focused)，闪烁后仍然保持聚焦边框 */
.rup-panel--left .rup-list li.rup-item--focused.rup-item--flash[data-flash-key] {
  animation-name: rup-flash-keep-focus;
}
@keyframes rup-flash-keep-focus {
  0%   { background-color: #fef3c7; transform: scale(1); box-shadow: inset 0 0 0 0 rgba(251, 191, 36, 0.6); }
  35%  { background-color: #fde68a; transform: scale(1.02); box-shadow: inset 0 0 0 5px rgba(251, 191, 36, 0.3); }
  100% { background-color: #eef2ff; transform: scale(1); box-shadow: inset 0 0 0 2px rgba(79, 70, 229, 0.2); }
}

.rup-key {
  font-weight: bold;
  margin-right: 6px;
}

.rup-eq {
  color: #999;
  margin-right: 4px;
}

.rup-val {
  color: #666;
  word-break: break-all;
}

.rup-modify-item {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 6px !important;
  background: #fafafa;
  border: 1px solid #f0f0f0;
}

.inp-key,
.inp-val {
  padding: 6px 8px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 13px;
  outline: none;
  background: #fff;
}

.inp-key:focus,
.inp-val:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}

.inp-key {
  width: 40%;
}

.inp-val {
  flex: 1;
}

.btn-del {
  width: 28px;
  height: 28px;
  border-radius: 4px;
  background: #fef2f2;
  color: #ef4444;
  border: none;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.btn-del:hover {
  background: #fee2e2;
}

.rup-empty {
  text-align: center;
  color: #999;
  font-size: 12px;
  padding: 20px 10px !important;
  background: #fafafa;
}
</style>
