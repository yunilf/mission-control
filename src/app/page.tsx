"use client";

import { Activity, Bot, Cpu, AlertCircle, Play, Square, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function Dashboard() {
  const [agents, setAgents] = useState<any[]>([]);

  useEffect(() => {
    // Suscribirse a la colección 'agents' en tiempo real
    const unsubscribe = onSnapshot(collection(db, "agents"), (snapshot) => {
      const agentsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(agentsData);
    });

    return () => unsubscribe();
  }, []);

  const toggleStatus = async (agentId: string, currentStatus: string) => {
    const newStatus = currentStatus === "online" ? "idle" : "online";
    await updateDoc(doc(db, "agents", agentId), { status: newStatus });
  };

  const deleteAgent = async (agentId: string) => {
    if (confirm("¿Estás seguro de que deseas eliminar este agente?")) {
      await deleteDoc(doc(db, "agents", agentId));
    }
  };

  const deployFakeAgent = async () => {
    const roles = ["Ventas B2B", "Atención al Cliente", "Investigación web", "Extracción de datos", "Asistente Legal", "Data Analyst"];
    const names = ["yunAi Sales", "yunAi Support", "yunAi Researcher", "yunAi Scraper", "yunAi Legal", "yunAi Analytics"];
    const randomIndex = Math.floor(Math.random() * roles.length);
    
    await addDoc(collection(db, "agents"), {
      name: names[randomIndex] + " #" + Math.floor(Math.random() * 1000),
      role: roles[randomIndex],
      status: "idle",
      latency: Math.floor(Math.random() * 300 + 50) + "ms",
      tasks: 0,
      createdAt: new Date().toISOString()
    });
  };

  const activeAgentsCount = agents.filter(a => a.status === 'online').length;

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Central</h1>
        <p className="text-muted-foreground mt-1">Resumen en tiempo real de la flota de agentes yunAi conectada a Firebase.</p>
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
          title="Tareas Completadas (Hoy)" 
          value="2,491" 
          trend="+14% vs ayer" 
          icon={<Activity className="text-blue-500" />} 
        />
        <MetricCard 
          title="Uso de Cómputo (Tokens)" 
          value="1.2M" 
          trend="42% del presupuesto mensual" 
          icon={<Cpu className="text-purple-500" />} 
        />
        <MetricCard 
          title="Alertas Críticas" 
          value="0" 
          trend="Sistema estable" 
          icon={<AlertCircle className="text-muted-foreground" />} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Agents Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight">Flota de Agentes</h2>
            <button 
              onClick={deployFakeAgent}
              className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
            >
              <Bot size={16} />
              Desplegar Nuevo
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
                      No hay agentes desplegados. Haz clic en "Desplegar Nuevo" para crear uno en la base de datos.
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
                              onClick={() => toggleStatus(agent.id, agent.status)}
                              className="p-1.5 rounded-md text-emerald-500 hover:bg-secondary hover:text-emerald-400 transition-colors" 
                              title="Pausar"
                            >
                              <Square size={16} />
                            </button>
                          ) : (
                            <button 
                              onClick={() => toggleStatus(agent.id, agent.status)}
                              className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" 
                              title="Iniciar"
                            >
                              <Play size={16} />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteAgent(agent.id)}
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
            <ActivityItem 
              time="Ahora" 
              agent="Sistema" 
              action="Conexión en tiempo real con Firestore establecida." 
            />
            <ActivityItem 
              time="Hace 2 min" 
              agent="yunAi Sales" 
              action="Cerró ticket #142 de HubSpot." 
            />
            <ActivityItem 
              time="Hace 5 min" 
              agent="yunAi Support" 
              action="Respondió a consulta de cliente en web chat." 
            />
          </div>
        </div>
      </div>
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
