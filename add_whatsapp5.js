const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');
let lines = content.split('\\n');

let newLines = [];
let injected = false;

for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  if (!injected && lines[i].includes('value={newClientPhone}') && lines[i].includes('onChange={e => setNewClientPhone')) {
    // We found the input line. Let's add the rest of the div, then inject.
    // The next line should be `</div>` for relative
    i++;
    newLines.push(lines[i]);
    // The next line should be `</div>` for space-y-1.5
    i++;
    newLines.push(lines[i]);
    
    // Now inject our agent field
    newLines.push(`                      <div className="space-y-1.5">`);
    newLines.push(`                        <label className="text-sm font-medium text-emerald-500">WhatsApp del Agente IA</label>`);
    newLines.push(`                        <div className="relative">`);
    newLines.push(`                          <Bot className="absolute left-3 top-2.5 text-emerald-500" size={16} />`);
    newLines.push(`                          <input type="text" value={newClientAgentPhone} onChange={e => setNewClientAgentPhone(e.target.value)} placeholder="+1 829... (Exclusivo IA)" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />`);
    newLines.push(`                        </div>`);
    newLines.push(`                      </div>`);
    injected = true;
  }
}

fs.writeFileSync('src/app/clients/page.tsx', newLines.join('\\n'), 'utf8');
console.log('done, injected=' + injected);
