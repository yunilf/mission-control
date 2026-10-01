"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Bot, Activity, Terminal, Cpu, MemoryStick, Play, Square, Settings2, ShieldCheck, Clock, Plus } from "lucide-react";

export default function AgentsFleetPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("monitor");
  const [mockLogs, setMockLogs] = useState<string[]>([
    "[10:45:02] INFO: Iniciando subsistema OpenClaw...",
    "[10:45:03] INFO: Conectando a base de datos vectorial...",
    "[10:45:04] SUCCESS: Sincronización completada.",
    "[10:45:10] EVENT: Escuchando eventos entrantes..."
  ]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "agents"), (snapshot) => {
      const agentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(agentsList);
      if (agentsList.length > 0 && !selectedAgentId) {
        setSelectedAgentId(agentsList[0].id);
      }
    });
    return () => unsub();
  }, [selectedAgentId]);

  // Simular logs entrando en tiempo real
  useEffect(() => {
    if (activeTab === "terminal" && selectedAgentId) {
      const interval = setInterval(() => {
        setMockLogs(prev => {
          const newLogs = [...prev, `[${new Date().toLocaleTimeString()}] DEBUG: Procesando heartbeat del nodo local...`];
          return newLogs.slice(-15); // Mantener solo los últimos 15
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedAgentId]);

  const toggleStatus = async (agent: any) => {
    try {
      const newStatus = agent.status === "online" ? "idle" : "online";
      await updateDoc(doc(db, "agents", agent.id), { status: newStatus });
    } catch (e) {
      console.error(e);
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agentes</h1>
          <p className="text-muted-foreground mt-1 text-sm">Monitoreo avanzado, rendimiento de hardware y logs en tiempo real por agente.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-add-agent'))} 
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:opacity-90 transition-opacity shadow-sm whitespace-nowrap"
          >
            <Plus size={18} /> Agregar Agente
          </button>
          
          {/* Dropdown de Agentes */}
          <div className="w-full sm:w-72 relative">
            <select 
              value={selectedAgentId || ""} 
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full bg-card border border-border rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground appearance-none cursor-pointer"
            >
              <option value="" disabled>Selecciona un agente...</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.status === 'online' ? '🟢' : '⚪'} {agent.name} ({agent.role})
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
        
        {/* Agent Details Full Width */}
        {selectedAgent ? (
          <div className="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-border flex items-start justify-between bg-gradient-to-r from-secondary/20 to-transparent">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center border ${selectedAgent.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-secondary border-border text-muted-foreground'}`}>
                  <Bot size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1 text-sm">
                    <span className="text-muted-foreground">{selectedAgent.role}</span>
                    <span className="hidden sm:block text-muted-foreground border-l border-border h-4"></span>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <ShieldCheck size={14} className="text-blue-500" />
                      ID: {selectedAgent.id.substring(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(selectedAgent)}
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    selectedAgent.status === 'online' 
                      ? "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20" 
                      : "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20"
                  }`}
                >
                  {selectedAgent.status === 'online' ? <><Square size={14}/> Pausar Nodo</> : <><Play size={14}/> Activar Nodo</>}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 border-b border-border bg-background overflow-x-auto">
              <button onClick={() => setActiveTab('monitor')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'monitor' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Monitor de Rendimiento
              </button>
              <button onClick={() => setActiveTab('terminal')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'terminal' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Terminal en vivo
              </button>
              <button onClick={() => setActiveTab('config')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'config' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Resumen de Configuración
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-background">
              
              {activeTab === 'monitor' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">Uso de CPU <Cpu size={14}/></div>
                      <div className="text-2xl font-bold font-mono text-primary">{(Math.random() * 5 + 1).toFixed(1)}%</div>
                      <div className="text-[10px] text-muted-foreground mt-2">Carga estable en WSL2</div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">VRAM Local <MemoryStick size={14}/></div>
                      <div className="text-2xl font-bold font-mono text-blue-500">12.4 GB</div>
                      <div className="text-[10px] text-muted-foreground mt-2">de 24 GB disponibles (RTX 4090)</div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">Uptime <Clock size={14}/></div>
                      <div className="text-2xl font-bold font-mono text-emerald-500">14h 22m</div>
                      <div className="text-[10px] text-muted-foreground mt-2">Desde el último reinicio del proceso</div>
                    </div>
                  </div>

                  {/* Mock Charts */}
                  <div className="bg-card border border-border rounded-lg p-5">
                    <h3 className="text-sm font-semibold mb-4">Latencia de Inferencia (Últimos 30m)</h3>
                    <div className="h-48 flex items-end gap-1 opacity-80">
                      {[...Array(40)].map((_, i) => {
                        const height = Math.random() * 60 + 10;
                        const isHigh = height > 60;
                        return (
                          <div 
                            key={i} 
                            className={`flex-1 rounded-t-sm ${isHigh ? 'bg-orange-500' : 'bg-primary/50'} hover:bg-primary transition-colors cursor-crosshair relative group`}
                            style={{ height: `${height}%` }}
                          >
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                              {Math.floor(height * 4)}ms
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] text-muted-foreground font-mono">
                      <span>Hace 30m</span>
                      <span>Ahora</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'terminal' && (
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex gap-2">
                      <span className="w-3 h-3 rounded-full bg-red-500"></span>
                      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground">WSL: ubuntu@openclaw-node</span>
                  </div>
                  <div className="flex-1 bg-[#0b0f19] rounded-lg p-4 font-mono text-xs overflow-y-auto border border-border shadow-inner min-h-[300px]">
                    {mockLogs.map((log, i) => {
                      let color = "text-zinc-300";
                      if (log.includes("INFO")) color = "text-blue-400";
                      if (log.includes("SUCCESS")) color = "text-emerald-400";
                      if (log.includes("ERROR")) color = "text-red-400";
                      if (log.includes("DEBUG")) color = "text-zinc-500";
                      return (
                        <div key={i} className={`${color} mb-1 leading-relaxed`}>{log}</div>
                      );
                    })}
                    {selectedAgent.status === 'online' && (
                      <div className="flex items-center mt-2 text-zinc-500">
                        <span className="animate-pulse">_</span>
                      </div>
                    )}
                    {selectedAgent.status !== 'online' && (
                      <div className="mt-4 text-zinc-500 italic">El proceso del agente está pausado. No hay nuevos logs.</div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'config' && (
                <div className="space-y-6">
                  <div className="bg-secondary/20 border border-border rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">Integraciones Activas</h4>
                      <button onClick={() => window.dispatchEvent(new CustomEvent('open-edit-agent', {detail: selectedAgent}))} className="text-xs text-primary hover:underline flex items-center gap-1">
                        <Settings2 size={12}/> Editar
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.whatsappEnabled && <span className="px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 rounded text-xs font-medium">WhatsApp (Baileys)</span>}
                      {selectedAgent.telegramEnabled && <span className="px-2 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded text-xs font-medium">Telegram</span>}
                      {selectedAgent.tools?.map((tool: string) => (
                        <span key={tool} className="px-2 py-1 bg-secondary text-foreground border border-border rounded text-xs font-medium capitalize">{tool}</span>
                      ))}
                      {!selectedAgent.whatsappEnabled && !selectedAgent.telegramEnabled && (!selectedAgent.tools || selectedAgent.tools.length === 0) && (
                        <span className="text-sm text-muted-foreground italic">Este agente no tiene canales ni herramientas activas.</span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Previsualización de Identity</h4>
                      <div className="bg-secondary/10 border border-border rounded-lg p-4 h-48 overflow-y-auto text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                        {selectedAgent.identity || "No hay instrucciones de identidad configuradas."}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2">Previsualización de Soul</h4>
                      <div className="bg-secondary/10 border border-border rounded-lg p-4 h-48 overflow-y-auto text-xs text-muted-foreground font-mono whitespace-pre-wrap">
                        {selectedAgent.soul || "No hay instrucciones de soul configuradas."}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        ) : (
          <div className="flex-1 bg-card border border-border rounded-xl shadow-sm flex flex-col items-center justify-center text-muted-foreground p-6">
            <Bot size={48} className="mb-4 opacity-20" />
            <h3 className="text-lg font-medium">Ningún agente seleccionado</h3>
            <p className="text-sm text-center max-w-sm mt-2">Selecciona un agente de la lista en el panel superior para ver sus métricas de rendimiento y logs en tiempo real.</p>
          </div>
        )}
      </div>
    </div>
  );
}
