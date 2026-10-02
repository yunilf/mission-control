const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');

// The block has this pattern:
const phonePattern = /<div className="relative">\\s*<Phone className="absolute left-3 top-2.5 text-muted-foreground" size=\{16\} \/>\\s*<input type="text" value=\{newClientPhone\} onChange=\{e => setNewClientPhone\(e\.target\.value\)\} placeholder="\+1 829\.\.\." className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary\/50 transition-shadow" \/>\\s*<\/div>\\s*<\/div>/;

const newHTML = `<div className="relative">
                          <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="+1 809..." className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-emerald-500">WhatsApp del Agente IA</label>
                        <div className="relative">
                          <Bot className="absolute left-3 top-2.5 text-emerald-500" size={16} />
                          <input type="text" value={newClientAgentPhone} onChange={e => setNewClientAgentPhone(e.target.value)} placeholder="+1 829... (Exclusivo IA)" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>`;

content = content.replace(phonePattern, newHTML);

fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('done');
