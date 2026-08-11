import { useConcours } from '../hooks/useConcours';
import ConcoursCard from './ConcoursCard';
import FilterBar from './FilterBar';
import styles from './ConcoursList.module.css';

export default function ConcoursList() {
  const { concours, categories, competitionTypes, filters, setFilters, loading, error } = useConcours();
  const openPrintView = () => {
    const params = new URLSearchParams();
    filters.typeCompetitions?.forEach((type) => params.append('type', type));
    filters.categories?.forEach((category) => params.append('category', category));
    const query = params.toString();
    window.open(`/imprimer${query ? `?${query}` : ''}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <h2 className={styles.heading}>Prochains concours</h2>
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
        <div className={styles.list}>
          {concours.map((c) => (
            <ConcoursCard key={c.id} concours={c} />
          ))}
        </div>
      )}
    </div>
  );
}
