const fs = require('node:fs');
const path = require('node:path');
let ts;
try { ts = require('typescript'); } catch { console.error('TypeScript dependency is not installed. Run npm install first.'); process.exit(2); }
let total = 0, errors = 0;
function walk(dir) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(file);
    else if (/\.(ts|tsx)$/.test(file)) {
      total++;
      const out = ts.transpileModule(fs.readFileSync(file, 'utf8'), { fileName: file, reportDiagnostics: true, compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.ESNext, jsx: ts.JsxEmit.Preserve } });
      const ds = (out.diagnostics || []).filter(d => d.category === ts.DiagnosticCategory.Error);
      if (ds.length) { errors++; console.error(`\n${file}`); for (const d of ds) console.error(ts.flattenDiagnosticMessageText(d.messageText, '\n')); }
    }
  }
}
walk('src');
console.log(`Syntax transpilation: ${total} files, ${errors} file(s) with syntax errors.`);
process.exit(errors ? 1 : 0);
