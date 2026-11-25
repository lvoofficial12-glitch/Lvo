#!/usr/bin/env python3
"""Assemble les pages de la maquette Esthétique Auto Gagnon (LVO)."""
import pathlib, html

OUT = pathlib.Path('/home/claude/lvo/gagnon')
R = 'https://esthetiqueautogagnon.com/'   # photos du client (hébergées sur leur site actuel)
V = '11'

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12l4 4 10-10"/></svg>'
PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>'
SHIELD = '<svg viewBox="0 0 34 38" fill="none" aria-hidden="true"><path d="M2 2h30v24.5c0 .8-.5 1.5-1.3 1.7L17.9 36a3 3 0 01-1.8 0L3.3 28.2A1.8 1.8 0 012 26.5z" stroke="#c9a45c" stroke-width="1.4"/><text x="17" y="24" text-anchor="middle" font-family="Georgia,serif" font-style="italic" font-size="18" fill="#ecd29b">G</text></svg>'
IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>'
FB = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3a4 4 0 00-4 4v2H8v4h2v8h4v-8h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/></svg>'
TT = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.4 2.3 1.8 3.8 4 4v3.2c-1.5 0-2.9-.4-4-1.2v6.5A5.5 5.5 0 1110.5 10v3.3a2.3 2.3 0 102 2.2V3z"/></svg>'

PAGES = [('index.html', 'Accueil'), ('forfaits.html', 'Forfaits'), ('realisations.html', 'Réalisations'), ('zone.html', 'Zone & FAQ'), ('reserver.html', 'Réserver')]

def head(title, desc, page, extra=''):
    return f'''<!DOCTYPE html>
<html lang="fr-CA">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#070707">
<title>{title}</title>
<meta name="description" content="{html.escape(desc)}">
<link rel="preload" href="fonts/serif.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="style.css?v={V}">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='10' fill='%23070707'/%3E%3Ctext x='20' y='28' font-family='Georgia' font-style='italic' font-size='24' text-anchor='middle' fill='%23ecd29b'%3EG%3C/text%3E%3C/svg%3E">
<script>try{{if(sessionStorage.getItem('eag-intro'))document.documentElement.classList.add('seen')}}catch(e){{}}</script>
{extra}
</head>
<body data-page="{page}">
<div class="progress"></div>
<div class="curtain" aria-hidden="true"><span>Gagnon</span></div>
'''

def header(cur):
    links = ''.join(f'<a href="{f}"{" aria-current=page" if f == cur else ""}>{n}</a>' for f, n in PAGES[1:4])
    mlinks = ''.join(f'<a href="{f}"{" aria-current=page" if f == cur else ""}>{n.replace("&", "&amp;")}</a>' for f, n in PAGES)
    return f'''<header class="site-header">
  <div class="demo-bar"><span class="dl">Maquette préparée par <b>LVO</b> pour Esthétique Auto Gagnon. Aperçu de démonstration, ce n’est pas encore le site officiel.</span><span class="ds">Maquette <b>LVO</b> · aperçu de démonstration</span></div>
  <nav class="nav" aria-label="Navigation principale">
    <a class="logo" href="index.html" aria-label="Esthétique Auto Gagnon, accueil">{SHIELD}<span><b>Auto <i>Gagnon</i></b><small>ESTHÉTIQUE · LÉVIS</small></span></a>
    <div class="menu">{links}</div>
    <div class="nav-r">
      <a class="tel" href="tel:+15819901850">{PHONE}<span>581-990-1850</span></a>
      <a class="btn b-gold btn-sm" href="reserver.html" data-magnetic>Réserver</a>
      <button class="burger" type="button" aria-label="Ouvrir le menu" aria-expanded="false"><i></i><i></i></button>
    </div>
  </nav>
</header>
<nav class="mnav" aria-label="Menu mobile">{mlinks}<p class="mnav-foot">581-990-1850 · Lundi au samedi, 8 h à 17 h<br>90, chemin des Îles, local 313, Lévis</p></nav>
<button class="sound" type="button" aria-pressed="false" aria-label="Activer le son d’ambiance"><span class="bars" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span class="lbl">SON</span></button>
'''

def footer(fab=True):
    f = f'<div class="fab"><a class="btn b-gold" href="reserver.html">Obtenir mon prix {ARROW}</a></div>' if fab else ''
    return f'''<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="logo" href="index.html">{SHIELD}<span><b>Auto <i>Gagnon</i></b><small>ESTHÉTIQUE · LÉVIS</small></span></a>
        <p class="big">Votre véhicule, <em>notre entretien.</em></p>
        <div class="socials">
          <a href="https://www.instagram.com/esthetiqueautogagnon/" target="_blank" rel="noopener" aria-label="Instagram">{IG}</a>
          <a href="https://www.facebook.com/profile.php?id=61575280920215" target="_blank" rel="noopener" aria-label="Facebook">{FB}</a>
          <a href="https://www.tiktok.com/@esthetiqueautogagnon" target="_blank" rel="noopener" aria-label="TikTok">{TT}</a>
        </div>
      </div>
      <div><h4>Atelier</h4><p>90, chemin des Îles, local 313<br>Lévis (Québec)<br>Sur rendez-vous</p></div>
      <div><h4>Heures</h4><p>Lundi au samedi<br>8 h à 17 h<br>Dimanche : fermé</p></div>
      <div><h4>Contact</h4><p><a href="tel:+15819901850">581-990-1850</a><br><a href="mailto:info@esthetiqueautogagnon.com">info@esthetiqueautogagnon.com</a><br><a href="reserver.html">Obtenir mon prix</a></p></div>
    </div>
    <div class="foot-bot"><span>© 2026 Esthétique Auto Gagnon · Lévis, Québec</span><span>Maquette conçue par LVO, Sherbrooke</span></div>
  </div>
</footer>
{f}
<script src="vendor/gsap.min.js"></script>
<script src="vendor/ScrollTrigger.min.js"></script>
<script src="vendor/lenis.min.js"></script>
<script src="app.js?v={V}"></script>
</body>
</html>
'''

INTRO = '''<div id="intro" aria-hidden="true"><div class="beam l"></div><div class="beam r"></div><div class="flash"></div><div class="eyes"><div class="eye l"></div><div class="eye r"></div></div><div class="brand"><b>Esthétique Auto <i>Gagnon</i></b><small>LE LUXE À VOTRE PORTE</small></div></div>
<script>if(document.documentElement.classList.contains('seen')){var i=document.getElementById('intro');i&&i.remove()}</script>
'''

