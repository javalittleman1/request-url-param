<template>
  <div class="rup-panels">
    <div class="rup-panel rup-panel--left">
      <h4>当前参数</h4>
      <ul class="rup-list">
        <li
          v-for="(item, idx) in currentParams"
          :key="'cp-' + idx"
          :class="{ 'rup-item--selected': selectedKeys.has(item.key) }"
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
            placeholder="参数名"
          />
          <span class="rup-eq">=</span>
          <input
            type="text"
            class="inp-val"
            v-model="item.value"
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

const newKeyRefs = ref({})
const pendingFocusIdx = ref(-1)
const currentParamsSnapshot = ref([])

const currentParams = computed(() => {
  return currentParamsSnapshot.value
})

function refreshCurrentParams() {
  currentParamsSnapshot.value = parseQuery(window.location.href)
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
  if (item.key) {
    newSet.add(item.key)
  }
  emit('update:selectedKeys', newSet)
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
    }
  }
}

watch(
  () => props.visible,
  (val) => {
    if (val) {
      refreshCurrentParams()
    }
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
  transition: background 0.15s;
}

.rup-panel--left .rup-list li:hover {
  background: #f5f5f7;
}

.rup-panel--left .rup-list li.rup-item--selected {
  font-weight: 700;
  color: #2563eb;
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
