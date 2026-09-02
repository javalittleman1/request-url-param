# RUP - Request URL Parameter Modifier Userscript

🐰 RUP (Request URL Param) - A cute rabbit helps you quickly modify GET request URL parameters in the browser

[中文 Readme](./README.md)

## Introduction

This project is a Tampermonkey userscript built with Vite + Vue 3 + vite-plugin-monkey, designed for quickly modifying GET request URL parameters directly in the browser.

## Features

> [English Version](./README_EN.md) | [中文版本](./README.md)

- Menu toggle to enable/disable current domain (Black Pen / Green Pen mode)
- Floating action button (FAB) at bottom-right corner for request launching
- Gear "Modify" button revealed on FAB hover
- Dual-panel editor with Current Parameters + Modify List for intuitive editing
- Three flexible parameter modification strategies for different scenarios
- Remove empty values switch to strip invalid parameters in one click
- Complete JSON backup and import/restore for configuration
- Local persistence via Userscript storage + LocalStorage dual adapter

## Three Modification Strategies

| Strategy | Identifier | Behavior Description |
|----------|------------|----------------------|
| Match & Replace Only (Default) | match_only | Preserves all original URL parameters, only modifies parameter values in modifyList that already exist in the original URL with matching names. Does not append new parameters. |
| Use Only Modify List Parameters | list_only | Clears all original URL parameters, keeps only parameters defined in modifyList. |
| Match & Replace + Diff Params | match_and_diff | Preserves all original URL parameters and replaces matches, additionally appends new difference parameters from modifyList. |

## Remove Empty Values Switch

| Remove Empty | Behavior |
|--------------|----------|
| Checked ✅ | Parameters with empty string values in modifyList are removed from the final URL |
| Unchecked (Default) | Parameters with empty values in modifyList are preserved as `key=` form |

## Installation

1. Install the [Tampermonkey](https://www.tampermonkey.net/) extension (supports Chrome, Edge, Firefox, etc.)
2. In the project root directory, run: `pnpm install && pnpm build`
3. After build completes, open the `dist/rup-tampermonkey.user.js` file in your browser (or drag it directly into the extension management panel "Utilities → Import from URL/File")
4. Click "Install" to finish

## Usage

1. Open any webpage with GET parameters in the URL
2. Click the Tampermonkey icon in the browser toolbar → select "🐰 RUP: ⚫🖊️ [Black Pen] Modify params on this page" to switch to Green Pen mode
3. A 🐇 floating finger button appears at the bottom-right: click directly to launch request; hover to reveal the gear "Modify" button
4. Click the gear to open the parameter editor: select params from left panel to add to right modify list, or manually add new entries; choose strategy + remove empty values at bottom → apply changes

## Backup & Restore

The "💾 Backup & Restore" entry can be found either in the parameter editor or the Tampermonkey menu. Clicking the export function will export all domain enable lists, per-domain modify lists, strategy configurations, and remove-empty switches as a JSON file downloaded to your local machine.

To restore, select the previously exported JSON file to restore all configurations in one click. After import, the current domain's FAB enable state is synced automatically.

## Development & Debugging

The project is built on pnpm + vite, supporting hot reload and packaging:

- `pnpm dev`: Start development server with hot reload for debugging
- `pnpm build`: Build production-ready userscript

Main module structure:

```
    src/
        assets/icons/    Icon resources (SVG components)
        components/     Vue 3 business components (FAB, Editor, BackupRestore)
        mount/          Mount entries (fab / editor / backup)
        menu/           Tampermonkey menu registration logic
        storage/        Local storage config read/write
        utils/          Event bus, URL utility functions
```

## Directory Structure Tree

```
    src/
    ├── assets/
    │   └── icons/
    │       ├── iconDisk.js
    │       ├── iconFinger.js
    │       ├── iconGear.js
    │       ├── iconPenBlack.js
    │       ├── iconPenGreen.js
    │       └── iconRabbit.js
    ├── components/
    │   ├── BackupRestore.vue
    │   ├── FabRequest.vue
    │   ├── ParamEditor.vue
    │   └── ParamEditorPanels.vue
    ├── mount/
    │   ├── backup.js
    │   ├── editor.js
    │   └── fab.js
    ├── menu/
    │   └── index.js
    ├── storage/
    │   └── index.js
    ├── utils/
    │   ├── eventBus.js
    │   └── url.js
    ├── main.js
    └── style.css
```

## FAQ

**Q: Why is there no effect after installing the script?**
A: Please check if the `@match` rule in the userscript header matches the current domain. The default configuration is `*://*/*` which matches all sites; if manually modified, please restore it. Also ensure the Tampermonkey extension is enabled and the script is in "Enabled" state.

**Q: Why doesn't the Tampermonkey menu text change after page refresh?**
A: This is a known Tampermonkey behavior: menu item text registered via `GM_registerMenuCommand` only re-renders on page refresh, but the toggle functionality itself takes effect in real-time—no cause for concern.

**Q: Why is my imported configuration not taking effect?**
A: After import completes, please refresh the current page, or toggle the Black Pen / Green Pen mode once in the Tampermonkey menu to trigger state synchronization.

## License

MIT
