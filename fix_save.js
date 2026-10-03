const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const newSaveBlock = `  const handleSaveEdit = async () => {
    if (!editingAgent) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, "agents", editingAgent.id), {
        name: editingAgent.name,
        role: editingAgent.role,
        clientId: editingAgent.clientId || "",
        whatsappEnabled: editingAgent.whatsappEnabled || false,
        whatsappNumber: editingAgent.whatsappNumber || "",
        telegramEnabled: editingAgent.telegramEnabled || false,
        identity: editingAgent.identity || "",
        identityData: editingAgent.identityData || {},
        soul: editingAgent.soul || "",
        soulData: editingAgent.soulData || {},
        knowledgeBase: editingAgent.knowledgeBase || [],
        tools: editingAgent.tools || []
      });
      alert("Cambios guardados exitosamente.");
    } catch (e: any) {
      alert("Error guardando cambios: " + e.message);
    } finally {
      setIsSaving(false);
    }
  };`;

pageContent = pageContent.replace(/const handleSaveEdit = async \(\) => \{[\s\S]*?setIsSaving\(false\);\n    \}\n  \};/, newSaveBlock);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done fixing handleSaveEdit');
