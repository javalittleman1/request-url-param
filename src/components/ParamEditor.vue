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
.rup-mask {
  position: fixed !important;
  inset: 0 !important;
  background: rgba(0, 0, 0, 0.45) !important;
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
  background: #fff !important;
  border-radius: 12px !important;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
  z-index: 2147483602 !important;
  box-sizing: border-box !important;
  color: #333 !important;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
}

.rup-dialog,
.rup-dialog *,
.rup-dialog *::before,
.rup-dialog *::after {
  box-sizing: border-box !important;
}

.rup-dialog__header {
  flex-shrink: 0 !important;
  padding: 16px 20px !important;
  border-bottom: 1px solid #eee !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  float: none !important;
  clear: none !important;
}

.rup-dialog__header h3 {
  font-size: 16px !important;
  font-weight: 600 !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #333 !important;
  line-height: 1.4 !important;
  font-family: inherit !important;
  width: auto !important;
  height: auto !important;
  display: block !important;
}

.rup-close {
  font-size: 20px !important;
  cursor: pointer !important;
  color: #666 !important;
  user-select: none !important;
  line-height: 1 !important;
  display: inline-block !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  background: transparent !important;
}

.rup-close:hover {
  color: #333 !important;
}

.rup-dialog__body {
  flex: 1 1 auto !important;
  min-height: 0 !important;
  padding: 20px !important;
  overflow: auto !important;
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  max-height: none !important;
  float: none !important;
  clear: none !important;
  display: block !important;
}

.rup-dialog__footer {
  flex-shrink: 0 !important;
  padding: 12px 20px !important;
  border-top: 1px solid #eee !important;
  border-bottom: none !important;
  border-left: none !important;
  border-right: none !important;
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  gap: 12px !important;
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
}

.rup-footer__left {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
  margin: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
}

.rup-strategy-row {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  flex-wrap: wrap !important;
  margin: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
}

.rup-checkbox {
  display: flex !important;
  align-items: center !important;
  gap: 6px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  margin: 0 !important;
  padding: 0 !important;
  font-weight: normal !important;
  width: auto !important;
  height: auto !important;
}

.rup-checkbox input[type="checkbox"] {
  cursor: pointer !important;
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  display: inline-block !important;
  vertical-align: middle !important;
  position: static !important;
}

.rup-tip {
  font-size: 12px !important;
  color: #666 !important;
  margin: 0 !important;
  padding: 0 !important;
  line-height: 1.5 !important;
  font-weight: normal !important;
}

.rup-strategy-label {
  font-size: 14px !important;
  margin: 0 !important;
  padding: 0 !important;
  font-weight: normal !important;
  display: inline !important;
  width: auto !important;
  height: auto !important;
}

.rup-radio-group {
  display: flex !important;
  gap: 16px !important;
  flex-wrap: wrap !important;
  margin: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
}

.rup-radio {
  display: flex !important;
  align-items: center !important;
  gap: 4px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  margin: 0 !important;
  padding: 0 !important;
  font-weight: normal !important;
  width: auto !important;
  height: auto !important;
}

.rup-radio input[type="radio"] {
  cursor: pointer !important;
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  display: inline-block !important;
  vertical-align: middle !important;
  position: static !important;
  float: none !important;
}

.rup-footer__right {
  display: flex !important;
  gap: 10px !important;
  flex-shrink: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
}

.rup-btn {
  padding: 8px 18px !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  border: none !important;
  transition: all 0.2s !important;
  line-height: 1.5 !important;
  font-family: inherit !important;
  margin: 0 !important;
  display: inline-block !important;
  width: auto !important;
  height: auto !important;
  text-align: center !important;
  vertical-align: middle !important;
  white-space: nowrap !important;
  float: none !important;
  position: static !important;
  top: auto !important;
  right: auto !important;
  bottom: auto !important;
  left: auto !important;
}

.rup-btn--secondary {
  background: #fff !important;
  color: #333 !important;
  border: 1px solid #ddd !important;
}

.rup-btn--secondary:hover {
  background: #f5f5f5 !important;
}

.rup-btn--primary {
  background: #4f46e5 !important;
  color: #fff !important;
}

.rup-btn--primary:hover {
  background: #4338ca !important;
}
</style>
