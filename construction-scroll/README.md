# Site « maison qui se construit au scroll »

Site d'une page pour une entreprise de construction haut de gamme. Quand le visiteur fait défiler la page, une séquence d'images dessinée sur un `<canvas>` montre une maison passer de la fondation à la maison finie avec piscine. Le texte de chaque étape apparaît puis disparaît.

- HTML/CSS/JS pur, aucune étape de compilation.
- GSAP 3.12.5 + ScrollTrigger, inclus localement dans `js/vendor/` (aucun CDN).
- Prêt pour Netlify, avec un formulaire de devis qui fonctionne via Netlify Forms.
- Les images actuelles sont extraites de **2 vraies vidéos générées par IA** (Canva, moteur H3 Max) : une construction en accéléré caméra fixe, puis l'arrivée vers la porte, l'entrée dans le salon et la piscine au coucher du soleil. Le script `tools/video_to_frames.py` les découpe en 225 images. Les vidéos sources sont dans `../promo/sources/`.

---

## Structure

```
construction-scroll/
├── index.html            ← textes, sections, formulaire
├── thanks.html           ← page « merci » après l'envoi du formulaire
├── 404.html
├── css/style.css         ← couleurs, polices, mise en page
├── js/main.js            ← bloc CONFIG en haut = réglages des images
├── js/vendor/            ← GSAP + ScrollTrigger
├── frames/               ← images ORDINATEUR (paysage) frame_001.webp …
│   └── mobile/           ← images MOBILE (portrait) frame_001.webp …
├── tools/video_to_frames.py ← découpe une ou plusieurs vidéos en images (ordinateur + mobile)
├── tools/keyframes/      ← les 7 images de référence utilisées pour générer les vidéos
├── tools/build_frames.py ← (alternative sans vidéo) séquence à partir de 7 images fixes
├── og.jpg                ← image de partage (réseaux sociaux)
├── netlify.toml          ← configuration Netlify (cache, en-têtes)
└── favicon.svg
```

Les 7 étapes :

| # | Étape | Texte | Première image |
|---|-------|-------|-----------------------------|
| 1 | Foundation | Every home starts from the ground up. | 1 |
| 2 | Framing | Brick by brick, floor by floor. | 21 |
| 3 | Roof & structure | Built to last. | 49 |
| 4 | Exterior | Built to the last detail. | 73 |
| 5 | Entrance | Step inside your next chapter. | 105 |
| 6 | Interior | Spaces made for the light. | 160 |
| 7 | Pool / sunset | Welcome home. + « Get a free quote » | 187 |

---

## Tester en local

Il faut un petit serveur, car les navigateurs bloquent certaines choses en `file://`.

```bash
cd construction-scroll
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

Ajoute `?debug` à l'adresse (`http://localhost:8000/?debug`) pour afficher en coin d'écran le **numéro d'image**, l'étape et le dossier utilisé. C'est indispensable pour régler les étapes.

---

## Déployer sur Netlify

**Option A, la plus rapide (glisser-déposer)**
1. Va sur https://app.netlify.com/drop
2. Glisse le dossier `construction-scroll` entier. Le site est en ligne.

