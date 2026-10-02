const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');

// 1. Add state variable
content = content.replace(
  'const [newClientPhone, setNewClientPhone] = useState("");',
  'const [newClientPhone, setNewClientPhone] = useState("");\n  const [newClientAgentPhone, setNewClientAgentPhone] = useState("");'
);

// 2. Add to Firebase payload
content = content.replace(
  '        phone: newClientPhone,\n        email: newClientEmail,',
  '        phone: newClientPhone,\n        agentPhone: newClientAgentPhone,\n        email: newClientEmail,'
);

// 3. Reset state
content = content.replace(
  'setNewClientName(""); setNewClientCompany(""); setNewClientPhone(""); setNewClientEmail("");',
  'setNewClientName(""); setNewClientCompany(""); setNewClientPhone(""); setNewClientAgentPhone(""); setNewClientEmail("");'
);

// 4. Update the form UI (Label change)
content = content.replace(
  '<label className="text-sm font-medium">Teléfono WhatsApp</label>',
  '<label className="text-sm font-medium">Teléfono del Negocio</label>'
);

// 5. Insert new field
const phoneBlock = `                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Teléfono del Negocio</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="+1 829..." className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>`;

const newPhoneBlock = `                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Teléfono del Negocio</label>
                        <div className="relative">
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

content = content.replace(phoneBlock, newPhoneBlock);

fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('done');