def li(items):
    return ''.join(f'<li>{CHECK}<span>{x}</span></li>' for x in items)

def plan_cards():
    return f'''<div class="plans">
  <article class="plan">
    <div class="kind">ENTRETIEN RÉGULIER</div><h3>Éclat</h3><div class="from">Berline, taxes incluses</div>
    <div class="price">220<sup>$</sup></div>
    <p>Un vrai nettoyage complet, intérieur et extérieur, fait à la main de A à Z.</p>
    <ul>{li(["Extérieur à la main : carrosserie, ailes, jantes et roues","Pneus lustrés et vitres extérieures sans traces","Aspirateur complet : sièges, tapis, coffre","Volant, tableau de bord, plastiques et cuir nettoyés"])}</ul>
    <a class="btn b-line" href="forfaits.html?f=eclat#config">Obtenir mon prix {ARROW}</a>
  </article>
  <article class="plan hot">
    <span class="tag">LE PLUS POPULAIRE</span>
    <div class="kind">MEILLEURE VALEUR</div><h3>Renaissance</h3><div class="from">Berline, taxes incluses</div>
    <div class="price">399<sup>$</sup></div>
    <p>Intérieur remis à neuf, carrosserie décontaminée et scellée. Une brillance qui tient de 3 à 6 mois.</p>
    <ul>{li(["Tout le forfait Éclat","Remise à neuf complète de l’intérieur","Décontamination de la carrosserie","Scellant : l’eau perle de 3 à 6 mois"])}</ul>
    <a class="btn b-gold" href="forfaits.html?f=renaissance#config" data-magnetic>Obtenir mon prix {ARROW}</a>
  </article>
  <article class="plan">
    <div class="kind">POLISSAGE &amp; CÉRAMIQUE</div><h3>Protection ultime</h3><div class="from">Céramique 1 an, à partir de</div>
    <div class="price">400<sup>$</sup></div>
    <p>Peinture corrigée, puis protégée par une céramique GYEON. Revêtements plus durables sur devis.</p>
    <ul>{li(["Lavage complet et décontamination inclus","Correction et polissage de la peinture","Céramique GYEON garantie 1 an (jusqu’à 5 ans)","Entretien facilité, lustre préservé"])}</ul>
    <a class="btn b-line" href="forfaits.html?f=ultime#config">Obtenir mon prix {ARROW}</a>
  </article>
</div>'''

REVIEWS = [
    ('Jeremy Aubut', 'Google', "Dès le premier contact, Jean-Thomas Gagnon a fait preuve de professionnalisme, de courtoisie et d’un grand souci du détail. Mon véhicule m’a été remis dans un état impeccable."),
    ('Philippe Victorin', 'Google', "Meilleur service, détail incroyable sur ma Porsche 911 Turbo. Merci Jean-Thomas !"),
    ('Danny Miville', 'Facebook', "Jeune entrepreneur très ponctuel et soucieux du travail bien fait ! Elle était plus belle après son passage qu’en sortant du garage il y a quelques années."),
    ('Jason Gagnon', 'Facebook', "Service de lavage auto à domicile, impeccable ! Jean-Thomas est un vrai passionné, le résultat a largement dépassé mes attentes."),
    ('Mélanie Labrecque', 'Facebook', "Le travail est impeccable : minutieux, soigné et de grande qualité. Je le recommande fortement."),
    ('Marie-Pier Dubé', 'Facebook', "Un super beau travail de Jean-Thomas ! Si jamais vous souhaitez un grand nettoyage de votre véhicule, je vous le recommande."),
]
def rev_card(n, s, t):
    return f'<article class="rev-card"><div class="rev-top"><span class="stars" aria-label="5 étoiles sur 5">★★★★★</span><span class="src">{s.upper()}</span></div><q>{t}</q><div class="who"><span class="av">{n[0]}</span><span>{n}<span class="src">Avis {s}</span></span></div></article>'
def wall():
    a = ''.join(rev_card(*r) for r in REVIEWS[:3] + REVIEWS[3:])
    b = ''.join(rev_card(*r) for r in [REVIEWS[i] for i in (4, 1, 5, 0, 3, 2)])
    return f'<div class="wall"><div class="wall-row">{a}{a}</div><div class="wall-row rev" aria-hidden="true">{b}{b}</div></div>'

