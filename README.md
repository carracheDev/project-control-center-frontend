# PCC Frontend

Frontend Next.js du Project Control Center.

## Installation

```bash
npm install
cp .env.example .env.local
```

`NEXT_PUBLIC_API_URL` doit pointer vers l'API backend, par exemple `http://localhost:3000`.

## Développement

```bash
npm run dev
```

L'interface est disponible sur `http://localhost:3001`.

## Vues principales

- `/dashboard` : pilotage global multi-projets.
- `/projects` : liste des projets.
- `/projects/:id` : phases, décision humaine et historique du projet.
- `/phases/:id` : Readiness, Gating, validation officielle et données de phase.

Le frontend affiche les résultats du backend. Il ne décide jamais du statut d'une phase, du Gating, de la validation ou du type de décision.

## Validation

```bash
npm run lint
npm run build
```

La PWA possède un manifest et un affichage standalone. Aucun service worker ni mode offline n'est actuellement fourni.
# project-control-center-frontend
