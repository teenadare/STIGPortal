#!/usr/bin/env node
// =============================================================================
// Generate a column-level DATA DICTIONARY from docs/schema.sql (single source
// of truth). Produces:
//   docs/DATA_DICTIONARY.md   - readable table-by-table reference
//   docs/data_dictionary.csv  - flat one-row-per-column export (Excel-friendly)
//
// No database / no dependencies:  node scripts/gen_data_dictionary.mjs
// Parses the DDL directly, so it always matches the real schema.
// =============================================================================
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DOCS = join(__dirname, '..', 'docs');
const sql = readFileSync(join(DOCS, 'schema.sql'), 'utf8');
const lines = sql.split('\n');

const CONSTRAINT_STARTS = /^(UNIQUE|PRIMARY|FOREIGN|CHECK|CONSTRAINT)\b/i;
const isDashOnly = (c) => /^[-\s]*$/.test(c);

// Split a code fragment into chunks on top-level (depth 0) commas.
function splitTopLevel(code) {
  const out = [];
  let depth = 0, cur = '';
  for (const ch of code) {
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    if (ch === ',' && depth === 0) { out.push(cur); cur = ''; }
    else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

// Parse one column chunk -> descriptor.
function parseColumn(chunk, comment) {
  const code = chunk.trim().replace(/\s+/g, ' ');
  const m = code.match(/^([a-z_][a-z0-9_]*)\s+([A-Za-z]+(?:\(\d+\))?)/);
  if (!m) return null;
  const [, name, type] = m;

  const pk = /PRIMARY KEY/i.test(code);
  const notNull = pk || /NOT NULL/i.test(code);
  const unique = /\bUNIQUE\b/i.test(code);

  let def = null;
  const dm = code.match(/DEFAULT\s+([^\s,]+)/i);
  if (dm) def = dm[1];

  let ref = null;
  const rm = code.match(/REFERENCES\s+([a-z_]+)\s*\(\s*([a-z_]+)\s*\)/i);
  if (rm) ref = `${rm[1]}.${rm[2]}`;

  let allowed = null;
  const cm = code.match(/CHECK\s*\([^)]*IN\s*\(([^)]*)\)/i);
  if (cm) allowed = (cm[1].match(/'([^']*)'/g) || []).map((s) => s.replace(/'/g, '')).join(', ');

  const key = [pk ? 'PK' : null, ref ? 'FK' : null, unique && !pk ? 'UQ' : null].filter(Boolean).join(', ');
  return {
    column: name, type: type.toUpperCase(), nullable: notNull ? 'NO' : 'YES',
    key, default: def, references: ref, allowed, description: (comment || '').trim(),
  };
}

// ---- Walk the file: capture preceding comment block as table description ----
const tables = [];
let pendingComments = [];
let cur = null;

for (let i = 0; i < lines.length; i++) {
  const raw = lines[i];
  const codePart = raw.split('--')[0];
  const commentPart = raw.includes('--') ? raw.slice(raw.indexOf('--') + 2).trim() : '';

  if (!cur) {
    const t = codePart.match(/^\s*CREATE TABLE\s+([a-z_]+)\s*\(/i);
    if (t) {
      const desc = pendingComments.filter((c) => !isDashOnly(c)).join(' ').replace(/^[-\s]+/, '').trim();
      cur = { name: t[1], description: desc, codeBuf: '', pendingCol: '', pendingComment: '' };
      pendingComments = [];
      continue;
    }
    // collect a running block of comment lines (reset on blank/other code)
    if (/^\s*--/.test(raw)) pendingComments.push(commentPart);
    else pendingComments = [];
    continue;
  }

  // inside a table body
  if (/^\s*\)\s*;/.test(codePart)) {
    // finalize any remaining chunk
    cur.codeBuf += ' ';
    const chunks = splitTopLevel(cur.codeBuf);
    cur.columns = [];
    for (const chunkRaw of chunks) {
      const chunk = chunkRaw.trim();
      if (!chunk || CONSTRAINT_STARTS.test(chunk)) continue;
      const col = parseColumn(chunk, cur.colComments?.[chunk.split(/\s/)[0]]);
      if (col) cur.columns.push(col);
    }
    tables.push(cur);
    cur = null;
    pendingComments = [];
    continue;
  }

  // Accumulate code; remember a per-column comment keyed by the column name on this line
  cur.codeBuf += codePart + ' ';
  const colNameOnLine = codePart.match(/^\s*([a-z_][a-z0-9_]*)\s+[A-Za-z]/);
  if (colNameOnLine && commentPart) {
    cur.colComments = cur.colComments || {};
    cur.colComments[colNameOnLine[1]] = commentPart;
  }
}

// ---- Emit Markdown ----
const md = [
  '# STIG Portal — Data Dictionary',
  '',
  '_Generated from `docs/schema.sql` by `scripts/gen_data_dictionary.mjs`. Do not hand-edit._',
  '',
  `Tables: **${tables.length}** · Columns: **${tables.reduce((n, t) => n + t.columns.length, 0)}**`,
  '',
  '| Legend | |',
  '|---|---|',
  '| PK | Primary key |',
  '| FK | Foreign key (see References) |',
  '| UQ | Unique constraint |',
  '',
];
for (const t of tables) {
  md.push(`## \`${t.name}\``);
  if (t.description) md.push('', t.description);
  md.push('', '| Column | Type | Null | Key | Default | References | Allowed values | Description |',
              '|---|---|---|---|---|---|---|---|');
  for (const c of t.columns) {
    md.push(`| \`${c.column}\` | ${c.type} | ${c.nullable} | ${c.key || ''} | ${c.default ? '`' + c.default + '`' : ''} | ${c.references || ''} | ${c.allowed || ''} | ${c.description.replace(/\|/g, '\\|')} |`);
  }
  md.push('');
}
writeFileSync(join(DOCS, 'DATA_DICTIONARY.md'), md.join('\n'), 'utf8');

// ---- Emit CSV ----
const csvField = (v) => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = [['table', 'ordinal', 'column', 'type', 'nullable', 'key', 'default', 'references', 'allowed_values', 'description'].join(',')];
for (const t of tables) {
  t.columns.forEach((c, idx) => {
    csv.push([t.name, idx + 1, c.column, c.type, c.nullable, c.key, c.default, c.references, c.allowed, c.description].map(csvField).join(','));
  });
}
writeFileSync(join(DOCS, 'data_dictionary.csv'), csv.join('\n') + '\n', 'utf8');

console.log(`Wrote docs/DATA_DICTIONARY.md and docs/data_dictionary.csv`);
console.log(`Tables: ${tables.length}`);
console.table(Object.fromEntries(tables.map((t) => [t.name, t.columns.length])));
