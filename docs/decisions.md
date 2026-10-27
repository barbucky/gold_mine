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

\- \*\*Fondu de sortie déclenché bien avant la fin mathématique du trajet\*\* (0,3 s → 2,2 s d'avance) : avec l'easing ease-in-out, la caméra ralentit fortement en approchant la fin du trajet, donnant une impression d'immobilisation prolongée face au fond du couloir. Le fondu masque maintenant cette portion quasi statique plutôt que d'attendre l'arrêt complet.

&#x20;

\### Champs personnalisés typés : type « progression » (avant étape 9)

&#x20;

\- ❌ Parser du texte libre (ex. « 1-6, 9 / 25 ») pour en tirer un pourcentage : fragile, aucun format fiable à interpréter.

\- \*\*Chaque champ personnalisé a désormais un type\*\* (`texte` ou `progression`), pas seulement un nom. Un champ `progression` stocke deux nombres (`actuel`, `total`) au lieu d'un texte, et s'affiche comme une vraie barre de progression (ex. « Volumes possédés » d'une collection de mangas : 6/25). Décidé avant de construire le formulaire d'ajout (étape 9) pour ne pas avoir à le refaire.

&#x20;

\### Formulaire d'ajout/modification (étape 9)

&#x20;

\- \*\*Numéro de salle suggéré automatiquement\*\* : à la création d'une salle depuis le formulaire, le chiffre romain proposé est celui qui suit le plus grand numéro de salle existant (+1), toujours modifiable.

\- \*\*Question § 9.7 tranchée : `prixAchat` affiché partout\*\*, plus de mention « valeur estimée » nulle part (listes, accueil, fiche, total par salle). `prixRevente` reste capturé dans le formulaire mais n'est affiché nulle part pour l'instant — pourra resservir plus tard (stats, revente).

\- \*\*Menu « ⋯ »\*\* : « Modifier » et « Supprimer » (avec confirmation) sont implémentés. « Déplacer vers une autre salle » et « Partager » restent différés (message temporaire) — toujours \[à concevoir].

\- ❌ Création de salle en champs intercalés dans le formulaire (version initiale) : jugé moins propre. \*\*Remplacé par une popup dédiée\*\* (nom + numéro, Annuler/Créer) qui revient sur le formulaire une fois la salle créée, déjà sélectionnée.

\- \*\*Bug corrigé : artefact visuel à la fermeture des panneaux\*\* (fiche objet, formulaire) : un `.cancel()` appelé juste après la fin de l'animation de fondu faisait brièvement réapparaître l'état « avant fermeture » avant le passage en `hidden`. Retiré : l'animation reste figée sur l'état disparu (`fill: forwards`) jusqu'à la prochaine ouverture, qui l'annule à ce moment-là seulement.

&#x20;

\### Gestion des salles : renommer et supprimer

&#x20;

\- \*\*Suppression bloquée si la salle n'est pas vide\*\* : message invitant à vider la salle d'abord (nombre d'objets affiché), plutôt que de supprimer automatiquement les objets qu'elle contient ou de les déplacer. Évite toute perte de données accidentelle.

\- \*\*Point d'entrée\*\* : lien « Gérer les salles » en haut de « Mes collections », panneau listant chaque salle avec Renommer (numéro + nom) et Supprimer.

\- \*\*Renumérotation automatique après suppression\*\* : les salles restantes sont renumérotées I, II, III… sans trou (plus seulement les suivantes, toute la liste est recalculée selon son ordre). Le champ technique `ordre` est recompacté au même moment pour éviter toute collision avec une salle créée ensuite.

&#x20;

\### Statistiques (étape 11)

&#x20;

\- \*\*Champ `anneeCreation` (optionnel)\*\* ajouté à `Objet` : année de fabrication/création, distincte de `achatAnnee` (année d'acquisition). Pas garanti pour chaque objet — la stat « objet le plus ancien » utilise `anneeCreation ?? achatAnnee` par objet.

\- \*\*Filtres/tri\*\* placés dans « Mes collections » (liste d'objets d'une salle), pas dans Statistiques : c'est là qu'on parcourt les objets, donc l'endroit naturel pour les trier. Statistiques reste consacré aux vues d'ensemble (KPIs, barres, graphiques).

\- \*\*Courbe d'évolution\*\* : comme l'app ne garde pas d'historique de valorisation, c'est une courbe de dépense cumulée (somme des prix d'achat dans le temps), pas une estimation de valeur de marché — présentée comme telle pour éviter toute confusion.

\- \*\*Graphiques en SVG/CSS fait main\*\* (camembert via `conic-gradient`, histogrammes/courbes en SVG), pas de librairie de graphiques tierce : cohérent avec la stack minimale du projet.

\- \*\*Palette élargie pour les graphiques uniquement\*\* : la règle « bleu nuit + or, aucune couleur en dur » (§ 2) rendait un camembert à plusieurs salles illisible (nuances d'un seul doré trop proches). Ajout de 5 variables `--chart-1` à `--chart-5` (dérivées du thème, voir specs.md § 2), réservées aux graphiques. La légende textuelle (nom de salle + %) reste la source d'information principale, la couleur n'étant qu'un repère secondaire.

&#x20;

\- \*\*« Date affichée » auto-générée\*\* : au lieu d'être toujours saisie à la main, elle se déduit automatiquement de l'année de création (ou de l'année d'achat à défaut) sous la forme « Circa AAAA », tant que l'utilisateur ne l'a pas modifiée lui-même (un champ texte modifié manuellement n'est plus jamais réécrit automatiquement).

&#x20;

\- \*\*Gabarit de champs personnalisés par salle, enfin accessible\*\* : la mécanique « progression » (prévue dès l'étape 9 pour des séries comme les mangas) existait dans les données mais aucune interface ne permettait de créer un champ sur une salle — `champsPersonnalises` était toujours vide à la création. Ajout d'une action « Champs » dans « Gérer les salles » (ajout/suppression, nom + type Texte/Progression).

&#x20;

\- \*\*Multiplicateur de valeur par volumes possédés\*\* : si la salle d'un objet définit un champ « progression », son prix d'achat et sa revente potentielle (partout où ils sont affichés ou totalisés — fiche, accueil, collections, statistiques) sont multipliés par le nombre de volumes \*\*possédés\*\*, pas par le total de la série — reflète la valeur réelle de ce qu'on possède, pas un objectif. Permet de n'entrer que le nom de la série et le prix unitaire.

&#x20;

\- \*\*Champ « progression » revu en « du tome / au tome / série complète »\*\* (remplace l'ancien couple actuel/total) : `{ du, au, complet }`. Le nombre possédé se déduit (`au − du + 1`) plutôt que d'être ressaisi, et couvre le cas d'une collection commencée en cours de série (ex. tomes 5 à 20, les 4 premiers manquants). L'interrupteur « Série complète » déclenche un ruban doré sur la vignette de l'objet (angle supérieur gauche) dans les listes (accueil, collections).

&#x20;

\- \*\*Champ `achatAnneeFin` (optionnel)\*\* : pour une série achetée sur plusieurs années (ex. mangas complétés entre 2020 et 2024), la valeur d'achat est répartie à parts égales entre `achatAnnee` et `achatAnneeFin` dans les statistiques par année (histogramme, courbe d'évolution) — évite qu'une série entière ne pèse artificiellement sur une seule année. Approximation volontaire (répartition régulière, pas les vraies dates de chaque tome) : suffisant pour une vue d'ensemble, sans devoir saisir chaque volume séparément.

&#x20;

\### Nombre d'exemplaires (quantité)

&#x20;

\- \*\*Champ `quantite` (défaut 1)\*\*, distinct du système « progression » (tomes d'une série) : représente des exemplaires \*\*identiques\*\* du même objet (ex. 2 paires de lunettes identiques). Les deux multiplicateurs se cumulent pour la valeur, mais seule la quantité compte dans les indicateurs de nombre d'objets — la progression ne change que la valeur, jamais le nombre d'objets.

\- \*\*Prix unitaire affiché partout sauf les totaux\*\* : la fiche, l'accueil et la liste d'une salle affichent le prix \*\*unitaire\*\* (prix × progression de série le cas échéant, mais pas × quantité). Seuls les totaux (sous-titre de salle, Statistiques) multiplient par la quantité. Décidé après un premier essai qui multipliait partout — jugé trompeur de voir un prix \"gonflé\" sur un seul exemplaire affiché.

&#x20;

\### Documents (factures), étape 13

&#x20;

\- \*\*Nouvelle table `piecesJointes`\*\* (migration Dexie v3, indexée par `objetId`) : plusieurs documents par objet, photo ou PDF uniquement, 15 Mo max chacun. Pas de vignette générée pour les PDF (coûterait une librairie dédiée) ni pour les photos (le fichier original sert directement).

\- \*\*Visualiseur intégré réservé aux photos\*\* : testé sur iPhone, le rendu PDF en `<iframe>` (même avec le paramètre `#view=Fit`) s'affichait toujours zoomé, de façon non corrigible côté CSS — limite du moteur PDF de Safari en contexte iframe. Un PDF ouvre donc directement le partage natif (Fichiers, visionneuse PDF…) au lieu du visualiseur ; les photos restent affichées intégrées (fonctionnait bien dès le premier essai). Partage natif via Web Share API avec fichier, repli sur `window.open` si indisponible — utilisé à la fois pour l'ouverture directe des PDF et comme bouton de secours dans le visualiseur photo.

\- \*\*Sauvegarde étendue (version 2 du format `.zip`)\*\* : les documents sont exportés/importés au même titre que les photos (dossier `documents/` dans l'archive, avec le type MIME d'origine conservé). L'import reste compatible avec les sauvegardes version 1 (sans documents).

&#x20;

\- \*\*Bug corrigé : rectangle sombre pendant la transition ascenseur → salle\*\* : `.lift` (grille `auto 1fr`) réservait une rangée de la hauteur du lintel même quand celui-ci glissait hors champ (transform ne change pas le gabarit de la grille), laissant voir le fond de l'app par transparence. Fond `#050b16` (identique à `.shaft`) ajouté directement sur `.lift` pour combler cette rangée dans tous les cas.

&#x20;

\### Icône/logo de collection, étape 14

&#x20;

\- \*\*Toujours ré-encodée en PNG carré (128 px), quel que soit le format d'origine\*\* (SVG, PNG, JPEG, WebP acceptés à l'import) : évite de stocker/afficher du SVG brut (un SVG peut embarquer du script — risque de sécurité), et donne un rendu uniforme partout où l'icône est affichée en petit. Pas de recadrage : l'image est centrée dans le cadre carré (fond transparent) pour ne jamais couper un logo non carré.

\- \*\*Champ `icone?: Blob` directement sur `Salle`\*\* (pas de table séparée) : une seule icône par salle, remplacée en entier à chaque import — pas besoin de la richesse d'une table dédiée (plusieurs fichiers, historique) comme pour les documents.

\- \*\*Modifiable à la création \*\*ET\*\* après coup\*\* : champ optionnel dans le popup « Nouvelle salle » (AddEditSheet), et dans le popup « Renommer » de « Gérer les salles » (avec aperçu de l'icône actuelle et bouton « Retirer »).

\- \*\*Sauvegarde étendue (version 3 du format `.zip`)\*\* : comme `icone` est un `Blob`, il est exclu du JSON (un `Blob` ne se sérialise pas) et exporté à part (`salles/{id}/icone.png`), sur le même principe que les photos et documents. Import rétrocompatible avec les versions 1 et 2 (sans icônes).

&#x20;

\### Finitions — état vide des vitrines (étape 12)

&#x20;

\- \*\*Icône de salle réutilisée comme image par défaut\*\*, plutôt que des illustrations génériques par catégorie (abandonné, cf. specs.md § 6) : si un objet n'a pas de photo, sa vitrine (liste, accueil, fiche) affiche l'icône de sa salle, grisée et semi-transparente. Sans icône de salle, la vitrine reste vide comme avant — pas de nouveau placeholder à construire pour ce cas.

&#x20;

\### Mise en ligne pour installation PWA

&#x20;

\- \*\*Hébergement statique gratuit (GitHub Pages) plutôt qu'un hébergement payant\*\* (Hostinger ou équivalent) : l'app n'a aucun besoin serveur (pas de backend, pas de base de données côté serveur — tout est dans IndexedDB sur l'appareil), donc un hébergement payant résoudrait un problème qui n'existe pas ici. Seul besoin réel : une URL en HTTPS, exigée par les Service Workers pour s'activer (une adresse locale en HTTP simple, comme celle utilisée pour les tests via le réseau Wi-Fi, ne suffit pas à l'installation PWA complète).

\- \*\*`base: '/gold_mine/'` dans `vite.config.ts`\*\* (nom du dépôt GitHub `barbucky/gold_mine`) : GitHub Pages sert un dépôt de projet sous `https://<compte>.github.io/<dépôt>/`, pas à la racine. Le `start_url` et le `scope` du manifeste PWA sont alignés sur cette même base. Effet de bord à connaître : les adresses de test local (`npm run dev` / `npm run preview`) incluent désormais ce même préfixe (ex. `http://192.168.1.65:4173/gold_mine/`).

\- \*\*Déploiement automatique via GitHub Actions\*\* (`.github/workflows/deploy.yml`) : à chaque push sur `master`, build + publication automatique sur GitHub Pages. Nécessite une seule action manuelle côté utilisateur, une fois : dans les réglages du dépôt GitHub, Pages → Source → « GitHub Actions ».

\- \*\*Bug corrigé : écran noir à l'intro sur GitHub Pages\*\* : `src/components/Intro.tsx` (texture de la pièce dorée) et `src/components/FavoriteCoin.tsx` référençaient leurs images via un chemin absolu codé en dur (`/coin-texture-1024.png`, `/favicon-32.png`) — valide uniquement quand l'app est servie à la racine. Une fois servie sous `/gold_mine/` (GitHub Pages), ces chemins pointaient vers des fichiers inexistants : le chargement de texture échouait silencieusement (promesse rejetée, pas de `.catch()`), empêchant la suite de la construction de la scène 3D. Corrigé avec `import.meta.env.BASE_URL` (fourni par Vite, toujours correct quel que soit l'endroit où l'app est servie) au lieu d'un chemin en dur. `index.html` n'était pas concerné : Vite réécrit automatiquement les chemins absolus qui s'y trouvent au moment du build.

&#x20;

&#x20;

