const fs = require('fs');

let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Add handleSkillUpload and handleDeleteSkill below handleFileUpload
const handleFileUploadEnd = `setIsUploadingKnowledge(false);
      setUploadProgress(0);
    }
  };`;
const newFunctions = `
  const handleSkillUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingAgent) return;
    const file = e.target.files[0];
    
    setIsUploadingKnowledge(true);
    setUploadProgress(0);
    
    try {
      const storageRef = ref(storage, \`agents/\${editingAgent.id}/skills/\${Date.now()}_\${file.name}\`);
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          alert("Error al subir skill: " + error.message);
          setIsUploadingKnowledge(false);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          const newSkillItem = { type: 'file', name: file.name, url: downloadURL, path: uploadTask.snapshot.ref.fullPath };
          const currentSkills = editingAgent.skills || [];
          setEditingAgent({...editingAgent, skills: [...currentSkills, newSkillItem]});
          setIsUploadingKnowledge(false);
          setUploadProgress(0);
        }
      );
    } catch (err: any) {
      alert("Error: " + err.message);
      setIsUploadingKnowledge(false);
    }
  };

  const handleDeleteSkill = async (idx: number, itemPath: string) => {
    try {
      const fileRef = ref(storage, itemPath);
      await deleteObject(fileRef);
      const newSkills = [...editingAgent.skills];
      newSkills.splice(idx, 1);
      setEditingAgent({...editingAgent, skills: newSkills});
    } catch (err: any) {
      alert("Error al eliminar skill: " + err.message);
    }
  };
`;
if (!content.includes('handleSkillUpload')) {
  // It's tricky to inject exactly after handleFileUpload end because of matching curly braces.
  // I will just insert it right before `const handleAddLink = () => {`
  const addLinkIdx = content.indexOf('const handleAddLink = () => {');
  if (addLinkIdx !== -1) {
    content = content.substring(0, addLinkIdx) + newFunctions + "\n  " + content.substring(addLinkIdx);
  }
}

// 2. Replace Header Model Text with Select
const headerModelRegex = /Modelo: <span className="text-foreground">\{selectedAgent\.aiModel \|\| "google\/gemini-2\.5-flash"\}<\/span>/;
const headerModelNew = `Modelo: 
                        <select 
                          value={selectedAgent.aiModel || "google/gemini-2.5-flash"}
                          onChange={async (e) => {
                              const val = e.target.value;
                              await updateDoc(doc(db, "agents", selectedAgent.id), { aiModel: val });
                          }}
                          className="bg-transparent border-b border-dashed border-muted-foreground/50 text-foreground font-medium cursor-pointer focus:outline-none focus:border-primary pb-0.5 ml-1"
                        >
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
                          <optgroup label="OpenAI / Claude">
                            <option value="gpt-4o">OpenAI GPT-4o</option>
                            <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                            <option value="claude-3-5-sonnet-20240620">Claude 3.5 Sonnet</option>
                          </optgroup>
                        </select>`;
content = content.replace(headerModelRegex, headerModelNew);

// 3. Delete "Resumen" Button
const resumenBtnRegex = /<button onClick=\{\(\) => setActiveTab\('config'\)\}.*?>\s*Resumen\s*<\/button>/g;
content = content.replace(resumenBtnRegex, '');

// 4. Delete config Tab Content
const configTabStart = content.indexOf("{activeTab === 'config' && (");
if (configTabStart !== -1) {
  // Find the end of this block. It ends right before `        </div>\n\n        {/* Floating Save Button if changes are made */}`
  // Let's find `{/* Floating Save Button` and track back to the closing `)}` of config tab
  const saveBtn = content.indexOf('{/* Floating Save Button');
  // It's the `)}` right before saveBtn.
  const endConfigIdx = content.lastIndexOf(')}', saveBtn);
  if (endConfigIdx !== -1) {
     content = content.substring(0, configTabStart) + content.substring(endConfigIdx + 2);
  }
}

// 5. Add Skills Tab Button
const conocimientoBtnEnd = content.indexOf("Conocimiento\n                </button>") + "Conocimiento\n                </button>".length;
if (!content.includes("setActiveTab('skills')")) {
  const skillsBtn = `\n                <button onClick={() => setActiveTab('skills')} className={\`py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap \${activeTab === 'skills' ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}\`}>
                  Skills
                </button>`;
  content = content.substring(0, conocimientoBtnEnd) + skillsBtn + content.substring(conocimientoBtnEnd);
}

// 6. Add Skills Tab Content
const canalesTabStart = content.indexOf("{activeTab === 'canales' && editingAgent && (");
if (canalesTabStart !== -1 && !content.includes("activeTab === 'skills' && editingAgent && (")) {
  const skillsContent = `                {activeTab === 'skills' && editingAgent && (
                  <div className="space-y-6">
                    <div className="bg-card border border-border rounded-lg p-6">
                      <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
                        Gestión de Skills
                        <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded">Archivos .md</span>
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">Sube los archivos <code>.md</code> con las habilidades (skills) que deseas que tu agente pueda utilizar en sus tareas.</p>
                      
                      {/* Lista de Skills */}
                      <div className="space-y-3 mb-6">
                        {!editingAgent.skills || editingAgent.skills.length === 0 ? (
                          <div className="text-center p-8 border border-dashed border-border rounded-lg text-muted-foreground text-sm">
                            No hay skills cargados. Sube tu primer archivo markdown.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {editingAgent.skills.map((skill: any, idx: number) => (
                              <div key={idx} className="bg-background border border-border rounded-md p-3 flex items-center justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <FileText className="text-primary shrink-0" size={18} />
                                  <div className="truncate">
                                    <p className="text-sm font-medium truncate" title={skill.name}>{skill.name}</p>
                                    <p className="text-[10px] text-muted-foreground">Documento Markdown</p>
                                  </div>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <a href={skill.url} target="_blank" rel="noreferrer" className="p-1.5 bg-secondary text-foreground rounded hover:bg-primary hover:text-primary-foreground transition-colors" title="Descargar">
                                    <Upload size={14} className="rotate-180" />
                                  </a>
                                  <button onClick={() => handleDeleteSkill(idx, skill.path)} className="p-1.5 bg-red-500/10 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors" title="Eliminar">
                                    <Trash size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Subir */}
                      <div className="p-4 bg-secondary/10 border border-border rounded-lg flex flex-col items-center justify-center text-center">
                        <Upload className="text-muted-foreground mb-2" size={24} />
                        <h4 className="text-sm font-medium mb-1">Subir nuevo Skill</h4>
                        <p className="text-xs text-muted-foreground mb-4">Solo archivos .md</p>
                        
                        <div className="relative">
                          {isUploadingKnowledge ? (
                            <div className="w-48">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span>Subiendo...</span>
                                <span>{Math.round(uploadProgress)}%</span>
                              </div>
                              <div className="w-full bg-secondary rounded-full h-1.5 overflow-hidden">
                                <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: \`\${uploadProgress}%\` }}></div>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              <input 
                                type="file" 
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                accept=".md"
                                onChange={handleSkillUpload}
                              />
                              <button type="button" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md pointer-events-none shadow-sm flex items-center gap-2">
                                <Plus size={16} /> Seleccionar .md
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

`;
  content = content.substring(0, canalesTabStart) + skillsContent + content.substring(canalesTabStart);
}

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('Done!');
