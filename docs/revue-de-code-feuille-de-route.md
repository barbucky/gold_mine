# Revue de code en profondeur — feuille de route

## Contexte et public de ces sessions

**À relire au début de chaque session, et à respecter jusqu'à la fin de la série.**

L'utilisateur a un bagage de développeur généraliste (logique de programmation, structures de code, raisonnement technique déjà acquis), mais est **novice à très novice sur les technologies spécifiques utilisées dans ce projet** : React, TypeScript appliqué au front, IndexedDB/Dexie, Three.js, Web Animations API, PWA/Service Workers, SVG programmatique.

Conséquence directe sur la façon de mener ces sessions :

- **Double objectif, pas un seul** : comprendre ce que fait le code de Mc's Gold Mine, **et** monter en compétence sur ces technologies en général — pas juste « voici ce qui se passe ici », mais « voici comment ça fonctionne partout, et voici comment ça s'applique ici ».
- **Toujours partir du concept transférable avant le code spécifique.** Pour chaque notion (un hook React, une table Dexie, une keyframe d'animation…), expliquer d'abord l'idée générale et le problème qu'elle résout — comme si l'utilisateur allait la réutiliser demain dans un autre projet — avant de montrer comment elle est utilisée ici.
- **Ne pas présumer de vocabulaire acquis** sur ces technos précises : définir les termes propres à React/Dexie/Three.js/etc. (composant, hook, Blob, scène, keyframe, service worker…) la première fois qu'ils apparaissent, même brièvement.
- **Pédagogie active** : vérifier la compréhension en cours de route plutôt que dérouler un exposé continu — proposer des petites questions, des exemples minimalistes à côté du code réel, ou des pistes à essayer soi-même quand c'est pertinent.
- Cette orientation s'applique à **toutes** les sessions de cette série, même si la conversation reprend après une interruption ou un changement de contexte — ne pas revenir à un simple commentaire de code technique sans la dimension pédagogique.

Objectif général : comprendre comment l'app est construite, pas juste « ce qu'elle fait ». Pour chaque thème ci-dessous, le principe est le même : d'abord le **concept général** (pourquoi cette techno/ce motif existe, quel problème il résout, comment il s'utiliserait ailleurs), puis **comment il est utilisé concrètement** dans le code de Mc's Gold Mine, avec les fichiers exacts à l'appui.

Pensé pour être traité **par thème, en plusieurs fois** — chaque thème peut se lire indépendamment, dans l'ordre qui t'intéresse. Compter environ 20-40 minutes par thème selon les questions.

---

## 1. Les données : IndexedDB, Dexie et le schéma

- Qu'est-ce qu'IndexedDB et pourquoi une « base de données » tourne dans le navigateur (différence avec `localStorage`, qui ne stocke que du texte en petites quantités).
- Dexie.js : une couche de confort au-dessus d'IndexedDB (son API native est verbeuse et callback-based).
- Le schéma concret : `src/db/database.ts` (tables, `version()`, pourquoi certains champs sont « indexés » et d'autres non) et `src/db/types.ts` (la forme des données).
- Pourquoi les photos/documents sont stockés en `Blob` plutôt qu'en base64 (coût mémoire, performance).
- Les migrations : comment on ajoute un champ à une table existante sans tout casser (ex. l'ajout de `quantite`, `reference`, l'icône de salle).
- Les modules `src/db/*.ts` (`salles.ts`, `objets.ts`, `photos.ts`, `piecesJointes.ts`) : la couche qui isole le reste de l'app des détails de Dexie.

## 2. React : composants, état, hooks

- Les bases : composant, props, état local (`useState`), ce qui déclenche un re-rendu.
- Les hooks personnalisés du projet : `useObjectUrl` (convertit un `Blob` en URL affichable, et la libère proprement), `useReducedMotion`.
- `useLiveQuery` (dexie-react-hooks) : comment l'interface se met à jour **automatiquement** quand la base de données change, sans code de synchronisation manuel.
- L'architecture générale : `App.tsx` comme racine, `src/floors/` (les écrans : Accueil, Collections, Statistiques), `src/components/` (les briques réutilisables).
- Le motif « panneau coulissant » (`ObjectSheet`, `AddEditSheet`, `BackupSheet`…) et `forwardRef` + `useImperativeHandle` : comment un parent déclenche l'ouverture d'un panneau enfant depuis l'extérieur.

## 3. Les animations : Web Animations API

- Pourquoi aucune librairie d'animation (Framer Motion, etc.) n'a été utilisée — le choix « web natif » et son coût/bénéfice.
- `element.animate()`, les keyframes, l'option `fill: 'forwards'` et ce qu'elle change réellement.
- Un bug concret rencontré en cours de route (un `.cancel()` appelé trop tôt faisait réapparaître un élément censé être caché) — bon exemple pour comprendre comment le navigateur gère l'état « après » une animation.
- `prefers-reduced-motion` : comment et pourquoi l'app bascule sur des transitions simplifiées (fondu) pour les personnes qui le demandent.

## 4. L'intro 3D : Three.js

- Les bases de la 3D sur le web : scène, caméra, lumières, matériaux, rendu.
- Comment la scène est construite dans `src/intro/scene.ts` (vitrines, éclairage, trajet de caméra).
- Pourquoi certains réglages de lumière ont des valeurs qui semblent arbitraires (le rendu physique de Three.js récent vs le rendu non réaliste de la maquette d'origine).
- Le cycle de vie d'une scène (`start`, `skip`, `dispose`) et son intégration dans React via `Intro.tsx`.

## 5. PWA et fonctionnement hors ligne

- Qu'est-ce qu'un Service Worker et à quoi sert le fichier manifeste d'une PWA.
- `vite-plugin-pwa` : ce qu'il génère automatiquement (le `sw.js` vu dans chaque build) et ce que ça permet (installation sur l'écran d'accueil, fonctionnement 100 % hors ligne).
- Le lien avec `navigator.storage.persist()` évoqué dans les specs.

## 6. Statistiques et graphiques faits main

- Les bases du SVG utile ici : `viewBox`, coordonnées, pourquoi dessiner un graphique « à la main » reste raisonnable à cette échelle.
- Comment les barres, le camembert (`conic-gradient`) et la courbe d'évolution sont construits sans librairie de graphiques.
- Les calculs de répartition : valeur unitaire vs valeur totale, répartition d'un achat étalé sur plusieurs années, multiplicateur « progression » vs « quantité ».

## 7. Sauvegarde et restauration

- Comment on crée un fichier `.zip` directement dans le navigateur (`fflate`), sans serveur.
- Pourquoi les données structurées passent par du JSON mais les photos/documents/icônes par des fichiers séparés dans l'archive (un `Blob` ne se sérialise pas en JSON).
- Le système de version du format de sauvegarde et la rétrocompatibilité (pourquoi une sauvegarde ancienne doit continuer à s'importer).

## 8. Sécurité et choix défensifs

- Pourquoi une icône de salle importée en SVG est systématiquement « réencodée » en PNG plutôt que stockée telle quelle (un SVG peut embarquer du script).
- La validation des formats de fichiers à l'import (photos, documents, icônes) et pourquoi elle se fait à plusieurs endroits.

---

**Pour démarrer** : dis-moi simplement par quel thème tu veux commencer (pas forcément dans cet ordre) — le n°1 (les données) est souvent le plus logique en premier puisque les autres s'appuient dessus, mais rien n'empêche de commencer par ce qui te semble le plus mystérieux ou le plus intéressant.
