const fs = require('fs');
let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const strId = "{activeTab === 'identidad' && editingAgent && (";
const startId = pageContent.indexOf(strId);
if (startId !== -1 && !pageContent.includes("setIdentityMode('form')")) {
    const spaceY6Id = pageContent.indexOf('<div className="space-y-6">', startId);
    
    // We want to insert the buttons RIGHT AFTER `<div className="space-y-6">`
    const insertPosId = spaceY6Id + '<div className="space-y-6">'.length;
    
    const injectionId = `
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIdentityMode('form')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${identityMode === 'form' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Constructor</button>
                      <button onClick={() => setIdentityMode('code')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${identityMode === 'code' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Experto (MD)</button>
                    </div>
                    {identityMode === 'form' ? (
                      <>`;
                      
    pageContent = pageContent.substring(0, insertPosId) + injectionId + pageContent.substring(insertPosId);
    
    // Now we need to close it at the end of the identidad block.
    // The end is marked by `{activeTab === 'tareas'`
    const tareasStartIdx = pageContent.indexOf("{activeTab === 'tareas'");
    const endIdIdx = pageContent.lastIndexOf(")}", tareasStartIdx);
    
    const closingInjectionId = `                      </>
                    ) : (
                      <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Archivo IDENTITY.md</h3>
                          <label className="cursor-pointer bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2">
                             <Upload size={14} /> Subir archivo .md
                             <input type="file" accept=".md" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                   const text = ev.target?.result;
                                   setEditingAgent({...editingAgent, identity: text});
                                };
                                reader.readAsText(file);
                             }} />
                          </label>
                        </div>
                        <textarea
                           value={editingAgent.identity || ""}
                           onChange={e => setEditingAgent({...editingAgent, identity: e.target.value})}
                           className="w-full h-[500px] font-mono text-sm bg-background border border-border rounded-md p-4 focus:outline-none focus:border-primary"
                           placeholder="# IDENTIDAD DEL AGENTE..."
                        />
                      </div>
                    )}
`;
    // We replace the `)}` with our closing block
    pageContent = pageContent.substring(0, endIdIdx) + closingInjectionId + "                )}";
}

const strSoul = "{activeTab === 'tareas' && editingAgent && (";
const startSoul = pageContent.indexOf(strSoul);
if (startSoul !== -1 && !pageContent.includes("setSoulMode('form')")) {
    const spaceY6Soul = pageContent.indexOf('<div className="space-y-6">', startSoul);
    
    const insertPosSoul = spaceY6Soul + '<div className="space-y-6">'.length;
    
    const injectionSoul = `
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSoulMode('form')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${soulMode === 'form' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Constructor</button>
                      <button onClick={() => setSoulMode('code')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${soulMode === 'code' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Experto (MD)</button>
                    </div>
                    {soulMode === 'form' ? (
                      <>`;
                      
    pageContent = pageContent.substring(0, insertPosSoul) + injectionSoul + pageContent.substring(insertPosSoul);
    
    const subagentsStartIdx = pageContent.indexOf("{activeTab === 'subagents'");
    const endSoulIdx = pageContent.lastIndexOf(")}", subagentsStartIdx);
    
    const closingInjectionSoul = `                      </>
                    ) : (
                      <div className="bg-card border border-border rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold">Archivo SOUL.md</h3>
                          <label className="cursor-pointer bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-md text-sm transition-colors flex items-center gap-2">
                             <Upload size={14} /> Subir archivo .md
                             <input type="file" accept=".md" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                   const text = ev.target?.result;
                                   setEditingAgent({...editingAgent, soul: text});
                                };
                                reader.readAsText(file);
                             }} />
                          </label>
                        </div>
                        <textarea
                           value={editingAgent.soul || ""}
                           onChange={e => setEditingAgent({...editingAgent, soul: e.target.value})}
                           className="w-full h-[500px] font-mono text-sm bg-background border border-border rounded-md p-4 focus:outline-none focus:border-primary"
                           placeholder="# DIRECTIVAS DEL AGENTE..."
                        />
                      </div>
                    )}
`;
    pageContent = pageContent.substring(0, endSoulIdx) + closingInjectionSoul + "                )}";
}

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done fixing expert modes with absolute indices');
