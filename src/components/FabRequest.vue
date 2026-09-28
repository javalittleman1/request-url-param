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
.rup-fab,
.rup-fab *,
.rup-fab *::before,
.rup-fab *::after {
  box-sizing: border-box !important;
}

.rup-fab {
  position: fixed !important;
  right: 32px !important;
  bottom: 32px !important;
  z-index: 2147483600 !important;
  font-size: 0;
  line-height: 0;
  width: auto !important;
  height: auto !important;
  margin: 0 !important;
  padding: 0 !important;
  display: block !important;
  top: auto !important;
  left: auto !important;
  visibility: visible !important;
  opacity: 1 !important;
  float: none !important;
}

.rup-fab__inner {
  display: flex !important;
  align-items: center;
  gap: 8px;
  position: relative;
  flex-direction: row;
  justify-content: flex-end;
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
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  display: flex !important;
  align-items: center;
  justify-content: center;
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
}

.rup-fab__main {
  background: linear-gradient(135deg, #FF6B9D, #FF8E53);
  color: #fff;
}

.rup-fab__main:hover {
  transform: scale(1.05);
}

.rup-fab__sub {
  background: #fff;
  color: #333;
  border: 1px solid #e5e7eb;
  transform: translateX(calc(100% + 8px));
  opacity: 0;
  pointer-events: none;
  transition-duration: 250ms;
}

.rup-fab:hover .rup-fab__sub {
  transform: translateX(0);
  opacity: 1;
  pointer-events: auto;
}

.rup-fab__icon {
  width: 28px !important;
  height: 28px !important;
  min-width: 28px !important;
  min-height: 28px !important;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  line-height: 1;
  margin: 0 !important;
  padding: 0 !important;
  position: relative !important;
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
  stroke-opacity: 1 !important;
  overflow: visible !important;
  margin: 0 !important;
  padding: 0 !important;
  position: relative !important;
}
.rup-fab__icon :deep(svg) [fill],
.rup-fab__icon svg [fill] { fill: inherit !important; }
.rup-fab__icon :deep(svg) [stroke],
.rup-fab__icon svg [stroke] { stroke: inherit !important; }
</style>
