\# Cahier des charges — Mc's Gold Mine

&#x20;

Version 1 — 25 octobre 2026. Référence visuelle : `docs/maquettes/ma-galerie.html`.

&#x20;

Légende : \*\*\[validé]\*\* = reproduire la maquette fidèlement · \*\*\[à concevoir]\*\* = proposer une conception avant de coder.

&#x20;

\---

&#x20;

\## 1. Vue d'ensemble

&#x20;

Application personnelle (un seul utilisateur, un téléphone) pour inventorier des objets de collection. Métaphore : un musée privé.

&#x20;

\- \*\*Intro\*\* : une porte s'ouvre sur une allée de galerie où mes objets sont exposés sous vitrine.

\- \*\*Étages\*\* : chaque section de l'app est un étage, atteint en ascenseur.

\- \*\*Salles\*\* : chaque collection est une salle (I, II, III…).

\- \*\*Vitrines\*\* : chaque objet est présenté derrière une vitre de protection.

Plateforme : PWA installée sur l'écran d'accueil d'un iPhone, utilisable hors ligne, en mode portrait. Doit aussi fonctionner dans un navigateur de bureau (colonne centrale de 560 px max).

&#x20;

\---

&#x20;

\## 2. Design \[validé]

&#x20;

\### Couleurs (variables CSS)

&#x20;

| Variable | Valeur | Usage |

|---|---|---|

| `--ink` | `#08111f` | fond le plus sombre |

| `--wall` | `#0e1c33` | fond de l'app |

| `--wall-2` | `#16294a` | surfaces secondaires |

| `--brass` | `#c9a45c` | doré principal (libellés, bordures) |

| `--brass-hi` | `#e8cc8c` | doré clair (prix, dates, liens) |

| `--brass-lo` | `#8a6a2e` | doré sombre (dégradés) |

| `--fg` | `#e6ebf3` | texte principal |

| `--muted` | `#9eb0ca` | texte secondaire (marques, sous-titres) |

| `--line` | `rgba(201,164,92,.26)` | séparateurs |

| `--paper` | `#efe6d2` | crème (cartels 3D, notifications) |

&#x20;

Thème unique sombre (pas de mode clair).

&#x20;

\### Typographie

&#x20;

| Rôle | Police | Exemple |

|---|---|---|

| Titres, noms d'objets, nom de l'app | Sora 600–700 | « Kind of Blue » |

| Texte, marques, libellés | Manrope 400–700 | « Miles Davis » |

| Dates | Caveat 500, doré clair | « Mars 1959 » |

| N° d'inventaire | IBM Plex Mono | « Inv. 2026.127 » |

| Intro, plaque, monogramme des pièces | Cinzel | « Mc's Gold Mine », « MC » |

&#x20;

Libellés de section : Manrope 700, 11 px, majuscules, espacement 0,14 em, couleur `--brass`.

&#x20;

Exception : l'indicateur d'étage dans l'en-tête (ex. « Rez-de-chaussée · Accueil », à droite de « Mc's Gold Mine ») est plus discret — Manrope 700, 9 px.

&#x20;

\### Composants récurrents

&#x20;

\- \*\*Vignette sous vitre\*\* : carré, fond bleu nuit doucement éclairé, objet centré et posé (ombre douce), reflets diagonaux et liseré clair de bord de vitre. Pas de chapeau, pas de rampe lumineuse.

