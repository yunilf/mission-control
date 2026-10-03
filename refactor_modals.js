const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');
let modalsContent = fs.readFileSync('src/components/AgentModals.tsx', 'utf-8');

// 1. EXTRACT FROM MODALS
// Find the options and helper functions
const generateIdentityRegex = /const ROLE_OPTIONS =[\s\S]*?const generateSoul = \([\s\S]*?return md;\n  \};\n/;
const matchIdentityHelper = modalsContent.match(generateIdentityRegex);
const helpersCode = matchIdentityHelper ? matchIdentityHelper[0] : '';

// Find uploadHandlers
const uploadHandlersRegex = /const handleFileUpload = async \([\s\S]*?console\.error\("Error deleting file from storage:", e\);\n      \}\n    \}\n  \};/;
const matchUploads = modalsContent.match(uploadHandlersRegex);
const uploadCode = matchUploads ? matchUploads[0] : '';

// 2. INJECT INTO PAGE.TSX
// Add imports
if (!pageContent.includes('import { storage }')) {
    pageContent = pageContent.replace(
        /import \{ db \} from "@\/lib\/firebase";/,
        `import { db, storage } from "@/lib/firebase";\nimport { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";`
    );
}

// Add state
if (!pageContent.includes('customIdentityFields')) {
    pageContent = pageContent.replace(
        /const \[newSubagentMission, setNewSubagentMission\] = useState\(''\);/,
        `const [newSubagentMission, setNewSubagentMission] = useState('');
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [customIdentityFields, setCustomIdentityFields] = useState({ role: false, tone: false, audience: false, greeting: false });
  const [customSoulFields, setCustomSoulFields] = useState({ objective: false, pricing: false, handoff: false, style: false });
  const [isUploadingKnowledge, setIsUploadingKnowledge] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);`
    );
}

// Add effect to sync editingAgent when selectedAgent changes
if (!pageContent.includes('setEditingAgent(selectedAgent);')) {
    pageContent = pageContent.replace(
        /const selectedAgent = agents\.find\(a => a\.id === selectedAgentId\);/,
        `const selectedAgent = agents.find(a => a.id === selectedAgentId);
  
  useEffect(() => {
    if (selectedAgent && (!editingAgent || editingAgent.id !== selectedAgent.id)) {
      setEditingAgent(selectedAgent);
    }
  }, [selectedAgent]);`
    );
}