# ---------------------------------------------------------------- ACCUEIL
index = head('Esthétique Auto Gagnon | Esthétique automobile de luxe à Lévis', "Esthétique automobile haut de gamme à Lévis et Québec : lavage à la main, décontamination, scellant, polissage et céramique GYEON. Chez vous ou à l’atelier.", 'home',
             '<link rel="preload" href="car.glb" as="fetch" crossorigin>') + INTRO + header('index.html') + f'''<main>
<section class="hero" id="hero">
  <div class="hero-stage">
    <div class="hero-fallback" style="background-image:url({R}gt3rs-hero.webp)"></div>
    <canvas id="car" aria-label="Voiture en 3D qui tourne pendant le défilement" role="img"></canvas>
    <div class="hero-streak" aria-hidden="true"></div>
    <div class="hero-c">
      <div class="over hp">LÉVIS · QUÉBEC · CERTIFIÉ GYEON</div>
      <h1 data-split class="hero-title">Le luxe <em>à votre porte.</em></h1>
      <p class="lead hp">Esthétique automobile haut de gamme, faite à la main. On se déplace chez vous ou on vous reçoit à notre atelier de Lévis.</p>
      <div class="ctas hp"><a class="btn b-gold" href="forfaits.html#config" data-magnetic>Obtenir mon prix {ARROW}</a><a class="btn b-line" href="realisations.html">Nos réalisations</a></div>
      <div class="chips hp"><div class="chip"><b>5,0</b><span><span class="stars">★★★★★</span><br>Google &amp; Facebook</span></div><div class="chip"><b>200+</b><span>clients<br>satisfaits</span></div></div>
    </div>
    <div class="hero-steps" aria-hidden="true">
      <div class="hero-step on"><div class="bar"><i></i></div><b>Habitacle</b><span>Intérieur remis à neuf</span></div>
      <div class="hero-step"><div class="bar"><i></i></div><b>Carrosserie</b><span>Lavage deux seaux</span></div>
      <div class="hero-step"><div class="bar"><i></i></div><b>Protection</b><span>Céramique GYEON</span></div>
    </div>
    <div class="scroll-hint" aria-hidden="true"><i></i>DÉFILEZ</div>
  </div>
</section>

<div class="marquee" aria-hidden="true"><div class="track">{''.join(f'<span>{w}</span><span class="dot"></span>' for w in ['Lavage à la main','Décontamination','Scellant','Céramique GYEON','Polissage','Motos','Lavage à la main','Décontamination','Scellant','Céramique GYEON','Polissage','Motos'])}</div></div>

<section class="sec" id="services">
  <div class="wrap">
    <div class="sec-head"><div><span class="over">Nos services</span><h2 data-split>Chaque véhicule, <em>traité en profondeur.</em></h2></div><p class="lead" data-reveal>Trois expertises, appliquées avec le même soin. Taxes incluses sur tous nos prix.</p></div>
    <div class="svc">
      <article class="svc-card" data-tilt><div class="ph"><img src="{R}real-04.webp" alt="Habitacle en cuir rouge nettoyé" data-parallax></div><div class="glare"></div><div class="tx"><div class="num">01 · INTÉRIEUR</div><h3>Habitacle</h3><ul><li>Aspiration complète</li><li>Shampoing des tapis, sièges et tissus</li><li>Plastiques, recoins et cuir traités</li><li>Tableau de bord et vitres sans traces</li></ul></div></article>
      <article class="svc-card" data-tilt><div class="ph"><img src="img/foam-door.webp" alt="Carrosserie couverte de mousse pendant le lavage" data-parallax></div><div class="glare"></div><div class="tx"><div class="num">02 · EXTÉRIEUR</div><h3>Carrosserie</h3><ul><li>Lavage à la main, méthode deux seaux</li><li>Jantes, pneus et passages de roues</li><li>Décontamination de la peinture</li><li>Séchage sans traces, plastiques ravivés</li></ul></div></article>
      <article class="svc-card" data-tilt><div class="ph"><img src="img/drops.webp" alt="Gouttes d’eau qui perlent sur une carrosserie protégée" data-parallax></div><div class="glare"></div><div class="tx"><div class="num">03 · PROTECTION</div><h3>Longue durée</h3><ul><li>Scellant céramique de 3 à 6 mois</li><li>Céramique GYEON garantie 1 an et plus</li><li>Effet hydrophobe, protection UV</li><li>Polissage et correction de la peinture</li></ul></div></article>
    </div>
  </div>
</section>

<section class="wash" id="lavage">
  <div class="wash-stage">
    <div class="wash-img"><img src="{R}gt3rs-hero.webp" alt="Voiture sport grise impeccable après le traitement"></div>
    <div class="wash-dirty"><img src="{R}gt3rs-hero.webp" alt="" aria-hidden="true"><canvas></canvas></div>
    <canvas class="wash-fx" aria-hidden="true"></canvas>
    <div class="wash-shine" aria-hidden="true"></div>
    <div class="wash-c">
      <span class="over">Défilez pour laver</span>
      <h2>De poussiéreuse <em>à éclatante.</em></h2>
      <ol class="wash-steps">
        <li class="on"><b>01</b><span>Mousse active</span><small>La saleté se décolle sans frotter la peinture.</small></li>
        <li><b>02</b><span>Lavage deux seaux</span><small>À la main, pour éviter les micro-rayures.</small></li>
        <li><b>03</b><span>Décontamination</span><small>On retire ce que le lavage ne retire pas.</small></li>
        <li><b>04</b><span>Scellant</span><small>L’eau perle de 3 à 6 mois.</small></li>
      </ol>
    </div>
    <div class="wash-done">Éclat retrouvé.</div>
    <div class="wash-meter"><b><span class="wash-pct">0</span>%</b><small>PROPRETÉ</small></div>
  </div>
</section>

<section class="sec">
  <div class="wrap">
    <div class="stats">
      <div class="stat" data-reveal><b><span data-count="200">0</span>+</b><span>Clients satisfaits</span></div>
      <div class="stat" data-reveal><b><span data-count="5" data-dec="1">0</span><em>★</em></b><span>Note Google</span></div>
      <div class="stat" data-reveal><b><span data-count="5" data-dec="1">0</span><em>★</em></b><span>Note Facebook</span></div>
      <div class="stat" data-reveal><b><span data-count="6">0</span><em>/7</em></b><span>Jours disponibles</span></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="over">Forfaits auto</span><h2 data-split>Trois niveaux, <em>un véhicule impeccable.</em></h2></div><a class="link" href="forfaits.html#config">Calculer mon prix exact {ARROW}</a></div>
    {plan_cards()}
  </div>
</section>

<section class="sec moto" id="moto">
  <div class="wrap moto-grid">
    <div>
      <span class="over">Vous avez une moto ?</span>
      <h2 data-split>Sport, custom <em>ou Harley.</em></h2>
      <p class="lead" data-reveal style="margin-top:24px">Les mêmes standards, au prix moto. Lavage complet à la main, roues, pneus et chromes nettoyés à fond, plastiques ravivés.</p>
      <div class="moto-prices" data-reveal><div class="mp"><b>99 $</b><span>Lavage classique</span></div><div class="mp"><b>179 $</b><span>Renaissance moto</span></div></div>
      <a class="btn b-line" href="forfaits.html?v=moto#config" data-reveal>Prix moto {ARROW}</a>
    </div>
    <div class="moto-fan">
      <figure><img src="{R}moto-sport-yamaha-mt-09.webp" alt="Moto naked noire et jaune après lavage"><figcaption>NAKED</figcaption></figure>
      <figure><img src="{R}moto-kawasaki-zx4rr.webp" alt="Moto sport après lavage"><figcaption>SPORT</figcaption></figure>
      <figure><img src="{R}moto-bmw-s1000rr.webp" alt="Moto sport rouge et blanche après lavage"><figcaption>SUPERSPORT</figcaption></figure>
    </div>
  </div>
</section>

<section class="sec" id="avis" style="overflow:hidden">
  <div class="wrap"><div class="sec-head"><div><span class="over">Ils nous font confiance</span><h2 data-split>5,0 sur Google. <em>5,0 sur Facebook.</em></h2></div><p class="lead" data-reveal>26 avis Google, 17 avis Facebook. Tous à 5 étoiles.</p></div></div>
  {wall()}
  <div class="rev-links"><a class="link" href="https://www.google.com/maps/search/Esth%C3%A9tique+Auto+Gagnon+L%C3%A9vis" target="_blank" rel="noopener">Voir les avis Google {ARROW}</a><a class="link" href="https://www.facebook.com/profile.php?id=61575280920215" target="_blank" rel="noopener">Voir les avis Facebook {ARROW}</a></div>
</section>

<section class="cta-end">
  <div class="ring"></div><div class="ring"></div><div class="ring"></div>
  <div class="wrap">
    <span class="over">Chez vous ou à l’atelier</span>
    <h2 data-split>Votre auto <em>mérite ça.</em></h2>
    <div class="ctas" data-reveal><a class="btn b-gold" href="reserver.html" data-magnetic>Réserver maintenant {ARROW}</a><a class="btn b-line" href="zone.html">Zone desservie</a></div>
  </div>
</section>
</main>
''' + footer().replace('<span>Maquette conçue par LVO, Sherbrooke</span>', '<span>Modèle 3D « Car Concept » : Eric Chadwick, Darmstadt Graphics Group, <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> · Maquette conçue par LVO, Sherbrooke</span>').replace('<script src="app.js', '<script src="car.min.js?v=' + V + '"></script>\n<script src="app.js')

