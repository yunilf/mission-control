const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');
content = content.replace('Teléfono del Negocio', 'WhatsApp del Negocio');
content = content.replace('TelÃ©fono del Negocio', 'WhatsApp del Negocio'); // Just in case
fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('done');
