const fs = require('fs');

let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// 1. Remove the injected blocks entirely.
// Find the exact strings we injected.
const soulBlock = `<div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/20 border border-border rounded-lg gap-4">
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

const idBlock = `<div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-secondary/20 border border-border rounded-lg gap-4">
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

// Strip them from the file (we'll replace \r\n to \n to ensure matches work)
content = content.replace(/\r\n/g, '\n');
content = content.replace(soulBlock, '');
content = content.replace(idBlock, '');

// There might be some whitespace we left, but it's fine.

// Now re-insert them exactly at the end of their respective tabs
// For Identidad, find the real start of the tab content
const idStartStr = "{activeTab === 'identidad' && editingAgent && (";
const idStartIdx = content.indexOf(idStartStr);
// Inside the Identidad tab, find the FIRST `<details` and its `</details>`
const idDetailsIdx = content.indexOf('</details>', content.indexOf('<details', idStartIdx));

if (idDetailsIdx !== -1) {
    content = content.substring(0, idDetailsIdx) + '</details>\n                        ' + idBlock + content.substring(idDetailsIdx + '</details>'.length);
}

// For Tareas, find the real start of the tab content
// Remember, `{activeTab === 'tareas'` matches the button. We must use `&& editingAgent`
const tareasStartStr = "{activeTab === 'tareas' && editingAgent && (";
const tareasStartIdx = content.indexOf(tareasStartStr);
// Inside the Tareas tab, find the FIRST `<details` and its `</details>`
const tareasDetailsIdx = content.indexOf('</details>', content.indexOf('<details', tareasStartIdx));

if (tareasDetailsIdx !== -1) {
    content = content.substring(0, tareasDetailsIdx) + '</details>\n                        ' + soulBlock + content.substring(tareasDetailsIdx + '</details>'.length);
}

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('Fixed block placement');
