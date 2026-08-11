import { useEffect, useState } from 'react';
import { useConcours } from '../hooks/useConcours';
import ConcoursCard from './ConcoursCard';
import FilterBar from './FilterBar';
import styles from './ConcoursList.module.css';

export default function ConcoursList() {
  const { concours, categories, competitionTypes, filters, setFilters, loading, error } = useConcours();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>(() =>
    window.localStorage.getItem('concours-view-mode') === 'grid' ? 'grid' : 'list',
  );
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
    <div>
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
        onPrint={openPrintView}
      />
      {loading ? (
        <p className={styles.empty}>Chargement du calendrier…</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : concours.length === 0 ? (
        <p className={styles.empty}>Aucun concours trouvé avec ces filtres.</p>
      ) : (
        <div className={viewMode === 'grid' ? styles.grid : styles.list}>
          {concours.map((c) => (
            <ConcoursCard key={c.id} concours={c} compact={viewMode === 'grid'} />
          ))}
        </div>
      )}
    </div>
  );
}