// Inject helpers before the return statement of page.tsx
const pageReturnRegex = /if \(!selectedAgent\) \{/;
if (!pageContent.includes('const ROLE_OPTIONS =')) {
    let modifiedHelpersCode = helpersCode;
    // The helpers in modals use editingAgent, setEditingAgent. This matches exactly what we have in page.tsx!
    pageContent = pageContent.replace(
        pageReturnRegex,
        `${modifiedHelpersCode}\n\n${uploadCode}\n\n  const handleSaveEdit = async () => {
    if (!editingAgent) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "agents", editingAgent.id), {
        name: editingAgent.name,
        role: editingAgent.role,
        clientId: editingAgent.clientId || "",
        identity: editingAgent.identity,
        identityData: editingAgent.identityData || {},
        soul: editingAgent.soul,
        soulData: editingAgent.soulData || {},
        knowledgeBase: editingAgent.knowledgeBase || []
      });
      alert("Cambios guardados exitosamente.");
    } catch (e: any) {
      alert("Error guardando cambios: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };\n\n  if (!selectedAgent) {`
    );
}

// 3. REWRITE TABS IN PAGE.TSX
// Replace the tab buttons
pageContent = pageContent.replace(
    /<div className="flex items-center gap-6 px-6 border-b border-border bg-background overflow-x-auto">[\s\S]*?<\/div>\s*<\/div>\s*<div className="flex-1 overflow-hidden">/,
    `<div className="flex items-center gap-6 px-6 border-b border-border bg-background overflow-x-auto custom-scrollbar">
               <button onClick={() => setActiveTab('monitor')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'monitor' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                  Inicio
                </button>
                <button onClick={() => setActiveTab('identidad')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'identidad' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                  Identidad
                </button>
                <button onClick={() => setActiveTab('subagents')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'subagents' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                  Sub-agentes
                </button>
                <button onClick={() => setActiveTab('conocimiento')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'conocimiento' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                  Conocimiento
                </button>
                <button onClick={() => setActiveTab('canales')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'canales' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                  Canales
                </button>
                <button onClick={() => setActiveTab('integraciones')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'integraciones' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                  Integraciones
                </button>
                <button onClick={() => setActiveTab('config')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'config' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                  Resumen
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">`
);

// We need to extract the JSX from AgentModals for 'identidad', 'soul', 'conocimiento', 'canales', 'tools'
// Since 'soul' is part of Identity in the drawing (Identity replaces Mission which had both), let's combine them in the 'identidad' tab!
// Wait, the drawing only shows "Identidad". I can put both wizards in the "identidad" tab.
// Let's just grab the JSX.
const getJSX = (regex) => {
    const match = modalsContent.match(regex);
    return match ? match[1] : '';
};

// I will just read the actual code in AgentModals using regex to carefully extract it.
const identityJSX = getJSX(/\{activeTab === "identidad" && \(\s*([\s\S]*?)\s*\)\}/);
const soulJSX = getJSX(/\{activeTab === "soul" && \(\s*([\s\S]*?)\s*\)\}/);
const conocimientoJSX = getJSX(/\{activeTab === "conocimiento" && \(\s*([\s\S]*?)\s*\)\}/);
const canalesJSX = getJSX(/\{activeTab === "canales" && \(\s*([\s\S]*?)\s*\)\}/);
const integracionesJSX = getJSX(/\{activeTab === "tools" && \(\s*([\s\S]*?)\s*\)\}/);

// Let's replace the tab content in page.tsx
// Find where the old tabs start
// Remove the old 'mission' tab
const removeMissionTabRegex = /\{activeTab === 'mission' && \([\s\S]*?<\/div>\s*<\/div>\s*\)\}/;
pageContent = pageContent.replace(removeMissionTabRegex, '');

// Inject the new tabs at the end of the scrollable container, just before the end of the main column.
// Wait, page.tsx has a `div` for the content area.
const appendTabsRegex = /\{showSubagentModal && \(/;

const newTabsJSX = `
              {activeTab === 'identidad' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 space-y-8 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Nombre y Cliente</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-medium">Nombre del Agente</label>
                        <input type="text" value={editingAgent.name} onChange={e => setEditingAgent({...editingAgent, name: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Cliente Asignado</label>
                        <select value={editingAgent.clientId || ""} onChange={e => setEditingAgent({...editingAgent, clientId: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1">
                          <option value="">-- Sin asignar --</option>
                          {clients.map(client => (
                            <option key={client.id} value={client.id}>{client.name} {client.company ? \`(\${client.company})\` : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
                        Identidad y Personalidad
                        <span className="text-xs font-normal text-muted-foreground">IDENTITY.md</span>
                      </h3>
                      ${identityJSX.replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/, 'className="space-y-6"')}
                    </div>
                    <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
                      <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
                        Directivas y Lógica
                        <span className="text-xs font-normal text-muted-foreground">SOUL.md</span>
                      </h3>
                      ${soulJSX.replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/, 'className="space-y-6"')}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'conocimiento' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Base de Conocimiento</h3>
                    ${conocimientoJSX.replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/, 'className="space-y-6"')}
                  </div>
                </div>
              )}

              {activeTab === 'canales' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Canales de Comunicación</h3>
                    ${canalesJSX.replace(/className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"/, 'className="space-y-4"')}
                  </div>
                </div>
              )}

              {activeTab === 'integraciones' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Integraciones y Plugins</h3>
                    ${integracionesJSX.replace(/className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"/, 'className="space-y-4"')}
                  </div>
                </div>
              )}

              {/* Floating Save Button if changes are made */}
              {editingAgent && JSON.stringify(editingAgent) !== JSON.stringify(selectedAgent) && (
                <div className="absolute bottom-6 right-6 z-10 animate-in slide-in-from-bottom-4">
                  <div className="bg-card border border-primary/20 shadow-xl rounded-full px-6 py-3 flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground">Tienes cambios sin guardar</span>
                    <button 
                      onClick={handleSaveEdit} 
                      disabled={isSaving}
                      className="bg-primary text-primary-foreground px-5 py-2 rounded-full text-sm font-bold hover:brightness-110 transition-all shadow-md disabled:opacity-50"
                    >
                      {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                  </div>
                </div>
              )}

              {showSubagentModal && (
`;

pageContent = pageContent.replace(appendTabsRegex, newTabsJSX);

// Wait, the "Editar Agente" button in the header should now just set the tab to "identidad"
pageContent = pageContent.replace(
  /<button\s+onClick=\{\(\) => window\.dispatchEvent\(new CustomEvent\('open-edit-agent', \{ detail: \{ agent: selectedAgent, tab: 'general' \} \}\)\)\}\s+className="text-primary hover:underline flex items-center gap-1 text-sm transition-colors w-fit"\s*>\s*<Settings2 size=\{14\} \/>\s*Editar Agente\s*<\/button>/,
  `<button 
                          onClick={() => setActiveTab('identidad')}
                          className="text-primary hover:underline flex items-center gap-1 text-sm transition-colors w-fit"
                        >
                          <Settings2 size={14} />
                          Editar Agente
                        </button>`
);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf-8');

// 4. STRIP AGENTMODALS.TSX
// We keep ONLY the "Add Agent" logic.
const cleanAgentModals = `"use client";

import { useState, useEffect } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Bot, Plus, X } from "lucide-react";

export default function AgentModals() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentRole, setNewAgentRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleOpenAdd = () => setShowAddModal(true);
    window.addEventListener("open-add-agent", handleOpenAdd);
    return () => {
      window.removeEventListener("open-add-agent", handleOpenAdd);
    };
  }, []);

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "agents"), {
        name: newAgentName,
        role: newAgentRole || "Asistente General",
        status: "offline",
        aiModel: "google/gemini-2.5-flash",
        tokens: "0",
        uptime: "0h",
        createdAt: new Date().toISOString(),
        identity: "",
        identityData: {},
        soul: "",
        soulData: {},
        knowledgeBase: []
      });
      
      await addDoc(collection(db, "logs"), {
        agent: "Sistema", action: \`Nuevo agente registrado: \${newAgentName}\`, isError: false, timestamp: new Date().toISOString()
      });
      
      setNewAgentName("");
      setNewAgentRole("");
      setShowAddModal(false);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showAddModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-border bg-secondary/20 flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2"><Bot className="text-primary" size={18}/> Nuevo Agente</h3>
          <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-1">Agregar Nuevo Agente</h3>
          <p className="text-sm text-muted-foreground mb-6">Ingresa los detalles básicos para registrar el agente.</p>
          
          <form onSubmit={handleAddAgent} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Agente</label>
              <input type="text" value={newAgentName} onChange={e => setNewAgentName(e.target.value)} placeholder="ej. Asistente Ventas" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rol o Especialidad</label>
              <input type="text" value={newAgentRole} onChange={e => setNewAgentRole(e.target.value)} placeholder="ej. Atención al Cliente" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
            </div>
            <div className="pt-4 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm hover:bg-secondary rounded-md transition-colors">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50 transition-colors">
                {isSubmitting ? "Guardando..." : "Guardar Agente"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AgentModals.tsx', cleanAgentModals, 'utf-8');
console.log('done refactoring modals into page');
