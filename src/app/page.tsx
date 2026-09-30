"use client";

import { Activity, Bot, Cpu, AlertCircle, Play, Square, RefreshCcw, X, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [agents, setAgents] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({ 
    tasksCompleted: 0, 
    computeTokens: "0", 
    criticalAlerts: 0 
  });

  // Estado para el modal de agregar agente
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentRole, setNewAgentRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // 1. Suscribirse a la colección 'agents'
    const unsubAgents = onSnapshot(collection(db, "agents"), (snapshot) => {
      const agentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(agentsData);
    });

    // 2. Suscribirse a 'activity_logs' (últimos 5)
    const qLogs = query(collection(db, "activity_logs"), orderBy("timestamp", "desc"), limit(5));
    const unsubLogs = onSnapshot(qLogs, (snapshot) => {
      setLogs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 3. Suscribirse a 'metrics/global'
    const unsubMetrics = onSnapshot(doc(db, "metrics", "global"), (docSnap) => {
      if (docSnap.exists()) {
        setMetrics(docSnap.data());
      } else {
        setMetrics({ tasksCompleted: 0, computeTokens: "0", criticalAlerts: 0 });
      }
    });

    return () => {
      unsubAgents();
      unsubLogs();
      unsubMetrics();
    };
  }, []);

  const addLog = async (agentName: string, action: string, isError = false) => {
    try {
      await addDoc(collection(db, "activity_logs"), {
        agent: agentName,
        action,
        isError,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving log:", error);
    }
  };

  const toggleStatus = async (agent: any) => {
    try {
      const newStatus = agent.status === "online" ? "idle" : "online";
      await updateDoc(doc(db, "agents", agent.id), { status: newStatus });
      await addLog("Sistema", `Cambió el estado de ${agent.name} a ${newStatus.toUpperCase()}`);
    } catch (error: any) {
      alert("Error de Firebase: " + error.message);
    }
  };

  const deleteAgent = async (agent: any) => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${agent.name}?`)) {
      try {
        await deleteDoc(doc(db, "agents", agent.id));
        await addLog("Sistema", `Agente ${agent.name} fue dado de baja.`, true);
      } catch (error: any) {
        alert("Error de Firebase: " + error.message);
      }
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
        createdAt: new Date().toISOString()
      });

      await addLog("Sistema", `Nuevo agente registrado: ${newAgentName}`);
      
      // Limpiar y cerrar modal
      setNewAgentName("");
      setNewAgentRole("");
      setShowAddModal(false);
    } catch (error: any) {
      alert("Error al guardar en Firestore: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeAgentsCount = agents.filter(a => a.status === 'online').length;

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 60000);
    if (diff < 1) return "Justo ahora";
    if (diff < 60) return `Hace ${diff} min`;
    const hours = Math.floor(diff / 60);
    return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 relative">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Central</h1>
        <p className="text-muted-foreground mt-1">Resumen en tiempo real conectado 100% a Firebase.</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard 
          title="Agentes Activos" 
          value={`${activeAgentsCount} / ${agents.length}`} 
          trend="Sincronizado en vivo" 
          icon={<Bot className="text-emerald-500" />} 
        />
        <MetricCard 
          title="Tareas Completadas" 
          value={metrics.tasksCompleted?.toLocaleString() || "0"} 
          trend="Desde Firebase" 
          icon={<Activity className="text-blue-500" />} 
        />
        <MetricCard 
          title="Uso de Cómputo" 
          value={metrics.computeTokens || "0"} 
          trend="Tokens procesados" 
          icon={<Cpu className="text-purple-500" />} 
        />
        <MetricCard 
          title="Alertas Críticas" 
          value={metrics.criticalAlerts?.toString() || "0"} 
          trend={metrics.criticalAlerts > 0 ? "Atención requerida" : "Sistema estable"} 
          icon={<AlertCircle className={metrics.criticalAlerts > 0 ? "text-destructive" : "text-muted-foreground"} />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agents Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Flota de Agentes</h2>
            <button 
              onClick={() => setShowAddModal(true)}
              className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
            >
              <Plus size={16} />
              Agregar Agente
            </button>
          </div>
          <div className="border border-border bg-card rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Agente</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Estado</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Latencia</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-right">Tareas</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {agents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      No hay agentes desplegados en Firebase. Haz clic en "Agregar Agente" para vincular uno nuevo.
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">{agent.name}</div>
                        <div className="text-xs text-muted-foreground">{agent.role}</div>
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={agent.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                        {agent.latency || "-"}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">
                        {agent.tasks || 0}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {agent.status === "online" ? (
                            <button 
                              onClick={() => toggleStatus(agent)}
                              className="p-1.5 rounded-md text-emerald-500 hover:bg-secondary hover:text-emerald-400 transition-colors" 
                              title="Pausar"
                            >
                              <Square size={16} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => toggleStatus(agent)}
                              className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" 
                              title="Iniciar"
                            >
                              <Play size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteAgent(agent)}
                            className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors" 
                            title="Eliminar"
                          >
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

        {/* Activity Feed */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold tracking-tight">Actividad Reciente</h2>
          <div className="border border-border bg-card rounded-lg p-4 space-y-4">
            {logs.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-4">No hay actividad reciente.</div>
            ) : (
              logs.map((log) => (
                <ActivityItem 
                  key={log.id}
                  time={formatTime(log.timestamp)} 
                  agent={log.agent} 
                  action={log.action} 
                  isError={log.isError}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Agent Modal Overlay */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-lg p-6 relative">
            <button 
              onClick={() => setShowAddModal(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-semibold mb-1">Agregar Nuevo Agente</h3>
            <p className="text-sm text-muted-foreground mb-6">Ingresa los detalles del agente que ya tienes creado para vincularlo al panel.</p>
            
            <form onSubmit={handleAddAgent} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nombre del Agente</label>
                <input 
                  type="text" 
                  value={newAgentName}
                  onChange={e => setNewAgentName(e.target.value)}
                  placeholder="ej. Asistente de Ventas" 
                  className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Rol o Especialidad</label>
                <input 
                  type="text" 
                  value={newAgentRole}
                  onChange={e => setNewAgentRole(e.target.value)}
                  placeholder="ej. Atención al Cliente, Extracción de Datos" 
                  className="w-full bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Agregando..." : "Agregar Agente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) {
  return (
    <div className="border border-border bg-card rounded-lg p-5 flex flex-col gap-2 shadow-sm">
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-sm font-medium">{title}</span>
        {icon}
      </div>
      <div>
        <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
      </div>
      <span className="text-xs text-muted-foreground">{trend}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "online") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Online
      </span>
    );
  }
  if (status === "idle") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span>
        Inactivo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
      Error
    </span>
  );
}

function ActivityItem({ time, agent, action, isError }: { time: string, agent: string, action: string, isError?: boolean }) {
  return (
    <div className="flex gap-3 text-sm">
      <div className="flex flex-col items-center gap-1 mt-1">
        <div className={`w-2 h-2 rounded-full ${isError ? 'bg-destructive' : 'bg-primary'}`}></div>
        <div className="w-px h-full bg-border"></div>
      </div>
      <div className="pb-4">
        <div className="text-xs text-muted-foreground font-mono">{time}</div>
        <div className="font-medium text-foreground mt-0.5">{agent}</div>
        <div className={`mt-0.5 ${isError ? 'text-destructive/90' : 'text-muted-foreground'}`}>{action}</div>
      </div>
    </div>
  );
}
