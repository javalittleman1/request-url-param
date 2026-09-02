import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';

const rabbitSvg = `%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='body' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FF6B9D'/%3E%3Cstop offset='100%25' stop-color='%23FF8E53'/%3E%3C/linearGradient%3E%3ClinearGradient id='ear' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FF8E53'/%3E%3Cstop offset='100%25' stop-color='%23FF6B9D'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse cx='50' cy='62' rx='22' ry='20' fill='url(%23body)' stroke='white' stroke-width='2.5'/%3E%3Cpath d='M32 48 Q28 22 35 18 Q40 20 42 45 Z' fill='url(%23ear)' stroke='white' stroke-width='2.5'/%3E%3Cpath d='M58 48 Q62 22 55 18 Q50 20 48 45 Z' fill='url(%23ear)' stroke='white' stroke-width='2.5'/%3E%3Ccircle cx='43' cy='58' r='3.5' fill='white'/%3E%3Ccircle cx='57' cy='58' r='3.5' fill='white'/%3E%3Ccircle cx='44' cy='58' r='1.8' fill='%23333'/%3E%3Ccircle cx='58' cy='58' r='1.8' fill='%23333'/%3E%3Cellipse cx='50' cy='68' rx='3' ry='2' fill='%23FFB6C1' stroke='white' stroke-width='1.2'/%3E%3Cpath d='M72 60 Q82 52 88 58 Q84 62 75 64 Z' fill='%23FF6B9D' stroke='white' stroke-width='2.5'/%3E%3Cpath d='M36 80 Q32 90 28 92 Q36 88 42 82 Z' fill='url(%23body)' stroke='white' stroke-width='2'/%3E%3Cpath d='M64 80 Q68 90 72 92 Q64 88 58 82 Z' fill='url(%23body)' stroke='white' stroke-width='2'/%3E%3Ccircle cx='50' cy='40' r='3' fill='%23FFD700'/%3E%3Cpath d='M45 38 L43 30 M55 38 L57 30' stroke='%23FFD700' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E`;

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'RUP - 请求URL参数修改',
        namespace: 'npm/rup-tampermonkey',
        version: '0.1.0',
        icon: `data:image/svg+xml;charset=UTF-8,${rabbitSvg}`,
        match: ['*://*/*'],
        grant: [
          'GM_registerMenuCommand',
          'GM_setValue',
          'GM_getValue',
          'GM_deleteValue',
          'GM_listValues',
          'GM_addStyle',
          'GM_notification',
        ],
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
