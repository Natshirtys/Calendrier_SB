const SHEET_ID = '1e7Nszu_QLC3a8JepEEjQafPYTwcpxMah';

export default async function handler(_request, response) {
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Couleurs`;

  try {
    const sheetResponse = await fetch(sheetUrl);
    if (!sheetResponse.ok) {
      return response.status(502).json({ error: 'L’onglet Couleurs est indisponible.' });
    }

    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Cache-Control', 'no-store');
    return response.status(200).send(await sheetResponse.text());
  } catch {
    return response.status(502).json({ error: 'Impossible de joindre l’onglet Couleurs.' });
  }
}
