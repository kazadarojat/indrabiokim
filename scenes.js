/* Indra Lab — ilustrasi 2D jalur sinyal.
   Satu bahasa gambar untuk enam jalur: lempeng anatomi, kaskade molekul,
   membran dengan kanal, efektor, dan jejak potensial membran. */

const VIGNETTES = {
  optik: `
    <text class="v-cap" x="14" y="22">Potongan mata</text>
    <path class="v-line" d="M52 164c-20 26-20 82 0 108"/>
    <ellipse class="v-line" cx="132" cy="218" rx="84" ry="82"/>
    <ellipse class="v-line" cx="70" cy="218" rx="13" ry="30"/>
    <path class="v-line" d="M199 154a84 80 0 0 1 0 128" stroke-width="7" opacity=".18"/>
    <path class="v-line" d="M204 256c22 10 30 24 28 40"/>
    <path class="v-line" d="M152 218h62" stroke-dasharray="2 4" opacity=".5"/>
    <g fill="var(--accent)"><circle cx="205" cy="168" r="2.2"/><circle cx="208" cy="184" r="2.2"/><circle cx="211" cy="200" r="2.2"/><circle cx="211" cy="218" r="2.2"/><circle cx="208" cy="236" r="2.2"/><circle cx="205" cy="252" r="2.2"/></g>
    <path class="v-line v-accent" d="M8 218h30" marker-end="url(#arw)"/>
    <text class="v-lab" x="8" y="206">cahaya</text>
    <text class="v-lab" x="214" y="300">retina</text>
    <path class="v-line" d="M210 292l-10 12" opacity=".6"/>
    <g transform="translate(44,340)">
      <path class="v-line" d="M28 0v84"/>
      <path class="v-line" d="M14 8h28M14 18h28M14 28h28M14 38h28M14 48h28M14 58h28"/>
      <path class="v-line" d="M40 74c14 0 14 16 0 16"/>
      <circle class="v-dot" cx="46" cy="100" r="4"/>
      <text class="v-lab" x="62" y="24">fotoreseptor</text>
      <text class="v-sub" x="62" y="40">batang</text>
    </g>`,
  integumen: `
    <text class="v-cap" x="14" y="22">Potongan kulit</text>
    <path class="v-skin" d="M14 70q18-12 36 0t36 0 36 0 36 0 36 0 36 0v46H14z"/>
    <path class="v-line" d="M14 70q18-12 36 0t36 0 36 0 36 0 36 0 36 0"/>
    <path class="v-line" d="M14 116q18-10 36 0t36 0 36 0 36 0 36 0 36 0"/>
    <path class="v-line" d="M14 300h212"/>
    <g fill="var(--rule2)"><circle cx="40" cy="330" r="7"/><circle cx="78" cy="352" r="9"/><circle cx="122" cy="332" r="6"/><circle cx="166" cy="356" r="8"/><circle cx="202" cy="330" r="7"/><circle cx="60" cy="390" r="8"/><circle cx="140" cy="396" r="7"/><circle cx="190" cy="382" r="6"/></g>
    <path class="v-line" d="M176 74q-10 62-24 150"/>
    <path class="v-line" d="M152 224q-16 10 0 22 16-12 0-22z"/>
    <path class="v-line v-accent" d="M34 430q22-60 8-118-8-32 10-54 20-24 38-26 16-2 22-16"/>
    <path class="v-line v-accent" d="M112 216q16-20 6-36M112 216q22 2 30-8M112 216q-2-24-18-30"/>
    <circle class="v-ring" cx="112" cy="216" r="16"/>
    <text class="v-lab" x="140" y="216">ujung saraf</text>
    <text class="v-sub" x="140" y="231">bebas</text>
    <text class="v-lab" x="24" y="98">epidermis</text>
    <text class="v-lab" x="24" y="170">dermis</text>
    <text class="v-lab" x="24" y="322">hipodermis</text>
    <g class="v-accent"><path d="M206 40c0 6 8 6 8 0M198 46c0 6 8 6 8 0M214 46c0 6 8 6 8 0"/></g>
    <text class="v-lab" x="188" y="66">40 °C</text>`,
  olfaktori: `
    <text class="v-cap" x="14" y="22">Rongga nasal</text>
    <path class="v-soft" d="M40 92c-18 76 10 196 76 250 62-40 84-168 60-250z"/>
    <path class="v-line" d="M110 100v236"/>
    <path class="v-line" d="M42 92h164"/>
    <path class="v-line" d="M42 84h164" stroke-width="3"/>
    <path class="v-line" d="M46 100c22-18 44-18 66 0M118 100c20-18 42-18 62 0" opacity=".55"/>
    <g fill="var(--accent)"><circle cx="58" cy="106" r="2"/><circle cx="76" cy="104" r="2"/><circle cx="94" cy="106" r="2"/><circle cx="128" cy="106" r="2"/><circle cx="146" cy="104" r="2"/><circle cx="164" cy="106" r="2"/></g>
    <g class="v-line" opacity=".7"><path d="M58 106v14M76 104v16M94 106v14M128 106v14M146 104v16M164 106v14"/></g>
    <path class="v-line v-accent" d="M60 106V46M76 104V46M94 106V46M128 106V46M146 104V46M164 106V46" opacity=".45"/>
    <ellipse class="v-line" cx="112" cy="42" rx="58" ry="16"/>
    <g fill="var(--ink)" opacity=".5"><circle cx="88" cy="42" r="3"/><circle cx="112" cy="40" r="3"/><circle cx="136" cy="42" r="3"/></g>
    <path class="v-line v-accent" d="M24 214h22" marker-end="url(#arw)"/>
    <text class="v-lab" x="20" y="202">odoran</text>
    <text class="v-lab" x="130" y="70">bulbus</text>
    <text class="v-lab" x="134" y="300">epitel</text>
    <text class="v-sub" x="134" y="315">olfaktori</text>`,
  gustatori: `
    <text class="v-cap" x="14" y="22">Papila &amp; tunas pengecap</text>
    <path class="v-soft" d="M14 130h212v280H14z"/>
    <path class="v-line" d="M14 130h212"/>
    <path class="v-line" d="M58 130v-18M182 130v-18"/>
    <path class="v-line" d="M58 112h124"/>
    <path class="v-line" d="M88 112v-18M152 112v-18"/>
    <path class="v-soft" d="M74 94h92v-26H74z"/>
    <ellipse class="v-line v-accent" cx="120" cy="164" rx="20" ry="30"/>
    <g class="v-line" opacity=".8"><path d="M112 140v60M120 138v64M128 140v60"/></g>
    <path class="v-line v-accent" d="M112 134v-12M120 132v-14M128 134v-12"/>
    <path class="v-line" d="M104 194c0 24 8 44 0 62M120 194v66M136 194c0 24-8 44 0 62"/>
    <circle class="v-dot" cx="120" cy="270" r="3"/>
    <text class="v-lab" x="30" y="112">pori</text>
    <text class="v-lab" x="148" y="170">tunas</text>
    <text class="v-sub" x="148" y="185">pengecap</text>
    <text class="v-lab" x="150" y="268">serat aferen</text>
    <path class="v-line" d="M104 130c-30 26-44 64-44 106M136 130c30 26 44 64 44 106" opacity=".35"/>`,
  vestibular: `
    <text class="v-cap" x="14" y="22">Makula sakulus</text>
    <path class="v-soft" d="M54 82c-30 26-30 98 4 118 30 18 68 18 96-2 28-20 28-78 2-108-26-30-74-34-102-8z"/>
    <path class="v-line" d="M62 160c36-18 82-18 118 0"/>
    <path class="v-line" d="M62 160c6 30 28 44 58 44s52-14 58-44" opacity=".5"/>
    <path class="v-line" d="M58 138q58-16 116 0"/>
    <g class="v-line"><path d="M76 138v-20M92 136v-22M108 134v-24M124 134v-24M140 136v-22M156 138v-20"/></g>
    <g fill="var(--accent)"><circle cx="76" cy="112" r="3"/><circle cx="92" cy="108" r="3"/><circle cx="108" cy="104" r="3"/><circle cx="124" cy="104" r="3"/><circle cx="140" cy="108" r="3"/><circle cx="156" cy="112" r="3"/></g>
    <path class="v-line" d="M118 68v-18" marker-end="url(#arw)"/>
    <text class="v-lab" x="128" y="62">lift naik</text>
    <text class="v-lab" x="24" y="226">otokonia</text>
    <path class="v-line" d="M62 220l16-14" opacity=".6"/>
    <text class="v-lab" x="132" y="246">stereosilia</text>
    <text class="v-lab" x="132" y="262">+ kinosilia</text>
    <text class="v-lab" x="66" y="282">sel rambut</text>
    <path class="v-line v-accent" d="M104 120v14" marker-end="url(#arw)"/>`,
  koklear: `
    <text class="v-cap" x="14" y="22">Koklea &amp; organ of Corti</text>
    <g transform="translate(44,40)">
      <path class="v-line" d="M58 70c-38 0-46-34-22-52 26-20 62-10 70 16 8 26-14 48-42 46-24-2-32-26-18-40 10-10 26-8 32 2"/>
      <path class="v-line" d="M58 70c-30 0-36-26-17-41 21-16 49-8 56 13 6 20-11 37-33 35-19-1-25-20-14-31 8-8 20-6 25 1" opacity=".55"/>
      <text class="v-lab" x="-12" y="92">koklea</text>
    </g>
    <path class="v-line" d="M14 186h212" opacity=".5"/>
    <text class="v-lab" x="14" y="176">Potongan membujur</text>
    <path class="v-line" d="M32 214h172" stroke-width="2"/>
    <path class="v-line" d="M32 226h172" opacity=".55"/>
    <path class="v-line" d="M32 250h172" opacity=".55"/>
    <path class="v-line" d="M32 262h172" stroke-width="2"/>
    <text class="v-sub" x="34" y="242">skala media</text>
    <path class="v-line v-accent" d="M32 262q12-18 24 0t24 0 24 0 24 0 24 0 24 0 24 0"/>
    <path class="v-line" d="M70 250q0-20 16-20t16 20" opacity=".7"/>
    <text class="v-lab" x="112" y="300">membran basilaris</text>
    <path class="v-line" d="M112 288l-6-18" opacity=".6"/>
    <g transform="translate(34,330)">
      <path class="v-line" d="M0 64h180"/>
      <path class="v-line" d="M38 64V26M94 64V26M150 64V26"/>
      <path class="v-line" d="M24 26h136"/>
      <path class="v-line v-accent" d="M38 26l-8-18M94 26l-8-18M150 26l-8-18"/>
      <path class="v-line" d="M24 8q54-16 136 0" opacity=".5"/>
      <text class="v-lab" x="0" y="84">organ of Corti</text>
    </g>`
};

