"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, onSnapshot, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Bot, X } from "lucide-react";
import { STRICT_RULES_OPTIONS, generateIdentity } from '@/app/agents/page';

export default function AgentModals() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [newAgentRole, setNewAgentRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalSettings, setGlobalSettings] = useState<any>(null);

  useEffect(() => {
    const unsubGlobal = onSnapshot(doc(db, "settings", "global"), (snap: any) => {
      if (snap.exists()) setGlobalSettings(snap.data());
    });
    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubClients(); unsubGlobal(); };
  }, []);

  useEffect(() => {
    const handleOpenAdd = () => setShowAddModal(true);
    window.addEventListener("open-add-agent", handleOpenAdd);
    return () => {
      window.removeEventListener("open-add-agent", handleOpenAdd);
    };
  }, []);

  // Compute name based on selected client
  const selectedClient = clients.find(c => c.id === selectedClientId);
  const computedName = selectedClient 
    ? `yunAi ${selectedClient.company || selectedClient.name}`
    : "yunAi";

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const docRef = await addDoc(collection(db, "agents"), {
        name: computedName,
        clientId: selectedClientId || null,
        role: newAgentRole || "Asistente General",
        status: "offline",
        aiModel: "google/gemini-2.5-flash",
        tokens: "0",
        uptime: "0h",
        createdAt: new Date().toISOString(),
        identity: generateIdentity({ ruleChecklist: Array.from(new Set([...STRICT_RULES_OPTIONS, ...(globalSettings?.globalSecurityChecklist || []), ...(globalSettings?.customOptionalRules || [])])) }),
        identityData: {
          ruleChecklist: Array.from(new Set([...STRICT_RULES_OPTIONS, ...(globalSettings?.globalSecurityChecklist || []), ...(globalSettings?.customOptionalRules || [])]))
        },
        soul: "",
        soulData: {},
        knowledgeBase: []
      });
      
      await addDoc(collection(db, "logs"), {
        agent: "Sistema", action: `Nuevo agente registrado: ${computedName}`, isError: false, timestamp: new Date().toISOString()
      });
      
      setSelectedClientId("");
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
          <p className="text-sm text-muted-foreground mb-6">Asigna un cliente para registrar a yunAi.</p>
          
          <form onSubmit={handleAddAgent} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente Asignado</label>
              <select 
                value={selectedClientId} 
                onChange={e => setSelectedClientId(e.target.value)} 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                required
              >
                <option value="">-- Selecciona un cliente --</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company ? `(${client.company})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Nombre del Agente (Automático)</label>
              <input type="text" value={computedName} disabled className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm text-muted-foreground" />
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
