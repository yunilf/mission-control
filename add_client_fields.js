const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');

// 1. Add Icons
content = content.replace(
  'import { Users, Bot, Settings2, Plus, Phone, Mail, Building2, Search, Trash2, User, Tag, AlignLeft, X, Briefcase, Activity } from "lucide-react";',
  'import { Users, Bot, Settings2, Plus, Phone, Mail, Building2, Search, Trash2, User, Tag, AlignLeft, X, Briefcase, Activity, Globe, Instagram, MapPin, Clock, FileText } from "lucide-react";'
);

// 2. Add States
const stateTarget = 'const [newClientEmail, setNewClientEmail] = useState("");';
const stateReplacement = `const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientWebsite, setNewClientWebsite] = useState("");
  const [newClientInstagram, setNewClientInstagram] = useState("");
  const [newClientAddress, setNewClientAddress] = useState("");
  const [newClientHours, setNewClientHours] = useState("");
  const [newClientBusinessInfo, setNewClientBusinessInfo] = useState("");`;
content = content.replace(stateTarget, stateReplacement);

// 3. Update addDoc
const addTarget = `        email: newClientEmail,
        status: newClientStatus,
        tier: newClientTier,
        notes: newClientNotes,
        createdAt: new Date().toISOString()
      });
      setNewClientName(""); setNewClientCompany(""); setNewClientPhone(""); setNewClientEmail("");
      setNewClientStatus("active"); setNewClientTier("Pro"); setNewClientNotes("");`;
const addReplacement = `        email: newClientEmail,
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
      setNewClientName(""); setNewClientCompany(""); setNewClientPhone(""); setNewClientEmail("");
      setNewClientWebsite(""); setNewClientInstagram(""); setNewClientAddress(""); setNewClientHours(""); setNewClientBusinessInfo("");
      setNewClientStatus("active"); setNewClientTier("Pro"); setNewClientNotes("");`;
content = content.replace(addTarget, addReplacement);

// 4. Update Modal UI
const modalStart = '{showAddModal && (';
const idx = content.indexOf(modalStart);

if (idx !== -1) {
  content = content.substring(0, idx) + `{showAddModal && (
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
                      <User size={16}/> Datos Principales
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre del Responsable <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" required />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Empresa o Marca</label>
                        <div className="relative">
                          <Building2 className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientCompany} onChange={e => setNewClientCompany(e.target.value)} placeholder="Ej. La Barrita Express" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Phone size={16}/> Contacto y Enlaces
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Teléfono WhatsApp</label>
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
                          <input type="url" value={newClientWebsite} onChange={e => setNewClientWebsite(e.target.value)} placeholder="https://..." className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Instagram</label>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
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
                          <input type="text" value={newClientHours} onChange={e => setNewClientHours(e.target.value)} placeholder="Ej. Lunes a Sábados 8:00 AM a 10:00 PM" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
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
}`;
}

fs.writeFileSync('src/app/clients/page.tsx', content, 'utf8');
console.log('done');
