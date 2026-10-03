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

let identityJSX = getTabContent('identidad');
identityJSX = identityJSX.replace(/className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300"/g, 'className="space-y-6"');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const blockToReplaceRegex = /<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">\s*Identidad y Personalidad\s*<span className="text-xs font-normal text-muted-foreground">IDENTITY\.md<\/span>\s*<\/h3>\s*<\/div>/;

const newIdentityBlock = `<h3 className="text-lg font-semibold border-b border-border pb-3 mb-5 flex items-center justify-between">
                        Identidad y Personalidad
                        <span className="text-xs font-normal text-muted-foreground">IDENTITY.md</span>
                      </h3>
                      ${identityJSX}
                    </div>`;

pageContent = pageContent.replace(blockToReplaceRegex, newIdentityBlock);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done fixing identidad tab');
