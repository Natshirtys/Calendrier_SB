const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const wb = XLSX.readFile(path.join(__dirname, '../public/calendrier/calendrier_cbda_2025_2026.xlsx'));
const ws = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
const dataRows = rows.slice(1);

function parseDate(dateStr) {
  const str = String(dateStr).trim();
  const match = str.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return null;
  return match[3] + '-' + match[2] + '-' + match[1];
}

function parseTime(timeStr) {
  const str = String(timeStr || '').trim();
  const match = str.match(/(\d+)h(\d{2})/);
  if (!match) return '';
  return match[1].padStart(2, '0') + ':' + match[2];
}

const TYPE_MAP = {
  'CONCOURS':                          'concours',
  'Ch. régional NM3':                  'ch_regional_nm3',
  'Championnat départemental des A.S.': 'ch_dep_as',
  'Ch. départemental M4':              'ch_dep_m4',
  'Ch. départemental':                 'ch_dep',
  'Ch. régional':                      'ch_regional',
  'Ch. régional des A.S.':             'ch_regional_as',
  'Championnat de France':             'ch_france',
  "Fém'point":                         'fem_point',
  'Vétérans':                          'veterans',
};

function mapType(excelType) {
  const key = String(excelType || '').trim();
  return TYPE_MAP[key] || 'concours';
}

function parseLocation(locationStr) {
  if (!locationStr) return { nom: '', ville: '', adresse: '', codePostal: '' };
  let loc = String(locationStr).trim().replace(/[-\s]+$/, '').trim();
  // Pattern "BOULODROME à VILLE"
  const aMatch = loc.match(/^(.+?)\s+\u00e0\s+(.+)$/i);
  if (aMatch) {
    const ville = aMatch[2].replace(/\s*[-\(]\s*\d+\s*\)?$/, '').trim();
    return { nom: aMatch[1].trim(), ville, adresse: '', codePostal: '' };
  }
  // Ville seule (retirer le numéro de département éventuel)
  const ville = loc.replace(/\s*[-\(]\s*\d+\s*\)?$/, '').trim();
  return { nom: loc, ville, adresse: '', codePostal: '' };
}

function parseContact(refereeStr, phoneStr) {
  const referee = String(refereeStr || '').trim();
  const phone = String(phoneStr || '').trim();
  if (!referee && !phone) return { nom: 'CBDA' };
  if (referee.includes('@')) {
    const c = { nom: 'Secrétariat CBDA', email: referee };
    if (phone) c.telephone = phone;
    return c;
  }
  const c = { nom: referee || 'CBDA' };
  if (phone) c.telephone = phone;
  return c;
}

const concours = [];
let id = 1;

for (const row of dataRows) {
  const dateStr   = row[4];
  const timeStr   = row[5];
  const location  = row[6];
  const description = row[7];
  const excelType = row[8];
  const referee   = row[9];
  const phone     = row[10];

  const desc = String(description || '').trim();
  if (!desc) continue;

  const date = parseDate(String(dateStr || ''));
  if (!date) continue;

  concours.push({
    id: String(id++),
    titre: desc,
    type: mapType(excelType),
    date,
    heureDebut: parseTime(timeStr),
    lieu: parseLocation(String(location || '')),
    contact: parseContact(referee, phone)
  });
}

const outputPath = path.join(__dirname, '../src/data/concours.json');
fs.writeFileSync(outputPath, JSON.stringify(concours, null, 2), 'utf-8');
console.log(concours.length + ' concours écrits dans ' + outputPath);
