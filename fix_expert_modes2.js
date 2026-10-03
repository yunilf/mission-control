const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// 1. Add Upload to imports if not there
if (!pageContent.includes('Upload } from "lucide-react"')) {
    pageContent = pageContent.replace('Trash } from "lucide-react"', 'Trash, Upload } from "lucide-react"');
}

// 2. Add states if not there
if (!pageContent.includes('const [identityMode')) {
    const stateInjection = `  const [activeTab, setActiveTab] = useState("monitor");
  const [identityMode, setIdentityMode] = useState<'form'|'code'>('form');
  const [soulMode, setSoulMode] = useState<'form'|'code'>('form');`;
    pageContent = pageContent.replace(`  const [activeTab, setActiveTab] = useState("monitor");`, stateInjection);
}

// 3. Patch Identidad Tab
const idStartStr = "{activeTab === 'identidad' && editingAgent && (\n                  <div className=\"space-y-6\">";
if (pageContent.includes(idStartStr) && !pageContent.includes("setIdentityMode('form')")) {
    const idStartIdx = pageContent.indexOf(idStartStr);
    
    // Find the end of Identidad tab (the first `)}` that matches the condition)
    // We look for `{activeTab === 'tareas'`
    const tareasStartIdx = pageContent.indexOf("{activeTab === 'tareas' && editingAgent && (");
    
    let endIdIdx = pageContent.lastIndexOf(")}", tareasStartIdx);
    
    // We want to replace from idStartIdx to endIdIdx + 2
    let idBlock = pageContent.substring(idStartIdx, endIdIdx + 2);
    
    // Inside idBlock, we wrap the content
    // Replace start
    idBlock = idBlock.replace(idStartStr, `{activeTab === 'identidad' && editingAgent && (
                  <div className="space-y-6">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIdentityMode('form')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${identityMode === 'form' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Constructor</button>
                      <button onClick={() => setIdentityMode('code')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${identityMode === 'code' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Experto (MD)</button>
                    </div>
                    {identityMode === 'form' ? (
                      <>`);
                      
    // The end of idBlock is currently:
    //                   </div>
    //                 </div>
    //               )}
    // Replace the last `)}` with our `) : (...) }`
    const lastParenIdx = idBlock.lastIndexOf(")}");
    idBlock = idBlock.substring(0, lastParenIdx) + `                      </>
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
                  </div>
                )}`;
                
    pageContent = pageContent.substring(0, idStartIdx) + idBlock + pageContent.substring(endIdIdx + 2);
}

// 4. Patch Tareas Tab
const soulStartStr = "{activeTab === 'tareas' && editingAgent && (\n                  <div className=\"space-y-6\">";
if (pageContent.includes(soulStartStr) && !pageContent.includes("setSoulMode('form')")) {
    const soulStartIdx = pageContent.indexOf(soulStartStr);
    
    // Find `{activeTab === 'subagents'`
    const subagentsStartIdx = pageContent.indexOf("{activeTab === 'subagents'");
    let endSoulIdx = pageContent.lastIndexOf(")}", subagentsStartIdx);
    
    let soulBlock = pageContent.substring(soulStartIdx, endSoulIdx + 2);
    
    soulBlock = soulBlock.replace(soulStartStr, `{activeTab === 'tareas' && editingAgent && (
                  <div className="space-y-6">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSoulMode('form')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${soulMode === 'form' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Constructor</button>
                      <button onClick={() => setSoulMode('code')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${soulMode === 'code' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Experto (MD)</button>
                    </div>
                    {soulMode === 'form' ? (
                      <>`);
                      
    const lastParenIdxSoul = soulBlock.lastIndexOf(")}");
    soulBlock = soulBlock.substring(0, lastParenIdxSoul) + `                      </>
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
                  </div>
                )}`;
                
    pageContent = pageContent.substring(0, soulStartIdx) + soulBlock + pageContent.substring(endSoulIdx + 2);
}

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done patching exact blocks');
