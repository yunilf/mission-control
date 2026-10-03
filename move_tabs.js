const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// The chunk starts here:
const startStr = "{activeTab === 'identidad' && editingAgent && (";
let startIndex = pageContent.lastIndexOf(startStr); // Use lastIndexOf in case it appears twice?

// Wait, let's just make sure we grab the one at the bottom.
// The end of the `integraciones` block is:
//               )}
// 
//               {/* Floating Save Bar */}
//               {hasChanges && (

const integracionesEndStr = "              )}\n\n              {/* Floating Save Bar */}";
let endIndex = pageContent.indexOf(integracionesEndStr);

if (startIndex === -1) {
    console.error("Could not find start index");
    process.exit(1);
}

if (endIndex === -1) {
    // maybe there's no Floating Save Bar right there?
    // Let's just find the end of the integraciones block.
    // It ends with `)}`
    
    // Let's find "{activeTab === 'integraciones' && editingAgent && ("
    const integracionesStart = pageContent.indexOf("{activeTab === 'integraciones' && editingAgent && (");
    const closingBrace = pageContent.indexOf(")}", integracionesStart + 500);
    endIndex = closingBrace + 2;
}

const chunkToMove = pageContent.substring(startIndex, endIndex);

// Remove it from the current position
pageContent = pageContent.substring(0, startIndex) + pageContent.substring(endIndex);

// Where to paste it?
// Inside the Tab Content container.
// The Tab Content container ends with `</div>\n          </div>\n        ) : (`
// But wait, there is also the `{hasChanges && ...}` floating bar. Does that belong inside or outside?
// It should probably be inside the `relative` container, which is `<div className="flex-1 flex flex-col overflow-hidden relative">`.
// But wait! Right now `hasChanges` floating bar is at the bottom of the file too?
// Let's check where `hasChanges` is.

// Let's just put the chunk right after the `subagents` block.
// The `subagents` block ends with:
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               )}

const subagentsStart = pageContent.indexOf("{activeTab === 'subagents' && (");
const subagentsClosingBrace = pageContent.indexOf(")}", subagentsStart + 500);

if (subagentsStart !== -1 && subagentsClosingBrace !== -1) {
    const insertPos = subagentsClosingBrace + 2;
    pageContent = pageContent.substring(0, insertPos) + '\n\n' + chunkToMove + '\n' + pageContent.substring(insertPos);
} else {
    console.error("Could not find subagents block");
    process.exit(1);
}

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done moving chunks');
