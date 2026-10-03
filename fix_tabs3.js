const fs = require('fs');

const modalCode = fs.readFileSync('modal_backup.tsx', 'utf8');

const getTabContent = (tabName) => {
    const startStr = '{activeTab === "' + tabName + '" && (';
    const startIndex = modalCode.indexOf(startStr);
    if (startIndex === -1) return '';
    
    let openBrackets = 0;
    let endIndex = startIndex;
    
    for (let i = startIndex; i < modalCode.length; i++) {
        if (modalCode[i] === '{') openBrackets++;
        if (modalCode[i] === '}') openBrackets--;
        
        if (modalCode[i] === '}' && openBrackets === 0) {
            endIndex = i;
            break;
        }
    }
    
    let content = modalCode.substring(startIndex, endIndex + 1);
    content = content.replace('{activeTab === "' + tabName + '" && (', '').trim();
    if (content.endsWith(')}')) {
        content = content.substring(0, content.length - 2).trim();
    }
    return content;
};

const identidadJSX = getTabContent('identidad');
const soulJSX = getTabContent('soul');
const conocimientoJSX = getTabContent('conocimiento');
const canalesJSX = getTabContent('canales');
const integracionesJSX = getTabContent('tools');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const newTabsJSX = \`
              {activeTab === 'identidad' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 space-y-8 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Nombre y Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium">Nombre del Agente</label>
                        <input type="text" value={editingAgent.name} onChange={e => setEditingAgent({...editingAgent, name: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Cliente Asignado</label>
                        <select value={editingAgent.clientId || ""} onChange={e => setEditingAgent({...editingAgent, clientId: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1">
                          <option value="">-- Sin asignar --</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.name} {client.company ? \\\`(\\\${client.company})\\\` : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
                        Identidad y Personalidad
                        <span className="text-xs font-normal text-muted-foreground">IDENTITY.md</span>
                      </h3>
                      \${identidadJSX.replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/, 'className="space-y-6"')}
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
                        Directivas y Lógica
                        <span className="text-xs font-normal text-muted-foreground">SOUL.md</span>
                      </h3>
                      \${soulJSX.replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/, 'className="space-y-6"')}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'conocimiento' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Base de Conocimiento</h3>
                    \${conocimientoJSX.replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/, 'className="space-y-6"')}
                  </div>
                </div>
              )}

              {activeTab === 'canales' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Canales de Comunicación</h3>
                    \${canalesJSX.replace(/className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"/, 'className="space-y-4"')}
                  </div>
                </div>
              )}

              {activeTab === 'integraciones' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Integraciones y Plugins</h3>
                    \${integracionesJSX.replace(/className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"/, 'className="space-y-4"')}
                  </div>
                </div>
              )}

              {/* Floating Save Button if changes are made */}
              {editingAgent && JSON.stringify(editingAgent) !== JSON.stringify(selectedAgent) && (
                <div className="absolute bottom-6 right-6 z-10 animate-in slide-in-from-bottom-4">
                  <div className="bg-card border border-primary/20 shadow-xl rounded-full px-6 py-3 flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground">Tienes cambios sin guardar</span>
                    <button 
                      onClick={handleSaveEdit} 
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold hover:brightness-110 transition-all shadow-md disabled:opacity-50"
                    >
                      {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </div>
              )}

              {showSubagentModal && (
\`;

const brokenRegex = /\{activeTab === 'identidad' && editingAgent && \([\s\S]*?\{showSubagentModal && \(/;
pageContent = pageContent.replace(brokenRegex, newTabsJSX);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done fixing page tabs');
