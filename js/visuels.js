/*
 * Electro 21 — visuels des produits
 * -----------------------------------------------------------------------------
 * Le site fonctionne sans photographie : chaque produit est dessiné en SVG, en
 * traits fins, à partir de son type (phone, laptop, watch…). Dès qu'une photo
 * réelle est déposée dans assets/produits/<slug>.jpg, elle remplace le dessin.
 *
 * Couleurs et épaisseurs viennent de la feuille de style (variables CSS) afin
 * de pouvoir relooker le catalogue sans toucher à ce fichier.
 */
(function () {
  const V = {
    phone: `
      <rect class="trait" x="86" y="22" width="68" height="136" rx="14"/>
      <rect class="fond" x="94" y="34" width="52" height="106" rx="7"/>
      <path class="trait" d="M112 28h16"/>
      <circle class="detail" cx="120" cy="150" r="4"/>`,
    tablet: `
      <rect class="trait" x="66" y="20" width="108" height="140" rx="13"/>
      <rect class="fond" x="76" y="32" width="88" height="116" rx="7"/>
      <circle class="detail" cx="120" cy="26" r="3"/>`,
    laptop: `
      <rect class="trait" x="52" y="28" width="136" height="88" rx="8"/>
      <rect class="fond" x="62" y="38" width="116" height="68" rx="4"/>
      <path class="trait" d="M34 132h172l-14-16H48z"/>
      <path class="detail" d="M104 140h32"/>`,
    monitor: `
      <rect class="trait" x="36" y="26" width="168" height="98" rx="7"/>
      <rect class="fond" x="46" y="36" width="148" height="78" rx="3"/>
      <path class="trait" d="M108 124v18M132 124v18M88 158h64"/>`,
    earbuds: `
      <rect class="trait" x="70" y="86" width="100" height="60" rx="18"/>
      <path class="detail" d="M70 104h100"/>
      <path class="trait" d="M96 30c14 0 20 12 20 26v14c0 9-6 16-14 16h-6c-9 0-16-7-16-16V56c0-8-4-12-4-18"/>
      <path class="trait" d="M156 44v26c0 9-6 16-14 16h-6c-9 0-16-7-16-16V70"/>`,
    charger: `
      <rect class="trait" x="74" y="52" width="70" height="70" rx="14"/>
      <rect class="detail" x="96" y="78" width="26" height="18" rx="4"/>
      <path class="trait" d="M88 40v12M120 40v12"/>
      <path class="fond" d="M144 96h22c10 0 14 8 14 18v22"/>`,
    battery: `
      <rect class="trait" x="48" y="50" width="144" height="80" rx="18"/>
      <rect class="detail" x="70" y="76" width="46" height="28" rx="5"/>
      <path class="trait" d="M132 74v32M152 74v32"/>
      <path class="fond" d="M192 78v24"/>`,
    sdcard: `
      <path class="trait" d="M78 30h72l22 22v96a8 8 0 0 1-8 8H86a8 8 0 0 1-8-8V38a8 8 0 0 1 8-8z"/>
      <path class="detail" d="M96 52h20M124 52h16M96 70h16"/>
      <path class="fond" d="M96 96h56v30H96z"/>`,
    speaker: `
      <rect class="trait" x="40" y="56" width="160" height="68" rx="34"/>
      <path class="detail" d="M84 74v32M104 70v40M124 74v32M144 78v24"/>
      <circle class="trait" cx="182" cy="90" r="7"/>`,
    headphone: `
      <path class="trait" d="M52 112V92a68 68 0 0 1 136 0v20"/>
      <rect class="trait" x="40" y="98" width="38" height="60" rx="14"/>
      <rect class="fond" x="162" y="98" width="38" height="60" rx="14"/>`,
    watch: `
      <rect class="trait" x="82" y="52" width="76" height="76" rx="20"/>
      <rect class="detail" x="94" y="64" width="52" height="52" rx="12"/>
      <path class="fond" d="M96 52l6-26h36l6 26M96 128l6 26h36l6-26"/>
      <path class="trait" d="M120 78v16l10 6"/>`,
  };

  const DESSINS_DISPONIBLES = Object.keys(V);

  /** Retourne le SVG d'un type d'appareil, ou un dessin générique si inconnu. */
  function visuel(type) {
    const corps = V[type] || V.phone;
    return (
      '<svg class="dessin" viewBox="0 0 240 180" role="img" aria-hidden="true" focusable="false">' +
      corps.replace(/\s+$/, '') +
      '</svg>'
    );
  }

  window.ELECTRO21Visuel = { visuel: visuel, types: DESSINS_DISPONIBLES };
})();