# ---------------------------------------------------------------- FORFAITS
VEH_ICON = {
 'berline': '<path d="M3 17h2m14 0h2M5 17a2 2 0 104 0 2 2 0 10-4 0m10 0a2 2 0 104 0 2 2 0 10-4 0M3 17v-3l3-1 3-4h7l4 4 2 1v3"/>',
 'vus': '<path d="M3 17h2m14 0h2M5 17a2 2 0 104 0 2 2 0 10-4 0m10 0a2 2 0 104 0 2 2 0 10-4 0M3 17v-5l2-1 2-4h10l3 4 1 1v5"/>',
 'pickup': '<path d="M3 17h2m14 0h2M5 17a2 2 0 104 0 2 2 0 10-4 0m10 0a2 2 0 104 0 2 2 0 10-4 0M3 17v-4h9V8h5l3 5h1v4"/>',
 'minivan': '<path d="M3 17h2m14 0h2M5 17a2 2 0 104 0 2 2 0 10-4 0m10 0a2 2 0 104 0 2 2 0 10-4 0M3 17V9l2-2h11l4 5 1 1v4"/>',
 'moto': '<path d="M4 17a3 3 0 106 0 3 3 0 10-6 0m10 0a3 3 0 106 0 3 3 0 10-6 0M7 17l4-6h4l2 6M13 8h3l1 3"/>',
}
VEH = [('berline','Berline'),('vus','VUS'),('pickup','Pick-up'),('minivan','Mini-van / VUS 7'),('moto','Moto')]
def veh_opts(name='veh', checked='berline'):
    return ''.join(f'<label class="opt"><input type="radio" name="{name}" value="{k}"{" checked" if k==checked else ""}><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round">{VEH_ICON[k]}</svg><b>{l}</b></span></label>' for k, l in VEH)
EXTRAS = [('deco','Décontamination de la carrosserie',50,False,True),('nanocuir','Nano-céramique des bancs de cuir',150,False,False),('phares','Restauration de phares',100,True,True),('extraction','Extraction des sièges en profondeur',50,True,False),('aquapel','Aquapel : vitres hydrophobes',40,False,False),('moteur','Shampooing moteur',50,False,True),('plastiques','Conditionnement des plastiques',35,False,True),('calcium','Retrait du calcium (tapis)',30,False,False),('poils','Poils d’animaux',20,True,False),('odeurs','Élimination des mauvaises odeurs',49,False,False)]
def extra_opts():
    return ''.join(f'<label class="opt{"" if moto else " car-only"}"><input type="checkbox" name="ex" value="{k}" data-price="{p}" data-from="{1 if d else 0}"><span><b>{n}</b><em class="pp">{"dès " if d else "+"}{p} $</em></span></label>' for k, n, p, d, moto in EXTRAS)

