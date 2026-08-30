import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workshop = await readFile(new URL('../dist/workshop-v2.65.js', import.meta.url), 'utf8');
const patchStart = workshop.indexOf('PMM_ANDROID_NATIVE_DND_V265');
const patchEnd = workshop.indexOf('PMM_MOBILE_LAYOUT_TUNER_V1', patchStart);
assert.ok(patchStart >= 0 && patchEnd > patchStart, '无法隔离 v2.65 安卓原生拖拽恢复块');
const androidPatch = workshop.slice(patchStart, patchEnd);

for (const snippet of [
  "typeof TOP.__PMM_ANDROID_TOUCH_DND_CLEANUP__ === 'function'",
  "DOC.getElementById('pmm-android-touch-dnd-style')?.remove()",
  "DOC.querySelectorAll('.pmm-touch-drag-ghost')",
  'delete TOP.__PMM_ANDROID_TOUCH_DND_CLEANUP__',
  '双端统一使用浏览器原生 drag/dataTransfer',
]) {
  assert.ok(androidPatch.includes(snippet), `旧安卓拖拽残留清理不完整：${snippet}`);
}

for (const forbidden of [
  'function makeGhost',
  'cloneNode(true)',
  'touchmove',
  'pointermove',
  'new DragEvent',
  'requestAnimationFrame',
  'HOLD_MS',
]) {
  assert.ok(!androidPatch.includes(forbidden), `安卓合成长按拖拽代码仍然存在：${forbidden}`);
}

for (const snippet of [
  "draggable:!s.value,'data-prompt-id':e.prompt.id",
  "e.dataTransfer.effectAllowed='move'",
  "e.dataTransfer.setData('text/plain'",
  'e.dataTransfer.setDragImage',
]) {
  assert.ok(workshop.includes(snippet), `浏览器原生拖拽链路不完整：${snippet}`);
}

console.log('v2.65 安卓拖拽测试通过：合成长按拖拽已移除，旧残留会被清理，原生 dataTransfer 链路保留。');
