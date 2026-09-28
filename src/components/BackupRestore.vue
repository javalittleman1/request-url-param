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

.rup-export-section {
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  margin-bottom: 16px;
}

.rup-import-section {
  padding: 16px;
  background: #f0f9ff;
  border-radius: 8px;
}

.rup-section-title {
  font-weight: 600;
  margin-bottom: 12px;
  margin-top: 0;
  font-size: 15px;
}

.rup-details {
  margin-bottom: 4px;
}

.rup-summary {
  cursor: pointer;
  padding: 6px 0;
  color: #374151;
  font-size: 14px;
}

.rup-summary:hover {
  color: #111827;
}

.rup-textarea {
  width: 100%;
  height: 200px;
  font-family: Consolas, monospace;
  font-size: 12px;
  padding: 8px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  resize: none;
  box-sizing: border-box;
  margin-top: 8px;
}

.rup-btn--export {
  margin-top: 12px;
  padding: 8px 16px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.rup-btn--export:hover {
  background: #15803d;
}

.rup-alert {
  padding: 10px 14px;
  border-radius: 6px;
  margin-bottom: 12px;
  font-size: 14px;
}

.rup-alert--error {
  background: #fef2f2;
  color: #b91c1c;
}

.rup-alert--success {
  background: #ecfdf5;
  color: #047857;
}

.rup-dropzone {
  width: 100%;
  height: 120px;
  border: 2px dashed #0ea5e9;
  border-radius: 10px;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;
  transition: all 0.2s;
}

.rup-dropzone:hover {
  background: #f0f9ff;
}

.rup-dropzone--hover {
  border-color: #0369a1;
  background: #f0f9ff;
}

.rup-dropzone__text1 {
  font-size: 18px;
}

.rup-dropzone__text2 {
  font-size: 12px;
  color: #64748b;
  margin-top: 6px;
}
</style>