forfaits = head('Forfaits et prix | Esthétique Auto Gagnon, Lévis', "Prix taxes incluses : Éclat dès 220 $, Renaissance dès 399 $, céramique GYEON dès 400 $. Calculez votre prix selon votre véhicule.", 'forfaits') + header('forfaits.html') + f'''<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  <span class="over">Forfaits &amp; prix</span>
  <h1 data-split>Votre prix, <em>en 3 clics.</em></h1>
  <p class="lead" data-reveal>Choisissez votre véhicule, votre forfait et vos extras. Le total s’affiche instantanément, taxes incluses, sans surprise.</p>
</div></section>

<section class="sec" id="config" style="padding-top:20px">
  <div class="wrap config">
    <form class="cfg-steps" id="cfg" onsubmit="return false">
      <fieldset class="cfg-box" data-reveal><legend class="sr">Type de véhicule</legend><h3><small>01</small>Votre véhicule</h3><div class="opts veh">{veh_opts()}</div></fieldset>
      <fieldset class="cfg-box" data-reveal><legend class="sr">Forfait</legend><h3><small>02</small>Votre forfait</h3><div class="opts pk">
        <label class="opt"><input type="radio" name="pk" value="eclat"><span><b>Éclat</b><small>Nettoyage complet, intérieur et extérieur</small><em class="pp" data-pk="eclat">220 $</em></span></label>
        <label class="opt"><input type="radio" name="pk" value="renaissance" checked><span><b>Renaissance</b><small>Intérieur à neuf, décontamination, scellant</small><em class="pp" data-pk="renaissance">399 $</em></span></label>
        <label class="opt"><input type="radio" name="pk" value="ultime"><span><b>Protection ultime</b><small>Polissage et céramique GYEON</small><em class="pp" data-pk="ultime">dès 400 $</em></span></label>
      </div></fieldset>
      <fieldset class="cfg-box" data-reveal><legend class="sr">Extras</legend><h3><small>03</small>Vos extras <span style="font:500 13px var(--sans);color:var(--mute)">(facultatif)</span></h3><div class="opts ex">{extra_opts()}</div></fieldset>
    </form>
    <aside class="summary" id="resume" data-reveal aria-live="polite">
      <div class="shine"></div>
      <span class="over">Votre estimation</span>
      <ul class="lines"></ul>
      <div class="total-lbl">TOTAL, TAXES INCLUSES</div>
      <div class="total"><span class="pre"></span><span class="odo" aria-hidden="true"></span><span class="cur-s">$</span><span class="sr total-sr"></span></div>
      <p class="note">Prix exact confirmé selon l’état du véhicule. Aucun paiement en ligne pour réserver.</p>
      <a class="btn b-gold" id="cfg-go" href="reserver.html" data-magnetic>Réserver avec ce forfait {ARROW}</a>
    </aside>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="over">Tous les prix</span><h2 data-split>La grille <em>complète.</em></h2></div><p class="lead" data-reveal>Taxes incluses. Durée : de 1 h à une journée selon le forfait, confirmée à la réservation.</p></div>
    <div class="table-wrap" data-reveal><table class="ptable">
      <thead><tr><th>Forfait</th><th>Berline</th><th>VUS</th><th>Pick-up</th><th>Mini-van / VUS 7</th><th>Moto</th></tr></thead>
      <tbody>
        <tr><th>Éclat<small>Entretien régulier</small></th><td>220 $</td><td>240 $</td><td>260 $</td><td>280 $</td><td>99 $</td></tr>
        <tr><th>Renaissance<small>Le plus populaire</small></th><td>399 $</td><td>419 $</td><td>439 $</td><td>459 $</td><td>179 $</td></tr>
        <tr><th>Protection ultime<small>Céramique 1 an</small></th><td>dès 400 $</td><td class="q">sur devis</td><td class="q">sur devis</td><td class="q">sur devis</td><td class="q">sur devis</td></tr>
        <tr><th>Céramique 3 à 5 ans<small>Ou polissage seul</small></th><td class="q">sur devis</td><td class="q">sur devis</td><td class="q">sur devis</td><td class="q">sur devis</td><td class="q">sur devis</td></tr>
      </tbody>
    </table></div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="over">À la carte</span><h2 data-split>Les <em>extras.</em></h2></div></div>
    <div class="extras">{''.join(f'<div class="extra" data-reveal><span>{n}</span><b>{"dès " if d else "+"}{p} $</b></div>' for k,n,p,d,m in EXTRAS)}</div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="promise">
      <div class="prom" data-reveal><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M4 12a8 8 0 0114-5.3M20 12a8 8 0 01-14 5.3M18 3v4h-4M6 21v-4h4"/></svg><b>Satisfait ou on revient</b><span>Sans frais.</span></div>
      <div class="prom" data-reveal><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="M8.5 12l2.5 2.5 4.5-5"/></svg><b>Sans surprise</b><span>Prix final, taxes incluses.</span></div>
      <div class="prom" data-reveal><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M3 21V9l9-6 9 6v12"/><path d="M8 21v-7h8v7"/></svg><b>Atelier à Lévis</b><span>Équipement professionnel.</span></div>
      <div class="prom" data-reveal><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"/></svg><b>Certifié GYEON</b><span>Produits professionnels.</span></div>
    </div>
  </div>
</section>

<section class="cta-end"><div class="ring"></div><div class="ring"></div><div class="ring"></div><div class="wrap"><span class="over">Cartes cadeaux dès 50 $</span><h2 data-split>Offrez <em>l’éclat.</em></h2><div class="ctas" data-reveal><a class="btn b-gold" href="reserver.html" data-magnetic>Réserver {ARROW}</a><a class="btn b-line" href="tel:+15819901850">581-990-1850</a></div></div></section>
</main>
''' + footer()

# ---------------------------------------------------------------- RÉALISATIONS
GAL = [('real-10','auto','Voiture sport grise avec aileron','Extérieur'),('real-11','auto','Berline sport noire, finition miroir','Extérieur'),('real-04','int','Sièges en cuir rouge remis à neuf','Intérieur'),
       ('real-01','auto','Jante et carrosserie noire impeccables','Détail'),('real-08','moto','Moto naked noire et jaune','Moto'),('real-03','auto','VUS blanc après traitement complet','Extérieur'),
       ('real-05','int','Tapis nettoyés en profondeur','Intérieur'),('real-07','moto','Moto sport après lavage à la main','Moto'),('real-02','auto','VUS noir fraîchement lavé','Extérieur'),
       ('real-09','auto','Jante noire et étrier, protection','Détail'),('real-06','auto','Coffre et carrosserie, traitement complet','Extérieur')]
gal = ''.join(f'<figure data-cat="{c}" data-tilt><img src="{R}{f}.webp" alt="{a}" loading="lazy"><figcaption><small>{t.upper()}</small>{a}</figcaption></figure>' for f,c,a,t in GAL)
BA_H = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>'
def ba(name, label):
    return f'''<div><div class="ba" data-ba><img src="{R}avant-{name}.webp" alt="{label}, avant le nettoyage"><img class="after" src="{R}apres-{name}.webp" alt="{label}, après le nettoyage"><span class="lb l">AVANT</span><span class="lb r">APRÈS</span><div class="handle"><i>{BA_H}</i></div><input type="range" min="0" max="100" value="50" aria-label="Comparer avant et après, {label}"></div><p class="ba-cap">{label} · nettoyage intérieur complet</p></div>'''

