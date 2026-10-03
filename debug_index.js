const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const tareasIdx = content.indexOf("{activeTab === 'tareas'");
console.log("tareasIdx: " + tareasIdx);

const endIdIdx = content.lastIndexOf(")}", tareasIdx);
console.log("endIdIdx: " + endIdIdx);

const subagentsIdx = content.indexOf("{activeTab === 'subagents'");
console.log("subagentsIdx: " + subagentsIdx);

const endSoulIdx = content.lastIndexOf(")}", subagentsIdx);
console.log("endSoulIdx: " + endSoulIdx);
