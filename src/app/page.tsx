"use client";

import { Activity, Bot, Cpu, Plus, Settings2, Play, Square, ActivitySquare, Server, MessageSquare, AlertCircle, FileText, Blocks } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [agents, setAgents] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({ tasksCompleted: 0, computeTokens: "0", criticalAlerts: 0 });
  const [logs, setLogs] = useState<any[]>([]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [pairingCode, setPairingCode] = useState("");
  
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentRole, setNewAgentRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const unsubAgents = onSnapshot(collection(db, "agents"), (snapshot) => {
      setAgents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    const unsubMetrics = onSnapshot(doc(db, "metrics", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setMetrics(docSnap.data());
      }
    });

    return () => { unsubAgents(); unsubMetrics(); };
  }, []);

  const addLog = async (agentName: string, action: string, isError = false) => {
    try {
      await addDoc(collection(db, "activity_logs"), {
        agent: agentName, action, isError, timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStatus = async (agent: any) => {
    try {
      const newStatus = agent.status === "online" ? "idle" : "online";
      await updateDoc(doc(db, "agents", agent.id), { status: newStatus });
      await addLog("Sistema", `Estado de ${agent.name} cambió a ${newStatus}`);
    } catch (error: any) {
      alert("Error: " + error.message);
    }
  };

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentRole.trim()) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "agents"), {
        name: newAgentName,
        role: newAgentRole,
        status: "idle",
        latency: "-",
        tasks: 0,
        whatsappEnabled: false,
        tools: [],
        createdAt: new Date().toISOString(),
        clientId: ""
      });
      await addLog("Sistema", `Nuevo agente registrado: ${newAgentName}`);
      setNewAgentName("");
      setNewAgentRole("");
      setShowAddModal(false);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgent) return;
    setIsSubmitting(true);
    try {
      await updateDoc(doc(db, "agents", editingAgent.id), {
        name: editingAgent.name,
        role: editingAgent.role,
        clientId: editingAgent.clientId || "",
        whatsappEnabled: editingAgent.whatsappEnabled || false,
        whatsappNumber: editingAgent.whatsappNumber || "",
        telegramEnabled: editingAgent.telegramEnabled || false,
        identity: editingAgent.identity || "",
        soul: editingAgent.soul || "",
        tools: editingAgent.tools || []
      });
      await addLog("Sistema", `Configuración de ${editingAgent.name} actualizada.`);
      setEditingAgent(null);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground mt-1 text-sm">Resumen de operaciones y estado del enjambre (Swarm Status).</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md font-medium text-sm hover:opacity-90 transition-opacity shadow-sm">
            <Plus size={18} /> Agregar Agente
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard title="Agentes Activos" value={`${activeAgentsCount} / ${agents.length || 0}`} trend="Flota de agentes desplegada" icon={<Bot size={20} />} />
        <MetricCard title="Tareas Exitosas" value={metrics.tasksCompleted?.toLocaleString() || "0"} trend="Total en todos los clientes" icon={<ActivitySquare size={20} />} />
        <MetricCard title="Tokens Consumidos" value={metrics.computeTokens || "0"} trend="Cuota mensual de cómputo" icon={<Cpu size={20} />} />
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden mt-6">
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Flota de Agentes</h2>
            <p className="text-sm text-muted-foreground">Monitorización en tiempo real de los agentes configurados en WSL.</p>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-secondary/30 text-muted-foreground border-b border-border">
                <th className="py-3 px-6 font-medium">Agente & Rol</th>
                <th className="py-3 px-6 font-medium">Cliente</th>
                <th className="py-3 px-6 font-medium">Estado</th>
                <th className="py-3 px-6 font-medium text-right">Latencia</th>
                <th className="py-3 px-6 font-medium text-right">Tareas</th>
                <th className="py-3 px-6 font-medium text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                        <Bot size={16} />
                      </div>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-sm text-muted-foreground">
                    {agent.clientId === "cliente1_colmadi" && "Colmadi"}
                    {agent.clientId === "cliente2_barrita" && "La Barrita"}
                    {agent.clientId === "cliente3_megachica" && "Megachica"}
                    {agent.clientId === "agencia_interna" && "Agencia Interna"}
                    {!agent.clientId && "Sin asignar"}
                  </td>
                  <td className="py-3 px-6">
                    <StatusBadge status={agent.status} />
                  </td>
                  <td className="py-3 px-6 text-right font-mono text-xs">
                    {agent.latency || "0ms"}
                  </td>
                  <td className="py-3 px-6 text-right font-mono text-xs">
                    {agent.tasks || 0}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => { setEditingAgent(agent); setActiveTab('general'); }} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-secondary rounded transition-colors" title="Configurar Agente">
                        <Settings2 size={16} />
                      </button>
                      <button onClick={() => toggleStatus(agent)} className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded transition-colors" title="Pausar/Reanudar">
                        {agent.status === 'online' ? <Square size={16} /> : <Play size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    No hay agentes registrados. Haz clic en "Agregar Agente" para comenzar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg p-6 animate-in fade-in zoom-in-95 duration-200">
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
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm hover:bg-secondary rounded-md">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50">
                  {isSubmitting ? "Guardando..." : "Guardar Agente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-3xl rounded-xl shadow-lg flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Settings2 size={20} className="text-primary" /> Configurar Agente: {editingAgent.name}</h3>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              <div className="w-48 border-r border-border bg-secondary/10 p-3 flex flex-col gap-1">
                <button onClick={() => setActiveTab("general")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium ${activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}>General</button>
                <button onClick={() => setActiveTab("instrucciones")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium ${activeTab === 'instrucciones' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}>Instrucciones</button>
                <button onClick={() => setActiveTab("canales")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium ${activeTab === 'canales' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}>Canales</button>
                <button onClick={() => setActiveTab("tools")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium ${activeTab === 'tools' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}>Integraciones</button>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <form id="editForm" className="space-y-6">
                  
                  {activeTab === "general" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div>
                        <label className="text-sm font-medium">Nombre del Agente</label>
                        <input type="text" value={editingAgent.name} onChange={e => setEditingAgent({...editingAgent, name: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Rol o Especialidad</label>
                        <input type="text" value={editingAgent.role} onChange={e => setEditingAgent({...editingAgent, role: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Cliente Asignado</label>
                        <select value={editingAgent.clientId || ""} onChange={e => setEditingAgent({...editingAgent, clientId: e.target.value})} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm mt-1">
                          <option value="">-- Sin asignar --</option>
                          <option value="cliente1_colmadi">Colmadi</option>
                          <option value="cliente2_barrita">La Barrita</option>
                          <option value="cliente3_megachica">Megachica</option>
                          <option value="agencia_interna">Agencia Interna</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {activeTab === "instrucciones" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 p-3 rounded-md text-xs">
                        Modificar estas instrucciones sincronizará automáticamente los archivos <code>soul.md</code> e <code>identity.md</code> en el directorio local del agente en WSL.
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium flex items-center justify-between mb-1">
                          <span>Identity.md</span>
                          <span className="text-xs text-muted-foreground font-normal">Personalidad y tono general</span>
                        </label>
                        <textarea 
                          value={editingAgent.identity || ""} 
                          onChange={e => setEditingAgent({...editingAgent, identity: e.target.value})} 
                          placeholder="Eres un agente de soporte amigable..." 
                          className="w-full h-32 bg-background border border-border rounded-md px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:border-primary" 
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium flex items-center justify-between mb-1">
                          <span>Soul.md</span>
                          <span className="text-xs text-muted-foreground font-normal">Instrucciones centrales y flujos</span>
                        </label>
                        <textarea 
                          value={editingAgent.soul || ""} 
                          onChange={e => setEditingAgent({...editingAgent, soul: e.target.value})} 
                          placeholder="Reglas estrictas:\n1. Nunca ofrezcas descuentos.\n2. Si piden factura, solicita el RNC..." 
                          className="w-full h-56 bg-background border border-border rounded-md px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:border-primary" 
                        />
                      </div>
                    </div>
                  )}

                  {activeTab === "canales" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <p className="text-sm text-muted-foreground mb-4">Vincular agente con canales de mensajería externos.</p>
                      
                      {/* WhatsApp Channel */}
                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="p-4 bg-secondary/10 flex items-center justify-between border-b border-border">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="text-emerald-500" size={20} />
                            <div>
                              <div className="font-medium text-sm">WhatsApp (Baileys)</div>
                              <div className="text-xs text-muted-foreground">Conexión vía Pairing Code de OpenClaw</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={editingAgent.whatsappEnabled || false} onChange={e => setEditingAgent({...editingAgent, whatsappEnabled: e.target.checked})} />
                            <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          </label>
                        </div>

                        {editingAgent.whatsappEnabled && (
                          <div className="p-4 space-y-4">
                            <div>
                              <label className="text-xs font-medium">Número de WhatsApp (Incluir código de país, sin +)</label>
                              <div className="flex gap-2 mt-1">
                                <input type="text" value={editingAgent.whatsappNumber || ""} onChange={e => setEditingAgent({...editingAgent, whatsappNumber: e.target.value})} placeholder="18291234567" className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm font-mono" />
                                <button type="button" onClick={() => {
                                  setPairingCode("W7X9-B2M4");
                                }} className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-md hover:bg-emerald-600 transition-colors">
                                  Generar Pairing Code
                                </button>
                              </div>
                            </div>
                            
                            {pairingCode && (
                              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-center">
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mb-2 font-medium">Ingresa este código en tu WhatsApp vinculado:</p>
                                <div className="text-3xl font-black font-mono tracking-[0.2em] text-emerald-500">{pairingCode}</div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Telegram Channel */}
                      <div className="border border-border rounded-lg overflow-hidden">
                        <div className="p-4 bg-secondary/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <MessageSquare className="text-blue-500" size={20} />
                            <div>
                              <div className="font-medium text-sm">Telegram Bot</div>
                              <div className="text-xs text-muted-foreground">Conexión vía Bot Token</div>
                            </div>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={editingAgent.telegramEnabled || false} onChange={e => setEditingAgent({...editingAgent, telegramEnabled: e.target.checked})} />
                            <div className="w-11 h-6 bg-secondary rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "tools" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                      <p className="text-sm text-muted-foreground mb-4">Habilita herramientas externas (Plugins) para que el agente ejecute acciones.</p>
                      
                      <div className="grid grid-cols-1 gap-3">
                        <div className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${editingAgent.tools?.includes('google') ? 'border-blue-500/50 bg-blue-500/5' : 'border-border hover:bg-secondary/20'}`} onClick={() => handleToolToggle('google')}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-white p-1 flex items-center justify-center"><img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-full h-full" /></div>
                            <div>
                              <div className="font-medium text-sm">Ecosistema Google</div>
                              <div className="text-xs text-muted-foreground">Calendar, Drive y Docs</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${editingAgent.tools?.includes('google') ? 'bg-blue-500 border-blue-500 text-white' : 'border-muted-foreground'}`}>
                            {editingAgent.tools?.includes('google') && <span className="text-[10px]">✓</span>}
                          </div>
                        </div>

                        <div className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${editingAgent.tools?.includes('wordpress') ? 'border-blue-400/50 bg-blue-400/5' : 'border-border hover:bg-secondary/20'}`} onClick={() => handleToolToggle('wordpress')}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-[#21759b] flex items-center justify-center text-white font-bold text-lg">W</div>
                            <div>
                              <div className="font-medium text-sm">WordPress</div>
                              <div className="text-xs text-muted-foreground">Gestión de posts, páginas y usuarios</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${editingAgent.tools?.includes('wordpress') ? 'bg-[#21759b] border-[#21759b] text-white' : 'border-muted-foreground'}`}>
                            {editingAgent.tools?.includes('wordpress') && <span className="text-[10px]">✓</span>}
                          </div>
                        </div>

                        <div className={`p-4 border rounded-lg flex items-center justify-between cursor-pointer transition-colors ${editingAgent.tools?.includes('woocommerce') ? 'border-purple-600/50 bg-purple-600/5' : 'border-border hover:bg-secondary/20'}`} onClick={() => handleToolToggle('woocommerce')}>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-md bg-[#96588a] flex items-center justify-center text-white font-bold text-lg">Woo</div>
                            <div>
                              <div className="font-medium text-sm">WooCommerce</div>
                              <div className="text-xs text-muted-foreground">Gestión de inventario, pedidos y cupones</div>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${editingAgent.tools?.includes('woocommerce') ? 'bg-[#96588a] border-[#96588a] text-white' : 'border-muted-foreground'}`}>
                            {editingAgent.tools?.includes('woocommerce') && <span className="text-[10px]">✓</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="px-6 py-4 border-t border-border flex justify-end gap-3 bg-card">
              <button type="button" onClick={() => { setEditingAgent(null); setPairingCode(""); }} className="px-4 py-2 text-sm hover:bg-secondary rounded-md">Cancelar</button>
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
    <div className="border border-border bg-card rounded-lg p-5 flex flex-col gap-2 shadow-sm hover:border-primary/50 transition-colors">
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
