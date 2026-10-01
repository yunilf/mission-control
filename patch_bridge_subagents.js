const fs = require('fs');
let content = fs.readFileSync('\\\\wsl.localhost\\Ubuntu\\home\\yunil\\agencia-bots\\yunai-bridge-sync.mjs', 'utf-8');

// Replace the parsing part
const targetConfigParse = `        let localAiModel = "google/gemini-2.5-flash";
        let openclawConfig = null;
        if (fs.existsSync(openclawConfigPath)) {
            try {
                openclawConfig = JSON.parse(fs.readFileSync(openclawConfigPath, "utf-8"));
                if (openclawConfig?.agents?.entries?.main?.model) {
                    localAiModel = openclawConfig.agents.entries.main.model;
                }
            } catch(e) {}
        }`;

const replacementConfigParse = `        let localAiModel = "google/gemini-2.5-flash";
        let localSubagents = [];
        let openclawConfig = null;
        if (fs.existsSync(openclawConfigPath)) {
            try {
                openclawConfig = JSON.parse(fs.readFileSync(openclawConfigPath, "utf-8"));
                if (openclawConfig?.agents?.entries) {
                    if (openclawConfig.agents.entries.main?.model) {
                        localAiModel = openclawConfig.agents.entries.main.model;
                    }
                    for (const [key, value] of Object.entries(openclawConfig.agents.entries)) {
                        if (key !== "main") {
                            localSubagents.push({
                                name: key,
                                model: value.model || "google/gemini-2.5-flash"
                            });
                        }
                    }
                }
            } catch(e) {}
        }`;
content = content.replace(targetConfigParse, replacementConfigParse);

// Update telemetry object
const targetTelemetry = `            aiModel: { stringValue: localAiModel },`;
const replacementTelemetry = `            aiModel: { stringValue: localAiModel },
            subagents: { arrayValue: { values: localSubagents.map(sub => ({
                mapValue: {
                    fields: {
                        name: { stringValue: sub.name },
                        model: { stringValue: sub.model }
                    }
                }
            })) } },`;
content = content.replace(targetTelemetry, replacementTelemetry);

fs.writeFileSync('\\\\wsl.localhost\\Ubuntu\\home\\yunil\\agencia-bots\\yunai-bridge-sync.mjs', content);
console.log('done');
