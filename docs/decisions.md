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

\### Champs personnalisés par salle (étape 2)

&#x20;

\- ❌ Colonnes fixes par type d'objet (club, taille, auteur, éditeur…) : la plupart resteraient vides selon la catégorie, et chaque nouveau type de collection demanderait de modifier le schéma.

\- ❌ Attribut/valeur normalisé dans une table séparée (EAV) : plus « requêtable » mais complexité inutile pour une appli mono-utilisateur.

\- \*\*Champ souple `details` sur chaque objet\*\* (clé/valeur libre), avec un \*\*gabarit de noms de champs porté par la salle\*\* (`champsPersonnalises`) pour que le formulaire d'ajout propose des champs cohérents par catégorie (ex. Club/Saison/Taille pour une salle « Maillots »). Changer le gabarit d'une salle n'affecte pas rétroactivement les objets déjà créés.

&#x20;

\### Dates et prix de l'objet (étape 2)

&#x20;

\- ❌ `dateAffichee` + `mois`/`annee` + `acquisLe` séparés : trois représentations de la même date d'achat, source de confusion.

\- \*\*`achatMois` (optionnel) + `achatAnnee`\*\* : une seule date d'achat structurée, utilisée pour les filtres et les statistiques. `dateAffichee` reste à part, en texte libre, pour l'affichage (« Circa 1956 »).

\- \*\*`prix` renommé en `prixAchat`\*\*, et ajout de \*\*`prixRevente`\*\* (prix max estimé à la revente) : les deux coexistent désormais dans les données (répond à la question ouverte § 9.7). Reste à décider lequel afficher par défaut sur chaque écran.

&#x20;

\### Pièce favori : réutilisation de l'icône de l'app (étape 3)

&#x20;

\- ❌ Pièce dessinée en SVG avec monogramme « MC » en Cinzel (version initiale) : deux dessins de pièce différents dans l'app (icône vs favori), pas cohérent.

\- \*\*La pièce favori réutilise `favicon-32.png`\*\* (même médaillon doré en relief, monogramme « M », voir § 2 Icône de l'application) : une seule pièce pour toute la marque. État non favori obtenu par filtre CSS (`grayscale` + assombrissement), pas par un second visuel. Le monogramme « MC » reste utilisé pour la pièce de la porte dans l'intro 3D (§ 4.1), rendue séparément en Three.js.

&#x20;

\### Détourage par IA dans le navigateur : reporté en v2 (étape 6)

&#x20;

\- \*\*Évaluation faite\*\* (pour reprise en v2, ne pas la refaire) :

&#x20; - \*\*@imgly/background-removal\*\* : licence AGPL (gratuite, acceptable en usage personnel non redistribué). API minimale : `removeBackground(blob) → Promise<Blob>`. Modèles : `isnet_quint8` (~40 Mo, quelques artefacts) ou `isnet`/`isnet_fp16` (~80 Mo, meilleure qualité). Fonctionne en React/Vite (la mention « NextJS 15 only » de la doc ne concerne qu'un guide d'intégration, pas une limite réelle — projets React tiers confirmés). Perf optimale nécessite des en-têtes serveur `Cross-Origin-Opener-Policy`/`Cross-Origin-Embedder-Policy` (SharedArrayBuffer) ; sans eux, fonctionne quand même en mono-thread (juste plus lent). C'était la piste retenue.

&#x20; - ❌ \*\*RMBG-1.4 via Transformers.js\*\* : licence non-commerciale (OK pour un usage perso, mais plus restrictive), intégration plus générale/moins directe.

\- \*\*❌ Reporté\*\* : `npm audit` a signalé une vulnérabilité haute sévérité dans `zod` (dépendance interne d'`@imgly/background-removal`, exhaustion mémoire sur des collections surdimensionnées). Risque jugé faible dans ce contexte (pas de données tierces non fiables, usage local), mais pas de correctif propre disponible sans rétrograder la librairie — décision de ne pas introduire cette dépendance maintenant.

\- \*\*Solution de secours\*\* (déjà en place depuis l'étape 5) : import d'un PNG déjà détouré via iOS (Photos → copier le sujet), détecté automatiquement à l'import.

&#x20;

\### Pièce de la porte (intro 3D) : réutilisation de l'icône de l'app (étape 8)

&#x20;

\- ❌ Dessin procédural d'origine de la maquette (monogramme « MC », grènetis, couronne de laurier, millésime « MMXXVI », étoile, texture + bump map générées séparément) : complexe à maintenir, et une pièce différente de celle utilisée partout ailleurs dans l'app.

\- \*\*Réutilisation du dessin de l'icône de l'app\*\* (médaillon doré, monogramme « M ») pour la pièce de la porte : une seule pièce cohérente dans toute l'app (icône, favori, intro). Texture dédiée régénérée à plus haute résolution (1024 px) à partir du même script `scripts/generate-icons.mjs`. Le split en deux moitiés à l'ouverture de la porte reste inchangé (c'est géométrique, indépendant du dessin).

&#x20;

\### Éclairage et timing de l'intro 3D, ajustés avec l'utilisateur (étape 8)

&#x20;

\- \*\*Intensités des lumières relevées très au-dessus des valeurs de la maquette\*\* (ex. lampe du vestibule : 0,9 → 95) : Three.js récent calcule l'éclairage de façon physique (candela), contrairement à la version r128 utilisée par la maquette — les anciennes valeurs rendaient la scène quasi noire. Ajusté par itérations successives avec retour visuel de l'utilisateur (je ne peux pas tester le rendu WebGL moi-même).

\- \*\*Pause de 0,35 s ajoutée avant l'ouverture de la porte\*\* (vestibule fermé visible plus longtemps) : préférence utilisateur.

\- \*\*Trajet de la caméra ralenti en deux temps\*\* (2,9 s → 4,4 s → 7 s) une fois les 8 vitrines ajoutées (phase B) : à vitesse d'origine, pas assez de temps pour distinguer une vitrine au passage. Cadence de l'oscillation de marche compensée pour rester naturelle malgré le trajet plus long. Durée totale de l'intro passée à ≈ 7,5 s (specs.md § 4.1 mis à jour).

\- \*\*Lumières de vitrine renforcées\*\* (intensité 18 → 55) : quatre `PointLight` déjà positionnées exactement aux coordonnées des paires de vitrines — renforcées plutôt que d'en ajouter de nouvelles (coût de performance moindre). Pas de géométrie de source visible : cohérent avec le refus du faisceau/de la rampe lumineuse au-dessus des vitrines (maquette).

\- ❌ Sous-titre « Collections particulières » sous le titre de l'intro (présent dans la maquette) : jugé inutile, retiré.

&#x20;

\### Champs personnalisés typés : type « progression » (avant étape 9)

&#x20;

\- ❌ Parser du texte libre (ex. « 1-6, 9 / 25 ») pour en tirer un pourcentage : fragile, aucun format fiable à interpréter.

\- \*\*Chaque champ personnalisé a désormais un type\*\* (`texte` ou `progression`), pas seulement un nom. Un champ `progression` stocke deux nombres (`actuel`, `total`) au lieu d'un texte, et s'affiche comme une vraie barre de progression (ex. « Volumes possédés » d'une collection de mangas : 6/25). Décidé avant de construire le formulaire d'ajout (étape 9) pour ne pas avoir à le refaire.

&#x20;

