const fs = require('fs');
let content = fs.readFileSync('src/app/agents/page.tsx', 'utf-8');

const stateInject = `  const [activeTab, setActiveTab] = useState("monitor");
  const [showSubagentModal, setShowSubagentModal] = useState(false);
  const [newSubagentName, setNewSubagentName] = useState('');
  const [newSubagentMission, setNewSubagentMission] = useState('');
  const [isSavingSubagent, setIsSavingSubagent] = useState(false);
`;
content = content.replace(/  const \[activeTab, setActiveTab\] = useState\("monitor"\);/, stateInject);

fs.writeFileSync('src/app/agents/page.tsx', content, 'utf8');
console.log('done fixing state');
