# Site « cuisine qui se construit au défilement »

Site d’une page pour un cuisiniste ou un ébéniste haut de gamme. Quand le visiteur fait défiler la page, une séquence d’images dessinée sur un `<canvas>` montre une pièce brute devenir une cuisine sur mesure finie, puis la même cuisine en soirée. Le texte de chaque étape apparaît puis disparaît.

Même mécanique que `../construction-scroll/` (canvas plein écran, GSAP ScrollTrigger, barre de progression latérale, écran de chargement, Netlify Forms, version mobile portrait), avec une identité visuelle différente : palette claire **crème, chêne, noir mat**, polices **Fraunces** (titres) et **DM Sans** (texte). Sur ordinateur, la vidéo occupe tout l’écran (texte clair sur un léger dégradé sombre) ; sur téléphone, la cuisine est en haut et le texte foncé sur un fondu crème en bas.

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
├── frames/               ← 350 images ORDINATEUR (1152 × 658) frame_001.webp …
│   └── mobile/           ← 350 images MOBILE (540 × 960)
├── tools/preparer_video.sh ← assemble les 2 vidéos en une vidéo « fluide » (fondus aux coupes, lissage)
├── tools/video_to_frames.py ← découpe la vidéo en images (ordinateur + mobile, fondu crème)
├── tools/keyframes/cuisine-finie.jpg ← image de référence utilisée pour générer les vidéos
├── og.jpg                ← image de partage (1200 × 630)
├── netlify.toml
└── favicon.svg
```

## Les 7 étapes

| # | Étape | Titre | Première image |
|---|-------|-------|----------------|
| 1 | La pièce brute | Tout commence par une pièce vide. | 1 |
| 2 | Plomberie et électricité | Ce qu’on ne voit pas doit être parfait. | 19 |
| 3 | Armoires sur mesure | Façonnées au millimètre. | 58 |
| 4 | Quartz et dosseret | Une seule dalle, aucun compromis. | 101 |
| 5 | Électroménagers et éclairage | La lumière, au bon endroit. | 125 |
| 6 | Les détails | Le luxe se sent dans les détails. | 186 |
| 7 | Votre cuisine (soirée) | Bienvenue dans votre nouvelle cuisine. + « Soumission gratuite » | 277 |

Les images viennent de **2 vraies vidéos générées par IA** (Canva, moteur H3 Max, 15 s chacune, 1344 × 768) :
1. `01-cuisine-construction.mp4` : caméra fixe, la pièce brute se construit en accéléré.
2. `02-cuisine-details-soiree.mp4` : la caméra glisse vers l’îlot, gros plan d’un tiroir à fermeture douce, puis la cuisine en soirée.

Pour un défilement plus fluide, `tools/preparer_video.sh` les assemble en `03-cuisine-maitresse-fluide.mp4` (29,2 s) : les 2 coupes franches de la vidéo 2 deviennent des fondus de 0,5 s et un léger lissage temporel évite que les ouvriers en accéléré « sautent » d’une image à l’autre. Cette vidéo est découpée à **12 images par seconde** (350 images).

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
- **Couleurs et polices** : variables en haut de `css/style.css` (`--bg`, `--gold` = chêne, `--cta` = noir mat, `--veil`, `--serif`, `--sans`). Le style du texte sur la vidéo en écran paysage est dans le bloc `@media (min-aspect-ratio: 9/10)`.
- **Longueur du défilement** : `--story-length: 1100vh` dans `css/style.css`.
- **Image de partage** : une fois en ligne, mets l’adresse complète de `og.jpg` dans `og:image`.

## Remplacer les images

1. Mets tes vidéos (16:9) dans un dossier, puis :
   ```bash
   pip install pillow
   ./tools/preparer_video.sh video-1.mp4 video-2.mp4 maitresse.mp4   # adapte C1/C2 (coupes) en haut du script
   python3 tools/video_to_frames.py maitresse.mp4 --fps 12 --width 1152 --quality 56 --mobile-cx 0.5 --mobile-crop 0.7
   ```
   `--mobile-cx` : centre horizontal gardé sur téléphone (0 à 1) ; `--mobile-crop` : part de la largeur gardée nette. Le fondu mobile utilise la couleur crème du site (`BG` en haut du script).
2. Dans `js/main.js` (bloc `CONFIG`) : `frameCount` = nombre affiché, `stageStartFrames` = première image de chaque étape (repère-les avec `?debug`), et **augmente `version`** à chaque remplacement.
3. Réglages actuels : `frameCount: 350`, `stageStartFrames: [1, 19, 58, 101, 125, 186, 277]`, `blendFrames: true`, `scrub: 0.4`.

Poids : environ 15 Mo d’images au total (11 Mo ordinateur, 3,4 Mo mobile ; un visiteur ne charge qu’un des deux jeux). Le dossier `tools/` n’est pas nécessaire au site (Netlify le bloque).

## Notes techniques

Voir `../construction-scroll/README.md` : même code JavaScript (canvas sans saut de mise en page, chargement prioritaire des débuts d’étapes, accessibilité, option « réduire les animations » respectée).
