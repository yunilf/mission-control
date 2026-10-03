const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const regexModels = /<select value=\{newSubagentModel\}[\s\S]*?<\/select>/;

const newSelect = `<select value={newSubagentModel} onChange={e => setNewSubagentModel(e.target.value)} className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:outline-none">
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
                    </select>`;

pageContent = pageContent.replace(regexModels, newSelect);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done updating model select');
