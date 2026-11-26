# Outil Reel « site qui défile sur un MacBook » — version cuisine

Copie de `../outil-reel/` réglée pour `cuisine-scroll` (voir `config.json`). Résultat : `../reel-cuisine-scroll.mp4`.
Pour refaire les images 24 i/s : `./images_hd.sh ../sources-cuisine/01-cuisine-construction.mp4 ../sources-cuisine/02-cuisine-details-soiree.mp4` (724 images).
Débuts d’étapes du site : 1, 13, 39, 67, 83, 125, 192 → `debut_etapes` : 1, 37, 115, 199, 247, 373, 574.

Fabrique une vidéo verticale (1080 × 1920, 60 i/s, 15 s) où un site au défilement s'affiche sur l'écran d'un vrai MacBook, posé sur un bureau, et défile comme si quelqu'un utilisait le trackpad :
- élans puis pauses sur chaque texte, avec un petit retour en arrière ;
- barre de défilement macOS, curseur et icône de molette sur le côté ;
- à la fin, la page descend vers la section suivante ;
- accroche en haut, police TikTok Sans.

La boucle est parfaite : le léger mouvement de caméra revient à son point de départ.

## Prérequis

- Node.js + Playwright (Chromium)
- Python 3 + Pillow + numpy
- ffmpeg

## Étapes

1. **Images très fluides (24 i/s) du site**, utilisées seulement pour filmer :
   ```bash
   ./images_hd.sh ../sources/01-construction-timelapse.mp4 ../sources/02-entree-salon-piscine.mp4
   ```
   Le script affiche le nombre d'images : mets-le dans `config.json` → `nb_images`.
2. **Débuts d'étapes** dans `config.json` → `debut_etapes` : ceux du site × 3 (passage de 8 à 24 i/s).
   Formule : `(n - 1) × 3 + 1`. Exemple : 21 → 61.
3. **Aperçu** de quelques images fixes :
   ```bash
   node filmer.js apercu apercu 0.1,4.6,13.9
   ```
4. **Vidéo** (environ 4 à 5 minutes de rendu) :
   ```bash
   node filmer.js video reel.mp4
   ```

## `config.json`

| Clé | Rôle |
|-----|------|
| `site` | Dossier du site à filmer (doit avoir la même structure que `construction-scroll`) |
| `nom_entreprise` | Remplace `[NOM DE L'ENTREPRISE]` dans le logo, seulement dans la vidéo |
| `url_affichee` | Adresse affichée dans la barre de Safari |
| `accroche` | Deux lignes de texte, émojis, style `outline` (blanc détouré) ou `box` (bulle blanche) |
| `photo`, `recadrage`, `coins_ecran` | Photo de fond, zone gardée (x, y, largeur ; la hauteur suit en 9:16) et les 4 coins de l'écran dans la photo : haut-gauche, haut-droit, bas-droit, bas-gauche |
| `gestes` | `[début (s), durée (s), cible]`. Cible : une fraction 0–1 de l'histoire, `"etape:N"` (texte de l'étape N bien visible), `"etape:N-0.03"` (un peu avant, pour un retour en arrière) ou `"fin"` (vers la section suivante) |

`fond-bureau.jpg` : photo d'Austin Poon sur Unsplash (licence Unsplash, usage commercial gratuit). Pour une autre photo, relève précisément les coins de l'écran : c'est ce qui fait que l'incrustation est crédible.