const SCENES = {
  optik: {
    vignette: 'optik',
    cascade: [
      { id: 'photon', label: 'Foton', sub: 'cahaya masuk' },
      { id: 'retinal', label: 'Retinal', sub: '11-cis → all-trans' },
      { id: 'metarhodopsin', label: 'Metarodopsin II', sub: 'fotopigmen aktif' },
      { id: 'transducin', label: 'Transducin', sub: 'Gαt · GTP' },
      { id: 'pde', label: 'PDE6', sub: 'fosfodiesterase' },
      { id: 'cgmp', label: 'cGMP', sub: 'turun' }
    ],
    channels: [
      { id: 'cng', label: 'Kanal CNG', x: 452, init: 'open', gate: { 7: 'closed' } },
      { id: 'kch', label: 'Kanal K⁺', x: 700, init: 'open' }
    ],
    membrane: { top: 'Ruang intradisk', bottom: 'Sitosol' },
    effector: { id: 'vesicle', kind: 'vesicle', label: 'Glutamat', x: 700, states: { 0: 'quiet', 9: 'active' }, stateLabels: { quiet: 'pelepasan tinggi', active: 'pelepasan turun' } },
    trace: { min: -80, max: 20, label: 'Potensial membran' }
  },
  integumen: {
    vignette: 'integumen',
    cascade: [
      { id: 'thermo', label: 'Suhu 40 °C', sub: 'stimulus termal' },
      { id: 'ions', label: 'Na⁺ + Ca²⁺ masuk', sub: 'potensial reseptor' },
      { id: 'depol', label: 'Depolarisasi', sub: 'ambang tercapai' },
      { id: 'spinal', label: 'Medula spinalis', sub: 'kornu posterior' },
      { id: 'cortex', label: 'Korteks', sub: 'sensasi hangat' }
    ],
    channels: [
      { id: 'trpv', label: 'TRPV', x: 470, init: 'closed', gate: { 1: 'open' } }
    ],
    membrane: { top: 'Epidermis', bottom: 'Sitosol ujung saraf' },
    effector: { id: 'ap', kind: 'ap', label: 'Potensial aksi', x: 700, states: { 0: 'quiet', 4: 'active' }, stateLabels: { quiet: 'subambang', active: 'denyut berjalan' } },
    trace: { min: -80, max: 40, label: 'Potensial membran' }
  },
  olfaktori: {
    vignette: 'olfaktori',
    cascade: [
      { id: 'odor', label: 'Odoran', sub: 'larut dalam mukus' },
      { id: 'or', label: 'Reseptor OR', sub: 'GPCR tipe II' },
      { id: 'golf', label: 'Gαolf', sub: 'GDP → GTP' },
      { id: 'ac', label: 'Adenilil siklase III', sub: 'ATP → cAMP' },
      { id: 'camp', label: 'cAMP', sub: 'naik' }
    ],
    channels: [
      { id: 'cng', label: 'Kanal CNG', x: 440, init: 'closed', gate: { 5: 'open' } },
      { id: 'clc', label: 'Kanal Cl⁻', x: 660, init: 'closed', gate: { 8: 'open' } }
    ],
    membrane: { top: 'Mukus', bottom: 'Sitosol OSN' },
    effector: { id: 'ap', kind: 'ap', label: 'Potensial aksi', x: 760, states: { 0: 'quiet', 10: 'active' }, stateLabels: { quiet: 'subambang', active: 'menuju bulbus' } },
    trace: { min: -70, max: 40, label: 'Potensial membran' }
  },
  gustatori: {
    vignette: 'gustatori',
    cascade: [
      { id: 'tastan', label: 'Tastan manis', sub: 'gula dalam saliva' },
      { id: 't1r', label: 'T1R2 + T1R3', sub: 'GPCR kelas C' },
      { id: 'gust', label: 'Gustducin', sub: 'Gβγ terlepas' },
      { id: 'plc', label: 'PLCβ2', sub: 'PIP2 → IP3 + DAG' },
      { id: 'ip3r', label: 'Reseptor IP3', sub: 'retikulum endoplasma' }
    ],
    channels: [
      { id: 'trpm5', label: 'TRPM5', x: 470, init: 'closed', gate: { 7: 'open' } },
      { id: 'calhm', label: 'CALHM1/3', x: 690, init: 'closed', gate: { 9: 'open' } }
    ],
    membrane: { top: 'Pori rasa', bottom: 'Sitosol sel tipe II' },
    effector: { id: 'atp', kind: 'atp', label: 'ATP', x: 770, states: { 0: 'quiet', 10: 'active' }, stateLabels: { quiet: 'di dalam sel', active: 'ke serat aferen' } },
    trace: { min: -70, max: 40, label: 'Potensial membran' }
  },
  vestibular: {
    vignette: 'vestibular',
    cascade: [
      { id: 'lift', label: 'Lift naik', sub: 'percepatan vertikal' },
      { id: 'otolith', label: 'Otokonia bergeser', sub: 'gaya geser' },
      { id: 'deflect', label: 'Defleksi stereosilia', sub: 'ke arah kinosilia' },
      { id: 'depol', label: 'Depolarisasi', sub: 'K⁺ masuk' }
    ],
    channels: [
      { id: 'met', label: 'Kanal MET', x: 420, init: 'closed', gate: { 4: 'open' } },
      { id: 'cav', label: 'Cav1.3', x: 640, init: 'closed', gate: { 7: 'open' } }
    ],
    membrane: { top: 'Endolimfe (K⁺ tinggi)', bottom: 'Sitosol sel rambut' },
    effector: { id: 'vesicle', kind: 'vesicle', label: 'Glutamat', x: 770, states: { 0: 'quiet', 9: 'active' }, stateLabels: { quiet: 'tonik basal', active: 'eksositosis' } },
    trace: { min: -70, max: 30, label: 'Potensial membran' }
  },
  koklear: {
    vignette: 'koklear',
    cascade: [
      { id: 'sound', label: 'Gelombang suara', sub: 'tekanan udara' },
      { id: 'tympanum', label: 'Membran timpani', sub: 'bergetar' },
      { id: 'ossicles', label: 'Stapes', sub: 'menekan tingkap oval' },
      { id: 'basilar', label: 'Membran basilaris', sub: 'gelombang tekanan' },
      { id: 'tectorial', label: 'Membran tektoria', sub: 'gerak relatif' },
      { id: 'deflect', label: 'Defleksi stereosilia', sub: 'ke arah tertinggi' }
    ],
    channels: [
      { id: 'met', label: 'Kanal MET', x: 440, init: 'closed', gate: { 8: 'open' } },
      { id: 'cav', label: 'Cav1.3', x: 660, init: 'closed', gate: { 10: 'open' } }
    ],
    membrane: { top: 'Endolimfe', bottom: 'Sitosol sel rambut' },
    effector: { id: 'vesicle', kind: 'vesicle', label: 'Glutamat', x: 770, states: { 0: 'quiet', 11: 'active' }, stateLabels: { quiet: 'tonik basal', active: 'ke nervus VIII' } },
    trace: { min: -70, max: 30, label: 'Potensial membran' }
  }
};

