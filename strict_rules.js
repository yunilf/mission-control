const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// 1. Add STRICT_RULES_OPTIONS
const strictRulesConst = `const STRICT_RULES_OPTIONS = [
  "Prohibido dar respuestas largas (Ser siempre breve y directo)",
  "Nunca inventar información o precios si no se sabe la respuesta",
  "Jamás usar sarcasmo, ironía o ser condescendiente",
  "Prohibido tutear al usuario (Usar siempre 'Usted')",
  "No usar emojis bajo ninguna circunstancia (Extrema formalidad)",
  "Nunca prometer soluciones, tiempos o garantías no documentadas",
  "Prohibido opinar sobre política, religión o controversias sociales",
  "Jamás culpar al cliente o ponerse a la defensiva frente a reclamos",
  "Prohibido usar lenguaje coloquial, modismos o jerga",
  "Nunca emitir juicios de valor u opiniones personales",
  "Prohibido solicitar información de pago directamente por chat",
  "Nunca decir 'No sé' sin ofrecer una alternativa o escalar el problema"
];`;

if (!pageContent.includes('const STRICT_RULES_OPTIONS')) {
    pageContent = pageContent.replace(
        'const GREETING_OPTIONS = [',
        strictRulesConst + '\n\nconst GREETING_OPTIONS = ['
    );
}

// 2. Update generateIdentity
const oldGenIdentity = `  const generateIdentity = (data: any) => {
    let md = \`# IDENTIDAD DEL AGENTE\\n\\n\`;
    if (data.role) md += \`## 1. ROL Y PROPÃ“SITO\\n\${data.role}\\n\\n\`;
    if (data.tone) md += \`## 2. TONO DE VOZ Y ESTILO\\n\${data.tone}\\n\\n\`;
    if (data.audience) md += \`## 3. PERFIL DE LA AUDIENCIA\\nTe diriges a: \${data.audience}\\n\\n\`;
    if (data.greeting) md += \`## 4. EJEMPLO DE SALUDO\\n> "\${data.greeting}"\\n\\n\`;
    if (data.rules) md += \`## 5. RESTRICCIONES DE PERSONALIDAD\\n\${data.rules}\\n\`;
    return md;
  };`;
// wait, the file has `PROPÓSITO` if it's utf-8, but might have `PROPÃ“SITO` if read weirdly before.
// I'll replace using regex to be safe.
const regexGenIdentity = /const generateIdentity = \(data: any\) => \{[\s\S]*?return md;\s*\};/;
const newGenIdentity = `const generateIdentity = (data: any) => {
    let md = \`# IDENTIDAD DEL AGENTE\\n\\n\`;
    if (data.role) md += \`## 1. ROL Y PROPÓSITO\\n\${data.role}\\n\\n\`;
    if (data.tone) md += \`## 2. TONO DE VOZ Y ESTILO\\n\${data.tone}\\n\\n\`;
    if (data.audience) md += \`## 3. PERFIL DE LA AUDIENCIA\\nTe diriges a: \${data.audience}\\n\\n\`;
    if (data.greeting) md += \`## 4. EJEMPLO DE SALUDO\\n> "\${data.greeting}"\\n\\n\`;
    
    let rulesText = "";
    if (data.ruleChecklist && data.ruleChecklist.length > 0) {
        rulesText += data.ruleChecklist.map((r: string) => "- " + r).join("\\n") + "\\n";
    }
    if (data.rules) {
        rulesText += data.rules;
    }
    if (rulesText) md += \`## 5. RESTRICCIONES DE PERSONALIDAD\\n\${rulesText}\\n\`;
    
    return md;
  };`;
pageContent = pageContent.replace(regexGenIdentity, newGenIdentity);

// 3. Update the UI block
const regexRulesUI = /<label className="text-sm font-medium">5\. Reglas estrictas de Personalidad<\/label>[\s\S]*?<\/div>\s*<\/div>\s*\{\/\* Vista previa oculta del MD generado \(opcional\) \*\/\}/;

const newRulesUI = `<label className="text-sm font-medium">5. Reglas estrictas de Personalidad</label>
                            <p className="text-xs text-muted-foreground mb-3">¿Qué cosas NUNCA debe hacer el agente respecto a su forma de ser? Selecciona las directivas más importantes.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                              {STRICT_RULES_OPTIONS.map((rule, idx) => {
                                const isChecked = editingAgent.identityData?.ruleChecklist?.includes(rule) || false;
                                return (
                                  <label key={idx} className={\`flex items-start gap-2 p-2 rounded-md border cursor-pointer transition-colors \${isChecked ? 'bg-primary/10 border-primary/30' : 'bg-background border-border hover:bg-secondary/50'}\`}>
                                    <input 
                                      type="checkbox" 
                                      className="mt-0.5 rounded border-gray-300 text-primary focus:ring-primary"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        let currentList = editingAgent.identityData?.ruleChecklist || [];
                                        if (e.target.checked) {
                                          currentList = [...currentList, rule];
                                        } else {
                                          currentList = currentList.filter((r: string) => r !== rule);
                                        }
                                        const newData = { ...(editingAgent.identityData || {}), ruleChecklist: currentList };
                                        setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
                                      }}
                                    />
                                    <span className="text-xs leading-tight select-none">{rule}</span>
                                  </label>
                                );
                              })}
                            </div>

                            <label className="text-xs font-medium block mb-1">Otras reglas personalizadas:</label>
                            <textarea 
                              value={editingAgent.identityData?.rules || ""} 
                              onChange={e => {
                                 const newData = { ...(editingAgent.identityData || {}), rules: e.target.value };
                                 setEditingAgent({...editingAgent, identityData: newData, identity: generateIdentity(newData)});
                              }} 
                              placeholder="- Opcional: Escribe aquí cualquier otra regla específica de tu negocio..." 
                              className="w-full h-20 bg-background border border-border rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary" 
                            />
                          </div>
                        </div>
  
                        {/* Vista previa oculta del MD generado (opcional) */}`;

pageContent = pageContent.replace(regexRulesUI, newRulesUI);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done patching strict rules');
