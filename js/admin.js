/*
 * Electro 21 — back-office local
 * -----------------------------------------------------------------------------
 * Écran de tenue de la boutique : il modifie une copie des données de js/data.js,
 * garde cette copie dans le navigateur, et montre le site avec ce brouillon.
 * Le travail se termine par « Enregistrer js/data.js » : le fichier téléchargé
 * remplace l'ancien, et le site change sans autre opération.
 *
 * Aucun serveur, aucune dépendance, aucun envoi sur Internet. Le code d'accueil
 * est une porte locale, pas une protection.
 */
(function () {
  const D = window.ELECTRO21;
  if (!D) {
    document.getElementById('porte-aide').textContent = 'Impossible de lire js/data.js : le back-office ne peut pas démarrer.';
    return;
  }

  const CLE_BROUILLON = 'electro21.admin.v1';
  const CLE_PORTES = 'electro21.admin.porte.v1';

  /* ------------------------------------------------------------ données */

  const CLES_SITE = ['boutique', 'categories', 'produits', 'realisations', 'partenaires', 'assistant', 'admin'];

  /** Copie propre des données du fichier, sans les clés internes du back-office. */
  function etatDuFichier() {
    const vide = {};
    CLES_SITE.forEach((c) => {
      if (D[c] !== undefined) vide[c] = JSON.parse(JSON.stringify(D[c]));
    });
    return vide;
  }

  let brouillon = null;
  try {
    const brut = localStorage.getItem(CLE_BROUILLON);
    if (brut) {
      const lu = JSON.parse(brut);
      if (lu && lu.boutique && Array.isArray(lu.produits)) brouillon = lu;
    }
  } catch (e) {
    /* stockage refusé : on repart du fichier, sans bloquer l'ouverture */
  }
  if (!brouillon) brouillon = etatDuFichier();
  /* Le code d'accueil reste celui du fichier : le changer ici serait sans effet
     une fois le back-office fermé, et priverait la boutique de son propre accès. */
  brouillon.admin = D.admin ? JSON.parse(JSON.stringify(D.admin)) : { code: 'electro21', aide: '' };

  const copier = (x) => JSON.parse(JSON.stringify(x));

  function sauver() {
    try {
      localStorage.setItem(CLE_BROUILLON, JSON.stringify(brouillon));
    } catch (e) {
      afficherEtat('Brouillon non enregistré : stockage refusé par le navigateur. Le fichier js/data.js reste la source fiable.');
      return;
    }
    afficherEtat('Brouillon enregistré dans ce navigateur, le ' + new Date().toLocaleString('fr-FR') + '.', true);
    programmerApercu();
  }

  function afficherEtat(txt, avecRechargement) {
    const el = document.getElementById('tete-etat');
    el.textContent = txt;
    el.classList.toggle('est-a-jour', !!avecRechargement);
  }

  /* ---------------------------------------------------------- chemins et valeurs */

  /** Lit une valeur à partir de « produits.3.specs.0.valeur ». */
  function lire(chemin) {
    return chemin.split('.').reduce((o, k) => (o == null ? undefined : o[k]), brouillon);
  }
  function ecrire(chemin, valeur) {
    const morceaux = chemin.split('.');
    const dern = morceaux.pop();
    const cible = morceaux.reduce((o, k) => (o == null ? o : o[k]), brouillon);
    if (cible == null) return;
    cible[dern] = valeur;
  }

  /* --------------------------------------------------------------- formulaire */

  const VISUELS = ['phone', 'tablet', 'laptop', 'earbuds', 'charger', 'speaker', 'watch'];
  const STOCKS = ['en-stock', 'stock-faible', 'sur-commande'];
  const TYPES_REALISATION = ['arrivage', 'vitrine', 'annonce'];
  const TYPES_PARTENAIRE = ['paiement', 'service', 'institution'];
  const ACTIONS_ASSISTANT = [
    { v: '', l: 'Aucun bouton' },
    { v: 'whatsapp', l: 'Écrire à la boutique' },
    { v: 'appel', l: 'Appeler la boutique' },
    { v: 'catalogue', l: 'Ouvrir le catalogue' },
    { v: 'contact', l: 'Adresse et horaires' },
  ];

  const CH = {
    texte: (c, l, a) => ({ c: c, l: l, t: 'texte', a: a }),
    long: (c, l, a) => ({ c: c, l: l, t: 'long', a: a }),
    nombre: (c, l, a) => ({ c: c, l: l, t: 'nombre', a: a }),
    liste: (c, l, a) => ({ c: c, l: l, t: 'liste', a: a }),
    choix: (c, l, options, a) => ({ c: c, l: l, t: 'choix', options: options, a: a }),
    case: (c, l, a) => ({ c: c, l: l, t: 'case', a: a }),
  };

  function slugDe(nom) {
    return String(nom)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
      .replace(/ /g, '-');
  }

  function optionsSel(options, valeur) {
    return options
      .map((o) => {
        const v = typeof o === 'string' ? o : o.v;
        const l = typeof o === 'string' ? o : o.l;
        return '<option value="' + echapper(v) + '"' + (String(valeur) === String(v) ? ' selected' : '') + '>' + echapper(l) + '</option>';
      })
      .join('');
  }

  function echapper(txt) {
    return String(txt == null ? '' : txt).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  /** Un champ, avec son chemin : c'est le seul lien entre le formulaire et le brouillon. */
  function champ(chemin, desc) {
    const v = lire(chemin);
    const aide = desc.a ? '<span class="aide">' + echapper(desc.a) + '</span>' : '';
    const id = 'champ-' + chemin.replace(/\./g, '-');
    if (desc.t === 'long')
      return (
        '<div class="champ">' +
        '<label for="' + id + '">' + echapper(desc.l) + '</label>' + aide +
        '<textarea id="' + id + '" rows="3" data-chemin="' + echapper(chemin) + '" data-type="' + desc.t + '">' + echapper(v) + '</textarea></div>'
      );
    if (desc.t === 'liste')
      return (
        '<div class="champ">' +
        '<label for="' + id + '">' + echapper(desc.l) + '</label>' +
        '<span class="aide" id="aide-' + id + '">' + (desc.a || 'Un élément par ligne.') + '</span>' +
        '<textarea id="' + id + '" rows="4" data-chemin="' + echapper(chemin) + '" data-type="liste">' + echapper((Array.isArray(v) ? v : []).join('\n')) + '</textarea></div>'
      );
    if (desc.t === 'choix')
      return (
        '<div class="champ">' +
        '<label for="' + id + '">' + echapper(desc.l) + '</label>' + aide +
        '<select id="' + id + '" data-chemin="' + echapper(chemin) + '" data-type="choix">' + optionsSel(desc.options, v) + '</select></div>'
      );
    if (desc.t === 'case')
      return (
        '<div class="champ champ--case">' +
        '<label><input type="checkbox" id="' + id + '" data-chemin="' + echapper(chemin) + '" data-type="case"' + (v ? ' checked' : '') + ' /> ' + echapper(desc.l) + '</label>' +
        aide +
        '</div>'
      );
    const genre = desc.t === 'nombre' ? 'number' : 'text';
    return (
      '<div class="champ">' +
      '<label for="' + id + '">' + echapper(desc.l) + '</label>' + aide +
      '<input id="' + id + '" type="' + genre + '" data-chemin="' + echapper(chemin) + '" data-type="' + desc.t + '" value="' + echapper(v == null ? '' : v) + '" /></div>'
    );
  }

  function bloc(chemin, schema, legende) {
    return (
      '<fieldset class="carte-edition">' +
      '<legend>' + legende + '</legend>' +
      '<div class="grille-champs">' +
      schema.map((d) => champ(chemin + '.' + d.c, d)).join('') +
      '</div></fieldset>'
    );
  }

  /** Liste d'objets modifiables : ajouter, dupliquer, supprimer, réordonner. */
  function collection(chemin, schema, libelle, nommer) {
    const liste = lire(chemin) || [];
    return (
      '<div class="collection" data-collection="' + echapper(chemin) + '">' +
      liste
        .map((item, i) => {
          const p = chemin + '.' + i;
          return (
            '<div class="element-edition">' +
            bloc(p, schema, echapper(nommer(item, i))) +
            '<div class="element__actions">' +
            '<button class="lien" type="button" data-mont="' + echapper(p) + '"' + (i === 0 ? ' disabled' : '') + '>Monter</button>' +
            '<button class="lien" type="button" data-descendre="' + echapper(p) + '"' + (i === liste.length - 1 ? ' disabled' : '') + '>Descendre</button>' +
            '<button class="lien" type="button" data-dupliquer="' + echapper(p) + '">Dupliquer</button>' +
            '<button class="lien lien--danger" type="button" data-supprimer="' + echapper(p) + '">Supprimer</button>' +
            '</div></div>'
          );
        })
        .join('') +
      '<button class="bouton" type="button" data-ajouter="' + echapper(chemin) + '">Ajouter un élément</button>' +
      (liste.length === 0 ? '<p class="vide">Rien dans cette liste : le site n’affichera pas la rubrique.</p>' : '') +
      '</div>'
    );
  }

  /** Sous-liste imbriquée (les caractéristiques d'un produit). */
  function sousCollection(chemin, libelle) {
    const liste = lire(chemin) || [];
    return (
      '<div class="collection collection--imbriquee" data-collection="' + echapper(chemin) + '">' +
      '<p class="collection__titre">' + echapper(libelle) + '</p>' +
      liste
        .map((x, i) => {
          const p = chemin + '.' + i;
          return (
            '<div class="ligne-imbriquee">' +
            '<label class="sur-mesure" for="lab-' + echapper(p) + '">Caractéristique ' + (i + 1) + '</label>' +
            '<input id="lab-' + echapper(p) + '" data-chemin="' + echapper(p + '.label') + '" data-type="texte" placeholder="Écran" value="' + echapper(x.label || '') + '" />' +
            '<input data-chemin="' + echapper(p + '.valeur') + '" data-type="texte" placeholder="6,9&#8221; ProMotion" value="' + echapper(x.valeur || '') + '" />' +
            '<button class="lien lien--danger" type="button" data-supprimer="' + echapper(p) + '">Retirer</button>' +
            '</div>'
          );
        })
        .join('') +
      '<button class="lien" type="button" data-ajouter="' + echapper(chemin) + '" data-modele=\'{"label":"","valeur":""}\'>Ajouter une caractéristique</button>' +
      '</div>'
    );
  }

  /* ------------------------------------------------------------- rubriques */

  const SCHEMA_BOUTIQUE = [
    CH.texte('nom', 'Nom'),
    CH.texte('signature', 'Signature'),
    CH.long('description', 'Description affichée en accueil'),
    CH.texte('ville', 'Ville'),
    CH.texte('urlSite', 'Adresse publiée du site', 'Sans slash final, par exemple https://electro21.example — c’est elle que scannent les codes QR.'),
    CH.liste('tel', 'Numéros de téléphone', 'Un numéro par ligne, tel qu’il doit s’afficher.'),
    CH.texte('whatsapp', 'WhatsApp', 'Chiffres seulement, indicatif inclus, sans + ni espace : 22377777700.'),
    CH.texte('email', 'E-mail'),
    CH.texte('facebook', 'Page Facebook'),
    CH.long('devis', 'Accroche de la fiche produit'),
    CH.liste('moyensPaiement', 'Moyens de paiement', 'Un par ligne.'),
    CH.nombre('note.score', 'Note', 'de 0 à 5'),
    CH.nombre('note.avis', 'Nombre d’avis'),
    CH.texte('note.recommandation', 'Recommandation'),
    CH.texte('devise', 'Devise'),
  ];

  const SCHEMA_CATEGORIE = [CH.texte('id', 'Identifiant (rayon)', 'Sert de clé aux produits : ne pas changer sans réaffecter les produits.'), CH.texte('label', 'Nom affiché'), CH.choix('visuel', 'Dessin', VISUELS)];

  /* Un point de vente. La boutique peut en déclarer plusieurs : le site les liste
     tous, avec un lien Maps chacun. Les horaires et les numéros restent communs. */
  const SCHEMA_POINT = [
    CH.texte('id', 'Identifiant', 'Court et sans espace : aci, coura…'),
    CH.texte('nom', 'Nom affiché', 'Par exemple Boutique ACI 2000.'),
    CH.texte('adresse', 'Adresse écrite', 'Telle que la boutique la donne : ACI 2000, Bamako.'),
    CH.texte('quartier', 'Quartier', 'Sert au lien Google Maps et aux lignes courtes.'),
  ];

  const SCHEMA_PRODUIT = [
    CH.texte('id', 'Identifiant'),
    CH.texte('nom', 'Nom du produit'),
    CH.texte('marque', 'Marque'),
    CH.long('resume', 'Résumé (une ligne sur la carte)'),
    CH.long('description', 'Description'),
    CH.texte('badge', 'Coin de la carte', 'Exemple : Nouveauté. Laisser vide pour aucun coin.'),
    CH.texte('photo', 'Photo', 'Nom du fichier dans assets/produits, sans chemin. Vide = dessin.'),
    CH.liste('galerie', 'Autres photos', 'Un nom de fichier par ligne.'),
  ];

  const SCHEMA_REALISATION = [
    CH.texte('id', 'Identifiant'),
    CH.texte('titre', 'Titre'),
    CH.choix('type', 'Type', TYPES_REALISATION),
    CH.texte('quand', 'Date affichée', 'Vide pour aucune date. Ne mettre qu’une date lue sur le visuel.'),
    CH.long('texte', 'Texte'),
    CH.texte('image', 'Image', 'Chemin depuis la racine, par exemple assets/produits/vitrine.jpg.'),
    CH.texte('lien', 'Produit lié', 'Identifiant ou slug d’un produit du catalogue. Vide pour aucun lien.'),
  ];

  const SCHEMA_PARTENAIRE = [CH.texte('nom', 'Nom'), CH.choix('type', 'Type', TYPES_PARTENAIRE), CH.long('role', 'Ce que cela apporte au client'), CH.texte('lien', 'Adresse du service', 'Vide pour aucun lien.')];

  const SCHEMA_QUESTION = [
    CH.texte('id', 'Identifiant'),
    CH.texte('question', 'Question telle qu’elle est posée'),
    CH.liste('mots', 'Mots-clés', 'Un par ligne, sans accent de préférence : c’est ce que l’assistant recherche dans la phrase du client.'),
    CH.long('reponse', 'Réponse'),
    CH.choix('action', 'Bouton proposé', ACTIONS_ASSISTANT),
  ];

  function produitNomme(p, i) {
    return (i + 1) + '. ' + (p && p.nom ? p.nom : p && p.id ? p.id : 'sans nom');
  }

  const RUBRIQUES = {
    boutique: () =>
      bloc('boutique', SCHEMA_BOUTIQUE, 'Coordonnées de la boutique') +
      '<h3>Points de vente</h3>' +
      '<p class="chapeau">Une ligne par boutique ouverte au public. Les horaires, les numéros et WhatsApp restent communs à tous les points de vente.</p>' +
      collection('boutique.boutiques', SCHEMA_POINT, 'Boutique', (x) => x.nom || x.adresse || 'nouvelle boutique') +
      '<h3>Horaires</h3>' +
      collection('boutique.horaires', [CH.texte('jours', 'Jours'), CH.texte('heures', 'Heures')], 'Ligne', (x) => x.jours || 'Horaires'),
    categories: () =>
      '<p class="chapeau">Un rayon = une catégorie du catalogue. Le compteur de produits se lit sur le site, il n’y a rien à saisir.</p>' +
      collection('categories', SCHEMA_CATEGORIE, 'Rayon', (x) => x.label || x.id || 'nouveau rayon'),
    produits: () => ecranProduits(),
    realisations: () =>
      '<p class="chapeau">Les visuels doivent être des photos publiées par la boutique. Rien n’est importé ici : le champ indique le fichier déjà présent dans le dossier <code>assets</code>.</p>' +
      collection('realisations', SCHEMA_REALISATION, 'Réalisation', (x) => x.titre || 'nouvelle réalisation'),
    partenaires: () =>
      '<p class="chapeau">Moyens de paiement, livraison, services. Les marques affichées sous cette rubrique viennent du catalogue : elles se mettent à jour seules.</p>' +
      collection('partenaires', SCHEMA_PARTENAIRE, 'Partenaire', (x) => x.nom || 'nouveau partenaire'),
    assistant: () =>
      bloc('assistant', [CH.case('ouvert', 'Assistant visible sur le site'), CH.texte('titre', 'Titre de la fenêtre'), CH.long('presentation', 'Message d’ouverture'), CH.long('avertissement', 'Avertissement affiché'), CH.liste('suggestions', 'Suggestions', 'Une par ligne.'), CH.long('inconnu', 'Réponse quand rien n’est trouvé')], 'Assistant') +
      '<h3>Questions et réponses</h3>' +
      collection('assistant.questions', SCHEMA_QUESTION, 'Question', (x) => x.question || 'nouvelle question'),
    reglages: () => rubriqueReglages(),
  };

  /* Le produit porte aussi les champs qui ne tiennent pas dans la grille simple. */
  function produitEtendu(i) {
    const p = brouillon.produits[i];
    if (!p) return '';
    const chemin = 'produits.' + i;
    const opts = (brouillon.categories || []).map((c) => ({ v: c.id, l: c.label }));
    return (
      '<div class="grille-champs grille-champs--secondaire">' +
      champ(chemin + '.prix', CH.nombre('prix', 'Prix', 'Vide = prix sur demande.')) +
      champ(chemin + '.prixBarre', CH.nombre('prixBarre', 'Prix barré', 'Vide pour aucun barré.')) +
      champ(chemin + '.stock', CH.choix('stock', 'Disponibilité', STOCKS)) +
      champ(chemin + '.categorie', CH.choix('categorie', 'Rayon', opts)) +
      champ(chemin + '.visuel', CH.choix('visuel', 'Dessin de repli', VISUELS)) +
      champ(chemin + '.note', CH.nombre('note', 'Note')) +
      champ(chemin + '.avis', CH.nombre('avis', 'Avis')) +
      champ(chemin + '.vendu', CH.nombre('vendu', 'Vendus')) +
      '</div>' +
      sousCollection(chemin + '.specs', 'Caractéristiques') +
      '<div class="qr-produit"><p class="collection__titre">Code QR de la fiche</p>' +
      '<div class="qr-produit__ligne">' +
      qrPour(p) +
      '<p class="aide">' +
      echapper(lienFiche(p)) +
      '</p></div></div>'
    );
  }

  function lienFiche(p) {
    const base = brouillon.boutique.urlSite ? String(brouillon.boutique.urlSite).replace(/\/+$/, '') : location.origin + location.pathname.replace(/[^/]*$/, '');
    if (location.protocol.indexOf('http') !== 0 && !brouillon.boutique.urlSite) return 'Adresse du site non renseignée : le QR restait dans la boutique.';
    return base + '#/produit/' + (p.slug || slugDe(p.nom || p.id || ''));
  }

  function qrPour(p) {
    const url = lienFiche(p);
    if (!window.QR || url.indexOf('http') !== 0) return '<p class="vide">Code indisponible.</p>';
    try {
      return window.QR.svg(url, { taille: 84, titre: 'QR de la fiche ' + (p.nom || p.id) });
    } catch (e) {
      return '<p class="vide">Contenu trop long.</p>';
    }
  }

  /* ---------------------------------------------------------- rendu écran */

  const formulaire = document.getElementById('formulaire');
  let rubriqueActive = 'boutique';

  /** La fiche produit complète : champs simples + prix + caractéristiques + QR. */
  function ecranProduits() {
    const liste = brouillon.produits || [];
    const tete =
      '<p class="chapeau">Les prix restent vides tant que la boutique les annonce sur WhatsApp : un champ <em>Prix</em> vide s’affiche « Prix sur demande » sur le site.</p>' +
      '<div class="actions-rapides"><button class="bouton" type="button" data-tri-prix="vider">Vider tous les prix</button>' +
      '<button class="bouton" type="button" data-tri-prix="remettre">Remettre un prix indicatif</button></div>';
    const cartes = liste
      .map((p, i) => {
        const chemin = 'produits.' + i;
        return (
          '<div class="element-edition">' +
          bloc(chemin, SCHEMA_PRODUIT, echapper(produitNomme(p, i))) +
          produitEtendu(i) +
          '<div class="element__actions">' +
          '<button class="lien" type="button" data-mont="' + echapper(chemin) + '"' + (i === 0 ? ' disabled' : '') + '>Monter</button>' +
          '<button class="lien" type="button" data-descendre="' + echapper(chemin) + '"' + (i === liste.length - 1 ? ' disabled' : '') + '>Descendre</button>' +
          '<button class="lien" type="button" data-dupliquer="' + echapper(chemin) + '">Dupliquer</button>' +
          '<button class="lien lien--danger" type="button" data-supprimer="' + echapper(chemin) + '">Supprimer</button>' +
          '</div></div>'
        );
      })
      .join('');
    const queue =
      '<button class="bouton" type="button" data-ajouter="produits">Ajouter un produit</button>' +
      (liste.length ? '' : '<p class="vide">Aucun produit : le catalogue du site est vide.</p>');
    return tete + cartes + queue;
  }

  function rendre() {
    formulaire.innerHTML = (RUBRIQUES[rubriqueActive] || function () {})();
    compter();
  }

  function compter() {
    const pairs = [
      ['nb-produits', (brouillon.produits || []).length],
      ['nb-categories', (brouillon.categories || []).length],
      ['nb-realisations', (brouillon.realisations || []).length],
      ['nb-partenaires', (brouillon.partenaires || []).length],
      ['nb-questions', ((brouillon.assistant || {}).questions || []).length],
    ];
    pairs.forEach(([id, n]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = n;
    });
    document.getElementById('tete-nom').textContent = brouillon.boutique.nom || '';
  }

  /* ----------------------------------------------------------- aperçu site */

  const ifApercu = document.getElementById('apercu-if');
  let minuteur = null;
  function programmerApercu() {
    clearTimeout(minuteur);
    minuteur = setTimeout(() => {
      try {
        ifApercu.src = 'index.html?apercu=1&t=' + Date.now();
      } catch (e) {
        /* le navigateur bloque peut-être le stockage croisé : l'aperçu reste sur la version précédente */
      }
    }, 700);
  }

  document.getElementById('apercu-largeur').addEventListener('change', (ev) => {
    document.getElementById('apercu-cadre').style.setProperty('--largeur-apercu', ev.target.value + 'px');
  });

  /* ------------------------------------------------------------- évènements */

  formulaire.addEventListener('input', (ev) => {
    const el = ev.target;
    if (!el.dataset || !el.dataset.chemin) return;
    ecrire(el.dataset.chemin, valeurSaisie(el));
    sauver();
    compter();
  });

  formulaire.addEventListener('change', (ev) => {
    const el = ev.target;
    if (!el.dataset || el.dataset.chemin === undefined) return;
    if (el.dataset.type === 'choix' || el.type === 'checkbox') {
      ecrire(el.dataset.chemin, valeurSaisie(el));
      sauver();
    }
  });

  function valeurSaisie(el) {
    const t = el.dataset.type;
    if (t === 'nombre') {
      if (String(el.value).trim() === '') return null;
      const n = Number(el.value);
      return isFinite(n) ? n : null;
    }
    if (t === 'liste') return String(el.value).split('\n').map((x) => x.trim()).filter(Boolean);
    if (t === 'case') return el.checked;
    /* Une liste de choix vide veut dire « rien » : le site lit null, pas une chaîne vide. */
    if (t === 'choix') return el.value === '' ? null : el.value;
    return el.value;
  }

  formulaire.addEventListener('click', (ev) => {
    const b =
      ev.target && ev.target.closest
        ? ev.target.closest(
            '[data-ajouter],[data-supprimer],[data-dupliquer],[data-mont],[data-descendre],[data-tri-prix],[data-exporter-datajs],[data-exporter-json],[data-importer],[data-qr-site]'
          )
        : null;
    if (!b) return;
    if (b.dataset.ajouter !== undefined) {
      ajouter(b.dataset.ajouter, b.dataset.modele ? JSON.parse(b.dataset.modele) : videPour(b.dataset.ajouter));
      return;
    }
    if (b.dataset.supprimer !== undefined) {
      retirer(b.dataset.supprimer);
      return;
    }
    if (b.dataset.dupliquer !== undefined) {
      dupliquer(b.dataset.dupliquer);
      return;
    }
    if (b.dataset.mont !== undefined) {
      deplacer(b.dataset.mont, -1);
      return;
    }
    if (b.dataset.descendre !== undefined) {
      deplacer(b.dataset.descendre, 1);
      return;
    }
    if (b.dataset.triPrix !== undefined) {
      ajusterPrix(b.dataset.triPrix);
      return;
    }
    if (b.dataset.exporterDatajs !== undefined) {
      enregistrerFichier();
      return;
    }
    if (b.dataset.exporterJson !== undefined) {
      telecharger(JSON.stringify(brouillon, null, 2), 'electro21-donnees.json', 'application/json;charset=utf-8');
      afficherEtat('Copie JSON téléchargée : elle se recharge avec « Reprendre un fichier sauvegardé ».');
      return;
    }
    if (b.dataset.importer !== undefined) {
      document.getElementById('fichier-import').click();
      return;
    }
    if (b.dataset.qrSite !== undefined) {
      afficherQrSite();
    }
  });

  function parentEtIndex(chemin) {
    const morceaux = chemin.split('.');
    const dern = morceaux.pop();
    const tab = morceaux.reduce((o, k) => (o == null ? o : o[k]), brouillon);
    return { tab: tab, index: Number(dern) };
  }

  function ajouter(chemin, modele) {
    const o = parentEtIndex(chemin + '.0');
    const tab = lire(chemin);
    if (!Array.isArray(tab)) return;
    tab.push(modele === undefined || modele === null ? videPour(chemin) : copier(modele));
    sauver();
    rendre();
  }
  function retirer(chemin) {
    const { tab, index } = parentEtIndex(chemin);
    if (!Array.isArray(tab) || isNaN(index)) return;
    const libelle = nom(chemin);
    if (!window.confirm('Supprimer « ' + libelle + ' » de la liste ? Le brouillon seulement est modifié : le fichier js/data.js reste inchangé tant que vous ne l’enregistrez pas.')) return;
    tab.splice(index, 1);
    sauver();
    rendre();
  }
  function dupliquer(chemin) {
    const { tab, index } = parentEtIndex(chemin);
    if (!Array.isArray(tab)) return;
    const copie = copier(tab[index]);
    if (copie && copie.id) copie.id = copie.id + '-copie';
    if (copie && copie.nom) copie.nom = copie.nom + ' (copie)';
    tab.splice(index + 1, 0, copie);
    sauver();
    rendre();
  }
  function deplacer(chemin, pas) {
    const { tab, index } = parentEtIndex(chemin);
    if (!Array.isArray(tab) || index + pas < 0 || index + pas >= tab.length) return;
    const tmp = tab[index];
    tab[index] = tab[index + pas];
    tab[index + pas] = tmp;
    sauver();
    rendre();
  }
  function nom(chemin) {
    const x = lire(chemin);
    if (!x) return 'élément';
    return x.nom || x.titre || x.question || x.label || x.jours || x.id || 'élément';
  }

  function videPour(chemin) {
    if (chemin === 'produits')
      return { id: '', nom: '', marque: '', categorie: (brouillon.categories[0] || {}).id || 'smartphones', prix: null, prixBarre: null, visuel: 'phone', stock: 'en-stock', note: 0, avis: 0, vendu: 0, resume: '', description: '', specs: [] };
    if (chemin === 'categories') return { id: '', label: '', visuel: 'phone' };
    if (chemin === 'realisations') return { id: '', titre: '', type: 'arrivage', quand: null, texte: '', image: '', lien: null };
    if (chemin === 'partenaires') return { nom: '', role: '', type: 'service', lien: null };
    if (chemin === 'assistant.questions') return { id: '', question: '', mots: [], reponse: '', action: null };
    if (chemin === 'boutique.horaires') return { jours: '', heures: '' };
    if (chemin === 'boutique.boutiques') return { id: '', nom: '', adresse: '', quartier: '' };
    if (chemin === 'produits.0.specs') return { label: '', valeur: '' };
    if (/\.specs$/.test(chemin)) return { label: '', valeur: '' };
    return {};
  }

  function ajusterPrix(action) {
    (brouillon.produits || []).forEach((p) => {
      if (action === 'vider') {
        p.prix = null;
        p.prixBarre = null;
      } else if (p.prix == null) {
        p.prix = 250000;
      }
    });
    sauver();
    rendre();
  }

  /* ------------------------------------------------------- codes QR, réglages */

  function rubriqueReglages() {
    const a = avertir();
    return (
      '<p class="chapeau">Le back-office ne touche jamais le fichier tout seul : il prépare une copie, et vous décidez de l’enregistrer.</p>' +
      '<h3>Adresse publiée et codes QR</h3>' +
      '<div class="champ"><label for="regl-url">Adresse du site</label><span class="aide">C’est elle que les codes QR encodent. Vide, la planche d’étiquettes explique qu’elle manque.</span>' +
      '<input id="regl-url" data-chemin="boutique.urlSite" data-type="texte" value="' + echapper(brouillon.boutique.urlSite) + '" /></div>' +
      '<div class="ligne-boutons"><button class="bouton" type="button" data-qr-site="1">Dessiner le code du site</button>' +
      '<a class="bouton" href="etiquettes.html" target="_blank" rel="noopener">Planche d’étiquettes</a>' +
      '<a class="bouton" href="index.html?apercu=1" target="_blank" rel="noopener">Site avec le brouillon</a></div>' +
      '<div class="qr-grand" id="qr-grand"></div>' +
      '<h3>Enregistrer le travail</h3>' +
      '<p class="chapeau">« Enregistrer js/data.js » télécharge le fichier complet. Placez-le dans le dossier <code>js</code> du site pour remplacer l’ancien. Gardez une copie de secours de l’original avant.</p>' +
      '<div class="ligne-boutons"><button class="bouton bouton--principal" type="button" data-exporter-datajs="1">Télécharger js/data.js</button>' +
      '<button class="bouton" type="button" data-exporter-json="1">Télécharger les données en JSON</button>' +
      '<button class="bouton" type="button" data-importer="1">Reprendre un fichier sauvegardé</button>' +
      '<input id="fichier-import" type="file" accept=".js,.json,text/javascript,application/json" hidden /></div>' +
      '<h3>Contrôles</h3><ul class="controles">' +
      (a.length ? a.map((x) => '<li class="controles__alerte">' + echapper(x) + '</li>').join('') : '<li class="controles__ok">Rien à signaler.</li>') +
      '</ul>' +
      '<h3>Code d’accueil</h3><p class="chapeau">Il se lit et se change dans <code>js/data.js</code>, rubrique <code>admin.code</code>. Cette page ne peut pas le modifier : ce serait une fausse sécurité.</p>'
    );
  }

  function avertir() {
    const alertes = [];
    const ids = {};
    (brouillon.produits || []).forEach((p, i) => {
      if (!p.id) alertes.push('Produit ' + (i + 1) + ' : identifiant vide, sa fiche ne s’ouvrira pas depuis un lien.');
      else if (ids['p' + p.id]) alertes.push('Identifiant de produit en double : « ' + p.id + ' ».');
      ids['p' + p.id] = 1;
      if (p.photo && p.photo.indexOf('/') !== -1) alertes.push('Produit « ' + (p.nom || p.id) + ' » : la photo doit être un nom de fichier, sans chemin.');
      if (p.stock && ['en-stock', 'stock-faible', 'sur-commande'].indexOf(p.stock) === -1) alertes.push('Produit « ' + (p.nom || p.id) + ' » : disponibilité inconnue, le site affichera « En stock ».');
    });
    const cats = {};
    (brouillon.categories || []).forEach((c) => (cats[c.id] = 1));
    (brouillon.produits || []).forEach((p) => {
      if (p.categorie && !cats[p.categorie]) alertes.push('Produit « ' + (p.nom || p.id) + ' » : rayon « ' + p.categorie + ' » introuvable dans la liste des rayons.');
    });
    if (!(brouillon.produits || []).length) alertes.push('Catalogue vide : ajoutez au moins un produit.');
    if (!(brouillon.realisations || []).length) alertes.push('Rubrique Réalisations vide : elle disparaît du site.');
    if (!(brouillon.partenaires || []).length) alertes.push('Rubrique Partenaires vide : la rubrique n’affiche plus que les marques du catalogue.');
    if (!(brouillon.assistant || {}).questions || !brouillon.assistant.questions.length) alertes.push('Assistant sans question connue : il renverra toujours vers WhatsApp.');
    if (brouillon.boutique.whatsapp && /[^0-9]/.test(String(brouillon.boutique.whatsapp))) alertes.push('Numéro WhatsApp : n’indiquer que des chiffres, indicatif inclus, sans + ni espace.');
    if (!brouillon.boutique.urlSite) alertes.push('Adresse publiée du site non renseignée : les codes QR resteront des liens locaux.');
    if (!(brouillon.boutique.boutiques || []).length && !brouillon.boutique.adresse)
      alertes.push('Aucun point de vente : le site n’aurait aucune adresse à afficher dans la page Contact.');
    (brouillon.realisations || []).forEach((r) => {
      if (r.lien && !(brouillon.produits || []).some((p) => p.id === r.lien || p.slug === r.lien || slugDe(p.nom) === r.lien))
        alertes.push('Réalisation « ' + (r.titre || r.id) + ' » : le produit lié « ' + r.lien + ' » n’existe pas dans le catalogue.');
    });
    return alertes;
  }

  function afficherQrSite() {
    const hote = document.getElementById('qr-grand');
    const url = brouillon.boutique.urlSite || (location.protocol.indexOf('http') === 0 ? location.origin + '/' : '');
    if (!url || !window.QR) {
      hote.innerHTML = '<p class="vide">Renseignez d’abord l’adresse publiée du site : sans elle, le code ne pointerait que sur ce ordinateur.</p>';
      return;
    }
    hote.innerHTML = window.QR.svg(url, { taille: 220, titre: 'QR du site ' + url }) + '<p class="aide">' + echapper(url) + ' · <a href="' + echapper(url) + '" target="_blank" rel="noopener">ouvrir</a></p>';
  }

  /* ---------------------------------------------------------------- export */

  const ENTETE_FICHIER = `/*
 * Electro 21 — données de la boutique
 * -----------------------------------------------------------------------------
 * Fichier tenu à jour par le back-office local (admin.html), le DATE_PLACEHOLDER.
 * Le site lit ce fichier et rien d'autre : aucun outil de compilation n'est nécessaire.
 *
 * Un produit avec « prix: null » s'affiche « Prix sur demande » : le catalogue
 * reste sans prix tant que la boutique annonce le prix du jour sur WhatsApp.
 *
 * Les visuels mentionnés ici doivent exister dans le dossier assets/. Le
 * back-office ne copie aucune image : il ne fait que désigner un fichier déjà présent.
 */`;

  const FIN_APERCU = `
/* ---------------------------------------------------------------------------
 * Aperçu du back-office : « index.html?apercu=1 » reprend le brouillon gardé
 * dans ce navigateur. La visite normale lit ce fichier tel quel.
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
`;

  function texteDataJs() {
    const date = new Date().toLocaleString('fr-FR');
    const corps = {};
    CLES_SITE.forEach((c) => {
      if (brouillon[c] !== undefined) corps[c] = brouillon[c];
    });
    return (
      ENTETE_FICHIER.replace('DATE_PLACEHOLDER', date) +
      '\nwindow.ELECTRO21 = ' +
      JSON.stringify(corps, null, 2) +
      ';\n' +
      FIN_APERCU
    );
  }

  /** Le seul geste qui change le site : poser le fichier téléchargé dans js/. */
  function enregistrerFichier() {
    const alertes = avertir();
    if (alertes.length && !window.confirm('Le back-office voit ' + alertes.length + ' point(s) à vérifier. Télécharger quand même le fichier ?')) return;
    telecharger(texteDataJs(), 'data.js', 'text/javascript;charset=utf-8');
    afficherEtat(
      'Fichier data.js téléchargé. Remplacez js/data.js par ce fichier, puis rechargez le site : « ' +
        (brouillon.produits || []).length +
        ' produits, ' +
        (brouillon.realisations || []).length +
        ' réalisations, ' +
        (brouillon.partenaires || []).length +
        ' partenaires ».'
    );
  }

  function telecharger(txt, nom, genre) {
    const blob = new Blob([txt], { type: genre });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nom;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  }

  /* --------------------------------------------------------------- porte */

  const porte = document.getElementById('porte');
  const coquille = document.getElementById('coquille');
  const champCode = document.getElementById('code');
  document.getElementById('porte-aide').textContent = (D.admin && D.admin.aide) || '';

  function ouvrir() {
    porte.hidden = true;
    coquille.hidden = false;
    rendre();
    compter();
    programmerApercu();
  }

  champCode.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter') ev.preventDefault(), valider();
  });
  document.getElementById('entrer').addEventListener('click', valider);

  function valider() {
    const attendu = (brouillon.admin && brouillon.admin.code) || 'electro21';
    if (champCode.value !== attendu) {
      document.getElementById('porte-refus').hidden = false;
      champCode.focus();
      return;
    }
    document.getElementById('porte-refus').hidden = true;
    try {
      sessionStorage.setItem(CLE_PORTES, '1');
    } catch (e) {
      /* rien de grave : la porte se rouvrira à la prochaine visite */
    }
    ouvrir();
  }

  document.querySelectorAll('.rubrique').forEach((b) =>
    b.addEventListener('click', () => {
      rubriqueActive = b.dataset.rubrique;
      document.querySelectorAll('.rubrique').forEach((x) => x.setAttribute('aria-current', x === b ? 'page' : 'false'));
      rendre();
    })
  );

  document.getElementById('voir-site').addEventListener('click', () => window.open('index.html', '_blank', 'noopener'));
  document.getElementById('recharger').addEventListener('click', () => {
    if (!window.confirm('Écarter le brouillon et repartir du fichier js/data.js actuellement publié ?')) return;
    brouillon = etatDuFichier();
    try {
      localStorage.removeItem(CLE_BROUILLON);
    } catch (e) {
      /* ignoré */
    }
    rendre();
    compter();
    programmerApercu();
    afficherEtat('Brouillon écarté : le back-office reprend le fichier js/data.js.');
  });

  document.getElementById('telecharger').addEventListener('click', enregistrerFichier);

  document.addEventListener('change', (ev) => {
    if (ev.target.id !== 'fichier-import') return;
    const f = ev.target.files && ev.target.files[0];
    if (!f) return;
    const lecteur = new FileReader();
    lecteur.onload = () => {
      try {
        const donnees = lireFichier(String(lecteur.result));
        if (!donnees || !donnees.boutique || !Array.isArray(donnees.produits)) throw new Error('structure attendue : un objet ELECTRO21 avec boutique et produits');
        donnees.admin = brouillon.admin;
        brouillon = donnees;
        sauver();
        rendre();
        compter();
        afficherEtat('Fichier « ' + f.name + ' » repris dans le brouillon (' + donnees.produits.length + ' produits).');
      } catch (e) {
        afficherEtat('Import impossible : ' + e.message + '.');
      }
      ev.target.value = '';
    };
    lecteur.readAsText(f, 'utf-8');
  });

  /** Accepte un JSON, ou un js/data.js tel qu'il est publié. */
  function lireFichier(txt) {
    const objet = txt.match(/window\.ELECTRO21\s*=\s*([\s\S]*?);\s*\n/);
    if (objet) {
      const boite = {};
      /* Le fichier est lu dans un contexte isolé : il ne peut rien toucher d'autre. */
      new Function('window', objet[1].indexOf('{') === 0 ? 'window.ELECTRO21 = ' + objet[1] + ';' : 'window.ELECTRO21 = ' + objet[1] + ';')(boite);
      return boite.ELECTRO21;
    }
    return JSON.parse(txt);
  }

  /* ouverture immédiate si la porte a déjà été validée dans cet onglet */
  let deja = false;
  try {
    deja = sessionStorage.getItem(CLE_PORTES) === '1';
  } catch (e) {
    deja = false;
  }
  if (deja) ouvrir();
  else champCode.focus();
})();
