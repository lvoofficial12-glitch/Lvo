#!/usr/bin/env python3
"""Génère les pages FR et EN de la maquette Mécanique Mobile Lion (LVO)."""
import json, math, pathlib, html as H

OUT = pathlib.Path('/home/claude/lvo/lion')
V = '7'
TEL = '579-368-4357'; TELH = '+15793684357'
IGURL = 'https://www.instagram.com/mecaniquemobilelion/'

ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 005 5L15 13l5 2v4a2 2 0 01-2 2A16 16 0 013 6a2 2 0 012-2"/></svg>'
SMS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/></svg>'
IG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>'
PIN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M12 21s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>'
INFO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/></svg>'

# Icônes de divisions (traits)
I_TRUCK = '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M6 62V30h44v32"/><path d="M50 40h18l12 12v10H50"/><path d="M56 44h10l7 8H56z"/><circle cx="22" cy="66" r="7"/><circle cx="66" cy="66" r="7"/><path d="M6 62h9M29 62h30M73 62h7"/><path d="M14 38h28M14 46h20" opacity=".5"/></svg>'
I_CAR = '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M10 60V48l8-14h40l14 12 14 4v10"/><path d="M24 36l-6 12h30V36zM54 36v12h18l-12-12z"/><circle cx="26" cy="62" r="7"/><circle cx="72" cy="62" r="7"/><path d="M10 60h9M33 60h32M79 60h7"/></svg>'
I_TRAILER = '<svg viewBox="0 0 96 96" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"><path d="M14 28h62v30H14z"/><path d="M76 52h10M86 52v6"/><circle cx="34" cy="64" r="7"/><circle cx="52" cy="64" r="7"/><path d="M14 58h13M41 58h4M59 58h17"/><path d="M24 36v14M34 36v14M44 36v14M54 36v14M64 36v14" opacity=".45"/></svg>'

def star(cx, cy, ro, ri, n):
    pts = []
    for i in range(n * 2):
        r = ro if i % 2 == 0 else ri
        a = math.pi * i / n - math.pi / 2
        pts.append(f'{cx + math.cos(a) * r:.2f},{cy + math.sin(a) * r:.2f}')
    return ' '.join(pts)

def lion(size_cls=''):
    return (f'<svg{size_cls} viewBox="0 0 48 48" aria-hidden="true">'
            '<path d="M24 2 43 13v22L24 46 5 35V13z" fill="#0e1013" stroke="#ff8a1f" stroke-width="1.6"/>'
            f'<polygon points="{star(24, 24.5, 16, 10.5, 12)}" fill="#ff8a1f"/>'
            '<circle cx="24" cy="25" r="9.2" fill="#0e1013"/>'
            '<path d="M18.6 22.6l3.2 1.2M29.4 22.6l-3.2 1.2" stroke="#ffb04a" stroke-width="1.6" stroke-linecap="round"/>'
            '<path d="M21.6 27h4.8L24 29.6z" fill="#ff8a1f"/>'
            '<path d="M24 29.6v1.6M21.2 31.6q2.8 1.6 5.6 0" stroke="#ff8a1f" stroke-width="1.2" fill="none" stroke-linecap="round"/>'
            '</svg>')

LION = lion()
LION_CUR = lion(' class="lion-c"')

