/*
 * Electro 21 — encodeur de code QR
 * -----------------------------------------------------------------------------
 * Module autonome, sans dépendance : il produit la matrice de modules et un SVG
 * prêt à afficher ou à imprimer. Mode octets seulement (les adresses du site et
 * les liens WhatsApp sont en ASCII/UTF-8), niveau de correction M, versions 1 à
 * 20, masque choisi par la pénalité prévue par la norme ISO/IEC 18004.
 *
 * Utilisation :
 *   QR.svg('https://exemple.tld/#/produit/iphone-18-128-go', { taille: 220, marge: 4 })
 *   QR.matrice('bonjour')  ->  { version, masque, taille, modules: [[0|1, ...], ...] }
 *
 * Les options `version` et `masque` forcent un réglage : c'est ce qui permet de
 * comparer la sortie à celle d'un encodeur de référence pendant les tests.
 */
(function (global) {
  'use strict';

  /* ------------------------------------------------------------ tables QR */

  /* Niveau M : [codewords de correction par bloc, blocs groupe 1, données groupe 1,
     blocs groupe 2, données groupe 2], pour les versions 1 à 20. */
  const BLOCS_M = [
    [10, 1, 16, 0, 0],
    [16, 1, 28, 0, 0],
    [26, 1, 44, 0, 0],
    [18, 2, 32, 0, 0],
    [24, 2, 43, 0, 0],
    [16, 4, 27, 0, 0],
    [18, 4, 31, 0, 0],
    [22, 2, 38, 2, 39],
    [22, 3, 36, 2, 37],
    [26, 4, 43, 1, 44],
    [30, 1, 50, 4, 51],
    [22, 6, 36, 2, 37],
    [22, 8, 37, 1, 38],
    [24, 4, 40, 5, 41],
    [24, 5, 41, 5, 42],
    [28, 7, 45, 3, 46],
    [28, 10, 46, 1, 47],
    [26, 9, 43, 4, 44],
    [26, 3, 44, 11, 45],
    [26, 3, 41, 13, 42],
  ];

  /* Centres des motifs d'alignement, publiés par la norme (les espacements ne
     sont pas réguliers à partir de la version 14). */
  const ALIGNEMENTS = [
    [],
    [6, 18],
    [6, 22],
    [6, 26],
    [6, 30],
    [6, 34],
    [6, 22, 38],
    [6, 24, 42],
    [6, 26, 46],
    [6, 28, 50],
    [6, 30, 54],
    [6, 32, 58],
    [6, 34, 62],
    [6, 26, 46, 66],
    [6, 26, 48, 70],
    [6, 26, 50, 74],
    [6, 30, 54, 78],
    [6, 30, 56, 82],
    [6, 30, 58, 86],
    [6, 34, 62, 90],
  ];

  /* Bits de reste après les codewords, par version. */
  function reste(version) {
    if (version === 1) return 0;
    if (version <= 6) return 7;
    if (version <= 13) return 0;
    return 4; /* versions 14 à 20 */
  }

  /* ------------------------------------------------------- corps de GF(256) */

  const EXP = new Uint8Array(512);
  const LOG = new Uint8Array(256);
  (function initialiseCorps() {
    let x = 1;
    for (let i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d; /* polynôme primitif 285 */
    }
    for (let i = 255; i < 512; i++) EXP[i] = EXP[i - 255];
  })();

  function mul(a, b) {
    if (a === 0 || b === 0) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  /* Polynôme générateur de degré `degre`, sans le coefficient dominant. */
  const GENERATEURS = {};
  function generateur(degre) {
    if (GENERATEURS[degre]) return GENERATEURS[degre];
    let poly = [1];
    for (let i = 0; i < degre; i++) {
      const next = new Array(poly.length + 1).fill(0);
      for (let j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= mul(poly[j], EXP[i]);
      }
      poly = next;
    }
    GENERATEURS[degre] = poly;
    return poly;
  }

  /* Codewords de correction d'un bloc (méthode des restes, tables décalées). */
  function correction(donnees, degre) {
    const gen = generateur(degre);
    const residu = new Uint8Array(degre);
    for (let i = 0; i < donnees.length; i++) {
      const facteur = donnees[i] ^ residu[0];
      residu.copyWithin(0, 1);
      residu[degre - 1] = 0;
      if (facteur !== 0) {
        for (let j = 0; j < degre; j++) residu[j] ^= mul(gen[j + 1], facteur);
      }
    }
    return Array.from(residu);
  }

  /* ------------------------------------------------------- bits et BCH 15/18 */

  /* Mot de 15 bits d'information de format : niveau M = 00, puis masque. */
  function bitsFormat(niveau, masque) {
    const data = (niveau << 3) | masque;
    let bits = data << 10;
    /* division polynomiale par 0x537 (x^10 + x^8 + x^5 + x^4 + x^2 + x + 1) */
    let r = bits;
    for (let i = 14; i >= 10; i--) {
      if ((r & (1 << i)) !== 0) r ^= 0x537 << (i - 10);
    }
    return ((data << 10) | r) ^ 0x5412;
  }

  /* Mot de 18 bits d'information de version (versions 7 et plus). */
  function bitsVersion(version) {
    let r = version << 12;
    for (let i = 17; i >= 12; i--) {
      if ((r & (1 << i)) !== 0) r ^= 0x1f25 << (i - 12);
    }
    return (version << 12) | r;
  }

  /* ------------------------------------------------------------ flux de bits */

  function Ecrivain() {
    this.bits = [];
  }
  Ecrivain.prototype.ecrire = function (valeur, longueur) {
    for (let i = longueur - 1; i >= 0; i--) this.bits.push((valeur >>> i) & 1);
  };
  Ecrivain.prototype.longueur = function () {
    return this.bits.length;
  };
  Ecrivain.prototype.octets = function () {
    const octets = [];
    for (let i = 0; i < this.bits.length; i += 8) {
      let v = 0;
      for (let j = 0; j < 8; j++) v = (v << 1) | (this.bits[i + j] || 0);
      octets.push(v);
    }
    return octets;
  };

  function octetsDe(txt) {
    return Array.from(new TextEncoder().encode(txt));
  }

  /* Nombre de codewords de données d'une version, niveau M. */
  function capaciteDonnees(version) {
    const t = BLOCS_M[version - 1];
    return t[1] * t[2] + t[3] * t[4];
  }

  /* Version minimale qui peut recevoir `longueur` octets en mode octets. */
  function versionPour(longueur) {
    for (let v = 1; v <= 20; v++) {
      const indicateur = v <= 9 ? 8 : 16;
      const disponibles = capaciteDonnees(v) * 8;
      if (4 + indicateur + longueur * 8 <= disponibles) return v;
    }
    throw new Error('Contenu trop long pour un QR standard en niveau M (maximum 669 octets).');
  }

  /* Découpe en blocs, correction, entrelacement : la trame complète. */
  function trame(version, octetsDonnees) {
    const t = BLOCS_M[version - 1];
    const [degEC, nb1, da1, nb2, da2] = t;
    const blocs = [];
    let position = 0;
    for (let i = 0; i < nb1 + nb2; i++) {
      const taille = i < nb1 ? da1 : da2;
      blocs.push(octetsDonnees.slice(position, position + taille));
      position += taille;
    }
    const ecs = blocs.map((b) => correction(b, degEC));
    const sortie = [];
    const maxDonnees = Math.max(da1, da2 || 0);
    for (let i = 0; i < maxDonnees; i++) {
      for (let b = 0; b < blocs.length; b++) if (i < blocs[b].length) sortie.push(blocs[b][i]);
    }
    for (let i = 0; i < degEC; i++) {
      for (let b = 0; b < ecs.length; b++) sortie.push(ecs[b][i]);
    }
    return sortie;
  }

  /* ------------------------------------------------------- matrice et motifs */

  const MASQUES = [
    (r, c) => (r + c) % 2 === 0,
    (r) => r % 2 === 0,
    (r, c) => c % 3 === 0,
    (r, c) => (r + c) % 3 === 0,
    (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0,
    (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
    (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0,
    (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
  ];

  /* Construit la grille vide, pose les motifs fonctionnels et renvoie la carte
     des modules réservés (non masquables, non data). */
  function gabarit(version) {
    const taille = version * 4 + 17;
    const modules = [];
    const reserve = [];
    for (let r = 0; r < taille; r++) {
      modules.push(new Uint8Array(taille));
      reserve.push(new Uint8Array(taille));
    }

    function poser(r, c, valeur) {
      if (r < 0 || c < 0 || r >= taille || c >= taille) return;
      modules[r][c] = valeur ? 1 : 0;
      reserve[r][c] = 1;
    }

    /* motifs de repérage + séparateurs */
    function repere(ligne, colonne) {
      for (let r = -1; r <= 7; r++) {
        for (let c = -1; c <= 7; c++) {
          const dansCadre = r >= 0 && r <= 6 && c >= 0 && c <= 6;
          const anneau = dansCadre && (r === 0 || r === 6 || c === 0 || c === 6);
          const centre = r >= 2 && r <= 4 && c >= 2 && c <= 4;
          poser(ligne + r, colonne + c, anneau || centre);
        }
      }
    }
    repere(0, 0);
    repere(0, taille - 7);
    repere(taille - 7, 0);

    /* motifs de temporisation */
    for (let i = 0; i < taille; i++) {
      if (!reserve[6][i]) poser(6, i, i % 2 === 0);
      if (!reserve[i][6]) poser(i, 6, i % 2 === 0);
    }

    /* motifs d'alignement — les trois qui tombent sur un repère n'existent pas */
    const centres = ALIGNEMENTS[version - 1];
    const coin = (r, c) =>
      (r === 6 && c === 6) || (r === 6 && c === taille - 7) || (r === taille - 7 && c === 6);
    for (let i = 0; i < centres.length; i++) {
      for (let j = 0; j < centres.length; j++) {
        const r = centres[i];
        const c = centres[j];
        if (coin(r, c)) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const bord = Math.max(Math.abs(dr), Math.abs(dc));
            poser(r + dr, c + dc, bord !== 1);
          }
        }
      }
    }

    /* module sombre obligatoire + zones réservées à l'information de format */
    poser(taille - 8, 8, 1);
    for (let i = 0; i <= 8; i++) {
      if (i !== 6) {
        reserve[8][i] = 1;
        reserve[i][8] = 1;
      }
    }
    for (let i = 0; i < 8; i++) {
      reserve[8][taille - 1 - i] = 1;
      reserve[taille - 1 - i][8] = 1;
    }

    /* information de version (versions 7 et plus) */
    if (version >= 7) {
      for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 3; j++) {
          reserve[taille - 11 + j][i] = 1;
          reserve[i][taille - 11 + j] = 1;
        }
      }
    }

    return { modules, reserve, taille };
  }

  /* Place la trame dans la grille, en zigzag de deux modules. */
  function placerDonnees(g, bits) {
    const { modules, reserve, taille } = g;
    let index = 0;
    let montant = true;
    for (let colonne = taille - 1; colonne > 0; colonne -= 2) {
      if (colonne === 6) colonne = 5; /* saute la colonne de temporisation */
      for (let pas = 0; pas < taille; pas++) {
        const ligne = montant ? taille - 1 - pas : pas;
        for (let c = 0; c < 2; c++) {
          const col = colonne - c;
          if (reserve[ligne][col]) continue;
          modules[ligne][col] = index < bits.length ? bits[index] : 0;
          index++;
        }
      }
      montant = !montant;
    }
    return index;
  }

  /* Applique un masque aux seuls modules de données. */
  function appliquerMasque(g, numero) {
    const { modules, reserve, taille } = g;
    const masque = MASQUES[numero];
    for (let r = 0; r < taille; r++) {
      for (let c = 0; c < taille; c++) {
        if (reserve[r][c]) continue;
        if (masque(r, c)) modules[r][c] ^= 1;
      }
    }
  }

  /* Écrit l'information de format et, si besoin, l'information de version. */
  function ecrireInformations(g, version, numeroMasque) {
    const { modules, taille } = g;
    const format = bitsFormat(0, numeroMasque); /* 0 = niveau M */
    for (let i = 0; i < 15; i++) {
      const bit = (format >>> i) & 1;
      /* moitié haute gauche */
      if (i < 6) modules[i][8] = bit;
      else if (i === 6) modules[7][8] = bit;
      else if (i === 7) modules[8][8] = bit;
      else if (i === 8) modules[8][7] = bit;
      else modules[8][14 - i] = bit;
      /* moitié basse gauche et haute droite */
      if (i < 8) modules[8][taille - 1 - i] = bit;
      else modules[taille - 15 + i][8] = bit;
    }
    if (version >= 7) {
      const info = bitsVersion(version);
      for (let i = 0; i < 18; i++) {
        const bit = (info >>> i) & 1;
        const ligne = Math.floor(i / 3);
        const col = i % 3;
        modules[taille - 11 + col][ligne] = bit;
        modules[ligne][taille - 11 + col] = bit;
      }
    }
  }

  /* Pénalité d'un masque, selon les quatre règles de la norme. */
  function penalite(g) {
    const { modules, taille } = g;
    let score = 0;

    function serie(detecteur) {
      let total = 0;
      for (let i = 0; i < taille; i++) {
        let couleur = -1;
        let longueur = 0;
        const motifs = [];
        for (let j = 0; j < taille; j++) {
          const v = detecteur(i, j);
          if (v === couleur) {
            longueur++;
          } else {
            if (longueur >= 5) total += 3 + (longueur - 5);
            couleur = v;
            longueur = 1;
          }
          motifs.push(v);
        }
        if (longueur >= 5) total += 3 + (longueur - 5);
        /* règle 3 : motif du repère répété, des deux côtés */
        for (let j = 0; j + 11 <= taille; j++) {
          const bloc = motifs.slice(j, j + 11);
          const motif = '10111010000';
          const inverse = '00001011101';
          const chaine = bloc.join('');
          if (chaine === motif || chaine === inverse) total += 40;
        }
      }
      return total;
    }

    score += serie((r, c) => modules[r][c]);
    score += serie((r, c) => modules[c][r]);

    /* règle 2 : carrés 2×2 d'une seule couleur */
    for (let r = 0; r < taille - 1; r++) {
      for (let c = 0; c < taille - 1; c++) {
        const v = modules[r][c];
        if (v === modules[r][c + 1] && v === modules[r + 1][c] && v === modules[r + 1][c + 1]) score += 3;
      }
    }

    /* règle 4 : écart à la moitié de modules sombres */
    let sombres = 0;
    for (let r = 0; r < taille; r++) {
      for (let c = 0; c < taille; c++) sombres += modules[r][c];
    }
    const pourcentage = (sombres * 100) / (taille * taille);
    score += Math.floor(Math.abs(pourcentage - 50) / 5) * 10;

    return score;
  }

  /* ------------------------------------------------------------ API publique */

  /**
   * Retourne la matrice d'un contenu : `{ version, masque, taille, modules }`.
   * `options.version` et `options.masque` forcent le réglage (usage des tests).
   */
  function matrice(contenu, options) {
    const opts = options || {};
    const octets = octetsDe(String(contenu));
    const version = opts.version || versionPour(octets.length);
    if (octets.length > capaciteDonnees(version) - (version <= 9 ? 2 : 3)) {
      throw new Error('Contenu trop long pour la version ' + version + '.');
    }

    /* flux de données : mode octets, longueur, contenu, bourrage */
    const ecrivain = new Ecrivain();
    ecrivain.ecrire(0b0100, 4);
    ecrivain.ecrire(octets.length, version <= 9 ? 8 : 16);
    octets.forEach((o) => ecrivain.ecrire(o, 8));
    const capacityBits = capaciteDonnees(version) * 8;
    const restant = capacityBits - ecrivain.longueur();
    if (restant > 0) ecrivain.ecrire(0, Math.min(4, restant));
    while (ecrivain.longueur() % 8 !== 0) ecrivain.ecrire(0, 1);
    const donnees = ecrivain.octets();
    const bourrage = [0xec, 0x11];
    let b = 0;
    while (donnees.length < capaciteDonnees(version)) {
      donnees.push(bourrage[b % 2]);
      b++;
    }

    const bits = [];
    trame(version, donnees).forEach((octet) => {
      for (let i = 7; i >= 0; i--) bits.push((octet >>> i) & 1);
    });
    for (let i = 0; i < reste(version); i++) bits.push(0);

    const candidats = opts.masque !== undefined ? [opts.masque] : [0, 1, 2, 3, 4, 5, 6, 7];
    let meilleur = null;
    candidats.forEach((numero) => {
      const essai = gabarit(version);
      placerDonnees(essai, bits);
      appliquerMasque(essai, numero);
      ecrireInformations(essai, version, numero);
      const score = penalite(essai);
      if (!meilleur || score < meilleur.score) meilleur = { numero, essai, score };
    });

    return {
      version: version,
      masque: meilleur.numero,
      taille: meilleur.essai.taille,
      modules: meilleur.essai.modules,
    };
  }

  /**
   * SVG du QR : un seul <path> pour les modules sombres, zone silencieuse
   * blanche comprise. `taille` en pixels, `marge` en modules.
   */
  function svg(contenu, options) {
    const opts = options || {};
    const marge = opts.marge === undefined ? 4 : opts.marge;
    const m = matrice(contenu, opts);
    const un = opts.unitaire ? 1 : 4; /* 4 unités par module : dimensions rondes */
    const cote = (m.taille + marge * 2) * un;
    let d = '';
    for (let r = 0; r < m.taille; r++) {
      let c = 0;
      while (c < m.taille) {
        if (!m.modules[r][c]) {
          c++;
          continue;
        }
        let debut = c;
        while (c < m.taille && m.modules[r][c]) c++;
        d += 'M' + (debut + marge) * un + ' ' + (r + marge) * un + 'h' + (c - debut) * un + 'v' + un + 'h' + -(c - debut) * un + 'z';
      }
    }
    const taille = opts.taille || 220;
    const sombre = opts.sombre || '#14161a';
    const clair = opts.clair || '#ffffff';
    const role = opts.titre ? ' role="img" aria-label="' + echappe(opts.titre) + '"' : ' aria-hidden="true"';
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" class="qr" viewBox="0 0 ' +
      cote +
      ' ' +
      cote +
      '" width="' +
      taille +
      '" height="' +
      taille +
      '" shape-rendering="crispEdges"' +
      role +
      '><rect width="' +
      cote +
      '" height="' +
      cote +
      '" fill="' +
      clair +
      '"/><path d="' +
      d +
      '" fill="' +
      sombre +
      '"/></svg>'
    );
  }

  function echappe(txt) {
    return String(txt).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* PNG pour l'impression : canvas, résolution au 1/3 de la taille demandée. */
  function png(contenu, options) {
    const opts = options || {};
    const m = matrice(contenu, opts);
    const marge = opts.marge === undefined ? 4 : opts.marge;
    const echelle = opts.echelle || 8;
    const cote = (m.taille + marge * 2) * echelle;
    const canevas = document.createElement('canvas');
    canevas.width = cote;
    canevas.height = cote;
    const ctx = canevas.getContext('2d');
    ctx.fillStyle = opts.clair || '#fff';
    ctx.fillRect(0, 0, cote, cote);
    ctx.fillStyle = opts.sombre || '#14161a';
    for (let r = 0; r < m.taille; r++) {
      for (let c = 0; c < m.taille; c++) {
        if (m.modules[r][c]) ctx.fillRect((c + marge) * echelle, (r + marge) * echelle, echelle, echelle);
      }
    }
    return canevas.toDataURL('image/png');
  }

  global.QR = { matrice, svg, png, version: '1.0' };
})(typeof window !== 'undefined' ? window : globalThis);
