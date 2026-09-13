# LibreVoie — cadrage produit 0.1

## Promesse

Proposer le trajet piéton le plus praticable selon les capacités réelles de la
personne, et non simplement le trajet le plus court.

## Utilisateurs initiaux

1. personne en fauteuil manuel ;
2. personne en fauteuil électrique ;
3. personne marchant difficilement ou utilisant un déambulateur.

Le profil déficience visuelle est volontairement reporté : il exige un travail
spécifique de guidage vocal, d'ergonomie TalkBack et de sécurité des traversées.

## Choix de données

- OpenStreetMap : réseau piéton et accessibilité permanente ;
- openrouteservice : calcul `wheelchair` du MVP ;
- LibreVoie : obstacles temporaires, préférences et retours utilisateurs ;
- aucune donnée absente n'est réputée favorable.

## Périmètre pilote

La Roche-sur-Foron, avec un secteur test comprenant gare, centre-ville, mairie,
centre de santé et principaux équipements publics. Les parcours sont contrôlés
sur le terrain avec des usagers avant ouverture publique.

## Critères de passage en bêta publique

- dix parcours structurants vérifiés dans chaque sens ;
- 95 % des traversées de ces parcours renseignées (bordures comprises) ;
- 90 % des tronçons renseignés en largeur, surface et pente ;
- audit d'accessibilité numérique ;
- mécanisme de modération et expiration des signalements ;
- politique de confidentialité et procédure de traitement des incidents ;
- tests avec au moins cinq usagers aux profils de mobilité différents.

## Étapes suivantes

1. relever un quartier pilote dans OSM ;
2. comparer dix trajets ORS aux parcours réels ;
3. corriger le modèle de coût et calculer réellement la complétude OSM ;
4. ajouter comptes anonymisés, API d'obstacles et modération ;
5. ajouter guidage tournant par tournant, hors-ligne et TalkBack ;
6. produire l'AAB, les captures Store et les mentions légales.
