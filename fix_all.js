const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const startStr = "{activeTab === 'identidad' && editingAgent && (";
const startIndex = pageContent.lastIndexOf(startStr); 

const floatingSaveStart = pageContent.indexOf("{/* Floating Save Button");
const chunkEndIndex = floatingSaveStart;

if (startIndex === -1 || chunkEndIndex === -1) {
    console.error("Could not find chunk bounds");
    process.exit(1);
}

const chunkToMove = pageContent.substring(startIndex, chunkEndIndex);
pageContent = pageContent.substring(0, startIndex) + pageContent.substring(chunkEndIndex);

// Let's find the end of `subagents` block.
const subagentsStr = "{activeTab === 'subagents' && (";
const subagentsStart = pageContent.indexOf(subagentsStr);

// `subagents` block ends with:
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}
// Let's search for "Este agente principal no tiene sub-agentes asignados."
const emptySubagentsMsg = pageContent.indexOf("Este agente principal no tiene sub-agentes asignados.");
const subagentsClosingBrace = pageContent.indexOf(")}", emptySubagentsMsg); // this is the `)}` for the empty message
const finalSubagentsClosing = pageContent.indexOf(")}", subagentsClosingBrace + 1); // this is the `)}` for the `activeTab === 'subagents'`!

if (finalSubagentsClosing === -1) {
    console.error("Could not find end of subagents");
    process.exit(1);
}

const insertIndex = finalSubagentsClosing + 2; // right after `)}`

pageContent = pageContent.substring(0, insertIndex) + '\n\n' + chunkToMove + pageContent.substring(insertIndex);

// 1. Remove `h-full overflow-y-auto p-6 pb-24` and `space-y-8 pb-24` (for identidad)
pageContent = pageContent.replace(/className="h-full overflow-y-auto p-6 pb-24"/g, 'className="space-y-6"');
pageContent = pageContent.replace(/className="h-full overflow-y-auto p-6 space-y-8 pb-24"/g, 'className="space-y-6"');

// 2. Remove `max-w-4xl mx-auto`
pageContent = pageContent.replace(/max-w-4xl mx-auto/g, '');

// 3. Change `bg-card border border-border rounded-xl p-6 shadow-sm` to `bg-card border border-border rounded-lg p-6`
pageContent = pageContent.replace(/rounded-xl p-6 shadow-sm/g, 'rounded-lg p-6');

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done fixing page properly');
