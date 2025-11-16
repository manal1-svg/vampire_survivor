# Notes personnelles — VampireLike

Ci-dessous j'explique rapidement ce que j'ai fait et comment lancer le projet.

## Objectif
J'ai réalisé un petit prototype en p5.js pour expérimenter des comportements de steering (seek, separate, avoid) dans un jeu inspiré de "Vampire Survivors". Le but principal était de comprendre et d'appliquer ces techniques dans un contexte de jeu.

## Démarrage rapide
1. Ouvrir un terminal et se placer dans le dossier `VampireLike`.

```powershell
cd "VampireLike"
# Python
python -m http.server 8000
# ou Node.js
npx serve -s . -l 8000
```
2. Aller sur `http://localhost:8000/VampireLike/index.html`.

## Contrôles
- Déplacement : `W` / `A` / `S` / `D` ou flèches
- Tir : clic gauche (les projectiles suivent la souris)
- `REPLAY` : bouton pour relancer après Game Over

## Ce que j'ai développé
- Joueur mobile avec santé et système d'XP.
- Ennemis basés sur des steering behaviors (poursuivent, se séparent, évitent obstacles).
- Serpents composés de segments (chaque segment peut être détruit).
- Projectiles (balles) et orbes d'XP qui attirent le joueur lorsqu'il s'en approche.
- Obstacles statiques et collision circulaire simple.

## Où regarder dans le code
- `sketch.js` : boucle p5.js et orchestration (spawn, collisions, HUD).
- `vehicle.js` : classe de base avec `seek`, `separate`, `avoid`, `update`, `boundaries`.
- `player.js`, `enemy.js`, `bullet.js`, `snake.js`, `snakeSegment.js`, `xpOrb.js`, `Obstacle.js` : entités.
- `utils.js` : petites fonctions d'aide (collisions, dropXP).

## Notes techniques rapides
- La détection de collision est circulaire : distance < somme des rayons.
- Les comportements combinés donnent un mouvement naturel aux ennemis.
- Le code est volontairement en style "global" (classes non-module) pour coller au format utilisé en TP.

