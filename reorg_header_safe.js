const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');

// 1. Add clients state
content = content.replace(
  /const \[agents, setAgents\] = useState<any\[\]>\(\[\]\);/,
  `const [agents, setAgents] = useState<any[]>([]);\n  const [clients, setClients] = useState<any[]>([]);`
);

// 2. Add clients subscription
content = content.replace(
  /const unsubAgents = onSnapshot\(collection\(db, "agents"\), \(snapshot\) => \{([\s\S]*?)return \(\) => unsubAgents\(\);/m,
  `const unsubAgents = onSnapshot(collection(db, "agents"), (snapshot) => {$1const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {\n      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));\n    });\n    return () => { unsubAgents(); unsubClients(); };`
);
// Wait, my previous revert means the original state is `const unsub = ...`
content = content.replace(
  /const unsub = onSnapshot\(collection\(db, "agents"\), \(snapshot\) => \{([\s\S]*?)return \(\) => unsub\(\);/m,
  `const unsubAgents = onSnapshot(collection(db, "agents"), (snapshot) => {$1const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {\n      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));\n    });\n    return () => { unsubAgents(); unsubClients(); };`
);

// 3. Update the header UI
const currentHeaderRegex = /<div>\s*<div className="flex flex-wrap items-center gap-3">[\s\S]*?Modelo: \{selectedAgent\.aiModel \|\| "google\/gemini-2\.5-flash"\}[\s\S]*?<\/span>\s*<\/div>\s*<\/div>/;

const newHeader = `<div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                    {selectedAgent.status === 'online' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> Inactivo
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mt-1 w-full max-w-2xl border border-border bg-secondary/10 rounded-lg p-3">
                    {/* Left Column */}
                    <div className="flex flex-col gap-2">
                      <span className="text-muted-foreground flex items-center gap-2 text-sm">
                        <ShieldCheck size={14} className="text-blue-500" />
                        ID: <span className="text-foreground">{selectedAgent.id}</span>
                      </span>
                      <span className="text-muted-foreground flex items-center gap-2 text-sm">
                        <Sparkles size={14} className="text-purple-500" />
                        Modelo: <span className="text-foreground">{selectedAgent.aiModel || "google/gemini-2.5-flash"}</span>
                      </span>
                    </div>
                    
                    {/* Right Column */}
                    <div className="flex flex-col gap-2">
                      <span className="text-muted-foreground flex items-center gap-2 text-sm">
                        <User size={14} className="text-primary" />
                        Cliente asignado: {clients.find(c => c.id === selectedAgent.clientId)?.name || <span className="italic opacity-50">Ninguno</span>}
                      </span>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('open-edit-agent', { detail: { agent: selectedAgent, tab: 'general' } }))}
                        className="text-primary hover:underline flex items-center gap-2 text-sm transition-colors w-fit"
                      >
                        <Settings2 size={14} />
                        Editar Agente
                      </button>
                    </div>
                  </div>
                </div>`;

content = content.replace(currentHeaderRegex, newHeader);

if (!content.includes('User,')) {
    content = content.replace(/import \{ (.*?) \} from "lucide-react";/, 'import { $1, User } from "lucide-react";');
}

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done modifying header completely safely');