# ---------------------------------------------------------------- textes
T = {
 'fr': {
  'lang': 'fr-CA', 'other': 'EN', 'other_href': 'en/',
  'pages': [('index.html', 'Accueil'), ('services.html', 'Services'), ('zone.html', 'Zone & FAQ'), ('contact.html', 'Demande de service')],
  'demo': 'Maquette préparée par <b>LVO</b> pour Mécanique Mobile Lion. Aperçu de démonstration, pas encore le site officiel.',
  'demo_s': 'Maquette <b>LVO</b> · aperçu de démonstration',
  'call': 'Appeler', 'req': 'Demander un service', 'tel_l': 'Appel ou texto', 'menu_open': 'Ouvrir le menu',
  'tag': 'MÉCANIQUE MOBILE · ST-LIN',
  'hero_kick': 'Service mécanique mobile · St-Lin',
  'hero_h1': ['On vient', '<span class="amb">à vous.</span>'],
  'hero_p': 'Camions lourds, autos et remorques. Réparés sur place, là où ils sont arrêtés.',
  'chips': ['Heavy-duty', 'Automobile', 'Remorques'],
  'mq': ['Heavy-duty', 'Automobile', 'Remorques', 'Sur place', 'St-Lin et environs'],
  'manifest': 'Un camion arrêté, c’est de l’argent qui *dort.* Notre atelier roule jusqu’à vous : sur la route, au *chantier* ou dans votre *cour.*',
  'meta': ['Heavy-duty · Automotive · Trailers', 'St-Lin–Laurentides et environs', TEL],
  'div_kick': 'Trois spécialités', 'div_h': 'Un mécano.<br><span class="out">Toute la flotte.</span>',
  'div_p': 'Du semi-remorque au pick-up familial, le même service professionnel se déplace pour chaque véhicule.',
  'divs': [
    ('Heavy-duty', 'Camions lourds', I_TRUCK, ['Camions lourds et tracteurs', 'Diagnostic électronique', 'Freins à air', 'Suspension et direction', 'Entretien préventif']),
    ('Automobile', 'Autos & pick-ups', I_CAR, ['Autos, VUS et camionnettes', 'Diagnostic moteur', 'Freins et suspension', 'Batterie et démarreur', 'Entretien régulier']),
    ('Remorques', 'Trailers', I_TRAILER, ['Remorques de toutes tailles', 'Freins de remorque', 'Roulements et essieux', 'Lumières et filage', 'Inspection avant la route']),
  ],
  'more': 'Voir le détail',
  'gears_big': 'Mobile',
  'wh_kick': 'Équipé pour le lourd', 'wh_h': 'Du pneu<br><span class="out-a">au moteur.</span>',
  'wh_p': 'Freins, roulements, pneus et roues : le camion de service apporte l’outillage du lourd directement là où vous êtes.',
  'wh_l': ['Pneus & roues', 'Roulements & moyeux', 'Freins à air'],
  'scroll': 'Défilez',
  'steps_kick': 'Comment ça marche',
  'steps': [('01', 'Vous appelez', 'Décrivez le problème et dites-nous où se trouve le véhicule. Une photo par texto aide à arriver avec les bonnes pièces.'),
            ('02', 'On roule jusqu’à vous', 'Le camion de service se rend sur l’accotement, au chantier, à la ferme ou dans votre cour. Pas de remorquage pour vous rendre au garage.'),
            ('03', 'On répare sur place', 'Diagnostic et réparation directement sur le terrain, pour que vous repreniez la route le plus vite possible.')],
  'reel_h': 'Partout<br><span class="out-a">autour de <span class="nw">St-Lin.</span></span>',
  'reel_p': 'Sur la route, au chantier ou au garage de la ferme : si votre véhicule ne peut pas venir, le Lion se déplace.',
  'perks': [('Sur <em>place</em>', 'Là où est le véhicule', 'On travaille sur la route, au chantier ou chez vous.'),
            ('3 <em>en</em> 1', 'Lourd, auto et remorque', 'Un seul service mécanique pour toute votre flotte.'),
            ('1 <em>appel</em>', 'Un numéro direct', f'{TEL}, par appel ou par texto.'),
            ('0 <em>détour</em>', 'Moins d’arrêt', 'Pas d’attente pour une place au garage ni de remorquage pour s’y rendre.')],
  'zone_kick': 'Territoire', 'zone_h': 'St-Lin<br><span class="out">et environs.</span>',
  'zone_p': 'Basés à Saint-Lin–Laurentides (J5M), on couvre la région de Montcalm, le sud de Lanaudière et les Basses-Laurentides. Votre secteur n’est pas dans la liste? Appelez, on vous dit tout de suite.',
  'final_h': 'Appelez<br><span class="amb">le Lion.</span>',
  'final_sms': 'Texto',
  'foot_big': 'On vient <span class="amb">à vous.</span>',
  'foot_h': ['Service', 'Secteur', 'Contact'],
  'foot_svc': 'Heavy-duty<br>Automobile<br>Remorques',
  'foot_zone': 'Saint-Lin–Laurentides<br>J5M 0L1<br>et environs',
  'foot_bot': ['© 2026 Mécanique Mobile Lion · St-Lin–Laurentides, Québec', 'Maquette conçue par LVO, Sherbrooke'],
  'fab': 'Appeler le Lion',
  'credit': 'Photos de démonstration : Unsplash',
  'split_kick': 'Un atelier sur roues', 'split_h': 'L’atelier vient<br><span class="amb">jusqu’à vous.</span>',
  'split_p': 'Pas besoin de remorquer un camion jusqu’au garage. Le Lion arrive avec l’outillage et répare là où le véhicule est arrêté.',
  'split_pts': [('Diagnostic sur place', 'On trouve la panne avant de remplacer quoi que ce soit.'), ('Lourd, auto et remorque', 'Un seul service pour tous vos véhicules.'), ('Un numéro direct', '579-368-4357, par appel ou par texto.')],
  'split_alt': 'Mains d’un mécanicien serrant un boulon avec une clé',
  # services
  'svc_title': 'Services | Mécanique Mobile Lion',
  'svc_kick': 'Nos services', 'svc_h1': ['Lourd.', 'Auto.', '<span class="amb">Remorque.</span>'],
  'svc_p': 'Trois spécialités, un seul camion de service. Touchez une catégorie pour voir ce qu’on fait sur place.',
  'svc_note': 'Liste de démonstration préparée à partir de votre profil. Elle sera ajustée avec vous avant la mise en ligne.',
  'svc': [
    ('Heavy-duty', 'Camions lourds, tracteurs routiers et équipement. Quand un camion est immobilisé, chaque heure compte.', I_TRUCK, [
      ('Diagnostic électronique', 'Lecture des codes et recherche de panne sur place, avant de remplacer quoi que ce soit.', ['Codes moteur', 'Témoins au tableau', 'Perte de puissance']),
      ('Freins à air', 'Inspection, ajustement et réparation des freins pour reprendre la route en sécurité.', ['Fuites d’air', 'Garnitures', 'Ajustements']),
      ('Suspension et direction', 'Coussins, amortisseurs, pièces de direction usées ou bruyantes.', ['Coussins d’air', 'Amortisseurs', 'Jeu dans la direction']),
      ('Entretien préventif', 'Entretien régulier fait chez vous, pour éviter la panne sur la route.', ['Huile et filtres', 'Graissage', 'Inspection générale']),
      ('Électrique', 'Batteries, démarreur, alternateur, filage et lumières.', ['Ne démarre pas', 'Charge faible', 'Lumières'])]),
    ('Automobile', 'Autos, VUS et camionnettes. Réparés dans votre entrée, pendant que vous continuez votre journée.', I_CAR, [
      ('Diagnostic', 'Un témoin s’allume, un bruit inquiétant? On trouve la cause sur place.', ['Check engine', 'Bruits', 'Vibrations']),
      ('Freins', 'Plaquettes, disques et étriers, sans vous déplacer.', ['Plaquettes', 'Disques', 'Étriers']),
      ('Batterie et démarrage', 'Le véhicule ne démarre plus ce matin? On vient voir pourquoi.', ['Batterie', 'Démarreur', 'Alternateur']),
      ('Suspension', 'Amortisseurs, rotules, biellettes : pour retrouver une conduite solide.', ['Amortisseurs', 'Rotules', 'Biellettes']),
      ('Entretien régulier', 'Changement d’huile et inspection faits à la maison ou au bureau.', ['Huile', 'Filtres', 'Inspection'])]),
    ('Remorques', 'Remorques de toutes tailles, du plateau au semi-remorque. On les remet en état avant la prochaine sortie.', I_TRAILER, [
      ('Freins de remorque', 'Freins électriques ou à air, ajustement et remplacement.', ['Électriques', 'À air', 'Ajustement']),
      ('Roulements et essieux', 'Roulements qui chauffent, essieux fatigués : on règle ça avant que ça casse.', ['Roulements', 'Moyeux', 'Essieux']),
      ('Lumières et filage', 'Lumières mortes, mauvais contact, filage endommagé.', ['Lumières', 'Prise', 'Filage']),
      ('Suspension', 'Ressorts, coussins et pièces d’attache.', ['Ressorts', 'Coussins', 'Attaches']),
      ('Inspection', 'Un tour complet avant la saison ou avant un long voyage.', ['Avant la saison', 'Avant un voyage', 'Sécurité'])]),
  ],
  # zone
  'zone_title': 'Zone & FAQ | Mécanique Mobile Lion',
  'zpage_kick': 'Territoire desservi', 'zpage_h1': ['St-Lin', '<span class="amb">et environs.</span>'],
  'zpage_p': 'Le camion de service part de Saint-Lin–Laurentides et se rend là où votre véhicule est arrêté.',
  'faq_kick': 'Questions fréquentes', 'faq_h': 'Avant<br><span class="out">d’appeler.</span>',
  'faq': [('Quels véhicules réparez-vous?', 'Les camions lourds (heavy-duty), les autos, VUS et pick-ups, ainsi que les remorques de toutes tailles.'),
          ('Est-ce que vous vous déplacez vraiment?', 'Oui, c’est un service mécanique mobile : on se rend sur la route, au chantier, à la ferme ou chez vous.'),
          ('Comment demander un service?', f'Appelez ou textez au {TEL}, ou remplissez la demande de service sur ce site : elle prépare un texto avec toutes les infos.'),
          ('Qu’est-ce que je dois préparer?', 'Le type de véhicule, le problème observé, l’endroit exact où il se trouve et, si possible, une ou deux photos.'),
          ('Mon secteur est-il couvert?', 'On est basés à St-Lin–Laurentides et on couvre les environs. Si vous êtes un peu plus loin, appelez : on vous le dit tout de suite.')],
  # contact
  'ct_title': 'Demande de service | Mécanique Mobile Lion',
  'ct_kick': 'Demande de service', 'ct_h1': ['Parlez', '<span class="amb">au Lion.</span>'],
  'ct_p': 'Le plus rapide : un appel. Sinon, remplissez la demande en 4 étapes et elle part par texto.',
  'cards': [('Appeler', TEL, f'tel:{TELH}', PHONE), ('Texto', TEL, f'sms:{TELH}', SMS), ('Instagram', '@mecaniquemobilelion', IGURL, IG), ('Base', 'St-Lin–Laurentides, J5M', 'zone.html', PIN)],
  'f': {'steps': ['Quel véhicule?', 'Quel problème?', 'Où et qui?', 'On envoie?'],
        'veh': [('Lourd', 'Camion, tracteur, équipement', I_TRUCK), ('Auto', 'Auto, VUS, pick-up', I_CAR), ('Remorque', 'Plateau, fermée, semi', I_TRAILER)],
        'prob': 'Décrivez le problème', 'prob_ph': 'Ex. : le camion ne démarre plus, témoin moteur allumé, fuite d’air à l’arrière…',
        'urg_l': 'Urgence', 'urg': ['Je suis immobilisé', 'Cette semaine', 'Entretien à planifier'],
        'name': 'Votre nom', 'phone': 'Téléphone', 'where': 'Où est le véhicule?', 'where_ph': 'Adresse, route ou repère (ex. : 337 Nord, sortie 41)',
        'prev': 'Retour', 'next': 'Continuer', 'send': 'Envoyer par texto', 'or_call': 'Ou appeler',
        'last_p': 'Vérifiez vos infos : le bouton ouvre un texto prêt à envoyer au Lion.'},
  'fl': {'e0': 'Choisissez un type de véhicule.', 'e1': 'Décrivez le problème en quelques mots.', 'e2a': 'Indiquez votre nom.', 'e2b': 'Entrez un numéro de téléphone valide.', 'e2c': 'Indiquez où est le véhicule.',
         'r0': 'Véhicule', 'r1': 'Problème', 'r2': 'Urgence', 'r3': 'Endroit', 'r4': 'Contact', 'm': 'Bonjour, demande de service (site web) :'},
  'home_title': 'Mécanique Mobile Lion | Mécanique mobile heavy-duty, auto et remorques à St-Lin',
  'home_desc': 'Service mécanique mobile professionnel à St-Lin–Laurentides et environs : camions lourds, autos et remorques réparés sur place. 579-368-4357.',
 },
 'en': {
  'lang': 'en-CA', 'other': 'FR', 'other_href': '../',
  'pages': [('index.html', 'Home'), ('services.html', 'Services'), ('zone.html', 'Area & FAQ'), ('contact.html', 'Request service')],
  'demo': 'Mockup prepared by <b>LVO</b> for Mécanique Mobile Lion. Demo preview, not the official website yet.',
  'demo_s': '<b>LVO</b> mockup · demo preview',
  'call': 'Call', 'req': 'Request service', 'tel_l': 'Call or text', 'menu_open': 'Open menu',
  'tag': 'MOBILE MECHANIC · ST-LIN',
  'hero_kick': 'Mobile mechanical service · St-Lin',
  'hero_h1': ['We come', '<span class="amb">to you.</span>'],
  'hero_p': 'Heavy-duty trucks, cars and trailers. Repaired on site, right where they stopped.',
  'chips': ['Heavy-duty', 'Automotive', 'Trailers'],
  'mq': ['Heavy-duty', 'Automotive', 'Trailers', 'On site', 'St-Lin & area'],
  'manifest': 'A truck that isn’t moving is money *asleep.* Our shop drives to you: on the road, on the *job site* or in your *yard.*',
  'meta': ['Heavy-duty · Automotive · Trailers', 'St-Lin–Laurentides & surrounding areas', TEL],
  'div_kick': 'Three specialties', 'div_h': 'One mechanic.<br><span class="out">Whole fleet.</span>',
  'div_p': 'From the semi-trailer to the family pickup, the same professional service comes out for every vehicle.',
  'divs': [
    ('Heavy-duty', 'Heavy trucks', I_TRUCK, ['Heavy trucks and tractors', 'Electronic diagnostics', 'Air brakes', 'Suspension and steering', 'Preventive maintenance']),
    ('Automotive', 'Cars & pickups', I_CAR, ['Cars, SUVs and pickups', 'Engine diagnostics', 'Brakes and suspension', 'Battery and starter', 'Regular maintenance']),
    ('Trailers', 'All sizes', I_TRAILER, ['Trailers of every size', 'Trailer brakes', 'Bearings and axles', 'Lights and wiring', 'Pre-trip inspection']),
  ],
  'more': 'See details',
  'gears_big': 'Mobile',
  'wh_kick': 'Built for heavy-duty', 'wh_h': 'From tire<br><span class="out-a">to engine.</span>',
  'wh_p': 'Brakes, bearings, tires and wheels: the service truck brings heavy-duty tools right where you are.',
  'wh_l': ['Tires & wheels', 'Bearings & hubs', 'Air brakes'],
  'scroll': 'Scroll',
  'steps_kick': 'How it works',
  'steps': [('01', 'You call', 'Describe the problem and tell us where the vehicle is. A photo by text helps us show up with the right parts.'),
            ('02', 'We drive to you', 'The service truck heads to the shoulder, the job site, the farm or your yard. No tow to get to a shop.'),
            ('03', 'We fix it on site', 'Diagnosis and repair right there, so you get back on the road as fast as possible.')],
  'reel_h': 'All around<br><span class="out-a nw">St-Lin.</span>',
  'reel_p': 'On the road, on the job site or in the farm garage: if your vehicle can’t come to us, the Lion comes to it.',
  'perks': [('On <em>site</em>', 'Where the vehicle is', 'We work on the road, on the job site or at your place.'),
            ('3 <em>in</em> 1', 'Heavy, car and trailer', 'One mechanical service for your whole fleet.'),
            ('1 <em>call</em>', 'One direct number', f'{TEL}, by call or text.'),
            ('0 <em>detour</em>', 'Less downtime', 'No waiting for a shop opening, no tow to get there.')],
  'zone_kick': 'Service area', 'zone_h': 'St-Lin<br><span class="out">& area.</span>',
  'zone_p': 'Based in Saint-Lin–Laurentides (J5M), we cover Montcalm, southern Lanaudière and the Lower Laurentians. Not on the list? Call and we’ll tell you right away.',
  'final_h': 'Call<br><span class="amb">the Lion.</span>',
  'final_sms': 'Text',
  'foot_big': 'We come <span class="amb">to you.</span>',
  'foot_h': ['Service', 'Area', 'Contact'],
  'foot_svc': 'Heavy-duty<br>Automotive<br>Trailers',
  'foot_zone': 'Saint-Lin–Laurentides<br>J5M 0L1<br>& surrounding areas',
  'foot_bot': ['© 2026 Mécanique Mobile Lion · St-Lin–Laurentides, Quebec', 'Mockup designed by LVO, Sherbrooke'],
  'fab': 'Call the Lion',
  'credit': 'Demo photos: Unsplash',
  'split_kick': 'A shop on wheels', 'split_h': 'The shop comes<br><span class="amb">to you.</span>',
  'split_p': 'No need to tow a truck to the garage. The Lion shows up with the tools and fixes it right where the vehicle stopped.',
  'split_pts': [('On-site diagnostics', 'We find the fault before replacing anything.'), ('Heavy, car and trailer', 'One service for all your vehicles.'), ('One direct number', '579-368-4357, by call or text.')],
  'split_alt': 'Mechanic’s hands tightening a bolt with a wrench',
  'svc_title': 'Services | Mécanique Mobile Lion',
  'svc_kick': 'Our services', 'svc_h1': ['Heavy.', 'Car.', '<span class="amb">Trailer.</span>'],
  'svc_p': 'Three specialties, one service truck. Tap a category to see what we do on site.',
  'svc_note': 'Demo list prepared from your profile. It will be adjusted with you before going live.',
  'svc': [
    ('Heavy-duty', 'Heavy trucks, road tractors and equipment. When a truck is down, every hour counts.', I_TRUCK, [
      ('Electronic diagnostics', 'Code reading and troubleshooting on site, before replacing anything.', ['Engine codes', 'Dash lights', 'Power loss']),
      ('Air brakes', 'Inspection, adjustment and repair so you can roll safely.', ['Air leaks', 'Linings', 'Adjustments']),
      ('Suspension & steering', 'Air bags, shocks, worn or noisy steering parts.', ['Air bags', 'Shocks', 'Steering play']),
      ('Preventive maintenance', 'Regular service done at your place, to avoid a breakdown on the road.', ['Oil & filters', 'Greasing', 'Full inspection']),
      ('Electrical', 'Batteries, starter, alternator, wiring and lights.', ['No start', 'Low charge', 'Lights'])]),
    ('Automotive', 'Cars, SUVs and pickups. Repaired in your driveway while you go on with your day.', I_CAR, [
      ('Diagnostics', 'A light came on, a worrying noise? We find the cause on site.', ['Check engine', 'Noises', 'Vibrations']),
      ('Brakes', 'Pads, rotors and calipers, without you going anywhere.', ['Pads', 'Rotors', 'Calipers']),
      ('Battery & starting', 'Won’t start this morning? We come and find out why.', ['Battery', 'Starter', 'Alternator']),
      ('Suspension', 'Shocks, ball joints, links: get that solid ride back.', ['Shocks', 'Ball joints', 'Links']),
      ('Regular maintenance', 'Oil change and inspection done at home or at the office.', ['Oil', 'Filters', 'Inspection'])]),
    ('Trailers', 'Trailers of every size, from flatbeds to semi-trailers. Back in shape before the next trip.', I_TRAILER, [
      ('Trailer brakes', 'Electric or air brakes, adjustment and replacement.', ['Electric', 'Air', 'Adjustment']),
      ('Bearings & axles', 'Hot bearings, tired axles: fixed before they break.', ['Bearings', 'Hubs', 'Axles']),
      ('Lights & wiring', 'Dead lights, bad contacts, damaged wiring.', ['Lights', 'Plug', 'Wiring']),
      ('Suspension', 'Springs, air bags and hardware.', ['Springs', 'Air bags', 'Hardware']),
      ('Inspection', 'A full check before the season or a long haul.', ['Pre-season', 'Pre-trip', 'Safety'])]),
  ],
  'zone_title': 'Area & FAQ | Mécanique Mobile Lion',
  'zpage_kick': 'Service area', 'zpage_h1': ['St-Lin', '<span class="amb">& area.</span>'],
  'zpage_p': 'The service truck leaves from Saint-Lin–Laurentides and goes wherever your vehicle stopped.',
  'faq_kick': 'FAQ', 'faq_h': 'Before<br><span class="out">you call.</span>',
  'faq': [('What vehicles do you repair?', 'Heavy-duty trucks, cars, SUVs and pickups, and trailers of every size.'),
          ('Do you really come to me?', 'Yes, it’s a mobile mechanical service: we go to the road, the job site, the farm or your place.'),
          ('How do I request service?', f'Call or text {TEL}, or fill out the service request on this site: it prepares a text with all the details.'),
          ('What should I have ready?', 'The type of vehicle, the problem you noticed, the exact location and, if possible, one or two photos.'),
          ('Is my area covered?', 'We’re based in St-Lin–Laurentides and cover the surrounding areas. A bit farther? Call and we’ll tell you right away.')],
  'ct_title': 'Request service | Mécanique Mobile Lion',
  'ct_kick': 'Service request', 'ct_h1': ['Talk to', '<span class="amb">the Lion.</span>'],
  'ct_p': 'Fastest: a phone call. Otherwise, fill out the 4-step request and it goes out by text.',
  'cards': [('Call', TEL, f'tel:{TELH}', PHONE), ('Text', TEL, f'sms:{TELH}', SMS), ('Instagram', '@mecaniquemobilelion', IGURL, IG), ('Base', 'St-Lin–Laurentides, J5M', 'zone.html', PIN)],
  'f': {'steps': ['Which vehicle?', 'What’s wrong?', 'Where and who?', 'Send it?'],
        'veh': [('Heavy', 'Truck, tractor, equipment', I_TRUCK), ('Car', 'Car, SUV, pickup', I_CAR), ('Trailer', 'Flatbed, enclosed, semi', I_TRAILER)],
        'prob': 'Describe the problem', 'prob_ph': 'E.g. truck won’t start, check engine light on, air leak at the back…',
        'urg_l': 'Urgency', 'urg': ['I’m stuck', 'This week', 'Planned maintenance'],
        'name': 'Your name', 'phone': 'Phone', 'where': 'Where is the vehicle?', 'where_ph': 'Address, road or landmark (e.g. Hwy 337 North, exit 41)',
        'prev': 'Back', 'next': 'Continue', 'send': 'Send by text', 'or_call': 'Or call',
        'last_p': 'Check your info: the button opens a text ready to send to the Lion.'},
  'fl': {'e0': 'Pick a vehicle type.', 'e1': 'Describe the problem in a few words.', 'e2a': 'Enter your name.', 'e2b': 'Enter a valid phone number.', 'e2c': 'Tell us where the vehicle is.',
         'r0': 'Vehicle', 'r1': 'Problem', 'r2': 'Urgency', 'r3': 'Location', 'r4': 'Contact', 'm': 'Hello, service request (website):'},
  'home_title': 'Mécanique Mobile Lion | Mobile heavy-duty, auto & trailer mechanic in St-Lin',
  'home_desc': 'Professional mobile mechanical service in St-Lin–Laurentides and surrounding areas: heavy trucks, cars and trailers repaired on site. 579-368-4357.',
 }
}

