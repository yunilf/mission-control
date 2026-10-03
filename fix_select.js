const fs = require('fs');

let content = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const oldSelect = `<select 
                          value={selectedAgent.aiModel || "google/gemini-2.5-flash"}
                          onChange={async (e) => {
                              const val = e.target.value;
                              await updateDoc(doc(db, "agents", selectedAgent.id), { aiModel: val });
                          }}
                          className="bg-transparent border-b border-dashed border-muted-foreground/50 text-foreground font-medium cursor-pointer focus:outline-none focus:border-primary pb-0.5 ml-1"
                        >`;

const newSelect = `<select 
                          value={selectedAgent.aiModel || "google/gemini-2.5-flash"}
                          onChange={async (e) => {
                              const val = e.target.value;
                              await updateDoc(doc(db, "agents", selectedAgent.id), { aiModel: val });
                          }}
                          className="bg-secondary border border-border rounded-md px-2 py-1 text-xs text-foreground font-medium cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary ml-2 max-w-[220px] truncate"
                        >`;

content = content.replace(oldSelect, newSelect);

// Let's also add bg-background to optgroups just in case
content = content.replace(/<optgroup label="Google Gemini 2.5">/g, '<optgroup label="Google Gemini 2.5" className="bg-background text-foreground">');
content = content.replace(/<optgroup label="Google Gemini 1.5">/g, '<optgroup label="Google Gemini 1.5" className="bg-background text-foreground">');
content = content.replace(/<optgroup label="Open-Source \(Llama\)">/g, '<optgroup label="Open-Source (Llama)" className="bg-background text-foreground">');
content = content.replace(/<optgroup label="OpenAI \/ Claude">/g, '<optgroup label="OpenAI / Claude" className="bg-background text-foreground">');

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('Fixed select dropdown');
