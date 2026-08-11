import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useConcours } from '../hooks/useConcours';
import ConcoursCard from './ConcoursCard';
import FilterBar from './FilterBar';
import styles from './ConcoursList.module.css';

export default function ConcoursList() {
  const { concours, categories, competitionTypes, filters, setFilters, loading, error } = useConcours();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() =>
    window.localStorage.getItem('concours-view-mode') === 'grid' ? 'grid' : 'list',
  );
  const monthGroups = useMemo(() => {
    const groups = new Map<string, typeof concours>();
    concours.forEach((event) => {
      const key = event.date.slice(0, 7);
      groups.set(key, [...(groups.get(key) ?? []), event]);
    });
    return [...groups.entries()].map(([key, events]) => ({
      key,
      label: format(new Date(`${key}-01T00:00:00`), 'MMMM yyyy', { locale: fr }),
      anchorLabel: format(new Date(`${key}-01T00:00:00`), 'MMM yyyy', { locale: fr }),
      events,
    }));
  }, [concours]);

  const openPrintView = () => {
    const params = new URLSearchParams();
    filters.typeCompetitions?.forEach((type) => params.append('type', type));
    filters.categories?.forEach((category) => params.append('category', category));
    const query = params.toString();
    window.open(`/imprimer${query ? `?${query}` : ''}`, '_blank', 'noopener,noreferrer');
  };

  useEffect(() => {
    window.localStorage.setItem('concours-view-mode', viewMode);
  }, [viewMode]);

  return (
    <div className={styles.page}>
      {!loading && monthGroups.length > 0 && (
        <aside className={styles.monthNav} aria-label="Accès rapide aux mois">
          <span className={styles.monthNavTitle}>Mois</span>
          {monthGroups.map((month) => (
            <a key={month.key} href={`#mois-${month.key}`} className={styles.monthNavLink}>
              {month.anchorLabel}
            </a>
          ))}
        </aside>
      )}

      <div className={styles.printAction}>
        <button type="button" onClick={openPrintView}>Imprimer le calendrier</button>
        <span>Filtres actifs inclus</span>
      </div>

      <div className={styles.controls}>
        <h2 className={styles.heading}>Prochains concours</h2>
        <div className={styles.viewToggle} role="group" aria-label="Mode d'affichage">
          <button
            type="button"
            className={viewMode === 'list' ? styles.viewActive : styles.viewButton}
            aria-pressed={viewMode === 'list'}
            onClick={() => setViewMode('list')}
          >
            Liste
          </button>
          <button
            type="button"
            className={viewMode === 'grid' ? styles.viewActive : styles.viewButton}
            aria-pressed={viewMode === 'grid'}
            onClick={() => setViewMode('grid')}
          >
            Grille
          </button>
        </div>
        <FilterBar
          categories={categories}
          competitionTypes={competitionTypes}
          filters={filters}
          onFilterChange={setFilters}
        />
      </div>
      {loading ? (
        <p className={styles.empty}>Chargement du calendrier…</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : concours.length === 0 ? (
        <p className={styles.empty}>Aucun concours trouvé avec ces filtres.</p>
      ) : (
        <div className={styles.monthSections}>
          {monthGroups.map((month) => (
            <section className={styles.monthSection} id={`mois-${month.key}`} key={month.key}>
              <h3>{month.label}</h3>
              <div className={viewMode === 'grid' ? styles.grid : styles.list}>
                {month.events.map((event) => (
                  <ConcoursCard key={event.id} concours={event} compact={viewMode === 'grid'} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
