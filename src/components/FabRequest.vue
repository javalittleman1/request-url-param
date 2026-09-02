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
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 2147483600;
}

.rup-fab__inner {
  display: flex;
  align-items: center;
  gap: 8px;
  position: relative;
  flex-direction: row;
  justify-content: flex-end;
}

.rup-fab__main,
.rup-fab__sub {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
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

.rup-fab__icon svg {
  width: 24px;
  height: 24px;
}
</style>
