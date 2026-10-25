\#Mc's Gold Mine — instructions pour Claude Code



Application personnelle de gestion de collections d'objets (appareils photo, montres, vinyles, timbres…), présentée comme un musée privé : une galerie 3D en intro, des salles, des vitrines, un ascenseur pour changer de section.



\#Documents de référence (à lire avant toute tâche importante)

docs/specs.md — cahier des charges complet : écrans, animations, données, étapes.

docs/decisions.md — journal des choix validés et des options refusées. Ne jamais reproposer une option refusée sans que je le demande.

docs/maquettes/ma-galerie.html — référence visuelle et comportementale validée. Reproduire fidèlement son rendu, ses animations et ses règles d'affichage. Ne pas copier sa structure de code : l'app est organisée en composants. Les données et illustrations qu'elle contient sont des exemples. Certaines parties peuvent être reprises presque telles quelles (scène Three.js de l'intro, fonction de recadrage des photos prepareImage).



Dans specs.md, chaque écran est marqué \[validé] (suivre la maquette à la lettre) ou \[à concevoir] (latitude, mais proposer avant de coder).



\#Stack

PWA installable sur l'écran d'accueil, fonctionnement 100 % hors ligne, aucune donnée envoyée sur Internet.

Vite + TypeScript + React.

Three.js pour l'intro 3D (utilisé directement, sans surcouche).

Animations : Web Animations API (element.animate), comme dans la maquette.

Données : IndexedDB via Dexie.js. Photos stockées en Blob.

PWA : manifeste + service worker (vite-plugin-pwa).

Commandes



\#À compléter une fois le projet initialisé (dev, build, preview, tests).



Règles d'affichage non négociables

Toujours le nom de l'objet d'abord, puis la marque à la ligne, plus petite. Partout : listes, accueil, fiche, cartels 3D. Sur une seule ligne : Nom · Marque.

Palette bleu nuit + or, définie en variables CSS (voir specs.md § Design). Aucune couleur en dur dans les composants.

Polices : Sora (titres), Manrope (texte), Caveat (dates manuscrites), IBM Plex Mono (n° d'inventaire), Cinzel (intro, plaque, monogramme « MC » des pièces).

Les favoris sont signalés par la pièce « MC » : grise si non favori, dorée si favori. Jamais un signet, une étoile ou un cœur.

Vitrines : verre sans arêtes dorées, sans chapeau, sans faisceau lumineux. Les objets ne lévitent pas et ne tournent pas.

Navigation entre sections : uniquement par l'ascenseur (boutons R, 1, 2... en pied de page).

Respecter prefers-reduced-motion : intro sautée, ascenseur remplacé par un fondu.

Interface en français.

Méthode de travail

Avancer étape par étape selon specs.md § Étapes. Une étape = une branche ou une série de commits, testée sur téléphone avant de passer à la suivante.

Pour toute étape importante : proposer un plan avant d'écrire le code.

Si une demande contredit specs.md ou decisions.md, le signaler avant d'agir. Après validation, mettre à jour ces documents.

Commits courts et explicites, en français.

Ne pas faire les commits : l'utilisateur les effectue lui-même via GitHub Desktop.

À la fin de chaque étape : tester le fonctionnement des éléments modifiés, puis de l'ensemble de la partie concernée par la modification, avant de considérer l'étape terminée.

