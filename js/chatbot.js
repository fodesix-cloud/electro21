/*
 * Electro 21 — assistant de la boutique
 * -----------------------------------------------------------------------------
 * Pas d'intelligence artificielle, pas de service extérieur : une recherche par
 * mots-clés dans les questions publiées par la boutique (window.ELECTRO21.assistant).
 * Les réponses viennent de js/data.js, éditable depuis le back-office. Le
 * dialogue reste donc exact, hors connexion, et ne coûte rien.
 *
 * Ce fichier construit lui-même son bouton et son panneau : il n'ajoute rien au
 * HTML. Il utilise window.ELECTRO21App quand app.js est chargé (pour ouvrir le
 * catalogue ou une fiche) et se contente sinon d'un lien WhatsApp.
 */
(function () {
  const D = window.ELECTRO21;
  if (!D || !D.assistant) return;
  const A = D.assistant;
  const B = D.boutique;
  if (A.ouvert === false) return;

  const APP = window.ELECTRO21App || {};
  const CLE_ETAT = 'electro21.assistant.v1';

  /* ------------------------------------------------------------------ utils */

  const $ = (sel, ctx) => (ctx || document).querySelector(sel);
  const $$ = (sel, ctx) => Array.from((ctx || document).querySelectorAll(sel));

  function echapper(txt) {
    return String(txt).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }

  /* Lieux de la boutique, lus sans dépendre de l'ordre de chargement des scripts :
     `boutiques` (liste) depuis data.js, avec repli sur l'ancienne adresse unique.
     La ville est reprise avant sa virgule : « Bamako, Mali » se lit « Bamako » ici,
     pour éviter la triple énumération « ACI 2000, Bamako, Mali ». */
  function lieuxAssistant() {
    const l = (Array.isArray(B.boutiques) ? B.boutiques : []).map((b) => b.quartier || b.adresse).filter(Boolean);
    if (!l.length && B.quartier) l.push(B.quartier);
    const ville = (B.ville || '').split(',')[0];
    if (!l.length) return ville;
    return l.join(' et ') + ', ' + ville;
  }

  /** Comme app.js : tout en minuscules, sans accents ni ponctuation. */
  function sansAccent(txt) {
    return String(txt)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  /* ------------------------------------------------------- recherche par mots */

  const QUESTIONS = (A.questions || []).map((q) => ({
    id: q.id,
    question: q.question,
    reponse: q.reponse,
    action: q.action || null,
    /* Le libellé de la question sert aussi de réservoir de mots-clés. */
    _mots: (q.mots || []).concat(sansAccent(q.question).split(' ')).filter((m) => m && m.length > 2).map(sansAccent),
  }));

  /**
   * Score simple : le nombre de mots-clés présents dans la phrase, pondéré par
   * leur longueur (un mot long est plus précis qu'un mot court).
   */
  function chercher(txt) {
    const q = sansAccent(txt);
    if (!q) return null;
    const mots = q.split(' ');
    let meilleur = null;
    let scoreMeilleur = 0;
    QUESTIONS.forEach((x) => {
      let score = 0;
      x._mots.forEach((m) => {
        if (m.length > 2 && q.indexOf(m) !== -1) score += m.length;
      });
      /* Une question reprise mot pour mot mérite un bonus. */
      if (mots.length > 1 && sansAccent(x.question).split(' ').some((w) => w.length > 3 && mots.indexOf(w) !== -1)) score += 4;
      if (score > scoreMeilleur) {
        scoreMeilleur = score;
        meilleur = x;
      }
    });
    return scoreMeilleur >= 4 ? meilleur : null;
  }

  /* ------------------------------------------------------------------ état */

  let ouvert = false;
  let historique = [];
  try {
    const sauvegarde = JSON.parse(localStorage.getItem(CLE_ETAT) || 'null');
    if (sauvegarde && Array.isArray(sauvegarde.historique)) historique = sauvegarde.historique.slice(-12);
  } catch (e) {
    /* stockage indisponible : le dialogue repart de zéro, sans gêner la visite */
  }
  function sauver() {
    try {
      localStorage.setItem(CLE_ETAT, JSON.stringify({ historique: historique.slice(-12) }));
    } catch (e) {
      /* ignoré volontairement */
    }
  }

  /* ------------------------------------------------------------------ actions */

  const ACTIONS = {
    whatsapp: { libelle: 'Écrire à la boutique', href: null, classe: 'btn--wa' },
    appel: { libelle: 'Appeler la boutique', href: null, classe: 'btn--secondaire' },
    catalogue: { libelle: 'Voir le catalogue', href: null, classe: 'btn--fantome' },
    contact: { libelle: 'Adresse et horaires', href: null, classe: 'btn--fantome' },
  };

  function lienWa(txt) {
    if (APP.lienWa) return APP.lienWa(txt);
    return 'https://wa.me/' + B.whatsapp + '?text=' + encodeURIComponent(txt);
  }
  function lienTel() {
    if (APP.lienTel) return APP.lienTel();
    return 'tel:' + String(B.tel[0]).replace(/[^0-9+]/g, '');
  }

  /** Le bouton d'une réponse : soit un lien, soit une commande dans la page. */
  function boutonAction(type) {
    const a = ACTIONS[type];
    if (!a) return '';
    if (type === 'whatsapp') return '<a class="btn ' + a.classe + '" href="' + lienWa('Bonjour ' + B.nom + ',\n\n' + A.presentation) + '" target="_blank" rel="noopener">' + a.libelle + '</a>';
    if (type === 'appel') return '<a class="btn ' + a.classe + '" href="' + lienTel() + '">' + a.libelle + '</a>';
    return '<button class="btn ' + a.classe + '" type="button" data-action="' + type + '">' + a.libelle + '</button>';
  }

  function executer(type) {
    if (type === 'catalogue') {
      if (APP.allerVue && APP.mobile && APP.mobile()) APP.allerVue('catalogue');
      else {
        const cible = document.getElementById('catalogue');
        if (cible) cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    if (type === 'contact') {
      const cible = document.getElementById('contact');
      if (cible) cible.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (APP.allerVue && APP.mobile && APP.mobile()) APP.allerVue('rayons');
      return;
    }
  }

  /* ------------------------------------------------------------------- rendu */

  function bulle(role, html) {
    return '<div class="bulle bulle--' + role + '">' + html + '</div>';
  }

  function rendreHistorique() {
    const corps = $('#assistant-corps');
    if (!historique.length) {
      corps.innerHTML =
        bulle(
          'bot',
          '<p>' +
            echapper(A.presentation) +
            '</p><p class="assistant__avertissement">' +
            echapper(A.avertissement) +
            '</p>' +
            (A.suggestions || []).map((s) => '<button class="suggestion" type="button" data-suggestion="' + echapper(s) + '">' + echapper(s) + '</button>').join('')
        ) +
        '<nav class="assistant__raccourcis" aria-label="Questions fréquentes">' +
        (A.suggestions || []).map((s) => '<button class="raccourci" type="button" data-suggestion="' + echapper(s) + '">' + echapper(s) + '</button>').join('') +
        '</nav>';
      return;
    }
    corps.innerHTML = historique
      .map((l) => {
        if (l.role === 'client') return bulle('client', '<p>' + echapper(l.txt) + '</p>');
        const rep = bulle(
          'bot',
          '<p>' +
            echapper(l.txt) +
            '</p>' +
            (l.action ? '<div class="bulle__action">' + boutonAction(l.action) + '</div>' : '') +
            (l.suggestions && l.suggestions.length
              ? '<div class="bulle__suite">' + l.suggestions.map((s) => '<button class="suggestion" type="button" data-suggestion="' + echapper(s) + '">' + echapper(s) + '</button>').join('') + '</div>'
              : '')
        );
        return rep;
      })
      .join('');
    corps.scrollTop = corps.scrollHeight;
  }

  /** Deux autres questions probables, pour relancer poliment. */
  function suivantes(idEvite) {
    return QUESTIONS.filter((q) => q.id !== idEvite).slice(0, 2).map((q) => q.question);
  }

  function repondre(txt) {
    const trouvee = chercher(txt);
    if (trouvee) {
      historique.push({ role: 'bot', txt: trouvee.reponse, action: trouvee.action, suggestions: suivantes(trouvee.id) });
    } else {
      historique.push({ role: 'bot', txt: A.inconnu, action: 'whatsapp', suggestions: (A.suggestions || []).slice(0, 3) });
    }
    sauver();
    rendreHistorique();
  }

  function demander(txt) {
    const propre = String(txt || '').trim();
    if (!propre) return;
    historique.push({ role: 'client', txt: propre });
    rendreHistorique();
    repondre(propre);
  }

  /* ------------------------------------------------------------- construction */

  const Racine = document.createElement('div');
  Racine.className = 'assistant';
  Racine.id = 'assistant';
  Racine.innerHTML =
    '<button class="assistant__lanceur" id="assistant-lanceur" type="button" aria-expanded="false" aria-controls="assistant-boite">' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H8l-4 3z" /><circle cx="9" cy="10.5" r="1" /><circle cx="15" cy="10.5" r="1" /></svg>' +
    '<span class="assistant__lanceur-texte">Une question&nbsp;?</span></button>' +
    '<section class="assistant__boite" id="assistant-boite" hidden role="dialog" aria-modal="false" aria-labelledby="assistant-titre">' +
    '<header class="assistant__tete"><div><h2 id="assistant-titre">' + echapper(A.titre) + '</h2><p>' + echapper(B.nom) + ' · ' + echapper(lieuxAssistant()) + '</p></div>' +
    '<button class="fermer" id="assistant-fermer" type="button" aria-label="Fermer l’assistant">✕</button></header>' +
    '<div class="assistant__corps" id="assistant-corps" role="log" aria-live="polite" aria-atomic="false"></div>' +
    '<form class="assistant__pied" id="assistant-form"><label class="sur-mesure" for="assistant-champ">Votre question</label>' +
    '<input id="assistant-champ" type="text" placeholder="Prix, livraison, garantie, horaires…" autocomplete="off" maxlength="140" />' +
    '<button class="btn" type="submit" aria-label="Envoyer la question">Envoyer</button></form>' +
    '<p class="assistant__pied-de-page">Assistant à mots-clés, sans compte ni service extérieur. <button class="lien" id="assistant-effacer" type="button">Effacer la conversation</button></p>' +
    '</section>';
  document.body.appendChild(Racine);

  const Boite = $('#assistant-boite');
  const Lanceur = $('#assistant-lanceur');

  function ouvrir() {
    ouvert = true;
    Boite.hidden = false;
    Lanceur.setAttribute('aria-expanded', 'true');
    Racine.classList.add('assistant--ouvert');
    rendreHistorique();
    const champ = $('#assistant-champ');
    /* Le focus reste sur ordinateur : sur téléphone, il ferait surgir le clavier
       au moment où l'élève s'ouvre. */
    if (champ && !(APP.mobile && APP.mobile())) champ.focus();
  }
  function fermer() {
    ouvert = false;
    Boite.hidden = true;
    Lanceur.setAttribute('aria-expanded', 'false');
    Racine.classList.remove('assistant--ouvert');
  }
  function basculer() {
    if (ouvert) fermer();
    else ouvrir();
  }

  Lanceur.addEventListener('click', basculer);
  $('#assistant-fermer').addEventListener('click', fermer);
  $('#assistant-effacer').addEventListener('click', () => {
    historique = [];
    sauver();
    rendreHistorique();
    $('#assistant-champ').focus();
  });
  $('#assistant-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const champ = $('#assistant-champ');
    demander(champ.value);
    champ.value = '';
  });

  document.addEventListener('click', (ev) => {
    const cible = ev.target && ev.target.closest ? ev.target : null;
    if (!cible) return;
    const s = cible.closest('[data-suggestion]');
    if (s) {
      demander(s.dataset.suggestion);
      return;
    }
    const a = cible.closest('[data-action]');
    if (a) {
      executer(a.dataset.action);
      return;
    }
    /* Clic dehors : on referme, sauf sur le lanceur qui gère lui-même le basculement. */
    if (ouvert && !cible.closest('#assistant')) fermer();
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && ouvert) {
      fermer();
      Lanceur.focus();
    }
  });

  rendreHistorique();
})();
