Effectue un commit et un push du projet calendrier_SB vers GitHub en suivant ces étapes :

1. Lance `git status` pour voir les fichiers modifiés.
2. Lance `git diff --stat` pour un résumé des changements.
3. Propose un message de commit en français, concis et descriptif, basé sur les fichiers modifiés. Le format doit être : `type: description` (ex: `feat: ajout filtre par type`, `fix: correction affichage dates`, `chore: mise à jour dépendances`).
4. Demande confirmation à l'utilisateur avant de committer.
5. Ajoute uniquement les fichiers pertinents (jamais `dist/`, jamais les fichiers secrets). Les fichiers à exclure systématiquement : `dist/`, `nul`, `.env*`.
6. Crée le commit avec le message validé.
7. Push vers `origin main`.
8. Confirme le succès avec le lien vers le repository : https://github.com/Natshirtys/calendrier_SB
