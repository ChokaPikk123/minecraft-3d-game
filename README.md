# 🎮 Minecraft 3D - Jeu de Construction en Ligne

Un jeu Minecraft-like complètement fonctionnel en 3D, jouable directement dans votre navigateur !

## 🚀 Démarrage rapide

Ouvrez simplement `index.html` dans votre navigateur ou déployez les fichiers sur GitHub Pages.

## 🎮 Fonctionnalités

✅ **Rendu 3D Réaliste** avec Three.js
✅ **Génération Procédurale** du terrain infini
✅ **6 Types de Blocs** (Terre, Pierre, Herbe, Bois, Sable, Eau)
✅ **Placement et Destruction** de blocs en temps réel
✅ **Mode Créatif** avec vol libre
✅ **Système de Chunks** pour de meilleures performances
✅ **Éclairage Dynamique** avec ombres
✅ **Interface Intuitive** avec hotbar et contrôles
✅ **Physique du Joueur** (gravité, saut)

## ⌨️ Contrôles

| Touche | Action |
|--------|--------|
| **Z/Q/S/D** | Mouvement |
| **ESPACE** | Sauter / Monter (mode créatif) |
| **MAJ** | Descendre (mode créatif) |
| **Souris** | Regarder autour |
| **CLIC GAUCHE** | Détruire bloc |
| **CLIC DROIT** | Placer bloc |
| **1-6** | Sélectionner bloc |
| **C** | Basculer mode créatif/survie |
| **G** | Afficher/masquer grille |
| **CLIC** | Activer verrouillage du pointeur |

## 🛠️ Technologie

- **Three.js** - Rendu 3D
- **JavaScript Vanilla** - Logique du jeu
- **HTML5 Canvas** - Affichage
- **CSS3** - Interface utilisateur

## 📊 Architecture

- `index.html` - Page principale et UI
- `js/game.js` - Moteur de jeu complet
  - Gestion de la scène 3D
  - Système de chunks
  - Physique du joueur
  - Interaction avec les blocs
  - Gestion des événements

## 🎨 Personnalisation

Vous pouvez facilement modifier :

- **Couleurs des blocs** dans `blockTypes` (js/game.js)
- **Portée de placement** : `CONFIG.REACH_DISTANCE`
- **Vitesse de mouvement** : `CONFIG.MOVEMENT_SPEED`
- **Distance de rendu** : `CONFIG.RENDER_DISTANCE`
- **Taille du monde** : `CONFIG.CHUNK_SIZE`

## 🚀 Améliorations Futures

- [ ] Système d'inventaire avancé
- [ ] Craft d'objets
- [ ] Mobs/créatures
- [ ] Sauvegarde du monde
- [ ] Mode multijoueur
- [ ] Textures personnalisées
- [ ] Son et musique de fond
- [ ] Cycles jour/nuit
- [ ] Biomes variés

## 📝 Licence

Libre d'utilisation et de modification !

---

**Développé par ChokaPikk123** 🎮✨