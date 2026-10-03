const fs = require('fs');

let pageContent = fs.readFileSync('src/app/agents/page.tsx', 'utf8');

const effectInjection = `
  useEffect(() => {
    const unsubDuties = onSnapshot(doc(db, "settings", "duties"), (docSnap) => {
      if (docSnap.exists() && docSnap.data().list) {
        setDutiesList(docSnap.data().list);
      } else {
        setDutiesList([
          "Investigador de internet",
          "Generador de código",
          "Analista de datos",
          "Soporte técnico"
        ]);
      }
    });
    return () => unsubDuties();
  }, []);

  const handleAddDuty = async () => {
    if (!newDutyTemp.trim()) return;
    const newList = [...dutiesList, newDutyTemp.trim()];
    setDutiesList(newList);
    setNewDutyTemp('');
    try {
      await setDoc(doc(db, "settings", "duties"), { list: newList });
    } catch(e) {
      console.error(e);
    }
  };

  const handleRemoveDuty = async (index: number) => {
    const newList = dutiesList.filter((_, i) => i !== index);
    setDutiesList(newList);
    try {
      await setDoc(doc(db, "settings", "duties"), { list: newList });
    } catch(e) {
      console.error(e);
    }
  };
`;

// Insert it correctly using regex to ignore \r\n differences
pageContent = pageContent.replace(
    /useEffect\(\(\) => \{\s*const unsubAgents = onSnapshot/,
    effectInjection + '\n  useEffect(() => {\n    const unsubAgents = onSnapshot'
);

fs.writeFileSync('src/app/agents/page.tsx', pageContent, 'utf8');
console.log('done patching properly');
