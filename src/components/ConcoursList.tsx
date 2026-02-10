import { useConcours } from '../hooks/useConcours';
import ConcoursCard from './ConcoursCard';
import FilterBar from './FilterBar';
import styles from './ConcoursList.module.css';

export default function ConcoursList() {
  const { concours, filters, setFilters, villes } = useConcours();

  return (
    <div>
      <h2 className={styles.heading}>Prochains concours</h2>
      <FilterBar filters={filters} villes={villes} onFilterChange={setFilters} />
      {concours.length === 0 ? (
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