# Villes autour (lat, lon) — carte radar, 8 px/km
TOWNS = [('Sainte-Julienne', 45.97, -73.72), ('Saint-Calixte', 45.94, -73.85), ('Saint-Esprit', 45.91, -73.67),
         ('St-Roch-de-l’Achigan', 45.85, -73.60), ('Sainte-Sophie', 45.82, -73.90), ('Saint-Jérôme', 45.78, -74.00),
         ('Ste-Anne-des-Plaines', 45.76, -73.81), ('Mascouche', 45.75, -73.60), ('Terrebonne', 45.70, -73.65), ('Joliette', 46.02, -73.44)]

def xy(lat, lon):
    return 300 + (lon + 73.76) * 77.5 * 8, 300 - (lat - 45.85) * 111 * 8

def radar(lang):
    rings = ''.join(f'<circle class="ring" cx="300" cy="300" r="{r}"/>' for r in (80, 160, 240))
    lbl = ''.join(f'<text x="{300 + r * .707 + 4:.0f}" y="{300 - r * .707 - 4:.0f}" fill="#6b6e76" font-family="JetBrains Mono" font-size="10">{r // 8} KM</text>' for r in (80, 160, 240))
    towns = ''
    for n, la, lo in TOWNS:
        x, y = xy(la, lo)
        anchor = 'end' if x < 300 else 'start'
        dx = -10 if x < 300 else 10
        towns += f'<g class="town"><circle cx="{x:.0f}" cy="{y:.0f}" r="4.5"/><text x="{x + dx:.0f}" y="{y + 4:.0f}" text-anchor="{anchor}">{H.escape(n)}</text></g>'
    sweep = ('<defs><linearGradient id="sw" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff8a1f" stop-opacity="0"/><stop offset="1" stop-color="#ff8a1f" stop-opacity=".35"/></linearGradient></defs>'
             '<g class="sweep"><path d="M300 300 L540 300 A240 240 0 0 0 469.7 130.3 Z" fill="url(#sw)"/><line x1="300" y1="300" x2="540" y2="300" stroke="#ff8a1f" stroke-width="1.5"/></g>')
    home = '<g class="home"><circle class="p" cx="300" cy="300" r="14"/><circle class="p" cx="300" cy="300" r="14"/><circle class="c" cx="300" cy="300" r="7"/>' \
           f'<text x="300" y="330" text-anchor="middle" fill="#ff8a1f" font-family="Anton" font-size="20" letter-spacing="1">ST-LIN</text></g>'
    cross = '<path d="M300 40V560M40 300H560" stroke="rgba(255,255,255,.06)"/>'
    return f'<div class="radar" data-rev><svg viewBox="0 0 600 600" role="img" aria-label="{"Carte du territoire autour de St-Lin" if lang == "fr" else "Service area map around St-Lin"}">{cross}{rings}{lbl}{sweep}{towns}{home}</svg></div>'

