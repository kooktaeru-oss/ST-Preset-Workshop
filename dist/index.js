const EXTENSION_NAME = '🧩预设工坊';
const RUNTIME_ID = 'TH-script--🧩预设工坊（GitHub 扩展）--2f53f6af-3c9e-4c71-bc52-9f635be25300';
const LEGACY_IFRAME_PREFIX = 'TH-script--🧩预设工坊';
const HELPER_WAIT_TIMEOUT = 60_000;
const LEGACY_GRACE_PERIOD = 3_000;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function notify(type, message) {
  const toast = globalThis.toastr?.[type];
  if (typeof toast === 'function') {
    toast(message, EXTENSION_NAME);
  }
}

function findLegacyRuntime() {
  return [...document.querySelectorAll('iframe[id]')].find(
    iframe => iframe.id !== RUNTIME_ID && iframe.id.startsWith(LEGACY_IFRAME_PREFIX),
  );
}

async function waitForLegacyRuntime() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < LEGACY_GRACE_PERIOD) {
    const legacyRuntime = findLegacyRuntime();
    if (legacyRuntime) {
      return legacyRuntime;
    }
    await sleep(100);
  }
  return null;
}

async function waitForTavernHelper() {
  const startedAt = Date.now();
  while (Date.now() - startedAt < HELPER_WAIT_TIMEOUT) {
    if (globalThis.TavernHelper?._bind && globalThis._ && globalThis.$) {
      return true;
    }
    await sleep(250);
  }
  return false;
}

function buildRuntimeDocument() {
  const parentJqueryUrl = new URL('../bridge/parent-jquery.js', import.meta.url).href;
  const predefineUrl = new URL('../bridge/predefine.js', import.meta.url).href;
  const workshopUrl = new URL('./workshop-v2.55.js', import.meta.url).href;

  return `<!DOCTYPE html>
<html>
<head>
<base href="${location.origin}/">
<script src="https://testingcf.jsdelivr.net/npm/vue/dist/vue.runtime.global.prod.min.js"></script>
<script src="https://testingcf.jsdelivr.net/npm/vue-router/dist/vue-router.global.prod.min.js"></script>
<script src="${parentJqueryUrl}"></script>
<script src="${predefineUrl}"></script>
<script src="https://testingcf.jsdelivr.net/gh/N0VI028/JS-Slash-Runner/src/iframe/node_modules/log.js"></script>
</head>
<body>
<script type="module" src="${workshopUrl}"></script>
</body>
</html>`;
}

export async function startPresetWorkshop() {
  const currentRuntime = document.getElementById(RUNTIME_ID);
  if (currentRuntime) {
    return currentRuntime;
  }

  const legacyRuntime = findLegacyRuntime();
  if (legacyRuntime) {
    console.warn(`[${EXTENSION_NAME}] 检测到旧版酒馆助手脚本，扩展运行实例未重复启动。`);
    notify('warning', '检测到旧版脚本，请先停用旧版后再使用扩展版');
    return null;
  }

  if (!(await waitForTavernHelper())) {
    const message = '未检测到酒馆助手，请先安装并启用酒馆助手';
    console.error(`[${EXTENSION_NAME}] ${message}`);
    notify('error', message);
    return null;
  }

  const delayedLegacyRuntime = await waitForLegacyRuntime();
  if (delayedLegacyRuntime) {
    console.warn(`[${EXTENSION_NAME}] 检测到稍后启动的旧版酒馆助手脚本，扩展运行实例未重复启动。`);
    notify('warning', '检测到旧版脚本，请先停用旧版后再使用扩展版');
    return null;
  }

  const iframe = document.createElement('iframe');
  iframe.id = RUNTIME_ID;
  iframe.name = RUNTIME_ID;
  iframe.hidden = true;
  iframe.setAttribute('aria-hidden', 'true');
  iframe.srcdoc = buildRuntimeDocument();
  document.body.appendChild(iframe);

  iframe.addEventListener('load', () => {
    console.info(`[${EXTENSION_NAME}] GitHub 扩展运行环境已启动（v2.55）`);
  }, { once: true });

  return iframe;
}

export function stopPresetWorkshop() {
  document.getElementById(RUNTIME_ID)?.remove();
}

globalThis.__ST_PRESET_WORKSHOP__ = {
  start: startPresetWorkshop,
  stop: stopPresetWorkshop,
  version: '2.55.0',
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => void startPresetWorkshop(), { once: true });
} else {
  void startPresetWorkshop();
}