function svgText(x, y, str, cls) {
  return `<text class="${cls}" x="${x}" y="${y}">${str}</text>`;
}

function nodePos(i) {
  const row = Math.floor(i / 3);
  const backward = row % 2 === 1;
  const col = backward ? 2 - (i % 3) : i % 3;
  return { x: 300 + col * 192, y: 36 + row * 74, col };
}

function sceneMarkup(path, idx) {
  const cfg = SCENES[path.id];
  const step = path.steps[idx];
  const active = new Set(step.on || []);
  const nodes = cfg.cascade;
  const gateState = (ch) => {
    let s = ch.init;
    for (const [at, v] of Object.entries(ch.gate || {})) if (idx >= +at) s = v;
    return s;
  };
  const eff = cfg.effector;
  let effState = 'quiet';
  for (const [at, v] of Object.entries(eff.states || {})) if (idx >= +at) effState = v;

  const wires = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodePos(i), b = nodePos(i + 1);
    const on = active.has(nodes[i].id) && active.has(nodes[i + 1].id);
    if (a.col === b.col) {
      const x = a.x + 88;
      wires.push(`<path class="wire${on ? ' on' : ''}" d="M${x} ${a.y + 46}V${b.y}" marker-end="url(#arw)"/>`);
    } else {
      const dir = b.x > a.x ? 1 : -1;
      const x1 = a.x + (dir > 0 ? 176 : 0);
      const x2 = b.x + (dir > 0 ? 0 : 176);
      wires.push(`<path class="wire${on ? ' on' : ''}" d="M${x1} ${a.y + 23}H${x2}" marker-end="url(#arw)"/>`);
    }
  }

  const cascade = nodes.map((n, i) => {
    const p = nodePos(i);
    const on = active.has(n.id);
    return `<g class="node${on ? ' on' : ''}">
      <rect x="${p.x}" y="${p.y}" width="176" height="46" rx="4"/>
      ${svgText(p.x + 12, p.y + 20, n.label, 'n-lab')}
      ${svgText(p.x + 12, p.y + 35, n.sub, 'n-sub')}
    </g>`;
  }).join('');

  const channels = cfg.channels.map((ch) => {
    const open = gateState(ch) === 'open';
    const up = ch.x - 23, y = 252;
    const flux = (step.ions || []).filter((f) => f.at === ch.id);
    const dots = flux.map((f) => {
      const inb = f.dir === 'in';
      return `<g class="flux">${[0, 1, 2].map((k) => `<circle class="ion-dot ${inb ? 'in' : 'out'}" cx="${ch.x + (k - 1) * 9}" cy="${inb ? 214 : 292}" r="3.4" style="animation-delay:${k * 0.28}s"/>`).join('')}<text class="ion-lab" x="${ch.x - 20}" y="${inb ? 208 : 314}">${f.s}</text></g>`;
    }).join('');
    return `<g class="chan${open ? ' open' : ''}${active.has(ch.id) ? ' on' : ''}">
      <rect class="ch-body" x="${up}" y="${y - 27}" width="10" height="54" rx="3"/>
      <rect class="ch-body" x="${ch.x + 13}" y="${y - 27}" width="10" height="54" rx="3"/>
      <path class="ch-gate" d="${open ? `M${up + 12} ${y - 12}l10 12-10 12M${ch.x + 11} ${y - 12}l-10 12 10 12` : `M${up + 12} ${y - 4}h22`}"/>
      <text class="ch-lab" x="${ch.x + 32}" y="${y - 4}">${ch.label}</text>
      <text class="ch-state" x="${ch.x + 32}" y="${y + 12}">${open ? 'terbuka' : 'tertutup'}</text>
      ${dots}
    </g>`;
  }).join('');

  const trace = cfg.trace;
  const px = 330, pw = 536, py = 414, ph = 92;
  const yOf = (v) => py + ph - ((v - trace.min) / (trace.max - trace.min)) * ph;
  const pts = path.steps.map((s, i) => `${px + (i / (path.steps.length - 1)) * pw},${yOf(s.vm)}`).join(' ');
  const ptsSoFar = path.steps.slice(0, idx + 1).map((s, i) => `${px + (i / (path.steps.length - 1)) * pw},${yOf(s.vm)}`).join(' ');
  const cx = px + (idx / (path.steps.length - 1)) * pw;
  const cy = yOf(step.vm);
  const ticks = [-70, -40, 0, 30].filter((t) => t >= trace.min && t <= trace.max);
  if (cfg.effector.kind === 'vesicle') {
    // keep ticks simple and meaningful for all ranges
  }
  const tickMarks = ticks.map((t) => `<g><line class="grid" x1="${px}" x2="${px + pw}" y1="${yOf(t)}" y2="${yOf(t)}"/><text class="tick" x="${px - 10}" y="${yOf(t) + 4}">${t}</text></g>`).join('');

  const effMarkup = eff.kind === 'vesicle'
    ? `<g class="effector${effState === 'active' ? ' active' : ''}" transform="translate(${eff.x},330)">
        <circle class="ves" cx="0" cy="0" r="17"/>
        <circle class="ves-dot" cx="-5" cy="-3" r="2.6"/><circle class="ves-dot" cx="4" cy="-4" r="2.6"/><circle class="ves-dot" cx="0" cy="6" r="2.6"/>
        <path class="eff-arrow" d="M24 0h22" marker-end="url(#arw)"/>
        <text class="eff-lab" x="52" y="-1">${eff.label}</text>
        <text class="eff-state" x="52" y="14">${eff.stateLabels[effState]}</text>
      </g>`
    : eff.kind === 'ap'
    ? `<g class="effector${effState === 'active' ? ' active' : ''}" transform="translate(${eff.x},322)">
        <path class="ap-line" d="M0 14h18l8-26 10 38 8-12h26"/>
        <text class="eff-lab" x="0" y="48">${eff.label}</text>
        <text class="eff-state" x="0" y="63">${eff.stateLabels[effState]}</text>
      </g>`
    : `<g class="effector${effState === 'active' ? ' active' : ''}" transform="translate(${eff.x},338)">
        <rect class="atp-box" x="-26" y="-14" width="52" height="28" rx="4"/>
        <text class="atp-lab" x="0" y="4" text-anchor="middle">ATP</text>
        <path class="eff-arrow" d="M32 0h26" marker-end="url(#arw)"/>
        <text class="eff-lab" x="64" y="-2">${eff.label}</text>
        <text class="eff-state" x="64" y="13">${eff.stateLabels[effState]}</text>
      </g>`;

  return `<svg class="scene" viewBox="0 0 900 540" role="img" aria-label="Diagram jalur ${path.name}, langkah ${idx + 1}: ${step.t}">
    <defs>
      <marker id="arw" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M0 0l8 4-8 4z" fill="currentColor"/>
      </marker>
    </defs>
    <g transform="translate(16,24)">
      <rect class="vig-bg" x="0" y="0" width="240" height="470" rx="8"/>
      ${VIGNETTES[cfg.vignette]}
    </g>
    <g class="cascade">${wires.join('')}${cascade}</g>
    <g class="membrane">
      <rect class="mem-band" x="300" y="246" width="584" height="12"/>
      <line class="mem-line" x1="300" x2="884" y1="246" y2="246"/>
      <line class="mem-line" x1="300" x2="884" y1="258" y2="258"/>
      ${svgText(300, 236, cfg.membrane.top, 'mem-lab')}
      ${svgText(300, 286, cfg.membrane.bottom, 'mem-lab')}
      ${channels}
    </g>
    ${effMarkup}
    <g class="trace">
      ${svgText(300, 392, trace.label, 'trace-lab')}
      ${tickMarks}
      <polyline class="trace-line" points="${pts}"/>
      <polyline class="trace-active" points="${ptsSoFar}"/>
      <line class="trace-guide" x1="${cx}" x2="${cx}" y1="${py}" y2="${py + ph}"/>
      <circle class="trace-dot" cx="${cx}" cy="${cy}" r="5"/>
      ${svgText(cx + 10, cy - 8, `${step.vm} mV`, 'trace-val')}
      ${svgText(px, py + ph + 20, 'langkah 1', 'trace-x')}
      ${svgText(px + pw, py + ph + 20, `langkah ${path.steps.length}`, 'trace-x end')}
    </g>
  </svg>`;
}/* Susunan padat untuk layar sempit: rantai tegak, membran, efektor, jejak. */
function traceSmall(path, idx) {
  const cfg = SCENES[path.id];
  const trace = cfg.trace;
  const w = 340, h = 122, padL = 40, padR = 10, padT = 18, padB = 26;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const yOf = (v) => padT + plotH - ((v - trace.min) / (trace.max - trace.min)) * plotH;
  const pts = path.steps.map((s, i) => `${padL + (i / (path.steps.length - 1)) * plotW},${yOf(s.vm)}`).join(' ');
  const ptsSoFar = path.steps.slice(0, idx + 1).map((s, i) => `${padL + (i / (path.steps.length - 1)) * plotW},${yOf(s.vm)}`).join(' ');
  const cx = padL + (idx / (path.steps.length - 1)) * plotW;
  const cy = yOf(path.steps[idx].vm);
  let ticks = [-70, -40, 0, 30].filter((t) => t >= trace.min && t <= trace.max);
  if (ticks.length > 3) ticks = [ticks[0], ticks[Math.floor(ticks.length / 2)], ticks[ticks.length - 1]];
  const marks = ticks.map((t) => `<line class="grid" x1="${padL}" x2="${w - padR}" y1="${yOf(t)}" y2="${yOf(t)}"/><text class="tick" x="${padL - 8}" y="${yOf(t) + 4}">${t}</text>`).join('');
  return `<svg class="scene small" viewBox="0 0 ${w} ${h}" role="img" aria-label="Jejak potensial membran jalur ${path.name}">
    ${svgText(padL - 8, 11, trace.label, 'trace-lab')}
    ${marks}
    <polyline class="trace-line" points="${pts}"/>
    <polyline class="trace-active" points="${ptsSoFar}"/>
    <line class="trace-guide" x1="${cx}" x2="${cx}" y1="${padT}" y2="${padT + plotH}"/>
    <circle class="trace-dot" cx="${cx}" cy="${cy}" r="4.5"/>
    ${svgText(cx + 9, cy - 7, path.steps[idx].vm + ' mV', 'trace-val')}
  </svg>`;
}

