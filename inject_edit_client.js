const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');

// 1. Add `editingClient` state
content = content.replace(
  /const \[showAddModal, setShowAddModal\] = useState\(false\);/,
  `const [showAddModal, setShowAddModal] = useState(false);\n  const [editingClient, setEditingClient] = useState<any | null>(null);`
);

// 2. Add handleEditClick function
const handleEditClickFunc = `
  const handleEditClick = (client: any) => {
    setEditingClient(client);
    setNewClientName(client.name || "");
    setNewClientCompany(client.company || "");
    setNewClientPhone(client.phone || "");
    setNewClientContactPhone(client.contactPhone || "");
    setNewClientAgentPhone(client.agentPhone || "");
    setNewClientEmail(client.email || "");
    setNewClientWebsite(client.website || "");
    setNewClientInstagram(client.instagram || "");
    setNewClientAddress(client.address || "");
    setNewClientHours(client.hours || "");
    setNewClientBusinessInfo(client.businessInfo || "");
    setNewClientStatus(client.status || "active");
    setNewClientTier(client.tier || "Pro");
    setNewClientNotes(client.notes || "");
    setShowAddModal(true);
  };
`;
content = content.replace(
  /const handleAddClient = async \(e: React\.FormEvent\) => \{/,
  handleEditClickFunc + "\n  const handleAddClient = async (e: React.FormEvent) => {"
);

// 3. Modify handleAddClient to support edit mode
content = content.replace(
  /await addDoc\(collection\(db, "clients"\), \{([\s\S]*?)\}\);/g,
  `if (editingClient) {
        await updateDoc(doc(db, "clients", editingClient.id), {
          name: newClientName,
          company: newClientCompany,
          phone: newClientPhone,
          contactPhone: newClientContactPhone,
          agentPhone: newClientAgentPhone,
          email: newClientEmail,
          website: newClientWebsite,
          instagram: newClientInstagram,
          address: newClientAddress,
          hours: newClientHours,
          businessInfo: newClientBusinessInfo,
          status: newClientStatus,
          tier: newClientTier,
          notes: newClientNotes
        });
      } else {
        await addDoc(collection(db, "clients"), {
$1
        });
      }`
);

// 4. Update the add button handler to clear the form properly
content = content.replace(
  /<button onClick=\{\(\) => setShowAddModal\(true\)\} className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary\/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors">/,
  `<button onClick={() => {
            setEditingClient(null);
            setNewClientName(""); setNewClientCompany(""); setNewClientPhone(""); setNewClientContactPhone(""); setNewClientAgentPhone(""); setNewClientEmail("");
            setNewClientWebsite(""); setNewClientInstagram(""); setNewClientAddress(""); setNewClientHours(""); setNewClientBusinessInfo("");
            setNewClientStatus("active"); setNewClientTier("Pro"); setNewClientNotes("");
            setShowAddModal(true);
          }} className="flex items-center gap-2 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-lg text-sm font-medium transition-colors">`
);

// 5. Replace Trash2 button with Edit and Delete buttons
content = content.replace(
  /<button onClick=\{\(\) => handleDeleteClient\(client\.id\)\} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500\/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">\s*<Trash2 size=\{16\} \/>\s*<\/button>/,
  `<div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(client)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Editar cliente">
                        <Settings2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteClient(client.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Eliminar cliente">
                        <Trash2 size={16} />
                      </button>
                    </div>`
);

// 6. Update modal title
content = content.replace(
  /<h2 className="text-xl font-bold flex items-center gap-2"><User className="text-primary"\/> Nuevo Cliente<\/h2>/,
  `<h2 className="text-xl font-bold flex items-center gap-2"><User className="text-primary"/> {editingClient ? "Editar Cliente" : "Nuevo Cliente"}</h2>`
);

// 7. Update submit button
content = content.replace(
  /\{isSubmitting \? "Guardando\.\.\." : "Crear Cliente"\}/,
  `{isSubmitting ? "Guardando..." : (editingClient ? "Guardar Cambios" : "Crear Cliente")}`
);

fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('done adding edit client feature');
