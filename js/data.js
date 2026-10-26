/*
 * Electro 21 — données de la boutique
 * -----------------------------------------------------------------------------
 * Fichier à éditer pour tenir la boutique à jour : coordonnées, catégories,
 * produits, prix et stocks. Aucun outil de compilation n'est nécessaire,
 * il suffit de recharger la page après sauvegarde.
 *
 * Le catalogue n'affiche aucun prix : chaque produit porte `prix: null` et se lit
 * « Prix sur demande ». La boutique donne le prix du jour sur WhatsApp. Pour
 * réafficher des prix en francs CFA (XOF), remettre un nombre dans `prix` :
 * le filtre Budget et les tris par prix reviennent automatiquement.
 */
window.ELECTRO21 = {
  boutique: {
    nom: 'Electro 21',
    signature: 'Univers du téléphone haut de gamme',
    description:
      "Boutique de vente de téléphones portables, d'ordinateurs, de matériel informatique et d'accessoires, à Bamako.",
    ville: 'Bamako, Mali',
    adresse: 'ACI 2000, Bamako',
    quartier: 'ACI 2000',
    /* Adresse publique du site, sans slash final. Elle sert aux codes QR (fiche,
       vitrine, planche d'étiquettes). Site publié le 26 octobre 2026 sur Vercel ;
       si le domaine change, reprendre cette valeur et les balises og: de index.html. */
    urlSite: 'https://electro21.vercel.app',
    tel: ['+223 77 77 77 00', '+223 95 21 21 21'],
    whatsapp: '22377777700',
    email: 'oldbouba60@yahoo.fr',
    facebook: 'https://www.facebook.com/profile.php?id=100064846984357',
    horaires: [
      { jours: 'Lundi – Vendredi', heures: '9 h 00 – 19 h 00' },
      { jours: 'Samedi', heures: '9 h 00 – 18 h 00' },
      { jours: 'Dimanche', heures: 'Sur rendez-vous (WhatsApp)' },
    ],
    devis: "Demande de prix en boutique ou livraison à Bamako. Paiement à la remise.",
    moyensPaiement: ['Espèces', 'Orange Money', 'Moov Money', 'Virement'],
    note: { score: 4.5, avis: 22, recommandation: '90 % des clients recommandent' },
    devise: 'FCFA',
  },

  categories: [
    { id: 'smartphones', label: 'Smartphones', visuel: 'phone' },
    { id: 'tablettes', label: 'Tablettes', visuel: 'tablet' },
    { id: 'ordinateurs', label: 'Ordinateurs', visuel: 'laptop' },
    { id: 'accessoires', label: 'Accessoires', visuel: 'charger' },
    { id: 'audio', label: 'Audio', visuel: 'speaker' },
    { id: 'montres', label: 'Montres connectées', visuel: 'watch' },
  ],

  produits: [
    {
      id: 'p1',
      nom: 'iPhone 18 Pro Max 256 Go',
      marque: 'Apple',
      categorie: 'smartphones',
      prix: null,
      prixBarre: null,
      visuel: 'phone',
      stock: 'sur-commande',
      note: 4.9,
      avis: 14,
      vendu: 38,
      badge: 'Nouveauté',
      resume: 'Le dernier flagship Apple, commande ouverte en boutique.',
      description:
        "Dernier né de la gamme Pro Max : écran 6,9 pouces ProMotion, bloc photo avancé et autonomie d'une journée complète. Modèle neuf, scellé, facturé et garanti. Exemplaires livrés sous 5 à 7 jours après confirmation de la commande.",
      specs: [
        { label: 'Écran', valeur: '6,9" ProMotion 120 Hz' },
        { label: 'Stockage', valeur: '256 Go' },
        { label: 'Photo', valeur: 'Triple capteur 48 Mpx' },
        { label: 'Réseau', valeur: '5G double SIM' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p2',
      nom: 'iPhone 17 128 Go',
      marque: 'Apple',
      categorie: 'smartphones',
      prix: null,
      prixBarre: null,
      visuel: 'phone',
      stock: 'en-stock',
      note: 4.8,
      avis: 21,
      vendu: 64,
      badge: 'Populaire',
      resume: 'Le modèle iPhone le plus demandé de la boutique, disponible.',
      description:
        "Format compact, entretien aisé et grande valeur à la revente. Téléphone neuf débloqué tout opérateur, compatible eSIM. Vendu avec câble, facture Electro 21 et garantie boutique de 12 mois.",
      specs: [
        { label: 'Écran', valeur: '6,3" 120 Hz' },
        { label: 'Stockage', valeur: '128 Go' },
        { label: 'Photo', valeur: 'Double capteur 48 Mpx' },
        { label: 'Réseau', valeur: '5G, eSIM' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p3',
      nom: 'Samsung Galaxy S25 Ultra 512 Go',
      marque: 'Samsung',
      categorie: 'smartphones',
      prix: null,
      prixBarre: null,
      visuel: 'phone',
      stock: 'en-stock',
      note: 4.7,
      avis: 11,
      vendu: 22,
      resume: 'Stylus intégré, zoom 5x et écran 6,9 pouces.',
      description:
        "Référence Android de la boutique : S Pen intégré, capteur 200 Mpx et châssis titane. Idéal pour la prise de note, la photo de nuit et le montage vidéo. Version internationale double SIM, déverrouillée.",
      specs: [
        { label: 'Écran', valeur: '6,9" Dynamic AMOLED 2X' },
        { label: 'Stockage', valeur: '512 Go' },
        { label: 'Photo', valeur: '200 Mpx + zoom 5x' },
        { label: 'Mémoire', valeur: '12 Go RAM' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p4',
      nom: 'Tecno Camon 30 Pro 256 Go',
      marque: 'Tecno',
      categorie: 'smartphones',
      prix: null,
      prixBarre: null,
      visuel: 'phone',
      stock: 'en-stock',
      note: 4.4,
      avis: 27,
      vendu: 91,
      badge: 'Bon plan',
      resume: 'Le meilleur rapport qualité/prix en photo, souvent en rupture.',
      description:
        "Le téléphone le plus vendu du magasin : capteur 50 Mpx stabilisé, charge 70 W et grand écran AMOLED. Parfait premier smartphone sérieux ou téléphone de travail robuste et facile à faire réparer.",
      specs: [
        { label: 'Écran', valeur: '6,8" AMOLED 120 Hz' },
        { label: 'Stockage', valeur: '256 Go' },
        { label: 'Batterie', valeur: '5000 mAh, charge 70 W' },
        { label: 'Réseau', valeur: '4G double SIM' },
        { label: 'Garantie', valeur: '12 mois constructeur' },
      ],
    },
    {
      id: 'p5',
      nom: 'Xiaomi Redmi Note 14 8/256 Go',
      marque: 'Xiaomi',
      categorie: 'smartphones',
      prix: null,
      prixBarre: null,
      visuel: 'phone',
      stock: 'en-stock',
      note: 4.5,
      avis: 19,
      vendu: 73,
      resume: 'Écran AMOLED et batterie 5500 mAh au budget serré.',
      description:
        "Valeur sûre du milieu de gamme : écran AMOLED 120 Hz, triple module photo 108 Mpx et charge rapide 45 W. Disponible en noir, bleu et vert selon arrivage.",
      specs: [
        { label: 'Écran', valeur: '6,67" AMOLED 120 Hz' },
        { label: 'Mémoire', valeur: '8 Go RAM / 256 Go' },
        { label: 'Batterie', valeur: '5500 mAh, charge 45 W' },
        { label: 'Photo', valeur: '108 Mpx' },
        { label: 'Garantie', valeur: '12 mois constructeur' },
      ],
    },
    {
      id: 'p6',
      nom: 'Infinix Hot 50 4/128 Go',
      marque: 'Infinix',
      categorie: 'smartphones',
      prix: null,
      prixBarre: null,
      visuel: 'phone',
      stock: 'stock-faible',
      note: 4.2,
      avis: 16,
      vendu: 58,
      resume: 'Le smartphone d’entrée de gamme que tout le monde prend.',
      description:
        "Grand écran fluide, batterie 5000 mAh et Android 14 : l'essentiel bien fait pour un budget contenu. Trois exemplaires restent en vitrine, prix annoncé à la demande.",
      specs: [
        { label: 'Écran', valeur: '6,78" 90 Hz' },
        { label: 'Mémoire', valeur: '4 Go RAM / 128 Go' },
        { label: 'Batterie', valeur: '5000 mAh' },
        { label: 'Réseau', valeur: '4G double SIM' },
        { label: 'Garantie', valeur: '12 mois constructeur' },
      ],
    },
    {
      id: 'p7',
      nom: 'iPad 11" (A16) 128 Go Wi-Fi',
      marque: 'Apple',
      categorie: 'tablettes',
      prix: null,
      prixBarre: null,
      visuel: 'tablet',
      stock: 'en-stock',
      note: 4.8,
      avis: 9,
      vendu: 17,
      resume: 'Ardoise idéale pour étudiant, commerce et prise de notes.',
      description:
        "Puce A16, écran Liquid Retina et compatibilité Apple Pencil : l'outil le plus demandé par les commerçants et les étudiants de Bamako. Coque et dalle en verre trempé offertes avec la tablette.",
      specs: [
        { label: 'Écran', valeur: '11" Liquid Retina' },
        { label: 'Stockage', valeur: '128 Go' },
        { label: 'Stylet', valeur: 'Apple Pencil 1re/USB-C gen.' },
        { label: 'Connexion', valeur: 'Wi-Fi 6' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p8',
      nom: 'KXD A16 Plus 4G 64 Go',
      marque: 'KXD',
      categorie: 'tablettes',
      prix: null,
      prixBarre: null,
      visuel: 'tablet',
      stock: 'en-stock',
      note: 4.1,
      avis: 12,
      vendu: 44,
      resume: 'Tablette 4G avec carte SIM : internet partout, sans box.',
      description:
        "Tablette compacte avec emplacement SIM et double SIM : idéale pour les cours en ligne, les vidéos et les déplacements. Chargeur et notice inclus, testée en boutique avant la vente.",
      specs: [
        { label: 'Écran', valeur: '8,4" HD' },
        { label: 'Réseau', valeur: '4G, double SIM' },
        { label: 'Mémoire', valeur: '4 Go RAM / 64 Go' },
        { label: 'Batterie', valeur: '4700 mAh' },
        { label: 'Garantie', valeur: '6 mois boutique' },
      ],
    },
    {
      id: 'p9',
      nom: 'Samsung Galaxy Tab A9+ 8/128 Go',
      marque: 'Samsung',
      categorie: 'tablettes',
      prix: null,
      prixBarre: null,
      visuel: 'tablet',
      stock: 'sur-commande',
      note: 4.5,
      avis: 7,
      vendu: 13,
      resume: 'Écran 11 pouces 90 Hz et haut-parleurs quad.',
      description:
        "La tablette familiale équilibrée : grand écran 90 Hz, mode multi-fenêtres et autonomie confortable. Livrée sous 5 jours après commande, version Wi-Fi ou LTE au choix.",
      specs: [
        { label: 'Écran', valeur: '11" 90 Hz' },
        { label: 'Mémoire', valeur: '8 Go RAM / 128 Go' },
        { label: 'Audio', valeur: '4 haut-parleurs' },
        { label: 'Batterie', valeur: '7040 mAh' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p10',
      nom: 'MacBook Air M3 13" 16/512 Go',
      marque: 'Apple',
      categorie: 'ordinateurs',
      prix: null,
      prixBarre: null,
      visuel: 'laptop',
      stock: 'en-stock',
      note: 4.9,
      avis: 8,
      vendu: 11,
      badge: 'Populaire',
      resume: 'Silencieux, 18 heures d’autonomie : l’outil des pros.',
      description:
        "Aucun ventilateur, une autonomie de journée complète et un écran Retina lumineux. Configuré pour le montage, le développement et les gros classeurs. Reprise possible de votre ancien matériel sur estimation.",
      specs: [
        { label: 'Écran', valeur: '13,6" Retina' },
        { label: 'Processeur', valeur: 'Apple M3 8 cœurs' },
        { label: 'Mémoire', valeur: '16 Go / SSD 512 Go' },
        { label: 'Autonomie', valeur: 'Jusqu’à 18 h' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p11',
      nom: 'HP Pavilion 15 Ryzen 7 16/512 Go',
      marque: 'HP',
      categorie: 'ordinateurs',
      prix: null,
      prixBarre: null,
      visuel: 'laptop',
      stock: 'en-stock',
      note: 4.6,
      avis: 15,
      vendu: 29,
      resume: 'Le poste bureautique et étude qui encaisse les multitâches.',
      description:
        "Ryzen 7 série 7000, 16 Go de mémoire et SSD 512 Go : Windows 11 installé, à jour et prêt à l'emploi. Config recommandé pour les bureaux, les cabinets et les étudiants en ingénierie.",
      specs: [
        { label: 'Écran', valeur: '15,6" FHD IPS' },
        { label: 'Processeur', valeur: 'Ryzen 7 7730U' },
        { label: 'Mémoire', valeur: '16 Go DDR4 / SSD 512 Go' },
        { label: 'Système', valeur: 'Windows 11 Famille' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p12',
      nom: 'Lenovo IdeaPad 3 i5 8/256 Go',
      marque: 'Lenovo',
      categorie: 'ordinateurs',
      prix: null,
      prixBarre: null,
      visuel: 'laptop',
      stock: 'stock-faible',
      note: 4.3,
      avis: 13,
      vendu: 34,
      resume: 'Le portable de bureau à petit budget, révisé et garanti.',
      description:
        "Core i5 de 12e génération, clavier confortable et châssis léger. Chaque machine est testée, nettoyée et mise à jour avant la vente. Deux exemplaires disponibles, prix annoncé à la demande.",
      specs: [
        { label: 'Écran', valeur: '15,6" FHD' },
        { label: 'Processeur', valeur: 'Intel Core i5-1235U' },
        { label: 'Mémoire', valeur: '8 Go / SSD 256 Go' },
        { label: 'Système', valeur: 'Windows 11 Famille' },
        { label: 'Garantie', valeur: '6 mois boutique' },
      ],
    },
    {
      id: 'p13',
      nom: 'Écran PC Dell 24" Full HD',
      marque: 'Dell',
      categorie: 'ordinateurs',
      prix: null,
      prixBarre: null,
      visuel: 'monitor',
      stock: 'en-stock',
      note: 4.5,
      avis: 6,
      vendu: 21,
      resume: 'Dalle IPS 75 Hz, pied réglable, HDMI et DisplayPort.',
      description:
        "Le moniteur de bureau standard : bonne luminosité, angles de vision larges et fixation VESA pour un bras articulé. Câble HDMI fourni, test pixels morts garanti à la remise.",
      specs: [
        { label: 'Dalle', valeur: 'IPS 24" Full HD 75 Hz' },
        { label: 'Connectique', valeur: 'HDMI, DisplayPort' },
        { label: 'Pied', valeur: 'Réglable en hauteur' },
        { label: 'Format', valeur: '16:9, antireflet' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p14',
      nom: 'AirPods Pro 2 (USB-C)',
      marque: 'Apple',
      categorie: 'accessoires',
      prix: null,
      prixBarre: null,
      visuel: 'earbuds',
      stock: 'en-stock',
      note: 4.7,
      avis: 18,
      vendu: 47,
      badge: 'Populaire',
      resume: 'Réduction de bruit active, scellés et vérifiés en boutique.',
      description:
        "Écouteurs à réduction de bruit active, résistance à l'eau et boîtier de charge USB-C. Numéro de série vérifié devant le client, facture Electro 21 remise avec la paire.",
      specs: [
        { label: 'Type', valeur: 'Intra-auriculaire ANC' },
        { label: 'Autonomie', valeur: '6 h + 30 h au boîtier' },
        { label: 'Charge', valeur: 'USB-C et sans fil' },
        { label: 'Étanchéité', valeur: 'IP54' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p15',
      nom: 'Chargeur rapide 45 W + câble USB-C',
      marque: 'Electro 21 Select',
      categorie: 'accessoires',
      prix: null,
      prixBarre: null,
      visuel: 'charger',
      stock: 'en-stock',
      note: 4.4,
      avis: 23,
      vendu: 132,
      resume: 'Le chargeur qu’on rachète, testé sur tous les téléphones.',
      description:
        "Bloc de charge rapide 45 W avec câble tressé 1,5 m. Compatible smartphones, tablettes et ordinateurs USB-PD. Chaque accessoire est testé en boutique avant la vente.",
      specs: [
        { label: 'Puissance', valeur: '45 W USB-PD' },
        { label: 'Câble', valeur: 'USB-C tressé 1,5 m' },
        { label: 'Sorties', valeur: '1 port USB-C' },
        { label: 'Sécurité', valeur: 'Protection surtension' },
        { label: 'Garantie', valeur: '6 mois boutique' },
      ],
    },
    {
      id: 'p16',
      nom: 'Batterie externe 20 000 mAh 22,5 W',
      marque: 'Baseus',
      categorie: 'accessoires',
      prix: null,
      prixBarre: null,
      visuel: 'battery',
      stock: 'en-stock',
      note: 4.6,
      avis: 17,
      vendu: 88,
      resume: 'Deux jours d’autonomie, affichage du pourcentage restant.',
      description:
        "Indispensable avec les coupures : recharge un smartphone quatre à cinq fois, deux sorties USB et une USB-C. Afficheur LED du niveau de charge, format avion autorisable.",
      specs: [
        { label: 'Capacité', valeur: '20 000 mAh / 74 Wh' },
        { label: 'Puissance', valeur: '22,5 W max' },
        { label: 'Ports', valeur: '2 USB-A + 1 USB-C' },
        { label: 'Affichage', valeur: 'LED pourcentage' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p17',
      nom: 'Carte microSD 128 Go classe 10',
      marque: 'SanDisk',
      categorie: 'accessoires',
      prix: null,
      prixBarre: null,
      visuel: 'sdcard',
      stock: 'en-stock',
      note: 4.3,
      avis: 14,
      vendu: 105,
      resume: 'Mémoire vérifiée devant vous, pas de contrefaçon.',
      description:
        "Extension de mémoire pour téléphone, tablette, caméra et console. Chaque carte est passée au test de vitesse et d'écriture en boutique avant d'être scellée devant le client.",
      specs: [
        { label: 'Capacité', valeur: '128 Go' },
        { label: 'Vitesse', valeur: 'Jusqu’à 100 Mo/s' },
        { label: 'Usage', valeur: 'Classe 10, A1' },
        { label: 'Adaptateur', valeur: 'SD inclus' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p18',
      nom: 'Enceinte JBL Flip 6',
      marque: 'JBL',
      categorie: 'audio',
      prix: null,
      prixBarre: null,
      visuel: 'speaker',
      stock: 'en-stock',
      note: 4.7,
      avis: 10,
      vendu: 26,
      resume: 'Son puissant, étanche, 12 h d’autonomie pour les soirées.',
      description:
        "Enceinte Bluetooth étanche IP67 avec boomer racé et tweeter séparé. S'appaire en couple pour un son stéréo. Cinq coloris selon arrivage.",
      specs: [
        { label: 'Bluetooth', valeur: '5.1, appairage stéréo' },
        { label: 'Autonomie', valeur: '12 h' },
        { label: 'Étanchéité', valeur: 'IP67' },
        { label: 'Charge', valeur: 'USB-C' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p19',
      nom: 'Casque Sony WH-1000XM5',
      marque: 'Sony',
      categorie: 'audio',
      prix: null,
      prixBarre: null,
      visuel: 'headphone',
      stock: 'sur-commande',
      note: 4.8,
      avis: 5,
      vendu: 8,
      resume: 'La référence du casque à réduction de bruit.',
      description:
        "Réduction de bruit parmi les plus efficaces du marché, 30 heures d'autonomie et repli compact. Livré sous 5 à 7 jours avec housse de transport d'origine.",
      specs: [
        { label: 'Type', valeur: 'Casque ANC circum-aural' },
        { label: 'Autonomie', valeur: '30 h, charge 3 min = 3 h' },
        { label: 'Bluetooth', valeur: '5.2, multipoint' },
        { label: 'Micro', valeur: '8 micros, appels nets' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p20',
      nom: 'Apple Watch SE 44 mm',
      marque: 'Apple',
      categorie: 'montres',
      prix: null,
      prixBarre: null,
      visuel: 'watch',
      stock: 'en-stock',
      note: 4.6,
      avis: 7,
      vendu: 12,
      resume: 'Suivi santé, notifications et boîtier aluminium 44 mm.',
      description:
        "La montre Apple la plus vendue de la boutique : grand écran, suivi du sommeil et de la fréquence cardiaque, bracelets interchangeables. Gravure du boîtier possible sur demande.",
      specs: [
        { label: 'Boîtier', valeur: '44 mm aluminium' },
        { label: 'Écran', valeur: 'Retina Always-On' },
        { label: 'Santé', valeur: 'Cardio, sommeil, chutes' },
        { label: 'Étanchéité', valeur: '50 m' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p21',
      nom: 'Montre connectée Amazfit GTS 4',
      marque: 'Amazfit',
      categorie: 'montres',
      prix: null,
      prixBarre: null,
      visuel: 'watch',
      stock: 'en-stock',
      note: 4.4,
      avis: 9,
      vendu: 31,
      resume: 'Autonomie de 8 jours, GPS intégré et 150 modes sport.',
      description:
        "Alternative économique à la montre connectée premium : GPS, oxymètre, suivi du stress et deux semaines d'autonomie réelle. Bracelet supplémentaire offert selon stock.",
      specs: [
        { label: 'Écran', valeur: '1,75" AMOLED' },
        { label: 'Autonomie', valeur: '8 jours typiques' },
        { label: 'GPS', valeur: 'Intégré double bande' },
        { label: 'Sport', valeur: '150 modes' },
        { label: 'Garantie', valeur: '12 mois boutique' },
      ],
    },
    {
      id: 'p22',
      nom: 'HP 14s Full HD i3 8/512 Go, rose',
      marque: 'HP',
      categorie: 'ordinateurs',
      prix: null,
      prixBarre: null,
      visuel: 'laptop',
      photo: 'hp-14s-full-hd-i3-rose.jpg',
      galerie: ['hp-14s-devant-boite.jpg', 'hp-14s-couvercle.jpg', 'hp-14s-filee.jpg'],
      stock: 'en-stock',
      note: 4.6,
      avis: 6,
      vendu: 12,
      badge: 'Arrivage',
      resume: 'Le portable couleur de la boutique, écran 14 pouces Full HD.',
      description:
        "Châssis corail, grand pavé tactile et dalle 14 pouces Full HD : le modèle le plus demandé à la boutique pour les études et le bureau. Configuration relevée sur l'étiquette de l'appareil : Intel Core i3-7320U, 8 Go de mémoire, SSD 512 Go, Windows 11. Prix communiqué en boutique ou sur WhatsApp selon l'arrivage.",
      specs: [
        { label: 'Écran', valeur: '14" Full HD (1 920 × 1 080)' },
        { label: 'Processeur', valeur: 'Intel Core i3-7320U' },
        { label: 'Mémoire', valeur: '8 Go' },
        { label: 'Stockage', valeur: 'SSD 512 Go' },
        { label: 'Système', valeur: 'Windows 11' },
        { label: 'Couleur', valeur: 'Rose corail' },
      ],
    },
    {
      id: 'p23',
      nom: 'Samsung Galaxy Watch Ultra 47 mm',
      marque: 'Samsung',
      categorie: 'montres',
      prix: null,
      prixBarre: null,
      visuel: 'watch',
      photo: 'samsung-galaxy-watch-ultra-47-mm.jpg',
      galerie: ['samsung-galaxy-watch-ultra-etanche.jpg'],
      stock: 'en-stock',
      note: 4.7,
      avis: 5,
      vendu: 9,
      badge: 'Arrivage',
      resume: 'Boîtier titane 47 mm, bracelet orange, étanche pour la nage.',
      description:
        "Montre connectée au format baroudeur : boîtier carré arrondi, couronne orange, suivi de la fréquence cardiaque, de l'oxygène du sang et de la température. Étanche, adaptée à la nage et au soleil de Bamako. Version internationale, compatible Android et iOS selon la région.",
      specs: [
        { label: 'Boîtier', valeur: '47 mm, titane' },
        { label: 'Écran', valeur: 'AMOLED tactile' },
        { label: 'Bracelet', valeur: 'Silicone orange' },
        { label: 'Capteurs', valeur: 'Cardo, SpO2, température' },
        { label: 'Étanchéité', valeur: 'Nage et plongée libre' },
      ],
    },
    {
      id: 'p24',
      nom: 'iPhone 18 128 Go',
      marque: 'Apple',
      categorie: 'smartphones',
      prix: null,
      prixBarre: null,
      visuel: 'phone',
      photo: 'iphone-18.jpg',
      galerie: ['iphone-18-duo-bientot.jpg'],
      stock: 'sur-commande',
      note: 4.8,
      avis: 3,
      vendu: 4,
      badge: 'Sur commande',
      resume: 'La nouvelle génération Apple, réservée par WhatsApp.',
      description:
        "L'affiche publiée par la boutique pour l'arrivée de l'iPhone 18 à Bamako. Coloris et capacités confirmés à la commande, appareil neuf scellé, facturé et garanti. Réservation ouverte par WhatsApp, livraison annoncée quelques jours après confirmation.",
      specs: [
        { label: 'Capacité', valeur: '128 Go' },
        { label: 'Puce', valeur: 'A18 Pro' },
        { label: 'Coloris', valeur: 'Noir, blanc, bleu, rouge' },
        { label: 'État', valeur: 'Neuf, scellé, facturé' },
        { label: 'Livraison', valeur: 'Bamako, après confirmation' },
      ],
    },
    {
      id: 'p25',
      nom: 'Samsung Galaxy Z Fold 8',
      marque: 'Samsung',
      categorie: 'smartphones',
      prix: null,
      prixBarre: null,
      visuel: 'phone',
      photo: 'samsung-galaxy-z-fold-8.jpg',
      stock: 'sur-commande',
      note: 4.7,
      avis: 2,
      vendu: 2,
      badge: 'Sur commande',
      resume: 'Le pliable Samsung, quatre coloris dont le vert pistache.',
      description:
        "Le pliable de la gamme Galaxy, annoncé « disponible chez nous, meilleur prix » par la boutique. Coloris présentés sur l'affiche : lavande, graphite, crème et pistache (en ligne seulement). Capacité et prix confirmés à la commande, appareil neuf scellé et garanti.",
      specs: [
        { label: 'Écran interne', valeur: 'Pliable 7,6" immersif' },
        { label: 'Coloris', valeur: 'Lavande, graphite, crème' },
        { label: 'Photo', valeur: 'Triple module haute résolution' },
        { label: 'Batterie', valeur: 'Longue durée, charge rapide' },
        { label: 'État', valeur: 'Neuf, scellé, facturé' },
      ],
    },
  ],

  /* ---------------------------------------------------------------------------
   * Réalisations — ce que la boutique a publié : arrivages, vitrine, annonces.
   * `image` est un chemin depuis la racine du site, `lien` un slug de fiche
   * produit (facultatif), `quand` une mention lue sur le visuel publié — laissée
   * à null quand la publication ne donne pas de date.
   * ------------------------------------------------------------------------- */
  realisations: [
    {
      id: 'r1',
      titre: 'Arrivage d’HP 14s corail déballés au comptoir',
      type: 'arrivage',
      quand: null,
      texte:
        'Une série de HP 14s Full HD (Core i3, 8 Go, SSD 512 Go, Windows 11) déballée et alignée sur le comptoir, boîte et accessoires visibles. Photo publiée par la boutique sur sa page Facebook.',
      image: 'assets/produits/hp-14s-devant-boite.jpg',
      lien: 'hp-14s-full-hd-i3-8-512-go-rose',
    },
    {
      id: 'r2',
      titre: 'Le comptoir et les ordinateurs exposés, ACI 2000',
      type: 'vitrine',
      quand: null,
      texte:
        'L’espace de vente du magasin d’ACI 2000 : ordinateurs portables exposés, essayage avant achat, vérification de l’appareil devant le client à la remise.',
      image: 'assets/marque/vitrine.jpg',
      lien: null,
    },
    {
      id: 'r3',
      titre: 'Annonce de l’arrivée de l’iPhone 18 Duo',
      type: 'annonce',
      quand: '19 septembre, date portée par l’affiche',
      texte:
        'Affiche publiée par la boutique pour l’arrivée de l’iPhone 18 à Bamako, « L’avenir est entre vos mains ». Réservation ouverte sur WhatsApp, coloris et capacités confirmés à la commande.',
      image: 'assets/produits/iphone-18-duo-bientot.jpg',
      lien: 'iphone-18-128-go',
    },
    {
      id: 'r4',
      titre: 'Samsung Galaxy Watch Ultra présenté étanche',
      type: 'annonce',
      quand: null,
      texte:
        'Visuel publié par la boutique pour le Galaxy Watch Ultra 47 mm : boîtier titane, suivi cardiaque et GPS, usage natation annoncé par le fabricant.',
      image: 'assets/produits/samsung-galaxy-watch-ultra-etanche.jpg',
      lien: 'samsung-galaxy-watch-ultra-47-mm',
    },
    {
      id: 'r5',
      titre: 'Bannière « Tout pour l’Électronique »',
      type: 'vitrine',
      quand: null,
      texte:
        'La bannière de la page Facebook, avec les deux numéros de la boutique et un aperçu des rayons : ordinateurs, téléphones, montres connectées.',
      image: 'assets/marque/couverture.jpg',
      lien: null,
    },
  ],

  /* ---------------------------------------------------------------------------
   * Partenaires — ce qui entoure la vente. Les marques vendues ne sont pas ici :
   * elles sont lues dans le catalogue (champ `marque` de chaque produit), pour
   * rester synchronisées automatiquement.
   * `type` : 'paiement', 'service' ou 'institution'.
   * ------------------------------------------------------------------------- */
  partenaires: [
    { nom: 'Espèces', role: 'Paiement à la remise, en boutique ou à la livraison', type: 'paiement' },
    { nom: 'Orange Money', role: 'Paiement mobile à distance, confirmé sur WhatsApp', type: 'paiement' },
    { nom: 'Moov Money', role: 'Paiement mobile à distance, confirmé sur WhatsApp', type: 'paiement' },
    { nom: 'Virement', role: 'Commandes des entreprises, écoles et administrations', type: 'paiement' },
    { nom: 'Livraison dans Bamako', role: 'Remise en main propre après vérification de l’appareil', type: 'service' },
    { nom: 'Page Facebook Electro 21', role: 'Arrivages, annonces et visuels publiés par la boutique', type: 'institution', lien: 'https://www.facebook.com/profile.php?id=100064846984357' },
  ],

  /* ---------------------------------------------------------------------------
   * Assistant — réponses automatiques du site. Un moteur de mots-clés, pas une
   * intelligence artificielle : il ne répond que ce qui est écrit ici, donc
   * uniquement des informations publiées par la boutique. `action` : 'whatsapp',
   * 'appel', 'catalogue', 'contact' — la reprise humaine est toujours proposée.
   * ------------------------------------------------------------------------- */
  assistant: {
    ouvert: true,
    titre: 'Assistant Electro 21',
    presentation:
      'Je réponds aux questions courantes sur la boutique : prix, livraison, garantie, paiement, horaires. Pour un prix ferme, c’est la boutique qui répond sur WhatsApp.',
    avertissement: 'Réponses établies à partir des informations publiées par la boutique.',
    suggestions: ['Quel est le prix ?', 'Livrez-vous à Bamako ?', 'Quelle garantie ?', 'Où est la boutique ?', 'Quels moyens de paiement ?'],
    questions: [
      {
        id: 'prix',
        question: 'Quel est le prix ?',
        mots: ['prix', 'tarif', 'combien', 'cout', 'coût', 'cher', 'chere', 'devis', 'argent', 'fcfa'],
        reponse:
          'Le catalogue n’affiche aucun prix : le modèle change d’un arrivage à l’autre. La boutique annonce le prix du jour sur WhatsApp, et il est confirmé à la remise.',
        action: 'whatsapp',
      },
      {
        id: 'livraison',
        question: 'Livrez-vous à Bamako ?',
        mots: ['livraison', 'livrer', 'livre', 'domicile', 'envoi', 'expedition', 'expédition', 'porte'],
        reponse:
          'Oui, livraison et remise en main propre dans Bamako. L’appareil est vérifié devant vous avant paiement, facture et garantie remises à la remise.',
        action: 'whatsapp',
      },
      {
        id: 'garantie',
        question: 'Quelle garantie ?',
        mots: ['garantie', 'garanti', 'panne', 'reparation', 'réparation', 'sav', 'defectueux', 'défectueux'],
        reponse:
          'Garantie boutique de 6 à 12 mois selon l’appareil, sur matériel neuf scellé et facturé. L’essayage et le test avant achat sont possibles en boutique.',
        action: 'contact',
      },
      {
        id: 'adresse',
        question: 'Où est la boutique ?',
        mots: ['ou', 'où', 'adresse', 'localisation', 'situé', 'situé', 'carte', 'map', 'venir', 'magasin', 'boutique'],
        reponse: 'La boutique est à ACI 2000, Bamako. Horaires : lundi – vendredi 9h – 19h, samedi 9h – 18h, dimanche sur rendez-vous.',
        action: 'contact',
      },
      {
        id: 'paiement',
        question: 'Quels moyens de paiement ?',
        mots: ['paiement', 'payer', 'orange', 'moov', 'virement', 'especes', 'espèces', 'mobile money', 'carte'],
        reponse: 'Espèces, Orange Money, Moov Money et virement. Le paiement se fait à la remise, en boutique ou à la livraison.',
        action: null,
      },
      {
        id: 'stock',
        question: 'L’article est-il en stock ?',
        mots: ['stock', 'disponible', 'disponibilite', 'disponibilité', 'reserve', 'réservation', 'commande', 'arrivage'],
        reponse:
          'Chaque fiche indique « Disponible en boutique » ou « Sur commande ». Le stock du jour et la date d’arrivage se confirment sur WhatsApp en quelques minutes.',
        action: 'whatsapp',
      },
      {
        id: 'catalogue',
        question: 'Que vendez-vous ?',
        mots: ['vends', 'vend', 'proposez', 'montre', 'tablet', 'ordinateur', 'telephone', 'téléphone', 'accessoire', 'ecouteur', 'casque', 'chargeur'],
        reponse: 'Smartphones, tablettes, ordinateurs portables, accessoires, audio et montres connectées — Apple, Samsung, HP, Lenovo, Dell, Xiaomi, Tecno, Infinix, JBL, Sony et d’autres.',
        action: 'catalogue',
      },
      {
        id: 'compte',
        question: 'Faut-il créer un compte ?',
        mots: ['compte', 'inscription', 'connecter', 'mot de passe', 'panier', 'commander', 'comment commander'],
        reponse:
          'Aucun compte à créer : vous ajoutez les modèles à votre demande, vous l’envoyez sur WhatsApp en un bouton, et la boutique répond avec le prix du jour.',
        action: 'catalogue',
      },
      {
        id: 'horaires',
        question: 'Quels sont les horaires ?',
        mots: ['horaire', 'ouvert', 'ferme', 'fermé', 'heure', 'temps', 'dimanche', 'samedi'],
        reponse: 'Lundi – vendredi 9h – 19h, samedi 9h – 18h, dimanche sur rendez-vous par WhatsApp.',
        action: 'contact',
      },
      {
        id: 'appeler',
        question: 'Je préfère appeler.',
        mots: ['appel', 'appeler', 'telephone', 'téléphoner', 'numero', 'numéro', 'joindre', 'contact'],
        reponse: 'Vous pouvez appeler le +223 77 77 77 00 ou le +223 95 21 21 21. WhatsApp reste le plus rapide pour avoir une réponse écrite.',
        action: 'appel',
      },
      {
        id: 'humain',
        question: 'Parler à la boutique',
        mots: ['humain', 'personne', 'parler', 'discuter', 'conseiller', 'vendeur', 'aide', 'problem', 'problème'],
        reponse: 'La boutique répond directement sur WhatsApp au 77 77 77 00, avec le prix du jour et la disponibilité.',
        action: 'whatsapp',
      },
    ],
    inconnu:
      'Je n’ai pas de réponse écrite à cette question dans les informations de la boutique. Le plus sûr est de l’envoyer telle quelle sur WhatsApp : la boutique répond avec le prix du jour.',
  },

  /* ---------------------------------------------------------------------------
   * Back-office — admin.html. Le code est une simple porte locale : le site
   * n’a aucun serveur, il n’y a donc rien à protéger sur Internet. À modifier
   * avant de publier le dossier quelque part.
   * ------------------------------------------------------------------------- */
  admin: {
    code: 'electro21',
    aide: 'Ce code ne fait qu’écarter les modifications par hasard : le site est statique, sans serveur.',
  },
};

/* ---------------------------------------------------------------------------
 * Aperçu du back-office.
 * admin.html enregistre ses modifications en brouillon dans le navigateur, puis
 * affiche le site dans « index.html?apercu=1 ». Cette seule ligne de code fait
 * que l'aperçu montre le brouillon au lieu du fichier : rien d'autre ne change,
 * et la visite normale (sans « ?apercu=1 ») lit toujours ce fichier tel quel.
 * ------------------------------------------------------------------------- */
(function (D) {
  try {
    if (location.search.indexOf('apercu=1') === -1) return;
    const brut = localStorage.getItem('electro21.admin.v1');
    if (!brut) return;
    const brouillon = JSON.parse(brut);
    if (!brouillon || !brouillon.boutique || !Array.isArray(brouillon.produits)) return;
    Object.keys(brouillon).forEach((cle) => {
      if (cle !== 'admin') D[cle] = brouillon[cle];
    });
    document.documentElement.dataset.apercu = '1';
  } catch (e) {
    /* stockage indisponible ou brouillon illisible : l'aperçu montre le fichier publié */
  }
})(window.ELECTRO21);

