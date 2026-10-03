const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Add Upload to imports if not there
if (!content.includes('Upload } from "lucide-react"')) {
    content = content.replace('Trash } from "lucide-react"', 'Trash, Upload } from "lucide-react"');
}

// We will replace `</details>` one by one
// Find Identidad block details
const idStart = content.indexOf("{activeTab === 'identidad'");
const idDetails = content.indexOf('</details>', idStart);
if (idDetails !== -1) {
    const injectionId = `</details>
                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/20 border border-border rounded-lg gap-4">
                          <div>
                            <h4 className="text-sm font-medium">¿Ya tienes tu propio IDENTITY.md?</h4>
                            <p className="text-xs text-muted-foreground mt-1">Sube el archivo directamente y reemplaza esta configuración.</p>
                          </div>
                          <label className="cursor-pointer bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                             <Upload size={14} /> Subir IDENTITY.md
                             <input type="file" accept=".md" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                   const text = ev.target?.result;
                                   setEditingAgent({...editingAgent, identity: text});
                                   alert('Archivo IDENTITY.md cargado. Recuerda Guardar Cambios.');
                                };
                                reader.readAsText(file);
                             }} />
                          </label>
                        </div>`;
    content = content.substring(0, idDetails) + injectionId + content.substring(idDetails + '</details>'.length);
}

// Find Tareas block details
// Note: because we changed length, we must recalculate index
const tareasStart = content.indexOf("{activeTab === 'tareas'");
// The first details after `tareasStart`
const soulDetails = content.indexOf('</details>', tareasStart);
if (soulDetails !== -1) {
    const injectionSoul = `</details>
                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/20 border border-border rounded-lg gap-4">
                          <div>
                            <h4 className="text-sm font-medium">¿Ya tienes tu propio SOUL.md?</h4>
                            <p className="text-xs text-muted-foreground mt-1">Sube el archivo directamente y reemplaza esta configuración.</p>
                          </div>
                          <label className="cursor-pointer bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-md text-sm transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                             <Upload size={14} /> Subir SOUL.md
                             <input type="file" accept=".md" className="hidden" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                const reader = new FileReader();
                                reader.onload = (ev) => {
                                   const text = ev.target?.result;
                                   setEditingAgent({...editingAgent, soul: text});
                                   alert('Archivo SOUL.md cargado. Recuerda Guardar Cambios.');
                                };
                                reader.readAsText(file);
                             }} />
                          </label>
                        </div>`;
    content = content.substring(0, soulDetails) + injectionSoul + content.substring(soulDetails + '</details>'.length);
}

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('Simple file upload injected');
