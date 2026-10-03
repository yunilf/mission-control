const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const genIdRegex = /const generateIdentity = \(data: any\) => \{[\s\S]*?return md;\s*\};/;
const match = pageContent.match(genIdRegex);

if (match) {
    const fnDef = match[0];
    
    // Remove it from inside the component
    pageContent = pageContent.replace(fnDef, '');
    
    // Insert it after imports
    const exportDef = "export " + fnDef;
    const importsEnd = pageContent.indexOf("export default function");
    pageContent = pageContent.substring(0, importsEnd) + exportDef + "\n\n" + pageContent.substring(importsEnd);
    
    fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
    
    // Now modify AgentModals.tsx
    let modalContent = fs.readFileSync('src/components/AgentModals.tsx', 'utf8');
    
    // Update import
    modalContent = modalContent.replace(
        "import { STRICT_RULES_OPTIONS } from '@/app/agents/page';", 
        "import { STRICT_RULES_OPTIONS, generateIdentity } from '@/app/agents/page';"
    );
    
    // Update payload
    const identityPayloadOld = `identity: "",`;
    const identityPayloadNew = `identity: generateIdentity({ ruleChecklist: STRICT_RULES_OPTIONS }),`;
    
    modalContent = modalContent.replace(identityPayloadOld, identityPayloadNew);
    
    fs.writeFileSync('src/components/AgentModals.tsx', modalContent, 'utf8');
    console.log("done updating both files with generateIdentity");
} else {
    console.log("Could not find generateIdentity in page.tsx");
}
