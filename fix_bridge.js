const fs = require('fs');
const path = '\\\\wsl.localhost\\Ubuntu\\home\\yunil\\agencia-bots\\yunai-bridge-sync.mjs';
let content = fs.readFileSync(path, 'utf8');

const target = `      const response = await fetchFirestore("agents");
      if (!response) return;\\n      const firebaseAgents = response.documents || [];
      const firebaseAgents = response.documents;`;

content = content.replace('if (!response) return;\\n      const firebaseAgents = response.documents || [];', 'if (!response) return;\n      const firebaseAgents = response.documents || [];');
content = content.replace('const firebaseAgents = response.documents;', '');

fs.writeFileSync(path, content);
console.log('done');
