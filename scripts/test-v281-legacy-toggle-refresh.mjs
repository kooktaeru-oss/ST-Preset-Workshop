import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../dist/workshop-v2.81.js', import.meta.url), 'utf8');
const helperStart = source.indexOf('function _pmmLivePromptSignature');
const helperEnd = source.indexOf('function De(e)', helperStart);

assert.ok(helperStart >= 0 && helperEnd > helperStart, '无法定位下方条目实时刷新签名函数');

const context = {};
vm.runInNewContext(
  `${source.slice(helperStart, helperEnd)};globalThis.signature=_pmmLivePromptSignature;`,
  context,
);

const prompts = [
  { id: 'grouped', name: '分组内条目', enabled: true },
  { id: 'ungrouped', name: '分组外条目', enabled: false },
];
const originalSignature = context.signature(prompts);

assert.notEqual(
  context.signature(prompts.map(item => item.id === 'grouped' ? { ...item, enabled: false } : item)),
  originalSignature,
  '仅改变分组内条目开关时也必须触发下方分组视图刷新',
);
assert.notEqual(
  context.signature(prompts.map(item => item.id === 'ungrouped' ? { ...item, enabled: true } : item)),
  originalSignature,
  '仅改变分组外条目开关时也必须触发下方分组视图刷新',
);
assert.notEqual(
  context.signature(prompts.map(item => item.id === 'grouped' ? { ...item, name: '改名' } : item)),
  originalSignature,
  '旧有的条目名称实时同步不能退化',
);

const deStart = source.indexOf('function De(e)');
const deEnd = source.indexOf('function Ue(e)', deStart);
const composable = source.slice(deStart, deEnd);

assert.ok(composable.includes('()=>_pmmLivePromptSignature(n.value)'), '分组视图必须监听名称和开关的完整渲染签名');
assert.ok(composable.includes('o.setPromptsForPreset(n.value.map(e=>({...e})),e),r.value++'), '签名变化后必须重建分组副本并强制刷新当前面板');
assert.ok(source.includes('V2.81 已加载：恢复旧版缝合下方条目开关的即时视觉反馈'), '缺少 v2.81 加载标记');

console.log('v2.81 旧版行为回归通过：下方分组内外条目开关改变后会立即刷新当前缝合面板。');
