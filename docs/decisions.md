\# Journal des décisions — Mc's Gold Mine

&#x20;

Ce journal garde la trace des choix validés \*\*et des options refusées\*\*, pour ne pas les reproposer.

Ajouter une ligne à chaque changement de cap, la plus récente en bas.

&#x20;

Format : \*\*décision\*\* — raison / précision. ❌ = option refusée.

&#x20;

\---

&#x20;

\## 24 octobre 2026 — Prototype

&#x20;

\### Concept

\- \*\*Métaphore du musée privé\*\* : intro en galerie, sections en étages, collections en salles, objets en vitrines.

\- \*\*Intro passable d'un tap\*\*, courte (≈ 3,5 s).

\### Galerie de l'intro

\- ❌ Ambiance musée classique (parquet, murs vert sombre, moulures) — jugée pas assez moderne.

\- \*\*Ambiance moderne\*\* : sol en marbre blanc veiné, murs grège, plinthe en creux, rubans lumineux.

\- \*\*Plaque au-dessus de la porte : « Mc's Gold Mine »\*\*.

\- Brume de profondeur de la couleur des murs — une brume sombre créait un rectangle noir au bout de l'allée (bug corrigé).

\### Ascenseur

\- \*\*Animation allongée\*\* à ≈ 2,3 s pour un étage (première version ≈ 1 s, jugée trop rapide).

\### Interface

\- ❌ Interface vert sombre, puis anthracite.

\- \*\*Bleu nuit + or\*\*, assorti aux boutons d'ascenseur dorés.

\- ❌ Polices à empattement (Cinzel, Spectral) dans l'interface — conservées seulement pour l'intro, la plaque et les pièces.

\- \*\*Polices modernes\*\* : Sora (titres) + Manrope (texte).

\### Liste des objets d'une salle

\- \*\*Mise en page inspirée d'une boutique vintage\*\* (vignette à gauche, texte à droite, date manuscrite, prix, icône en haut à droite, séparateurs fins).

\- \*\*Nom de l'objet d'abord, marque à la ligne\*\*, partout dans l'app.

\- ❌ Vignette avec chapeau doré et rampe lumineuse, et allumage en scintillement.

\- \*\*Vignette simplifiée\*\* : l'objet derrière une simple vitre de protection.

\### Fiche objet

\- \*\*Panneau qui monte sur fond flouté\*\*, inspiré d'une fiche de jeu vidéo (boutons ⋯ et × en haut, visuel centré, titre, méta, description, « Lire la suite »).

\- ❌ Faisceau / cône de lumière au-dessus de la vitrine.

\- ❌ Arêtes dorées sur le cube de verre.

\- ❌ Chapeau en bois au-dessus du verre.

\- \*\*Vitrine de la fiche\*\* : socle blanc mat + plateau en bois brun sous le verre + cube de verre simple.

\### Vitrines de l'intro

\- ❌ Chapeau et panneau lumineux au-dessus du verre (retirés aussi dans l'intro).

\- ❌ Arêtes dorées sur le verre.

\- ❌ Objets en lévitation dans la vitrine.

\- ❌ Objets ou plateaux qui tournent.

\- \*\*Visuels plats et fixes, tournés vers l'allée\*\*, posés au fond de la vitrine — pensés pour afficher mes photos.

\- Photo détourée → objet debout ; photo avec fond → tirage à marge claire, légèrement incliné.

\## 25 octobre 2026

&#x20;

\### Accueil

\- ❌ Cartels crème façon étiquette de musée.

\- \*\*Accueil façon app mobile\*\* : salutation + date, tuiles de chiffres, cartes « Dernières acquisitions » avec \*\*miniature dans l'angle supérieur gauche\*\*. Boutons d'ascenseur conservés en pied de page.

\### Pièce « MC »

\- ❌ Reproduire la pièce de Picsou (création Disney) — remplacée par une pièce originale au monogramme « MC ».

\- ❌ Pièce peinte dans le tableau au fond de l'allée — rendu flou et peu lisible.

\- \*\*Pièce en relief sur la porte d'entrée, coupée en deux\*\* : chaque moitié part avec son battant à l'ouverture.

\- \*\*La pièce signale les favoris\*\* : grise = non favori, dorée = favori, tour sur elle-même à l'ajout.

\- ❌ Icône signet pour les favoris.

\### Technique

\- \*\*PWA\*\* (application web installable) plutôt qu'app native : réutilise le prototype, chemin le plus court pour un projet personnel. Passage au natif possible plus tard.

\- \*\*Données locales\*\* : IndexedDB, aucune donnée en ligne. Sauvegarde par export/import d'un fichier .zip.

\- \*\*Détourage\*\* : modèle dans le navigateur + secours par PNG détouré avec iOS.

&#x20; - ❌ Service de détourage en ligne (photos envoyées à un tiers, payant).

\- \*\*Maquette = référence de rendu, pas code de production\*\* : reproduire fidèlement le rendu, réorganiser le code en composants.

&#x20;

\### Icône de l'application (étape 0)

&#x20;

\- ❌ Pièce « MC » en traits fins (encre marron), les deux lettres se touchaient — illisible, surtout en petite taille sur l'écran d'accueil.

\- ❌ Monogramme « M » seul, plat, sans relief.

\- ❌ Porte voûtée abstraite (clin d'œil à la porte de l'intro, pièce fendue en haut).

\- ❌ Gemme facettée façon low-poly.

\- ❌ Monogramme « M » dessiné en traits (police système) avec contour très sombre — relief jugé trop appuyé.

\- \*\*Pièce dorée en relief, monogramme « M » en New Rocker\*\* : dégradé bombé, tranche visible, ombre portée, relief embouti discret. New Rocker réservée à cette icône statique uniquement (jamais dans l'interface). Générée par script (`resvg` + police locale en `.ttf`), aucune dépendance réseau à l'exécution.

&#x20;

\### Ascenseur : « Ajouter un objet » retiré des étages (étape 1)

&#x20;

\- ❌ Étage 2 dédié « Ajouter un objet » (version initiale de specs.md § 3) : obligeait à reprendre l'ascenseur depuis n'importe quelle salle pour ajouter un objet.

\- \*\*Bouton flottant « + »\*\*, visible sur tous les étages, ouvre le formulaire d'ajout en panneau coulissant (comme la fiche objet) plutôt qu'un étage dédié. L'ascenseur passe à \*\*trois étages\*\* : R · Accueil, 1 · Mes collections, 2 · Statistiques.

&#x20;

