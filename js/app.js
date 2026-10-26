/*
 * Electro 21 — interface de la boutique
 * Aucune dépendance, aucun bundlers : le site s'ouvre tel quel (file://) ou se
 * sert avec n'importe quel serveur statique. Les données viennent de js/data.js
 * et les dessins de js/visuels.js.
 */
(function () {
  const D = window.ELECTRO21;
  const V = window.ELECTRO21Visuel;
  if (!D || !V) {
    document.body.innerHTML =
      '<p style="padding:30px;font-family:sans-serif">Impossible de charger les données de la boutique (js/data.js et js/visuels.js sont-ils bien présents).</p>';
    return;
  }

  const B = D.boutique;
  const PRODUITS = D.produits;
  const CATEGORIES = D.categories;
  const CLE_PANIER = 'electro21.panier.v1';
  const CLE_CLIENT = 'electro21.client.v1';

  /* ------------------------------------------------------------------ util */

  const formatNb = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });
  /** Un produit sans prix affiché (prix: null) se lit « Prix sur demande ». */
  const aUnPrix = (p) => typeof p.prix === 'number' && isFinite(p.prix);
  const prix = (n) => (typeof n === 'number' && isFinite(n) ? formatNb.format(n) + ' ' + B.devise : 'Prix sur demande');
  /** Faux tant qu'aucun produit du catalogue n'affiche de prix : les commandes
   *  liées au prix (Budget, tris par prix) sont alors retirées de l'écran. */
  const PRIX_AFFICHES = PRODUITS.some(aUnPrix);
  /** Toutes les photos d'un produit : la principale, puis celles de la galerie. */
  const photosDe = (p) => [p.photo].concat(p.galerie || []).filter(Boolean);
  const urlPhoto = (f) => 'assets/produits/' + encodeURIComponent(f);
  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function sansAccent(txt) {
    return String(txt)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function echapper(txt) {
    return String(txt).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  /** Identifiant stable utilisé pour les liens partageables et les photos. */
  PRODUITS.forEach((p) => {
    p.slug = p.slug || sansAccent(p.nom).replace(/ /g, '-');
    p._recherche = sansAccent([p.nom, p.marque, p.resume, Categorie(p.categorie), p.description].join(' '));
    p._categorie = Categorie(p.categorie);
  });

  function Categorie(id) {
    const c = CATEGORIES.find((x) => x.id === id);
    return c ? c.label : 'Autres';
  }
  const produit = (id) => PRODUITS.find((p) => p.id === id || p.slug === id);

  /* -------------------------------------------------------------- boutiques */

  /* La boutique peut avoir plusieurs points de vente : `boutique.boutiques` dans
     data.js. Les anciens champs singularisés (`adresse`, `quartier`) restent lus,
     pour qu'un fichier de données non mis à jour continue de s'afficher. */
  function boutiques() {
    if (Array.isArray(B.boutiques) && B.boutiques.length) return B.boutiques;
    if (B.adresse) return [{ id: 'unique', nom: B.nom, adresse: B.adresse, quartier: B.quartier || B.adresse }];
    return [];
  }
  /** Adresses complètes, dans l'ordre déclaré. */
  function adresses() {
    return boutiques().map((b) => b.adresse);
  }
  /** Quartiers seuls, pour les lignes courtes (en-tête, pied, badge). */
  function quartiers() {
    return boutiques().map((b) => b.quartier || b.adresse);
  }
  /** Lien Google Maps d'un point de vente : nom de la boutique + quartier + ville. */
  function lienMaps(b) {
    return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(B.nom + ' ' + (b.quartier || b.adresse) + ' ' + B.ville);
  }
  /** « ACI 2000 et Bamako Coura », sans virgule entre deux éléments. Une seule adresse se passe de liaison. */
  function enumerer(liste) {
    if (!liste.length) return '';
    if (liste.length === 1) return liste[0];
    if (liste.length === 2) return liste[0] + ' et ' + liste[1];
    return liste.slice(0, -1).join(', ') + ' et ' + liste[liste.length - 1];
  }
  /** Le quartier du premier point de vente, pour les phrases qui n'admettent qu'un lieu. */
  const quartierPrincipal = () => quartiers()[0] || '';

  function etoiles(note) {
    const plein = Math.max(0, Math.min(5, Math.round(note)));
    return '<span class="etoiles" aria-hidden="true">' + '★'.repeat(plein) + '☆'.repeat(5 - plein) + '</span>';
  }

  const ETATS = {
    'en-stock': { court: 'En stock', long: 'Disponible en boutique', classe: '' },
    'stock-faible': { court: 'Derniers pièces', long: 'Il reste peu d’exemplaires en vitrine', classe: 'etat-stock--faible' },
    'sur-commande': { court: 'Sur commande', long: 'Livré sous 5 à 7 jours après commande', classe: 'etat-stock--commande' },
  };
  const etat = (code) => ETATS[code] || ETATS['en-stock'];

  /* ------------------------------------------------------------------ état */

  const etatVue = {
    vue: 'accueil',
    recherche: '',
    categorie: 'toutes',
    tri: 'populaires',
    prixMax: 0,
    dispo: 'tous',
    panier: [],
    client: { nom: '', quartier: '', message: '' },
  };

  function chargerLocal() {
    try {
      const p = JSON.parse(localStorage.getItem(CLE_PANIER) || '[]');
      if (Array.isArray(p)) {
        etatVue.panier = p.filter((l) => produit(l.id) && l.qte > 0);
      }
      const c = JSON.parse(localStorage.getItem(CLE_CLIENT) || 'null');
      if (c && typeof c === 'object') Object.assign(etatVue.client, c);
    } catch (e) {
      /* stockage indisponible (navigation privée, file:// bloqué) : le panier
         reste en mémoire pour la visite en cours. */
    }
  }
  function sauverLocal() {
    try {
      localStorage.setItem(CLE_PANIER, JSON.stringify(etatVue.panier));
      localStorage.setItem(CLE_CLIENT, JSON.stringify(etatVue.client));
    } catch (e) {
      /* ignoré volontairement */
    }
  }

  /* ------------------------------------------------------- coquille mobile */

  const VUES = ['accueil', 'catalogue', 'rayons', 'demande'];
  const mobile = () => window.matchMedia('(max-width: 900px)').matches;
  let basculeEnCours = false;

  function allerVue(vue, options) {
    if (VUES.indexOf(vue) === -1) vue = 'accueil';
    etatVue.vue = vue;
    document.body.dataset.vue = vue;
    $$('.onglet').forEach((b) => {
      if (b.dataset.vue === vue) b.setAttribute('aria-current', 'page');
      else b.removeAttribute('aria-current');
    });
    basculeEnCours = true;
    if (vue === 'demande') ouvrirTiroir();
    else fermerTiroir();
    basculeEnCours = false;
    if (vue !== 'demande' && (options || {}).sansScroll !== true) window.scrollTo({ top: 0, behavior: 'auto' });
    ecrireHash();
  }

  /* -------------------------------------------------------------- routing */

  const TRIES = {
    populaires: (a, b) => b.vendu - a.vendu,
    nouveaux: (a, b) => PRODUITS.indexOf(b) - PRODUITS.indexOf(a),
    prix_croissant: (a, b) => (aUnPrix(a) ? a.prix : Infinity) - (aUnPrix(b) ? b.prix : Infinity),
    prix_decroissant: (a, b) => (aUnPrix(b) ? b.prix : -1) - (aUnPrix(a) ? a.prix : -1),
    note: (a, b) => b.note - a.note || b.avis - a.avis,
  };

  function lireHash() {
    const h = location.hash.replace(/^#\/?/, '');
    if (!h) return null;
    const [chemin, requete] = h.split('?');
    const params = new URLSearchParams(requete || '');
    const morceaux = chemin.split('/').filter(Boolean);
    return { morceaux, params };
  }

  /** Écrire dans l'adresse sans jamais bloquer : en file://, pushState est refusé. */
  function definirHash(cible, enAjoutant) {
    if (location.hash === cible) return;
    try {
      if (enAjoutant) history.pushState(null, '', cible);
      else history.replaceState(null, '', cible);
      return;
    } catch (e) {
      /* Chrome et Safari interdisent l'historique d'état sur file:// : on garde
         un adresse partageable en écrivant le fragment directement. */
    }
    try {
      location.replace(location.pathname.split('/').pop() + location.search + cible);
    } catch (e2) {
      location.hash = cible;
    }
  }

  function ecrireHash() {
    // Une fiche ouverte garde son adresse partagable : on ne réécrit pas l'URL.
    if (location.hash.indexOf('#/produit/') === 0) return;
    // Sur ordinateur, tout est sur la même page : l'adresse décrit le catalogue.
    if (mobile() && etatVue.vue !== 'catalogue') {
      definirHash('#/' + etatVue.vue, false);
      return;
    }
    const params = new URLSearchParams();
    if (etatVue.recherche) params.set('q', etatVue.recherche);
    if (etatVue.categorie !== 'toutes') params.set('cat', etatVue.categorie);
    if (etatVue.tri !== 'populaires') params.set('tri', etatVue.tri);
    if (etatVue.prixMax) params.set('max', etatVue.prixMax);
    if (etatVue.dispo !== 'tous') params.set('dispo', etatVue.dispo);
    const requete = params.toString();
    definirHash('#/catalogue' + (requete ? '?' + requete : ''), false);
  }

  function appliquerHash() {
    const h = lireHash();
    if (!h) return;
    if (h.morceaux[0] === 'produit' && h.morceaux[1]) {
      ouvrirFiche(h.morceaux[1], false);
      return;
    }
    if (VUES.indexOf(h.morceaux[0]) !== -1) etatVue.vue = h.morceaux[0];
    if (h.morceaux[0] !== 'catalogue') return;
    etatVue.recherche = h.params.get('q') || '';
    etatVue.categorie = h.params.get('cat') || 'toutes';
    const triDemande = h.params.get('tri');
    // Les deux tris par prix sont inopérants sans prix affiché : retour au tri par défaut.
    const triPrix = triDemande === 'prix_croissant' || triDemande === 'prix_decroissant';
    etatVue.tri = TRIES[triDemande] && (PRIX_AFFICHES || !triPrix) ? triDemande : 'populaires';
    // Un lien partagé avec « ?max=… » ne doit pas vider un catalogue sans prix.
    etatVue.prixMax = PRIX_AFFICHES ? Number(h.params.get('max')) || 0 : 0;
    etatVue.dispo = h.params.get('dispo') || 'tous';
    $('#recherche').value = etatVue.recherche;
    $('#tri').value = etatVue.tri;
    if (PRIX_AFFICHES) $('#prixMax').value = String(etatVue.prixMax);
    $('#dispo').value = etatVue.dispo;
  }

  /* ------------------------------------------------------------ catalogue */

  function filtrer() {
    const q = sansAccent(etatVue.recherche);
    const mots = q ? q.split(' ') : [];
    let liste = PRODUITS.filter((p) => {
      if (etatVue.categorie !== 'toutes' && p.categorie !== etatVue.categorie) return false;
      if (etatVue.prixMax && (!aUnPrix(p) || p.prix > etatVue.prixMax)) return false;
      if (etatVue.dispo !== 'tous' && p.stock !== etatVue.dispo) return false;
      return mots.every((m) => p._recherche.indexOf(m) !== -1);
    });
    liste = liste.slice().sort(TRIES[etatVue.tri] || TRIES.populaires);
    return liste;
  }

  function carteProduit(p) {
    const remise = p.prixBarre && aUnPrix(p) ? Math.round((1 - p.prix / p.prixBarre) * 100) : 0;
    const e = etat(p.stock);
    return (
      '<article class="carte" data-id="' + p.id + '">' +
      '<div class="carte__visuel">' +
      visuel(p, 150) +
      (p.badge ? '<span class="carte__coin">' + echapper(p.badge) + '</span>' : p.stock === 'sur-commande' ? '<span class="carte__coin carte__coin--wa">Sur commande</span>' : '') +
      (photosDe(p).length > 1 ? '<span class="carte__nb-photos">' + photosDe(p).length + ' photos</span>' : '') +
      '</div>' +
      '<div class="carte__corps">' +
      '<div class="carte__marque">' + echapper(p.marque) + ' · ' + echapper(p._categorie) + '</div>' +
      '<h3 class="carte__nom"><a href="#/produit/' + p.slug + '" data-fiche="' + p.slug + '">' + echapper(p.nom) + '</a></h3>' +
      '<p class="carte__resume">' + echapper(p.resume) + '</p>' +
      '<div class="carte__note">' + etoiles(p.note) + '<span>' + p.note.toFixed(1) + ' · ' + p.avis + ' avis · ' + p.vendu + ' vendus</span></div>' +
      '<div class="carte__prix"><span class="prix' + (aUnPrix(p) ? '' : ' prix--demande') + '">' + prix(p.prix) + '</span>' +
      (p.prixBarre && aUnPrix(p) ? '<span class="prix-barre">' + prix(p.prixBarre) + '</span><span class="reduction">-' + remise + ' %</span>' : '') +
      '</div>' +
      (e.court === 'En stock' ? '' : '<div><span class="etat-stock ' + e.classe + '">' + e.court + '</span></div>') +
      '</div>' +
      '<div class="carte__actions">' +
      '<button class="btn btn--secondaire" data-ajouter="' + p.id + '">Ajouter</button>' +
      '<a class="btn btn--wa" href="' + lienWa(messageProduit(p)) + '" target="_blank" rel="noopener">Demander le prix</a>' +
      '</div>' +
      '</article>'
    );
  }

  function visuel(p, hauteur) {
    if (p.photo) {
      return (
        '<img src="assets/produits/' + encodeURIComponent(p.photo) + '" alt="' + echapper(p.nom) + '" loading="lazy" ' +
        'onerror="this.replaceWith(Object.assign(document.createElement(\'div\'),{innerHTML:window.ELECTRO21Visuel.visuel(\'' + p.visuel + '\')}))">'
      );
    }
    return '<div style="width:100%;height:' + hauteur + 'px">' + V.visuel(p.visuel) + '</div>';
  }

  function rendreCatalogue() {
    const liste = filtrer();
    const hote = $('#catalogue-grille');
    hote.innerHTML = liste.length ? liste.map(carteProduit).join('') : '';
    $('#catalogue-vide').hidden = liste.length !== 0;
    $('#vide-terme').textContent = etatVue.recherche || Categorie(etatVue.categorie);
    $('#vide-wa').href = lienWa(
      'Bonjour ' + B.nom + ',\n\nJe cherche : ' + (etatVue.recherche || Categorie(etatVue.categorie)) + '. Est-ce disponible et à quel prix ?'
    );
    $('#resultats').textContent =
      liste.length + (liste.length > 1 ? ' produits' : ' produit') + (etatVue.recherche ? ' pour « ' + etatVue.recherche + ' »' : '');
    $$('.categorie').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === etatVue.categorie)));
    ecrireHash();
  }

  function nombreParCategorie(id) {
    return PRODUITS.filter((p) => p.categorie === id).length;
  }

  /* Vitrine d'accueil de l'application : quatre modèles, les plus vendus. */
  function rendreSelection() {
    const hote = $('#selection-grille');
    if (!hote) return;
    hote.innerHTML = PRODUITS.slice()
      .sort(TRIES.populaires)
      .slice(0, 4)
      .map(carteProduit)
      .join('');
  }

  /* ------------------------------------------------------------- fiche */

  function ouvrirFiche(id, mettreAJourHash) {
    const p = produit(id);
    const boite = $('#fiche');
    if (!p || !boite) return;
    const e = etat(p.stock);
    const remise = p.prixBarre && aUnPrix(p) ? Math.round((1 - p.prix / p.prixBarre) * 100) : 0;
    const photos = photosDe(p);
    $('#fiche-contenu').innerHTML =
      '<div class="boite__tete"><button class="fermer" data-fermer-fiche aria-label="Fermer la fiche produit">✕</button></div>' +
      '<div class="fiche">' +
      '<div class="fiche__visuel">' +
      (photos.length
        ? '<img id="fiche-image" src="' + urlPhoto(photos[0]) + '" alt="' + echapper(p.nom) + '">' +
          (photos.length > 1
            ? '<div class="fiche__miniatures" role="group" aria-label="Autres photos de ' + echapper(p.nom) + '">' +
              photos
                .map(
                  (f, i) =>
                    '<button type="button" class="miniature' + (i === 0 ? ' miniature--active' : '') + '" data-photo="' + i + '" data-photo-produit="' + p.id + '" aria-label="Photo ' + (i + 1) + ' sur ' + photos.length + '"><img src="' + urlPhoto(f) + '" alt=""></button>'
                )
                .join('') +
              '</div>'
            : '')
        : V.visuel(p.visuel)) +
      '</div>' +
      '<div class="fiche__corps">' +
      '<div class="etiquette">' + echapper(p.marque) + ' · ' + echapper(p._categorie) + '</div>' +
      '<h2>' + echapper(p.nom) + '</h2>' +
      '<div class="carte__note">' + etoiles(p.note) + '<span>' + p.note.toFixed(1) + '/5 — ' + p.avis + ' avis clients · ' + p.vendu + ' vendus</span></div>' +
      '<div class="fiche__prix"><span class="prix' + (aUnPrix(p) ? '' : ' prix--demande') + '">' + prix(p.prix) + '</span>' +
      (p.prixBarre && aUnPrix(p) ? '<span class="prix-barre">' + prix(p.prixBarre) + '</span><span class="reduction">-' + remise + ' %</span>' : '') +
      '<span class="etat-stock ' + e.classe + '">' + e.long + '</span></div>' +
      (aUnPrix(p) ? '' : '<p class="note-envoi">Le prix de cet article est annoncé par la boutique au moment de la commande : demandez-le sur WhatsApp, la réponse est rapide.</p>') +
      '<p>' + echapper(p.description) + '</p>' +
      '<table class="specs"><caption class="sur-mesure">Caractéristiques</caption>' +
      p.specs.map((s) => '<tr><th scope="row">' + echapper(s.label) + '</th><td>' + echapper(s.valeur) + '</td></tr>').join('') +
      '</table>' +
      '<div class="fiche__actions">' +
      '<button class="btn" data-ajouter="' + p.id + '">Ajouter à la demande</button>' +
      '<a class="btn btn--wa" href="' + lienWa(messageProduit(p)) + '" target="_blank" rel="noopener">Prix sur WhatsApp</a>' +
      '<a class="btn btn--secondaire" href="' + lienTel() + '">Appeler la boutique</a>' +
      '</div>' +
      '<p class="note-envoi">' + echapper(B.devis) + '</p>' +
      (urlFiche(p)
        ? '<div class="fiche__qr">' +
          qr(urlFiche(p), 116, 'Code QR de la fiche ' + p.nom) +
          '<p>Scannez ce code avec l’appareil photo du téléphone pour rouvrir cette fiche, ou montrez-le au vendeur au comptoir.</p>' +
          '</div>'
        : '') +
      '</div></div>';
    boite.hidden = false;
    $('#voile-fiche').classList.add('voile--visible');
    document.body.style.overflow = 'hidden';
    if (mettreAJourHash !== false) definirHash('#/produit/' + p.slug, true);
    const btn = $('#fiche-contenu .btn');
    if (btn) btn.focus();
  }

  function fermerFiche() {
    const boite = $('#fiche');
    if (!boite || boite.hidden) return;
    boite.hidden = true;
    $('#voile-fiche').classList.remove('voile--visible');
    document.body.style.overflow = '';
    if (lireHash() && lireHash().morceaux[0] === 'produit') {
      definirHash('#/catalogue', false);
    }
  }

  /* ------------------------------------------------------------- panier */

  const nbArticles = () => etatVue.panier.reduce((s, l) => s + l.qte, 0);
  /* Le total n'additionne que les articles affichés avec un prix ; les autres
   sont explicitement signalés comme « à confirmer » dans le récapitulatif. */
  const totalPanier = () =>
    etatVue.panier.reduce((s, l) => {
      const p = produit(l.id);
      return aUnPrix(p) ? s + l.qte * p.prix : s;
    }, 0);
  const nbSurDemande = () => etatVue.panier.filter((l) => !aUnPrix(produit(l.id))).length;

  function ajouter(id, qte) {
    const ligne = etatVue.panier.find((l) => l.id === id);
    if (ligne) ligne.qte += qte || 1;
    else etatVue.panier.push({ id: id, qte: qte || 1 });
    sauverLocal();
    rendrePanier();
    fermerFiche();
    ouvrirTiroir();
  }
  function modifierQte(id, delta) {
    const ligne = etatVue.panier.find((l) => l.id === id);
    if (!ligne) return;
    ligne.qte += delta;
    if (ligne.qte <= 0) etatVue.panier = etatVue.panier.filter((l) => l.id !== id);
    sauverLocal();
    rendrePanier();
  }
  function retirer(id) {
    etatVue.panier = etatVue.panier.filter((l) => l.id !== id);
    sauverLocal();
    rendrePanier();
  }

  function rendrePanier() {
    const n = nbArticles();
    const pastille = $('#panier-count');
    pastille.hidden = n === 0;
    pastille.textContent = n;
    const pastilleOnglet = $('#onglet-count');
    if (pastilleOnglet) {
      pastilleOnglet.hidden = n === 0;
      pastilleOnglet.textContent = n;
    }
    $$('#panier-count-2, #panier-total-libelle').forEach((e) => (e.textContent = n + ' article' + (n > 1 ? 's' : '')));
    const corps = $('#panier-lignes');
    if (!etatVue.panier.length) {
      corps.innerHTML = '<div class="vide">Aucun article pour le moment.<br>Ajoutez un produit puis envoyez la demande à ' + echapper(B.nom) + ' sur WhatsApp.</div>';
    } else {
      corps.innerHTML = etatVue.panier
        .map((l) => {
          const p = produit(l.id);
          return (
            '<div class="ligne-panier">' +
            '<div class="ligne-panier__visuel">' + (p.photo ? '<img src="assets/produits/' + encodeURIComponent(p.photo) + '" alt="">' : V.visuel(p.visuel)) + '</div>' +
            '<div><div class="ligne-panier__nom">' + echapper(p.nom) + '</div>' +
            '<div class="ligne-panier__prix">' + (aUnPrix(p) ? prix(p.prix) + ' l’unité' : 'Prix à confirmer par la boutique') + '</div>' +
            '<div class="quantite"><button data-qte="-1" data-id="' + p.id + '" aria-label="Retirer un ' + echapper(p.nom) + '">−</button>' +
            '<span>' + l.qte + '</span>' +
            '<button data-qte="1" data-id="' + p.id + '" aria-label="Ajouter un ' + echapper(p.nom) + '">+</button></div>' +
            '<button class="ligne-panier__retirer" data-retirer="' + p.id + '">Retirer de la demande</button></div>' +
            '<div><div class="ligne-panier__total">' + (aUnPrix(p) ? prix(l.qte * p.prix) : '—') + '</div></div>' +
            '</div>'
          );
        })
        .join('');
    }
    const surDemande = nbSurDemande();
    $('#panier-total').textContent = totalPanier()
      ? prix(totalPanier()) + (surDemande ? ' + ' + surDemande + ' à confirmer' : '')
      : surDemande
        ? 'Prix sur demande'
        : prix(0);
    $('#envoyer-devis').disabled = etatVue.panier.length === 0;
    $('#vider-panier').disabled = etatVue.panier.length === 0;
    $('#nom').value = etatVue.client.nom;
    $('#quartier').value = etatVue.client.quartier;
    $('#message').value = etatVue.client.message;
  }

  function ouvrirTiroir() {
    $('#tiroir').classList.add('tiroir--ouvert');
    $('#voile').classList.add('voile--visible');
    $('#tiroir').setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('#fermer-tiroir').focus(), 120);
  }
  function fermerTiroir() {
    $('#tiroir').classList.remove('tiroir--ouvert');
    $('#voile').classList.remove('voile--visible');
    $('#tiroir').setAttribute('aria-hidden', 'true');
    if ($('#fiche').hidden) document.body.style.overflow = '';
    // Fermer le panier depuis l'onglet « Ma demande » ramène à la vue précédente.
    if (!basculeEnCours && mobile() && etatVue.vue === 'demande') allerVue('accueil');
  }

  /* ------------------------------------------------------ message WhatsApp */

  function lienWa(txt) {
    return 'https://wa.me/' + B.whatsapp + '?text=' + encodeURIComponent(txt);
  }
  function lienTel() {
    return 'tel:' + B.tel[0].replace(/[^0-9+]/g, '');
  }

  function enteteClient() {
    const c = etatVue.client;
    let s = 'Bonjour ' + B.nom + ',\n';
    if (c.nom) s += 'Je suis ' + c.nom + (c.quartier ? ' (' + c.quartier + ', ' + B.ville.split(',')[0] + ')' : '') + '.\n';
    return s;
  }

  function messageProduit(p) {
    return (
      'Bonjour ' + B.nom + ',\n\nJe suis intéressé par ce produit trouvé sur votre site :\n• ' +
      p.nom + ' — ' + prix(p.prix) +
      '\n\nEst-il disponible et quel est votre meilleur prix ?\nLivraison possible à ' + B.ville + ' ?'
    );
  }

  function messagePanier() {
    const lignes = etatVue.panier.map((l) => {
      const p = produit(l.id);
      return '• ' + l.qte + ' × ' + p.nom + ' — ' + (aUnPrix(p) ? prix(l.qte * p.prix) : 'prix à confirmer');
    });
    const c = etatVue.client;
    const surDemande = nbSurDemande();
    const total = totalPanier();
    let s = enteteClient() + '\nMerci de me faire un devis pour :\n' + lignes.join('\n');
    // Pas de total quand aucun prix n'est affiché : il ne resterait qu'un « 0 FCFA » trompeur.
    if (total) {
      s += '\n\nTotal indicatif : ' + prix(total);
      if (surDemande) s += ' (hors ' + surDemande + ' article' + (surDemande > 1 ? 's' : '') + ' à prix à confirmer)';
    } else if (surDemande) {
      s += '\n\nAucun prix affiché au catalogue : merci d’indiquer le prix du jour de chaque article.';
    }
    if (c.message) s += '\nNote : ' + c.message;
    s += '\n\nPréférence de paiement : ' + B.moyensPaiement.join(', ') + '.';
    return s;
  }

  function envoyerDevis() {
    if (!etatVue.panier.length) return;
    window.open(lienWa(messagePanier()), '_blank', 'noopener');
  }

  /* ----------------------------------------------------------- rendu page */

  function rendreTexteStatique() {
    document.title = B.nom + ' — ' + B.signature + ' à ' + B.ville;
    // Le nom de la boutique est porté par le logo : l'attribut alt suit data.js.
    const logo = $('.marque__logo');
    if (logo) logo.alt = B.nom;
    $('#marque-base').textContent = (boutiques().length > 1 ? boutiques().length + ' boutiques' : quartierPrincipal()) + ' · ' + B.ville;
    const villeCourte = B.ville.split(',')[0];
    $('#hero-etiquette').textContent =
      (boutiques().length > 1 ? boutiques().length + ' boutiques à ' + villeCourte : 'Boutique à ' + villeCourte) + ' · ' + enumerer(quartiers());
    $('#hero-titre').innerHTML = echapper(B.nom) + '<br><span style="color:var(--accent)">' + echapper(B.signature) + '</span>';
    $('#hero-texte').textContent = B.description;
    $('#hero-wa').href = lienWa('Bonjour ' + B.nom + ', je souhaite des informations.');
    $('#hero-tel').href = lienTel();
    $('#hero-tel').textContent = 'Appeler ' + B.tel[0];
    $('#hero-adresse').textContent = enumerer(quartiers()) + ', ' + B.ville.split(',')[0];

    $('#stat-produits').textContent = PRODUITS.length;
    $('#stat-followers').textContent = '12 K';
    $('#stat-note').textContent = B.note.score.toFixed(1) + ' / 5';
    $('#stat-note-legende').textContent = B.note.recommandation;

    $('#garanties').innerHTML = [
      'Neuf, scellé et facturé',
      'Garantie boutique 6 à 12 mois',
      'Livraison et remise en main propre à ' + B.ville,
      'Paiement : ' + B.moyensPaiement.join(', '),
      'Essayage et test avant achat',
    ]
      .map((g) => '<span class="garantie">' + echapper(g) + '</span>')
      .join('');

    $('#categories').innerHTML = ['<button class="categorie" data-cat="toutes" aria-pressed="true">Tout voir <span class="nombre">' + PRODUITS.length + '</span></button>']
      .concat(
        CATEGORIES.map(
          (c) =>
            '<button class="categorie" data-cat="' + c.id + '" aria-pressed="false">' + echapper(c.label) + ' <span class="nombre">' + nombreParCategorie(c.id) + '</span></button>'
        )
      )
      .join('');

    $('#rayons-grille').innerHTML = CATEGORIES.map((c) => {
      const exemples = PRODUITS.filter((p) => p.categorie === c.id)
        .slice(0, 3)
        .map((p) => p.nom)
        .join(' · ');
      return (
        '<div class="rayon"><h3>' + echapper(c.label) + '</h3><p>' + echapper(exemples) + '</p>' +
        '<a href="#/catalogue?cat=' + c.id + '" data-aller-cat="' + c.id + '">Voir les ' + nombreParCategorie(c.id) + ' produits →</a></div>'
      );
    }).join('');

    // Dessins de la herse, alimentés par js/visuels.js.
    $$('[data-dessin]').forEach((el) => (el.innerHTML = V.visuel(el.dataset.dessin)));

    const heures = B.horaires.map((h) => '<tr><th scope="row">' + echapper(h.jours) + '</th><td>' + echapper(h.heures) + '</td></tr>').join('');
    $('#horaires').innerHTML = heures;
    $('#regle-prix').textContent = PRIX_AFFICHES
      ? ' · prix indicatifs en ' + B.devise + ', confirmés au moment du devis.'
      : ' · aucun prix affiché, le prix du jour est annoncé par la boutique sur WhatsApp.';

    /* Un point de vente = une ligne, avec son itinéraire. L'étiquette se met au
       pluriel dès que la boutique en déclare deux. */
    $('#contact-adresse-etiquette').textContent = boutiques().length > 1 ? 'Boutiques' : 'Adresse';
    $('#contact-adresses').innerHTML = boutiques()
      .map((b) => '<span class="boutique-ligne">' + echapper(b.adresse) + ' <a href="' + echapper(lienMaps(b)) + '" target="_blank" rel="noopener">Google Maps</a></span>')
      .join('');
    $('#contact-tel').innerHTML = B.tel.map((t, i) => '<a href="tel:' + t.replace(/[^0-9+ ]/g, '').replace(/ /g, '') + '">' + echapper(t) + '</a>' + (i < B.tel.length - 1 ? ' · ' : '')).join('');
    $('#contact-mail').href = 'mailto:' + B.email + '?subject=' + encodeURIComponent('Demande de prix — ' + B.nom);
    $('#contact-mail').textContent = B.email;
    $('#contact-wa').href = lienWa('Bonjour ' + B.nom + ',');
    $('#contact-wa-2').href = lienWa('Bonjour ' + B.nom + ', je souhaite un prix.');
    $('#contact-fb').href = B.facebook;
    $('#pied-fb').href = B.facebook;
    $('#pied-mention').textContent = B.nom + ' · ' + enumerer(quartiers()) + ', ' + villeCourte + ' · ' + B.tel.join(' · ');
    $('#flottant-wa').href = lienWa('Bonjour ' + B.nom + ', je souhaite un prix.');
    $('#envoi-note').textContent = 'Le récapitulatif s’ouvre dans WhatsApp, au ' + B.tel[0] + '. Rien n’est envoyé sans que vous validiez le message.';

    /* Catalogue sans prix : rien à trier ni à filtrer par budget, on retire les
       deux commandes plutôt que de laisser des contrôles qui ne font rien. */
    if (!PRIX_AFFICHES) {
      $('#prixMax').closest('.choix').hidden = true;
      $$('option', $('#tri')).forEach((o) => {
        if (o.value === 'prix_croissant' || o.value === 'prix_decroissant') o.hidden = true;
      });
      return;
    }
    const max = Math.max.apply(null, PRODUITS.filter(aUnPrix).map((p) => p.prix));
    const paliers = [50000, 100000, 250000, 500000, 1000000].filter((v) => v < max);
    $('#prixMax').innerHTML =
      '<option value="0">Sans limite</option>' + paliers.map((v) => '<option value="' + v + '">Jusqu’à ' + prix(v) + '</option>').join('');
  }

  function rendreOuverture() {
    // Bamako reste à UTC+0 toute l'année : on lit l'horloge UTC, sans décalage.
    const maintenant = new Date();
    const jour = maintenant.getUTCDay(); // 0 = dimanche
    const h = maintenant.getUTCHours() + maintenant.getUTCMinutes() / 60;
    let ferme;
    if (jour >= 1 && jour <= 5) ferme = h < 9 || h >= 19;
    else if (jour === 6) ferme = h < 9 || h >= 18;
    else ferme = true;
    const el = $('#ouvert');
    el.textContent = ferme ? 'Fermé maintenant · écrivez sur WhatsApp' : 'Ouvert maintenant · ' + enumerer(quartiers());
    el.classList.toggle('ouvert-ferme--ferme', ferme);
  }

  /* -------------------------------------------------- codes QR et vitrines */

  /* L'adresse encodée dans les QR : celle du site publié, telle qu'elle est
     renseignée dans data.js (boutique.urlSite), sinon l'adresse de la page en
     cours. En ouverture locale (file://), aucune adresse n'est partageable :
     aucun code n'est dessiné et l'encart le dit au lieu de mentir. */
  function urlSite() {
    if (B.urlSite) return String(B.urlSite).replace(/\/+$/, '');
    if (location.protocol.indexOf('http') !== 0) return '';
    return location.origin + location.pathname.replace(/[^/]*$/, '');
  }
  const urlFiche = (p) => {
    const base = urlSite();
    return base ? base + '#/produit/' + p.slug : '';
  };

  /** SVG d'un QR, ou le texte qu'on affiche à la place quand rien n'est traçable. */
  function qr(contenu, cote, legende) {
    if (!window.QR) return '<p class="qr-absent">Le module de code QR (js/qr.js) n’est pas chargé.</p>';
    if (!contenu) return '<p class="qr-absent">Renseignez l’adresse du site dans le back-office, rubrique « Boutique » : sans adresse publiée, rien à scanner.</p>';
    try {
      return window.QR.svg(contenu, { taille: cote, titre: legende });
    } catch (e) {
      return '<p class="qr-absent">Contenu trop long pour un code QR.</p>';
    }
  }

  const TYPES_REALISATION = { arrivage: 'Arrivage', vitrine: 'Vitrine', annonce: 'Annonce' };
  const TYPES_PARTENAIRE = { paiement: 'Paiement', service: 'Service', institution: 'Institution' };

  function rendreRealisations() {
    const hote = $('#realisations-grille');
    if (!hote) return;
    const liste = D.realisations || [];
    $('#realisations-note').hidden = liste.length !== 0;
    hote.innerHTML = liste
      .map((r) => {
        const type = TYPES_REALISATION[r.type] || 'Boutique';
        const quand = r.quand ? ' · ' + echapper(r.quand) : '';
        const visuel = r.image
          ? '<img src="' + echapper(r.image) + '" alt="' + echapper(r.titre) + '" loading="lazy" onerror="this.closest(\'.real\').classList.add(\'real--sans-visuel\')" />'
          : '<div class="real__dessin">' + V.visuel('phone') + '</div>';
        const lien =
          r.lien && produit(r.lien)
            ? '<a href="#/produit/' + echapper(produit(r.lien).slug) + '" data-fiche="' + echapper(produit(r.lien).id) + '">Voir la fiche du produit →</a>'
            : '';
        return (
          '<article class="real">' +
          '<div class="real__visuel">' + visuel + '</div>' +
          '<div class="real__corps">' +
          '<div class="real__etiquette">' + echapper(type) + quand + '</div>' +
          '<h3>' + echapper(r.titre) + '</h3>' +
          '<p>' + echapper(r.texte) + '</p>' +
          lien +
          '</div></article>'
        );
      })
      .join('');
  }

  function rendrePartenaires() {
    const hote = $('#partenaires-grille');
    if (!hote) return;
    const liste = D.partenaires || [];
    hote.innerHTML = liste
      .map((x) => {
        const type = TYPES_PARTENAIRE[x.type] || 'Partenaire';
        const lien = x.lien ? '<a href="' + echapper(x.lien) + '" target="_blank" rel="noopener">Ouvrir →</a>' : '';
        return (
          '<div class="partenaire">' +
          '<span class="partenaire__type">' + echapper(type) + '</span>' +
          '<h3>' + echapper(x.nom) + '</h3>' +
          '<p>' + echapper(x.role) + '</p>' +
          lien +
          '</div>'
        );
      })
      .join('');

    /* Les marques viennent du catalogue : rien n'est déclaré sans modèle en rayons. */
    const compte = {};
    PRODUITS.forEach((p) => {
      if (p.marque) compte[p.marque] = (compte[p.marque] || 0) + 1;
    });
    $('#marques-liste').innerHTML = Object.keys(compte)
      .sort((a, b) => compte[b] - compte[a] || a.localeCompare(b, 'fr'))
      .map((m) => '<a class="marque-chip" href="#/catalogue" data-marque="' + echapper(m) + '">' + echapper(m) + ' <span>' + compte[m] + '</span></a>')
      .join('');
  }

  function rendreQrSite() {
    const hote = $('#qr-site');
    if (!hote) return;
    const adresse = urlSite();
    hote.innerHTML = qr(adresse, 168, 'Code QR de l’adresse du site ' + (adresse || B.nom));
    const telecharger = $('#qr-site-telecharger');
    if (telecharger) {
      if (!adresse || !window.QR) {
        telecharger.hidden = true;
      } else {
        const blob = new Blob([window.QR.svg(adresse, { taille: 512, unitaire: true })], { type: 'image/svg+xml' });
        telecharger.href = URL.createObjectURL(blob);
      }
    }
  }

  /* ------------------------------------------------------------- évènements */

  document.addEventListener('click', (ev) => {
    const cible = ev.target;
    if (!cible || !cible.closest) return;
    const t = cible.closest(
      '[data-ajouter],[data-fiche],[data-vue],[data-cat],[data-reset],[data-aller-cat],[data-fermer-fiche],[data-qte],[data-retirer],[data-effacer],[data-panier],[data-photo],[data-marque]'
    );
    if (!t) return;
    if (t.dataset.marque !== undefined) {
      // Une marque de la rubrique Partenaires filtre le catalogue sur ce nom.
      ev.preventDefault();
      etatVue.recherche = t.dataset.marque;
      etatVue.categorie = 'toutes';
      $('#recherche').value = etatVue.recherche;
      if (mobile()) allerVue('catalogue');
      rendreCatalogue();
      allerCatalogue();
      return;
    }
    if (t.dataset.photo !== undefined) {
      // Galerie de la fiche : la miniature cliquée devient l'image principale.
      const photos = photosDe(produit(t.dataset.photoProduit));
      const i = Number(t.dataset.photo);
      const image = $('#fiche-image');
      if (image && photos[i]) {
        image.src = urlPhoto(photos[i]);
        image.alt = produit(t.dataset.photoProduit).nom + ' — photo ' + (i + 1);
        $$('.miniature', image.parentElement).forEach((b) => b.classList.toggle('miniature--active', b === t));
      }
      return;
    }
    if (t.dataset.vue) {
      if (mobile()) {
        ev.preventDefault();
        allerVue(t.dataset.vue);
      } else if (t.tagName !== 'A') {
        allerVue(t.dataset.vue);
      }
      return;
    }
    if (t.dataset.ajouter) {
      ev.preventDefault();
      ajouter(t.dataset.ajouter);
      return;
    }
    if (t.dataset.fiche) {
      ev.preventDefault();
      ouvrirFiche(t.dataset.fiche, true);
      return;
    }
    if (t.dataset.panier !== undefined) {
      ev.preventDefault();
      rendrePanier();
      ouvrirTiroir();
      return;
    }
    if (t.dataset.reset !== undefined) {
      ev.preventDefault();
      etatVue.recherche = '';
      etatVue.categorie = 'toutes';
      etatVue.tri = 'populaires';
      etatVue.prixMax = 0;
      etatVue.dispo = 'tous';
      $('#recherche').value = '';
      $('#tri').value = 'populaires';
      $('#prixMax').value = '0';
      $('#dispo').value = 'tous';
      rendreCatalogue();
      return;
    }
    if (t.dataset.cat) {
      etatVue.categorie = t.dataset.cat;
      rendreCatalogue();
      versCatalogue();
      return;
    }
    if (t.dataset.allerCat) {
      ev.preventDefault();
      etatVue.categorie = t.dataset.allerCat;
      rendreCatalogue();
      versCatalogue();
      return;
    }
    if (t.dataset.fermerFiche !== undefined) fermerFiche();
    if (t.dataset.qte) modifierQte(t.dataset.id, Number(t.dataset.qte));
    if (t.dataset.retirer) retirer(t.dataset.retirer);
    if (t.dataset.effacer !== undefined) {
      etatVue.recherche = '';
      $('#recherche').value = '';
      rendreCatalogue();
      $('#recherche').focus();
    }
  });

  function allerCatalogue() {
    const y = $('#catalogue').getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top: y, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  /* Un filtre appliqué depuis une autre vue doit montrer le résultat. */
  function versCatalogue() {
    if (mobile() && etatVue.vue !== 'catalogue') allerVue('catalogue');
    else allerCatalogue();
  }

  document.addEventListener('input', (ev) => {
    const t = ev.target;
    if (t.id === 'recherche') {
      etatVue.recherche = t.value;
      rendreCatalogue();
    }
    if (t.id === 'nom') etatVue.client.nom = t.value;
    if (t.id === 'quartier') etatVue.client.quartier = t.value;
    if (t.id === 'message') etatVue.client.message = t.value;
    if (t.id === 'nom' || t.id === 'quartier' || t.id === 'message') sauverLocal();
  });

  document.addEventListener('change', (ev) => {
    const t = ev.target;
    if (t.id === 'tri') {
      etatVue.tri = t.value;
      rendreCatalogue();
    }
    if (t.id === 'prixMax') {
      etatVue.prixMax = Number(t.value) || 0;
      rendreCatalogue();
    }
    if (t.id === 'dispo') {
      etatVue.dispo = t.value;
      rendreCatalogue();
    }
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape') {
      if (!$('#fiche').hidden) fermerFiche();
      else fermerTiroir();
    }
    if (ev.key === '/' && document.activeElement !== $('#recherche') && !/input|textarea|select/i.test(document.activeElement.tagName)) {
      ev.preventDefault();
      $('#recherche').focus();
    }
  });

  $('#voile').addEventListener('click', fermerTiroir);
  $('#voile-fiche').addEventListener('click', fermerFiche);
  $('#ouvrir-panier').addEventListener('click', () => {
    rendrePanier();
    ouvrirTiroir();
  });
  $('#fermer-tiroir').addEventListener('click', fermerTiroir);
  $('#envoyer-devis').addEventListener('click', envoyerDevis);
  $('#vider-panier').addEventListener('click', () => {
    etatVue.panier = [];
    sauverLocal();
    rendrePanier();
  });
  $('#recherche').addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') {
      ev.preventDefault();
      versCatalogue();
    }
  });

  window.addEventListener('popstate', () => {
    const h = lireHash();
    if (h && h.morceaux[0] === 'produit') ouvrirFiche(h.morceaux[1], false);
    else {
      fermerFiche();
      appliquerHash();
      rendreCatalogue();
      allerVue(etatVue.vue, { sansScroll: true });
    }
  });

  /* ------------------------------------------------- installation et hors ligne */

  function installerPWA() {
    const bandeau = $('#installer');
    const bouton = $('#installer-btn');
    const consigne = $('#installer-consigne');
    if (!bandeau) return;

    // En mode application déjà lancée depuis l'écran d'accueil : rien à proposer.
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) return;

    let declencheur = null;
    window.addEventListener('beforeinstallprompt', (ev) => {
      ev.preventDefault();
      declencheur = ev;
      bouton.hidden = false;
      consigne.textContent = 'Accès depuis l’écran d’accueil, catalogue consultable hors connexion.';
      bandeau.hidden = false;
    });

    bouton.addEventListener('click', async () => {
      if (!declencheur) return;
      declencheur.prompt();
      const choix = await declencheur.userChoice;
      if (choix && choix.outcome === 'accepted') bandeau.hidden = true;
      declencheur = null;
      bouton.hidden = true;
    });

    // iOS : aucune boîte de dialogue possible, on explique le geste manuel.
    const estIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (estIOS) {
      consigne.textContent = 'Sur iPhone : bouton Partager, puis « Sur l’écran d’accueil ».';
      bandeau.hidden = false;
    }

    $('#installer-fermer').addEventListener('click', () => (bandeau.hidden = true));
  }

  function enregistrerServiceWorker() {
    // Le service worker exige un contexte sûr : http://localhost ou HTTPS.
    if (!('serviceWorker' in navigator) || location.protocol.indexOf('http') !== 0) return;
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('sw.js').catch(() => {
        /* l'installation est un confort, jamais une condition d'affichage */
      });
    });
  }

  /* ------------------------------------------------------------------ boot */

  chargerLocal();
  if (document.documentElement.dataset.apercu === '1') {
    /* Bandeau de l'aperçu du back-office : il doit être évident que ce que l'on
       voit est un brouillon local, pas le site publié. */
    const bandeau = document.createElement('p');
    bandeau.className = 'tag-apercu';
    bandeau.textContent = 'Aperçu du brouillon · back-office';
    document.body.appendChild(bandeau);
  }
  rendreTexteStatique();
  rendreRealisations();
  rendrePartenaires();
  rendreQrSite();
  appliquerHash();
  rendreCatalogue();
  rendreSelection();
  rendrePanier();
  rendreOuverture();
  setInterval(rendreOuverture, 60000);
  allerVue(etatVue.vue, { sansScroll: true });
  installerPWA();
  enregistrerServiceWorker();
  const h = lireHash();
  if (h && h.morceaux[0] === 'catalogue' && !mobile()) setTimeout(allerCatalogue, 60);

  /* ------------------------------------------------------------- API interne */

  /* Ce que js/chatbot.js et admin.html utilisent : le strict nécessaire, sans
     exposer l'état du panier. */
  window.ELECTRO21App = {
    boutique: B,
    boutiques: boutiques,
    adresses: adresses,
    quartiers: quartiers,
    lienMaps: lienMaps,
    enumerer: enumerer,
    produits: PRODUITS,
    produit: produit,
    filtrer: filtrer,
    lienWa: lienWa,
    lienTel: lienTel,
    allerVue: allerVue,
    ajouter: ajouter,
    ouvrirFiche: ouvrirFiche,
    urlSite: urlSite,
    urlFiche: urlFiche,
    mobile: mobile,
    prix: prix,
  };
})();
