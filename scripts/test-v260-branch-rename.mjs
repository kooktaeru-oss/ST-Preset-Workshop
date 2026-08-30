import { readFile } from 'node:fs/promises';

const workshop = await readFile(new URL('../dist/workshop-v2.60.js', import.meta.url), 'utf8');

const requiredSnippets = [
  "const n=a.value,q=e.trim(),o=f(n),r=k(o)",
  "sectionGroupState:r",
  "B(),await v(q)",
  "l.presetStates.delete(o)",
  "V2.60 已加载：分支重命名后会迁移并重新载入柏宝箱分组状态",
];

for (const snippet of requiredSnippets) {
  if (!workshop.includes(snippet)) {
    throw new Error(`v2.60 缺少分支重命名分组迁移逻辑：${snippet}`);
  }
}

const renameStart = workshop.indexOf('renameCurrentBranch:async function(e)');
const renameEnd = workshop.indexOf('toggleRightSelect:', renameStart);
if (renameStart < 0 || renameEnd < 0) {
  throw new Error('无法定位分支重命名流程');
}

const renameFlow = workshop.slice(renameStart, renameEnd);
if (renameFlow.indexOf('await se(A,e,n)') > renameFlow.indexOf('await v(q)')) {
  throw new Error('分支分组在名称持久化之前被重新载入');
}

if (renameFlow.indexOf('sectionGroupState:r') > renameFlow.indexOf('await v(q)')) {
  throw new Error('实时分组快照没有在重新载入前写入新分支名');
}

console.log('v2.60 分支重命名测试通过：实时分组快照随新名称持久化并立即重新载入。');
