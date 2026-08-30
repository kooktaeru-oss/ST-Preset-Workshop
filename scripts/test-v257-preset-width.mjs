import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../dist/workshop-v2.57.js', import.meta.url), 'utf8');
const start = source.indexOf('  function capturePresetViewportWidths()');
const end = source.indexOf('  function refreshHeaderWrapping()', start);

assert.notEqual(start, -1, '找不到预设宽度测量函数');
assert.notEqual(end, -1, '找不到预设宽度测量函数的结束位置');

const capture = source.slice(start, end);
assert.ok(
  capture.includes("root.querySelectorAll('.pm-panel-container > .pm-main-wrapper .pm-header')"),
  '宽度测量没有限定到左侧主预设标题',
);
assert.ok(capture.includes("? 'branch'"), '没有区分分支分屏布局');
assert.ok(capture.includes("? 'merge'"), '没有区分缝合分屏布局');
assert.ok(capture.includes("? 'favorite'"), '没有区分收藏分屏布局');
assert.ok(capture.includes("header.dataset.pmmPresetViewportMode !== mode"), '没有检测布局模式变化');
assert.ok(capture.includes("removeProperty('--pmm-native-preset-width')"), '切换布局时没有清除旧宽度基准');
assert.ok(!capture.includes("root.querySelectorAll('.pm-header')"), '仍在混用右侧分支标题的宽度');

console.log('v2.57 预设名称宽度测试通过：基准随当前布局重测，首次加一只增加一级。');
