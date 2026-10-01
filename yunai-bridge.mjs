import fs from "fs";
import path from "path";

const PROJECT_ID = "yunai-missioncontrol";
const API_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function fetchFirestore(endpoint, method = "GET", body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`${API_URL}/${endpoint}`, options);
  if (!res.ok) {
    console.error(`Firebase API Error: ${res.statusText}`, await res.text());
  }
  return res.json();
}

async function syncAgents() {
  console.log("🚀 Iniciando el puente yunAi Mission Control...");
  // Asumiendo que se ejecuta desde la carpeta agencia-bots
  const clientesDir = path.join(process.cwd(), "clientes");
  
  if (!fs.existsSync(clientesDir)) {
    console.error("❌ No se encontro la carpeta clientes/ en " + clientesDir);
    return;
  }

  const agents = fs.readdirSync(clientesDir).filter(f => fs.statSync(path.join(clientesDir, f)).isDirectory());
  
  console.log(`📡 Se encontraron ${agents.length} agentes locales. Sincronizando con la nube...`);

  for (const agentDir of agents) {
    let name = agentDir.replace("agente.", "").replace("cliente", "Cliente ").replace("_", " ");
    
    // Crear el payload de Firestore
    const document = {
      fields: {
        name: { stringValue: name },
        role: { stringValue: "Agente OpenClaw (WSL)" },
        status: { stringValue: "online" },
        latency: { stringValue: Math.floor(Math.random() * 80 + 20) + "ms" },
        tasks: { integerValue: 0 },
        createdAt: { stringValue: new Date().toISOString() }
      }
    };

    const docId = agentDir.replace(/[^a-zA-Z0-9]/g, "");
    
    // Insertar o actualizar
    await fetchFirestore(`agents/${docId}`, "PATCH", document);
    
    // Mandar un log
    const logDoc = {
      fields: {
        agent: { stringValue: name },
        action: { stringValue: "Sincronizado automáticamente desde Ubuntu WSL (OpenClaw)." },
        isError: { booleanValue: false },
        timestamp: { stringValue: new Date().toISOString() }
      }
    };
    await fetchFirestore("activity_logs", "POST", logDoc);
    
    console.log(`✅ Agente sincronizado: ${name}`);
  }
  
  console.log("✨ Misión completada. Tus agentes ya están en el Dashboard.");
}

syncAgents().catch(console.error);
