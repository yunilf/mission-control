const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');

// 1. Add state variable
content = content.replace(
  'const [newClientPhone, setNewClientPhone] = useState("");',
  'const [newClientPhone, setNewClientPhone] = useState("");\n  const [newClientAgentPhone, setNewClientAgentPhone] = useState("");'
);

// 2. Add to Firebase payload
content = content.replace(
  '        phone: newClientPhone,',
  '        phone: newClientPhone,\n        agentPhone: newClientAgentPhone,'
);

// 3. Reset state
content = content.replace(
  '      setNewClientName(""); setNewClientCompany(""); setNewClientPhone(""); setNewClientEmail("");',
  '      setNewClientName(""); setNewClientCompany(""); setNewClientPhone(""); setNewClientAgentPhone(""); setNewClientEmail("");'
);

// 4. Update the form UI
// I need to change "Teléfono WhatsApp" to "Teléfono del Negocio"
content = content.replace(
  '<label className="text-sm font-medium">Teléfono WhatsApp</label>',
  '<label className="text-sm font-medium">Teléfono del Negocio</label>'
);
content = content.replace(
  '<label className="text-sm font-medium">TelÃ©fono WhatsApp</label>',
  '<label className="text-sm font-medium">Teléfono del Negocio</label>'
); // Just in case of mojibake from before

// Now, insert the new WhatsApp field after the Business Phone field
// I'll just use a smart string replacement or a regex.
const targetHtml = `<div className="space-y-1.5">
                        <label className="text-sm font-medium">Teléfono del Negocio</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="+1 829..." className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>`;

const injectedHtml = `<div className="space-y-1.5">
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

// Since it might have mojibake or exact spaces, I'll use substring manipulation.
let lines = content.split('\\n');
let newLines = [];
let i = 0;
while (i < lines.length) {
  newLines.push(lines[i]);
  if (lines[i].includes('value={newClientPhone}') && lines[i].includes('onChange={e => setNewClientPhone')) {
      // Find where this div ends
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('</div>')) {
          newLines.push(lines[j]);
          j++;
      }
      newLines.push(lines[j]); // the </div> of relative
      j++;
      newLines.push(lines[j]); // the </div> of space-y-1.5
      
      // Inject our new block
      newLines.push(`                      <div className="space-y-1.5">`);
      newLines.push(`                        <label className="text-sm font-medium text-emerald-500">WhatsApp del Agente IA</label>`);
      newLines.push(`                        <div className="relative">`);
      newLines.push(`                          <Bot className="absolute left-3 top-2.5 text-emerald-500" size={16} />`);
      newLines.push(`                          <input type="text" value={newClientAgentPhone} onChange={e => setNewClientAgentPhone(e.target.value)} placeholder="+1 829... (Línea para la IA)" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />`);
      newLines.push(`                        </div>`);
      newLines.push(`                      </div>`);
      
      i = j; // skip forward
  }
  i++;
}

content = newLines.join('\\n');

// Wait, I need to make sure I update the grid columns if it's 2 columns.
// Currently it is `<div className="grid grid-cols-2 gap-4">`. 
// If it has 5 items (Phone, Agent Phone, Email, Website, Instagram), it will look fine.

fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('done');
