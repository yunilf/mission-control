const fs = require('fs');

let content = fs.readFileSync('src/components/AgentModals.tsx', 'utf-8');

// 1. Add custom tracking fields for soul
content = content.replace(
  /const \[customIdentityFields, setCustomIdentityFields\] = useState\(\{ role: false, tone: false, audience: false, greeting: false \}\);/,
  `const [customIdentityFields, setCustomIdentityFields] = useState({ role: false, tone: false, audience: false, greeting: false });
  const [customSoulFields, setCustomSoulFields] = useState({ objective: false, pricing: false, handoff: false, style: false });`
);

// 2. Add predefined options for soul
const soulOptions = `
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
`;

content = content.replace(
  /const generateIdentity = \(data: any\) => \{/,
  soulOptions + "\n  const generateIdentity = (data: any) => {"
);

// 3. Add generateSoul function
const generateSoulFn = `
  const generateSoul = (data: any) => {
    let md = \`# DIRECTIVAS CENTRALES (SOUL)\\n\\n\`;
    if (data.objective) md += \`## 1. OBJETIVO PRINCIPAL\\nTu misión principal es: \${data.objective}\\n\\n\`;
    if (data.pricing) md += \`## 2. MANEJO DE PRECIOS Y DESCUENTOS\\nRegla financiera: \${data.pricing}\\n\\n\`;
    if (data.handoff) md += \`## 3. PROTOCOLO DE TRANSFERENCIA HUMANA\\nCuándo pasar a un humano: \${data.handoff}\\n\\n\`;
    if (data.style) md += \`## 4. ESTILO DE RESPUESTA\\nFormato de mensajes: \${data.style}\\n\\n\`;
    if (data.extra) md += \`## 5. REGLAS EXTRA\\n\${data.extra}\\n\`;
    return md;
  };
`;
content = content.replace(
  /return md;\n  \};\n/,
  `return md;\n  };\n${generateSoulFn}`
);

// 4. Update the "soul" tab JSX
const oldSoulTabRegex = /\{activeTab === "soul" && \([\s\S]*?<\/div>\s*\)\}/;

const newSoulTabCode = `{activeTab === "soul" && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                      <div className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 p-3 rounded-md text-xs mb-4">
                        Responde estas preguntas para construir automáticamente el archivo <code>SOUL.md</code> con la lógica y directivas de tu agente.
                      </div>
                      
                      <div className="space-y-4">
                        {renderSoulField('objective', '1. ¿Cuál es el objetivo principal del agente?', 'La meta principal que debe buscar en cada conversación.', OBJECTIVE_OPTIONS, 'Ej. Cerrar ventas de propiedades inmobiliarias')}
                        {renderSoulField('pricing', '2. ¿Cómo debe manejar precios y descuentos?', 'Políticas sobre finanzas y negociación.', PRICING_OPTIONS, 'Ej. Solo dar precios por mensaje de voz (no soportado, pero como ejemplo)')}
                        {renderSoulField('handoff', '3. Protocolo de Transferencia Humana', '¿En qué momento debe el agente dejar de hablar y avisar a un agente humano?', HANDOFF_OPTIONS, 'Ej. Si el cliente pide hablar con gerencia')}
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
                            placeholder="- Solicitar siempre correo electrónico al final\n- Mencionar promoción de verano" 
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
                  )}`;

content = content.replace(oldSoulTabRegex, newSoulTabCode);

// 5. Update handleSaveEdit to include soulData
content = content.replace(
  /identityData: editingAgent\.identityData \|\| \{\},/,
  `identityData: editingAgent.identityData || {},
          soul: editingAgent.soul,
          soulData: editingAgent.soulData || {},`
);

fs.writeFileSync('src/components/AgentModals.tsx', content, 'utf8');
console.log('done updating modal for soul wizard');
