import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import { readFileSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8'));

const rabbitSvg = `%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cdefs%3E%3ClinearGradient id='body' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FF6B9D'/%3E%3Cstop offset='100%25' stop-color='%23FF8E53'/%3E%3C/linearGradient%3E%3ClinearGradient id='ear' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23FF8E53'/%3E%3Cstop offset='100%25' stop-color='%23FF6B9D'/%3E%3C/linearGradient%3E%3C/defs%3E%3Cellipse cx='50' cy='62' rx='22' ry='20' fill='url(%23body)' stroke='white' stroke-width='2.5'/%3E%3Cpath d='M32 48 Q28 22 35 18 Q40 20 42 45 Z' fill='url(%23ear)' stroke='white' stroke-width='2.5'/%3E%3Cpath d='M58 48 Q62 22 55 18 Q50 20 48 45 Z' fill='url(%23ear)' stroke='white' stroke-width='2.5'/%3E%3Ccircle cx='43' cy='58' r='3.5' fill='white'/%3E%3Ccircle cx='57' cy='58' r='3.5' fill='white'/%3E%3Ccircle cx='44' cy='58' r='1.8' fill='%23333'/%3E%3Ccircle cx='58' cy='58' r='1.8' fill='%23333'/%3E%3Cellipse cx='50' cy='68' rx='3' ry='2' fill='%23FFB6C1' stroke='white' stroke-width='1.2'/%3E%3Cpath d='M72 60 Q82 52 88 58 Q84 62 75 64 Z' fill='%23FF6B9D' stroke='white' stroke-width='2.5'/%3E%3Cpath d='M36 80 Q32 90 28 92 Q36 88 42 82 Z' fill='url(%23body)' stroke='white' stroke-width='2'/%3E%3Cpath d='M64 80 Q68 90 72 92 Q64 88 58 82 Z' fill='url(%23body)' stroke='white' stroke-width='2'/%3E%3Ccircle cx='50' cy='40' r='3' fill='%23FFD700'/%3E%3Cpath d='M45 38 L43 30 M55 38 L57 30' stroke='%23FFD700' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E`;

const GITHUB_REPO = 'javalittleman1/request-url-param';
const SOURCE_BRANCH = 'master';
const META_FILE = 'meta.user.js';
// ★ Tampermonkey 自动更新链路：
//   1) @updateURL：指向 master 分支根目录的 meta.user.js（只含脚本头元信息，~2KB，不走任何 releases 分支）
//      Tampermonkey 会定时拉这个地址读取头里的 @version，和本地版本号比对
//   2) @downloadURL：同样指向 meta.user.js
//      （篡改猴读到 meta.user.js 中版本更高就会使用同一 meta.user.js 做差异更新的小文件更新下载；
//       同时我们也在 Release assets 中附带完整的 rup-tampermonkey.user.js 供用户手动安装 / 全新安装）
// 构建产物（完整 user.js / 精简 meta.js）都只保存在 GitHub Releases assets 中
// 源码仓 master 分支只保留极小的 meta.user.js 作为更新指针（~2KB），不保存任何完整的打包代码
const RAW_META_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/${SOURCE_BRANCH}/${META_FILE}`;
const RELEASES_PAGE_URL = `https://github.com/${GITHUB_REPO}/releases`;

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'RUP - 请求URL参数修改',
        namespace: 'npm/rup-tampermonkey',
        // ★ version 唯一真相源：package.json 的 version 字段
        //  以后发版只改 package.json 的 version 即可，CI 构建会自动用同一个版本号写进脚本头
        version: pkg.version,
        icon: `data:image/svg+xml;charset=UTF-8,${rabbitSvg}`,
        match: ['*://*/*'],
        updateURL: RAW_META_URL,
        downloadURL: RAW_META_URL,
        homepageURL: `https://github.com/${GITHUB_REPO}`,
        supportURL: `https://github.com/${GITHUB_REPO}/issues`,
        noframes: true,
        grant: [
          'GM_registerMenuCommand',
          'GM_setValue',
          'GM_getValue',
          'GM_deleteValue',
          'GM_listValues',
          'GM_addStyle',
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
