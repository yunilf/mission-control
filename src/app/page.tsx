"use client";

import { Activity, Bot, Cpu, AlertCircle, Play, Square, RefreshCcw, X, Plus, Settings2, MessageCircle, Wrench } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy, limit, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [agents, setAgents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({ tasksCompleted: 0, computeTokens: "0", criticalAlerts: 0 });

  // Add Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentRole, setNewAgentRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("general");

  useEffect(() => {
    const unsubAgents = onSnapshot(collection(db, "agents"), (snapshot) => {
      setAgents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const qLogs = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(5));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubMetrics = onSnapshot(doc(db, "metrics", "global"), (docSnap) => {
      if (docSnap.exists()) setMetrics(docSnap.data());
      else setMetrics({ tasksCompleted: 0, computeTokens: "0", criticalAlerts: 0 });
    });

    return () => { unsubAgents(); unsubLogs(); unsubMetrics(); };
  }, []);

  const addLog = async (agentName: string, action: string, isError = false) => {
    try {
      await addDoc(collection(db, "activity_logs"), {
        agent: agentName, action, isError, timestamp: new Date().toISOString()
      });
    } catch (e) {}
  };

  const toggleStatus = async (agent: any) => {
    try {
      const newStatus = agent.status === "online" ? "idle" : "online";
      await updateDoc(doc(db, "agents", agent.id), { status: newStatus });
      await addLog("Sistema", `Estado de ${agent.name} cambió a ${newStatus}`);
    } catch (error: any) { alert("Error: " + error.message); }
  };

  const deleteAgent = async (agent: any) => {
    if (confirm(`¿Eliminar definitivamente a ${agent.name}?`)) {
      try {
        await deleteDoc(doc(db, "agents", agent.id));
        await addLog("Sistema", `Agente ${agent.name} eliminado.`, true);
      } catch (error: any) { alert("Error: " + error.message); }
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentRole.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "agents"), {
        name: newAgentName, role: newAgentRole, status: "idle", latency: "-", tasks: 0,
        whatsappEnabled: false, tools: [], createdAt: new Date().toISOString()
      });
      await addLog("Sistema", `Nuevo agente registrado: ${newAgentName}`);
      setNewAgentName(""); setNewAgentRole(""); setShowAddModal(false);
    } catch (error: any) { alert("Error: " + error.message); } 
    finally { setIsSubmitting(false); }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "agents", editingAgent.id), {
        name: editingAgent.name,
        role: editingAgent.role,
        whatsappEnabled: editingAgent.whatsappEnabled || false,
        whatsappNumber: editingAgent.whatsappNumber || "",
        tools: editingAgent.tools || []
      });
      await addLog("Sistema", `Configuración de ${editingAgent.name} actualizada.`);
      setEditingAgent(null);
    } catch (error: any) { alert("Error: " + error.message); } 
    finally { setIsSubmitting(false); }
  };

  const handleToolToggle = (toolId: string) => {
    if (!editingAgent) return;
    const tools = editingAgent.tools || [];
    if (tools.includes(toolId)) {
      setEditingAgent({ ...editingAgent, tools: tools.filter((t: string) => t !== toolId) });
    } else {
      setEditingAgent({ ...editingAgent, tools: [...tools, toolId] });
    }
  };

  const activeAgentsCount = agents.filter(a => a.status === 'online').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Central</h1>
        <p className="text-muted-foreground mt-1">Gestión y control de agentes yunAi.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Agentes Activos" value={`${activeAgentsCount} / ${agents.length}`} trend="Sincronizado" icon={<Bot className="text-emerald-500" />} />
        <MetricCard title="Tareas Completadas" value={metrics.tasksCompleted?.toLocaleString() || "0"} trend="Desde Firebase" icon={<Activity className="text-blue-500" />} />
        <MetricCard title="Uso de Cómputo" value={metrics.computeTokens || "0"} trend="Tokens" icon={<Cpu className="text-purple-500" />} />
        <MetricCard title="Alertas Críticas" value={metrics.criticalAlerts?.toString() || "0"} trend="Estable" icon={<AlertCircle className={metrics.criticalAlerts > 0 ? "text-destructive" : "text-muted-foreground"} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Flota de Agentes</h2>
            <button onClick={() => setShowAddModal(true)} className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center gap-2">
              <Plus size={16} /> Agregar Agente
            </button>
          </div>
          <div className="border border-border bg-card rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Agente</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-center">Conexiones</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">No hay agentes.</td></tr>
                ) : (
                  agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.role}</div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={agent.status} /></td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {agent.whatsappEnabled && <span title="WhatsApp Conectado"><MessageCircle size={14} className="text-emerald-500" /></span>}
                          {agent.tools?.includes('google') && <div className="w-3.5 h-3.5 rounded-full bg-blue-500" title="Google Workspace"></div>}
                          {agent.tools?.includes('hubspot') && <div className="w-3.5 h-3.5 rounded-full bg-orange-500" title="HubSpot"></div>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => toggleStatus(agent)} className={`p-1.5 rounded-md transition-colors ${agent.status === "online" ? "text-emerald-500 hover:bg-secondary" : "text-muted-foreground hover:bg-secondary"}`}>
                            {agent.status === "online" ? <Square size={16} /> : <Play size={16} />}
                          </button>
                          <button onClick={() => { setEditingAgent({...agent}); setActiveTab("general"); }} className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-blue-400 transition-colors" title="Configurar">
                            <Settings2 size={16} />
                          </button>
                          <button onClick={() => deleteAgent(agent)} className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors" title="Eliminar">
                            <RefreshCcw size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Actividad Reciente</h2>
          <div className="border border-border bg-card rounded-lg p-4 space-y-4">
            {logs.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">No hay actividad.</div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center gap-1 mt-1">
                    <div className={`w-2 h-2 rounded-full ${log.isError ? 'bg-destructive' : 'bg-primary'}`}></div>
                    <div className="w-px h-full bg-border"></div>
                  </div>
                  <div className="pb-4">
                    <div className="text-xs text-muted-foreground font-mono">{new Date(log.timestamp).toLocaleTimeString()}</div>
                    <div className="font-medium text-foreground mt-0.5">{log.agent}</div>
                    <div className={`mt-0.5 ${log.isError ? 'text-destructive/90' : 'text-muted-foreground'}`}>{log.action}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg p-6 relative">
            <button onClick={() => setShowAddModal(false)} className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"><X size={20} /></button>
            <h3 className="text-xl font-semibold mb-4">Agregar Nuevo Agente</h3>
            <form onSubmit={handleAddAgent} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <input type="text" value={newAgentName} onChange={e => setNewAgentName(e.target.value)} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm mt-1" required />
              </div>
              <div>
                <label className="text-sm font-medium">Especialidad</label>
                <input type="text" value={newAgentRole} onChange={e => setNewAgentRole(e.target.value)} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm mt-1" required />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm hover:bg-secondary rounded-md">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit/Configure Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-2xl rounded-xl shadow-lg flex flex-col relative overflow-hidden h-[600px]">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/20">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Settings2 size={20} /> Configurar Agente: {editingAgent.name}</h3>
              <button onClick={() => setEditingAgent(null)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Sidebar Tabs */}
              <div className="w-48 border-r border-border bg-secondary/10 flex flex-col p-2 gap-1">
                <button onClick={() => setActiveTab("general")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors ${activeTab === 'general' ? 'bg-secondary text-foreground font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}>General</button>
                <button onClick={() => setActiveTab("whatsapp")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors flex items-center gap-2 ${activeTab === 'whatsapp' ? 'bg-secondary text-emerald-500 font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}><MessageCircle size={14} /> WhatsApp</button>
                <button onClick={() => setActiveTab("tools")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors flex items-center gap-2 ${activeTab === 'tools' ? 'bg-secondary text-blue-400 font-medium' : 'text-muted-foreground hover:bg-secondary/50'}`}><Wrench size={14} /> Integraciones</button>
              </div>

              {/* Content Area */}
              <div className="flex-1 p-6 overflow-y-auto">
                <form id="editForm" onSubmit={handleSaveEdit} className="space-y-6">
                  {activeTab === "general" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div>
                        <label className="text-sm font-medium">Nombre del Agente</label>
                        <input type="text" value={editingAgent.name} onChange={e => setEditingAgent({...editingAgent, name: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm mt-1" required />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Rol o Especialidad</label>
                        <input type="text" value={editingAgent.role} onChange={e => setEditingAgent({...editingAgent, role: e.target.value})} className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm mt-1" required />
                      </div>
                    </div>
                  )}

                  {activeTab === "whatsapp" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="flex items-center justify-between p-4 border border-emerald-500/20 bg-emerald-500/5 rounded-lg">
                        <div>
                          <h4 className="font-medium text-emerald-500 flex items-center gap-2"><MessageCircle size={18} /> Conexión WhatsApp</h4>
                          <p className="text-sm text-muted-foreground mt-1">Permite que este agente responda mensajes directamente en WhatsApp.</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" checked={editingAgent.whatsappEnabled || false} onChange={e => setEditingAgent({...editingAgent, whatsappEnabled: e.target.checked})} className="sr-only peer" />
                          <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                        </label>
                      </div>

                      {editingAgent.whatsappEnabled && (
                        <div className="space-y-4 p-4 border border-border rounded-lg bg-secondary/10">
                          <div>
                            <label className="text-sm font-medium">Número Autorizado (Propio o Cliente)</label>
                            <input type="text" value={editingAgent.whatsappNumber || ""} onChange={e => setEditingAgent({...editingAgent, whatsappNumber: e.target.value})} placeholder="+1829..." className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1 font-mono" />
                          </div>
                          <div className="bg-background p-3 rounded border border-border flex items-start gap-3">
                            <div className="mt-0.5"><AlertCircle size={16} className="text-blue-400" /></div>
                            <div className="text-xs text-muted-foreground">Para vincular la sesión, asegúrate de que el agente en WSL tenga el canal de WhatsApp activado en <code>openclaw.json</code> y escanea el código QR desde la terminal de tu servidor local.</div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "tools" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <p className="text-sm text-muted-foreground mb-4">Habilita herramientas externas para que el agente pueda ejecutar acciones en otras plataformas.</p>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${editingAgent.tools?.includes('google') ? 'border-blue-500/50 bg-blue-500/5' : 'border-border hover:bg-secondary/20'}`} onClick={() => handleToolToggle('google')}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-white p-1 flex items-center justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-full h-full" /></div>
                            <div>
                              <div className="font-medium text-sm">Google Workspace</div>
                              <div className="text-xs text-muted-foreground">Docs, Drive, y Calendar</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${editingAgent.tools?.includes('google') ? 'bg-blue-500 border-blue-500 text-white' : 'border-muted-foreground'}`}>
                            {editingAgent.tools?.includes('google') && <span className="text-[10px]">✓</span>}
                          </div>
                        </div>

                        <div className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${editingAgent.tools?.includes('hubspot') ? 'border-orange-500/50 bg-orange-500/5' : 'border-border hover:bg-secondary/20'}`} onClick={() => handleToolToggle('hubspot')}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-[#ff7a59] flex items-center justify-center text-white font-bold text-lg">H</div>
                            <div>
                              <div className="font-medium text-sm">HubSpot CRM</div>
                              <div className="text-xs text-muted-foreground">Contactos, Tickets y Deals</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${editingAgent.tools?.includes('hubspot') ? 'bg-orange-500 border-orange-500 text-white' : 'border-muted-foreground'}`}>
                            {editingAgent.tools?.includes('hubspot') && <span className="text-[10px]">✓</span>}
                          </div>
                        </div>

                        <div className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${editingAgent.tools?.includes('make') ? 'border-purple-500/50 bg-purple-500/5' : 'border-border hover:bg-secondary/20'}`} onClick={() => handleToolToggle('make')}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-[#1d0e3b] flex items-center justify-center text-white font-bold text-lg">m</div>
                            <div>
                              <div className="font-medium text-sm">Make.com (Integromat)</div>
                              <div className="text-xs text-muted-foreground">Ejecución de webhooks y flujos</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${editingAgent.tools?.includes('make') ? 'bg-purple-500 border-purple-500 text-white' : 'border-muted-foreground'}`}>
                            {editingAgent.tools?.includes('make') && <span className="text-[10px]">✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-card">
              <button type="button" onClick={() => setEditingAgent(null)} className="px-4 py-2 text-sm hover:bg-secondary rounded-md">Cancelar</button>
              <button type="submit" form="editForm" disabled={isSubmitting} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="border border-border bg-card rounded-lg p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between text-muted-foreground"><span className="text-sm font-medium">{title}</span>{icon}</div>
      <div><span className="text-3xl font-bold tracking-tight text-foreground">{value}</span></div>
      <span className="text-xs text-muted-foreground">{trend}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "online") return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>Online</span>;
  if (status === "idle") return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>Inactivo</span>;
  return <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>Error</span>;
}
