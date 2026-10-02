const fs = require('fs');

let content = fs.readFileSync('src/components/AgentModals.tsx', 'utf-8');

// 1. Add state for custom fields tracking at the top of the component
if (!content.includes('customIdentityFields')) {
    content = content.replace(
        /const \[pairingCode, setPairingCode\] = useState\(""\);/,
        `const [pairingCode, setPairingCode] = useState("");
  const [customIdentityFields, setCustomIdentityFields] = useState({ role: false, tone: false, audience: false, greeting: false });`
    );
}

// 2. Add the predefined options
const predefinedOptions = `
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
`;

if (!content.includes('const ROLE_OPTIONS =')) {
    content = content.replace(
        /const generateIdentity = \(data: any\) => \{/,
        predefinedOptions + "\n  const generateIdentity = (data: any) => {"
    );
}

// 3. Replace the actual inputs with `renderIdentityField` calls
const roleInputRegex = /<div>\s*<label className="text-sm font-medium">1\. ¿Cuál es el rol o profesión del agente\?<\/label>[\s\S]*?<\/div>/;
content = content.replace(roleInputRegex, `{renderIdentityField('role', '1. ¿Cuál es el rol o profesión del agente?', 'Ej. Asesor de ventas experto en moda, Soporte técnico nivel 2, Recepcionista de clínica.', ROLE_OPTIONS, 'Ej. Experto en cierre de ventas inmobiliarias')}`);

const toneInputRegex = /<div>\s*<label className="text-sm font-medium">2\. ¿Qué tono de voz debe utilizar\?<\/label>[\s\S]*?<\/div>/;
content = content.replace(toneInputRegex, `{renderIdentityField('tone', '2. ¿Qué tono de voz debe utilizar?', 'Ej. Amable y cercano, Profesional y directo, Entusiasta usando emojis.', TONE_OPTIONS, 'Ej. Formal, respetuoso pero muy empático')}`);

const audienceInputRegex = /<div>\s*<label className="text-sm font-medium">3\. ¿A quién le está hablando\? \(Perfil de la audiencia\)<\/label>[\s\S]*?<\/div>/;
content = content.replace(audienceInputRegex, `{renderIdentityField('audience', '3. ¿A quién le está hablando? (Perfil de la audiencia)', 'Ej. Madres jóvenes, Emprendedores de tecnología, Personas mayores.', AUDIENCE_OPTIONS, 'Ej. Dueños de pequeños negocios locales')}`);

const greetingInputRegex = /<div>\s*<label className="text-sm font-medium">4\. Ejemplo de Saludo Típico<\/label>[\s\S]*?<\/div>/;
content = content.replace(greetingInputRegex, `{renderIdentityField('greeting', '4. Ejemplo de Saludo Típico', 'Una frase que muestre cómo iniciaría una conversación este agente.', GREETING_OPTIONS, 'Ej. ¡Hola! Qué alegría saludarte, ¿en qué te puedo ayudar hoy? 😊')}`);

fs.writeFileSync('src/components/AgentModals.tsx', content, 'utf8');
console.log('done replacing fields with dropdowns');