\- \*\*Pièce (favori)\*\* : réutilise l'icône de l'app (médaillon doré en relief, monogramme « M », § 2 Icône de l'application). Grise (désaturée) si non favori, dorée avec léger halo si favori. Taille 28 px dans les listes.

\- \*\*Cartes\*\* : rayon 16–18 px, fond dégradé bleu, bordure blanche à 8 % d'opacité, ombre portée douce.

\- \*\*Pastilles\*\* : prix (contour doré, rayon complet), salle (fond doré à 12 %).

&#x20;

\### Icône de l'application \[validé]

&#x20;

Pièce dorée en relief : face bombée (dégradé), tranche visible, ombre portée douce, monogramme « M » embouti au centre en police \*\*New Rocker\*\* (Google Fonts, style gravé/gothique), relief léger (contour atténué, pas de noir franc). Rendu façon icône « flaticon » 3D.

&#x20;

New Rocker n'est utilisée que pour cette icône statique, jamais dans l'interface (voir § Typographie, polices non négociables). Icône générée par `scripts/generate-icons.mjs` via resvg, qui charge la police localement (`.ttf` du paquet `@expo-google-fonts/new-rocker`, dépendance de build uniquement) — aucune requête réseau à l'exécution. Fichiers produits dans `public/` : `pwa-192.png`, `pwa-512.png`, `pwa-maskable-512.png`, `apple-touch-icon.png` (180 px), `favicon-32.png`.

\---

&#x20;

\## 3. Navigation : l'ascenseur \[validé]

&#x20;

Trois étages, boutons d'appel ronds dorés en pied de page (le bouton actif s'illumine) :

&#x20;

| Bouton | Étage | Section |

|---|---|---|

| R | Rez-de-chaussée | Accueil |

| 1 | 1er étage | Mes collections |

| 2 | 2e étage | Statistiques |

&#x20;

L'en-tête affiche l'étage et la section : « 1er étage · Salle III ».

&#x20;

\*\*Animation de transition\*\* (environ 2,3 s pour un étage) :

1\. Fermeture : deux portes en laiton brossé glissent depuis les côtés (560 ms) ; un bandeau supérieur descend (420 ms) avec un cadran à aiguille (R, 1, 2) et des flèches ▲▼.

2\. Trajet : 950 ms + 380 ms par étage supplémentaire. L'aiguille tourne vers l'étage cible, la flèche du sens s'allume, des reflets lumineux défilent sur les portes (vers le bas en montée, vers le haut en descente), légère secousse de cabine au départ et à l'arrivée, nom de l'étage mis à jour à chaque palier.

3\. Ouverture : portes (620 ms, délai 180 ms), bandeau qui remonte (420 ms, délai 520 ms).

Avec `prefers-reduced-motion` : simple fondu (≈ 300 ms).

&#x20;

\### Bouton flottant « + » (ajouter un objet) \[à concevoir]

&#x20;

Pas d'étage dédié : un bouton rond doré flottant, visible sur tous les étages (ancré au-dessus du panneau d'ascenseur), ouvre le formulaire d'ajout en panneau coulissant — même logique que la fiche objet (§ 4.4) plutôt qu'une navigation en ascenseur. Évite d'avoir à traverser plusieurs étages pour ajouter un objet depuis une salle.

&#x20;

Base de la maquette : champs Nom, Marque, Salle, Mois, Année, Provenance, Notes, Photo ; bouton « Inventorier ».

À compléter : prix d'achat, prix max à la revente, date d'acquisition, date affichée (« Mois Année… »), n° d'inventaire automatique (`AAAA.NNN`), détourage de la photo (§ 6), modification d'un objet existant, création et gestion des salles.

&#x20;

\---

&#x20;

\## 4. Écrans

&#x20;

\### 4.1 Intro 3D \[validé]

&#x20;

Durée ≈ 3,5 s. Un tap ou une touche (Entrée, Espace, Échap) la passe à tout moment (fondu de 260 ms).

&#x20;

\*\*Séquence :\*\*

\- 0 – 0,25 s : vestibule sombre, double porte en noyer sous une plaque en laiton gravée « Mc's Gold Mine ». Titre « MC'S GOLD MINE » et « Touchez pour entrer » en surimpression.

\- 0,25 – 1,3 s : les deux battants s'ouvrent vers l'intérieur. \*\*Une pièce d'or « MC » en relief est fixée à cheval sur les deux battants : elle se coupe en deux, chaque moitié part avec son battant.\*\*

\- 0,5 – 3,4 s : la caméra avance dans l'allée (légère oscillation de marche).

\- À partir de 3,1 s : fondu vers l'accueil (650 ms).

\*\*Décor :\*\*

\- Sol en grandes dalles de marbre blanc veiné gris, quelques filets dorés, finition brillante.

\- Murs grège chaud, plinthe sombre en creux soulignée d'un filet doré, rubans lumineux en haut des murs, deux lignes de lumière au plafond.

