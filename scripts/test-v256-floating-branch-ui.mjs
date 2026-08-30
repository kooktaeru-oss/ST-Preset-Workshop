import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const source = await readFile(new URL('../dist/workshop-v2.56.js', import.meta.url), 'utf8');

assert.ok(source.includes('function bindBranchSwitchNotice(root)'), '缺少悬浮入口分支通知绑定');
assert.ok(source.includes("bindBranchSwitchNotice(root);"), '悬浮入口没有启用分支通知绑定');
assert.ok(source.includes('已切换至分支：${abbreviatePresetName(name)}'), '缺少非默认分支的成功提示');
assert.ok(source.includes("if (select.value && name)"), '默认分支应继续使用原生提示，不能重复通知');

const widthPatchStart = source.indexOf('/* “预设名称框长度”只控制左侧主预设标题');
const widthPatchEnd = source.indexOf('#preset-manager-main-panel.pmm-layout-custom-split-ratio', widthPatchStart);
assert.notEqual(widthPatchStart, -1, '缺少预设名称宽度隔离说明');
assert.notEqual(widthPatchEnd, -1, '无法定位预设名称宽度样式边界');

const widthPatch = source.slice(widthPatchStart, widthPatchEnd);
assert.ok(
  widthPatch.includes('.pm-panel-container > .pm-main-wrapper .title-row'),
  '预设名称宽度没有限定在左侧主预设面板',
);
assert.ok(
  widthPatch.includes('.pm-panel-container > .pm-main-wrapper .pm-header .title-actions'),
  '标题操作区滚动样式没有限定在左侧主预设面板',
);
assert.ok(!widthPatch.includes('.pm-panel-container--branch-mode'), '预设名称宽度仍会命中分支工具栏');
assert.ok(!widthPatch.includes('.pm-panel-container--merge-mode'), '预设名称宽度仍会命中缝合工具栏');
assert.ok(!widthPatch.includes('.pm-panel-container--favorite-mode'), '预设名称宽度仍会命中收藏工具栏');

console.log('v2.56 悬浮分支 UI 测试通过：分支切换有提示，主预设宽度不再影响分支工具栏。');
