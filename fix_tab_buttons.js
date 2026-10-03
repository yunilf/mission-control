const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const newTabs = `{/* Tabs */}
            <div className="flex items-center gap-6 px-6 border-b border-border bg-background overflow-x-auto custom-scrollbar">
              <button onClick={() => setActiveTab('monitor')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'monitor' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Inicio
              </button>
              <button onClick={() => setActiveTab('identidad')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'identidad' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Identidad
              </button>
              <button onClick={() => setActiveTab('subagents')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'subagents' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Sub-agentes
              </button>
              <button onClick={() => setActiveTab('conocimiento')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'conocimiento' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Conocimiento
              </button>
              <button onClick={() => setActiveTab('canales')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'canales' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Canales
              </button>
              <button onClick={() => setActiveTab('integraciones')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'integraciones' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Integraciones
              </button>
              <button onClick={() => setActiveTab('config')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'config' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                Resumen
              </button>
            </div>`;

pageContent = pageContent.replace(/\{\/\* Tabs \*\/\}\s*<div className="flex items-center gap-6 px-6 border-b border-border bg-background overflow-x-auto">[\s\S]*?<\/div>/, newTabs);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done fixing tab buttons');
