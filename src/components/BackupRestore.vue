<template>
  <Teleport to="body">
    <div v-if="visible" class="rup-editor">
      <div class="rup-mask" @click="handleMaskClick"></div>
      <div class="rup-dialog">
        <div class="rup-dialog__header">
          <h3>RUP 备份与恢复</h3>
          <span class="rup-close" @click="handleClose">✕</span>
        </div>
        <div class="rup-dialog__body">
          <div class="rup-export-section">
            <h4 class="rup-section-title">导出配置</h4>
            <details class="rup-details">
              <summary class="rup-summary">预览 JSON 配置</summary>
              <textarea
                class="rup-textarea"
                :value="configJsonPreview"
                readonly
              ></textarea>
            </details>
            <button class="rup-btn rup-btn--export" @click="handleExport">
              📥 导出 .json 文件
            </button>
          </div>

          <div class="rup-import-section">
            <h4 class="rup-section-title">导入配置</h4>

            <div v-if="errorMsg" class="rup-alert rup-alert--error">
              {{ errorMsg }}
            </div>
            <div v-if="successMsg" class="rup-alert rup-alert--success">
              {{ successMsg }}
            </div>

            <div
              class="rup-dropzone"
              :class="{ 'rup-dropzone--hover': isDragOver }"
              @click="triggerFileSelect"
              @dragover.prevent="handleDragOver"
              @dragleave.prevent="handleDragLeave"
              @drop.prevent="handleDrop"
            >
              <div class="rup-dropzone__text1">📁 点击选择 JSON 文件</div>
              <div class="rup-dropzone__text2">或拖拽文件到此区域</div>
              <input
                ref="fileInput"
                type="file"
                accept=".json,application/json"
                @change="handleFileChange"
                style="display:none"
              />
            </div>
          </div>
        </div>
        <div class="rup-dialog__footer">
          <div class="rup-footer__left"></div>
          <div class="rup-footer__right">
            <button class="rup-btn rup-btn--secondary" @click="handleClose">
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getFullConfig, setFullConfig } from '../storage/index.js'
import { eventBus } from '../utils/eventBus.js'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:visible', 'close'])

const fileInput = ref(null)
const errorMsg = ref('')
const successMsg = ref('')
const isDragOver = ref(false)

const configJsonPreview = computed(() => {
  return JSON.stringify(getFullConfig(), null, 2)
})

function handleMaskClick() {
  emit('close')
  emit('update:visible', false)
}

function handleClose() {
  emit('close')
  emit('update:visible', false)
}

function padZero(num) {
  return num.toString().padStart(2, '0')
}

