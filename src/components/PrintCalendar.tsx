import { Fragment, useEffect, useMemo, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useSearchParams } from 'react-router-dom';
import { filterConcours, type Filters, useConcours } from '../hooks/useConcours';
import styles from './PrintCalendar.module.css';

function filtersFromSearchParams(searchParams: URLSearchParams): Filters {
  const typeCompetitions = searchParams.getAll('type');
  const categories = searchParams.getAll('category');
  return {
    typeCompetitions: typeCompetitions.length ? typeCompetitions : undefined,
    categories: categories.length ? categories : undefined,
  };
}

export default function PrintCalendar() {
  const [searchParams] = useSearchParams();
  const { allConcours, loading, error } = useConcours();
  const printRequested = useRef(false);
  const filters = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const concours = useMemo(() => filterConcours(allConcours, filters), [allConcours, filters]);
  const filterSummary = [
    filters.typeCompetitions?.length ? `Types : ${filters.typeCompetitions.join(', ')}` : '',
    filters.categories?.length ? `Catégories : ${filters.categories.join(', ')}` : '',
  ].filter(Boolean).join(' — ') || 'Aucun filtre : toutes les compétitions sont incluses.';
  const months = useMemo(() => {
    const groups = new Map<string, typeof concours>();
    concours.forEach((event) => {
      const key = event.date.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), event]);
    });
    return [...groups.entries()].map(([key, events]) => ({
      key,
      label: format(new Date(`${key}-01T00:00:00`), 'MMMM yyyy', { locale: fr }),
      events,
    }));
  }, [concours]);
  const hasArbitres = concours.some((event) => event.arbitres?.length);
  const hasDelegues = concours.some((event) => event.delegues?.length);

  useEffect(() => {
    if (loading || error || printRequested.current) return;
    printRequested.current = true;
    const timeout = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(timeout);
  }, [error, loading]);

  if (loading) return <p className={styles.status}>Préparation de l’impression…</p>;
  if (error) return <p className={styles.status}>Impossible de préparer l’impression : {error}</p>;

  return (
    <article className={styles.document}>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => window.print()}>Imprimer</button>
        <button type="button" onClick={() => window.close()}>Fermer</button>
      </div>
      <header className={styles.documentHeader}>
        <h1>Calendrier CBDA — saison 2026-2027</h1>
        <p>{filterSummary}</p>
        <p>{concours.length} compétition{concours.length > 1 ? 's' : ''}</p>
      </header>
      {concours.length === 0 ? (
        <p className={styles.empty}>Aucune compétition ne correspond aux filtres sélectionnés.</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.date}>Date</th>
              <th className={styles.time}>Heure</th>
              <th className={styles.type}>Type</th>
              <th className={styles.title}>Compétition</th>
              <th className={styles.category}>Cat.</th>
              <th className={styles.place}>Lieu</th>
              {hasArbitres && <th className={styles.official}>Arbitre</th>}
              {hasDelegues && <th className={styles.official}>Délégué</th>}
            </tr>
          </thead>
          <tbody>
            {months.map((month) => (
              <Fragment key={month.key}>
                <tr className={styles.monthRow}>
                  <th colSpan={6 + Number(hasArbitres) + Number(hasDelegues)}>{month.label}</th>
                </tr>
                {month.events.map((event) => (
                  <tr key={event.id}>
                    <td className={styles.date}>{format(new Date(`${event.date}T00:00:00`), 'EEE d', { locale: fr })}</td>
                    <td className={styles.time}>{event.heureDebut || '—'}</td>
                    <td className={styles.type} title={event.typeCompetition}>
                      <span className={styles.dot} style={event.couleur ? { backgroundColor: event.couleur } : undefined} />
                      {event.typeCompetition ?? '—'}
                    </td>
                    <td className={styles.title} title={event.titre}>{event.titre}</td>
                    <td className={styles.category}>{event.categorie || '—'}</td>
                    <td className={styles.place} title={event.lieu.nom}>{event.lieu.nom || '—'}</td>
                    {hasArbitres && <td className={styles.official} title={event.arbitres?.join(', ')}>{event.arbitres?.join(', ') || '—'}</td>}
                    {hasDelegues && <td className={styles.official} title={event.delegues?.join(', ')}>{event.delegues?.join(', ') || '—'}</td>}
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </article>
  );
}
