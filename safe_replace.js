const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');

// The exact button string
const buttonStr = `                <button onClick={() => setActiveTab('terminal')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'terminal' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                  Terminal en vivo
                </button>`;

content = content.replace(buttonStr, "");

// The exact terminal block
const terminalBlockStr = `              {activeTab === 'terminal' && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">WSL: ubuntu@openclaw-node</span>
                  </div>
                  <div className="flex-1 bg-[#0b0f19] rounded-lg p-4 font-mono text-xs overflow-y-auto border border-border shadow-inner min-h-[300px]">
                    {mockLogs.map((log, i) => {
                      let color = "text-zinc-300";
                      if (log.includes("INFO")) color = "text-blue-400";
                      if (log.includes("SUCCESS")) color = "text-emerald-400";
                      if (log.includes("ERROR")) color = "text-red-400";
                      if (log.includes("DEBUG")) color = "text-zinc-500";
                      return (
                        <div key={i} className={\`\${color} mb-1 leading-relaxed\`}>{log}</div>
                      );
                    })}
                    {selectedAgent.status === 'online' && (
                      <div className="flex items-center mt-2 text-zinc-500">
                        <span className="animate-pulse">_</span>
                      </div>
                    )}
                    {selectedAgent.status !== 'online' && (
                      <div className="mt-4 text-zinc-500 italic">El proceso del agente está pausado. No hay nuevos logs.</div>
                    )}
                  </div>
                </div>
              )}`;

content = content.replace(terminalBlockStr, "");

const terminalBlockToInject = `                    {/* Terminal moved to bottom of monitor tab */}
                    <div className="flex flex-col mt-4 min-h-[350px]">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <div className="flex gap-2">
                          <span className="w-3 h-3 rounded-full bg-red-500"></span>
                          <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                          <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                        </div>
                        <span className="text-xs font-mono text-muted-foreground">WSL: ubuntu@openclaw-node</span>
                      </div>
                      <div className="flex-1 bg-[#0b0f19] rounded-lg p-4 font-mono text-xs overflow-y-auto border border-border shadow-inner">
                        {mockLogs.map((log, i) => {
                          let color = "text-zinc-300";
                          if (log.includes("INFO")) color = "text-blue-400";
                          if (log.includes("SUCCESS")) color = "text-emerald-400";
                          if (log.includes("ERROR")) color = "text-red-400";
                          if (log.includes("DEBUG")) color = "text-zinc-500";
                          return (
                            <div key={i} className={\`\${color} mb-1 leading-relaxed\`}>{log}</div>
                          );
                        })}
                        {selectedAgent.status === 'online' && (
                          <div className="flex items-center mt-2 text-zinc-500">
                            <span className="animate-pulse">_</span>
                          </div>
                        )}
                        {selectedAgent.status !== 'online' && (
                          <div className="mt-4 text-zinc-500 italic">El proceso del agente está pausado. No hay nuevos logs.</div>
                        )}
                      </div>
                    </div>`;

content = content.replace(/(<span className="font-mono font-medium">65\.6K<\/span>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*)(<\/div>\s*\)\})/, "$1" + terminalBlockToInject + "\n                  $2");

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done modifying terminal with safe explicit replacement');
