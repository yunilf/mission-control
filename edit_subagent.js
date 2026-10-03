const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// 1. Add states
pageContent = pageContent.replace(
    "const [newSubagentMission, setNewSubagentMission] = useState('');",
    "const [newSubagentMission, setNewSubagentMission] = useState('');\n  const [newSubagentModel, setNewSubagentModel] = useState('google/gemini-2.5-flash');\n  const [editingSubagentIndex, setEditingSubagentIndex] = useState<number | null>(null);"
);

// 2. Modify handleSaveSubagent
const oldHandleSaveSubagent = `  const handleSaveSubagent = async (e: React.FormEvent) => {
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
  };`;

const newHandleSaveSubagent = `  const handleSaveSubagent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !newSubagentName.trim() || !newSubagentMission.trim()) return;
    setIsSavingSubagent(true);
    try {
      const currentSubagents = selectedAgent.subagents || [];
      let updatedSubagents;
      
      const subagentData = {
        name: newSubagentName.toLowerCase().replace(/\\s+/g, '_'),
        mission: newSubagentMission,
        model: newSubagentModel
      };

      if (editingSubagentIndex !== null) {
        updatedSubagents = [...currentSubagents];
        updatedSubagents[editingSubagentIndex] = subagentData;
      } else {
        updatedSubagents = [...currentSubagents, subagentData];
      }

      await updateDoc(doc(db, "agents", selectedAgent.id), {
        subagents: updatedSubagents
      });
      setShowSubagentModal(false);
      setNewSubagentName('');
      setNewSubagentMission('');
      setNewSubagentModel('google/gemini-2.5-flash');
      setEditingSubagentIndex(null);
      setIsCustomMission(false);
      setIsEditingDuties(false);
    } catch (error: any) {
      alert("Error saving subagent: " + error.message);
    } finally {
      setIsSavingSubagent(false);
    }
  };`;

// Wait, the regex replace might be tricky with newlines. Let's use string indexOf and replace.
const handleSaveStart = pageContent.indexOf("  const handleSaveSubagent = async (e: React.FormEvent) => {");
const handleSaveEnd = pageContent.indexOf("  };", handleSaveStart) + 4;
pageContent = pageContent.substring(0, handleSaveStart) + newHandleSaveSubagent + pageContent.substring(handleSaveEnd);

// 3. Sub-agentes list: Edit button
const subagentButtonsOld = `                               <button className="text-xs text-red-500 hover:text-red-400" onClick={async () => {
                                 if (confirm('Â¿Eliminar este sub-agente?')) {
                                   const filtered = selectedAgent.subagents.filter((_: any, index: number) => index !== i);
                                   await updateDoc(doc(db, "agents", selectedAgent.id), { subagents: filtered });
                                 }
                               }}>
                                 Eliminar
                               </button>`;
// Need to find exactly how it is in the code. I will just search for `onClick={async () => {` and replace around it.
const subagentButtonsNew = `                               <div className="flex items-center gap-3">
                                 <button className="text-xs text-blue-500 hover:text-blue-400" onClick={() => {
                                   setNewSubagentName(sub.name);
                                   setNewSubagentMission(sub.mission || '');
                                   setNewSubagentModel(sub.model || 'google/gemini-2.5-flash');
                                   setEditingSubagentIndex(i);
                                   // Check if mission is custom
                                   if (sub.mission && !dutiesList.includes(sub.mission)) {
                                     setIsCustomMission(true);
                                   } else {
                                     setIsCustomMission(false);
                                   }
                                   setShowSubagentModal(true);
                                 }}>
                                   Editar
                                 </button>
                                 <button className="text-xs text-red-500 hover:text-red-400" onClick={async () => {
                                   if (confirm('¿Eliminar este sub-agente?')) {
                                     const filtered = selectedAgent.subagents.filter((_: any, index: number) => index !== i);
                                     await updateDoc(doc(db, "agents", selectedAgent.id), { subagents: filtered });
                                   }
                                 }}>
                                   Eliminar
                                 </button>
                               </div>`;

const btnRegex = /<button className="text-xs text-red-500 hover:text-red-400" onClick=\{async \(\) => \{[\s\S]*?<\/button>/;
pageContent = pageContent.replace(btnRegex, subagentButtonsNew);

// 4. Modal Header
pageContent = pageContent.replace(
  '<h3 className="font-bold flex items-center gap-2"><Bot className="text-primary" size={18}/> Nuevo Sub-agente</h3>',
  '<h3 className="font-bold flex items-center gap-2"><Bot className="text-primary" size={18}/> {editingSubagentIndex !== null ? "Editar Sub-agente" : "Nuevo Sub-agente"}</h3>'
);

// 5. Add model selector to modal
const newModelSelector = `                <div>
                  <label className="text-sm font-medium block mb-1">Modelo de IA</label>
                  <select value={newSubagentModel} onChange={e => setNewSubagentModel(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none">
                    <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
                    <option value="meta-llama/llama-3-8b-instruct">Llama 3 8B</option>
                  </select>
                </div>
`;
// Insert before "Misión" block
pageContent = pageContent.replace(
  '                <div>\n                  <div className="flex justify-between items-center mb-1">',
  newModelSelector + '                <div>\n                  <div className="flex justify-between items-center mb-1">'
);

// 6. Reset state properly when closing modal or clicking "Agregar sub-agente" button
pageContent = pageContent.replace(
  '<button onClick={() => setShowSubagentModal(true)} className="text-xs text-primary hover:underline flex items-center gap-1" title="Agregar Sub-agente">',
  '<button onClick={() => { setNewSubagentName(\'\'); setNewSubagentMission(\'\'); setNewSubagentModel(\'google/gemini-2.5-flash\'); setEditingSubagentIndex(null); setIsCustomMission(false); setIsEditingDuties(false); setShowSubagentModal(true); }} className="text-xs text-primary hover:underline flex items-center gap-1" title="Agregar Sub-agente">'
);

pageContent = pageContent.replace(
  'setShowSubagentModal(false); setIsCustomMission(false); setIsEditingDuties(false);',
  'setShowSubagentModal(false); setIsCustomMission(false); setIsEditingDuties(false); setEditingSubagentIndex(null);'
);
pageContent = pageContent.replace(
  'setShowSubagentModal(false); setIsCustomMission(false); setIsEditingDuties(false);',
  'setShowSubagentModal(false); setIsCustomMission(false); setIsEditingDuties(false); setEditingSubagentIndex(null);'
);

// Fix Guardar button text
pageContent = pageContent.replace(
  '{isSavingSubagent ? "Guardando..." : "Agregar Sub-agente"}',
  '{isSavingSubagent ? "Guardando..." : (editingSubagentIndex !== null ? "Guardar Cambios" : "Agregar Sub-agente")}'
);


fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done adding edit subagent features');
