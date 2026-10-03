const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const regexMission = /<div>\s*<label className="text-sm font-medium block mb-1">MisiÃ³n \(Deberes\)<\/label>\s*<textarea value=\{newSubagentMission\}[\s\S]*?<\/div>/;

// Wait, MisiÃ³n might not match if it's rendered slightly differently in node vs powershell.
// Let's use a simpler regex!
const simplerRegex = /<div>\s*<label className="text-sm font-medium block mb-1">[^<]*<\/label>\s*<textarea value=\{newSubagentMission\}[\s\S]*?<\/div>/;

const newMissionUI = `                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium">Misión (Deberes)</label>
                    <button type="button" onClick={() => setIsEditingDuties(!isEditingDuties)} className="text-xs text-primary hover:underline">
                      {isEditingDuties ? "Cerrar edición" : "Administrar lista"}
                    </button>
                  </div>
                  
                  {isEditingDuties ? (
                    <div className="border border-border rounded-md p-3 space-y-3 bg-secondary/10">
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {dutiesList.length === 0 && <p className="text-xs text-muted-foreground italic">Lista vacía</p>}
                        {dutiesList.map((duty, idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-background border border-border rounded p-2">
                            <span className="flex-1 text-sm">{duty}</span>
                            <button type="button" onClick={() => handleRemoveDuty(idx)} className="text-red-500 hover:text-red-400 p-1">
                              <Trash size={14}/>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={newDutyTemp} onChange={e => setNewDutyTemp(e.target.value)} placeholder="Nuevo deber..." className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary" />
                        <button type="button" onClick={handleAddDuty} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium">Agregar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {!isCustomMission ? (
                        <select 
                          value={newSubagentMission} 
                          onChange={e => {
                            if (e.target.value === 'CUSTOM') {
                              setIsCustomMission(true);
                              setNewSubagentMission('');
                            } else {
                              setNewSubagentMission(e.target.value);
                            }
                          }} 
                          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-secondary transition-colors"
                          required
                        >
                          <option value="">-- Selecciona un deber --</option>
                          {dutiesList.map(d => <option key={d} value={d}>{d}</option>)}
                          <option value="CUSTOM">Escribir algo personalizado...</option>
                        </select>
                      ) : (
                        <div className="space-y-2">
                          <textarea 
                            value={newSubagentMission} 
                            onChange={e => setNewSubagentMission(e.target.value)} 
                            placeholder="Escribe la misión personalizada aquí..." 
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-32 resize-none focus:ring-1 focus:ring-primary focus:outline-none" 
                            required 
                          />
                          <button type="button" onClick={() => { setIsCustomMission(false); setNewSubagentMission(''); }} className="text-xs text-primary hover:underline">
                            Volver a la lista
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>`;

pageContent = pageContent.replace(simplerRegex, newMissionUI);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done patching subagent modal 2');
