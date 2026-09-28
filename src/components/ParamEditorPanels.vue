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
.rup-panels,
.rup-panels *,
.rup-panels *::before,
.rup-panels *::after {
  box-sizing: border-box !important;
}

.rup-panels {
  display: grid !important;
  grid-template-columns: 1fr 1fr !important;
  gap: 20px !important;
  height: 100% !important;
  width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  box-sizing: border-box !important;
  font-family: inherit !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  color: #333 !important;
  float: none !important;
  clear: none !important;
}

.rup-panel {
  display: flex !important;
  flex-direction: column !important;
  min-height: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
  box-sizing: border-box !important;
  float: none !important;
}

.rup-panel--left {
  padding: 8px 12px 8px 4px !important;
  box-sizing: border-box !important;
}

.rup-panel--left .rup-list {
  padding: 2px 12px 10px 4px !important;
  box-sizing: border-box !important;
}

.rup-panel h4 {
  font-size: 14px !important;
  font-weight: 600 !important;
  margin: 0 0 12px 0 !important;
  padding: 0 !important;
  display: flex !important;
  align-items: center !important;
  line-height: 1.4 !important;
  color: #111827 !important;
  width: auto !important;
  height: auto !important;
  font-family: inherit !important;
}

.rup-add-btn {
  display: inline-block !important;
  padding: 4px 10px !important;
  font-size: 12px !important;
  background: #eef2ff !important;
  color: #4f46e5 !important;
  border-radius: 6px !important;
  margin-left: 8px !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  margin-right: 0 !important;
  cursor: pointer !important;
  user-select: none !important;
  line-height: 1.5 !important;
  float: none !important;
  width: auto !important;
  height: auto !important;
  font-weight: normal !important;
}

.rup-add-btn:hover {
  background: #e0e7ff !important;
}

.rup-list {
  list-style: none !important;
  padding: 0 !important;
  margin: 0 !important;
  overflow-y: auto !important;
  flex: 1 1 auto !important;
  min-height: 0 !important;
  display: block !important;
  width: auto !important;
  height: auto !important;
  float: none !important;
}

.rup-list li {
  padding: 8px 10px !important;
  border-radius: 6px !important;
  margin-bottom: 4px !important;
  margin-top: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  font-size: 13px !important;
  line-height: 1.5 !important;
  width: auto !important;
  height: auto !important;
  float: none !important;
  clear: none !important;
  list-style: none !important;
  list-style-type: none !important;
  display: block !important;
  position: relative !important;
  box-sizing: border-box !important;
  color: inherit !important;
  font-family: inherit !important;
}

.rup-panel--left .rup-list li {
  cursor: pointer !important;
  transition: background 0.15s, box-shadow 0.15s, transform 0.15s, outline 0.15s !important;
  outline: 2px solid transparent !important;
  outline-offset: -1px !important;
  background: transparent !important;
}

.rup-panel--left .rup-list li:hover {
  background: #f5f5f7 !important;
}

.rup-panel--left .rup-list li.rup-item--selected {
  font-weight: 700 !important;
  color: #2563eb !important;
}

/* =========================================================
   聚焦"框住"
   ========================================================= */
.rup-panel--left .rup-list li.rup-item--focused {
  outline: 2px solid #4f46e5 !important;
  outline-offset: -2px !important;
  background: #eef2ff !important;
  box-shadow: inset 0 0 0 2px rgba(79, 70, 229, 0.2) !important;
  border-radius: 8px !important;
  z-index: 2 !important;
  position: relative !important;
}

/* =========================================================
   闪烁动画
   ========================================================= */
.rup-panel--left .rup-list li.rup-item--flash[data-flash-key] {
  animation: rup-flash 720ms cubic-bezier(.4,0,.2,1) both !important;
}

