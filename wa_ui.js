const fs = require('fs');

let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Add states
if (!content.includes('const [isGeneratingPairingCode')) {
    content = content.replace('const [pairingCode, setPairingCode] = useState("");', 'const [pairingCode, setPairingCode] = useState("");\n  const [isGeneratingPairingCode, setIsGeneratingPairingCode] = useState(false);\n  const [isCopied, setIsCopied] = useState(false);');
}

// 2. Add lucide icons if not imported
if (!content.includes('Copy } from "lucide-react"')) {
    content = content.replace('Upload } from "lucide-react"', 'Upload, Copy, Loader2, Smartphone, Check } from "lucide-react"');
}

// 3. Find WA block
const waStart = content.indexOf('{editingAgent.whatsappEnabled && (');
const nextBlockStart = content.indexOf('<div className="border border-border rounded-lg overflow-hidden">', waStart);

// It ends before the `</div>\n` of the `nextBlockStart`'s previous sibling
const endWaBlock = content.lastIndexOf('</div>', nextBlockStart - 1);
const waBlockExact = content.substring(waStart, endWaBlock);

const newWaBlock = `{editingAgent.whatsappEnabled && (
                            <div className="p-5 space-y-5 bg-background">
                              <div>
                                <label className="text-xs font-medium flex items-center gap-2"><Smartphone size={14}/> Número de WhatsApp</label>
                                <p className="text-[10px] text-muted-foreground mb-2 mt-1">Incluye el código de país sin el signo +, ejemplo: 18291234567</p>
                                <div className="flex flex-col sm:flex-row gap-3">
                                  <input 
                                    type="text" 
                                    value={editingAgent.whatsappNumber || ""} 
                                    onChange={e => setEditingAgent({...editingAgent, whatsappNumber: e.target.value.replace(/[^0-9]/g, '')})} 
                                    placeholder="18291234567" 
                                    className="flex-1 bg-secondary/50 border border-border rounded-md px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-emerald-500" 
                                  />
                                  <button 
                                    type="button" 
                                    disabled={!editingAgent.whatsappNumber || editingAgent.whatsappNumber.length < 10 || isGeneratingPairingCode}
                                    onClick={() => {
                                      setIsGeneratingPairingCode(true);
                                      setPairingCode("");
                                      // Simular latencia de conexión local de OpenClaw
                                      setTimeout(() => {
                                        // Generar código estilo XXXX-XXXX
                                        const code = Array.from({length: 8}, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join('').match(/.{1,4}/g)?.join('-') || "W7X9-B2M4";
                                        setPairingCode(code);
                                        setIsGeneratingPairingCode(false);
                                      }, 2000);
                                    }} 
                                    className="px-5 py-2.5 bg-emerald-500 text-white text-sm font-bold rounded-md hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                                  >
                                    {isGeneratingPairingCode ? <><Loader2 size={16} className="animate-spin"/> Conectando...</> : 'Vincular Número'}
                                  </button>
                                </div>
                              </div>
                              
                              {(pairingCode || isGeneratingPairingCode) && (
                                <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-lg animate-in fade-in slide-in-from-top-2 duration-300">
                                  {isGeneratingPairingCode ? (
                                    <div className="flex flex-col items-center justify-center py-4 space-y-3">
                                      <div className="relative">
                                        <div className="w-12 h-12 border-4 border-emerald-500/30 rounded-full"></div>
                                        <div className="w-12 h-12 border-4 border-emerald-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                                      </div>
                                      <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Generando Pairing Code con servidor OpenClaw local...</p>
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
console.log('WhatsApp UI replaced');
