const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');
const searchStr = '<div className="grid grid-cols-1 md:grid-cols-2 gap-6">';
const idx = content.indexOf(searchStr);
if (idx !== -1) {
    const endIdx = content.indexOf(')}', idx);
    const newContent = content.substring(0, idx) + `
                </div>
              )}

              {activeTab === 'mission' && (
                <div className="h-full flex flex-col md:flex-row gap-6">
                  <div className="flex-1 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center">
                      <h4 className="text-sm font-semibold">IDENTITY.md</h4>
                      <button onClick={() => window.dispatchEvent(new CustomEvent('open-edit-agent', {detail: selectedAgent}))} className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Settings2 size={12}/> Editar
                      </button>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto text-sm text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed min-h-[300px]">
                      {selectedAgent.identity || "No hay instrucciones de identidad configuradas."}
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col bg-card border border-border rounded-lg overflow-hidden">
                    <div className="p-4 border-b border-border bg-secondary/30 flex justify-between items-center">
                      <h4 className="text-sm font-semibold">SOUL.md</h4>
                      <button onClick={() => window.dispatchEvent(new CustomEvent('open-edit-agent', {detail: selectedAgent}))} className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Settings2 size={12}/> Editar
                      </button>
                    </div>
                    <div className="flex-1 p-5 overflow-y-auto text-sm text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed min-h-[300px]">
                      {selectedAgent.soul || "No hay instrucciones de soul configuradas."}
                    </div>
                  </div>
                </div>
              )}` + content.substring(endIdx + 2);
    fs.writeFileSync('src/app/agents/page.tsx', newContent);
    console.log('done');
} else {
    console.log('not found');
}
