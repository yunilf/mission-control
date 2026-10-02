const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');

// 1. States
content = content.replace(
  'const [newClientPhone, setNewClientPhone] = useState("");',
  'const [newClientPhone, setNewClientPhone] = useState("");\n  const [newClientAgentPhone, setNewClientAgentPhone] = useState("");'
);

// 2. Firebase payload
content = content.replace(
  'phone: newClientPhone,\n        website:',
  'phone: newClientPhone,\n        agentPhone: newClientAgentPhone,\n        website:'
);

// 3. Reset state
content = content.replace(
  'setNewClientPhone(""); setNewClientEmail("");',
  'setNewClientPhone(""); setNewClientAgentPhone(""); setNewClientEmail("");'
);

// 4. Inject field in the UI. 
// Let's find exactly the Phone input block.
const inputBlockStr = '<input type="text" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)}';

const lines = content.split('\\n');
let newLines = [];
let injected = false;

for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  
  if (!injected && lines[i].includes('value={newClientPhone}') && lines[i].includes('onChange={e => setNewClientPhone')) {
      // Find where this div ends
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('</div>')) {
          newLines.push(lines[j]);
          j++;
      }
      newLines.push(lines[j]); // </div> of relative
      j++;
      newLines.push(lines[j]); // </div> of space-y-1.5
      
      // NOW WE INJECT!
      newLines.push(`                      <div className="space-y-1.5">`);
      newLines.push(`                        <label className="text-sm font-medium text-emerald-500">WhatsApp del Agente IA</label>`);
      newLines.push(`                        <div className="relative">`);
      newLines.push(`                          <Bot className="absolute left-3 top-2.5 text-emerald-500" size={16} />`);
      newLines.push(`                          <input type="text" value={newClientAgentPhone} onChange={e => setNewClientAgentPhone(e.target.value)} placeholder="+1 829... (Exclusivo IA)" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />`);
      newLines.push(`                        </div>`);
      newLines.push(`                      </div>`);
      
      injected = true;
      i = j; // skip forward
  }
}

// 5. Fix Label manually for the Business phone
let finalContent = newLines.join('\\n');
// We don't care about the previous mojibake, just replace whatever is between "medium"> and </label> right before newClientPhone.
// Let's just let it be, or change it with regex:
finalContent = finalContent.replace(/<label className="text-sm font-medium">Tel.*WhatsApp<\/label>/, '<label className="text-sm font-medium">Teléfono del Negocio</label>');

fs.writeFileSync('src/app/clients/page.tsx', finalContent, 'utf8');
console.log('done, injected=' + injected);
