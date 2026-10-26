# Electro 21 — site de vente

Site de la boutique **Electro 21** (téléphones, ordinateurs, tablettes, accessoires), à ACI 2000, Bamako. Le client parcourt le catalogue, compose sa demande, puis l'envoie préremplie sur **WhatsApp au 77 77 77 00** : aucun compte, aucun paiement en ligne, aucun serveur à maintenir. **Le catalogue n'affiche aucun prix** — la boutique annonce le prix du jour dans la conversation (voir [Prix](#prix--le-catalogue-nen-affiche-aucun)).

Le même dossier donne **deux versions** : le site complet sur ordinateur, et une application installable sur téléphone (Android et iPhone) avec barre d'onglets et fonctionnement hors connexion. Voir [Deux versions](#deux-versions).

Tenir la boutique ne demande pas de savoir coder : [admin.html](admin.html) est le back-office du site, une page locale qui remplit le catalogue et régénère `js/data.js`. Voir [Back-office local](#back-office-local--adminhtml).

## Ouvrir le site

Aucune installation, aucun build.

```bash
# le plus simple : double-clic sur index.html
# ou, pour tester comme en ligne :
cd /Users/fode/Projets/electro21
python3 -m http.server 8090     # http://127.0.0.1:8090
```

## Ce que fait le site

- Catalogue avec recherche sans distinction d'accents (`ordenateur` ne trouve rien, `ordinateur` trouve les PC), tri (plus vendus, nouveautés, note), filtre par rayon et disponibilité. **Aucun prix affiché** : chaque article porte la mention « Prix sur demande » et le devis se fait sur WhatsApp.
- Adresse partageable pour chaque état : `#/catalogue?cat=audio&tri=prix_croissant`, `#/produit/iphone-17-128-go`. Le bouton retour du navigateur fonctionne.
- Fiche produit avec caractéristiques, disponibilité, note et trois boutons : ajouter à la demande, prix sur WhatsApp, appeler.
- Panier persistant (mémoire du navigateur), quantités, nom et quartier du client, puis message de devis prêt à envoyer.
- Boutiques, horaires, statut ouvert/fermé calculé sur l'heure de Bamako (UTC+0), lien Google Maps, lien vers la page Facebook.
- Rubrique **Réalisations** : les arrivages, vitrines et annonces repris de la page Facebook, chacun relié au produit concerné (`realisations` de [js/data.js](js/data.js)).
- Rubrique **Partenaires** : moyens de paiement acceptés au comptoir, service de livraison, page Facebook, et la liste des **marques en boutique** calculée depuis le catalogue (un clic sur une marque filtre le catalogue).
- **Assistant** (bouton « Une question ? ») : réponses locales à des questions simples — prix, livraison, garantie, paiement, horaires. Aucun service extérieur, aucun modèle de langage : les réponses viennent des questions écrites dans `assistant` de [js/data.js](js/data.js). Pour un prix ferme, l'assistant renvoie vers WhatsApp.
- **Codes QR** : celui de la fiche produit, affiché sur la fiche et à imprimer pour le comptoir, et celui de l'adresse du site, affiché dans le rayon Contact. Voir [Codes QR](#codes-qr-pour-le-comptoir).
- Identité visuelle reprise de la page Facebook : logo réel dans l'en-tête, bannière et photo du comptoir en haut de l'accueil, icônes d'application construites depuis le logo. Les appareils sans photo restent dessinés en SVG, le site s'affiche donc même sans image.
- Catalogue, panier et fiches produits ouverts **hors connexion**, une fois l'application installée : l'envoi WhatsApp part dès que le réseau revient.

## Deux versions

Un seul code, deux présentations, choisies automatiquement selon la largeur de l'écran (`css/style.css`, section 14).

**Site ordinateur** (à partir de 901 px) : page unique, tous les rayons défilent, panier dans un tiroir latéral.

**Application téléphone** (900 px et moins) : quatre vues pleine écran reliées par une barre d'onglets en bas — Accueil, Catalogue, Rayons, Ma demande. La fiche produit et la demande de prix occupent tout l'écran, l'en-tête se replie, et le bouton WhatsApp flottant ne garde que son icône pour ne rien masquer. Les marges tiennent compte de l'encoche et de la barre de gestes (`viewport-fit=cover`, `env(safe-area-inset-*)`).

**Largeurs contrôlées** : la mise en page a été mesurée de 320 à 1440 px, sans débordement horizontal. Entre 431 et 900 px (tablette), trois plafonds évitent aux blocs de s'étaler sur tout l'écran : la vitrine de la herse tient sur 460 px, le texte de la fiche sur 640 px, le tiroir « Ma demande » sur 430 px.

### Installer l'application

Il faut servir le dossier en HTTPS (ou en `http://localhost` pour tester) : l'installation et le mode hors connexion ne fonctionnent pas en `file://`.

- **Android (Chrome)** : menu ⋮ → « Installer l'application », ou le bandeau « Installer » qui apparaît en bas de l'écran. L'icône et le nom viennent de `manifest.webmanifest`, l'application s'ouvre sans barre d'adresse.
- **iPhone (Safari)** : bouton Partager → « Sur l'écran d'accueil ». Le site affiche la consigne si le bouton d'installation automatique manque ; iOS n'a pas d'installation en un clic.
- Trois raccourcis longue pression sur l'icône mènent directement au Catalogue, aux Rayons et à Ma demande.

### Comment ça tient

- `manifest.webmanifest` : nom, icônes (192, 512, maskable pour Android, `apple-touch-icon` pour iOS), couleurs, raccourcis.
- `sw.js` : met la page, les styles, les scripts et les icônes en cache, sert la copie locale quand le réseau manque, et affiche `hors-ligne.html` en dernier recours. Les photos déposées dans `assets/produits/` sont mises en cache au fur et à mesure, dans la limite de 80 fichiers.
- Les fichiers de la coquille sont demandés **au réseau d'abord** : un prix corrigé dans `js/data.js` est visible dès la recharge suivante sur les téléphones qui ont du réseau. `NUMERO_VERSION` n'est à changer que si la liste `COQUILLE` change (nouveau fichier à precacher) ou pour forcer une purge des caches.

## Back-office local — [admin.html](admin.html)

Pour tenir le catalogue sans ouvrir un fichier de code. Le back-office est une page du site, pas un service : il n'y a rien à installer, rien à héberger de plus, et aucune donnée ne quitte l'ordinateur.

Ouvrir `admin.html` (double-clic, ou `http://127.0.0.1:8090/admin.html`), taper le code d'accueil — `electro21` par défaut, dans `admin.code` de [js/data.js](js/data.js) — puis travailler rubrique par rubrique : Boutique, Produits, Rayons, Réalisations, Partenaires, Assistant, Réglages.

Le lien d'entrée est au pied de toutes les pages, rappelé dans la carte Contact du rayon « La boutique » (accessible depuis l'onglet Rayons sur téléphone), et sur la planche [etiquettes.html](etiquettes.html). Dans l'autre sens, le back-office renvoie vers le site et vers la planche d'étiquettes.

Ce que la page fait :

- elle copie les données de `js/data.js` dans un **brouillon** gardé dans le navigateur (`localStorage`), et l'on peut fermer la page, reprendre le lendemain ;
- l'aperçu à droite montre le site réel avec le brouillon (`index.html?apercu=1`), en largeur téléphone 390 px, tablette 768 px ou ordinateur 1100 px ;
- les boutons **monter / descendre / dupliquer / supprimer** réordonnent les produits, et un tri par prix est proposé quand les prix sont remplis ;
- **Contrôles** signale les oublis qui casseraient le site : identifiants en double, rayon inconnu, chemin de photo faux, numéro WhatsApp non numérique, lien de réalisation qui ne pointe sur aucun produit ;
- « **Enregistrer js/data.js** » télécharge le fichier complet. On le dépose sur `js/data.js`, et le site change. C'est la fin du travail : le brouillon du navigateur ne se publie pas tout seul.

Trois limites à connaître :

1. **Le code d'accueil n'est pas une protection.** C'est une porte locale qui écarte les gestes par hasard. Le fichier `js/data.js` reste lisible par tout le monde, comme sur n'importe quel site statique : ne pas y écrire de secret.
2. L'aperçu est servi depuis le **même navigateur**. Un brouillon commencé sur un poste ne se retrouve pas sur un autre ; le seul document qui compte est le `js/data.js` enregistré.
3. Le statut « ouvert / fermé » de la page d'accueil est calculé par une règle fixe dans `js/app.js` (9 h–19 h en semaine, 9 h–18 h le samedi). Changer les horaires affichés dans le back-office ne change pas ce calcul.

## Codes QR pour le comptoir

Trois usages, tous produits par `js/qr.js` (encodeur écrit pour le projet, sans dépendance) :

- sur chaque **fiche produit**, un QR qui rouvre cette fiche ;
- dans le rayon **Contact**, un QR qui ouvre le site ;
- sur [etiquettes.html](etiquettes.html), **une planche de toutes les étiquettes** à imprimer pour les vitrines : nom de la marque, nom de l'article, mention « Prix sur demande » et QR de la fiche. Le bouton « Imprimer la planche » ouvre l'impression du navigateur, mise en page en trois colonnes.

Un QR encode une adresse, il faut donc que le site ait une adresse. Le champ `boutique.urlSite` de [js/data.js](js/data.js) porte cette adresse ; tant qu'il est vide, les QR ne peuvent pas être générés et les emplacements concernés affichent « Renseignez l'adresse du site dans le back-office (rayon Boutique) ». Après une mise en ligne, remplir `urlSite` avec l'adresse publique — par exemple `https://electro-21.vercel.app` — puis réimprimer la planche.

Le QR d'une fiche est utile **au comptoir** : le client scanne, la fiche s'ouvre sur son téléphone, et il peut la montrer au vendeur ou la garder.

## Tenir la boutique à jour

Tout se passe dans [js/data.js](js/data.js) — par le [back-office](#back-office-local--adminhtml), qui le remplit pour vous, ou à la main.

Un produit :

```js
{
  id: 'p22',
  nom: 'Google Pixel 9 128 Go',
  marque: 'Google',
  categorie: 'smartphones',          // un id de la liste categories
  prix: null,                        // le catalogue est sans prix ; un nombre = prix affiché en FCFA
  prixBarre: null,                   // ou null si pas de promotion
  visuel: 'phone',                   // phone, tablet, laptop, monitor, earbuds,
                                     // charger, battery, sdcard, speaker, headphone, watch
  photo: 'pixel-9.jpg',              // optionnel : voir ci-dessous
  stock: 'en-stock',                 // en-stock | stock-faible | sur-commande
  note: 4.6, avis: 4, vendu: 3,
  badge: 'Nouveauté',                // affiché en haut de la carte, optionnel
  resume: 'Une phrase d'accroche.',
  description: 'Texte de la fiche produit.',
  specs: [{ label: 'Écran', valeur: '6,3"' }],
}
```

Les coordonnées, horaires, moyens de paiement et le rayon affiché dans l'en-tête se changent dans le bloc `boutique` du même fichier. C'est aussi là que se range `urlSite`, l'adresse publique utilisée par les codes QR.

Trois listes s'ajoutent aux produits, toutes trois éditables dans le back-office :

```js
realisations: [{
  id: 'r1',
  type: 'arrivage',                        // arrivage | vitrine | annonce
  titre: 'Arrivage d’HP 14s déballés',
  quand: null,                             // date lue sur le visuel, ou null : ne jamais l'inventer
  texte: 'Deux phrases sur ce qui est passé en boutique.',
  image: 'assets/produits/hp-14s-devant-boite.jpg',   // chemin complet, ou '' pour rester au dessin SVG
  lien: 'hp-14s-full-hd-i3-8-512-go-rose',  // id ou slug du produit concerné, ou null : le lien disparaît
}],

partenaires: [{
  nom: 'Orange Money',
  role: 'Paiement mobile à distance, confirmé sur WhatsApp',
  type: 'paiement',                        // paiement | service | institution
  lien: '',                                // URL éventuelle, affichée en « Ouvrir → »
}],

assistant: {
  ouvert: true,                            // false retire le bouton du site
  titre: 'Une question ?',
  presentation: 'Message d’ouverture de la fenêtre.',
  avertissement: 'Réponses établies à partir des informations publiées par la boutique.',
  suggestions: ['Quel est le prix ?', 'Quelle garantie ?'],   // propositions cliquables
  questions: [{
    id: 'prix',
    question: 'Quel est le prix ?',
    mots: ['prix', 'tarif', 'combien', 'cher', 'devis', 'fcfa'],   // mots recherchés dans la question du visiteur
    reponse: 'Le catalogue n’affiche aucun prix…',
    action: 'whatsapp',                    // '' | whatsapp | appel | catalogue | contact
  }],
  inconnu: 'Réponse quand aucun mot-clé ne correspond, avec un bouton WhatsApp.',
},
```

Les marques affichées dans le rayon Partenaires ne sont pas une liste à part : elles sont comptées depuis `produits[].marque`. Ajouter un produit avec une marque nouvelle fait apparaître la marque.

Le texte de l'assistant est écrit par la boutique, pas par un modèle : l'assistant cherche les mots-clés de la question dans cette liste et répond avec la phrase correspondante, ou renvoie vers WhatsApp quand rien ne correspond.

### Mettre les vraies photos

Déposez les images dans `assets/produits/`, puis ajoutez la clé `photo` au produit :

```js
photo: 'iphone-18-pro-max.jpg',
galerie: ['iphone-18-pro-max-2.jpg'],   // optionnel : autres vues, visibles sur la fiche
```

Sans la clé `photo`, le dessin vectoriel reste affiché. Format conseillé : photo carrée ou 4/3, environ 800 px de large, nommée d'après le produit. Quand `galerie` contient plus d'une image, la fiche affiche des miniatures sous la photo principale (le clic remplace l'image) et la carte porte la mention « N photos ».

Les visuels en place viennent tous des publications de la page Facebook Electro 21 :

| Fichier | Ce que c'est |
| --- | --- |
| `hp-14s-full-hd-i3-rose.jpg` | Photo d'un HP 14s rose de l'arrivage (écran 14" Full HD, i3, 8 Go, 512 Go SSD) |
| `hp-14s-devant-boite.jpg`, `hp-14s-couvercle.jpg`, `hp-14s-filee.jpg` | Trois autres angles du même arrivage, en boutique |
| `samsung-galaxy-watch-ultra-47-mm.jpg` | Photo d'une Samsung Galaxy Watch Ultra 47 mm |
| `samsung-galaxy-watch-ultra-etanche.jpg` | La même montre présentée sous l'eau (l'étanchéité est une promesse de la fiche) |
| `iphone-18.jpg` | Affiche de la boutique annonçant l'iPhone 18 à Bamako |
| `iphone-18-duo-bientot.jpg` | Affiche verticale « Préparation du nouveau iPhone 18 Duo », commandes ouvertes |
| `samsung-galaxy-z-fold-8.jpg` | Affiche de la boutique annonçant le Samsung Galaxy Z Fold 8 |

Les trois affiches sont des visuels texte + rendu publiés par la boutique, pas des photos d'appareil en magasin : elles se lisent moins bien dans une petite carte. Remplacez-les par une vraie photo dès que la page en publie une.

### Logo, couverture et image de partage

Tout est dans `assets/marque/`, repris de la bannière publiée par la boutique :

| Fichier | Usage |
| --- | --- |
| `logo.png` (428 × 140) | En-tête du site, en-tête de l'application, écran « Connexion perdue ». Le mot « Electro 21 » étant déjà dans le logo, le nom n'est plus écrit à côté ; l'attribut `alt` est alimenté par `boutique.nom` dans [js/data.js](js/data.js). |
| `couverture.jpg` (922 × 270) | Bannière « Tout pour l'Électronique · Tél. 20 80 04 00 / 77 77 77 00 », affichée sous la photo de vitrine en haut de l'accueil |
| `vitrine.jpg` (720 × 720) | Photo du comptoir, recadrée en 4/3 dans l'accueil et servant d'image de partage |
| `partage-1200x630.jpg` | `og:image` et capture de `manifest.webmanifest` : la vitrine en haut, le logo et l'adresse en bas |

`assets/icones/` (icônes Android 192 et 512, maskable, `apple-touch-icon`, favicons 16 et 32) est désormais construit à partir du vrai logo, sur fond blanc, et non plus d'un sigle inventé.

Les deux fichiers de marque les plus larges sont des recadrages de la capture d'écran publiée par la boutique : la bannière a été isolée au pixel près en mesurant les lignes colorées de l'image dans un canvas, puis photographiée par Chrome headless à la taille exacte (`922 × 270` et `428 × 140`). Pour refaire la même opération : `sips -g pixelWidth -g pixelHeight fichier.jpg` pour les dimensions, puis un recadrage par `--window-size` avec `--screenshot`.

Pour tirer une photo de la page sans passer par l'enregistrement manuel : dans le navigateur, ouvrir l'image en taille réelle (le lien `…/safe_image.php?d=…`), puis supprimer le paramètre `ctp=` de l'URL du CDN pour obtenir l'original. Redimensionner à 800 px de large maximum — `sips -Z 800 fichier.jpg` — et vérifier qu'aucune image n'est un doublon (`md5 -r *.jpg`).

### Prix : le catalogue n'en affiche aucun

Les prix de démonstration ont été retirés : tous les produits de [js/data.js](js/data.js) portent `prix: null` et `prixBarre: null`. La boutique annonce le prix du jour sur WhatsApp, le site ne peut donc pas se tromper.

Ce que ça change à l'écran :

- carte et fiche : mention « Prix sur demande », plus de prix barré ni de pourcentage de remise ;
- fiche : note expliquant que le prix est communiqué au moment de la commande ;
- filtre **Budget** et options de tri **Prix croissant / Prix décroissant** retirés du bandeau d'outils (la liste `Budget` reste vide et son libellé est masqué, `css/style.css`, règle `.choix[hidden]`) ;
- panier : ligne « Prix à confirmer par la boutique », total « Prix sur demande » ;
- message WhatsApp : chaque article sur sa ligne, puis « Aucun prix affiché au catalogue : merci d'indiquer le prix du jour de chaque article. » — aucun total chiffré, donc aucun « 0 FCFA » trompeur.

Tout est piloté par un seul drapeau, `PRIX_AFFICHES` dans [js/app.js](js/app.js) : il est faux tant qu'aucun produit n'a de prix. **Pour réafficher des prix**, remets un nombre dans `prix` (et `prixBarre` pour une promotion) sur au moins un produit : le filtre Budget, les deux tris par prix, le total du panier et le « Total indicatif » du message reviennent d'eux-mêmes, avec les articles sans prix qui restent en « Prix sur demande ». Les liens déjà partagés avec `?tri=prix_croissant` ou `?max=…` retombent sur le tri par défaut au lieu de vider le catalogue.

Le champ `devise` du bloc `boutique` ne sert plus qu'à l'affichage éventuel des prix ; la mention « prix en boutique ou devis immédiat sur WhatsApp » de la description de partage reste exacte.

## Fichiers

```
index.html              structure de la page
admin.html              back-office local (brouillon + aperçu + export de data.js)
etiquettes.html         planche d'étiquettes QR à imprimer pour le comptoir
css/style.css           mise en page et thème (couleurs dans :root),
                        version téléphone en section 14
css/admin.css           styles du back-office, indépendants du site
js/data.js              coordonnées, rayons, produits, réalisations, partenaires, assistant   ← à éditer souvent
js/visuels.js           dessins SVG des appareils
js/qr.js                encodeur de code QR (sans dépendance)
js/app.js               recherche, filtres, fiche, panier, vues mobiles, réalisations, partenaires, QR, message WhatsApp
js/chatbot.js           assistant : recherche par mots-clés dans js/data.js, aucune connexion
js/admin.js             formulaires, brouillon, aperçu et export du back-office
manifest.webmanifest    nom, icônes et raccourcis de l'application installée
sw.js                   mode hors connexion
hors-ligne.html         écran affiché si rien n'est en cache
assets/icones/          icônes Android et iOS, favicons (construits depuis le logo)
assets/marque/          logo, bannière de couverture, photo de vitrine, image de partage
assets/produits/        photos réelles de la page Facebook, avec galerie par produit
```

## Publier

Le dossier est statique : il se dépose tel quel sur n'importe quel hébergeur. Aucun secret, aucune base de données, aucun build. Deux points pour la version installable : il faut du **HTTPS** (les hébergeurs le donnent gratuitement), et `sw.js` doit rester à la racine du dossier pour couvrir tout le site.

### Sur Vercel

Deux chemins, selon ce que l'on veut garder.

**Le plus simple — import depuis GitHub.** Le dépôt est public ; Vercel le relie et redéploie à chaque `git push` :

```bash
# une seule fois, depuis le dépôt
vercel link            # choisir « Import » le dépôt electro21
vercel --prod
```

Sinon, depuis le site : **Add New… → Project → Import** le dépôt `electro21`, framework « Other », puis laisser *Root Directory*, *Build Command* et *Output Directory* vides — il n'y a rien à construire. Le domaine proposé, `electro21.vercel.app`, est immédiat.

**Sans dépôt — publication directe**, depuis le dossier :

```bash
npm i -g vercel
vercel login
vercel --prod          # première fois : répondre « No » à l'interrogation sur le projet, le nom par défaut convient
```

### Après la mise en ligne

Dans le back-office, rayon **Boutique**, remplir `urlSite` avec l'adresse publique (par exemple `https://electro21.vercel.app`), puis « Enregistrer js/data.js » et remplacer le fichier. Sans cette adresse, les codes QR ne peuvent pas être générés. C'est aussi le moment de passer `og:image` en URL absolue dans `index.html`, sinon Facebook ne charge pas l'image de partage depuis un chemin relatif.

Le back-office et la planche d'étiquettes sont publiés avec le reste du site. `admin.html` ne protège rien : le code d'accueil est une porte locale, et le fichier `js/data.js` reste téléchargeable par qui connaît l'adresse. Si cela gêne, retirer `admin.html` et `js/admin.js` de la publication — le site s'en passe, et le back-office continue de fonctionner en local.

### Mettre à jour

`git push` suffit si le dépôt est relié à Vercel ; sinon `vercel --prod` depuis le dossier. Sur les téléphones déjà installés, les fichiers de la coquille sont demandés au réseau d'abord : la correction est visible à la recharge suivante, et reste lisible hors connexion ensuite.