function sceneMarkupMobile(path, idx) {
  const cfg = SCENES[path.id];
  const step = path.steps[idx];
  const active = new Set(step.on || []);
  const gateState = (ch) => {
    let s = ch.init;
    for (const [at, v] of Object.entries(ch.gate || {})) if (idx >= +at) s = v;
    return s;
  };
  const eff = cfg.effector;
  let effState = 'quiet';
  for (const [at, v] of Object.entries(eff.states || {})) if (idx >= +at) effState = v;

  const chain = cfg.cascade.map((n) => `<li class="${active.has(n.id) ? 'on' : ''}"><span>${n.label}</span><span class="sub">${n.sub}</span></li>`).join('');
  const chans = cfg.channels.map((ch) => {
    const open = gateState(ch) === 'open';
    const flux = (step.ions || []).filter((f) => f.at === ch.id);
    const arrows = flux.map((f) => `<span class="m-flux">${f.dir === 'in' ? '↓' : '↑'} ${f.s}</span>`).join('');
    return `<span class="m-chan${open ? ' open' : ''}${active.has(ch.id) ? ' on' : ''}">${ch.label} · ${open ? 'terbuka' : 'tertutup'}${arrows}</span>`;
  }).join('');
  return `<div class="m-scene">
    <ol class="m-chain">${chain}</ol>
    <div class="m-membrane">
      <span class="m-mem-lab">Membran · luar: ${cfg.membrane.top} · dalam: ${cfg.membrane.bottom}</span>
      ${chans}
    </div>
    <p class="m-eff${effState === 'active' ? ' active' : ''}">${eff.label} · ${eff.stateLabels[effState]}</p>
    ${traceSmall(path, idx)}
  </div>`;
}