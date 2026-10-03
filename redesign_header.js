const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const newHeader = `            {/* Header */}
            <div className="p-6 border-b border-border flex flex-col xl:flex-row xl:items-center justify-between bg-gradient-to-r from-secondary/20 to-transparent gap-6">
              
              <div className="flex flex-wrap items-center justify-between xl:justify-start gap-8 flex-1">
                {/* Left: Avatar & Name */}
                <div className="flex items-center gap-4">
                  <div className={\`w-14 h-14 rounded-xl flex items-center justify-center border \${selectedAgent.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-500'}\`}>
                    <Bot size={32} />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                    {selectedAgent.status === 'online' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Inactivo
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle: 2x2 Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border border-border bg-secondary/10 rounded-lg p-3 xl:ml-8 flex-1 max-w-2xl">
                  {/* Left Column */}
                  <div className="flex flex-col gap-2">
                    <span className="text-muted-foreground flex items-center gap-2 text-sm">
                      <ShieldCheck size={14} className="text-blue-500" />
                      ID: <span className="text-foreground">{selectedAgent.id}</span>
                    </span>
                    <span className="text-muted-foreground flex items-center gap-2 text-sm">
                      <Sparkles size={14} className="text-purple-500" />
                      Modelo: <span className="text-foreground">{selectedAgent.aiModel || "google/gemini-2.5-flash"}</span>
                    </span>
                  </div>
                  
                  {/* Right Column */}
                  <div className="flex flex-col gap-2">
                    <span className="text-muted-foreground flex items-center gap-2 text-sm">
                      <User size={14} className="text-primary" />
                      Cliente asignado: {clients.find(c => c.id === selectedAgent.clientId)?.name || <span className="italic opacity-50">Ninguno</span>}
                    </span>
                    <button 
                      onClick={() => setActiveTab('identidad')}
                      className="text-primary hover:underline flex items-center gap-2 text-sm transition-colors w-fit"
                    >
                      <Settings2 size={14} />
                      Editar Agente
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Toggle Switch */}
              <div className="flex items-center gap-4 xl:justify-end shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground mb-1">Encender / Apagar Nodo</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={selectedAgent.status === 'online'} onChange={() => toggleStatus(selectedAgent)} />
                    <div className="w-14 h-7 bg-zinc-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all shadow-inner"></div>
                    <Power size={14} className={\`absolute left-2.5 transition-opacity \${selectedAgent.status === 'online' ? 'opacity-0' : 'opacity-100 text-zinc-300'}\`} />
                    <Power size={14} className={\`absolute right-2.5 transition-opacity \${selectedAgent.status === 'online' ? 'opacity-100 text-emerald-900' : 'opacity-0'}\`} />
                  </label>
                </div>
              </div>
            </div>`;

// Regex to replace the entire header
pageContent = pageContent.replace(/\{\/\* Header \*\/\}\s*<div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between bg-gradient-to-r from-secondary\/20 to-transparent gap-4">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/, newHeader);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done redesigning header');
