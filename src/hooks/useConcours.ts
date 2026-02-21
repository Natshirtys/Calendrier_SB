import { useMemo, useState } from 'react';
import concoursData from '../data/concours.json';
import type { Concours, TypeConcours } from '../types/concours';

export interface Filters {
  type?: TypeConcours;
  mois?: number; // 0-11
  annee?: number;
}

export function useConcours() {
  const [filters, setFilters] = useState<Filters>({});
  const concours = concoursData as Concours[];

  const filtered = useMemo(() => {
    return concours
      .filter((c) => {
        if (filters.type && c.type !== filters.type) return false;
        if (filters.mois !== undefined && filters.annee !== undefined) {
          const d = new Date(c.date);
          if (d.getMonth() !== filters.mois || d.getFullYear() !== filters.annee)
            return false;
        }
        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [concours, filters]);

  const getById = (id: string) => concours.find((c) => c.id === id);

  const getByDate = (date: string) => concours.filter((c) => c.date === date);

  return { concours: filtered, allConcours: concours, filters, setFilters, getById, getByDate };
}
