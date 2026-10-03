const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

// Move STRICT_RULES_OPTIONS outside the component and export it
const strictRulesRegex = /const STRICT_RULES_OPTIONS = \[[\s\S]*?\];/;
const match = pageContent.match(strictRulesRegex);

if (match) {
    const rulesDef = match[0];
    
    // Remove it from inside the component
    pageContent = pageContent.replace(rulesDef, '');
    
    // Insert it after imports
    const exportDef = "export " + rulesDef;
    const importsEnd = pageContent.indexOf("export default function");
    pageContent = pageContent.substring(0, importsEnd) + exportDef + "\n\n" + pageContent.substring(importsEnd);
    
    fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
    
    // Now modify AgentModals.tsx
    let modalContent = fs.readFileSync('src/components/AgentModals.tsx', 'utf8');
    
    // Add import
    const importStatement = "import { STRICT_RULES_OPTIONS } from '@/app/agents/page';\n";
    const modalImportsEnd = modalContent.lastIndexOf("import ");
    const nextLine = modalContent.indexOf("\n", modalImportsEnd);
    modalContent = modalContent.substring(0, nextLine + 1) + importStatement + modalContent.substring(nextLine + 1);
    
    // Modify the handleAddAgent payload
    const identityDataPayload = `identityData: {
          ruleChecklist: STRICT_RULES_OPTIONS
        },`;
        
    modalContent = modalContent.replace("identityData: {},", identityDataPayload);
    
    fs.writeFileSync('src/components/AgentModals.tsx', modalContent, 'utf8');
    console.log("done updating both files");
} else {
    console.log("Could not find STRICT_RULES_OPTIONS in page.tsx");
}
