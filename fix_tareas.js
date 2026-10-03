const fs = require('fs');

const modalCode = fs.readFileSync('old_modals.tsx', 'utf8');

const getTabContent = (tabName) => {
    const startStr = '{activeTab === "' + tabName + '" && (';
    const startIndex = modalCode.indexOf(startStr);
    if (startIndex === -1) return '/* NOT FOUND */';
    
    let openBrackets = 0;
    let endIndex = startIndex;
    
    for (let i = startIndex; i < modalCode.length; i++) {
        if (modalCode[i] === '{') openBrackets++;
        if (modalCode[i] === '}') openBrackets--;
        
        if (modalCode[i] === '}' && openBrackets === 0) {
            endIndex = i;
            break;
        }
    }
    let content = modalCode.substring(startIndex, endIndex + 1);
    content = content.substring(startStr.length).trim();
    if (content.endsWith(')}')) {
        content = content.substring(0, content.length - 2).trim();
    }
    return content;
};

let soulJSX = getTabContent('soul');
soulJSX = soulJSX.replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/g, 'className="space-y-6"');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// The current `tareas` tab block looks like this:
/*
              {activeTab === 'tareas' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
                      Directivas (Tareas y Reglas)
                      <span className="text-xs font-normal text-muted-foreground">SOUL.md</span>
                    </h3>
                      
                    </div>
                  </div>
                </div>
              )}
*/

// Let's replace it with the proper one.

const newTareasTab = `              {activeTab === 'tareas' && editingAgent && (
                <div className="h-full overflow-y-auto p-6 pb-24">
                  <div className="bg-card border border-border rounded-xl p-6 shadow-sm max-w-4xl mx-auto">
                    <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
                      Directivas (Tareas y Reglas)
                      <span className="text-xs font-normal text-muted-foreground">SOUL.md</span>
                    </h3>
                    ${soulJSX}
                  </div>
                </div>
              )}`;

const blockToReplaceRegex = /\{activeTab === 'tareas' && editingAgent && \([\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

pageContent = pageContent.replace(blockToReplaceRegex, newTareasTab);

// Also, the `identidad` tab still has a malformed closing tag because it had:
//                      <h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
//                        Identidad y Personalidad
//                        <span className="text-xs font-normal text-muted-foreground">IDENTITY.md</span>
//                      </h3>
//                    </div>
//                  </div>
//                </div>
//              )}
// Actually, let's verify how the `identidad` tab ends in `page.tsx` right now.
fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done fixing tareas tab');