realisations = head('Réalisations | Esthétique Auto Gagnon, Lévis', "Avant/après et réalisations : voitures sport, VUS, intérieurs et motos traités par Esthétique Auto Gagnon à Lévis.", 'realisations') + header('realisations.html') + f'''<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  <span class="over">Nos réalisations</span>
  <h1 data-split>La preuve <em>en image.</em></h1>
  <p class="lead" data-reveal>Voitures sport, VUS familiaux, intérieurs et motos, tous traités à Lévis.</p>
</div></section>

<section class="sec" style="padding-top:10px">
  <div class="wrap">
    <div class="sec-head"><div><span class="over">Avant / après</span><h2 data-split>Glissez <em>pour comparer.</em></h2></div></div>
    <div class="ba-grid">{ba('kia-sorento','VUS familial')}{ba('audi-etron','VUS électrique')}</div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="over">Galerie</span><h2 data-split>Sortis <em>de l’atelier.</em></h2></div></div>
    <div class="filters" role="group" aria-label="Filtrer la galerie"><button type="button" aria-pressed="true" data-f="all">Tout</button><button type="button" aria-pressed="false" data-f="auto">Auto</button><button type="button" aria-pressed="false" data-f="int">Intérieur</button><button type="button" aria-pressed="false" data-f="moto">Moto</button></div>
    <div class="gal">{gal}</div>
  </div>
</section>

<section class="sec" id="histoire">
  <div class="wrap">
    <div class="story">
      <div class="ph reveal-img"><img src="img/polisher.webp" alt="Détaileur qui polit une carrosserie à la machine" data-parallax></div>
      <div>
        <span class="over">Notre histoire</span>
        <h2 data-split>Tout a commencé <em>à 15 ans.</em></h2>
        <p class="lead" data-reveal style="margin-top:24px">En 2023, Jean-Thomas Gagnon lance sa première entreprise de lavage. Le bouche-à-oreille fait le reste. Il perfectionne ses techniques, obtient sa certification GYEON et bâtit Esthétique Auto Gagnon, à Lévis.</p>
        <blockquote data-reveal>« J’ai transformé ma passion en métier. Chaque véhicule, je le traite comme s’il était le mien. »</blockquote>
        <cite data-reveal>JEAN-THOMAS GAGNON · FONDATEUR, DÉTAILEUR CERTIFIÉ GYEON</cite>
      </div>
    </div>
    <div class="timeline"><div class="tl-fill"></div>
      <div class="tl" data-reveal><b>2023</b><h4>Les débuts</h4><p>Une passion devient une entreprise.</p></div>
      <div class="tl" data-reveal><b>2024</b><h4>Premiers clients</h4><p>Le bouche-à-oreille et les techniques qui s’affinent.</p></div>
      <div class="tl" data-reveal><b>2025</b><h4>Certification</h4><p>Certification GYEON et lancement officiel.</p></div>
      <div class="tl" data-reveal><b>2026</b><h4>La référence</h4><p>Auto et moto, à Lévis et Québec.</p></div>
    </div>
  </div>
</section>

<section class="cta-end"><div class="ring"></div><div class="ring"></div><div class="ring"></div><div class="wrap"><span class="over">À votre tour</span><h2 data-split>La prochaine, <em>c’est la vôtre.</em></h2><div class="ctas" data-reveal><a class="btn b-gold" href="forfaits.html#config" data-magnetic>Obtenir mon prix {ARROW}</a></div></div></section>
</main>
''' + footer()

# ---------------------------------------------------------------- ZONE & FAQ
FAQ = [
 ('Où se déroule le service ?', "Chez vous ou à notre atelier, au 90, chemin des Îles, local 313, à Lévis. L’hiver, le service à domicile demande un garage, un entrepôt ou un espace intérieur. Si vous venez à l’atelier, prévoyez votre transport : il n’y a pas de salle d’attente."),
 ('Combien de temps dure un service ?', "Environ 1 h 30 pour une décontamination et un scellant, de 4 à 5 h pour un forfait complet (Éclat ou Renaissance), et jusqu’à une journée pour une protection céramique. On vous confirme la durée exacte selon votre véhicule."),
 ('Comment sont fixés vos prix ?', "Selon le format de votre véhicule (berline, VUS, pick-up, mini-van ou VUS 7 places, moto) et le forfait choisi. Tous nos prix sont taxes incluses."),
 ('Quelle est votre zone de service ?', "Lévis et tous ses secteurs (Saint-Romuald, Saint-Nicolas, Saint-Rédempteur, Charny, Pintendre, Lauzon), ainsi que la région de Québec et la Rive-Sud. Écrivez-nous pour confirmer votre secteur."),
 ('Êtes-vous ouverts à l’année ?', "Oui. L’atelier de Lévis est ouvert à l’année, du lundi au samedi, sur rendez-vous."),
 ('Quelle est votre politique d’annulation ?', "La réservation est gratuite, sans paiement en ligne obligatoire. Annulation sans frais jusqu’à 24 h avant. Des frais de 20 $ s’appliquent pour une annulation de dernière minute ou un rendez-vous manqué."),
 ('Dois-je préparer quelque chose ?', "Retirez simplement vos effets personnels du véhicule, sinon des frais peuvent s’appliquer."),
 ('Êtes-vous certifiés ?', "Oui, Jean-Thomas est certifié GYEON, une certification professionnelle qui garantit des standards élevés et des produits haut de gamme."),
 ('Quels moyens de paiement acceptez-vous ?', "Comptant, virement Interac, carte sur place ou paiement en ligne sécurisé par Square."),
 ('Offrez-vous des cartes cadeaux ?', "Oui, de 50 $ à 200 $ ou au montant de votre choix, livrées par courriel ou texto. Aucune date d’expiration, valables sur tous les services."),
]
faq = ''.join(f'<div class="qa" data-reveal><button type="button" aria-expanded="false" id="q{i}" aria-controls="a{i}">{q}<i aria-hidden="true"></i></button><div class="ans" id="a{i}" role="region" aria-labelledby="q{i}"><p>{a}</p></div></div>' for i, (q, a) in enumerate(FAQ))

