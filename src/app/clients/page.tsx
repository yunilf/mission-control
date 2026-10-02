"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Users, Bot, Settings2, Plus, Phone, Mail, Building2, Search, Trash2, User, Tag, AlignLeft, X, Briefcase, Activity, Globe, AtSign, MapPin, Clock, FileText } from "lucide-react";

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [newClientCompany, setNewClientCompany] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientContactPhone, setNewClientContactPhone] = useState("");
  const [newClientAgentPhone, setNewClientAgentPhone] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientWebsite, setNewClientWebsite] = useState("");
  const [newClientInstagram, setNewClientInstagram] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientHours, setNewClientHours] = useState("");
  const [newClientBusinessInfo, setNewClientBusinessInfo] = useState("");
  const [newClientStatus, setNewClientStatus] = useState("active");
  const [newClientTier, setNewClientTier] = useState("Pro");
  const [newClientNotes, setNewClientNotes] = useState("");
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

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;
    setIsSubmitting(true);
    try {
      if (editingClient) {
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
        notes: newClientNotes,
        createdAt: new Date().toISOString()
      
        });
      }
      setNewClientName(""); setNewClientCompany(""); setNewClientPhone(""); setNewClientContactPhone(""); setNewClientAgentPhone(""); setNewClientEmail("");
      setNewClientWebsite(""); setNewClientInstagram(""); setNewClientAddress(""); setNewClientHours(""); setNewClientBusinessInfo("");
      setNewClientStatus("active"); setNewClientTier("Pro"); setNewClientNotes("");
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
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleEditClick(client)} className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors" title="Editar cliente">
                        <Settings2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteClient(client.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors" title="Eliminar cliente">
                        <Trash2 size={16} />
                      </button>
                    </div>
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
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Users size={16} className="text-primary" /> Agentes ({(clientAgents || []).length})
                  </h4>
                </div>
                
                <div className="space-y-2 flex-1">
                  {clientAgents.length === 0 ? (
                    <div className="text-xs text-muted-foreground text-center py-4 bg-secondary/20 rounded-md border border-dashed border-border">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20 shrink-0">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Briefcase className="text-primary" size={24} /> 
                  Nuevo Cliente
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Registra toda la información operativa para que el agente la utilice.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:bg-secondary p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Columna Izquierda: Info General & Contacto */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User size={16}/> Contacto
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre del Contacto <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" required />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">WhatsApp del Contacto</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientContactPhone} onChange={e => setNewClientContactPhone(e.target.value)} placeholder="+1 809... (Dueño o Encargado)" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Building2 size={16}/> Datos Negocio
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 space-y-1.5">
                        <label className="text-sm font-medium">Nombre Negocio</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} placeholder="Ej. La Barrita Express" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">WhatsApp del Negocio</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="+1 829..." className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Correo Electrónico</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} placeholder="admin@empresa.com" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Página Web</label>
                        <div className="relative">
                          <Globe className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientWebsite} onChange={e => setNewClientWebsite(e.target.value)} placeholder="www.ejemplo.com" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Instagram</label>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientInstagram} onChange={e => setNewClientInstagram(e.target.value)} placeholder="@usuario" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Datos de Negocio e Inteligencia */}
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText size={16}/> Perfil Operativo (Para el Agente)
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-emerald-500">WhatsApp del Agente IA</label>
                        <div className="relative">
                          <Bot className="absolute left-3 top-2.5 text-emerald-500" size={16} />
                          <input type="text" value={newClientAgentPhone} onChange={e => setNewClientAgentPhone(e.target.value)} placeholder="+1 829... (Exclusivo IA)" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Dirección Física o Enlace a Maps</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientAddress} onChange={e => setNewClientAddress(e.target.value)} placeholder="Ej. Manzana 9, #10..." className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Horario de Atención</label>
                        <div className="relative">
                          <Clock className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <select value={newClientHours} onChange={e => setNewClientHours(e.target.value)} className="w-full bg-background border border-border rounded-lg pl-10 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow appearance-none text-foreground">
                            <option value="" disabled>Selecciona el horario...</option>
                            <option value="Lunes a Viernes, 8:00 AM - 5:00 PM">Lunes a Viernes, 8:00 AM - 5:00 PM</option>
                            <option value="Lunes a Viernes, 9:00 AM - 6:00 PM">Lunes a Viernes, 9:00 AM - 6:00 PM</option>
                            <option value="Lunes a Sábado, 8:00 AM - 6:00 PM">Lunes a Sábado, 8:00 AM - 6:00 PM</option>
                            <option value="Lunes a Sábado, 9:00 AM - 8:00 PM">Lunes a Sábado, 9:00 AM - 8:00 PM</option>
                            <option value="Lunes a Domingo, 8:00 AM - 10:00 PM">Lunes a Domingo, 8:00 AM - 10:00 PM</option>
                            <option value="Lunes a Domingo (24/7)">Lunes a Domingo (24 Horas)</option>
                            <option value="Horario Nocturno, 6:00 PM - 2:00 AM">Horario Nocturno, 6:00 PM - 2:00 AM</option>
                            <option value="Personalizado (Ver Información del Negocio)">Personalizado (Detallado en Info. Negocio)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium flex justify-between">
                          <span>Información del Negocio (Catálogo, Reglas)</span>
                        </label>
                        <textarea 
                          value={newClientBusinessInfo} 
                          onChange={e => setNewClientBusinessInfo(e.target.value)} 
                          placeholder="Describe de qué trata el negocio, qué vende, links a su catálogo de WhatsApp, o reglas de ventas que el agente de IA deba saber..." 
                          className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow min-h-[100px] resize-none" 
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Settings2 size={16}/> Servicio en la Agencia
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nivel de Plan</label>
                        <div className="relative">
                          <Tag className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <select value={newClientTier} onChange={e => setNewClientTier(e.target.value)} className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                            <option value="Starter">Starter</option>
                            <option value="Pro">Pro</option>
                            <option value="Enterprise">Enterprise</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Estado</label>
                        <div className="relative">
                          <Activity className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <select value={newClientStatus} onChange={e => setNewClientStatus(e.target.value)} className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none">
                            <option value="active">Activo (Online)</option>
                            <option value="onboarding">En Onboarding</option>
                            <option value="inactive">Inactivo</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Botonera */}
              <div className="mt-8 pt-5 border-t border-border flex justify-end gap-3 shrink-0">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-sm font-medium hover:bg-secondary rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity shadow-md flex items-center gap-2">
                  {isSubmitting ? (
                    <><Bot className="animate-bounce" size={16} /> Guardando...</>
                  ) : (
                    <><Plus size={16} /> Registrar Cliente</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}