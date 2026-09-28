<template>
  <Teleport to="body">
    <div v-if="visible" class="rup-editor">
      <div class="rup-mask" @click="handleMaskClick"></div>
      <div class="rup-dialog">
        <div class="rup-dialog__header">
          <h3>RUP - 参数编辑</h3>
          <span class="rup-close" @click="handleClose">✕</span>
        </div>
        <div class="rup-dialog__body">
          <ParamEditorPanels
            ref="panelsRef"
            v-model:modifyList="localModifyList"
            v-model:selectedKeys="localSelectedKeys"
          />
        </div>
        <div class="rup-dialog__footer">
          <div class="rup-footer__left">
            <div class="rup-strategy-row">
              <label class="rup-checkbox">
                <input
                  type="checkbox"
                  v-model="localRemoveEmpty"
                  @change="triggerAutoSave"
                />
                <span>删除空值</span>
              </label>
              <span class="rup-tip">勾选后 modifyList 中 value 为空的参数将被删除</span>
            </div>
            <div class="rup-strategy-row">
              <label class="rup-strategy-label">修改策略</label>
              <div class="rup-radio-group">
                <label
                  v-for="(label, key) in STRATEGY_LABELS"
                  :key="key"
                  class="rup-radio"
                >
                  <input
                    type="radio"
                    :value="key"
                    v-model="localStrategy"
                    @change="triggerAutoSave"
                  />
                  <span>{{ label }}</span>
                </label>
              </div>
            </div>
          </div>
          <div class="rup-footer__right">
            <button class="rup-btn rup-btn--secondary" @click="handleClose">
              取消
            </button>
            <button class="rup-btn rup-btn--primary" @click="applyChanges">
              应用修改
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import ParamEditorPanels from './ParamEditorPanels.vue'
import { STRATEGY_LABELS } from '../menu/index.js'
import { getConfig, saveConfig } from '../storage/index.js'
import { applyStrategy } from '../utils/url.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close'])

const panelsRef = ref(null)
const localModifyList = ref([])
const localSelectedKeys = ref(new Set())
const localStrategy = ref('match_only')
const localRemoveEmpty = ref(false)

let saveTimer = null

function triggerAutoSave() {
  if (saveTimer) {
    clearTimeout(saveTimer)
  }
  saveTimer = setTimeout(() => {
    const hostname = window.location.hostname
    saveConfig(hostname, {
      modifyList: localModifyList.value,
      strategy: localStrategy.value,
      removeEmpty: localRemoveEmpty.value
    })
  }, 300)
}

watch(
  () => localModifyList.value,
  () => {
    triggerAutoSave()
  },
  { deep: true }
)

watch(
  () => props.visible,
  (val) => {
    if (val) {
      initConfig()
      if (panelsRef.value) {
        panelsRef.value.refreshCurrentParams()
      }
    }
  }
)

onMounted(() => {
  if (props.visible) {
    initConfig()
  }
})

function initConfig() {
  const hostname = window.location.hostname
  const cfg = getConfig(hostname)
  localModifyList.value = JSON.parse(JSON.stringify(cfg.modifyList || []))
  localStrategy.value = cfg.strategy || 'match_only'
  localRemoveEmpty.value = !!cfg.removeEmpty
  localSelectedKeys.value = new Set()
  for (const item of localModifyList.value) {
    if (item.key) {
      localSelectedKeys.value.add(item.key)
    }
  }
}

function handleMaskClick() {
  emit('close')
  emit('update:visible', false)
}

function handleClose() {
  emit('close')
  emit('update:visible', false)
}

function applyChanges() {
  const hostname = window.location.hostname
  const cfg = {
    modifyList: localModifyList.value.filter(i => i.key !== ''),
    strategy: localStrategy.value,
    removeEmpty: localRemoveEmpty.value,
    lastUrl: window.location.href
  }
  saveConfig(hostname, cfg)
  const newUrl = applyStrategy(window.location.href, cfg.modifyList, cfg.strategy, cfg.removeEmpty)
  emit('close')
  emit('update:visible', false)
  if (newUrl !== window.location.href) {
    window.location.href = newUrl
  }
}
</script>

<style scoped>
.rup-dialog,
.rup-dialog *,
.rup-dialog *::before,
.rup-dialog *::after {
  box-sizing: border-box !important;
}

.rup-mask {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2147483601 !important;
}

.rup-dialog {
  position: fixed !important;
  left: 50% !important;
  top: 50% !important;
  transform: translate(-50%, -50%) !important;
  width: 820px !important;
  max-width: 95vw !important;
  max-height: 85vh !important;
  display: flex !important;
  flex-direction: column !important;
  overflow: hidden !important;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 2147483602 !important;
  margin: 0 !important;
  padding: 0 !important;
  float: none !important;
}

.rup-dialog__header {
  flex-shrink: 0 !important;
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  min-height: 0 !important;
  float: none !important;
  background: #fff;
}

.rup-dialog__header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 !important;
}

.rup-close {
  font-size: 20px;
  cursor: pointer;
  color: #666;
  user-select: none;
}

.rup-close:hover {
  color: #333;
}

.rup-dialog__body {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  padding: 20px;
  overflow: auto !important;
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  float: none !important;
  display: block !important;
}

.rup-dialog__footer {
  flex-shrink: 0 !important;
  padding: 12px 20px;
  border-top: 1px solid #eee;
  display: flex !important;
  justify-content: space-between;
  align-items: center;
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  float: none !important;
  clear: none !important;
  background: #fff !important;
  position: static !important;
  bottom: auto !important;
  left: auto !important;
  right: auto !important;
  top: auto !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.rup-footer__left {
  display: flex !important;
  flex-direction: column;
  gap: 8px;
  margin: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
}

.rup-strategy-row {
  display: flex !important;
  align-items: center;
  gap: 8px;
}

.rup-checkbox {
  display: flex !important;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 !important;
  padding: 0 !important;
  font-weight: normal !important;
  width: auto !important;
  height: auto !important;
}

.rup-checkbox input[type="checkbox"] {
  cursor: pointer;
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  display: inline-block !important;
  position: static !important;
  float: none !important;
}

.rup-tip {
  font-size: 12px;
  color: #666;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1.5;
}

.rup-strategy-label {
  font-size: 14px;
  margin: 0 !important;
  padding: 0 !important;
  font-weight: normal !important;
}

.rup-radio-group {
  display: flex !important;
  gap: 16px;
  flex-wrap: wrap !important;
  margin: 0 !important;
  padding: 0 !important;
}

.rup-radio {
  display: flex !important;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  margin: 0 !important;
  padding: 0 !important;
  font-weight: normal !important;
  width: auto !important;
  height: auto !important;
}

.rup-radio input[type="radio"] {
  cursor: pointer;
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  display: inline-block !important;
  position: static !important;
  float: none !important;
}

.rup-footer__right {
  display: flex !important;
  gap: 10px;
  flex-shrink: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
}

.rup-btn {
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  border: none;
  transition: all 0.2s;
  line-height: 1.5 !important;
  margin: 0 !important;
  display: inline-block !important;
  width: auto !important;
  height: auto !important;
  text-align: center !important;
  white-space: nowrap !important;
  float: none !important;
  position: static !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.rup-btn--secondary {
  background: #fff;
  color: #333;
  border: 1px solid #ddd;
}

.rup-btn--secondary:hover {
  background: #f5f5f5;
}

.rup-btn--primary {
  background: #4f46e5;
  color: #fff;
}

.rup-btn--primary:hover {
  background: #4338ca;
}
</style>