MAP = '''<svg viewBox="0 0 800 600" role="img" aria-label="Carte stylisée de la zone desservie : Lévis sur la rive sud et Québec sur la rive nord du fleuve Saint-Laurent">
<defs><linearGradient id="riv" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="#0f1a22"/><stop offset=".5" stop-color="#1c2f3a"/><stop offset="1" stop-color="#0f1a22"/></linearGradient></defs>
<g class="grid">''' + ''.join(f'<line x1="{x}" y1="0" x2="{x}" y2="600"/>' for x in range(0, 801, 50)) + ''.join(f'<line x1="0" y1="{y}" x2="800" y2="{y}"/>' for y in range(0, 601, 50)) + '''</g>
<path class="river" d="M-20 470C60 445 120 415 180 390 260 357 330 335 400 312 460 292 520 285 580 250 640 215 720 185 820 160"/>
<path class="river-line" d="M-20 470C60 445 120 415 180 390 260 357 330 335 400 312 460 292 520 285 580 250 640 215 720 185 820 160"/>
<ellipse class="bank isle" cx="705" cy="190" rx="70" ry="13" transform="rotate(-17 705 190)"/>
<text class="label" x="190" y="402" transform="rotate(-21 190 402)">FLEUVE SAINT-LAURENT</text>
<circle class="radius" cx="470" cy="342" r="215"/>
<g class="dot big" data-d><circle cx="500" cy="215" r="7"/><text x="514" y="222">Québec</text></g>
<g class="dot" data-d><circle cx="365" cy="252" r="4.5"/><text x="377" y="256">Sainte-Foy</text></g>
<g class="dot" data-d><circle cx="585" cy="318" r="4.5"/><text x="597" y="322">Lauzon</text></g>
<g class="dot" data-d><circle cx="560" cy="430" r="4.5"/><text x="572" y="434">Pintendre</text></g>
<g class="dot" data-d><circle cx="360" cy="378" r="4.5"/><text x="372" y="382">Saint-Romuald</text></g>
<g class="dot" data-d><circle cx="300" cy="428" r="4.5"/><text x="312" y="432">Charny</text></g>
<g class="dot" data-d><circle cx="215" cy="482" r="4.5"/><text x="227" y="486">Saint-Rédempteur</text></g>
<g class="dot" data-d><circle cx="96" cy="500" r="4.5"/><text x="70" y="526">Saint-Nicolas</text></g>
<g class="pin"><circle class="pulse" cx="470" cy="342" r="12"/><circle class="pulse" cx="470" cy="342" r="12"/><circle class="core" cx="470" cy="342" r="8"/></g>
<g class="dot big"><text x="488" y="352">Lévis</text><text x="488" y="372" style="font:600 10px var(--sans);letter-spacing:.2em;fill:#c9a45c">ATELIER</text></g>
</svg>'''

zone = head('Zone desservie et FAQ | Esthétique Auto Gagnon, Lévis', "Service mobile ou à l’atelier de Lévis : Lévis, Saint-Romuald, Saint-Nicolas, Charny, Lauzon, Pintendre, Québec et Rive-Sud. Questions fréquentes.", 'zone') + header('zone.html') + f'''<main>
<section class="phero"><div class="glow"></div><div class="wrap">
  <span class="over">Zone desservie</span>
  <h1 data-split>Les deux rives <em>du fleuve.</em></h1>
  <p class="lead" data-reveal>Lévis, Québec et les environs. On se déplace chez vous ou on vous reçoit à l’atelier.</p>
</div></section>

<section class="sec" style="padding-top:10px">
  <div class="wrap map-wrap">
    <div class="map" data-map>{MAP}<div class="map-legend"><span><i></i>Secteurs desservis</span></div></div>
    <div>
      <span class="over">Notre atelier</span>
      <h3 style="font-size:clamp(34px,3.6vw,52px);margin:16px 0 14px">90, chemin des Îles, <em>local 313, Lévis</em></h3>
      <p class="lead">Sur rendez-vous, du lundi au samedi, de 8 h à 17 h.</p>
      <div class="ctas"><a class="btn b-gold" href="https://www.google.com/maps/search/90+chemin+des+%C3%8Eles+L%C3%A9vis" target="_blank" rel="noopener">Itinéraire {ARROW}</a><a class="btn b-line" href="tel:+15819901850">581-990-1850</a></div>
      <p style="margin-top:22px;font-size:14px;color:var(--mute)">Pas certain d’être dans la zone ? Appelez ou écrivez-nous.</p>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="over">Deux façons</span><h2 data-split>Chez vous <em>ou à l’atelier.</em></h2></div></div>
    <div class="two">
      <div class="mode" data-reveal><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 11l9-7 9 7v9a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1z"/></svg><h3>On se déplace <em>chez vous</em></h3><p>Le service mobile vient à votre porte. Vous n’avez pas à bouger.</p><div class="note">❄ L’hiver : un garage, un entrepôt ou un espace intérieur est requis. Sinon, passez à l’atelier.</div></div>
      <div class="mode" data-reveal><svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M3 21V9l9-6 9 6v12"/><path d="M7 21v-8h10v8M7 17h10"/></svg><h3>À notre <em>atelier</em></h3><p>Garage professionnel dédié à l’esthétique automobile, ouvert à l’année.</p><div class="note">Prévoyez votre transport : il n’y a pas de salle d’attente.</div></div>
    </div>
  </div>
</section>

<section class="sec" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="over">Simple comme bonjour</span><h2 data-split>Comment <em>ça marche.</em></h2></div></div>
    <div class="how">
      <div class="how-s" data-reveal><b>01</b><h4>Obtenez votre prix</h4><p>Choisissez le type de véhicule et le forfait. Moins de 2 minutes.</p></div>
      <div class="how-s" data-reveal><b>02</b><h4>Chez vous ou à l’atelier</h4><p>On confirme la date, l’heure et la durée. Aucun paiement en ligne requis.</p></div>
      <div class="how-s" data-reveal><b>03</b><h4>Votre auto brille</h4><p>On s’occupe de tout. Satisfait ou on revient, sans frais.</p></div>
    </div>
  </div>
</section>

<section class="sec" id="faq" style="padding-top:0">
  <div class="wrap">
    <div class="sec-head"><div><span class="over">Questions fréquentes</span><h2 data-split>Avant <em>de réserver.</em></h2></div></div>
    <div class="faq">{faq}</div>
  </div>
</section>
<section class="cta-end"><div class="ring"></div><div class="ring"></div><div class="ring"></div><div class="wrap"><span class="over">Une autre question ?</span><h2 data-split>On est <em>là.</em></h2><div class="ctas" data-reveal><a class="btn b-gold" href="tel:+15819901850" data-magnetic>Appeler {ARROW}</a><a class="btn b-line" href="reserver.html">Obtenir mon prix</a></div></div></section>
</main>
''' + footer()

# ---------------------------------------------------------------- RÉSERVER
pk_opts = '''<label class="opt"><input type="radio" name="pk" value="eclat"><span><b>Éclat</b><small>Entretien régulier</small><em class="pp" data-pk="eclat"></em></span></label>
<label class="opt"><input type="radio" name="pk" value="renaissance" checked><span><b>Renaissance</b><small>Le plus populaire</small><em class="pp" data-pk="renaissance"></em></span></label>
<label class="opt"><input type="radio" name="pk" value="ultime"><span><b>Protection ultime</b><small>Polissage et céramique</small><em class="pp" data-pk="ultime"></em></span></label>'''
POLS = [('Videz votre véhicule','Retirez vos effets personnels avant le rendez-vous, sinon des frais peuvent s’appliquer.'),
        ('Modifier ou annuler','Sans frais jusqu’à 24 h avant. 20 $ en cas d’annulation à moins de 24 h ou d’absence.'),
        ('Prévoyez du temps','De 1 h à une journée selon le forfait. On vous confirme la durée.'),
        ('Paiement simple','Sur place (comptant ou carte), Interac ou en ligne avec Square. Taxes incluses.')]
