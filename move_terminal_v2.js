const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');

// 1. Remove the "Terminal en vivo" tab button entirely
content = content.replace(/                <button onClick=\{\(\) => setActiveTab\('terminal'\)\} className=\{.*?\}\>\s*Terminal en vivo\s*<\/button>\n/, "");

// 2. We need to extract the terminal code block and put it at the bottom of the 'monitor' tab block.
const terminalBlockFull = `              {activeTab === 'terminal' && (
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

// First remove the terminal block from its current location
// Note: We use a regex to tolerate minor whitespace or encoding differences
content = content.replace(/\s*\{activeTab === 'terminal' && \(\s*<div className="h-full flex flex-col">[\s\S]*?<\/div>\s*\)\}/, "");

// Then find the end of activeTab === 'monitor' block
// We know it ends with:
//                             <div className="bg-secondary/20 p-2 rounded-lg border border-border flex flex-col">
//                               <span className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Salida</span>
//                               <span className="font-mono font-medium">65.6K</span>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

// A safe replacement is to inject it right before the closing div of the `space-y-6` block in monitor tab.
content = content.replace(/(<span className="font-mono font-medium">65\.6K<\/span>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*)(<\/div>\s*\)\})/, "$1" + terminalBlockToInject + "\n                  $2");

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done moving terminal');
