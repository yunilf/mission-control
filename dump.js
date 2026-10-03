const fs = require('fs');
const content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');
const start = content.indexOf("{activeTab === 'identidad'");
const end = content.indexOf("{activeTab === 'conocimiento'");
fs.writeFileSync('identidad_dump.txt', content.substring(start, end), 'utf8');
