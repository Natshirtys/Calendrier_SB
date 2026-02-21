# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Application web React + TypeScript pour la gestion d'un calendrier de concours de Boules Lyonnaises. SPA avec support PWA (Progressive Web App).

## Commands

- `npm run dev` — Serveur de développement Vite avec HMR
- `npm run build` — Type-check TypeScript puis build production (`tsc -b && vite build`)
- `npm run lint` — Lint ESLint
- `npm run preview` — Prévisualiser le build de production

Pas de framework de test configuré.

## Architecture

**Stack :** React 19, TypeScript 5.9, Vite 7, React Router DOM 7, date-fns (locale `fr`), vite-plugin-pwa.

**Données :** Source statique JSON (`src/data/concours.json`). Le hook `src/hooks/useConcours.ts` centralise l'accès aux données, le filtrage (type, ville, mois/année) et les lookups (getById, getByDate) avec `useMemo`.

**Routing (React Router v7, BrowserRouter) :**
- `/` → `ConcoursList` — vue liste filtrée
- `/calendrier` → `Calendar` — vue calendrier mensuel
- `/concours/:id` → `ConcoursDetail` — détail d'un concours

**Types :** `src/types/concours.ts` définit l'interface `Concours` et le type union `TypeConcours` ('doublette' | 'triplette' | 'quadrette' | 'tir_precision' | 'individuel' | 'autre').

**Styles :** CSS Modules (un `.module.css` par composant) + variables de design tokens dans `src/styles/global.css`. Couleur primaire : `#1a5276`, accent : `#e67e22`.

**PWA :** Configuration dans `vite.config.ts` — service worker auto-update, mode standalone, icônes 192x192 et 512x512.

## Conventions

- TypeScript strict activé (`noUnusedLocals`, `noUnusedParameters`)
- Composants fonctionnels avec hooks, interfaces props dans chaque fichier composant
- Dates en format ISO (YYYY-MM-DD), formatées avec date-fns et locale française
- Les affiches/posters sont dans `public/affiches/`
