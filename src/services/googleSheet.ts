import type { Concours, TypeConcours } from '../types/concours';

type SheetRow = Record<string, string>;

const MONTHS: Record<string, number> = {
  janv: 0,
  janvier: 0,
  fevr: 1,
  fevrier: 1,
  mars: 2,
  avr: 3,
  avril: 3,
  mai: 4,
  juin: 5,
  juil: 6,
  juillet: 6,
  aout: 7,
  sept: 8,
  septembre: 8,
  oct: 9,
  octobre: 9,
  nov: 10,
  novembre: 10,
  dec: 11,
  decembre: 11,
};

function normalise(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function parseCsv(csv: string): SheetRow[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let value = '';
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    if (character === '"') {
      if (quoted && csv[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (character === ',' && !quoted) {
      row.push(value.trim());
      value = '';
    } else if ((character === '\n' || character === '\r') && !quoted) {
      if (character === '\r' && csv[index + 1] === '\n') index += 1;
      row.push(value.trim());
      if (row.some(Boolean)) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }
  row.push(value.trim());
  if (row.some(Boolean)) rows.push(row);

  const headers = rows.shift()?.map(normalise) ?? [];
  return rows.map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])),
  );
}

function getValue(row: SheetRow, header: string): string {
  return row[normalise(header)]?.trim() ?? '';
}

function getSeasonStartYear(): number {
  const now = new Date();
  return now.getMonth() >= 6 ? now.getFullYear() : now.getFullYear() - 1;
}

function parseDate(value: string, year: number): { date: string; month: number } | null {
  const match = normalise(value).match(/^(\d{1,2})\s*[-/]\s*([a-z]+)/);
  if (!match) return null;
  const month = MONTHS[match[2].replace(/\.$/, '')];
  if (month === undefined) return null;
  return { date: `${year}-${String(month + 1).padStart(2, '0')}-${match[1].padStart(2, '0')}`, month };
}

function parseTime(value: string): string {
  const match = value.match(/(\d{1,2})\s*(?:h|:|heure)\s*(\d{2})?/i);
  if (!match) return '';
  return `${match[1].padStart(2, '0')}:${(match[2] ?? '00').padStart(2, '0')}`;
}

function mapType(value: string): TypeConcours {
  const type = normalise(value);
  if (type.includes('nm3')) return 'ch_regional_nm3';
  if (type.includes('des as')) return 'ch_dep_as';
  if (type.includes('m4')) return 'ch_dep_m4';
  if (type.includes('france')) return 'ch_france';
  if (type.includes('fempoint')) return 'fem_point';
  if (type.includes('veteran')) return 'veterans';
  if (type.includes('regional')) return 'ch_regional';
  if (type.includes('departemental')) return 'ch_dep';
  return 'concours';
}

function parseContact(value: string) {
  const email = value.match(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/)?.[0];
  const telephone = value.match(/(?:\+33|0)[\d .-]{8,}/)?.[0]?.trim();
  const nom = value
    .replace(email ?? '', '')
    .replace(telephone ?? '', '')
    .replace(/[,:;-]+$/g, '')
    .trim();
  return { nom: nom || (email ? 'Contact' : 'CBDA'), ...(telephone && { telephone }), ...(email && { email }) };
}

function hash(value: string): string {
  let result = 5381;
  for (let index = 0; index < value.length; index += 1) {
    result = (result * 33) ^ value.charCodeAt(index);
  }
  return (result >>> 0).toString(36);
}

export async function fetchConcoursFromGoogleSheet(): Promise<Concours[]> {
  const response = await fetch('/api/concours', { cache: 'no-store' });
  if (!response.ok) throw new Error(`La feuille Google n'est pas accessible (${response.status}).`);

  const rows = parseCsv(await response.text());
  const concours: Concours[] = [];
  let year = getSeasonStartYear();
  let previousMonth: number | undefined;

  rows.forEach((row, index) => {
    const parsedDate = parseDate(getValue(row, 'DATES'), year);
    if (!parsedDate) return;
    if (previousMonth !== undefined && previousMonth - parsedDate.month > 6) year += 1;
    const date = parseDate(getValue(row, 'DATES'), year);
    previousMonth = parsedDate.month;
    const titre = getValue(row, 'LIBELLE COMPETITION');
    if (!date || !titre) return;

    const lieu = getValue(row, 'LIEUX');
    const type = getValue(row, 'TYPES COMPETITION');
    const contact = getValue(row, 'REFERENT ET CONTACT');
    concours.push({
      id: hash(`${date.date}|${titre}|${lieu}|${index}`),
      titre,
      type: mapType(type),
      date: date.date,
      heureDebut: parseTime(getValue(row, 'HEURE')),
      lieu: { nom: lieu, ville: lieu, adresse: '', codePostal: '' },
      contact: parseContact(contact),
      categorie: getValue(row, 'CATEGORIE (S)') || undefined,
      organisateur: getValue(row, 'ORGANISATEUR') || undefined,
      description: type || undefined,
    });
  });

  if (concours.length === 0) throw new Error('Aucun concours valide n’a été trouvé dans la feuille Google.');
  return concours;
}
