"use client";

import { useState, useEffect } from "react";
import { collection, onSnapshot, doc, updateDoc, setDoc } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { Bot, Activity, Terminal, Cpu, MemoryStick, Play, Square, Settings2, ShieldCheck, Clock, Plus, Power, Sparkles, X, User, FileText, Blocks, MessageSquare, Trash } from "lucide-react";

export default function AgentsFleetPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("monitor");
  const [showSubagentModal, setShowSubagentModal] = useState(false);
  const [newSubagentName, setNewSubagentName] = useState('');
  const [newSubagentMission, setNewSubagentMission] = useState('');
  const [newSubagentModel, setNewSubagentModel] = useState('google/gemini-2.5-flash');
  const [editingSubagentIndex, setEditingSubagentIndex] = useState<number | null>(null);
  const [dutiesList, setDutiesList] = useState<string[]>([]);
  const [isEditingDuties, setIsEditingDuties] = useState(false);
  const [isCustomMission, setIsCustomMission] = useState(false);
  const [newDutyTemp, setNewDutyTemp] = useState('');

  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [customIdentityFields, setCustomIdentityFields] = useState({ role: false, tone: false, audience: false, greeting: false });
  const [customSoulFields, setCustomSoulFields] = useState({ objective: false, pricing: false, handoff: false, style: false });
  const [isUploadingKnowledge, setIsUploadingKnowledge] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSavingSubagent, setIsSavingSubagent] = useState(false);
  const [pairingCode, setPairingCode] = useState("");

  const [mockLogs, setMockLogs] = useState<string[]>([
    "[10:45:02] INFO: Iniciando subsistema OpenClaw...",
    "[10:45:03] INFO: Conectando a base de datos vectorial...",
    "[10:45:04] SUCCESS: Sincronización completada.",
    "[10:45:10] EVENT: Escuchando eventos entrantes..."
  ]);

  
  useEffect(() => {
    const unsubDuties = onSnapshot(doc(db, "settings", "duties"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list) {
        setDutiesList(docSnap.data().list);
      } else {
        setDutiesList([
          "Investigador de internet",
          "Generador de código",
          "Analista de datos",
          "Soporte técnico"
        ]);
      }
    });
    return () => unsubDuties();
  }, []);

  const handleAddDuty = async () => {
    if (!newDutyTemp.trim()) return;
    const newList = [...dutiesList, newDutyTemp.trim()];
    setDutiesList(newList);
    setNewDutyTemp('');
    try {
      await setDoc(doc(db, "settings", "duties"), { list: newList });
    } catch(e) {
      console.error(e);
    }
  };

  const handleRemoveDuty = async (index: number) => {
    const newList = dutiesList.filter((_, i) => i !== index);
    setDutiesList(newList);
    try {
      await setDoc(doc(db, "settings", "duties"), { list: newList });
    } catch(e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const unsubAgents = onSnapshot(collection(db, "agents"), (snapshot) => {
      const agentsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(agentsList);
      if (agentsList.length > 0 && !selectedAgentId) {
        setSelectedAgentId(agentsList[0].id);
      }
    });
    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubAgents(); unsubClients(); };
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

  const handleToolToggle = (toolId: string) => {
    if (!editingAgent) return;
    const currentTools = editingAgent.tools || [];
    const newTools = currentTools.includes(toolId) 
      ? currentTools.filter((t: string) => t !== toolId)
      : [...currentTools, toolId];
    setEditingAgent({ ...editingAgent, tools: newTools });
  };

  const handleSaveSubagent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgent || !newSubagentName.trim() || !newSubagentMission.trim()) return;
    setIsSavingSubagent(true);
    try {
      const currentSubagents = selectedAgent.subagents || [];
      let updatedSubagents;
      
      const subagentData = {
        name: newSubagentName.toLowerCase().replace(/\s+/g, '_'),
        mission: newSubagentMission,
        model: newSubagentModel
      };

      if (editingSubagentIndex !== null) {
        updatedSubagents = [...currentSubagents];
        updatedSubagents[editingSubagentIndex] = subagentData;
      } else {
        updatedSubagents = [...currentSubagents, subagentData];
      }

      await updateDoc(doc(db, "agents", selectedAgent.id), {
        subagents: updatedSubagents
      });
      setShowSubagentModal(false);
      setNewSubagentName('');
      setNewSubagentMission('');
      setNewSubagentModel('google/gemini-2.5-flash');
      setEditingSubagentIndex(null);
      setIsCustomMission(false);
      setIsEditingDuties(false);
    } catch (error: any) {
      alert("Error saving subagent: " + error.message);
    } finally {
      setIsSavingSubagent(false);
    }
  };

  const handleModelChange = async (agentId: string, model: string) => {
    try {
      await updateDoc(doc(db, "agents", agentId), { aiModel: model });
    } catch (e) {
      console.error(e);
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);
  
  useEffect(() => {
    if (selectedAgent && (!editingAgent || editingAgent.id !== selectedAgent.id)) {
      setEditingAgent(selectedAgent);
    }
  }, [selectedAgent]);

    useEffect(() => {
    if (!selectedAgent || !editingAgent) return;
    if (editingAgent.id !== selectedAgent.id) return;
    
    const keys = new Set([...Object.keys(editingAgent), ...Object.keys(selectedAgent)]);
    let different = false;
    for (let k of Array.from(keys)) {
        // Ignorar campos que firebase agrega u ordena raro
        if (JSON.stringify(editingAgent[k]) !== JSON.stringify(selectedAgent[k])) {
            different = true;
            break;
        }
    }
    setHasChanges(different);
  }, [editingAgent, selectedAgent]);

  const ROLE_OPTIONS = ["Asistente de Ventas", "Soporte Técnico", "Recepcionista", "Asesor Financiero"];
  const TONE_OPTIONS = ["Profesional y formal", "Amigable y cercano", "Entusiasta y persuasivo", "Directo y conciso"];
  const AUDIENCE_OPTIONS = ["Público General", "Jóvenes y Adolescentes", "Profesionales / B2B", "Personas Mayores"];
  const GREETING_OPTIONS = ["¡Hola! ¿En qué te puedo ayudar hoy?", "Bienvenido, soy tu asistente virtual.", "¡Qué tal! Cuéntame qué necesitas."];

  const renderIdentityField = (fieldKey: string, label: string, desc: string, options: string[], placeholder: string) => {
    const currentValue = editingAgent.identityData?.[fieldKey] || "";
    const isCustom = customIdentityFields[fieldKey as keyof typeof customIdentityFields] || (currentValue !== "" && !options.includes(currentValue));

    return (
      <div>
        <label className="text-sm font-medium">{label}</label>
        <p className="text-xs text-muted-foreground mb-2">{desc}</p>
        
        {!isCustom ? (
          <select 
            value={currentValue}
            onChange={e => {
              const val = e.target.value;
              if (val === "CUSTOM") {
                setCustomIdentityFields(prev => ({...prev, [fieldKey]: true}));
                const newData = { ...(editingAgent.identityData || {}), [fieldKey]: "" };
                setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
              } else {
                const newData = { ...(editingAgent.identityData || {}), [fieldKey]: val };
                setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
              }
            }}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">-- Selecciona una opción --</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            <option value="CUSTOM">Escribir algo personalizado...</option>
          </select>
        ) : (
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={currentValue} 
              onChange={e => {
                 const newData = { ...(editingAgent.identityData || {}), [fieldKey]: e.target.value };
                 setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
              }} 
              placeholder={placeholder} 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" 
              autoFocus
            />
            <button 
              type="button"
              onClick={() => {
                setCustomIdentityFields(prev => ({...prev, [fieldKey]: false}));
                const newData = { ...(editingAgent.identityData || {}), [fieldKey]: "" };
                setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
              title="Volver a opciones"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  
  const OBJECTIVE_OPTIONS = ["Vender productos del catálogo", "Resolver dudas de soporte técnico", "Agendar citas o reservaciones", "Captar leads (información de contacto)"];
  const PRICING_OPTIONS = ["Dar precios fijos, sin descuentos", "Ofrecer descuentos si el cliente insiste", "Solo dar precios si el cliente lo solicita", "Negociar libremente"];
  const HANDOFF_OPTIONS = ["Transferir si no sabe la respuesta", "Transferir si el cliente está molesto", "Solo transferir si el cliente lo pide explícitamente", "Nunca transferir, intentar resolver todo"];
  const STYLE_OPTIONS = ["Respuestas muy cortas (1-2 oraciones)", "Párrafos estructurados con viñetas", "Respuestas detalladas y explicativas", "Responder siempre con una pregunta"];

  const renderSoulField = (fieldKey: string, label: string, desc: string, options: string[], placeholder: string) => {
    const currentValue = editingAgent.soulData?.[fieldKey] || "";
    const isCustom = customSoulFields[fieldKey as keyof typeof customSoulFields] || (currentValue !== "" && !options.includes(currentValue));

    return (
      <div>
        <label className="text-sm font-medium">{label}</label>
        <p className="text-xs text-muted-foreground mb-2">{desc}</p>
        
        {!isCustom ? (
          <select 
            value={currentValue}
            onChange={e => {
              const val = e.target.value;
              if (val === "CUSTOM") {
                setCustomSoulFields(prev => ({...prev, [fieldKey]: true}));
                const newData = { ...(editingAgent.soulData || {}), [fieldKey]: "" };
                setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
              } else {
                const newData = { ...(editingAgent.soulData || {}), [fieldKey]: val };
                setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
              }
            }}
            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
          >
            <option value="">-- Selecciona una opción --</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            <option value="CUSTOM">Escribir algo personalizado...</option>
          </select>
        ) : (
          <div className="flex items-center gap-2">
            <input 
              type="text" 
              value={currentValue} 
              onChange={e => {
                 const newData = { ...(editingAgent.soulData || {}), [fieldKey]: e.target.value };
                 setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
              }} 
              placeholder={placeholder} 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" 
              autoFocus
            />
            <button 
              type="button"
              onClick={() => {
                setCustomSoulFields(prev => ({...prev, [fieldKey]: false}));
                const newData = { ...(editingAgent.soulData || {}), [fieldKey]: "" };
                setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
              }}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
              title="Volver a opciones"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    );
  };

  const generateIdentity = (data: any) => {
    let md = `# IDENTIDAD DEL AGENTE\n\n`;
    if (data.role) md += `## 1. ROL Y PROPÓSITO\n${data.role}\n\n`;
    if (data.tone) md += `## 2. TONO DE VOZ Y ESTILO\n${data.tone}\n\n`;
    if (data.audience) md += `## 3. PERFIL DE LA AUDIENCIA\nTe diriges a: ${data.audience}\n\n`;
    if (data.greeting) md += `## 4. EJEMPLO DE SALUDO\n> "${data.greeting}"\n\n`;
    if (data.rules) md += `## 5. RESTRICCIONES DE PERSONALIDAD\n${data.rules}\n`;
    return md;
  };

  const generateSoul = (data: any) => {
    let md = `# DIRECTIVAS CENTRALES (SOUL)\n\n`;
    if (data.objective) md += `## 1. OBJETIVO PRINCIPAL\nTu misión principal es: ${data.objective}\n\n`;
    if (data.pricing) md += `## 2. MANEJO DE PRECIOS Y DESCUENTOS\nRegla financiera: ${data.pricing}\n\n`;
    if (data.handoff || data.handoffCustom) {
      let htext = (data.handoff || "").split("|").filter(Boolean).map((h: string) => "- " + h).join("\n");
      if (data.handoffCustom) htext += "\n- " + data.handoffCustom;
      md += `## 3. PROTOCOLO DE TRANSFERENCIA HUMANA\nCuándo pasar a un humano:\n${htext}\n\n`;
    }
    if (data.style) md += `## 4. ESTILO DE RESPUESTA\nFormato de mensajes: ${data.style}\n\n`;
    if (data.extra) md += `## 5. REGLAS EXTRA\n${data.extra}\n`;
    return md;
  };


const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingAgent) return;
    const file = e.target.files[0];
    
    setIsUploadingKnowledge(true);
    setUploadProgress(0);
    
    try {
      const storageRef = ref(storage, `agents/${editingAgent.id}/knowledge/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          alert("Error al subir archivo: " + error.message);
          setIsUploadingKnowledge(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const newKbItem = { type: 'file', name: file.name, url: downloadURL, path: uploadTask.snapshot.ref.fullPath };
          const currentKb = editingAgent.knowledgeBase || [];
          setEditingAgent({...editingAgent, knowledgeBase: [...currentKb, newKbItem]});
          setIsUploadingKnowledge(false);
          setUploadProgress(0);
        }
      );
    } catch (err: any) {
      alert("Error: " + err.message);
      setIsUploadingKnowledge(false);
    }
  };

  const handleAddLink = () => {
    if (!newLinkUrl.trim() || !editingAgent) return;
    const currentKb = editingAgent.knowledgeBase || [];
    setEditingAgent({...editingAgent, knowledgeBase: [...currentKb, { type: 'link', name: newLinkUrl, url: newLinkUrl }]});
    setNewLinkUrl("");
  };

  const handleRemoveKnowledge = async (index: number, item: any) => {
    if (!editingAgent) return;
    const currentKb = [...(editingAgent.knowledgeBase || [])];
    currentKb.splice(index, 1);
    setEditingAgent({...editingAgent, knowledgeBase: currentKb});
    
    if (item.type === 'file' && item.path) {
      try {
        await deleteObject(ref(storage, item.path));
      } catch(e) {
        console.error("Error deleting file from storage:", e);
      }
    }
  };

    const handleSaveEdit = async () => {
    if (!editingAgent) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "agents", editingAgent.id), {
        name: editingAgent.name,
        role: editingAgent.role,
        clientId: editingAgent.clientId || "",
        whatsappEnabled: editingAgent.whatsappEnabled || false,
        whatsappNumber: editingAgent.whatsappNumber || "",
        telegramEnabled: editingAgent.telegramEnabled || false,
        identity: editingAgent.identity || "",
        identityData: editingAgent.identityData || {},
        soul: editingAgent.soul || "",
        soulData: editingAgent.soulData || {},
        knowledgeBase: editingAgent.knowledgeBase || [],
        tools: editingAgent.tools || []
      });
      alert("Cambios guardados exitosamente.");
    } catch (e: any) {
      alert("Error guardando cambios: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedAgent) {
    return (
      <div className="flex h-full w-full bg-background text-foreground items-center justify-center p-12">
        <div className="text-center space-y-4">
          <Bot size={48} className="mx-auto text-muted-foreground animate-pulse" />
          <h2 className="text-xl font-semibold">Esperando telemetría...</h2>
          <p className="text-muted-foreground max-w-md text-sm mx-auto">
            La base de datos de Firebase ha excedido su cuota gratuita diaria de escritura.<br/><br/>
            Al eliminar y renombrar las carpetas, el puente de telemetría intentó registrarlos de nuevo pero Firebase rechazó la petición por exceso de cuota. El servicio se restablecerá automáticamente a la medianoche (PT), o puedes actualizar tu plan de Firebase.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agentes</h1>
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
            <div className="p-6 border-b border-border flex flex-col xl:flex-row xl:items-center justify-between bg-gradient-to-r from-secondary/20 to-transparent gap-6">
              
              <div className="flex flex-wrap items-center justify-between xl:justify-start gap-8 flex-1">
                {/* Left: Avatar & Name */}
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-xl flex items-center justify-center border flex-shrink-0 ${selectedAgent.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-zinc-500/10 border-zinc-500/30 text-zinc-500'}`}>
                    <Bot size={32} />
                  </div>
                  <div className="flex flex-col items-start gap-1">
                    <h2 className="text-2xl font-bold">{selectedAgent.name}</h2>
                    {selectedAgent.status === 'online' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> ACTIVO
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-zinc-500/10 text-zinc-500 border border-zinc-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span> INACTIVO
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle: 2x2 Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 border border-border bg-secondary/10 rounded-lg p-3 xl:ml-8 flex-1 max-w-2xl">
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
                      onClick={() => setActiveTab('identidad')}
                      className="text-primary hover:underline flex items-center gap-2 text-sm transition-colors w-fit"
                    >
                      <Settings2 size={14} />
                      Editar Agente
                    </button>
                  </div>
                </div>
              </div>

              {/* Right: Toggle Switch */}
              <div className="flex items-center gap-4 xl:justify-end shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground mb-1 font-medium">Encender / Apagar Nodo</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={selectedAgent.status === 'online'} onChange={() => toggleStatus(selectedAgent)} />
                    <div className="w-14 h-7 bg-zinc-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-emerald-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all shadow-inner"></div>
                    <Power size={14} className={`absolute left-2.5 transition-opacity ${selectedAgent.status === 'online' ? 'opacity-0' : 'opacity-100 text-zinc-300'}`} />
                    <Power size={14} className={`absolute right-2.5 transition-opacity ${selectedAgent.status === 'online' ? 'opacity-100 text-emerald-900' : 'opacity-0'}`} />
                  </label>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 px-6 border-b border-border bg-background overflow-x-auto custom-scrollbar">
              <button onClick={() => setActiveTab('monitor')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'monitor' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Inicio
              </button>
              <button onClick={() => setActiveTab('identidad')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'identidad' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Identidad
              </button>
              <button onClick={() => setActiveTab('tareas')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'tareas' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Tareas
              </button>
              <button onClick={() => setActiveTab('subagents')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'subagents' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Sub-agentes
              </button>
              <button onClick={() => setActiveTab('conocimiento')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'conocimiento' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Conocimiento
              </button>
              <button onClick={() => setActiveTab('canales')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'canales' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Canales
              </button>
              <button onClick={() => setActiveTab('integraciones')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'integraciones' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Integraciones
              </button>
              <button onClick={() => setActiveTab('config')} className={`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'config' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                Resumen
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-background">
              
              {activeTab === 'monitor' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">Uso de CPU (Real) <Cpu size={14}/></div>
                      <div className="text-2xl font-bold font-mono text-primary">{selectedAgent.cpuUsage !== undefined ? selectedAgent.cpuUsage : 0}%</div>
                      <div className="text-[10px] text-muted-foreground mt-2">Carga actual en WSL</div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">RAM / VRAM Local <MemoryStick size={14}/></div>
                      <div className="text-2xl font-bold font-mono text-blue-500">{selectedAgent.ramUsage || "0 GB"}</div>
                      <div className="text-[10px] text-muted-foreground mt-2">VRAM: {selectedAgent.vramUsage || "No detectada"}</div>
                    </div>
                    <div className="bg-card border border-border rounded-lg p-4">
                      <div className="text-xs text-muted-foreground mb-1 flex items-center justify-between">Uptime <Clock size={14}/></div>
                      <div className="text-2xl font-bold font-mono text-emerald-500">{selectedAgent.uptime || "0d 0h 0m"}</div>
                      <div className="text-[10px] text-muted-foreground mt-2">Tiempo activo del servidor WSL</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* 1. Latency Chart */}
                    <div className="bg-card border border-border rounded-lg p-5 flex flex-col">
                      <h3 className="text-sm font-semibold mb-4">Latencia de Inferencia (Últimos 30m)</h3>
                      <div className="flex-1 flex items-end gap-1 opacity-80 min-h-[80px]">
                        {(selectedAgent.latencyHistory?.length > 0 ? selectedAgent.latencyHistory : [...Array(15).fill(0)]).slice(-15).map((lat: number, i: number) => {
                          const height = lat === 0 ? 5 : Math.min(100, Math.max(10, (lat / 5000) * 100));
                          const isHigh = lat > 3000;
                          return (
                            <div 
                              key={i} 
                              className={`flex-1 rounded-t-sm ${lat === 0 ? 'bg-primary/20' : (isHigh ? 'bg-orange-500' : 'bg-emerald-500')} hover:opacity-100 transition-colors cursor-crosshair relative group`}
                              style={{ height: `${height}%` }}
                            >
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10 pointer-events-none">
                                {lat}ms
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

                    {/* 2. Connection States */}
                    <div className="bg-card border border-border rounded-lg p-5 flex flex-col">
                      <h3 className="text-sm font-semibold mb-4">Estado de Conexiones</h3>
                      <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                              {selectedAgent.whatsappEnabled && <div className="absolute w-full h-full bg-emerald-500 rounded-full animate-ping opacity-20"></div>}
                              <div className={`w-2.5 h-2.5 rounded-full ${selectedAgent.whatsappEnabled ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`}></div>
                            </div>
                            WhatsApp Baileys
                          </span>
                          <span className={`text-xs font-medium ${selectedAgent.whatsappEnabled ? 'text-emerald-500' : 'text-zinc-500'}`}>{selectedAgent.whatsappEnabled ? 'Online' : 'Offline'}</span>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                              {selectedAgent.telegramEnabled && <div className="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-20"></div>}
                              <div className={`w-2.5 h-2.5 rounded-full ${selectedAgent.telegramEnabled ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'bg-zinc-600'}`}></div>
                            </div>
                            Telegram Bot
                          </span>
                          <span className={`text-xs font-medium ${selectedAgent.telegramEnabled ? 'text-blue-500' : 'text-zinc-500'}`}>{selectedAgent.telegramEnabled ? 'Online' : 'Offline'}</span>
                        </div>

                        <div className="flex items-center justify-between text-sm">
                          <span className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                              {selectedAgent.tools?.includes('wordpress') && <div className="absolute w-full h-full bg-purple-500 rounded-full animate-ping opacity-20"></div>}
                              <div className={`w-2.5 h-2.5 rounded-full ${selectedAgent.tools?.includes('wordpress') ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'bg-zinc-600'}`}></div>
                            </div>
                            WordPress / Woo
                          </span>
                          <span className={`text-xs font-medium ${selectedAgent.tools?.includes('wordpress') ? 'text-purple-500' : 'text-zinc-500'}`}>{selectedAgent.tools?.includes('wordpress') ? 'Online' : 'Offline'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Token Consumption */}
                    <div className="bg-card border border-border rounded-lg p-5 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-semibold">Consumo de Tokens</h3>
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Facturación</span>
                      </div>
                      <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold font-mono text-purple-400">245.8K</span>
                          <span className="text-xs text-muted-foreground">esta semana</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 mb-4 overflow-hidden">
                          <div className="bg-gradient-to-r from-purple-600 to-purple-400 h-full rounded-full" style={{width: '65%'}}></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="bg-secondary/20 p-2 rounded-lg border border-border flex flex-col">
                            <span className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Entrada</span>
                            <span className="font-mono font-medium">180.2K</span>
                          </div>
                          <div className="bg-secondary/20 p-2 rounded-lg border border-border flex flex-col">
                            <span className="text-muted-foreground text-[10px] uppercase tracking-wider mb-1">Salida</span>
                            <span className="font-mono font-medium">65.6K</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    {/* Terminal movido */}
                    <div className="flex flex-col h-[400px]">
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
                </div>
              )}


              {activeTab === 'config' && (
                <div className="space-y-6">
                  
                  {/* AI Model Config */}
                  <div className="bg-secondary/20 border border-border rounded-lg p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-semibold flex items-center gap-2"><Sparkles size={16} className="text-purple-500"/> Modelo de Inteligencia Artificial</h4>
                      <p className="text-xs text-muted-foreground mt-1">Selecciona el motor cognitivo que procesará la lógica de este agente.</p>
                    </div>
                    <div className="w-full md:w-64">
                      <select 
                        value={selectedAgent.aiModel || "google/gemini-2.5-flash"}
                        onChange={(e) => handleModelChange(selectedAgent.id, e.target.value)}
                        className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-secondary transition-colors"
                      >
                        <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (Recomendado)</option>
                        <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                        <option value="gpt-4o">OpenAI GPT-4o</option>
                        <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                        <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-secondary/20 border border-border rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">Integraciones Activas</h4>
                      <button onClick={() => window.dispatchEvent(new CustomEvent('open-edit-agent', { detail: { agent: selectedAgent, tab: 'tools' } }))} className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar Integraciones">
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


                  
                </div>
              )}

              
              {activeTab === 'subagents' && (
                <div className="space-y-6">
                  <div className="bg-secondary/20 border border-border rounded-lg p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold">Sub-agentes (Equipo)</h4>
                        <button onClick={() => { setNewSubagentName(''); setNewSubagentMission(''); setNewSubagentModel('google/gemini-2.5-flash'); setEditingSubagentIndex(null); setIsCustomMission(false); setIsEditingDuties(false); setShowSubagentModal(true); }} className="text-xs text-primary hover:underline flex items-center gap-1" title="Agregar Sub-agente">
                            <Plus size={12}/> Agregar Sub-agente
                        </button>
                      </div>
                      <div className="space-y-3">
                        {selectedAgent.subagents && selectedAgent.subagents.length > 0 ? (
                          selectedAgent.subagents.map((sub: any, i: number) => (
                            <div key={i} className="bg-background border border-border rounded-md p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                               <div className="flex items-center gap-4 lg:w-1/4 shrink-0">
                                 <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                   <Bot size={20} />
                                 </div>
                                 <div className="min-w-0">
                                   <div className="text-sm font-bold capitalize text-foreground truncate">{sub.name}</div>
                                   <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5 truncate" title={sub.model || 'google/gemini-2.5-flash'}>
                                     <Sparkles size={12} className="text-purple-400 shrink-0"/> {sub.model || 'google/gemini-2.5-flash'}
                                   </div>
                                 </div>
                               </div>
                               
                               <div className="flex-1 lg:px-6 lg:border-l lg:border-border/50 min-w-0">
                                 <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">Misión / Deberes</div>
                                 <div className="text-xs text-foreground line-clamp-2" title={sub.mission || 'Sin misión asignada'}>{sub.mission || 'Sin misión asignada'}</div>
                               </div>

                               <div className="lg:w-1/4 flex items-center justify-between lg:justify-end gap-6 lg:border-l lg:border-border/50 lg:pl-6 shrink-0">
                                 <div className="flex flex-col">
                                   <span className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Tokens</span>
                                   <span className="text-sm font-mono font-medium text-emerald-400">{sub.tokensUsed || '0'}</span>
                                 </div>
                                 <div className="flex items-center gap-2">
                                   <button className="p-2 text-blue-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-md transition-colors" title="Editar" onClick={() => {
                                     setNewSubagentName(sub.name);
                                     setNewSubagentMission(sub.mission || '');
                                     setNewSubagentModel(sub.model || 'google/gemini-2.5-flash');
                                     setEditingSubagentIndex(i);
                                     if (sub.mission && !dutiesList.includes(sub.mission)) {
                                       setIsCustomMission(true);
                                     } else {
                                       setIsCustomMission(false);
                                     }
                                     setShowSubagentModal(true);
                                   }}>
                                     <Settings2 size={16}/>
                                   </button>
                                   <button className="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors" title="Eliminar" onClick={async () => {
                                     if (confirm('¿Eliminar este sub-agente?')) {
                                       const filtered = selectedAgent.subagents.filter((_: any, index: number) => index !== i);
                                       await updateDoc(doc(db, "agents", selectedAgent.id), { subagents: filtered });
                                     }
                                   }}>
                                     <Trash size={16}/>
                                   </button>
                                 </div>
                               </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-sm text-muted-foreground italic text-center py-4 bg-background/50 rounded-md border border-dashed border-border">
                          Este agente principal no tiene sub-agentes asignados.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

{activeTab === 'identidad' && editingAgent && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6">
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
                            <option key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
                        Identidad y Personalidad
                        <span className="text-xs font-normal text-muted-foreground">IDENTITY.md</span>
                      </h3>
                      <div className="space-y-6">
                      <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 p-3 rounded-md text-xs mb-4">
                        Responde estas preguntas para construir automáticamente el archivo <code>IDENTITY.md</code> de tu agente.
                      </div>
                      
                      <div className="space-y-4">
                        {renderIdentityField('role', '1. ¿Cuál es el rol o profesión del agente?', 'Ej. Asesor de ventas experto en moda, Soporte técnico nivel 2, Recepcionista de clínica.', ROLE_OPTIONS, 'Ej. Experto en cierre de ventas inmobiliarias')}

                        {renderIdentityField('tone', '2. ¿Qué tono de voz debe utilizar?', 'Ej. Amable y cercano, Profesional y directo, Entusiasta usando emojis.', TONE_OPTIONS, 'Ej. Formal, respetuoso pero muy empático')}

                        {renderIdentityField('audience', '3. ¿A quién le está hablando? (Perfil de la audiencia)', 'Ej. Madres jóvenes, Emprendedores de tecnología, Personas mayores.', AUDIENCE_OPTIONS, 'Ej. Dueños de pequeños negocios locales')}

                        {renderIdentityField('greeting', '4. Ejemplo de Saludo Típico', 'Una frase que muestre cómo iniciaría una conversación este agente.', GREETING_OPTIONS, 'Ej. ¡Hola! Qué alegría saludarte, ¿en qué te puedo ayudar hoy? 😊')}

                        <div>
                          <label className="text-sm font-medium">5. Reglas estrictas de Personalidad</label>
                          <p className="text-xs text-muted-foreground mb-2">¿Qué cosas NUNCA debe hacer el agente respecto a su forma de ser?</p>
                          <textarea 
                            value={editingAgent.identityData?.rules || ""} 
                            onChange={e => {
                               const newData = { ...(editingAgent.identityData || {}), rules: e.target.value };
                               setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
                            }} 
                            placeholder="- Nunca tutear al cliente
- Jamás usar sarcasmo
- No opinar sobre política" 
                            className="w-full h-24 bg-background border border-border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary" 
                          />
                        </div>
                      </div>

                      {/* Vista previa oculta del MD generado (opcional) */}
                      <details className="mt-4">
                        <summary className="text-xs text-muted-foreground cursor-pointer select-none">Ver archivo Markdown generado</summary>
                        <div className="mt-2 p-3 bg-secondary/30 border border-border rounded-md text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                          {editingAgent.identity || "El archivo se generará al llenar los campos..."}
                        </div>
                      </details>
                    </div>
                    </div>
                  </div>
                </div>
              )}

                            {activeTab === 'tareas' && editingAgent && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6 ">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
                      Directivas (Tareas y Reglas)
                      <span className="text-xs font-normal text-muted-foreground">SOUL.md</span>
                    </h3>
                    <div className="space-y-6">
                      <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 p-3 rounded-md text-xs mb-4">
                        Responde estas preguntas para construir automáticamente el archivo <code>SOUL.md</code> con la lógica y directivas de tu agente.
                      </div>
                      
                      <div className="space-y-4">
                        {renderSoulField('objective', '1. ¿Cuál es el objetivo principal del agente?', 'La meta principal que debe buscar en cada conversación.', OBJECTIVE_OPTIONS, 'Ej. Cerrar ventas de propiedades inmobiliarias')}
                        {renderSoulField('pricing', '2. ¿Cómo debe manejar precios y descuentos?', 'Políticas sobre finanzas y negociación.', PRICING_OPTIONS, 'Ej. Solo dar precios por mensaje de voz (no soportado, pero como ejemplo)')}
                        
                        <div>
                          <label className="text-sm font-medium">3. Protocolo de Transferencia Humana</label>
                          <p className="text-xs text-muted-foreground mb-2">¿En qué momento debe el agente dejar de hablar y avisar a un agente humano? (Puedes seleccionar varias)</p>
                          <div className="space-y-2 bg-background border border-border rounded-md p-3">
                            {HANDOFF_OPTIONS.map(opt => {
                              const currentHandoffs = (editingAgent.soulData?.handoff || "").split("|").filter(Boolean);
                              const isChecked = currentHandoffs.includes(opt);
                              return (
                                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                  <input 
                                    type="checkbox" 
                                    className="rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={isChecked}
                                    onChange={e => {
                                      let newHandoffs = [...currentHandoffs];
                                      if (e.target.checked) newHandoffs.push(opt);
                                      else newHandoffs = newHandoffs.filter(h => h !== opt);
                                      const newVal = newHandoffs.join("|");
                                      const newData = { ...(editingAgent.soulData || {}), handoff: newVal };
                                      setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
                                    }}
                                  />
                                  <span className="text-sm">{opt}</span>
                                </label>
                              );
                            })}
                            <div className="pt-2 mt-2 border-t border-border">
                              <label className="flex items-center gap-2 cursor-pointer mb-2">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-gray-300 text-primary focus:ring-primary"
                                  checked={customSoulFields.handoff}
                                  onChange={e => setCustomSoulFields(prev => ({...prev, handoff: e.target.checked}))}
                                />
                                <span className="text-sm font-medium">Otra regla personalizada...</span>
                              </label>
                              {customSoulFields.handoff && (
                                <input 
                                  type="text" 
                                  placeholder="Ej. Si el cliente pide hablar con gerencia" 
                                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                                  value={(editingAgent.soulData?.handoffCustom || "")}
                                  onChange={e => {
                                      const newData = { ...(editingAgent.soulData || {}), handoffCustom: e.target.value };
                                      setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
                                  }}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        {renderSoulField('style', '4. Estilo y longitud de respuesta', 'Cómo debe estructurar visualmente sus mensajes.', STYLE_OPTIONS, 'Ej. Siempre usar máximo 3 líneas de texto')}

                        <div>
                          <label className="text-sm font-medium">5. Reglas Extra (Opcional)</label>
                          <p className="text-xs text-muted-foreground mb-2">Instrucciones o reglas específicas que el agente debe seguir estrictamente.</p>
                          <textarea 
                            value={editingAgent.soulData?.extra || ""} 
                            onChange={e => {
                               const newData = { ...(editingAgent.soulData || {}), extra: e.target.value };
                               setEditingAgent({...editingAgent, soulData: newData, soul: generateSoul(newData)});
                            }} 
                            placeholder="- Solicitar siempre correo electrónico al final
- Mencionar promoción de verano" 
                            className="w-full h-24 bg-background border border-border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary" 
                          />
                        </div>
                      </div>

                      <details className="mt-4">
                        <summary className="text-xs text-muted-foreground cursor-pointer select-none">Ver archivo Markdown generado (Soul)</summary>
                        <div className="mt-2 p-3 bg-secondary/30 border border-border rounded-md text-xs font-mono whitespace-pre-wrap text-muted-foreground">
                          {editingAgent.soul || "El archivo se generará al llenar los campos..."}
                        </div>
                      </details>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'conocimiento' && editingAgent && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6 ">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Base de Conocimiento</h3>
                    <div className="space-y-6">
                      <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 p-3 rounded-md text-xs">
                        Agrega documentos (PDF, DOC, CSV, MD) o enlaces web para alimentar el contexto y conocimiento base del agente. El agente usará esta información para responder preguntas específicas.
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Carga de Archivos */}
                        <div className="border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center bg-secondary/5 hover:bg-secondary/10 transition-colors relative">
                          <FileText className="text-muted-foreground mb-2" size={24} />
                          <h4 className="text-sm font-medium mb-1">Subir Archivo</h4>
                          <p className="text-xs text-muted-foreground mb-4 max-w-[200px]">Soporta .pdf, .doc, .md, .csv, .xls</p>
                          
                          {isUploadingKnowledge ? (
                            <div className="w-full max-w-[200px]">
                              <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-300" style={{width: `${uploadProgress}%`}}></div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">{Math.round(uploadProgress)}% subido</p>
                            </div>
                          ) : (
                            <div className="relative">
                              <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.md,.txt"
                                onChange={handleFileUpload}
                              />
                              <button type="button" className="px-4 py-2 bg-primary text-primary-foreground text-xs font-medium rounded-md pointer-events-none">
                                Seleccionar archivo
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Carga de Links */}
                        <div className="border border-border rounded-lg p-6 flex flex-col justify-center bg-secondary/5">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm font-medium">Agregar Enlace Web</span>
                          </div>
                          <p className="text-xs text-muted-foreground mb-4">El agente raspará el contenido del enlace.</p>
                          <div className="flex gap-2">
                            <input 
                              type="url" 
                              placeholder="https://..." 
                              value={newLinkUrl}
                              onChange={e => setNewLinkUrl(e.target.value)}
                              className="flex-1 bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
                            />
                            <button 
                              type="button" 
                              onClick={handleAddLink}
                              className="px-3 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-xs font-medium rounded-md transition-colors"
                            >
                              Agregar
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Lista de Conocimiento */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 border-b border-border pb-2">Base de Conocimiento Actual</h4>
                        <div className="space-y-2">
                          {(!editingAgent.knowledgeBase || editingAgent.knowledgeBase.length === 0) ? (
                            <div className="text-center py-6 text-xs text-muted-foreground italic border border-dashed border-border rounded-lg">
                              No hay documentos ni enlaces agregados aún.
                            </div>
                          ) : (
                            editingAgent.knowledgeBase.map((item: any, idx: number) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-secondary/20 border border-border rounded-md">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  {item.type === 'file' ? <FileText size={16} className="text-blue-500 shrink-0" /> : <div className="shrink-0 w-4 h-4 rounded-full border border-current flex items-center justify-center text-[8px] font-bold">URL</div>}
                                  <a href={item.url} target="_blank" rel="noreferrer" className="text-sm truncate hover:underline" title={item.name}>{item.name}</a>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveKnowledge(idx, item)}
                                  className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded transition-colors shrink-0"
                                  title="Eliminar"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'canales' && editingAgent && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6 ">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Canales de Comunicación</h3>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground mb-4">Vincular agente con canales de mensajería externos.</p>
                      
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
                                <button type="button" onClick={() => setPairingCode("W7X9-B2M4")} className="px-4 py-2 bg-emerald-500 text-white text-xs font-bold rounded-md hover:bg-emerald-600 transition-colors">
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
                  </div>
                </div>
              )}

              {activeTab === 'integraciones' && editingAgent && (
                <div className="space-y-6">
                  <div className="bg-card border border-border rounded-lg p-6 ">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Integraciones y Plugins</h3>
                    <div className="space-y-4">
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

      
                            {/* Floating Save Button if changes are made */}
              {editingAgent && hasChanges && (
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


        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border bg-secondary/20 flex justify-between items-center">
              <h3 className="font-bold flex items-center gap-2"><Bot className="text-primary" size={18}/> {editingSubagentIndex !== null ? "Editar Sub-agente" : "Nuevo Sub-agente"}</h3>
              <button type="button" onClick={() => { setShowSubagentModal(false); setIsCustomMission(false); setIsEditingDuties(false); setEditingSubagentIndex(null); setEditingSubagentIndex(null); }} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveSubagent} className="p-5 space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Nombre del Sub-agente</label>
                <input type="text" value={newSubagentName} onChange={e => setNewSubagentName(e.target.value)} placeholder="Ej. investigador_web" className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none" required />
              </div>
                              <div>
                  <label className="text-sm font-medium block mb-1">Modelo de IA</label>
                  <select value={newSubagentModel} onChange={e => setNewSubagentModel(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none">
                      <optgroup label="Google Gemini 2.5">
                        <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                        <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                      </optgroup>
                      <optgroup label="Google Gemini 1.5">
                        <option value="google/gemini-1.5-flash">Gemini 1.5 Flash</option>
                        <option value="google/gemini-1.5-pro">Gemini 1.5 Pro</option>
                        <option value="google/gemini-1.5-flash-8b">Gemini 1.5 Flash-8B</option>
                      </optgroup>
                      <optgroup label="Open-Source (Llama)">
                        <option value="meta-llama/llama-3-70b-instruct">Llama 3 70B</option>
                        <option value="meta-llama/llama-3-8b-instruct">Llama 3 8B</option>
                      </optgroup>
                    </select>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium">Misión (Deberes)</label>
                    <button type="button" onClick={() => setIsEditingDuties(!isEditingDuties)} className="text-xs text-primary hover:underline">
                      {isEditingDuties ? "Cerrar edición" : "Administrar lista"}
                    </button>
                  </div>
                  
                  {isEditingDuties ? (
                    <div className="border border-border rounded-md p-3 space-y-3 bg-secondary/10">
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {dutiesList.length === 0 && <p className="text-xs text-muted-foreground italic">Lista vacía</p>}
                        {dutiesList.map((duty, idx) => (
                          <div key={idx} className="flex gap-2 items-center bg-background border border-border rounded p-2">
                            <span className="flex-1 text-sm">{duty}</span>
                            <button type="button" onClick={() => handleRemoveDuty(idx)} className="text-red-500 hover:text-red-400 p-1">
                              <Trash size={14}/>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={newDutyTemp} onChange={e => setNewDutyTemp(e.target.value)} placeholder="Nuevo deber..." className="flex-1 bg-background border border-border rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-primary" />
                        <button type="button" onClick={handleAddDuty} className="bg-primary text-primary-foreground px-3 py-1.5 rounded-md text-sm font-medium">Agregar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {!isCustomMission ? (
                        <select 
                          value={newSubagentMission} 
                          onChange={e => {
                            if (e.target.value === 'CUSTOM') {
                              setIsCustomMission(true);
                              setNewSubagentMission('');
                            } else {
                              setNewSubagentMission(e.target.value);
                            }
                          }} 
                          className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:bg-secondary transition-colors"
                          required
                        >
                          <option value="">-- Selecciona un deber --</option>
                          {dutiesList.map(d => <option key={d} value={d}>{d}</option>)}
                          <option value="CUSTOM">Escribir algo personalizado...</option>
                        </select>
                      ) : (
                        <div className="space-y-2">
                          <textarea 
                            value={newSubagentMission} 
                            onChange={e => setNewSubagentMission(e.target.value)} 
                            placeholder="Escribe la misión personalizada aquí..." 
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm h-32 resize-none focus:ring-1 focus:ring-primary focus:outline-none" 
                            required 
                          />
                          <button type="button" onClick={() => { setIsCustomMission(false); setNewSubagentMission(''); }} className="text-xs text-primary hover:underline">
                            Volver a la lista
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => { setShowSubagentModal(false); setIsCustomMission(false); setIsEditingDuties(false); }} className="px-4 py-2 text-sm font-medium hover:bg-secondary rounded-md">Cancelar</button>
                <button type="submit" disabled={isSavingSubagent} className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md disabled:opacity-50">
                  {isSavingSubagent ? "Guardando..." : (editingSubagentIndex !== null ? "Guardar Cambios" : "Agregar Sub-agente")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
