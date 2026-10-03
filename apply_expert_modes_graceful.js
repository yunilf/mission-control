const fs = require('fs');

let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// Normalize line endings
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
// We find exactly the start
const idStartStr = "{activeTab === 'identidad' && editingAgent && (\n                  <div className=\"space-y-6\">";
if (content.includes(idStartStr) && !content.includes("setIdentityMode('form')")) {
    const injection = `
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setIdentityMode('form')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${identityMode === 'form' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Constructor</button>
                      <button onClick={() => setIdentityMode('code')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${identityMode === 'code' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Experto (MD)</button>
                    </div>
                    {identityMode === 'form' ? (
                      <>`;
    content = content.replace(idStartStr, idStartStr + injection);
    
    // The exact end of Identidad tab is before `activeTab === 'tareas'`
    // We look for the "Ver archivo Markdown generado" inside Identidad
    // Wait, the first one is Identidad. The second is Tareas.
    let detailsIdx = content.indexOf('<details className="mt-4">');
    let endDetailsIdx = content.indexOf('</details>', detailsIdx);
    
    // After </details>, there are 4 closing </div> and 1 `)}`
    // We want to replace from detailsIdx to endDetailsIdx + '</details>'.length
    // and append `</> ) : ( <div ... /> )}`
    
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
                    )}`;
                    
    content = content.substring(0, detailsIdx) + closingInjection + content.substring(endDetailsIdx + '</details>'.length);
}

// 4. Patch Tareas Tab
const soulStartStr = "{activeTab === 'tareas' && editingAgent && (\n                  <div className=\"space-y-6\">";
if (content.includes(soulStartStr) && !content.includes("setSoulMode('form')")) {
    const injection = `
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setSoulMode('form')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${soulMode === 'form' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Constructor</button>
                      <button onClick={() => setSoulMode('code')} className={\`px-3 py-1.5 text-xs rounded-md transition-colors \${soulMode === 'code' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}\`}>Modo Experto (MD)</button>
                    </div>
                    {soulMode === 'form' ? (
                      <>`;
    content = content.replace(soulStartStr, soulStartStr + injection);
    
    // The Tareas tab has the next `<details className="mt-4">`
    let detailsIdx = content.indexOf('<details className="mt-4">'); // Because we already replaced the first one with `closingInjection` which DOES NOT contain `<details className="mt-4">` !!
    let endDetailsIdx = content.indexOf('</details>', detailsIdx);
    
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
                    )}`;
                    
    content = content.substring(0, detailsIdx) + closingInjection + content.substring(endDetailsIdx + '</details>'.length);
}

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log("done patching gracefully");