**Option B, depuis GitHub (mises à jour automatiques)**
1. Netlify → *Add new site* → *Import an existing project* → choisis ce dépôt.
2. **Base directory** : `construction-scroll`
3. **Build command** : laisser vide
4. **Publish directory** : `construction-scroll` (ou `.` si Netlify l'affiche relatif à la base)
5. *Deploy*.

**Activer le formulaire de devis.** Netlify → ton site → *Forms* → *Enable form detection*, puis redéploie. Les demandes arrivent dans l'onglet *Forms*. Pour les recevoir par courriel : *Forms* → *Form notifications* → *Add notification* → *Email notification*.
Le formulaire a un champ caché anti-robots (honeypot). Après l'envoi, le visiteur arrive sur `thanks.html`.

---

## Remplacer les images par les tiennes

### 1. Produire la séquence

Le plus simple :
1. Crée **7 images clés**, une par étape, avec **le même angle de caméra** et le même terrain (par exemple avec un générateur d'images IA ou un rendu 3D).
2. Génère une vidéo de transition entre chaque paire d'images clés (image → vidéo, début et fin imposés), puis mets les 6 clips bout à bout.
3. Exporte une vidéo **horizontale** (16:9). Idéalement, fais aussi une version **verticale** (9:16) pour les téléphones.

Conseils :
- **Entre 100 et 200 images au total.** Au-delà, le chargement s'allonge sans gain visible.
- **Largeur 1600 px** pour ordinateur, **720 × 1280** pour mobile, qualité WebP ~70.
  Vise **moins de 8 Mo** au total par jeu d'images.
- Garde le sujet **à droite** sur la version horizontale et **dans la moitié haute** sur la version verticale : le texte s'affiche à gauche (ordinateur) et en bas (mobile).

### 2. Extraire les images

**Le plus simple : le script fourni** (Python 3 + Pillow + ffmpeg). Il crée les deux jeux d'images (ordinateur et mobile), en enchaînant plusieurs vidéos si besoin :

```bash
pip install pillow
python3 tools/video_to_frames.py ma-video-1.mp4 ma-video-2.mp4 --fps 8
# options : --width 1152 (largeur ordinateur), --quality 56, --mobile-cx 0.56 (centre gardé sur mobile)
```

Il affiche le nombre d'images à mettre dans `CONFIG.frameCount`.

**Ou à la main avec ffmpeg :**

```bash
# Ordinateur (paysage). Ajuste fps pour obtenir 100–200 images.
ffmpeg -i maison.mp4 -vf "fps=24,scale=1600:-2" \
  -c:v libwebp -quality 72 -compression_level 6 frames/frame_%03d.webp

# Mobile (portrait), à partir d'une vidéo verticale :
ffmpeg -i maison-verticale.mp4 -vf "fps=24,scale=720:1280" \
  -c:v libwebp -quality 72 -compression_level 6 frames/mobile/frame_%03d.webp

# … ou recadrée au centre de la vidéo horizontale :
ffmpeg -i maison.mp4 -vf "fps=24,crop=ih*9/16:ih,scale=720:1280" \
  -c:v libwebp -quality 72 -compression_level 6 frames/mobile/frame_%03d.webp
```

Supprime d'abord les anciennes images (`frames/*.webp` et `frames/mobile/*.webp`). Sinon des anciennes images en trop resteraient à la fin de la séquence.

Calcul du nombre d'images : durée de la vidéo × fps. Par exemple, 6 s × 24 fps = 144 images.

### 3. Mettre à jour la configuration

Ouvre `js/main.js` : tout se règle dans le bloc `CONFIG` en haut du fichier.

```js
frameCount: 144,                                  // nombre d'images (ls frames/*.webp | wc -l)
stageStartFrames: [1, 22, 43, 64, 85, 106, 127],  // 1re image de chaque étape
version: '2',                                     // à augmenter à CHAQUE remplacement
mobilePath: 'frames/mobile/',                     // ou null si tu n'as pas de version verticale
```

- **`frameCount`** : le nombre exact d'images dans `frames/`.
- **`stageStartFrames`** : ouvre le site avec `?debug`, fais défiler et note le numéro d'image où chaque étape commence visuellement. Le texte de chaque étape se cale sur ces numéros.
- **`version`** : les images sont mises en cache un an chez les visiteurs. Change ce numéro (`'2'`, `'3'`…) chaque fois que tu remplaces les images, sinon certains verront les anciennes.
- **`mobilePath`** : la version mobile doit avoir **exactement le même nombre d'images et le même rythme** que la version ordinateur. Si tu n'en as pas, mets `null` et supprime le dossier `frames/mobile/` : les téléphones utiliseront les images horizontales, recadrées au centre.
- **`focusX` / `focusY`** (0 à 1) : quelle partie de l'image reste visible quand l'écran la recadre (0.5 = centre, 0.7 = plutôt à droite).
- **`blendFrames`** : fondu entre deux images voisines. À activer seulement si tes images consécutives sont très proches, sinon on voit une image dédoublée pendant les mouvements rapides.
- **`scrub`** : lissage du défilement en secondes (0 = instantané).

Plus de 999 images : remplace `padStart(3, '0')` par `padStart(4, '0')` dans `fileName` et utilise `%04d` dans ffmpeg.

---

## Personnaliser

**À remplacer dans `index.html`, `thanks.html` et `404.html`** (recherche/remplace) :

| Repère | Exemple |
|--------|---------|
| `[NOM DE L'ENTREPRISE]` | nom de l'entreprise (nav, titre, chargement, pied de page) |
| `[TÉLÉPHONE]` + `tel:+10000000000` | numéro affiché + numéro du lien |
| `[COURRIEL]` (2 fois) | adresse courriel |
| `[RÉGION DESSERVIE]` | ex. « Estrie et environs » |
| `[NUMÉRO DE LICENCE RBQ]` | numéro de licence de la RBQ |

Autres réglages :
- **Textes des étapes** : les balises `<article class="chapter">` dans `index.html`. Le mot en *italique doré* est dans `<em>…</em>`.
- **Services** : la section `#services`. Les 3 services sont des exemples génériques à adapter.
- **Couleurs et polices** : variables en haut de `css/style.css` (`--gold`, `--cta`, `--serif`, `--sans`…).
- **Longueur du défilement** : `--story-length: 1000vh` dans `css/style.css`. Plus grand = construction plus lente.
- **Image de partage** (`og:image`) : `og.jpg` (1200 × 630) est fournie. Une fois le site en ligne, remplace `og.jpg` par son adresse **complète** (ex. `https://tonsite.com/og.jpg`), car les réseaux sociaux ne lisent pas les chemins relatifs.

---

## Alternative sans vidéo (7 images clés → séquence)

Sans vidéo, la séquence est fabriquée à partir de **7 images fixes**, une par étape :
- Les étapes 1 à 4 et 7 utilisent exactement le même angle de caméra. Le fondu de l'une à l'autre donne l'effet « la maison se construit ».
- Les étapes 5 (entrée) et 6 (intérieur) sont amenées par un zoom vers la porte, comme si on entrait dans la maison.
- Sur mobile, toute la maison reste visible en haut de l'écran, avec un dégradé sombre derrière le texte.

Pour changer ces images sans passer par une vidéo :
1. Remplace `tools/keyframes/stage1.jpg` … `stage7.jpg` (format 16:9, même cadrage pour 1-4 et 7).
2. Si la maison n'est pas au même endroit, ajuste les points de zoom en haut de `tools/build_frames.py` (`HOUSE`, `DOOR_ON_EXTERIOR`, `OPEN_DOOR`, `INTERIOR`, `MOBILE_CX`).
3. Lance le script (Python 3 + Pillow), puis augmente `version` dans `js/main.js` :

```bash
pip install pillow
python3 tools/build_frames.py
```

Ce script produit 120 images : remets alors `frameCount: 120` et `stageStartFrames: [1, 18, 35, 52, 69, 86, 103]`, et `blendFrames: false`.

**Important pour un vrai client** : les vidéos et images actuelles sont générées par IA, ce ne sont pas des projets réels. Sur le site d'un entrepreneur, ne les présente pas comme ses réalisations. Remplace-les par des photos ou vidéos de ses chantiers, ou indique clairement qu'il s'agit d'illustrations.

Poids actuel du site : environ 12 Mo d'images pour la version ordinateur (1152 × 648) et 5 Mo pour la version mobile (540 × 960). Pour alléger, baisse `--quality` ou `--fps` dans `video_to_frames.py`.

Le dossier `tools/` n'est pas nécessaire au site. Netlify le bloque (`netlify.toml`) et tu peux le supprimer.

---

## Notes techniques

- **Pas de saut de mise en page** : la zone collante utilise `position: sticky`, sans pin-spacer. Le canvas est dimensionné sur `100lvh`, donc il ne se redimensionne pas quand la barre d'adresse mobile apparaît ou disparaît.
- **Fluidité** : le canvas n'est redessiné que lorsque l'image change (`requestAnimationFrame`). La résolution est limitée à 2× et les images sont décodées pendant le chargement (`img.decode()`).
- **Chargement** : la 1re image et la 1re image de chaque étape sont chargées en priorité, puis le reste, 8 à la fois. Si le chargement dépasse 20 s (`loaderTimeoutMs`), le site démarre quand même avec les images déjà prêtes.
- **Choix du jeu d'images** : il se fait une seule fois au chargement, selon le format de l'écran (largeur / hauteur < 0,9 = mobile).
- **Accessibilité** : tous les textes restent dans le HTML (lisibles par les moteurs de recherche et les lecteurs d'écran). Les pastilles d'étapes sont des boutons cliquables. L'option système « réduire les animations » est respectée.
- **GSAP** : utilisation gratuite pour un site client. Vérifie les conditions actuelles sur gsap.com si besoin.
