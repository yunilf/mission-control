const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');

// 1. Rename labels
content = content.replace('Nombre del Responsable', 'Nombre del Contacto');
content = content.replace('Empresa o Marca', 'Nombre Negocio');

// 2. Add state for newClientContactPhone
content = content.replace(
  'const [newClientPhone, setNewClientPhone] = useState("");',
  'const [newClientContactPhone, setNewClientContactPhone] = useState("");\n  const [newClientPhone, setNewClientPhone] = useState("");'
);

// 3. Add to Firebase payload
content = content.replace(
  '        phone: newClientPhone,',
  '        contactPhone: newClientContactPhone,\n        phone: newClientPhone,'
);

// 4. Reset state
content = content.replace(
  'setNewClientName(""); setNewClientCompany(""); setNewClientPhone("");',
  'setNewClientName(""); setNewClientCompany(""); setNewClientContactPhone(""); setNewClientPhone("");'
);

// 5. Inject new field in the UI
// The new field is "Whatsapp del Contacto". I should place it under "Nombre del Contacto" or in the "Contacto y Enlaces" block.
// "Contacto y Enlaces" currently has "Teléfono del Negocio", "WhatsApp del Agente IA", "Correo Electrónico", "Página Web", "Instagram".
// But it makes sense to put "Whatsapp del Contacto" in the "Datos Principales" block, right below "Nombre del Contacto" and "Nombre Negocio", OR inside "Contacto y Enlaces" at the top.
// Let's put it in "Datos Principales" under "Nombre Negocio".

const companyBlock = `                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre Negocio</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} placeholder="Ej. La Barrita Express" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>`;

const newCompanyBlock = `                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre Negocio</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} placeholder="Ej. La Barrita Express" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">WhatsApp del Contacto</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientContactPhone} onChange={e => setNewClientContactPhone(e.target.value)} placeholder="+1 809... (Dueño/Gerente)" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>`;

// Wait, the block was originally `Empresa o Marca`. I already replaced it above in step 1.
// So `companyBlock` is accurate. Let's do the replacement carefully.
let lines = content.split('\\n');
let newLines = [];
let injected = false;

for (let i = 0; i < lines.length; i++) {
  newLines.push(lines[i]);
  
  if (!injected && lines[i].includes('value={newClientCompany}') && lines[i].includes('onChange={e => setNewClientCompany')) {
      let j = i + 1;
      while (j < lines.length && !lines[j].includes('</div>')) {
          newLines.push(lines[j]);
          j++;
      }
      newLines.push(lines[j]); // </div> of relative
      j++;
      newLines.push(lines[j]); // </div> of space-y-1.5
      
      // INJECT
      newLines.push(`                      <div className="space-y-1.5">`);
      newLines.push(`                        <label className="text-sm font-medium">WhatsApp del Contacto</label>`);
      newLines.push(`                        <div className="relative">`);
      newLines.push(`                          <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />`);
      newLines.push(`                          <input type="text" value={newClientContactPhone} onChange={e => setNewClientContactPhone(e.target.value)} placeholder="+1 809... (Dueño o Encargado)" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />`);
      newLines.push(`                        </div>`);
      newLines.push(`                      </div>`);
      
      injected = true;
      i = j;
  }
}

fs.writeFileSync('src/app/clients/page.tsx', newLines.join('\\n'), 'utf8');
console.log('done, injected=' + injected);