def zone_block(t, lang):
    chips = '<span class="main">Saint-Lin–Laurentides</span>' + ''.join(f'<span>{H.escape(n)}</span>' for n, _, _ in TOWNS)
    return f'''<section class="sec zone-sec" id="zone"><div class="zbg"><img src="{'' if lang == 'fr' else '../'}media/ph/zone.jpg" alt="" loading="lazy"></div><div class="wrap zone">
  <div><span class="kick" data-rev>{t["zone_kick"]}</span><h2 class="disp h2" style="margin:18px 0 24px" data-split>{t["zone_h"]}</h2><p class="lead" data-rev>{t["zone_p"]}</p><div class="zone-list" data-rev>{chips}</div></div>
  {radar(lang)}
</div></section>'''

# ---------------------------------------------------------------- gabarit
def head(t, title, desc, page, pre, extra=''):
    alt = ('en/' if t['lang'].startswith('fr') else '../') + (page if page != 'index.html' else '')
    return f'''<!DOCTYPE html>
<html lang="{t["lang"]}" class="no-js">
<head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#08090b">
<title>{H.escape(title)}</title>
<meta name="description" content="{H.escape(desc)}">
<link rel="alternate" hreflang="{"en-CA" if t["lang"].startswith("fr") else "fr-CA"}" href="{alt}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400..700&family=JetBrains+Mono:wght@500&display=swap">
<link rel="stylesheet" href="{pre}style.css?v={V}">
<link rel="icon" href="data:image/svg+xml,{lion_fav()}">
<script>document.documentElement.classList.remove('no-js')</script>
{extra}
</head>
<body data-page="{page}">
<div class="progress"></div>
<div class="curtain" aria-hidden="true">{LION}<div class="cw">Mécanique <b>Lion</b></div><div class="cbar"></div></div>

'''

