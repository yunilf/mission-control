"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, Bot, Settings2, Plus, Phone, Mail, Building2, Search, Trash2 } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Escuchar clientes
    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Escuchar agentes para asociarlos
    const unsubAgents = onSnapshot(collection(db, "agents"), (snapshot) => {
      setAgents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubClients(); unsubAgents(); };
  }, []);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "clients"), {
        name: newClientName,
        company: newClientCompany,
        phone: newClientPhone,
        email: newClientEmail,
        createdAt: new Date().toISOString(),
        status: "active"
      });
      setNewClientName(""); setNewClientCompany(""); setNewClientPhone(""); setNewClientEmail("");
      setShowAddModal(false);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este cliente? Se desvincularán sus agentes.")) {
      try {
        await deleteDoc(doc(db, "clients", id));
      } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestión de Clientes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Control total de clientes y agentes asignados.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:opacity-90 transition-opacity shadow-sm">
          <Plus size={18} /> Nuevo Cliente
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map(client => {
          const clientAgents = agents.filter(a => a.clientId === client.id);
          const totalTokens = clientAgents.reduce((acc, a) => acc + (parseFloat(a.tokens) || 0), 0);
          
          return (
            <div key={client.id} className="bg-card border border-border rounded-xl shadow-sm flex flex-col relative overflow-hidden group hover:border-primary/50 transition-colors">
              <div className="p-5 border-b border-border bg-secondary/5 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">{client.name}</h3>
                      <p className="text-sm text-muted-foreground">{client.company || "Sin empresa"}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteClient(client.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
                
                <div className="mt-4 flex flex-col gap-1">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone size={12} /> {client.phone || "N/A"}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Mail size={12} /> {client.email || "N/A"}
                  </div>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Agentes Asignados ({clientAgents.length})</h4>
                
                <div className="flex-1 space-y-2">
                  {clientAgents.length === 0 ? (
                    <div className="text-sm text-muted-foreground italic text-center py-4 bg-secondary/20 rounded-md border border-border border-dashed">
                      Ningún agente asignado
                    </div>
                  ) : (
                    clientAgents.map(agent => (
                      <div key={agent.id} className="flex items-center justify-between p-2 rounded-md bg-secondary/30 border border-border">
                        <div className="flex items-center gap-2">
                          <Bot size={14} className={agent.status === 'online' ? "text-emerald-500" : "text-muted-foreground"} />
                          <span className="text-sm font-medium">{agent.name}</span>
                        </div>
                        <span className="text-xs font-mono bg-background px-1.5 py-0.5 rounded border border-border">
                          {agent.tokens || "0"} TKN
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Consumo Total:</span>
                  <span className="font-bold font-mono text-primary">{totalTokens.toFixed(1)}k Tokens</span>
                </div>
              </div>
            </div>
          );
        })}
        {clients.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-border rounded-xl text-muted-foreground">
            <Building2 size={48} className="mx-auto mb-4 opacity-20" />
            <h3 className="text-lg font-medium mb-1">Sin clientes registrados</h3>
            <p className="text-sm mb-4">Añade clientes para comenzar a asignarles agentes.</p>
            <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm">
              Agregar Primer Cliente
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg p-6 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-xl font-semibold mb-1">Nuevo Cliente</h3>
            <p className="text-sm text-muted-foreground mb-6">Registra un cliente en Mission Control.</p>
            
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Cliente</label>
                <input type="text" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Empresa / Proyecto</label>
                <input type="text" value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} placeholder="Ej. Colmadi" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <input type="text" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="+1829..." className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input type="email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} placeholder="correo@..." className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm hover:bg-secondary rounded-md">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50">
                  {isSubmitting ? "Guardando..." : "Crear Cliente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
