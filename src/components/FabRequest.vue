<template>
  <div class="rup-fab">
    <div class="rup-fab__inner">
      <button class="rup-fab__sub" type="button" @click="handleSubClick">
        <span class="rup-fab__icon" v-html="iconGear"></span>
      </button>
      <button class="rup-fab__main" type="button" @click="handleMainClick">
        <span class="rup-fab__icon" v-html="iconFinger"></span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineEmits } from 'vue'
import iconFinger from '../assets/icons/iconFinger.js'
import iconGear from '../assets/icons/iconGear.js'
import { getConfig } from '../storage/index.js'
import { applyStrategy } from '../utils/url.js'

const emit = defineEmits(['open-editor'])

function handleMainClick() {
  const hostname = window.location.hostname
  const cfg = getConfig(hostname)
  const newUrl = applyStrategy(
    window.location.href,
    cfg.modifyList,
    cfg.strategy,
    cfg.removeEmpty
  )
  if (newUrl !== window.location.href) {
    window.location.href = newUrl
  } else if (window.GM_notification) {
    try { window.GM_notification({ text: '参数无变化，已跳过跳转', title: 'RUP 提示', timeout: 2000 }) } catch {}
  }
}

function handleSubClick() {
  emit('open-editor')
}
</script>

<style scoped>
.rup-fab {
  position: fixed !important;
  right: 32px !important;
  bottom: 32px !important;
  z-index: 2147483600 !important;
  font-size: 0 !important;
  line-height: 0 !important;
  width: auto !important;
  height: auto !important;
  min-width: 0 !important;
  min-height: 0 !important;
  max-width: none !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  float: none !important;
  clear: none !important;
  display: block !important;
  top: auto !important;
  left: auto !important;
  visibility: visible !important;
  opacity: 1 !important;
}

.rup-fab *,
.rup-fab *::before,
.rup-fab *::after {
  box-sizing: border-box !important;
}

.rup-fab__inner {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  position: relative !important;
  flex-direction: row !important;
  justify-content: flex-end !important;
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  float: none !important;
}

.rup-fab__main,
.rup-fab__sub {
  width: 52px !important;
  height: 52px !important;
  min-width: 52px !important;
  min-height: 52px !important;
  max-width: 52px !important;
  max-height: 52px !important;
  border-radius: 50% !important;
  border: none !important;
  cursor: pointer !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.2s ease !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 0 !important;
  overflow: hidden !important;
  margin: 0 !important;
  float: none !important;
  position: static !important;
  top: auto !important;
  right: auto !important;
  bottom: auto !important;
  left: auto !important;
  visibility: visible !important;
  opacity: 1 !important;
  line-height: 1 !important;
  font-size: 14px !important;
  font-family: inherit !important;
  text-transform: none !important;
  letter-spacing: normal !important;
  text-indent: 0 !important;
  text-shadow: none !important;
  vertical-align: middle !important;
  word-spacing: normal !important;
}

.rup-fab__main {
  background: linear-gradient(135deg, #FF6B9D, #FF8E53) !important;
  color: #fff !important;
}

.rup-fab__main:hover {
  transform: scale(1.05) !important;
}

.rup-fab__sub {
  background: #fff !important;
  color: #333 !important;
  border: 1px solid #e5e7eb !important;
  transform: translateX(calc(100% + 8px)) !important;
  opacity: 0 !important;
  pointer-events: none !important;
  transition-duration: 250ms !important;
}

.rup-fab:hover .rup-fab__sub {
  transform: translateX(0) !important;
  opacity: 1 !important;
  pointer-events: auto !important;
}

.rup-fab__icon {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  margin: 0 !important;
  padding: 0 !important;
  font-size: 0 !important;
}

.rup-fab__icon :deep(svg),
.rup-fab__icon svg {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
  fill: currentColor !important;
  stroke: currentColor !important;
  fill-opacity: 1 !important;
  stroke-width: initial !important;
  overflow: visible !important;
  margin: 0 !important;
  padding: 0 !important;
}
</style>
