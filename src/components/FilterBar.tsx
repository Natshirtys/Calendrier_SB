import type { TypeConcours } from '../types/concours';
import { TYPE_CONCOURS_LABELS } from '../types/concours';
import type { Filters } from '../hooks/useConcours';
import styles from './FilterBar.module.css';

interface Props {
  categories: string[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export default function FilterBar({ categories, filters, onFilterChange }: Props) {
  const toggleCategory = (category: string) => {
    const selected = filters.categories ?? [];
    const nextCategories = selected.includes(category)
      ? selected.filter((value) => value !== category)
      : [...selected, category];
    onFilterChange({ ...filters, categories: nextCategories.length ? nextCategories : undefined });
  };

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

      {categories.length > 0 && (
        <fieldset className={styles.categories}>
          <legend className={styles.categoryLabel}>Catégories</legend>
          <div className={styles.categoryChoices}>
            {categories.map((category) => {
              const selected = filters.categories?.includes(category) ?? false;
              return (
                <button
                  key={category}
                  type="button"
                  className={`${styles.category} ${selected ? styles.categorySelected : ''}`}
                  onClick={() => toggleCategory(category)}
                  aria-pressed={selected}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {(filters.type || filters.categories?.length) && (
        <button className={styles.reset} onClick={() => onFilterChange({})}>
          Effacer les filtres
        </button>
      )}
    </div>
  );
}
