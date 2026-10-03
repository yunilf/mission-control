const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const startStr = `<div key={i} className="bg-background border border-border rounded-md p-3 flex justify-between items-center">`;
const startIndex = pageContent.indexOf(startStr);

if (startIndex === -1) {
    console.error("Could not find start index");
    process.exit(1);
}

// Find the end of this block by counting divs.
let openDivs = 0;
let endIndex = -1;

for (let i = startIndex; i < pageContent.length; i++) {
    if (pageContent.substring(i, i + 4) === '<div') openDivs++;
    if (pageContent.substring(i, i + 5) === '</div') openDivs--;
    
    if (openDivs === 0 && i > startIndex) {
        endIndex = i + 6; // include '</div>'
        break;
    }
}

if (endIndex === -1) {
    console.error("Could not find end index");
    process.exit(1);
}

const newSubagentList = `<div key={i} className="bg-background border border-border rounded-md p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                               <div className="flex items-center gap-4 lg:w-1/4 shrink-0">
                                 <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                   <Bot size={20} />
                                 </div>
                                 <div className="min-w-0">
                                   <div className="text-sm font-bold capitalize text-foreground truncate">{sub.name}</div>
                                   <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 truncate" title={sub.model || 'google/gemini-2.5-flash'}>
                                     <Sparkles size={12} className="text-purple-400 shrink-0"/> {sub.model || 'google/gemini-2.5-flash'}
                                   </div>
                                 </div>
                               </div>
                               
                               <div className="flex-1 lg:px-6 lg:border-l lg:border-border/50 min-w-0">
                                 <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Misión / Deberes</div>
                                 <div className="text-xs text-foreground line-clamp-2" title={sub.mission || 'Sin misión asignada'}>{sub.mission || 'Sin misión asignada'}</div>
                               </div>

                               <div className="lg:w-1/4 flex items-center justify-between lg:justify-end gap-6 lg:border-l lg:border-border/50 lg:pl-6 shrink-0">
                                 <div className="flex flex-col">
                                   <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tokens</span>
                                   <span className="text-sm font-mono font-medium text-emerald-400">{sub.tokensUsed || '0'}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <button className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors" title="Editar" onClick={() => {
                                     setNewSubagentName(sub.name);
                                     setNewSubagentMission(sub.mission || '');
                                     setNewSubagentModel(sub.model || 'google/gemini-2.5-flash');
                                     setEditingSubagentIndex(i);
                                     if (sub.mission && !dutiesList.includes(sub.mission)) {
                                       setIsCustomMission(true);
                                     } else {
                                       setIsCustomMission(false);
                                     }
                                     setShowSubagentModal(true);
                                   }}>
                                     <Settings2 size={16}/>
                                   </button>
                                   <button className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Eliminar" onClick={async () => {
                                     if (confirm('¿Eliminar este sub-agente?')) {
                                       const filtered = selectedAgent.subagents.filter((_: any, index: number) => index !== i);
                                       await updateDoc(doc(db, "agents", selectedAgent.id), { subagents: filtered });
                                     }
                                   }}>
                                     <Trash size={16}/>
                                   </button>
                                 </div>
                               </div>
                            </div>`;

pageContent = pageContent.substring(0, startIndex) + newSubagentList + pageContent.substring(endIndex);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done replacing subagent ui block');
