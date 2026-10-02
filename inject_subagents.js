const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');

// 1. Add state variables
const stateInject = `  const [activeTab, setActiveTab] = useState('general');
  const [showSubagentModal, setShowSubagentModal] = useState(false);
  const [newSubagentName, setNewSubagentName] = useState('');
  const [newSubagentMission, setNewSubagentMission] = useState('');
  const [isSavingSubagent, setIsSavingSubagent] = useState(false);
`;
content = content.replace(/  const \[activeTab, setActiveTab\] = useState\('general'\);/, stateInject);

// 2. Add handleSaveSubagent function
const funcInject = `  const handleSaveSubagent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !newSubagentName.trim() || !newSubagentMission.trim()) return;
    setIsSavingSubagent(true);
    try {
      const currentSubagents = selectedAgent.subagents || [];
      const updatedSubagents = [...currentSubagents, {
        name: newSubagentName.toLowerCase().replace(/\\s+/g, '_'),
        mission: newSubagentMission,
        model: 'google/gemini-2.5-flash'
      }];
      await updateDoc(doc(db, "agents", selectedAgent.id), {
        subagents: updatedSubagents
      });
      setShowSubagentModal(false);
      setNewSubagentName('');
      setNewSubagentMission('');
    } catch (error: any) {
      alert("Error saving subagent: " + error.message);
    } finally {
      setIsSavingSubagent(false);
    }
  };

  const handleModelChange`;
content = content.replace(/  const handleModelChange/, funcInject);

// 3. Replace the 'Configurar' button and update the Sub-agents UI slightly
const uiReplace = `<h4 className="text-sm font-semibold">Sub-agentes (Equipo)</h4>
                        <button onClick={() => setShowSubagentModal(true)} className="text-xs text-primary hover:underline flex items-center gap-1" title="Agregar Sub-agente">
                            <Plus size={12}/> Agregar Sub-agente
                        </button>
                      </div>
                      <div className="space-y-3">
                        {selectedAgent.subagents && selectedAgent.subagents.length > 0 ? (
                          selectedAgent.subagents.map((sub: any, i: number) => (
                            <div key={i} className="bg-background border border-border rounded-md p-3 flex justify-between items-center">
                               <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center">
                                   <Bot size={16} />
                                 </div>
                                 <div>
                                   <div className="text-sm font-medium capitalize">{sub.name}</div>
                                   <div className="text-xs text-muted-foreground line-clamp-1">{sub.mission ? sub.mission : (sub.model || 'google/gemini-2.5-flash')}</div>
                                 </div>
                               </div>
                               <button className="text-xs text-red-500 hover:text-red-400" onClick={async () => {
                                 if (confirm('¿Eliminar este sub-agente?')) {
                                   const filtered = selectedAgent.subagents.filter((_: any, index: number) => index !== i);
                                   await updateDoc(doc(db, "agents", selectedAgent.id), { subagents: filtered });
                                 }
                               }}>
                                 Eliminar
                               </button>
                            </div>
                          ))`;
                          
content = content.replace(/<h4 className="text-sm font-semibold">Sub-agentes \(Equipo\)<\/h4>[\s\S]*?\)\)/, uiReplace);


// 4. Inject the Modal at the bottom of the return statement before the final div
const modalHTML = `
      {showSubagentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border bg-secondary/20 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><Bot className="text-primary" size={18}/> Nuevo Sub-agente</h3>
              <button onClick={() => setShowSubagentModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveSubagent} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Nombre del Sub-agente</label>
                <input type="text" value={newSubagentName} onChange={e => setNewSubagentName(e.target.value)} placeholder="Ej. investigador_web" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" required />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Misión (Deberes)</label>
                <textarea value={newSubagentMission} onChange={e => setNewSubagentMission(e.target.value)} placeholder="Ej. Eres responsable de buscar información en internet sobre los competidores..." className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-32 resize-none focus:ring-1 focus:ring-primary focus:outline-none" required />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setShowSubagentModal(false)} className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md">Cancelar</button>
                <button type="submit" disabled={isSavingSubagent} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50">
                  {isSavingSubagent ? "Guardando..." : "Agregar Sub-agente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}`;

content = content.replace(/    <\/div>\n  \);\n\}/, modalHTML);

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done modifying page.tsx');
