const fs = require('fs');

let content = fs.readFileSync('src/components/AgentModals.tsx', 'utf-8');

// 1. Add multiselect logic for handoff
// Since editingAgent.soulData.handoff is currently a string in generateSoul, we should store it as an array or comma-separated string.
// Let's store it as a comma-separated string so `generateSoul` doesn't break if it receives a string.

const handoffCheckboxesCode = `
                        <div>
                          <label className="text-sm font-medium">3. Protocolo de Transferencia Humana</label>
                          <p className="text-xs text-muted-foreground mb-2">¿En qué momento debe el agente dejar de hablar y avisar a un agente humano? (Puedes seleccionar varias)</p>
                          <div className="space-y-2 bg-background border border-border rounded-md p-3">
                            {HANDOFF_OPTIONS.map(opt => {
                              const currentHandoffs = (editingAgent.soulData?.handoff || "").split("|").filter(Boolean);
                              const isChecked = currentHandoffs.includes(opt);
                              return (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={isChecked}
                                    onChange={e => {
                                      let newHandoffs = [...currentHandoffs];
                                      if (e.target.checked) newHandoffs.push(opt);
                                      else newHandoffs = newHandoffs.filter(h => h !== opt);
                                      const newVal = newHandoffs.join("|");
                                      const newData = { ...(editingAgent.soulData || {}), handoff: newVal };
                                      setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
                                    }}
                                  />
                                  <span className="text-sm">{opt}</span>
                                </label>
                              );
                            })}
                            <div className="pt-2 mt-2 border-t border-border">
                              <label className="flex items-center gap-2 cursor-pointer mb-2">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                  checked={customSoulFields.handoff}
                                  onChange={e => setCustomSoulFields(prev => ({...prev, handoff: e.target.checked}))}
                                />
                                <span className="text-sm font-medium">Otra regla personalizada...</span>
                              </label>
                              {customSoulFields.handoff && (
                                <input 
                                  type="text" 
                                  placeholder="Ej. Si el cliente pide hablar con gerencia" 
                                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                  value={(editingAgent.soulData?.handoffCustom || "")}
                                  onChange={e => {
                                      const newData = { ...(editingAgent.soulData || {}), handoffCustom: e.target.value };
                                      setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>
`;

content = content.replace(
  /\{renderSoulField\('handoff', '3\. Protocolo de Transferencia Humana', '¿En qué momento debe el agente dejar de hablar y avisar a un agente humano\?', HANDOFF_OPTIONS, 'Ej\. Si el cliente pide hablar con gerencia'\)\}/,
  handoffCheckboxesCode
);

// Modify generateSoul to handle the new `handoff` (which is pipe-separated) and `handoffCustom`
content = content.replace(
  /if \(data\.handoff\) md \+= `## 3\. PROTOCOLO DE TRANSFERENCIA HUMANA\\nCuándo pasar a un humano: \$\{data\.handoff\}\\n\\n`;/,
  `if (data.handoff || data.handoffCustom) {
      let htext = (data.handoff || "").split("|").filter(Boolean).map((h: string) => "- " + h).join("\\n");
      if (data.handoffCustom) htext += "\\n- " + data.handoffCustom;
      md += \`## 3. PROTOCOLO DE TRANSFERENCIA HUMANA\\nCuándo pasar a un humano:\\n\${htext}\\n\\n\`;
    }`
);

fs.writeFileSync('src/components/AgentModals.tsx', content, 'utf8');
console.log('done converting handoff to multiselect');
