import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const entry = await readFile(new URL('../dist/index.js', import.meta.url), 'utf8');
const workshop = await readFile(new URL('../dist/workshop-v2.68.js', import.meta.url), 'utf8');

assert.ok(!entry.includes('iframe.hidden = true'), '启动器仍把运行 iframe 标记为 hidden，Gecko 会暂停首帧');
for (const snippet of [
  'iframe.hidden = false',
  "left: '-10000px'",
  "width: '1px'",
  "height: '1px'",
  "opacity: '0'",
  "pointerEvents: 'none'",
  "iframe.tabIndex = -1",
  "new URL('./workshop-v2.68.js', import.meta.url)",
]) {
  assert.ok(entry.includes(snippet), `屏幕外运行容器缺少关键设置：${snippet}`);
}

const compatStart = workshop.indexOf('function keepRuntimeFrameRenderable()');
const compatEnd = workshop.indexOf('const CSS = `', compatStart);
assert.ok(compatStart >= 0 && compatEnd > compatStart, '无法隔离 Gecko 后台容器自修复');
const compat = workshop.slice(compatStart, compatEnd);
for (const snippet of [
  'const frame = window.frameElement',
  'frame.hidden = false',
  "frame.removeAttribute('hidden')",
  "frame.style.setProperty('display', 'block', 'important')",
  "frame.style.setProperty('visibility', 'visible', 'important')",
  "frame.style.setProperty('left', '-10000px', 'important')",
  "frame.style.setProperty('width', '1px', 'important')",
  "frame.style.setProperty('height', '1px', 'important')",
  'keepRuntimeFrameRenderable()',
]) {
  assert.ok(compat.includes(snippet), `业务入口缺少旧启动器自修复：${snippet}`);
}

assert.ok(workshop.includes('V2.68 已加载'), '缺少 v2.68 运行标记');
assert.ok(workshop.includes('requestAnimationFrame(async()=>'), '没有确认主面板主体依赖首个 requestAnimationFrame');
assert.ok(workshop.includes('p.value=!0'), '没有确认首帧会解除主体渲染门控');
assert.ok(workshop.includes('function panelContentIsVisible(panel)'), '打开成功判定仍然只检查遮罩');
assert.ok(workshop.includes("return reportOpenFailure('遮罩已显示，但工坊主体首帧未完成')"), '主体首帧失败时没有可见诊断');

console.log('v2.68 Gecko 渲染测试通过：运行 iframe 不再 hidden，并保留旧启动器自修复，主面板首帧不会只剩遮罩。');