\- Brume de profondeur grège (jamais sombre : un fond noir crée un « rectangle noir » au bout de l'allée).

\- Tableaux de paysage à cadre doré sur les deux murs, grand tableau au fond.

\- \*\*Pièce de la porte\*\* : rayon ≈ 0,58 m, épaisseur, tranche dorée, relief (bump map) ; monogramme « MC », grènetis, couronne de laurier, millésime « MMXXVI », étoile. Texture nette et contrastée (1024 px minimum).

\*\*Vitrines (8, alternées gauche/droite) :\*\*

\- Socle blanc mat, bandeau sous le verre, cube de verre transparent à arêtes blanches très discrètes. Pas de chapeau, pas d'arêtes dorées.

\- Cartel crème sur la face avant du socle : nom / marque / date · n° d'inventaire (le texte se réduit pour tenir).

\- \*\*Présentation des photos\*\* : visuel plat, fixe, tourné d'environ 24° vers l'allée (face au visiteur), bas de l'image posé sur le fond de la vitrine, ombre douce dessous. Taille max 0,64 × 0,62 m, proportions conservées. Couleurs non affectées par l'éclairage de la scène.

&#x20; - Photo détourée (fond transparent) → l'objet seul, debout.

&#x20; - Photo avec fond → tirage à marge claire, posé et incliné d'environ 6° en arrière.

\- Objets exposés : voir § 9, question ouverte.

Avec `prefers-reduced-motion` ou sans WebGL : intro sautée.

Bouton « Rejouer l'intro » dans l'en-tête.

&#x20;

\### 4.2 Accueil (R) \[validé]

&#x20;

\- Date du jour (« Dimanche 25 octobre ») puis grand titre « Bonjour » / « Bonsoir » (bonsoir de 18 h à 5 h).

\- Trois tuiles de chiffres clés : nombre d'objets, nombre de salles, ajouts ce mois-ci. \*(contenu des tuiles : \[à concevoir])\*

\- Section « Dernières acquisitions » + lien « Tout voir » (→ ascenseur vers l'étage 1).

\- Cartes : \*\*miniature sous vitre dans l'angle supérieur gauche\*\* (76 px) ; nom, marque à la ligne ; prix doré aligné à droite ; description sur 2 lignes ; pied de carte : pastille « {nom de la collection}», date manuscrite, ancienneté (« il y a 2 jours »). Tap → fiche objet.

&#x20;

\### 4.3 Mes collections (1) \[validé]

&#x20;

\*\*Liste des salles\*\* : médaillon rond avec chiffre romain, nom de la salle, période couverte et « dernier ajout : Nom · Marque », nombre d'objets, chevron. Tap → salle.

&#x20;

\*\*Vue d'une salle\*\* (entre en glissant depuis la droite, 360 ms ; les lignes apparaissent en cascade, 70 ms d'écart) :

\- Lien « ‹ Mes collections » (retour en glissant depuis la gauche), surtitre « Salle III », titre, sous-titre « N objets · valeur estimée X € ».

\- Ligne d'objet (mise en page inspirée d'une boutique vintage) : vignette sous vitre 104 px à gauche ; nom (Sora 600, 16 px), marque (13 px, `--muted`), date manuscrite, prix en gras ; \*\*pièce favori\*\* en haut à droite ; séparateur fin.

\- Tap sur la ligne → fiche objet. Tap sur la pièce → bascule favori.

\### 4.4 Fiche objet \[validé]

&#x20;

Panneau qui monte depuis le bas (460 ms) sur un fond flouté (flou 14 px, voile bleu nuit 55 %). Coins supérieurs arrondis (20 px). Boutons ronds « ⋯ » et « × » en haut.

&#x20;

\- \*\*Vitrine sur socle\*\*, centrée en haut : bloc blanc mat, \*\*plateau en bois brun veiné sous le verre\*\*, cube de verre sans arêtes dorées, sans chapeau, sans faisceau lumineux. L'objet (ou sa photo) repose au fond. À l'ouverture : la vitrine monte en douceur et un reflet glisse une fois sur le verre.