reserver = head('Réserver | Esthétique Auto Gagnon, Lévis', "Demandez votre prix et votre rendez-vous en moins de 2 minutes. Aucun paiement en ligne pour réserver.", 'reserver') + header('reserver.html') + f'''<main>
<section class="phero" style="padding-bottom:40px"><div class="glow"></div><div class="wrap">
  <span class="over">Obtenir mon prix</span>
  <h1 data-split>Moins de <em>2 minutes.</em></h1>
  <p class="lead" data-reveal>Sans engagement, aucun paiement en ligne. On vous confirme le prix exact et le rendez-vous, ou on vous rappelle.</p>
</div></section>

<section class="sec" style="padding-top:10px">
  <div class="wrap book">
    <div class="form" data-reveal>
      <div class="fprog" aria-hidden="true"><span class="on"><b>01</b>Véhicule</span><span><b>02</b>Forfait</span><span><b>03</b>Lieu &amp; date</span><span><b>04</b>Coordonnées</span></div>
      <form class="fsteps" id="book" novalidate>
        <div class="fstep on" data-step="0">
          <h3>Votre <em>véhicule</em></h3><p>Le prix dépend du format.</p>
          <div class="opts veh">{veh_opts('veh')}</div>
          <div class="field" style="margin-top:20px"><label for="modele">Marque et modèle (facultatif)</label><input id="modele" name="modele" type="text" autocomplete="off" placeholder="Ex. : Honda CR-V 2021"></div>
        </div>
        <div class="fstep" data-step="1">
          <h3>Votre <em>forfait</em></h3><p>Les prix s’ajustent selon votre véhicule.</p>
          <div class="opts pk">{pk_opts}</div>
          <p style="margin:24px 0 12px;font:600 10.5px/1 var(--sans);letter-spacing:.18em;color:var(--mute)">EXTRAS (FACULTATIF)</p>
          <div class="opts ex">{extra_opts()}</div>
        </div>
        <div class="fstep" data-step="2">
          <h3>Lieu <em>&amp; date</em></h3><p>Du lundi au samedi, de 8 h à 17 h.</p>
          <div class="opts pk" style="grid-template-columns:1fr 1fr;margin-bottom:20px">
            <label class="opt"><input type="radio" name="lieu" value="atelier" checked><span><b>À l’atelier</b><small>90, chemin des Îles, Lévis</small></span></label>
            <label class="opt"><input type="radio" name="lieu" value="domicile"><span><b>Chez moi</b><small>L’hiver : garage ou espace intérieur requis</small></span></label>
          </div>
          <div class="field adr" hidden><label for="adresse">Adresse du service</label><input id="adresse" name="adresse" type="text" autocomplete="street-address"><span class="msg">Indiquez l’adresse où on se déplace.</span></div>
          <div class="row2">
            <div class="field"><label for="date">Date souhaitée</label><input id="date" name="date" type="date" required><span class="msg">Choisissez une date du lundi au samedi.</span></div>
            <div class="field"><label for="moment">Moment</label><select id="moment" name="moment"><option>Matin</option><option>Midi</option><option>Après-midi</option><option>Peu importe</option></select></div>
          </div>
        </div>
        <div class="fstep" data-step="3">
          <h3>Vos <em>coordonnées</em></h3><p>Pour vous confirmer le prix et le rendez-vous.</p>
          <div class="field"><label for="nom">Nom complet</label><input id="nom" name="nom" type="text" autocomplete="name" required><span class="msg">Votre nom, s’il vous plaît.</span></div>
          <div class="row2">
            <div class="field"><label for="tel">Téléphone</label><input id="tel" name="tel" type="tel" autocomplete="tel" inputmode="tel" required><span class="msg">Un numéro valide (10 chiffres).</span></div>
            <div class="field"><label for="courriel">Courriel</label><input id="courriel" name="courriel" type="email" autocomplete="email" required><span class="msg">Un courriel valide.</span></div>
          </div>
          <div class="field"><label for="msg">Message (facultatif)</label><textarea id="msg" name="msg"></textarea></div>
        </div>
        <div class="done" data-step="4" hidden>
          <svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="46"/><path d="M30 52l13 13 27-28"/></svg>
          <h3>Demande <em>prête !</em></h3>
          <p>Votre application de courriel s’ouvre avec le résumé de votre demande. Envoyez-le et Jean-Thomas vous confirme le prix et le rendez-vous rapidement.</p>
          <p style="font-size:13px">Rien ne s’est ouvert ? Écrivez à <a style="color:var(--gold2)" href="mailto:info@esthetiqueautogagnon.com">info@esthetiqueautogagnon.com</a> ou appelez au <a style="color:var(--gold2)" href="tel:+15819901850">581-990-1850</a>.</p>
        </div>
        <div class="fnav"><button type="button" class="btn b-line back">Retour</button><button type="button" class="btn b-gold next">Continuer {ARROW}</button></div>
      </form>
    </div>
    <aside>
      <div class="contact-card" data-reveal>
        <div class="jt"><i>JT</i><div><b>Jean-Thomas Gagnon</b><small>Propriétaire, détaileur certifié GYEON</small></div></div>
        <div class="line"><span>Estimation</span><span class="est" style="color:var(--gold2)">—</span></div>
        <a class="line" href="tel:+15819901850"><span>Téléphone</span><span>581-990-1850</span></a>
        <a class="line" href="mailto:info@esthetiqueautogagnon.com"><span>Courriel</span><span>info@esthetique…</span></a>
        <div class="line"><span>Heures</span><span>Lun. au sam., 8 h à 17 h</span></div>
      </div>
      <div class="policies">{''.join(f'<div class="pol" data-reveal>{CHECK}<div><b>{a}</b><span>{b}</span></div></div>' for a,b in POLS)}</div>
    </aside>
  </div>
</section>
</main>
''' + footer(fab=False)

for name, content in [('index.html', index), ('forfaits.html', forfaits), ('realisations.html', realisations), ('zone.html', zone), ('reserver.html', reserver)]:
    (OUT / name).write_text(content, encoding='utf-8')
print('ok')
