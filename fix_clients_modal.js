const fs = require('fs');
let content = fs.readFileSync('src/components/AgentModals.tsx', 'utf-8');

// 1. Add onSnapshot import
if (!content.includes('onSnapshot')) {
    content = content.replace(
        /import \{ collection, addDoc, updateDoc, doc \} from "firebase\/firestore";/,
        'import { collection, addDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";'
    );
}

// 2. Add clients state
if (!content.includes('const [clients, setClients] = useState<any[]>([])')) {
    content = content.replace(
        /const \[isSubmitting, setIsSubmitting\] = useState\(false\);/,
        `const [isSubmitting, setIsSubmitting] = useState(false);\n  const [clients, setClients] = useState<any[]>([]);`
    );
}

// 3. Add clients subscription in useEffect
const clientsSubscription = `
    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
`;
if (!content.includes('const unsubClients')) {
    content = content.replace(
        /window\.addEventListener\("open-edit-agent", handleOpenEdit\);/,
        `window.addEventListener("open-edit-agent", handleOpenEdit);\n${clientsSubscription}`
    );
    
    // Cleanup subscription
    content = content.replace(
        /window\.removeEventListener\("open-edit-agent", handleOpenEdit\);\s*\};/,
        `window.removeEventListener("open-edit-agent", handleOpenEdit);\n      unsubClients();\n    };`
    );
}

// 4. Update the select field options
const currentSelectRegex = /<select value=\{editingAgent\.clientId \|\| ""\} onChange=\{e => setEditingAgent\(\{\.\.\.editingAgent, clientId: e\.target\.value\}\)\} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1">[\s\S]*?<\/select>/;

const newSelect = `<select value={editingAgent.clientId || ""} onChange={e => setEditingAgent({...editingAgent, clientId: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1">
                            <option value="">-- Sin asignar --</option>
                            {clients.map(client => (
                              <option key={client.id} value={client.id}>{client.name} {client.company ? \`(\${client.company})\` : ''}</option>
                            ))}
                          </select>`;

content = content.replace(currentSelectRegex, newSelect);

// Wait, the "New Agent" form might ALSO have hardcoded clients!
const addAgentSelectRegex = /<select value=\{newAgentClient\} onChange=\{e => setNewAgentClient\(e\.target\.value\)\} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">[\s\S]*?<\/select>/;

if (content.match(addAgentSelectRegex)) {
    const newAddAgentSelect = `<select value={newAgentClient} onChange={e => setNewAgentClient(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm">
                        <option value="">Ninguno</option>
                        {clients.map(client => (
                          <option key={client.id} value={client.id}>{client.name}</option>
                        ))}
                      </select>`;
    content = content.replace(addAgentSelectRegex, newAddAgentSelect);
}

// We should also check if newAgentClient state exists and add it if not, but let's check if it's there.

fs.writeFileSync('src/components/AgentModals.tsx', content, 'utf8');
console.log('done updating AgentModals');