\- Nom (Sora 700, 27 px), marque à la ligne (15 px, `--muted`), pièce favori à droite.

\- Ligne : date manuscrite, prix dans une pastille dorée, mention « valeur estimée ».

\- Description limitée à 3 lignes + bouton « Lire la suite » / « Réduire ».

\- Tableau d'informations : Emplacement, Inventaire, Provenance.

\- Fermeture : ×, tap hors du panneau, Échap. Le focus revient à l'élément d'origine.

\- Menu « ⋯ » : modifier, déplacer vers une autre salle, partager, supprimer. \*\*\[à concevoir]\*\*

\### 4.5 Favoris \[validé]

&#x20;

\- Pièce « MC » grise → dorée. À l'ajout : la pièce fait un tour complet sur elle-même (520 ms) et finit dorée. Au retrait : légère contraction.

\- État synchronisé partout (liste, fiche, accueil).

\- Une vue « Mes favoris » (filtre ou salle virtuelle). \*\*\[à concevoir]\*\*

&#x20;

\### 4.6 Statistiques (2) \[à concevoir]

&#x20;

Base de la maquette : barres « objets par salle », colonnes « acquisitions par année », objet le plus ancien. À compléter : valeur totale estimée, valeur par salle, favoris.

&#x20;

\### 4.7 Sauvegarde \[à concevoir]

&#x20;