def lion_fav():
    from urllib.parse import quote
    return quote(LION.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ').replace(' aria-hidden="true"', ''))

def header(t, cur, pre, alt):
    links = ''.join(f'<a href="{f}"{" aria-current=page" if f == cur else ""}><span>{n.replace("&", "&amp;")}</span></a>' for f, n in t['pages'][:3])
    mlinks = ''.join(f'<a href="{f}"{" aria-current=page" if f == cur else ""}>{n.replace("&", "&amp;")}</a>' for f, n in t['pages'])
    fr = t['lang'].startswith('fr')
    seg = (f'<span class="on">FR</span><a href="{alt}" lang="en">EN</a>' if fr else f'<a href="{alt}" lang="fr">FR</a><span class="on">EN</span>')
    return f'''<header class="site-header">
  <nav class="nav" aria-label="Navigation">
    <a class="logo" href="index.html" aria-label="Mécanique Mobile Lion">{LION}<span><b>Mécanique <span class="amb">Lion</span></b><small>{t["tag"]}</small></span></a>
    <div class="menu">{links}</div>
    <div class="nav-r">
      <div class="seg" aria-label="Langue">{seg}</div>
      <a class="tel2" href="tel:{TELH}" aria-label="{t["call"]} {TEL}"><span class="ti">{PHONE}</span><span class="tt"><small>{t["tel_l"]}</small><b>{TEL}</b></span></a>
      <a class="btn b-amb btn-sm" href="contact.html" data-magnetic>{t["req"]} {ARROW}</a>
      <button class="burger" type="button" aria-label="{t["menu_open"]}" aria-expanded="false"><i></i><i></i></button>
    </div>
  </nav>
</header>
<div class="demo-badge" role="note"><span class="dot"></span>{t["demo_s"]}</div>
<nav class="mnav" aria-label="Menu">{mlinks}<p class="mnav-foot"><a href="tel:{TELH}">{TEL}</a> · St-Lin–Laurentides<br><a href="{alt}">{"English" if fr else "Français"}</a></p></nav>
'''

def footer(t, pre):
    return f'''<footer class="foot">
  <div class="wrap">
    <div class="foot-grid">
      <div>
        <a class="logo" href="index.html">{LION}<span><b>Mécanique <span class="amb">Lion</span></b><small>{t["tag"]}</small></span></a>
        <p class="big">{t["foot_big"]}</p>
        <div class="socials"><a href="{IGURL}" target="_blank" rel="noopener" aria-label="Instagram">{IG}</a><a href="tel:{TELH}" aria-label="{t["call"]}">{PHONE}</a><a href="sms:{TELH}" aria-label="SMS">{SMS}</a></div>
      </div>
      <div><h4>{t["foot_h"][0]}</h4><p>{t["foot_svc"]}</p></div>
      <div><h4>{t["foot_h"][1]}</h4><p>{t["foot_zone"]}</p></div>
      <div><h4>{t["foot_h"][2]}</h4><p><a href="tel:{TELH}">{TEL}</a><br><a href="{IGURL}" target="_blank" rel="noopener">@mecaniquemobilelion</a><br><a href="contact.html">{t["req"]}</a></p></div>
    </div>
    <div class="foot-word" aria-hidden="true"><span>Mécanique</span><span class="amb">Lion</span></div>
    <div class="foot-bot"><span>{t["foot_bot"][0]}</span><span>{t["foot_bot"][1]} · {t["credit"]}</span></div>
  </div>
</footer>
<div class="fab"><a class="btn b-amb" href="tel:{TELH}">{PHONE} {t["fab"]}</a></div>
'''

def scripts(pre, gears=False):
    g = ('<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.170.0/build/three.module.min.js","three/":"https://cdn.jsdelivr.net/npm/three@0.170.0/"}}</script>'
         f'<script type="module" src="{pre}gears.js?v={V}"></script>') if gears else ''
    return f'''<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js" defer></script>
{g}<script src="{pre}app.js?v={V}" defer></script>
</body></html>'''

def vid(pre, name, cls='', lazy=True):
    src = f'{pre}media/{name}.mp4'
    poster = f'{pre}media/{name}.jpg'
    if lazy:
        return f'<video class="{cls}" muted loop playsinline preload="none" poster="{poster}" data-lazy data-src="{src}"></video>'
    return f'<video class="{cls}" muted loop playsinline autoplay preload="auto" poster="{poster}" src="{src}"></video>'

def marquee(items, tilt=False, d=-1):
    return f'<div class="marquee{" tilt" if tilt else ""}" aria-hidden="true"><div class="mq-track" data-dir="{d}">{"".join(f"<span>{H.escape(i)}</span>" for i in items * 2)}</div></div>'

def final(t):
    return f'''<section class="final"><div class="wrap">
  <h2 class="disp">{t["final_h"]}</h2>
  <a class="phone" href="tel:{TELH}">{TEL}</a>
  <div class="cta"><a class="btn b-amb" href="tel:{TELH}" data-magnetic>{PHONE} {t["call"]}</a><a class="btn b-ghost" href="sms:{TELH}">{SMS} {t["final_sms"]}</a><a class="btn b-ghost" href="contact.html">{t["req"]} {ARROW}</a></div>
</div></section>'''

PH = {'sparks': 'engine', 'drone': 'zone', 'hero2': 'contact'}
def phero(t, kick, lines, p, video, pre):
    l = ''.join(f'<span class="line"><span>{x}</span></span>' for x in lines)
    return f'''<section class="phero"><div class="pimg"><img src="{pre}media/ph/{PH[video]}.jpg" alt=""></div><div class="pmedia">{vid(pre, video, lazy=False)}</div><div class="wrap">
  <span class="kick">{kick}</span><h1 class="disp">{l}</h1><p>{p}</p>
</div></section>'''

# ---------------------------------------------------------------- pages
def home(t, lang, pre, alt):
    h1 = ''.join(f'<span class="line"><span>{x}</span></span>' for x in t['hero_h1'])
    chips = ''.join(f'<span class="chip"><span class="dot"></span>{c}</span>' for c in t['chips'])
    cards = ''
    imgs = ['heavy', 'auto', 'trailer']
    for i, (a, b, ico, items) in enumerate(t['divs']):
        lis = ''.join(f'<li>{x}</li>' for x in items)
        cards += f'''<a class="div-card" href="services.html#s{i + 1}"><div class="bgi"><img src="{pre}media/ph/{imgs[i]}.jpg" alt="" loading="lazy"></div><div class="bgv">{vid(pre, ['hero2', 'sparks', 'drone'][i])}</div><span class="glare"></span>
  <div class="dc-top"><span class="num">0{i + 1}</span><span class="tagl">{b}</span></div>
  <div><h3>{a}</h3><ul>{lis}</ul><span class="more">{t["more"]} {ARROW}</span></div></a>'''
    wl = ''.join(f'<div class="wlabel{" left" if i == 2 else ""}"><i></i><span>{x}</span></div>' for i, x in enumerate(t['wh_l']))
    steps = ''.join(f'<div class="step"><div class="n">{n}</div><h3>{h}</h3><p>{p}</p></div>' for n, h, p in t['steps'])
    bars = ''.join('<i><b></b></i>' for _ in t['steps'])
    perks = ''.join(f'<div class="perk" data-rev><div class="big">{b}</div><h4>{h}</h4><p>{p}</p></div>' for b, h, p in t['perks'])
    meta = ''.join(f'<span class="mono">{m}</span>' for m in t['meta'])
    body = f'''{head(t, t["home_title"], t["home_desc"], "index.html", pre, f'<link rel="preload" as="image" href="{pre}media/hero.jpg">')}
{header(t, "index.html", pre, alt)}
<main>
<section class="hero">
  <div class="slides" aria-hidden="true"><img src="{pre}media/ph/hero1.jpg" alt="" fetchpriority="high"><img src="{pre}media/ph/hero2.jpg" alt="" loading="lazy"><img src="{pre}media/ph/hero3.jpg" alt="" loading="lazy"></div>
  <div class="hero-media">{vid(pre, "hero", "v-d", lazy=False)}{vid(pre, "hero-m", "v-m", lazy=False)}</div>
  <div class="hero-in"><div class="wrap"><h1 class="disp">{h1}</h1></div></div>

</section>
{marquee(t["mq"])}
<section class="manifest"><div class="wrap"><p>{t["manifest"]}</p><div class="meta">{meta}</div></div></section>
<section class="split"><div class="wrap split-in">
  <div class="split-img" data-wipe><img src="{pre}media/ph/hands.jpg" alt="{t["split_alt"]}" loading="lazy"></div>
  <div class="split-txt"><span class="kick">{t["split_kick"]}</span><h2 class="disp h2" style="margin:18px 0 22px" data-split>{t["split_h"]}</h2><p class="lead" data-rev>{t["split_p"]}</p>
    <ul class="checks" data-rev>{"".join(f"<li><b>{a}</b><span>{b}</span></li>" for a, b in t["split_pts"])}</ul>
    <div class="split-mini" data-rev><img src="{pre}media/ph/tools1.jpg" alt="" loading="lazy"><img src="{pre}media/ph/tools2.jpg" alt="" loading="lazy"></div></div>
</div></section>
<section class="sec" style="padding-top:0"><div class="wrap">
  <div class="sec-head"><div><span class="kick" data-rev>{t["div_kick"]}</span><h2 class="disp h2" style="margin-top:18px" data-split>{t["div_h"]}</h2></div><p class="lead" data-rev>{t["div_p"]}</p></div>
  <div class="divs">{cards}</div>
  <div class="cdots" aria-hidden="true"><i class="on"></i><i></i><i></i></div>
</div></section>
<section class="wheel"><div class="wheel-pin">
  <canvas id="wheel" aria-hidden="true"></canvas>
  {wl}
  <div class="wheel-txt wrap"><span class="kick">{t["wh_kick"]}</span><h2 class="disp h2" style="margin:18px 0 20px">{t["wh_h"]}</h2><p class="lead">{t["wh_p"]}</p><div class="wtags">{"".join(f"<span>{x}</span>" for x in t["wh_l"])}</div></div>
</div></section>
<section class="gears"><div class="gears-pin">
  <div class="gears-bg"></div><div class="gears-big" aria-hidden="true">{t["gears_big"]}</div>
  <canvas id="gears" aria-hidden="true"></canvas>
  <div class="steps"><span class="kick" style="position:absolute;top:18vh">{t["steps_kick"]}</span>{steps}<div class="step-bar">{bars}</div></div>
</div></section>
{marquee(t["mq"], tilt=True, d=1)}
<section class="reel"><div class="reel-media"><img src="{pre}media/ph/road.jpg" alt="" loading="lazy">{vid(pre, "drone")}</div><div class="reel-txt"><h2 class="disp">{t["reel_h"]}</h2><p>{t["reel_p"]}</p></div></section>
<section class="orange"><div class="hazard" aria-hidden="true"></div><div class="wrap"><div class="perks">{perks}</div></div><div class="hazard" aria-hidden="true"></div></section>
{zone_block(t, lang)}
{final(t)}
</main>
{footer(t, pre)}
{scripts(pre, gears=True)}'''
    return body

def services(t, lang, pre, alt):
    blocks = ''
    for i, (name, desc, ico, items) in enumerate(t['svc']):
        acc = ''
        for j, (q, a, tags) in enumerate(items):
            open_ = ' open' if j == 0 else ''
            tg = ''.join(f'<li>{x}</li>' for x in tags)
            acc += f'<div class="acc-i{open_}"><button class="acc-q" type="button" aria-expanded="{"true" if open_ else "false"}">{q}<span class="pm"></span></button><div class="acc-a"{" style=\"height:auto\"" if open_ else ""}><div><p>{a}</p><ul>{tg}</ul></div></div></div>'
        blocks += f'''<div class="svc" id="s{i + 1}">
  <div class="svc-l"><span class="n">0{i + 1} / 03</span><h2 data-split>{name}</h2><p data-rev>{desc}</p><div class="ico" data-rev>{ico}</div>
    <div style="margin-top:28px" data-rev><a class="btn b-amb btn-sm" href="contact.html">{t["req"]} {ARROW}</a></div></div>
  <div class="acc" data-rev>{acc}</div>
</div>'''
    return f'''{head(t, t["svc_title"], t["home_desc"], "services.html", pre)}
{header(t, "services.html", pre, alt)}
<main>
{phero(t, t["svc_kick"], t["svc_h1"], t["svc_p"], "sparks", pre)}
{marquee(t["mq"])}
<section class="sec" style="padding-top:60px"><div class="wrap">
<div class="note" data-rev>{INFO}<span>{t["svc_note"]}</span></div>
{blocks}
</div></section>
{final(t)}
</main>
{footer(t, pre)}
{scripts(pre)}'''

def zone(t, lang, pre, alt):
    faq = ''.join(f'<div class="acc-i"><button class="acc-q" type="button" aria-expanded="false">{q}<span class="pm"></span></button><div class="acc-a"><div><p>{a}</p></div></div></div>' for q, a in t['faq'])
    return f'''{head(t, t["zone_title"], t["home_desc"], "zone.html", pre)}
{header(t, "zone.html", pre, alt)}
<main>
{phero(t, t["zpage_kick"], t["zpage_h1"], t["zpage_p"], "drone", pre)}
{zone_block(t, lang)}
{marquee(t["mq"], tilt=True)}
<section class="sec"><div class="wrap faq">
  <div><span class="kick" data-rev>{t["faq_kick"]}</span><h2 class="disp h2" style="margin-top:18px" data-split>{t["faq_h"]}</h2></div>
  <div class="acc" data-rev>{faq}</div>
</div></section>
{final(t)}
</main>
{footer(t, pre)}
{scripts(pre)}'''

def contact(t, lang, pre, alt):
    f = t['f']
    cards = ''.join(f'<a class="ccard" href="{h}"{" target=_blank rel=noopener" if h.startswith("http") else ""} data-rev><span class="ic">{ic}</span><span><small>{a}</small><b>{b}</b></span></a>' for a, b, h, ic in t['cards'])
    bars = ''.join('<i><b></b></i>' for _ in f['steps'])
    veh = ''.join(f'<div class="opt"><input type="radio" name="veh" id="v{i}" value="{a}" data-t="{a}"><label for="v{i}">{ic}<span><b>{a}</b><br><small>{b}</small></span></label></div>' for i, (a, b, ic) in enumerate(f['veh']))
    urg = ''.join(f'<div class="opt"><input type="radio" name="urg" id="u{i}" value="{u}" data-t="{u}"{" checked" if i == 0 else ""}><label for="u{i}"><b>{u}</b></label></div>' for i, u in enumerate(f['urg']))
    form = f'''<form class="form" id="req" novalidate data-l='{H.escape(json.dumps(t["fl"], ensure_ascii=False))}' data-rev>
  <div class="f-steps">{bars}</div>
  <div class="f-pane"><span class="mono amb">01 / 04</span><h3 style="margin-top:8px">{f["steps"][0]}</h3><div class="opts">{veh}</div></div>
  <div class="f-pane"><span class="mono amb">02 / 04</span><h3 style="margin-top:8px">{f["steps"][1]}</h3>
    <label class="fld"><span>{f["prob"]}</span><textarea name="prob" placeholder="{f["prob_ph"]}"></textarea></label>
    <div class="fld"><span>{f["urg_l"]}</span><div class="urg">{urg}</div></div></div>
  <div class="f-pane"><span class="mono amb">03 / 04</span><h3 style="margin-top:8px">{f["steps"][2]}</h3>
    <div class="fld-row"><label class="fld"><span>{f["name"]}</span><input name="name" autocomplete="name"></label><label class="fld"><span>{f["phone"]}</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel"></label></div>
    <label class="fld"><span>{f["where"]}</span><input name="where" placeholder="{f["where_ph"]}"></label></div>
  <div class="f-pane"><span class="mono amb">04 / 04</span><h3 style="margin-top:8px">{f["steps"][3]}</h3><p style="color:var(--mut);margin:-8px 0 18px">{f["last_p"]}</p><div class="recap"></div>
    <div class="hero-cta"><a class="btn b-amb" data-sms href="sms:{TELH}">{SMS} {f["send"]}</a><a class="btn b-ghost" href="tel:{TELH}">{PHONE} {f["or_call"]}</a></div></div>
  <p class="f-err" role="alert"></p>
  <div class="f-nav"><button class="btn b-ghost btn-sm" type="button" data-prev>{f["prev"]}</button><button class="btn b-amb btn-sm" type="button" data-next>{f["next"]} {ARROW}</button></div>
</form>'''
    return f'''{head(t, t["ct_title"], t["home_desc"], "contact.html", pre)}
{header(t, "contact.html", pre, alt)}
<main>
{phero(t, t["ct_kick"], t["ct_h1"], t["ct_p"], "hero2", pre)}
<section class="sec" style="padding-top:40px"><div class="wrap form-wrap">
  <div class="contact-cards">{cards}</div>
  {form}
</div></section>
</main>
{footer(t, pre)}
{scripts(pre)}'''

for lang in ('fr', 'en'):
    t = T[lang]
    out = OUT if lang == 'fr' else OUT / 'en'
    out.mkdir(parents=True, exist_ok=True)
    pre = '' if lang == 'fr' else '../'
    for page, fn in (('index.html', home), ('services.html', services), ('zone.html', zone), ('contact.html', contact)):
        other = ('en/' if lang == 'fr' else '../') + ('' if page == 'index.html' else page)
        (out / page).write_text(fn(t, lang, pre, other), encoding='utf-8')
print('ok')
