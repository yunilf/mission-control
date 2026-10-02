const fs = require('fs');

let modalsContent = fs.readFileSync('src/components/AgentModals.tsx', 'utf-8');

// 1. Change tabs in modal navigation
modalsContent = modalsContent.replace(
  /<button onClick=\{\(\) => setActiveTab\("instrucciones"\)\} className=\{`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap \$\{activeTab === 'instrucciones' \? 'bg-primary\/10 text-primary' : 'text-muted-foreground hover:bg-secondary\/50'\}`\}>Instrucciones<\/button>/,
  `<button onClick={() => setActiveTab("identidad")} className={\`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap \${activeTab === 'identidad' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}\`}>Identidad</button>
                <button onClick={() => setActiveTab("soul")} className={\`px-3 py-2 text-sm text-left rounded-md transition-colors font-medium whitespace-nowrap \${activeTab === 'soul' ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50'}\`}>Directivas (Soul)</button>`
);

// 2. Remove old "instrucciones" block and add "identidad" and "soul" blocks
const oldInstruccionesRegex = /\{activeTab === "instrucciones" && \([\s\S]*?<\/div>\s*\)\}/;

const newTabsCode = `{activeTab === "identidad" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 p-3 rounded-md text-xs mb-4">
                        Responde estas preguntas para construir automáticamente el archivo <code>IDENTITY.md</code> de tu agente.
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">1. ¿Cuál es el rol o profesión del agente?</label>
                          <p className="text-xs text-muted-foreground mb-2">Ej. Asesor de ventas experto en moda, Soporte técnico nivel 2, Recepcionista de clínica.</p>
                          <input 
                            type="text" 
                            value={editingAgent.identityData?.role || ""} 
                            onChange={e => {
                               const newData = { ...(editingAgent.identityData || {}), role: e.target.value };
                               setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
                            }} 
                            placeholder="Ej. Experto en cierre de ventas inmobiliarias" 
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" 
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">2. ¿Qué tono de voz debe utilizar?</label>
                          <p className="text-xs text-muted-foreground mb-2">Ej. Amable y cercano, Profesional y directo, Entusiasta usando emojis.</p>
                          <input 
                            type="text" 
                            value={editingAgent.identityData?.tone || ""} 
                            onChange={e => {
                               const newData = { ...(editingAgent.identityData || {}), tone: e.target.value };
                               setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
                            }} 
                            placeholder="Ej. Formal, respetuoso pero muy empático" 
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" 
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">3. ¿A quién le está hablando? (Perfil de la audiencia)</label>
                          <p className="text-xs text-muted-foreground mb-2">Ej. Madres jóvenes, Emprendedores de tecnología, Personas mayores.</p>
                          <input 
                            type="text" 
                            value={editingAgent.identityData?.audience || ""} 
                            onChange={e => {
                               const newData = { ...(editingAgent.identityData || {}), audience: e.target.value };
                               setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
                            }} 
                            placeholder="Ej. Dueños de pequeños negocios locales" 
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" 
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">4. Ejemplo de Saludo Típico</label>
                          <p className="text-xs text-muted-foreground mb-2">Una frase que muestre cómo iniciaría una conversación este agente.</p>
                          <input 
                            type="text" 
                            value={editingAgent.identityData?.greeting || ""} 
                            onChange={e => {
                               const newData = { ...(editingAgent.identityData || {}), greeting: e.target.value };
                               setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
                            }} 
                            placeholder="Ej. ¡Hola! Qué alegría saludarte, ¿en qué te puedo ayudar hoy? 😊" 
                            className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary" 
                          />
                        </div>

                        <div>
                          <label className="text-sm font-medium">5. Reglas estrictas de Personalidad</label>
                          <p className="text-xs text-muted-foreground mb-2">¿Qué cosas NUNCA debe hacer el agente respecto a su forma de ser?</p>
                          <textarea 
                            value={editingAgent.identityData?.rules || ""} 
                            onChange={e => {
                               const newData = { ...(editingAgent.identityData || {}), rules: e.target.value };
                               setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
                            }} 
                            placeholder="- Nunca tutear al cliente\n- Jamás usar sarcasmo\n- No opinar sobre política" 
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
                      <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 p-3 rounded-md text-xs">
                        El archivo <code>SOUL.md</code> define la lógica, flujos de trabajo, y directivas de negocio del agente.
                      </div>
                      <div>
                        <label className="text-sm font-medium flex items-center justify-between mb-1">
                          <span>Directivas de Negocio (Soul.md)</span>
                        </label>
                        <textarea 
                          value={editingAgent.soul || ""} 
                          onChange={e => setEditingAgent({...editingAgent, soul: e.target.value})} 
                          placeholder="Reglas estrictas:\n1. Nunca ofrezcas descuentos.\n2. Si piden factura, solicita el RNC..." 
                          className="w-full h-64 bg-background border border-border rounded-md px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:border-primary" 
                        />
                      </div>
                    </div>
                  )}`;

modalsContent = modalsContent.replace(oldInstruccionesRegex, newTabsCode);

// 3. Add the `generateIdentity` helper function at the top of the component
if (!modalsContent.includes('const generateIdentity =')) {
    modalsContent = modalsContent.replace(
        /export default function AgentModals\(\) \{/,
        `export default function AgentModals() {\n  const generateIdentity = (data: any) => {
    let md = \`# IDENTIDAD DEL AGENTE\\n\\n\`;
    if (data.role) md += \`## 1. ROL Y PROPÓSITO\\n\${data.role}\\n\\n\`;
    if (data.tone) md += \`## 2. TONO DE VOZ Y ESTILO\\n\${data.tone}\\n\\n\`;
    if (data.audience) md += \`## 3. PERFIL DE LA AUDIENCIA\\nTe diriges a: \${data.audience}\\n\\n\`;
    if (data.greeting) md += \`## 4. EJEMPLO DE SALUDO\\n> "\${data.greeting}"\\n\\n\`;
    if (data.rules) md += \`## 5. RESTRICCIONES DE PERSONALIDAD\\n\${data.rules}\\n\`;
    return md;
  };\n`
    );
}

// 4. Update the save function to include identityData
modalsContent = modalsContent.replace(
  /identity: editingAgent\.identity,/,
  `identity: editingAgent.identity,
          identityData: editingAgent.identityData || {},`
);

fs.writeFileSync('src/components/AgentModals.tsx', modalsContent, 'utf-8');

// 5. Update page.tsx to route to 'identidad' instead of 'general' when editing IDENTITY.md
let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');
pageContent = pageContent.replace(
  /<button onClick=\{\(\) => window\.dispatchEvent\(new CustomEvent\('open-edit-agent', \{ detail: \{ agent: selectedAgent, tab: 'general' \} \}\)\)\} className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar Identity">/,
  `<button onClick={() => window.dispatchEvent(new CustomEvent('open-edit-agent', { detail: { agent: selectedAgent, tab: 'identidad' } }))} className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar Identity">`
);

// Also route SOUL.md to 'soul' tab
pageContent = pageContent.replace(
  /<button onClick=\{\(\) => window\.dispatchEvent\(new CustomEvent\('open-edit-agent', \{ detail: \{ agent: selectedAgent, tab: 'general' \} \}\)\)\} className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar Soul">/,
  `<button onClick={() => window.dispatchEvent(new CustomEvent('open-edit-agent', { detail: { agent: selectedAgent, tab: 'soul' } }))} className="text-xs text-primary hover:underline flex items-center gap-1" title="Editar Soul">`
);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf-8');

console.log('done updating modal for identity wizard');
