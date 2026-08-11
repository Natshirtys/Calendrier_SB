import { useEffect, useRef, useState } from 'react';
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
  const typeFilterRef = useRef<HTMLDivElement>(null);
  const selectedTypes = filters.typeCompetitions ?? [];
  const selectedType = selectedTypes.length === 1
    ? competitionTypes.find((type) => type.label === selectedTypes[0])
    : undefined;

  const toggleCategory = (category: string) => {
    const selected = filters.categories ?? [];
    const nextCategories = selected.includes(category)
      ? selected.filter((value) => value !== category)
      : [...selected, category];
    onFilterChange({ ...filters, categories: nextCategories.length ? nextCategories : undefined });
  };

  const toggleType = (typeCompetition: string) => {
    const nextTypes = selectedTypes.includes(typeCompetition)
      ? selectedTypes.filter((value) => value !== typeCompetition)
      : [...selectedTypes, typeCompetition];
    onFilterChange({ ...filters, typeCompetitions: nextTypes.length ? nextTypes : undefined });
  };

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (typeFilterRef.current && !typeFilterRef.current.contains(event.target as Node)) {
        setTypeMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setTypeMenuOpen(false);
    };
    document.addEventListener('mousedown', closeMenu);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeMenu);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <div className={styles.bar}>
      <div className={styles.typeFilter} ref={typeFilterRef}>
        <button
          type="button"
          className={styles.typeSelect}
          aria-haspopup="listbox"
          aria-expanded={typeMenuOpen}
          onClick={() => setTypeMenuOpen((open) => !open)}
        >
          <span className={styles.typeSelectLabel}>
            {selectedType && <span className={styles.colorDot} style={selectedType.color ? { backgroundColor: selectedType.color } : undefined} />}
            {selectedType?.label ?? (selectedTypes.length ? `${selectedTypes.length} types sélectionnés` : 'Tous les types de compétition')}
          </span>
          <span aria-hidden="true">▾</span>
        </button>
        {typeMenuOpen && (
          <div className={styles.typeMenu} role="listbox" aria-label="Types de compétition" aria-multiselectable="true">
            <button
              type="button"
              className={styles.typeOption}
              role="option"
              aria-selected={!selectedTypes.length}
              onClick={() => onFilterChange({ ...filters, typeCompetitions: undefined })}
            >
              Tous les types de compétition
            </button>
            {competitionTypes.map((type) => (
              <button
                key={type.label}
                type="button"
                className={styles.typeOption}
                role="option"
                aria-selected={selectedTypes.includes(type.label)}
                onClick={() => toggleType(type.label)}
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

      {(filters.typeCompetitions?.length || filters.categories?.length) && (
        <button className={styles.reset} onClick={() => onFilterChange({})}>
          Effacer les filtres
        </button>
      )}
    </div>
  );
}