@keyframes rup-flash {
  0% {
    background-color: #fef3c7 !important;
    transform: scale(1) !important;
    box-shadow: inset 0 0 0 0 rgba(251, 191, 36, 0.6) !important;
  }
  35% {
    background-color: #fde68a !important;
    transform: scale(1.02) !important;
    box-shadow: inset 0 0 0 5px rgba(251, 191, 36, 0.3) !important;
  }
  100% {
    background-color: transparent !important;
    transform: scale(1) !important;
    box-shadow: inset 0 0 0 0 rgba(251, 191, 36, 0) !important;
  }
}

/* 聚焦行闪烁后保持聚焦边框 */
.rup-panel--left .rup-list li.rup-item--focused.rup-item--flash[data-flash-key] {
  animation-name: rup-flash-keep-focus !important;
}
@keyframes rup-flash-keep-focus {
  0%   { background-color: #fef3c7 !important; transform: scale(1) !important; box-shadow: inset 0 0 0 0 rgba(251, 191, 36, 0.6) !important; }
  35%  { background-color: #fde68a !important; transform: scale(1.02) !important; box-shadow: inset 0 0 0 5px rgba(251, 191, 36, 0.3) !important; }
  100% { background-color: #eef2ff !important; transform: scale(1) !important; box-shadow: inset 0 0 0 2px rgba(79, 70, 229, 0.2) !important; }
}

.rup-key {
  font-weight: bold !important;
  margin-right: 6px !important;
  margin-left: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding: 0 !important;
  display: inline !important;
  line-height: inherit !important;
  color: inherit !important;
  width: auto !important;
  height: auto !important;
}

.rup-eq {
  color: #999 !important;
  margin-right: 4px !important;
  margin-left: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding: 0 !important;
  display: inline !important;
  line-height: inherit !important;
  width: auto !important;
  height: auto !important;
  font-weight: normal !important;
}

.rup-val {
  color: #666 !important;
  word-break: break-all !important;
  margin: 0 !important;
  padding: 0 !important;
  display: inline !important;
  line-height: inherit !important;
  width: auto !important;
  height: auto !important;
  font-weight: normal !important;
}

.rup-modify-item {
  display: flex !important;
  gap: 6px !important;
  align-items: center !important;
  padding: 6px !important;
  background: #fafafa !important;
  border: 1px solid #f0f0f0 !important;
  margin-bottom: 4px !important;
  margin-top: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: auto !important;
  height: auto !important;
  box-sizing: border-box !important;
  float: none !important;
  clear: none !important;
  border-radius: 6px !important;
  flex-wrap: nowrap !important;
}

.inp-key,
.inp-val {
  padding: 6px 8px !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 4px !important;
  font-size: 13px !important;
  outline: none !important;
  background: #fff !important;
  color: #111827 !important;
  margin: 0 !important;
  line-height: 1.5 !important;
  font-family: inherit !important;
  display: inline-block !important;
  box-sizing: border-box !important;
  height: auto !important;
  float: none !important;
  box-shadow: none !important;
}

.inp-key:focus,
.inp-val:focus {
  border-color: #4f46e5 !important;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1) !important;
  outline: none !important;
}

.inp-key {
  width: 40% !important;
  min-width: 80px !important;
  max-width: none !important;
  flex-shrink: 0 !important;
}

.inp-val {
  flex: 1 1 auto !important;
  min-width: 0 !important;
  max-width: none !important;
}

.btn-del {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  max-width: 28px !important;
  max-height: 28px !important;
  border-radius: 4px !important;
  background: #fef2f2 !important;
  color: #ef4444 !important;
  border: none !important;
  font-size: 14px !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1 !important;
  float: none !important;
  position: static !important;
}

.btn-del:hover {
  background: #fee2e2 !important;
}

.rup-empty {
  text-align: center !important;
  color: #999 !important;
  font-size: 12px !important;
  padding: 20px 10px !important;
  background: #fafafa !important;
  margin-bottom: 4px !important;
  margin-top: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: auto !important;
  height: auto !important;
  box-sizing: border-box !important;
  line-height: 1.5 !important;
  border-radius: 6px !important;
  font-weight: normal !important;
}
</style>
