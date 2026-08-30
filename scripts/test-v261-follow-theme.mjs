import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const workshop = await readFile(new URL('../dist/workshop-v2.61.js', import.meta.url), 'utf8');

for (const snippet of [
  'function _pmmReadableThemeText',
  'o=_pmmReadableThemeText(A,o,4.5)',
  'r=_pmmReadableThemeText(a,r,3.25)',
  "'auto'===e.value&&o()",
  '.pmm-mobile-auto-theme',
  "'fa-solid fa-wand-magic-sparkles'",
  "'跟随酒馆美化'",
]) {
  assert.ok(workshop.includes(snippet), `v2.61 缺少跟随美化逻辑：${snippet}`);
}

const helperStart = workshop.indexOf('function _pmmParseThemeColor');
const helperEnd = workshop.indexOf('const fn={', helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart, '无法定位颜色对比度辅助函数');

const helperSource = workshop.slice(helperStart, helperEnd);
const helpers = new Function(
  `${helperSource}; return { parse: _pmmParseThemeColor, contrast: _pmmThemeContrast, readable: _pmmReadableThemeText };`,
)();

const lightBackground = 'rgb(255, 238, 245)';
const darkBackground = 'rgb(25, 22, 28)';
const fixedForLight = helpers.readable(lightBackground, 'rgb(250, 245, 250)', 4.5);
const fixedForDark = helpers.readable(darkBackground, 'rgb(35, 30, 38)', 4.5);

assert.equal(fixedForLight, '#1f2937', '浅色美化没有自动改用深色正文');
assert.equal(fixedForDark, '#f8fafc', '深色美化没有自动改用浅色正文');
assert.ok(
  helpers.contrast(helpers.parse(lightBackground), helpers.parse(fixedForLight)) >= 4.5,
  '浅色背景的正文对比度不足 4.5:1',
);
assert.equal(
  helpers.readable(darkBackground, 'rgb(255, 138, 179)', 4.5),
  'rgb(255, 138, 179)',
  '原本清晰的粉色文字不应被替换',
);

console.log('v2.61 跟随美化测试通过：双端魔法棒可用，浅底浅字会自动修正。');
