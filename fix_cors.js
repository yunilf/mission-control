const fs = require('fs');

let content = fs.readFileSync('../docker-compose.yml', 'utf8');

// Replace allowed origins for colmadi
content = content.replace(
  'OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS=["http://localhost:18790","http://127.0.0.1:18790"]',
  'OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS=["http://localhost:18790","http://127.0.0.1:18790","https://yunai-missioncontrol.web.app"]'
);

// Replace allowed origins for original
content = content.replace(
  'OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS=["http://localhost:18791","http://127.0.0.1:18791"]',
  'OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS=["http://localhost:18791","http://127.0.0.1:18791","https://yunai-missioncontrol.web.app"]'
);

// Replace allowed origins for megachica
content = content.replace(
  'OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS=["http://localhost:18792","http://127.0.0.1:18792"]',
  'OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS=["http://localhost:18792","http://127.0.0.1:18792","https://yunai-missioncontrol.web.app"]'
);

fs.writeFileSync('../docker-compose.yml', content, 'utf8');
console.log('docker-compose updated');