Voir § 7. Emplacement à définir (réglages, menu de l'en-tête…).

&#x20;

\---

&#x20;

\## 5. Données

&#x20;

Stockage local IndexedDB (Dexie.js). Aucune donnée ne quitte le téléphone. Demander le stockage persistant (`navigator.storage.persist()`) au premier lancement.

&#x20;

```

salles    id, numero ("I", "II"…), nom, ordre, creeLe,

&#x20;         champsPersonnalises (string\[], ex. \["Club","Saison","Taille"])

objets    id, salleId, nom, marque, dateAffichee ("Circa 1956"),

&#x20;         achatMois (1-12, optionnel), achatAnnee (nombre),

&#x20;         prixAchat (centimes, EUR), prixRevente (centimes, EUR),

&#x20;         provenance, inventaire ("2026.118"), description, favori (bool),

&#x20;         creeLe, modifieLe, details (Record<string,string>, ex. {"Club":"PSG","Saison":"2023-2024"})

photos    id, objetId, originale (Blob), detouree (Blob | null), miniature (Blob),

&#x20;         largeur, hauteur, estDetouree (bool)

reglages  cle, valeur   (son, introVue, derniereSauvegarde…)

```

&#x20;

\- \*\*Champs personnalisés par salle\*\* : chaque salle définit un gabarit de noms de champs (ex. Club, Saison, Taille pour une salle « Maillots » ; Auteur, Éditeur, Pages pour une salle « Livres »). Le formulaire d'ajout lit ce gabarit et affiche un champ texte par nom défini ; la valeur saisie est stockée dans `details`, propre à chaque objet. Modifier le gabarit d'une salle ne touche pas rétroactivement les objets déjà créés — seulement les prochains ajouts/modifications.

&#x20;

\- La liste ne charge que les miniatures ; les images lourdes ne sont chargées qu'à l'ouverture d'une fiche ou de l'intro.

\- Images affichées via `URL.createObjectURL`, libérées après usage.

\---

&#x20;

\## 6. Photos

&#x20;

\*\*Traitement à l'import :\*\*

\- Originale : réduite à 2 048 px (plus grand côté), JPEG ≈ 85 %.

\- Détourée : PNG avec transparence, ≈ 1 024 px. Utilisée par les vitrines et l'intro.

\- Miniature : ≈ 300 px.

\- Recadrage automatique sur le contenu non transparent (reprendre `prepareImage` de la maquette).

\- Détection automatique : coins transparents → photo détourée ; sinon → photo avec fond (affichée en tirage à marge claire dans l'intro).

\- Formats acceptés : JPEG, PNG, WebP. Le HEIC n'est pas lu partout : afficher un message clair.
- image par défaut pour chaque élément en fonction de la catégorie: un vinyle grisé si la collection est cd ou vinyle, une basket grisée si la collection est sneakers, une boite de jeux videos pour video games etc...

\*\*Détourage :\*\*

1\. Bouton « Détourer » dans l'app, avec un modèle qui tourne dans le navigateur (par exemple la bibliothèque background-removal d'IMG.LY ou un modèle type RMBG via Transformers.js — \*\*à évaluer\*\*, vérifier la licence). Modèle téléchargé une fois puis mis en cache. Indicateur de progression.

2\. Solution de secours toujours disponible : importer un PNG déjà détouré par iOS (Photos → appui long → copier le sujet).

3\. L'utilisateur peut comparer et garder l'original si le détourage est raté.

\*\*Conseils affichés à l'utilisateur\*\* : objet photographié de face, à sa hauteur, lumière douce, fond uni.

&#x20;

\---

&#x20;

\## 7. Sauvegarde et restauration

&#x20;

\- \*\*Exporter\*\* : un fichier `.zip` (données en JSON + toutes les photos) à enregistrer dans Fichiers ou iCloud Drive.

\- \*\*Restaurer\*\* : import de ce fichier (remplacement complet, après confirmation dans l'interface).

\- \*\*Rappel\*\* discret si la dernière sauvegarde a plus de 30 jours.

\- Plus tard, éventuellement : synchronisation en ligne (hors périmètre de la version 1).

\---

&#x20;

\## 8. Étapes

&#x20;

Chaque étape se termine par un test sur téléphone et un commit.

&#x20;

| # | Étape | Critère de fin |

|---|---|---|

| 0 | Initialisation : Vite + TS + React, PWA (manifeste, icône, service worker), variables de design, polices, Git | L'app s'installe sur l'écran d'accueil et s'ouvre en plein écran, hors ligne |

| 1 | Coquille : en-tête, 4 étages, panneau d'appel, \*\*ascenseur\*\* | Navigation identique à la maquette, durées respectées |

| 2 | Données : schéma Dexie, salles et objets (créer, lire, modifier, supprimer), jeu d'exemple optionnel | Les données survivent à un redémarrage du téléphone |

| 3 | Collections : liste des salles, vue salle, vignettes sous vitre | Rendu identique à la maquette |

| 4 | Fiche objet + favoris (pièce) | Rendu et animations identiques à la maquette |

| 5 | Photos : import, redimensionnement, miniature, recadrage, stockage | Une photo importée apparaît partout (liste, accueil, fiche) |

| 6 | Détourage dans le navigateur + secours PNG iOS | Détourage d'un objet simple en moins de 10 s sur iPhone récent |

| 7 | Accueil | Dernières acquisitions issues des vraies données |

| 8 | Intro 3D branchée sur les vraies données | 8 vitrines avec mes photos ; fluide (≈ 60 i/s) sur iPhone récent |

| 9 | Ajouter / modifier un objet (formulaire complet) | Parcours complet sans données d'exemple |

| 10 | Sauvegarde : export / import / rappel | Restauration complète sur un autre navigateur |

| 11 | Statistiques | Chiffres justes et à l'échelle |

| 12 | Finitions : accessibilité, performances, états vides | Pas de régression sur les étapes précédentes |

&#x20;

\---

&#x20;

\## 9. Questions ouvertes

&#x20;

1\. \*\*Nom de l'app\*\* : « Mc's Gold Mine » (plaque, intro) 

2\. \*\*Objets exposés dans l'intro\*\* : favoris en priorité

3\. \*\*Intro complète à chaque lancement\*\* ou seulement au premier lancement de la journée (version courte sinon) ?

4\. \*\*Dessous du verre des vitrines de l'intro\*\* : bandeau laiton actuel, ou plateau bois comme dans la fiche ? Harmoniser.

5\. \*\*Contenu des tuiles\*\* de l'accueil.

6\. \*\*Actions du menu « ⋯ »\*\*.

7\. \*\*Valeur\*\* : les deux prix existent dans les données (`prixAchat`, `prixRevente`, § 5), devise unique EUR. Reste à décider : lequel afficher par défaut sur chaque écran (listes, fiche, accueil), et si les deux sont visibles quelque part.

&#x20;

