# LibreVoie

MVP Android de navigation piétonne accessible, fondé sur OpenStreetMap et le
profil fauteuil roulant d'openrouteservice.

## Fonctions du MVP

- carte OpenStreetMap et géolocalisation ;
- recherche d'une destination ;
- itinéraire adapté au profil de mobilité ;
- réglages de pente, ressaut, largeur et revêtement ;
- niveau de confiance distinct de la qualité du trajet ;
- signalement local d'un obstacle temporaire ;
- lecture détaillée des difficultés connues sur l'itinéraire.

## Architecture

Le dépôt contient :

- `mobile/` : application Android Expo / React Native ;
- `server/` : passerelle API qui protège la clé openrouteservice et centralisera
  ensuite les obstacles temps réel.

La donnée permanente d'accessibilité reste dans OpenStreetMap. Les obstacles
temporaires ne doivent pas être écrits dans OSM.

## Démarrage

Prérequis : Node 20+, un compte openrouteservice et une clé API.

```bash
npm install
cp server/.env.example server/.env
# renseigner ORS_API_KEY dans server/.env
npm run dev:server
npm run dev:mobile
```

Dans `mobile/.env`, définir l'URL du serveur :

```text
EXPO_PUBLIC_API_URL=http://ADRESSE_IP_DU_POSTE:8787
```

Sur un émulateur Android, `http://10.0.2.2:8787` pointe vers la machine hôte.

## Construire pour Android

```bash
cd mobile
npx eas login
npx eas build --platform android --profile preview
npx eas build --platform android --profile production
```

Le profil `preview` produit un APK installable. Le profil `production` produit
un AAB destiné à Google Play. La publication nécessite un compte Google Play
Console, une politique de confidentialité et les déclarations Data Safety.

## Limites de sécurité du MVP

Un itinéraire affiché n'est pas une garantie de praticabilité. Une donnée
absente n'est jamais assimilée à une donnée accessible. La première phase de
terrain doit comparer les itinéraires calculés à la réalité avant toute
communication au grand public.

