const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const t = content.indexOf("{activeTab === 'tareas' && editingAgent && (");
console.log("tareas exact: " + t);

const sub = content.indexOf("{activeTab === 'subagents'");
console.log("subagents exact: " + sub);

const sub2 = content.indexOf("{activeTab === 'subagents' && ");
console.log("subagents2 exact: " + sub2);
