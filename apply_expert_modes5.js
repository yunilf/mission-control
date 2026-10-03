const fs = require('fs');

let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// Normalize line endings for search
content = content.replace(/\r\n/g, '\n');

// 1. Add Upload to imports
if (!content.includes('Upload } from "lucide-react"')) {
    content = content.replace('Trash } from "lucide-react"', 'Trash, Upload } from "lucide-react"');
}

// 2. Add states
if (!content.includes('const [identityMode')) {
    const stateInjection = `  const [activeTab, setActiveTab] = useState("monitor");
  const [identityMode, setIdentityMode] = useState<'form'|'code'>('form');
  const [soulMode, setSoulMode] = useState<'form'|'code'>('form');`;
    content = content.replace(`  const [activeTab, setActiveTab] = useState("monitor");`, stateInjection);
}

// 3. Patch Identidad Tab
let idStartIdx = content.indexOf("{activeTab === 'identidad' && editingAgent && (");
if (idStartIdx !== -1) {
    let divIdx = content.indexOf('<div className="space-y-6">', idStartIdx);
    
    if (divIdx !== -1) {
        const injection = `
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIdentityMode('form')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${identityMode === 'form' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Constructor</button>
                      <button onClick={() => setIdentityMode('code')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${identityMode === 'code' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Experto (MD)</button>
                    </div>
                    {identityMode === 'form' ? (
                      <>`;
                      
        const insertPos = divIdx + '<div className="space-y-6">'.length;
        content = content.substring(0, insertPos) + injection + content.substring(insertPos);
        
        // Find the start of Tareas tab
        const tareasIdx = content.indexOf("{activeTab === 'tareas' && editingAgent && (");
        // Find the last `)}` before Tareas tab
        const endIdIdx = content.lastIndexOf(")}", tareasIdx);
        
        const closingInjection = `                      </>
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
        content = content.substring(0, endIdIdx) + closingInjection + content.substring(endIdIdx);
    }
}

// 4. Patch Tareas Tab
let soulStartIdx = content.indexOf("{activeTab === 'tareas' && editingAgent && (");
if (soulStartIdx !== -1) {
    let divIdx = content.indexOf('<div className="space-y-6">', soulStartIdx);
    
    if (divIdx !== -1) {
        const injection = `
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSoulMode('form')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${soulMode === 'form' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Constructor</button>
                      <button onClick={() => setSoulMode('code')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${soulMode === 'code' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Experto (MD)</button>
                    </div>
                    {soulMode === 'form' ? (
                      <>`;
                      
        const insertPos = divIdx + '<div className="space-y-6">'.length;
        content = content.substring(0, insertPos) + injection + content.substring(insertPos);
        
        // Find the start of Subagents tab
        const subagentsIdx = content.indexOf("{activeTab === 'subagents' && editingAgent && (");
        // Find the last `)}` before Subagents tab
        const endSoulIdx = content.lastIndexOf(")}", subagentsIdx);
        
        const closingInjection = `                      </>
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
        content = content.substring(0, endSoulIdx) + closingInjection + content.substring(endSoulIdx);
    }
}

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log("done patching cleanly");
