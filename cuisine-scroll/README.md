# Site « cuisine qui se construit au défilement »

Site d’une page pour un cuisiniste ou un ébéniste haut de gamme. Quand le visiteur fait défiler la page, une séquence d’images dessinée sur un `<canvas>` montre une pièce brute devenir une cuisine sur mesure finie, puis la même cuisine en soirée. Le texte de chaque étape apparaît puis disparaît.

Même mécanique que `../construction-scroll/` (canvas plein écran, GSAP ScrollTrigger, barre de progression latérale, écran de chargement, Netlify Forms, version mobile portrait), avec une identité visuelle différente : palette claire **crème, chêne, noir mat**, polices **Fraunces** (titres) et **DM Sans** (texte), texte foncé sur un voile crème.

> **Important : les images sont générées par IA.** La cuisine, les ouvriers et les vidéos ne sont pas une vraie réalisation. Sur le site d’un vrai client, ne les présente jamais comme ses projets : remplace-les par ses propres photos ou vidéos, ou indique clairement qu’il s’agit d’illustrations.

---

## Structure

```
cuisine-scroll/
├── index.html            ← textes, sections, formulaire
├── merci.html            ← page « merci » après l’envoi du formulaire
├── 404.html
├── css/style.css         ← couleurs, polices, mise en page (variables dans :root)
├── js/main.js            ← bloc CONFIG en haut = réglages des images
├── js/vendor/            ← GSAP + ScrollTrigger (aucun CDN)
├── frames/               ← 242 images ORDINATEUR (1152 × 658) frame_001.webp …
│   └── mobile/           ← 242 images MOBILE (540 × 960)
├── tools/video_to_frames.py ← découpe les vidéos en images (ordinateur + mobile, fondu crème)
├── tools/keyframes/cuisine-finie.jpg ← image de référence utilisée pour générer les vidéos
├── og.jpg                ← image de partage (1200 × 630)
├── netlify.toml
└── favicon.svg
```

## Les 7 étapes

| # | Étape | Titre | Première image |
|---|-------|-------|----------------|
| 1 | La pièce brute | Tout commence par une pièce vide. | 1 |
| 2 | Plomberie et électricité | Ce qu’on ne voit pas doit être parfait. | 13 |
| 3 | Armoires sur mesure | Façonnées au millimètre. | 39 |
| 4 | Quartz et dosseret | Une seule dalle, aucun compromis. | 67 |
| 5 | Électroménagers et éclairage | La lumière, au bon endroit. | 83 |
| 6 | Les détails | Le luxe se sent dans les détails. | 125 |
| 7 | Votre cuisine (soirée) | Bienvenue dans votre nouvelle cuisine. + « Soumission gratuite » | 192 |

Les images viennent de **2 vraies vidéos générées par IA** (Canva, moteur H3 Max, 15 s chacune, 1344 × 768), découpées à 8 images par seconde :
1. `01-cuisine-construction.mp4` : caméra fixe, la pièce brute se construit en accéléré (images 1 à 121).
2. `02-cuisine-details-soiree.mp4` : la caméra glisse vers l’îlot, gros plan d’un tiroir à fermeture douce, puis la cuisine en soirée (images 122 à 242).

Les vidéos sources sont dans `../promo/sources-cuisine/`.

---

## Tester en local

```bash
cd cuisine-scroll
python3 -m http.server 8000
# puis ouvrir http://localhost:8000   (ajoute ?debug pour voir le numéro d’image)
```

## Déployer sur Netlify

- **Glisser-déposer** : https://app.netlify.com/drop → glisse le dossier `cuisine-scroll`.
- **Depuis GitHub** : *Base directory* `cuisine-scroll`, *Build command* vide, *Publish directory* `cuisine-scroll`.
- **Formulaire** : Netlify → *Forms* → *Enable form detection*, puis redéploie. Le formulaire s’appelle `soumission`. Notifications par courriel : *Forms* → *Form notifications*.

---

## Personnaliser

**À remplacer dans `index.html`, `merci.html` et `404.html`** (recherche/remplace) :

| Repère | Exemple |
|--------|---------|
| `[NOM DE L'ENTREPRISE]` | nom de l’entreprise (nav, titre, chargement, pied de page) |
| `[TÉLÉPHONE]` + `tel:+10000000000` | numéro affiché + numéro du lien |
| `[COURRIEL]` (2 fois) | adresse courriel |
| `[RÉGION DESSERVIE]` | ex. « Rive-Sud de Montréal » |
| `[NUMÉRO DE LICENCE RBQ]` | numéro de licence de la RBQ |

- **Textes des étapes** : les balises `<article class="chapter">`. Le mot en *italique couleur chêne* est dans `<em>…</em>`.
- **À valider avec le client** : les textes décrivent un cuisiniste type (plans en 3D, chêne blanc, quartz, fermeture douce…). Retire tout ce que l’entreprise ne fait pas vraiment.
- **Services** : section `#services` (cuisines sur mesure, salles de bain, ébénisterie et meubles intégrés).
- **Formulaire** : type de projet, budget approximatif, échéancier. Adapte les tranches de budget au marché du client.
- **Couleurs et polices** : variables en haut de `css/style.css` (`--bg`, `--gold` = chêne, `--cta` = noir mat, `--veil`, `--serif`, `--sans`).
- **Longueur du défilement** : `--story-length: 1100vh` dans `css/style.css`.
- **Image de partage** : une fois en ligne, mets l’adresse complète de `og.jpg` dans `og:image`.

## Remplacer les images

1. Mets tes vidéos (16:9) dans un dossier, puis :
   ```bash
   pip install pillow
   python3 tools/video_to_frames.py video-1.mp4 video-2.mp4 --fps 8 --width 1152 --quality 56 --mobile-cx 0.5 --mobile-crop 0.7
   ```
   `--mobile-cx` : centre horizontal gardé sur téléphone (0 à 1) ; `--mobile-crop` : part de la largeur gardée nette. Le fondu mobile utilise la couleur crème du site (`BG` en haut du script).
2. Dans `js/main.js` (bloc `CONFIG`) : `frameCount` = nombre affiché, `stageStartFrames` = première image de chaque étape (repère-les avec `?debug`), et **augmente `version`** à chaque remplacement.
3. Réglages actuels : `frameCount: 242`, `stageStartFrames: [1, 13, 39, 67, 83, 125, 192]`, `blendFrames: true`, `scrub: 0.4`.

Poids : environ 8 Mo d’images (ordinateur + mobile). Le dossier `tools/` n’est pas nécessaire au site (Netlify le bloque).

## Notes techniques

Voir `../construction-scroll/README.md` : même code JavaScript (canvas sans saut de mise en page, chargement prioritaire des débuts d’étapes, accessibilité, option « réduire les animations » respectée).
