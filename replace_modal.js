const fs = require('fs');
let content = fs.readFileSync('src/app/clients/page.tsx', 'utf-8');
const searchStart = '{showAddModal && (';
const idxStart = content.indexOf(searchStart);
if (idxStart !== -1) {
  content = content.substring(0, idxStart) + `{showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-border bg-secondary/20">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Briefcase className="text-primary" size={24} /> 
                  Nuevo Perfil de Cliente
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Registra un nuevo cliente para gestionar sus agentes de IA.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:bg-secondary p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddClient} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <User size={16}/> Datos Principales
                    </h4>
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Nombre del Responsable <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <User className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="Ej. Juan PÃ©rez" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" required />
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

                  <div className="pt-2">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Phone size={16}/> Contacto
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">TelÃ©fono WhatsApp</label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="text" value={newClientPhone} onChange={e => setNewClientPhone(e.target.value)} placeholder="+1 829..." className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium">Correo ElectrÃ³nico</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
                          <input type="email" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} placeholder="admin@empresa.com" className="w-full bg-background border border-border rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Settings2 size={16}/> ConfiguraciÃ³n de Servicio
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
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
                    </div>
                  </div>

                  <div className="pt-2">
                    <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 flex items-center gap-2">
                      <AlignLeft size={16}/> Notas Internas
                    </h4>
                    <div className="space-y-1.5">
                      <textarea 
                        value={newClientNotes} 
                        onChange={e => setNewClientNotes(e.target.value)} 
                        placeholder="Escribe aquÃ­ notas sobre el cliente, instrucciones especiales de facturaciÃ³n, etc..." 
                        className="w-full bg-background border border-border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow min-h-[120px] resize-none" 
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-8 pt-5 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-5 py-2.5 text-sm font-medium hover:bg-secondary rounded-lg transition-colors">
                  Cancelar
                </button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-lg disabled:opacity-50 hover:opacity-90 transition-opacity shadow-md flex items-center gap-2">
                  {isSubmitting ? (
                    <><Bot className="animate-bounce" size={16} /> Registrando...</>
                  ) : (
                    <><Plus size={16} /> Crear Perfil</>
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
  fs.writeFileSync('src/app/clients/page.tsx', content);
  console.log('done');
}
