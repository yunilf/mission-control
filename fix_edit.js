const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');
content = content.replace(/<button onClick=\{\(\) => window\.dispatchEvent\(new CustomEvent\('open-edit-agent', \{detail: selectedAgent\}\)\)\} className="text-xs text-primary hover:underline flex items-center gap-1">\s*<Settings2 size=\{12\}\/> Editar\s*<\/button>/g, `<a href="/" className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar en Mission Control">\n                          <Settings2 size={12}/> Editar\n                        </a>`);
content = content.replace(/<button onClick=\{\(\) => window\.dispatchEvent\(new CustomEvent\('open-edit-agent', \{detail: selectedAgent\}\)\)\} className="text-xs text-primary hover:underline flex items-center gap-1">\s*<Plus size=\{12\}\/> Configurar\s*<\/button>/g, `<a href="/" className="text-xs text-primary hover:underline flex items-center gap-1" title="Configurar en Mission Control">\n                          <Plus size={12}/> Configurar\n                        </a>`);

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done');
