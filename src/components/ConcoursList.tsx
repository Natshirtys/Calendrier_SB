import { useConcours } from '../hooks/useConcours';
import ConcoursCard from './ConcoursCard';
import FilterBar from './FilterBar';
import styles from './ConcoursList.module.css';

export default function ConcoursList() {
  const { concours, categories, filters, setFilters, loading, error } = useConcours();

  return (
    <div>
      <h2 className={styles.heading}>Prochains concours</h2>
      <FilterBar categories={categories} filters={filters} onFilterChange={setFilters} />
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
