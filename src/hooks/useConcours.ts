import { createContext, createElement, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { fetchConcoursFromGoogleSheet } from '../services/googleSheet';
import type { Concours, TypeConcours } from '../types/concours';

export interface Filters {
  type?: TypeConcours;
  mois?: number; // 0-11
  annee?: number;
}

interface ConcoursSource {
  allConcours: Concours[];
  loading: boolean;
  error: string | null;
}

const ConcoursContext = createContext<ConcoursSource | null>(null);

export function ConcoursProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<ConcoursSource>({ allConcours: [], loading: true, error: null });

  useEffect(() => {
    fetchConcoursFromGoogleSheet()
      .then((allConcours) => setSource({ allConcours, loading: false, error: null }))
      .catch((reason: unknown) => {
        const error = reason instanceof Error ? reason.message : 'Impossible de charger le calendrier.';
        setSource({ allConcours: [], loading: false, error });
      });
  }, []);

  return createElement(ConcoursContext.Provider, { value: source }, children);
}

export function useConcours() {
  const [filters, setFilters] = useState<Filters>({});
  const source = useContext(ConcoursContext);
  if (!source) throw new Error('useConcours doit être utilisé dans ConcoursProvider.');
  const { allConcours, loading, error } = source;

  const filtered = useMemo(() => {
    return allConcours
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
  }, [allConcours, filters]);

  const getById = (id: string) => allConcours.find((c) => c.id === id);

  const getByDate = (date: string) => allConcours.filter((c) => c.date === date);

  return { concours: filtered, allConcours, filters, setFilters, getById, getByDate, loading, error };
}
