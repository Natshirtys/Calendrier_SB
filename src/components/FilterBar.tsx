import type { TypeConcours } from '../types/concours';
import { TYPE_CONCOURS_LABELS } from '../types/concours';
import type { Filters } from '../hooks/useConcours';
import styles from './FilterBar.module.css';

interface Props {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export default function FilterBar({ filters, onFilterChange }: Props) {
  return (
    <div className={styles.bar}>
      <select
        className={styles.select}
        value={filters.type ?? ''}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            type: (e.target.value || undefined) as TypeConcours | undefined,
          })
        }
      >
        <option value="">Tous les types</option>
        {Object.entries(TYPE_CONCOURS_LABELS).map(([key, label]) => (
          <option key={key} value={key}>
            {label}
          </option>
        ))}
      </select>

      {filters.type && (
        <button
          className={styles.reset}
          onClick={() => onFilterChange({})}
        >
          Effacer les filtres
        </button>
      )}
    </div>
  );
}
