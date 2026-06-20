// Regenera lib/system-prompt.ts a partir de lib/knowledge/persona.md + blueprint.md
// Rode com: npm run build:prompt
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const persona = fs.readFileSync(path.join(root, "lib/knowledge/persona.md"), "utf8");
const blueprint = fs.readFileSync(path.join(root, "lib/knowledge/blueprint.md"), "utf8");

const full = `# IDENTIDADE E PERSONA

${persona}

---

# CONHECIMENTO BASE — BLUEPRINT DE ROTEIRO VIRAL v2.0

> Este é o manual técnico completo que você domina de memória. Aplique-o de forma adaptada a cada roteiro, nunca como template engessado.

${blueprint}`;

const escaped = full
  .replace(/\\/g, "\\\\")
  .replace(/`/g, "\\`")
  .replace(/\$\{/g, "\\${");

const out = `// AUTO-GERADO a partir de lib/knowledge/persona.md + lib/knowledge/blueprint.md
// Para atualizar o conhecimento do Steve, edite os .md em lib/knowledge/ e rode: npm run build:prompt
export const SYSTEM_PROMPT = \`${escaped}\`;
`;

fs.writeFileSync(path.join(root, "lib/system-prompt.ts"), out);
console.log("✓ lib/system-prompt.ts regenerado —", out.length, "caracteres");
