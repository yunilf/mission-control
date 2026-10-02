const fs = require('fs');

// 1. Update AgentModals.tsx
let modalsContent = fs.readFileSync('src/components/AgentModals.tsx', 'utf-8');
modalsContent = modalsContent.replace(
  /const handleOpenEdit = \(e: any\) => \{\s*setEditingAgent\(e\.detail\);\s*setActiveTab\("general"\);\s*\};/,
  `const handleOpenEdit = (e: any) => {
      if (e.detail && e.detail.agent) {
        setEditingAgent(e.detail.agent);
        setActiveTab(e.detail.tab || "general");
      } else {
        setEditingAgent(e.detail);
        setActiveTab("general");
      }
    };`
);
fs.writeFileSync('src/components/AgentModals.tsx', modalsContent, 'utf-8');

// 2. Update page.tsx
let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');

// Replace Integraciones Activas edit
pageContent = pageContent.replace(
  /<a href="\/" className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar en Mission Control">\s*<Settings2 size=\{12\}\/> Editar\s*<\/a>/,
  `<button onClick={() => window.dispatchEvent(new CustomEvent('open-edit-agent', { detail: { agent: selectedAgent, tab: 'tools' } }))} className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar Integraciones">
                            <Settings2 size={12}/> Editar
                          </button>`
);

// Replace IDENTITY edit
pageContent = pageContent.replace(
  /<a href="\/" className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar en Mission Control">\s*<Settings2 size=\{12\}\/> Editar\s*<\/a>/,
  `<button onClick={() => window.dispatchEvent(new CustomEvent('open-edit-agent', { detail: { agent: selectedAgent, tab: 'general' } }))} className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar Identity">
                            <Settings2 size={12}/> Editar
                          </button>`
);

// Replace SOUL edit
pageContent = pageContent.replace(
  /<a href="\/" className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar en Mission Control">\s*<Settings2 size=\{12\}\/> Editar\s*<\/a>/,
  `<button onClick={() => window.dispatchEvent(new CustomEvent('open-edit-agent', { detail: { agent: selectedAgent, tab: 'general' } }))} className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar Soul">
                            <Settings2 size={12}/> Editar
                          </button>`
);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf-8');
console.log('done fixing edit links');
