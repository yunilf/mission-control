const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// Normalize line endings for indexOf
const nContent = content.replace(/\r\n/g, '\n');

// Find 'Cliente asignado:'
const startIdx = nContent.indexOf('Cliente asignado:');
if (startIdx !== -1) {
    // Find the button
    const btnStartIdx = nContent.indexOf('<button', startIdx);
    const btnEndIdx = nContent.indexOf('</button>', btnStartIdx) + '</button>'.length;
    
    // Ensure the button we found is the Editar Agente one
    const btnContent = nContent.substring(btnStartIdx, btnEndIdx);
    if (btnContent.includes("Editar Agente")) {
        const replacement = `
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs font-medium text-muted-foreground">Canales</span>
                        <div className="flex items-center gap-3">
                          {/* WhatsApp Toggle */}
                          <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-md border border-border">
                            <MessageSquare size={14} className="text-emerald-500" />
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={selectedAgent.whatsappEnabled || false} onChange={async (e) => {
                                const val = e.target.checked;
                                const updatedAgent = {...selectedAgent, whatsappEnabled: val};
                                // We don't have setSelectedAgent here since we might need to update the main agents array, 
                                // but wait, does page.tsx have setSelectedAgent? No, selectedAgent is just derived from selectedAgentId.
                                // We can just update the DB, and the onSnapshot listener will update it!
                                await updateDoc(doc(db, "agents", selectedAgent.id), { whatsappEnabled: val });
                              }} />
                              <div className="w-7 h-4 bg-zinc-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                            </label>
                          </div>
                          
                          {/* Telegram Toggle */}
                          <div className="flex items-center gap-1.5 bg-secondary/30 px-2 py-1 rounded-md border border-border">
                            <MessageSquare size={14} className="text-blue-500" />
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input type="checkbox" className="sr-only peer" checked={selectedAgent.telegramEnabled || false} onChange={async (e) => {
                                const val = e.target.checked;
                                await updateDoc(doc(db, "agents", selectedAgent.id), { telegramEnabled: val });
                              }} />
                              <div className="w-7 h-4 bg-zinc-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all"></div>
                            </label>
                          </div>
                        </div>
                      </div>`;
                      
        // Apply replacement
        // Note: we use original `content` string lengths might differ due to \r\n, so we do it by converting everything.
        content = nContent.substring(0, btnStartIdx) + replacement + nContent.substring(btnEndIdx);
        fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
        console.log("Successfully replaced Editar Agente with channels toggle");
    } else {
        console.log("Could not find the button!");
    }
} else {
    console.log("Could not find Cliente asignado");
}
