const fs = require('fs');

let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// Find WA block
const waStart = content.indexOf('{editingAgent.whatsappEnabled && (');
const nextBlockStart = content.indexOf('<div className="border border-border rounded-lg overflow-hidden">', waStart);
const endWaBlock = content.lastIndexOf('</div>', nextBlockStart - 1);

const newWaBlock = `{editingAgent.whatsappEnabled && (
                            <div className="p-5 space-y-5 bg-background">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-b border-border pb-5">
                                <div>
                                  <label className="text-xs font-medium text-muted-foreground">URL del Nodo OpenClaw</label>
                                  <input 
                                    type="url" 
                                    value={editingAgent.openclawUrl || "http://localhost:18790"} 
                                    onChange={e => setEditingAgent({...editingAgent, openclawUrl: e.target.value})} 
                                    placeholder="http://localhost:18790" 
                                    className="w-full mt-1 bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                                  />
                                </div>
                                <div>
                                  <label className="text-xs font-medium flex items-center gap-2"><Smartphone size={14}/> Número de WhatsApp</label>
                                  <input 
                                    type="text" 
                                    value={editingAgent.whatsappNumber || ""} 
                                    onChange={e => setEditingAgent({...editingAgent, whatsappNumber: e.target.value.replace(/[^0-9]/g, '')})} 
                                    placeholder="18291234567" 
                                    className="w-full mt-1 bg-secondary/50 border border-border rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                                  />
                                </div>
                              </div>
                              
                              <div className="flex justify-end">
                                <button 
                                  type="button" 
                                  disabled={!editingAgent.whatsappNumber || editingAgent.whatsappNumber.length < 10 || isGeneratingPairingCode}
                                  onClick={async () => {
                                    setIsGeneratingPairingCode(true);
                                    setPairingCode("");
                                    const baseUrl = (editingAgent.openclawUrl || "http://localhost:18790").replace(/\\/$/, "");
                                    
                                    try {
                                      // Llamada a la API de OpenClaw (asumiendo endpoint genérico)
                                      const response = await fetch(\`\${baseUrl}/api/channels/whatsapp/pair\`, {
                                        method: "POST",
                                        headers: {
                                          "Content-Type": "application/json"
                                        },
                                        body: JSON.stringify({ number: editingAgent.whatsappNumber })
                                      });
                                      
                                      if (!response.ok) {
                                        const text = await response.text();
                                        throw new Error(\`Error HTTP \${response.status}: \${text}\`);
                                      }
                                      
                                      const data = await response.json();
                                      if (data && data.pairingCode) {
                                        // Formatear código a XXXX-XXXX si viene sin guión
                                        let code = data.pairingCode;
                                        if (code.length === 8 && !code.includes("-")) {
                                            code = code.match(/.{1,4}/g)?.join('-') || code;
                                        }
                                        setPairingCode(code);
                                      } else {
                                        throw new Error("Respuesta de API inválida: No se encontró 'pairingCode'");
                                      }
                                    } catch (err: any) {
                                      console.error("Error al conectar con OpenClaw:", err);
                                      alert("Error de conexión:\\n" + err.message + "\\n\\n¿CORS Error? Asegúrate de que OpenClaw tenga este dominio web (Firebase) agregado en OPENCLAW_GATEWAY_CONTROLUI_ALLOWEDORIGINS.");
                                    } finally {
                                      setIsGeneratingPairingCode(false);
                                    }
                                  }} 
                                  className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-sm w-full sm:w-auto"
                                >
                                  {isGeneratingPairingCode ? <><Loader2 size={16} className="animate-spin"/> Conectando a OpenClaw...</> : 'Solicitar Pairing Code a API'}
                                </button>
                              </div>
                              
                              {(pairingCode || isGeneratingPairingCode) && (
                                <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                                  {isGeneratingPairingCode ? (
                                    <div className="flex flex-col items-center justify-center py-4 space-y-3">
                                      <div className="relative">
                                        <div className="w-12 h-12 border-4 border-emerald-500/30 rounded-full"></div>
                                        <div className="w-12 h-12 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                                      </div>
                                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Solicitando Pairing Code a la API...</p>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col items-center">
                                      <h4 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mb-4 flex items-center gap-2"><Check size={16}/> ¡Código Generado Exitosamente!</h4>
                                      
                                      <div className="w-full max-w-sm mb-6">
                                        <div className="bg-background border border-border rounded-xl p-4 flex items-center justify-between shadow-sm group hover:border-emerald-500/50 transition-colors">
                                          <div className="text-3xl font-black font-mono tracking-[0.2em] text-foreground">{pairingCode}</div>
                                          <button 
                                            onClick={() => {
                                              navigator.clipboard.writeText(pairingCode.replace('-', ''));
                                              setIsCopied(true);
                                              setTimeout(() => setIsCopied(false), 2000);
                                            }}
                                            className="p-2 bg-secondary text-muted-foreground rounded-lg hover:bg-emerald-500 hover:text-white transition-all focus:outline-none"
                                            title="Copiar código sin guiones"
                                          >
                                            {isCopied ? <Check size={20}/> : <Copy size={20}/>}
                                          </button>
                                        </div>
                                      </div>

                                      <div className="w-full text-left space-y-2 bg-background/50 p-4 rounded-lg border border-border/50">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Instrucciones de Vinculación</p>
                                        <ol className="text-sm space-y-2 text-foreground/80 list-decimal pl-4">
                                          <li>Abre <strong>WhatsApp</strong> en tu teléfono móvil.</li>
                                          <li>Toca el menú de tres puntos (⋮) o Configuración y selecciona <strong>Dispositivos vinculados</strong>.</li>
                                          <li>Toca <strong>Vincular un dispositivo</strong>.</li>
                                          <li>Selecciona <strong>"Vincular con el número de teléfono en su lugar"</strong> (en la parte inferior de la pantalla).</li>
                                          <li>Ingresa el código que aparece arriba (sin el guión).</li>
                                        </ol>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}`;

content = content.substring(0, waStart) + newWaBlock + '\n                        ' + content.substring(endWaBlock);

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('WhatsApp UI real API call added');
