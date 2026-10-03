const fs = require('fs');
let c = fs.readFileSync('src/app/agents/page.tsx', 'utf8');
c = c.replace(/\\\`/g, '`');
c = c.replace(/\\\$/g, '$');
fs.writeFileSync('src/app/agents/page.tsx', c);
