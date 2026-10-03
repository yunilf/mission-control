const fs = require('fs');

let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Add state variable
if (!content.includes('const [newExtraRule')) {
    content = content.replace("const [newDutyTemp, setNewDutyTemp] = useState('');", "const [newDutyTemp, setNewDutyTemp] = useState('');\n  const [newExtraRule, setNewExtraRule] = useState('');");
}

// 2. Update generateSoul function
const soulFuncStart = "if (data.extra) md += `## 5. REGLAS EXTRA\\n${data.extra}\\n`;";
const newGenerateSoul = `      let extraText = "";
      if (data.extraRules && data.extraRules.length > 0) {
        extraText += data.extraRules.map((r: string) => "- " + r).join("\\n") + "\\n";
      }
      if (data.extra) {
        extraText += data.extra + "\\n";
      }
      if (extraText) md += \`## 5. REGLAS EXTRA\\n\${extraText}\`;`;
      
content = content.replace(soulFuncStart, newGenerateSoul);

// 3. Update the UI
// Find the exact block
const uiStartStr = '<label className="text-sm font-medium">5. Reglas Extra (Opcional)</label>';
const idxStart = content.indexOf(uiStartStr);
if (idxStart !== -1) {
    const pEndIdx = content.indexOf('</p>', idxStart) + 4;
    const textareaStart = content.indexOf('<textarea', pEndIdx);
    const textareaEnd = content.indexOf('/>', textareaStart) + 2;
    
    const newUI = `                            <div className="space-y-3 bg-secondary/10 border border-border rounded-md p-3 mt-2">
                              <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                {(!editingAgent.soulData?.extraRules || editingAgent.soulData.extraRules.length === 0) && !editingAgent.soulData?.extra && <p className="text-xs text-muted-foreground italic">No hay reglas extra.</p>}
                                
                                {/* Legacy extra string if exists */}
                                {editingAgent.soulData?.extra && (
                                  <div className="flex gap-2 items-start bg-background border border-border rounded p-2">
                                    <span className="flex-1 text-sm whitespace-pre-wrap">{editingAgent.soulData.extra}</span>
                                    <button type="button" onClick={() => {
                                      const newData = { ...(editingAgent.soulData || {}), extra: "" };
                                      setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
                                    }} className="text-red-500 hover:text-red-400 p-1">
                                      <Trash size={14}/>
                                    </button>
                                  </div>
                                )}
                                
                                {/* Array list */}
                                {editingAgent.soulData?.extraRules?.map((rule: string, idx: number) => (
                                  <div key={idx} className="flex gap-2 items-center bg-background border border-border rounded p-2">
                                    <span className="flex-1 text-sm">{rule}</span>
                                    <button type="button" onClick={() => {
                                      const newRules = editingAgent.soulData.extraRules.filter((_: any, i: number) => i !== idx);
                                      const newData = { ...(editingAgent.soulData || {}), extraRules: newRules };
                                      setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
                                    }} className="text-red-500 hover:text-red-400 p-1">
                                      <Trash size={14}/>
                                    </button>
                                  </div>
                                ))}
                              </div>
                              <div className="flex gap-2">
                                <input type="text" value={newExtraRule} onChange={e => setNewExtraRule(e.target.value)} onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (!newExtraRule.trim()) return;
                                    const currentRules = editingAgent.soulData?.extraRules || [];
                                    const newData = { ...(editingAgent.soulData || {}), extraRules: [...currentRules, newExtraRule.trim()] };
                                    setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
                                    setNewExtraRule("");
                                  }
                                }} placeholder="Agregar nueva regla..." className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary" />
                                <button type="button" onClick={() => {
                                    if (!newExtraRule.trim()) return;
                                    const currentRules = editingAgent.soulData?.extraRules || [];
                                    const newData = { ...(editingAgent.soulData || {}), extraRules: [...currentRules, newExtraRule.trim()] };
                                    setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
                                    setNewExtraRule("");
                                }} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium">Agregar</button>
                              </div>
                            </div>`;
                            
    content = content.substring(0, pEndIdx) + "\n" + newUI + content.substring(textareaEnd);
}

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('Extra rules array support added');