function handleExport() {
  const fullConfig = getFullConfig()
  const now = new Date()
  const filename = `rup-config-${now.getFullYear()}${padZero(now.getMonth() + 1)}${padZero(now.getDate())}-${padZero(now.getHours())}${padZero(now.getMinutes())}${padZero(now.getSeconds())}.json`
  const blob = new Blob([JSON.stringify(fullConfig, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => {
    URL.revokeObjectURL(url)
  }, 500)
}

function triggerFileSelect() {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

function handleFileChange(e) {
  const file = e.target.files && e.target.files[0]
  handleFile(file)
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

function handleDragOver() {
  isDragOver.value = true
}

function handleDragLeave() {
  isDragOver.value = false
}

function handleDrop(e) {
  isDragOver.value = false
  const file = e.dataTransfer.files && e.dataTransfer.files[0]
  handleFile(file)
}

function handleFile(file) {
  errorMsg.value = ''
  successMsg.value = ''
  if (!file) return

  const reader = new FileReader()
  reader.onload = (e) => {
    const jsonStr = e.target.result
    try {
      const obj = JSON.parse(jsonStr)
      if (
        typeof obj !== 'object' ||
        obj === null ||
        !Array.isArray(obj.enabledDomains) ||
        typeof obj.domainConfigs !== 'object' ||
        obj.domainConfigs === null
      ) {
        errorMsg.value = '❌ 文件格式错误：缺少 enabledDomains 数组或 domainConfigs 对象'
        return
      }
      const confirmed = window.confirm('导入后将覆盖当前所有配置，是否继续？')
      if (confirmed) {
        setFullConfig(obj)
        successMsg.value = '✅ 导入成功！即将关闭弹窗…'
        eventBus.emit('rup:config-imported', obj)
        setTimeout(() => {
          emit('close')
          emit('update:visible', false)
        }, 1500)
      }
    } catch (err) {
      errorMsg.value = '❌ 文件格式错误：缺少 enabledDomains 数组或 domainConfigs 对象'
    }
  }
  reader.readAsText(file)
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

.rup-export-section {
  padding: 16px !important;
  background: #f9fafb !important;
  border-radius: 8px !important;
  margin-bottom: 16px !important;
  margin-top: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  width: auto !important;
  height: auto !important;
  box-sizing: border-box !important;
  float: none !important;
  display: block !important;
}

.rup-import-section {
  padding: 16px !important;
  background: #f0f9ff !important;
  border-radius: 8px !important;
  margin: 0 !important;
  width: auto !important;
  height: auto !important;
  box-sizing: border-box !important;
  float: none !important;
  display: block !important;
}

.rup-section-title {
  font-weight: 600 !important;
  margin-bottom: 12px !important;
  margin-top: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  font-size: 15px !important;
  line-height: 1.4 !important;
  color: #111827 !important;
  padding: 0 !important;
  display: block !important;
  width: auto !important;
  height: auto !important;
}

.rup-details {
  margin-bottom: 4px !important;
  margin-top: 0 !important;
  padding: 0 !important;
  display: block !important;
  width: auto !important;
  height: auto !important;
}

.rup-summary {
  cursor: pointer !important;
  padding: 6px 0 !important;
  color: #374151 !important;
  font-size: 14px !important;
  margin: 0 !important;
  line-height: 1.5 !important;
  display: list-item !important;
  width: auto !important;
  height: auto !important;
  list-style: auto !important;
}

.rup-summary:hover {
  color: #111827 !important;
}

.rup-textarea {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
  height: 200px !important;
  min-height: 200px !important;
  font-family: Consolas, monospace !important;
  font-size: 12px !important;
  padding: 8px !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 6px !important;
  resize: none !important;
  box-sizing: border-box !important;
  margin-top: 8px !important;
  margin-bottom: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  display: block !important;
  color: #111827 !important;
  background: #fff !important;
  line-height: 1.5 !important;
}

.rup-btn--export {
  margin-top: 12px !important;
  padding: 8px 16px !important;
  background: #16a34a !important;
  color: white !important;
  border: none !important;
  border-radius: 6px !important;
  cursor: pointer !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  margin-bottom: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  display: inline-block !important;
  width: auto !important;
  height: auto !important;
}

.rup-btn--export:hover {
  background: #15803d !important;
}

.rup-alert {
  padding: 10px 14px !important;
  border-radius: 6px !important;
  margin-bottom: 12px !important;
  margin-top: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  font-size: 14px !important;
  line-height: 1.5 !important;
  box-sizing: border-box !important;
  width: auto !important;
  height: auto !important;
  display: block !important;
}

.rup-alert--error {
  background: #fef2f2 !important;
  color: #b91c1c !important;
}

.rup-alert--success {
  background: #ecfdf5 !important;
  color: #047857 !important;
}

.rup-dropzone {
  width: 100% !important;
  min-width: 100% !important;
  max-width: 100% !important;
  height: 120px !important;
  min-height: 120px !important;
  border: 2px dashed #0ea5e9 !important;
  border-radius: 10px !important;
  background: #fff !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: center !important;
  cursor: pointer !important;
  box-sizing: border-box !important;
  transition: all 0.2s !important;
  padding: 16px !important;
  margin: 0 !important;
  float: none !important;
  position: static !important;
}

.rup-dropzone:hover {
  background: #f0f9ff !important;
}

.rup-dropzone--hover {
  border-color: #0369a1 !important;
  background: #f0f9ff !important;
}

.rup-dropzone__text1 {
  font-size: 18px !important;
  line-height: 1.5 !important;
  margin: 0 !important;
  padding: 0 !important;
  color: #0369a1 !important;
  font-weight: 600 !important;
  width: auto !important;
  height: auto !important;
  display: block !important;
}

.rup-dropzone__text2 {
  font-size: 12px !important;
  color: #64748b !important;
  margin-top: 6px !important;
  margin-bottom: 0 !important;
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding: 0 !important;
  line-height: 1.5 !important;
  width: auto !important;
  height: auto !important;
  display: block !important;
}
</style>
