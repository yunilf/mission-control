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

const identidadJSX = getTabContent('identidad').replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/g, 'className="space-y-6"');
const soulJSX = getTabContent('soul').replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/g, 'className="space-y-6"');
const conocimientoJSX = getTabContent('conocimiento').replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/g, 'className="space-y-6"');
const canalesJSX = getTabContent('canales').replace(/className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"/g, 'className="space-y-4"');
const integracionesJSX = getTabContent('tools').replace(/className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"/g, 'className="space-y-4"');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const newTabsJSX = "              {activeTab === 'identidad' && editingAgent && (\n" +
"                <div className=\"h-full overflow-y-auto p-6 space-y-8 pb-24\">\n" +
"                  <div className=\"bg-card border border-border rounded-xl p-6 shadow-sm\">\n" +
"                    <h3 className=\"text-lg font-semibold border-b border-border pb-3 mb-5\">Nombre y Cliente</h3>\n" +
"                    <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">\n" +
"                      <div>\n" +
"                        <label className=\"text-sm font-medium\">Nombre del Agente</label>\n" +
"                        <input type=\"text\" value={editingAgent.name} onChange={e => setEditingAgent({...editingAgent, name: e.target.value})} className=\"w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1\" />\n" +
"                      </div>\n" +
"                      <div>\n" +
"                        <label className=\"text-sm font-medium\">Cliente Asignado</label>\n" +
"                        <select value={editingAgent.clientId || \"\"} onChange={e => setEditingAgent({...editingAgent, clientId: e.target.value})} className=\"w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1\">\n" +
"                          <option value=\"\">-- Sin asignar --</option>\n" +
"                          {clients.map(client => (\n" +
"                            <option key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ''}</option>\n" +
"                          ))}\n" +
"                        </select>\n" +
"                      </div>\n" +
"                    </div>\n" +
"                  </div>\n" +
"\n" +
"                  <div className=\"grid grid-cols-1 lg:grid-cols-2 gap-8\">\n" +
"                    <div className=\"bg-card border border-border rounded-xl p-6 shadow-sm\">\n" +
"                      <h3 className=\"text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between\">\n" +
"                        Identidad y Personalidad\n" +
"                        <span className=\"text-xs font-normal text-muted-foreground\">IDENTITY.md</span>\n" +
"                      </h3>\n" +
"                      " + identidadJSX + "\n" +
"                    </div>\n" +
"                    <div className=\"bg-card border border-border rounded-xl p-6 shadow-sm\">\n" +
"                      <h3 className=\"text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between\">\n" +
"                        Directivas y Lógica\n" +
"                        <span className=\"text-xs font-normal text-muted-foreground\">SOUL.md</span>\n" +
"                      </h3>\n" +
"                      " + soulJSX + "\n" +
"                    </div>\n" +
"                  </div>\n" +
"                </div>\n" +
"              )}\n" +
"\n" +
"              {activeTab === 'conocimiento' && editingAgent && (\n" +
"                <div className=\"h-full overflow-y-auto p-6 pb-24\">\n" +
"                  <div className=\"bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto\">\n" +
"                    <h3 className=\"text-lg font-semibold border-b border-border pb-3 mb-5\">Base de Conocimiento</h3>\n" +
"                    " + conocimientoJSX + "\n" +
"                  </div>\n" +
"                </div>\n" +
"              )}\n" +
"\n" +
"              {activeTab === 'canales' && editingAgent && (\n" +
"                <div className=\"h-full overflow-y-auto p-6 pb-24\">\n" +
"                  <div className=\"bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto\">\n" +
"                    <h3 className=\"text-lg font-semibold border-b border-border pb-3 mb-5\">Canales de Comunicación</h3>\n" +
"                    " + canalesJSX + "\n" +
"                  </div>\n" +
"                </div>\n" +
"              )}\n" +
"\n" +
"              {activeTab === 'integraciones' && editingAgent && (\n" +
"                <div className=\"h-full overflow-y-auto p-6 pb-24\">\n" +
"                  <div className=\"bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto\">\n" +
"                    <h3 className=\"text-lg font-semibold border-b border-border pb-3 mb-5\">Integraciones y Plugins</h3>\n" +
"                    " + integracionesJSX + "\n" +
"                  </div>\n" +
"                </div>\n" +
"              )}\n" +
"\n" +
"              {/* Floating Save Button if changes are made */}\n" +
"              {editingAgent && JSON.stringify(editingAgent) !== JSON.stringify(selectedAgent) && (\n" +
"                <div className=\"absolute bottom-6 right-6 z-10 animate-in slide-in-from-bottom-4\">\n" +
"                  <div className=\"bg-card border border-primary/20 shadow-xl rounded-full px-6 py-3 flex items-center gap-4\">\n" +
"                    <span className=\"text-sm font-medium text-muted-foreground\">Tienes cambios sin guardar</span>\n" +
"                    <button \n" +
"                      onClick={handleSaveEdit} \n" +
"                      disabled={isSaving}\n" +
"                      className=\"bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold hover:brightness-110 transition-all shadow-md disabled:opacity-50\"\n" +
"                    >\n" +
"                      {isSaving ? \"Guardando...\" : \"Guardar Cambios\"}\n" +
"                    </button>\n" +
"                  </div>\n" +
"                </div>\n" +
"              )}\n" +
"\n" +
"              {showSubagentModal && (\n";

const brokenRegex = /\{activeTab === 'identidad' && editingAgent && \([\s\S]*?\{showSubagentModal && \(/;
pageContent = pageContent.replace(brokenRegex, newTabsJSX);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done fixing page tabs string literal');
