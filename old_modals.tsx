"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, doc, onSnapshot } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { Settings2, MessageSquare, Bot, FileText, Blocks, X } from "lucide-react";

export default function AgentModals() {
  
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

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [pairingCode, setPairingCode] = useState("");
  const [customIdentityFields, setCustomIdentityFields] = useState({ role: false, tone: false, audience: false, greeting: false });
  const [customSoulFields, setCustomSoulFields] = useState({ objective: false, pricing: false, handoff: false, style: false });
  
  const [newAgentName, setNewAgentName] = useState("");
  const [newAgentRole, setNewAgentRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingKnowledge, setIsUploadingKnowledge] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [newLinkUrl, setNewLinkUrl] = useState("");
  const [clients, setClients] = useState<any[]>([]);

  useEffect(() => {
    const handleOpenAdd = () => setShowAddModal(true);
    const handleOpenEdit = (e: any) => {
      if (e.detail && e.detail.agent) {
        setEditingAgent(e.detail.agent);
        setActiveTab(e.detail.tab || "general");
      } else {
        setEditingAgent(e.detail);
        setActiveTab("general");
      }
    };

    window.addEventListener("open-add-agent", handleOpenAdd);
    window.addEventListener("open-edit-agent", handleOpenEdit);

    const unsubClients = onSnapshot(collection(db, "clients"), (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });


    return () => {
      window.removeEventListener("open-add-agent", handleOpenAdd);
      window.removeEventListener("open-edit-agent", handleOpenEdit);
      unsubClients();
    };
  }, []);

  
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
      // also log activity
      await addDoc(collection(db, "activity_logs"), {
        agent: "Sistema", action: `Nuevo agente registrado: ${newAgentName}`, isError: false, timestamp: new Date().toISOString()
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
      await addDoc(collection(db, "activity_logs"), {
        agent: "Sistema", action: `Configuración de ${editingAgent.name} actualizada.`, isError: false, timestamp: new Date().toISOString()
      });
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

  return (
    <>
      {/* Add Agent Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-card border border-border w-[95%] md:w-full max-w-md rounded-xl shadow-lg p-6 animate-in fade-in zoom-in-95 duration-200">
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
      )}

      {/* Edit Agent Modal */}
      {editingAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-card border border-border w-[95%] md:w-full max-w-3xl rounded-xl shadow-lg flex flex-col overflow-hidden max-h-[85vh] animate-in fade-in zoom-in-95 duration-200">
            
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <h3 className="text-xl font-semibold flex items-center gap-2"><Settings2 size={20} className="text-primary" /> Configurar Agente: {editingAgent.name}</h3>
            </div>
            
            <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
              <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-border bg-secondary/10 p-3 flex flex-row md:flex-col overflow-x-auto gap-1 shrink-0">
                <button onClick={() => setActiveTab("general")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap ${activeTab === 'general' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}>General</button>
                <button onClick={() => setActiveTab("identidad")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap ${activeTab === 'identidad' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}>Identidad</button>
                <button onClick={() => setActiveTab("soul")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap ${activeTab === 'soul' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}>Directivas (Soul)</button>
                <button onClick={() => setActiveTab("conocimiento")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap ${activeTab === 'conocimiento' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}>Conocimiento</button>
                <button onClick={() => setActiveTab("canales")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap ${activeTab === 'canales' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}>Canales</button>
                <button onClick={() => setActiveTab("tools")} className={`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap ${activeTab === 'tools' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}`}>Integraciones</button>
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
                            {clients.map(client => (
                              <option key={client.id} value={client.id}>{client.name} {client.company ? `(${client.company})` : ''}</option>
                            ))}
                          </select>
                      </div>
                    </div>
                  )}

                  {activeTab === "identidad" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
                  )}

                  {activeTab === "soul" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
                  )}

                  
                  {activeTab === "conocimiento" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
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
                  )}


                  {activeTab === "canales" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
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
              <button type="button" onClick={() => { setEditingAgent(null); setPairingCode(""); }} className="px-4 py-2 text-sm hover:bg-secondary rounded-md transition-colors">Cancelar</button>
              <button type="submit" form="editForm" onClick={handleSaveEdit} disabled={isSubmitting} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md disabled:opacity-50 transition-colors">
                {isSubmitting ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
