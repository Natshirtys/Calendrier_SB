import { useState } from 'react';
import type { CompetitionTypeOption, Filters } from '../hooks/useConcours';
import styles from './FilterBar.module.css';

interface Props {
  categories: string[];
  competitionTypes: CompetitionTypeOption[];
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

export default function FilterBar({ categories, competitionTypes, filters, onFilterChange }: Props) {
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const selectedType = competitionTypes.find((type) => type.label === filters.typeCompetition);

  const toggleCategory = (category: string) => {
    const selected = filters.categories ?? [];
    const nextCategories = selected.includes(category)
      ? selected.filter((value) => value !== category)
      : [...selected, category];
    onFilterChange({ ...filters, categories: nextCategories.length ? nextCategories : undefined });
  };

  const selectType = (typeCompetition?: string) => {
    onFilterChange({ ...filters, typeCompetition });
    setTypeMenuOpen(false);
  };

  return (
    <div className={styles.bar}>
      <div className={styles.typeFilter}>
        <button
          type="button"
          className={styles.typeSelect}
          aria-haspopup="listbox"
          aria-expanded={typeMenuOpen}
          onClick={() => setTypeMenuOpen((open) => !open)}
        >
          <span className={styles.typeSelectLabel}>
            {selectedType && <span className={styles.colorDot} style={selectedType.color ? { backgroundColor: selectedType.color } : undefined} />}
            {selectedType?.label ?? 'Tous les types de compétition'}
          </span>
          <span aria-hidden="true">▾</span>
        </button>
        {typeMenuOpen && (
          <div className={styles.typeMenu} role="listbox" aria-label="Type de compétition">
            <button
              type="button"
              className={styles.typeOption}
              role="option"
              aria-selected={!filters.typeCompetition}
              onClick={() => selectType()}
            >
              Tous les types de compétition
            </button>
            {competitionTypes.map((type) => (
              <button
                key={type.label}
                type="button"
                className={styles.typeOption}
                role="option"
                aria-selected={filters.typeCompetition === type.label}
                onClick={() => selectType(type.label)}
              >
                <span className={styles.colorDot} style={type.color ? { backgroundColor: type.color } : undefined} />
                {type.label}
              </button>
            ))}
          </div>
        )}
      </div>

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

      {(filters.typeCompetition || filters.categories?.length) && (
        <button className={styles.reset} onClick={() => onFilterChange({})}>
          Effacer les filtres
        </button>
      )}
    </div>
  );
}
