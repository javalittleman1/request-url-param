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
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2147483601;
}

.rup-dialog {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 820px;
  max-width: 95vw;
  max-height: 85vh;
  overflow: hidden;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  z-index: 2147483602;
}

.rup-dialog__header {
  padding: 16px 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rup-dialog__header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
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
  padding: 20px;
  overflow: auto;
  height: calc(85vh - 140px);
}

.rup-dialog__footer {
  padding: 12px 20px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.rup-footer__left {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.rup-strategy-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rup-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
}

.rup-checkbox input[type="checkbox"] {
  cursor: pointer;
}

.rup-tip {
  font-size: 12px;
  color: #666;
}

.rup-strategy-label {
  font-size: 14px;
}

.rup-radio-group {
  display: flex;
  gap: 16px;
}

.rup-radio {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
}

.rup-radio input[type="radio"] {
  cursor: pointer;
}

.rup-footer__right {
  display: flex;
  gap: 10px;
}

.rup-btn {
  padding: 8px 18px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  border: none;
  transition: all 0.2s;
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
