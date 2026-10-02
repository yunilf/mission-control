const fs = require('fs');
let content = fs.readFileSync('src/components/AgentModals.tsx', 'utf-8');

// 1. Add storage imports
if (!content.includes('import { storage }')) {
    content = content.replace(
        /import \{ db \} from "@\/lib\/firebase";/,
        `import { db, storage } from "@/lib/firebase";\nimport { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";`
    );
}

// 2. Add Uploading state
if (!content.includes('isUploadingKnowledge')) {
    content = content.replace(
        /const \[isSubmitting, setIsSubmitting\] = useState\(false\);/,
        `const [isSubmitting, setIsSubmitting] = useState(false);\n  const [isUploadingKnowledge, setIsUploadingKnowledge] = useState(false);\n  const [uploadProgress, setUploadProgress] = useState(0);\n  const [newLinkUrl, setNewLinkUrl] = useState("");`
    );
}

// 3. Add Knowledge Tab Button
content = content.replace(
  /<button onClick=\{\(\) => setActiveTab\("soul"\)\} className=\{`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap \$\{activeTab === 'soul' \? 'bg-primary\/10 text-primary' : 'text-muted-foreground hover:bg-secondary\/50'\}`\}>Directivas \(Soul\)<\/button>/,
  `<button onClick={() => setActiveTab("soul")} className={\`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap \${activeTab === 'soul' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}\`}>Directivas (Soul)</button>
                <button onClick={() => setActiveTab("conocimiento")} className={\`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap \${activeTab === 'conocimiento' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}\`}>Conocimiento</button>`
);

// 4. Add handlers for file upload and link add
const uploadHandlers = `
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingAgent) return;
    const file = e.target.files[0];
    
    setIsUploadingKnowledge(true);
    setUploadProgress(0);
    
    try {
      const storageRef = ref(storage, \`agents/\${editingAgent.id}/knowledge/\${Date.now()}_\${file.name}\`);
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
`;

if (!content.includes('handleFileUpload')) {
    content = content.replace(
        /const handleAddAgent = async \(e: React\.FormEvent\) => \{/,
        uploadHandlers + "\n  const handleAddAgent = async (e: React.FormEvent) => {"
    );
}

// 5. Add Knowledge Tab UI
const knowledgeTabCode = `
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
                                <div className="h-full bg-primary transition-all duration-300" style={{width: \`\${uploadProgress}%\`}}></div>
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
`;

content = content.replace(
  /\{activeTab === "canales" && \(/,
  knowledgeTabCode + "\n\n                  {activeTab === \"canales\" && ("
);

// 6. Make sure handleSaveEdit saves knowledgeBase
content = content.replace(
  /soulData: editingAgent\.soulData \|\| \{\},/,
  `soulData: editingAgent.soulData || {},
          knowledgeBase: editingAgent.knowledgeBase || [],`
);

fs.writeFileSync('src/components/AgentModals.tsx', content, 'utf8');
console.log('done adding knowledge base tab');
