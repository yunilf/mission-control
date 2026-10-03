const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const regexIdentity = /<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Nombre y Cliente<\/h3>[\s\S]*?<\/div>\s*<\/div>/;

const newIdentity = `<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Nombre y Cliente</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-sm font-medium">Cliente Asignado</label>
                          <select 
                            value={editingAgent.clientId || ""} 
                            onChange={e => {
                              const newClientId = e.target.value;
                              const client = clients.find(c => c.id === newClientId);
                              const newName = client ? \`yunAi \${client.company || client.name}\` : "yunAi";
                              setEditingAgent({...editingAgent, clientId: newClientId, name: newName});
                            }} 
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1 focus:ring-1 focus:ring-primary focus:outline-none"
                          >
                            <option value="">-- Sin asignar --</option>
                            {clients.map(client => (
                              <option key={client.id} value={client.id}>{client.name} {client.company ? \`(\${client.company})\` : ''}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Nombre del Agente (Automático)</label>
                          <input type="text" value={editingAgent.name} disabled className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm mt-1 text-muted-foreground" />
                        </div>
                      </div>`;

pageContent = pageContent.replace(regexIdentity, newIdentity);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done updating identity name logic');
