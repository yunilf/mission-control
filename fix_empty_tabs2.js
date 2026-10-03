const fs = require('fs');

const modalCode = fs.readFileSync('modal_backup.tsx', 'utf8');

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

const conocimientoJSX = getTabContent('conocimiento').replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/g, 'className="space-y-6"');
const canalesJSX = getTabContent('canales').replace(/className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"/g, 'className="space-y-4"');
const integracionesJSX = getTabContent('tools').replace(/className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300"/g, 'className="space-y-4"');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

pageContent = pageContent.replace(
  /<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Base de Conocimiento<\/h3>\s*<\/div>/,
  '<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Base de Conocimiento</h3>\n                    ' + conocimientoJSX + '\n                  </div>'
);

pageContent = pageContent.replace(
  /<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Canales de Comunicación<\/h3>\s*<\/div>/,
  '<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Canales de Comunicación</h3>\n                    ' + canalesJSX + '\n                  </div>'
);

pageContent = pageContent.replace(
  /<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Integraciones y Plugins<\/h3>\s*<\/div>/,
  '<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5">Integraciones y Plugins</h3>\n                    ' + integracionesJSX + '\n                  </div>'
);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done fixing empty tabs no template literal');
