/* Indra Lab · aplikasi: rute, pemutar diagram, mesin kuis, penyimpanan kemajuan. */

(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var PATH = {}; JALUR.forEach(function (p) { PATH[p.id] = p; });
  var TOTAL_STEPS = JALUR.reduce(function (a, p) { return a + p.steps.length; }, 0);
  var TOTAL_QUIZ = JALUR.reduce(function (a, p) { return a + p.quiz.length; }, 0);

  /* ---------- penyimpanan ---------- */
  var KEY = 'indralab.kemajuan.v1';
  var mem = null;
  function blank() { return { paths: {}, sessions: [] }; }
  function store() {
    if (mem) return mem;
    try {
      var raw = localStorage.getItem(KEY);
      mem = raw ? JSON.parse(raw) : blank();
    } catch (e) { mem = blank(); }
    if (!mem || typeof mem !== 'object') mem = blank();
    if (!mem.paths) mem.paths = {};
    if (!mem.sessions) mem.sessions = [];
    return mem;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(store())); } catch (e) { /* mode privat */ }
  }
  function rec(id) {
    var s = store();
    if (!s.paths[id]) s.paths[id] = { best: null, attempts: 0, last: null, steps: [] };
    return s.paths[id];
  }
  function statusOf(id) {
    var r = store().paths[id];
    if (!r || !r.attempts) return { k: 'none', label: 'Belum diuji' };
    if (r.best === null) return { k: 'mid', label: 'Belum lengkap' };
    if (r.best >= 80) return { k: 'ok', label: 'Dikuasai' };
    return { k: 'mid', label: 'Perlu diulang' };
  }
  function stepsRead(id) { var r = store().paths[id]; return r && r.steps ? r.steps.length : 0; }
  function avgScore() {
    var vals = JALUR.map(function (p) { var r = store().paths[p.id]; return r && r.attempts ? r.best : null; })
      .filter(function (v) { return v !== null; });
    if (!vals.length) return null;
    return Math.round(vals.reduce(function (a, b) { return a + b; }, 0) / vals.length);
  }
  function recommend() {
    var untested = JALUR.filter(function (p) { var r = store().paths[p.id]; return !r || !r.attempts; });
    if (untested.length) return untested[0];
    var worst = JALUR[0];
    JALUR.forEach(function (p) { if ((store().paths[p.id] || {}).best < (store().paths[worst.id] || {}).best) worst = p; });
    return worst;
  }
  function fmtScore(v) { return v === null || v === undefined ? null : v + '%'; }
  function todayLabel() {
    var d = new Date();
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  }

  /* ---------- util ---------- */
  function el(html) { var t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function shuffle(a) {
    var arr = a.slice();
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function announce(msg) { $('#live').textContent = msg; }
  var toastTimer = null;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }
  function dirMark(d) { return d === 'naik' ? '↑' : d === 'turun' ? '↓' : ''; }

  /* ---------- navigasi ---------- */
  function buildNav() {
    var html = '<span class="nav-group">Ruang belajar</span>';
    html += navLink('#/', 'Indeks jalur', 'home');
    html += navLink('#/kuis', 'Kuis', 'kuis');
    html += navLink('#/kemajuan', 'Kemajuan', 'kemajuan');
    html += '<span class="nav-group">Jalur sinyal</span>';
    JALUR.forEach(function (p) {
      var st = statusOf(p.id);
      var dot = st.k === 'ok' ? 'ok' : st.k === 'mid' ? 'mid' : '';
      html += '<a class="nav-link" href="#/jalur/' + p.id + '" data-nav="jalur:' + p.id + '" title="' + esc(p.organ) + '">' +
        '<span>' + esc(p.name) + '</span><span class="dot ' + dot + '"></span></a>';
    });
    $('#sideNav').innerHTML = html;
    $('#sheetNav').innerHTML = html;
    var tested = JALUR.filter(function (p) { var r = store().paths[p.id]; return r && r.attempts; }).length;
    $('#sideProgress').textContent = tested + ' / ' + JALUR.length;
  }
  function navLink(href, label, key) {
    return '<a class="nav-link" href="' + href + '" data-nav="' + key + '">' + esc(label) + '</a>';
  }
  function markNav(route) {
    $$('[data-nav]').forEach(function (a) {
      var key = a.getAttribute('data-nav');
      var on = key === route || (route === 'jalur' && key.indexOf('jalur:' + state.pathId) === 0);
      a.classList.toggle('active', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  /* ---------- state ---------- */
  var state = { route: 'home', pathId: JALUR[0].id, step: 0, playing: false, timer: null, session: null };

  function stopPlay() {
    state.playing = false;
    if (state.timer) { clearInterval(state.timer); state.timer = null; }
  }
  function setStep(n, opts) {
    var p = PATH[state.pathId];
    var max = p.steps.length - 1;
    state.step = Math.max(0, Math.min(max, n));
    var r = rec(state.pathId);
    if (r.steps.indexOf(state.step) < 0) { r.steps.push(state.step); save(); }
    paintStage();
    if (!opts || !opts.silent) announce('Langkah ' + (state.step + 1) + ' dari ' + p.steps.length + ': ' + p.steps[state.step].t);
  }
  function playOrPause() {
    if (state.playing) { stopPlay(); paintStage(); return; }
    if (state.step >= PATH[state.pathId].steps.length - 1) state.step = 0;
    state.playing = true;
    paintStage();
    state.timer = setInterval(function () {
      var p = PATH[state.pathId];
      if (state.step >= p.steps.length - 1) { stopPlay(); paintStage(); return; }
      setStep(state.step + 1, { silent: true });
    }, 2600);
  }

  /* ---------- tampilan: indeks ---------- */
  function renderHome() {
    var mastered = JALUR.filter(function (p) { return statusOf(p.id).k === 'ok'; }).length;
    var tested = JALUR.filter(function (p) { var r = store().paths[p.id]; return r && r.attempts; }).length;
    var read = JALUR.reduce(function (a, p) { return a + stepsRead(p.id); }, 0);
    var avg = avgScore();
    var sessions = store().sessions;
    var next = recommend();
    var finding;
    if (!sessions.length) {
      finding = 'Belum ada kuis yang dikerjakan. Mulai dari fototransduksi · jalur optik memberi dasar bagi lima jalur lainnya.';
    } else if (avg === null) {
      finding = sessions.length + ' sesi sudah dikerjakan, tetapi belum ada jalur yang tuntas seluruh soalnya. Kerjakan satu kuis jalur penuh agar nilainya tercatat.';
    } else {
      var untested = JALUR.filter(function (p) { var r = store().paths[p.id]; return !r || !r.attempts; });
      var incomplete = JALUR.filter(function (p) { var r = store().paths[p.id]; return r && r.attempts && r.best === null; });
      var weakest = recommend();
      if (untested.length) {
        finding = 'Skor rata-rata ' + avg + '% dari ' + tested + ' jalur. ' + untested.length + ' jalur belum diuji; berikutnya ' + untested[0].name.toLowerCase() + '.';
      } else if (incomplete.length) {
        finding = 'Skor rata-rata ' + avg + '% dari ' + tested + ' jalur. ' + incomplete[0].name + ' belum tuntas; kerjakan seluruh soalnya agar nilainya tercatat.';
      } else {
        var wb = (store().paths[weakest.id] || {}).best;
        finding = wb !== null && wb < 80
          ? 'Skor rata-rata ' + avg + '% dari ' + tested + ' jalur. ' + weakest.name + ' (' + fmtScore(wb) + ') paling perlu diulang.'
          : 'Semua ' + JALUR.length + ' jalur sudah diuji. Rata-rata ' + avg + '%; pertahankan dengan mengulang jalur yang nilainya paling rendah.';
      }
    }

    var rows = JALUR.map(function (p) {
      var st = statusOf(p.id);
      var r = store().paths[p.id] || {};
      var score = r.attempts && r.best !== null ? '<span class="score-hue">' + fmtScore(r.best) + '</span>' : '<span class="dash">—</span>';
      return '<tr>' +
        '<td class="cell-thumb"><img class="thumb cover" src="' + p.specimen.file + '" width="52" height="42" alt="" loading="lazy"></td>' +
        '<td class="cell-name"><a href="#/jalur/' + p.id + '">' + esc(p.name) + '</a><span>' + esc(p.title) + ' · ' + esc(p.substrat) + '</span></td>' +
        '<td class="cell-chain">' + esc(p.stimulus) + ' <span class="arrow">→</span> ' + esc(p.transmitter) + (p.id === 'optik' ? ' ↓' : ' ↑') + '</td>' +
        '<td class="cell-steps num">' + p.steps.length + '</td>' +
        '<td class="cell-status"><span class="pill pill-' + st.k + '">' + st.label + '</span></td>' +
        '<td class="cell-score num">' + score + '</td>' +
        '<td class="cell-go"><a href="#/jalur/' + p.id + '" aria-label="Buka jalur ' + esc(p.name) + '">→</a></td>' +
        '</tr>';
    }).join('');

    var lastSession = sessions.length ? sessions[sessions.length - 1] : null;
    var lastPanel = lastSession
      ? '<h2>Kuis terakhir</h2>' +
        '<p>' + esc(lastSession.label) + ' · ' + lastSession.correct + ' dari ' + lastSession.total + ' benar (' + lastSession.pct + '%) pada ' + esc(lastSession.date) + '.</p>' +
        '<p class="foot-note">Sesi dinilai per soal. Nilai jalur dicatat bila seluruh soalnya muncul; langkah diagram yang dibuka ikut terhitung di Kemajuan.</p>' +
        '<div class="quiet-row"><span>Nilai terbaik per jalur tersimpan di Kemajuan.</span><a class="text-link" href="#/kuis">Kuis lagi</a></div>'
      : '<h2>Kuis terakhir</h2>' +
        '<p>Kemajuan muncul di sini setelah sesi pertama. ' + TOTAL_QUIZ + ' soal tersedia, tersebar pada enam jalur.</p>' +
        '<p class="foot-note">Sesi dinilai per soal. Nilai jalur dicatat bila seluruh soalnya muncul; langkah diagram yang dibuka ikut terhitung di Kemajuan.</p>' +
        '<a class="btn" href="#/kuis">Mulai kuis pertama</a>';

    $('#view-home').innerHTML =
      '<header class="page-head">' +
        '<div><h1 id="homeTitle">Jalur sinyal</h1><p class="page-sub">' + esc(finding) + '</p></div>' +
        '<div class="head-actions"><a class="btn btn-primary" href="#/jalur/' + next.id + '">Belajar jalur ' + esc(next.name.toLowerCase()) + '</a></div>' +
      '</header>' +
      '<section class="strip" aria-label="Ringkasan kemajuan">' +
        stripCell('Jalur dikuasai', mastered + ' <span class="unit">/ ' + JALUR.length + '</span>', 'Nilai ≥ 80% pada kuis jalur', true) +
        stripCell('Langkah dibaca', read + ' <span class="unit">/ ' + TOTAL_STEPS + '</span>', 'Langkah diagram yang dibuka') +
        stripCell('Sesi kuis', String(sessions.length), sessions.length ? 'Terakhir ' + esc(sessions[sessions.length - 1].date) : 'Belum ada sesi') +
        stripCell('Rata-rata skor', avg === null ? '<span class="dash">—</span>' : avg + '%', avg === null ? 'Belum ada nilai' : 'Dari ' + tested + ' jalur diuji') +
      '</section>' +
      '<section class="block">' +
        '<div class="block-head"><h2>Indeks jalur</h2><p class="block-meta">' + JALUR.length + ' jalur · ' + TOTAL_STEPS + ' langkah · ' + TOTAL_QUIZ + ' soal</p></div>' +
        '<div class="index-wrap"><table class="index-table">' +
          '<thead><tr><th>Spesimen</th><th>Jalur</th><th>Rangsang → transmitter</th><th class="num">Langkah</th><th>Status</th><th class="num">Skor</th><th></th></tr></thead>' +
          '<tbody>' + rows + '</tbody>' +
        '</table></div>' +
      '</section>' +
      '<div class="home-foot">' +
        '<section class="panel">' + lastPanel + '</section>' +
        '<section class="panel"><h2>Urutan yang disarankan</h2>' +
          '<p>Mulai dari <b>optik</b>: jalur ini memakai protein G, enzim efektor, dan kanal ion yang sama polanya dengan jalur lain, tetapi arah responsnya terbalik sehingga paling sering salah dipahami. Lanjutkan ke integumen dan olfaktori, lalu gustatori, vestibular, dan koklear.</p>' +
          '<div class="quiet-row"><span>Setiap jalur punya diagram 2D, ' + 'kunci mekanisme' + ', spesimen asli, dan kuis sendiri.</span></div>' +
        '</section>' +
      '</div>';
  }
  function stripCell(lab, val, sub, lead) {
    return '<div class="strip-cell' + (lead ? ' lead' : '') + '"><span class="strip-lab">' + lab + '</span>' +
      '<div class="strip-val">' + val + '</div><span class="strip-sub">' + sub + '</span></div>';
  }

  /* ---------- tampilan: jalur ---------- */
  function renderPath(id, stepN) {
    var p = PATH[id] || JALUR[0];
    state.pathId = p.id;
    state.step = typeof stepN === 'number' ? Math.max(0, Math.min(p.steps.length - 1, stepN)) : state.step;
    stopPlay();
    if (state.step > p.steps.length - 1) state.step = 0;
    var cr = CREDITS[p.specimen.credit];
    var idx = JALUR.indexOf(p);
    var nextP = JALUR[(idx + 1) % JALUR.length];
    var r = rec(p.id);
    var best = r.attempts ? r.best : null;

    $('#view-path').innerHTML =
      '<nav class="crumb" aria-label="Remah"><a href="#/">Indeks jalur</a><span>/</span><span>' + esc(p.name) + '</span><span class="tag">' + esc(p.organ) + '</span></nav>' +
      '<header class="page-head path-head">' +
        '<div><h1>' + esc(p.title) + '</h1><p class="page-sub">' + esc(p.tagline) + '</p></div>' +
        '<div class="head-actions"><a class="btn" href="#/kuis?jalur=' + p.id + '">Kuis jalur ini</a></div>' +
      '</header>' +
      '<div class="path-meta">' +
        '<span>Rangsang: <b>' + esc(p.stimulus) + '</b></span>' +
        '<span>Reseptor: <b>' + esc(p.substrat) + '</b></span>' +
        '<span>Transmitter: <b>' + esc(p.transmitter) + '</b></span>' +
        '<span>' + p.steps.length + ' langkah</span>' +
      '</div>' +
      '<section class="stagecard" aria-labelledby="stageTitle">' +
        '<div class="stage-head"><h2 id="stageTitle">Diagram jalur</h2><span class="stage-count" id="stageCount"></span></div>' +
        '<p class="stage-step" id="stageStep"></p>' +
        '<div class="stage-grid">' +
          '<div class="stage-canvas" id="stageCanvas"></div>' +
          '<aside class="step-panel" id="stepPanel"></aside>' +
        '</div>' +
        '<div class="transport">' +
          '<button class="icon-btn" id="prevBtn" aria-label="Langkah sebelumnya">Sebelumnya</button>' +
          '<button class="icon-btn play" id="playBtn">Jalankan</button>' +
          '<button class="icon-btn" id="nextBtn" aria-label="Langkah berikutnya">Berikutnya</button>' +
          '<button class="icon-btn" id="resetBtn">Ulangi</button>' +
          '<span class="transport-note">Tombol ← → untuk berpindah langkah, spasi untuk menjalankan</span>' +
          '<div class="dots" id="dots" aria-label="Langkah diagram"></div>' +
        '</div>' +
      '</section>' +
      '<div class="path-cols">' +
        '<section><h2>Rantai sinyal</h2><ol class="chain-list" id="chainList"></ol></section>' +
        '<section><h2>Kunci mekanisme</h2><ul class="exam-list">' + p.exam.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></section>' +
      '</div>' +
      '<section class="specimen specimen-row">' +
        '<figure>' +
          '<div class="img-frame"><img src="' + p.specimen.file + '" alt="' + esc(p.specimen.alt) + '" width="760" height="560" loading="lazy"></div>' +
          '<figcaption>' + esc(p.specimen.caption) +
            '<span class="credit">' + esc(cr.what) + ' · ' + esc(cr.author) + ', ' + esc(cr.licence) + ', via Wikimedia Commons. <a href="' + cr.page + '" rel="noreferrer noopener" target="_blank">Sumber</a></span>' +
          '</figcaption>' +
        '</figure>' +
        '<div class="reading-guide">' +
          '<h2>Cara membaca piringan ini</h2>' +
          '<ul class="guide-list">' +
            '<li><span class="guide-mark"><span class="m-node"></span></span><span><b>Kotak kaskade</b>Pelaku molekul yang sedang bekerja pada langkah ini diberi warna; yang belum bekerja tetap putih.</span></li>' +
            '<li><span class="guide-mark"><span class="m-mem"></span></span><span><b>Pita membran</b>Kanal ion duduk di pita ini. Gerbang yang terbuka ditandai warna dan panah ion bergerak mengikuti arah aliran.</span></li>' +
            '<li><span class="guide-mark"><span class="m-trace"></span></span><span><b>Jejak potensial</b>Garis biru menunjukkan perjalanan potensial membran sepanjang ' + p.steps.length + ' langkah; titik penanda posisi sekarang.</span></li>' +
          '</ul>' +
          '<p class="progress-note"><b>Konteks.</b> ' + esc(p.context || '') + '</p>' +
          '<p class="progress-note">Nilai pada tiap langkah (' + p.steps.length + ' titik) diambil dari catatan kuliah jalur ' + esc(p.name.toLowerCase()) + '.</p>' +
        '</div>' +
      '</section>' +
      '<section class="quiz-cta">' +
        '<div><h2>Kuis jalur ' + esc(p.name.toLowerCase()) + '</h2>' +
        '<p>' + p.quiz.filter(function (q) { return q.t === 'mcq'; }).length + ' soal pilihan ganda dan ' + p.quiz.filter(function (q) { return q.t === 'order'; }).length + ' soal urutan. Dinilai otomatis dengan umpan balik tiap soal.</p></div>' +
        '<div class="quiz-cta-side"><span class="quiz-best">Skor terbaik <b>' + (best === null ? '—' : best + '%') + '</b></span>' +
        '<a class="btn" href="#/kuis?jalur=' + p.id + '">Mulai kuis</a></div>' +
      '</section>' +
      '<a class="next-path" href="#/jalur/' + nextP.id + '">' +
        '<span class="next-lab">Jalur berikutnya</span>' +
        '<span class="next-name">' + esc(nextP.name) + ' · ' + esc(nextP.title) + '</span>' +
        '<span class="next-arrow" aria-hidden="true">→</span>' +
      '</a>';

    $('#dots').innerHTML = p.steps.map(function (s, i) {
      return '<button class="dot-btn" data-step="' + i + '" aria-label="Langkah ' + (i + 1) + ': ' + esc(s.t) + '"><span></span></button>';
    }).join('');
    $('#chainList').innerHTML = p.steps.map(function (s, i) {
      return '<li><button class="chain-item" data-step="' + i + '"><span class="n">' + (i + 1) + '</span><span>' + esc(s.chain) + '</span></button></li>';
    }).join('');

    $('#prevBtn').addEventListener('click', function () { stopPlay(); setStep(state.step - 1); });
    $('#nextBtn').addEventListener('click', function () { stopPlay(); setStep(state.step + 1); });
    $('#playBtn').addEventListener('click', playOrPause);
    $('#resetBtn').addEventListener('click', function () { stopPlay(); setStep(0); });
    $$('#dots .dot-btn, #chainList .chain-item').forEach(function (b) {
      b.addEventListener('click', function () { stopPlay(); setStep(+b.getAttribute('data-step')); });
    });

    var rr = rec(p.id);
    if (rr.steps.indexOf(state.step) < 0) { rr.steps.push(state.step); save(); }
    paintStage();
    announce('Jalur ' + p.name + '. ' + p.steps.length + ' langkah.');
  }

  function paintStage() {
    var p = PATH[state.pathId];
    var s = p.steps[state.step];
    var canvas = $('#stageCanvas');
    if (!canvas) return;
    var mobileScene = window.matchMedia('(max-width: 760px)').matches;
    canvas.innerHTML = mobileScene ? sceneMarkupMobile(p, state.step) : sceneMarkup(p, state.step);
    $('#stageCount').textContent = 'Langkah ' + (state.step + 1) + ' dari ' + p.steps.length;
    if ($('#stageStep')) $('#stageStep').textContent = s.t;
    $('#playBtn').textContent = state.playing ? 'Jeda' : (state.step >= p.steps.length - 1 ? 'Ulangi dari awal' : 'Jalankan');
    var cfg = SCENES[p.id];
    var labels = {};
    cfg.cascade.forEach(function (n) { labels[n.id] = n.label; });
    cfg.channels.forEach(function (c) { labels[c.id] = c.label; });
    if (cfg.effector) labels[cfg.effector.id] = cfg.effector.label;
    var actors = (s.on || []).map(function (id) { return labels[id]; }).filter(Boolean);
    var vals = (s.values || []).map(function (v) {
      return '<div class="step-val"><span class="k">' + esc(v.k) + '</span><span class="v ' + v.d + '">' + esc(v.v) + '<span class="dir">' + dirMark(v.d) + '</span></span></div>';
    }).join('');
    var actorHTML = actors.length
      ? '<div class="step-actors"><span class="actors-lab">Bekerja pada langkah ini</span><div class="actors">' +
        actors.map(function (a) { return '<span class="actor">' + esc(a) + '</span>'; }).join('') + '</div></div>'
      : '';
    $('#stepPanel').innerHTML =
      '<span class="step-count">Langkah ' + (state.step + 1) + ' / ' + p.steps.length + '</span>' +
      '<h2 class="step-title">' + esc(s.t) + '</h2>' +
      '<p class="step-body">' + esc(s.body) + '</p>' +
      actorHTML +
      '<div class="step-values">' + vals + '</div>' +
      (s.note ? '<p class="step-note">' + esc(s.note) + '</p>' : '') +
      '<div class="step-ref"><span class="actors-lab">Molekul kunci jalur ini</span><p>' + p.molecular.map(esc).join(' · ') + '</p></div>';
    $$('#dots .dot-btn').forEach(function (b) {
      if (+b.getAttribute('data-step') === state.step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
    $$('#chainList .chain-item').forEach(function (b) {
      if (+b.getAttribute('data-step') === state.step) b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
    });
  }

  /* ---------- kuis ---------- */
  function qPath(q) { return PATH[q.pathId]; }

  function poolFor(scope) {
    var paths = scope === 'all' ? JALUR : JALUR.filter(function (p) { return p.id === scope; });
    var pool = [];
    paths.forEach(function (p) {
      p.quiz.forEach(function (q, i) { pool.push(Object.assign({}, q, { pathId: p.id, pathName: p.name, qi: i })); });
    });
    return pool;
  }
  function balancedPick(pool, count) {
    if (!count || count >= pool.length) return shuffle(pool);
    var groups = {};
    pool.forEach(function (q) { (groups[q.pathId] = groups[q.pathId] || []).push(q); });
    var ids = shuffle(Object.keys(groups));
    ids.forEach(function (k) { groups[k] = shuffle(groups[k]); });
    var out = [];
    var more = true;
    while (out.length < count && more) {
      more = false;
      ids.forEach(function (k) {
        if (groups[k].length && out.length < count) { out.push(groups[k].shift()); more = true; }
      });
    }
    return shuffle(out);
  }
  function startSession(scope, count, poolOverride) {
    var pool = poolOverride || poolFor(scope);
    var items = poolOverride ? shuffle(pool) : balancedPick(pool, count);
    items.forEach(function (it) {
      if (it.t === 'order') it.display = shuffle(it.items.map(function (_, i) { return i; }));
    });
    var label = scope === 'all' ? 'Semua jalur' : PATH[scope].name + ' · ' + PATH[scope].title;
    if (poolOverride) label = 'Tinjau soal yang salah';
    state.session = { scope: scope, label: label, items: items, idx: 0, results: [], checked: false, choice: null, order: [], done: false, reviewOnly: !!poolOverride };
    renderQuiz();
  }

  function renderQuiz() {
    var view = $('#view-quiz');
    if (state.session && !state.session.done) return renderSession();
    if (state.session && state.session.done) return renderResult();

    var qs = new URLSearchParams((location.hash.split('?')[1] || ''));
    var pre = qs.get('jalur');
    var opts = JALUR.map(function (p) {
      return '<option value="' + p.id + '"' + (pre === p.id ? ' selected' : '') + '>' + esc(p.name) + ' · ' + esc(p.title) + ' (' + p.quiz.length + ' soal)</option>';
    }).join('');
    var sessions = store().sessions.slice(-6).reverse();
    var history = sessions.length
      ? '<table class="history">' + sessions.map(function (s) {
          return '<tr><td>' + esc(s.date) + '<br>' + esc(s.label) + '</td><td class="r score">' + s.correct + '/' + s.total + '</td><td class="r">' + s.pct + '%</td></tr>';
        }).join('') + '</table>'
      : '<p class="empty-note">Belum ada sesi. Riwayat enam sesi terakhir akan muncul di sini.</p>';

    view.innerHTML =
      '<header class="page-head"><div><h1>Kuis</h1><p class="page-sub">Setiap soal dinilai otomatis begitu diperiksa, lengkap dengan alasan singkat dan tautan ke langkah diagramnya. Nilai terbaik per jalur tersimpan di halaman Kemajuan.</p></div></header>' +
      '<div class="quiz-layout">' +
        '<section class="panel panel-pad quiz-setup">' +
          '<h2>Atur sesi</h2>' +
          '<div class="field"><label for="quizScope">Lingkup soal</label><select id="quizScope"><option value="all">Semua jalur</option>' + opts + '</select></div>' +
          '<div class="field"><label for="quizCount">Jumlah soal</label><select id="quizCount">' +
            '<option value="10">10 soal</option><option value="16">16 soal</option><option value="0">Semua soal (' + TOTAL_QUIZ + ')</option>' +
          '</select></div>' +
          '<p class="setup-note">Urutan soal diacak. Soal urutan memberi satu poin hanya jika seluruh langkah berada pada posisi yang benar; jumlah posisi yang tepat tetap ditampilkan agar bisa dipelajari.</p>' +
          '<button class="btn btn-primary" id="startQuiz">Mulai sesi</button>' +
        '</section>' +
        '<aside class="quiz-aside">' +
          '<section class="panel"><h2>Penilaian</h2><ul class="rule-list">' +
            '<li>Pilihan ganda: satu poin bila jawaban tepat.</li>' +
            '<li>Soal urutan: satu poin bila seluruh urutan tepat.</li>' +
            '<li>Nilai jalur = jumlah poin benar dibagi jumlah soal jalur itu.</li>' +
            '<li>Nilai terbaik dicatat bila seluruh soal jalur itu muncul dalam sesi; sesi campuran tetap menyimpan riwayat.</li>' +
            '<li>Nilai terbaik per jalur yang tersimpan; ≥ 80% dihitung dikuasai.</li>' +
          '</ul></section>' +
          '<section class="panel" style="margin-top:16px"><h2>Riwayat sesi</h2>' + history + '</section>' +
        '</aside>' +
      '</div>';
    $('#startQuiz').addEventListener('click', function () {
      startSession($('#quizScope').value, +$('#quizCount').value);
    });
    var scopeSel = $('#quizScope');
    var countSel = $('#quizCount');
    function syncCount() {
      var pool = poolFor(scopeSel.value).length;
      var allOpt = countSel.querySelector('option[value="0"]');
      var opt10 = countSel.querySelector('option[value="10"]');
      var opt16 = countSel.querySelector('option[value="16"]');
      allOpt.textContent = 'Semua soal (' + pool + ')';
      opt10.hidden = pool < 10;
      opt16.hidden = pool < 16;
      if (+countSel.value > pool) countSel.value = '0';
    }
    scopeSel.addEventListener('change', syncCount);
    syncCount();
    if (pre) countSel.value = '0';
  }

  function renderSession() {
    var S = state.session;
    var item = S.items[S.idx];
    var p = PATH[item.pathId];
    var total = S.items.length;
    var isOrder = item.t === 'order';
    var qHead = isOrder ? 'Soal urutan' : 'Pilihan ganda';
    var body;

    if (!isOrder) {
      body = '<div class="options" id="options">' + item.o.map(function (o, i) {
        var cls = 'opt';
        if (S.checked) {
          if (i === item.a) cls += ' correct';
          else if (i === S.choice) cls += ' wrong';
        } else if (i === S.choice) cls += ' sel';
        return '<button class="' + cls + '" data-opt="' + i + '"' + (S.checked ? ' disabled' : '') + '>' +
          '<span class="key">' + 'ABCD'[i] + '</span><span>' + esc(o) + '</span></button>';
      }).join('') + '</div>';
    } else {
      var placed = S.order;
      var order = item.display || item.items.map(function (_, i) { return i; });
      var pool = order.map(function (i) { return { t: item.items[i], i: i }; });
      var chips = pool.map(function (o) {
        var pos = placed.indexOf(o.i);
        var cls = 'order-chip' + (pos >= 0 ? ' placed' : '');
        if (S.checked) {
          if (pos >= 0 && pos === o.i) cls += ' correct';
          else if (pos >= 0) cls += ' wrong';
        }
        return '<button class="' + cls + '" data-item="' + o.i + '"' + (S.checked || pos >= 0 ? ' disabled' : '') + '>' +
          (pos >= 0 ? '<span class="ord">' + (pos + 1) + '</span>' : '') + '<span>' + esc(o.t) + '</span></button>';
      }).join('');
      var seq = placed.length
        ? '<ol class="order-seq">' + placed.map(function (i, k) {
            var ok = S.checked && k === i;
            return '<li' + (S.checked ? ' style="color:' + (ok ? 'var(--positive)' : 'var(--negative)') + '"' : '') + '><span class="n">' + (k + 1) + '</span><span>' + esc(item.items[i]) + '</span></li>';
          }).join('') + '</ol>'
        : '<p class="order-help">Ketuk langkah-langkah di atas sesuai urutan yang benar. Urutan pilihan akan muncul di sini.</p>';
      body = '<p class="order-help">Ketuk tiap langkah mengikuti urutan kejadian. Pilihan bisa diulang sebelum diperiksa.</p>' +
        '<div class="order-pool">' + chips + '</div>' + seq +
        '<div class="order-actions">' + (!S.checked && S.order.length ? '<button class="btn btn-quiet" id="clearOrder">Ulangi pilihan</button>' : '') + '</div>';
    }

    var feedback = '';
    if (S.checked) {
      var ok = S.results[S.results.length - 1].ok;
      if (isOrder) {
        var hit = S.results[S.results.length - 1].partial;
        feedback = '<div class="feedback ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Tepat.' : 'Belum tepat · ' + hit + ' dari ' + item.items.length + ' posisi benar.') + '</b> ' +
          'Urutan yang benar: ' + item.items.map(function (t, i) { return (i + 1) + '. ' + esc(t); }).join(' · ') +
          ' <a href="#/jalur/' + p.id + '">Buka jalur ' + esc(p.name) + '</a></div>';
      } else {
        feedback = '<div class="feedback ' + (ok ? 'ok' : 'no') + '"><b>' + (ok ? 'Tepat.' : 'Belum tepat.') + '</b> ' + esc(item.why) +
          ' <a href="#/jalur/' + p.id + '/' + (item.step + 1) + '">Lihat langkah ' + (item.step + 1) + ' di diagram</a></div>';
      }
    }

    var canCheck = isOrder ? S.order.length === item.items.length : S.choice !== null;
    var asideRows = '<div><span>Lingkup</span><b>' + esc(S.label) + '</b></div>' +
      '<div><span>Sudah diperiksa</span><b>' + S.results.length + '</b></div>' +
      '<div><span>Sisa soal</span><b>' + (total - S.results.length) + '</b></div>';
    var qmap = S.items.map(function (it, i) {
      var st = S.results[i] ? (S.results[i].ok ? 'ok' : 'no') : (i === S.idx ? 'now' : i < S.idx ? 'done' : '');
      return '<span class="qmap-cell ' + st + '">' + (i + 1) + '</span>';
    }).join('');

    $('#view-quiz').innerHTML =
      '<div class="quiz-top">' +
        '<button class="btn btn-quiet btn-sm" id="quitQuiz">Keluar dari sesi</button>' +
        '<span class="meta">Soal <b>' + (S.idx + 1) + '</b> dari ' + total + ' · ' + esc(p.name) + '</span>' +
      '</div>' +
      '<div class="progress-track"><span style="width:' + ((S.results.length / total) * 100) + '%"></span></div>' +
      '<div class="quiz-layout">' +
        '<section class="panel q-card">' +
          '<div class="q-meta"><span class="type">' + qHead + '</span><span>' + esc(p.name) + ' · ' + esc(p.title) + '</span></div>' +
          '<h2 class="q-prompt">' + esc(item.q) + '</h2>' +
          body + feedback +
          '<div class="q-actions">' +
            '<span class="q-hint">' + (!isOrder ? 'Tombol 1–4 memilih jawaban.' : 'Ketuk berurutan dari langkah paling awal.') + '</span>' +
            (S.checked
              ? '<button class="btn btn-primary" id="nextQ">' + (S.idx >= total - 1 ? 'Lihat hasil' : 'Soal berikutnya') + '</button>'
              : '<button class="btn btn-primary" id="checkQ"' + (canCheck ? '' : ' disabled') + '>Periksa jawaban</button>') +
          '</div>' +
        '</section>' +
        '<aside class="quiz-aside">' +
          '<section class="panel"><h2>Posisi sesi</h2><div class="aside-fig">' + (S.idx + 1) + '<span> / ' + total + '</span></div>' +
          '<div class="aside-rows">' + asideRows + '</div></section>' +
          '<section class="panel" style="margin-top:16px"><h2>Peta soal</h2><div class="qmap">' + qmap + '</div></section>' +
          '<section class="panel" style="margin-top:16px"><h2>Catatan</h2><p class="rule-list" style="display:block">Jawaban tidak dapat diubah setelah diperiksa, tetapi setiap soal menautkan langkah diagramnya untuk ditinjau.</p></section>' +
        '</aside>' +
      '</div>';

    $('#quitQuiz').addEventListener('click', function () {
      stopPlay();
      state.session = null;
      renderQuiz();
    });
    if (!S.checked && !isOrder) {
      $$('#options .opt').forEach(function (b) {
        b.addEventListener('click', function () {
          S.choice = +b.getAttribute('data-opt');
          renderSession();
        });
      });
    }
    if (!S.checked && isOrder) {
      $$('.order-chip').forEach(function (b) {
        b.addEventListener('click', function () {
          var i = +b.getAttribute('data-item');
          if (S.order.indexOf(i) < 0) S.order.push(i);
          renderSession();
        });
      });
      var clear = $('#clearOrder');
      if (clear) clear.addEventListener('click', function () { S.order = []; renderSession(); });
    }
    var check = $('#checkQ');
    if (check) check.addEventListener('click', function () {
      S.checked = true;
      if (isOrder) {
        var hit = S.order.reduce(function (a, v, k) { return a + (v === k ? 1 : 0); }, 0);
        S.results.push({ item: item, ok: hit === item.items.length, partial: hit, order: S.order.slice() });
      } else {
        S.results.push({ item: item, ok: S.choice === item.a, partial: S.choice === item.a ? 1 : 0, choice: S.choice });
      }
      announce(S.results[S.results.length - 1].ok ? 'Jawaban benar.' : 'Jawaban belum tepat.');
      renderSession();
    });
    var next = $('#nextQ');
    if (next) next.addEventListener('click', function () {
      if (S.idx >= total - 1) { finishSession(); return; }
      S.idx += 1; S.checked = false; S.choice = null; S.order = [];
      renderSession();
    });
  }

  function finishSession() {
    var S = state.session;
    var correct = S.results.filter(function (r) { return r.ok; }).length;
    var pct = Math.round((correct / S.items.length) * 100);
    var byPath = {};
    S.results.forEach(function (r) {
      var id = r.item.pathId;
      byPath[id] = byPath[id] || { correct: 0, total: 0 };
      byPath[id].total += 1;
      if (r.ok) byPath[id].correct += 1;
    });
    if (!S.reviewOnly) {
      Object.keys(byPath).forEach(function (id) {
        var bp = byPath[id];
        var scaled = Math.round((bp.correct / bp.total) * 100);
        var r = rec(id);
        r.attempts += 1;
        r.last = new Date().toISOString();
        if (bp.total >= PATH[id].quiz.length && (r.best === null || scaled > r.best)) r.best = scaled;
      });
      store().sessions.push({ date: todayLabel(), label: S.label, correct: correct, total: S.items.length, pct: pct });
      save();
      buildNav();
    }
    S.correct = correct;
    S.pct = pct;
    S.byPath = byPath;
    S.done = true;
    renderQuiz();
    toast(S.reviewOnly ? 'Sesi tinjauan tidak mengubah nilai' : 'Nilai tersimpan di Kemajuan');
  }

  function renderResult() {
    var S = state.session;
    var rows = Object.keys(S.byPath).map(function (id) {
      var bp = S.byPath[id];
      var pct = Math.round((bp.correct / bp.total) * 100);
      var st = statusOf(id);
      return '<tr><td><a href="#/jalur/' + id + '">' + esc(PATH[id].name) + '</a><span class="sub">' + esc(PATH[id].title) + '</span></td>' +
        '<td class="r">' + bp.correct + ' / ' + bp.total + '</td><td class="r">' + pct + '%</td>' +
        '<td class="r"><span class="pill pill-' + st.k + '">' + st.label + '</span></td></tr>';
    }).join('');
    var wrong = S.results.filter(function (r) { return !r.ok; });
    var verdict = S.pct >= 80 ? 'Mekanisme sudah kuat.' : S.pct >= 60 ? 'Cukup, tetapi beberapa langkah masih tertukar.' : 'Perlu diulang: baca ulang diagram sebelum mengulang kuis.';
    var review = wrong.length
      ? '<section class="review"><h2>Tinjauan jawaban yang belum tepat</h2><ul class="review-list">' + wrong.map(function (r) {
          var it = r.item;
          var yours = it.t === 'order'
            ? (r.order || []).map(function (v, k) { return (k + 1) + '. ' + esc(it.items[v]); }).join(' · ')
            : esc(it.o[r.choice]);
          var answer = it.t === 'order'
            ? it.items.map(function (t, i) { return (i + 1) + '. ' + esc(t); }).join(' · ')
            : esc(it.o[it.a]);
          return '<li class="review-item"><div class="q">' + esc(it.q) + '</div>' +
            '<div class="ans">Jawabanmu: ' + yours + '</div>' +
            '<div class="ans">Jawaban benar: ' + answer + '</div>' +
            '<div class="why">' + esc(it.why || '') + ' <a class="text-link" href="#/jalur/' + it.pathId + (it.step !== undefined ? '/' + (it.step + 1) : '') + '">Lihat jalur ' + esc(it.pathName) + '</a></div>' +
            '<div class="tagpath">' + esc(it.pathName) + '</div></li>';
        }).join('') + '</ul></section>'
      : '<section class="review"><h2>Tinjauan</h2><p class="empty-note">Tidak ada jawaban yang salah pada sesi ini.</p></section>';

    $('#view-quiz').innerHTML =
      '<header class="page-head"><div><h1>Hasil sesi</h1><p class="page-sub">' + esc(S.label) + ' · ' + S.items.length + ' soal · ' + esc(todayLabel()) + '</p></div>' +
        '<div class="head-actions"><a class="btn" href="#/kemajuan">Lihat kemajuan</a></div></header>' +
      '<div class="result-grid">' +
        '<section class="panel result-main">' +
          '<p class="result-score">' + S.correct + '<span> / ' + S.items.length + '</span></p>' +
          '<p class="result-verdict"><b>' + S.pct + '%</b> · ' + verdict + '</p>' +
          '<table class="result-table"><thead><tr><th>Jalur</th><th class="r">Benar</th><th class="r">Nilai</th><th class="r">Status</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '</section>' +
        '<aside class="panel result-side">' +
          '<h2>Sesudah ini</h2>' +
          (wrong.length ? '<a class="btn btn-primary" href="#" id="retryWrong">Ulangi ' + wrong.length + ' soal yang salah</a>' : '<button class="btn btn-primary" disabled>Tidak ada soal salah</button>') +
          '<button class="btn" id="newSession">Mulai sesi baru</button>' +
          '<a class="btn" href="#/">Kembali ke indeks jalur</a>' +
        '</aside>' +
      '</div>' + review;

    var rw = $('#retryWrong');
    if (rw) rw.addEventListener('click', function (e) {
      e.preventDefault();
      var pool = wrong.map(function (r) { return r.item; });
      startSession(S.scope, pool.length, pool);
    });
    $('#newSession').addEventListener('click', function () {
      state.session = null;
      renderQuiz();
    });
  }

  /* ---------- kemajuan ---------- */
  function renderProgress() {
    var mastered = JALUR.filter(function (p) { return statusOf(p.id).k === 'ok'; }).length;
    var tested = JALUR.filter(function (p) { var r = store().paths[p.id]; return r && r.attempts; }).length;
    var read = JALUR.reduce(function (a, p) { return a + stepsRead(p.id); }, 0);
    var avg = avgScore();
    var sessions = store().sessions;

    var rows = JALUR.map(function (p) {
      var r = store().paths[p.id] || {};
      var st = statusOf(p.id);
      return '<tr><td><a href="#/jalur/' + p.id + '">' + esc(p.name) + '</a><span class="sub">' + esc(p.title) + '</span></td>' +
        '<td class="r">' + stepsRead(p.id) + ' / ' + p.steps.length + '</td>' +
        '<td class="r">' + (r.attempts || 0) + '</td>' +
        '<td class="r">' + (r.attempts && r.best !== null ? r.best + '%' : '<span class="dash">—</span>') + '</td>' +
        '<td class="r">' + (r.last ? esc(new Date(r.last).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })) : '<span class="dash">—</span>') + '</td>' +
        '<td class="r"><span class="pill pill-' + st.k + '">' + st.label + '</span></td></tr>';
    }).join('');

    var history = sessions.slice(-8).reverse();
    var histRows = history.length
      ? '<table class="progress-table"><thead><tr><th>Tanggal</th><th>Lingkup</th><th class="r">Benar</th><th class="r">Nilai</th></tr></thead><tbody>' +
        history.map(function (s) {
          return '<tr><td>' + esc(s.date) + '</td><td>' + esc(s.label) + '</td><td class="r">' + s.correct + ' / ' + s.total + '</td><td class="r">' + s.pct + '%</td></tr>';
        }).join('') + '</tbody></table>'
      : '<p class="empty-note">Belum ada sesi kuis. Nilai per jalur akan muncul setelah sesi pertama.</p>';

    var nextRec = recommend();
    var nextStatus = statusOf(nextRec.id);
    var nextBest = (store().paths[nextRec.id] || {}).best;
    var recLine = nextStatus.k === 'none'
      ? 'Belum diuji. ' + nextRec.tagline
      : nextBest !== null ? 'Skor terbaik ' + nextBest + '%. ' + nextRec.tagline : 'Belum tuntas. ' + nextRec.tagline;

    $('#view-progress').innerHTML =
      '<header class="page-head"><div><h1>Kemajuan</h1><p class="page-sub">Nilai terbaik per jalur, langkah diagram yang sudah dibuka, dan riwayat sesi. Semua angka dihitung dari sesi kuis yang benar-benar dikerjakan di peramban ini.</p></div>' +
        '<div class="head-actions"><a class="btn" href="#/kuis">Mulai kuis</a></div></header>' +
      '<section class="strip" aria-label="Ringkasan">' +
        stripCell('Jalur dikuasai', mastered + ' <span class="unit">/ ' + JALUR.length + '</span>', 'Nilai ≥ 80%', true) +
        stripCell('Jalur diuji', tested + ' <span class="unit">/ ' + JALUR.length + '</span>', 'Pernah dikerjakan') +
        stripCell('Langkah dibaca', read + ' <span class="unit">/ ' + TOTAL_STEPS + '</span>', 'Dari seluruh diagram') +
        stripCell('Rata-rata skor', avg === null ? '<span class="dash">—</span>' : avg + '%', avg === null ? 'Belum ada nilai' : 'Dari ' + tested + ' jalur') +
      '</section>' +
      '<div class="progress-grid">' +
        '<section class="panel"><h2>Skor terbaik per jalur</h2>' + scoreChart() + '</section>' +
        '<div class="progress-side">' +
          '<section class="panel"><h2>Berikutnya</h2>' +
            '<p class="rec-name">' + esc(nextRec.name) + ' · ' + esc(nextRec.title) + '</p>' +
            '<p class="rec-line">' + esc(recLine) + '</p>' +
            '<a class="btn btn-sm" href="#/jalur/' + nextRec.id + '">Buka jalur</a>' +
          '</section>' +
          '<section class="panel"><h2>Riwayat sesi</h2>' + histRows + '</section>' +
        '</div>' +
      '</div>' +
      '<section class="panel" style="margin-top:16px;padding:20px 22px">' +
        '<h2>Rincian per jalur</h2>' +
        '<table class="progress-table"><thead><tr><th>Jalur</th><th class="r">Langkah</th><th class="r">Sesi</th><th class="r">Skor terbaik</th><th class="r">Terakhir</th><th class="r">Status</th></tr></thead><tbody>' + rows + '</tbody></table>' +
        '<p class="progress-note">Ambang penguasaan 80% mengikuti bobot satu poin per soal. Jalur yang belum diuji ditampilkan sebagai tanda pisah, bukan angka nol, karena belum ada yang dikerjakan.</p>' +
      '</section>';
  }

  function scoreChart() {
    var w = 560, h = 210, padL = 30, padB = 40, padT = 14, padR = 8;
    var plotW = w - padL - padR, plotH = h - padT - padB;
    var n = JALUR.length, slot = plotW / n, barW = Math.min(46, slot * .58);
    var y = function (v) { return padT + plotH - (v / 100) * plotH; };
    var grid = [0, 50, 100].map(function (t) {
      return '<line class="grid" x1="' + padL + '" x2="' + (w - padR) + '" y1="' + y(t) + '" y2="' + y(t) + '"/>' +
        '<text class="chart-lab" x="' + (padL - 8) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + t + '</text>';
    }).join('');
    var any = false;
    var bars = JALUR.map(function (p, i) {
      var r = store().paths[p.id];
      var v = r && r.attempts ? r.best : null;
      var cx = padL + slot * i + (slot - barW) / 2;
      var label = '<text class="chart-cat" x="' + (padL + slot * i + slot / 2) + '" y="' + (h - 22) + '" text-anchor="middle">' + esc(p.name) + '</text>';
      if (v === null) {
        return label + '<rect x="' + cx + '" y="' + (y(0) - 3) + '" width="' + barW + '" height="3" fill="var(--line-strong)"/>' +
          '<text class="chart-lab" x="' + (cx + barW / 2) + '" y="' + (y(0) - 9) + '" text-anchor="middle">belum</text>';
      }
      any = true;
      return label + '<rect class="chart-bar" x="' + cx + '" y="' + y(v) + '" width="' + barW + '" height="' + (y(0) - y(v)) + '"/>' +
        '<text class="chart-lab" x="' + (cx + barW / 2) + '" y="' + (y(v) - 6) + '" text-anchor="middle">' + v + '</text>';
    }).join('');
    var note = any ? '' : '<text class="chart-empty" x="' + padL + '" y="' + (padT + 16) + '">Belum ada nilai. Kerjakan satu sesi kuis untuk mengisi grafik ini.</text>';
    return '<div class="chart-wrap"><svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Skor terbaik per jalur">' + grid + bars + note + '</svg></div>';
  }

  /* ---------- rute ---------- */
  function route() {
    var hash = location.hash.replace(/^#/, '') || '/';
    var q = '';
    if (hash.indexOf('?') >= 0) { q = hash.split('?')[1]; hash = hash.split('?')[0]; }
    var parts = hash.split('/').filter(Boolean);
    var done = false;

    if (!parts.length) { show('home'); state.route = 'home'; renderHome(); done = true; }
    else if (parts[0] === 'jalur' && parts[1] && PATH[parts[1]]) {
      show('path'); state.route = 'jalur';
      var stepN = parts[2] ? +parts[2] - 1 : 0;
      renderPath(parts[1], isNaN(stepN) ? 0 : stepN);
      done = true;
    } else if (parts[0] === 'kuis') { show('quiz'); state.route = 'kuis'; renderQuiz(); done = true; }
    else if (parts[0] === 'kemajuan') { show('progress'); state.route = 'kemajuan'; renderProgress(); done = true; }

    if (!done) { location.replace('#/'); return; }
    buildNav();
    markNav(state.route);
    stopPlay();
    window.scrollTo(0, 0);
  }
  function show(name) {
    stopPlay();
    ['home', 'path', 'quiz', 'progress'].forEach(function (k) {
      $('#view-' + k).hidden = k !== name;
    });
    if (name !== 'path') { state.session = state.session && state.session.done ? state.session : state.session; }
  }

  /* ---------- papan ketik & menu ---------- */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (tag === 'input' || tag === 'select' || tag === 'textarea') return;
    if (state.route === 'jalur') {
      if (e.key === 'ArrowRight') { stopPlay(); setStep(state.step + 1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { stopPlay(); setStep(state.step - 1); e.preventDefault(); }
      else if (e.key === ' ') {
        if (tag === 'button' && e.target.id !== 'playBtn') return;
        playOrPause(); e.preventDefault();
      }
      return;
    }
    if (state.route === 'kuis' && state.session && !state.session.done && !state.session.checked) {
      var S = state.session;
      if (S.items[S.idx].t === 'mcq' && /^[1-4]$/.test(e.key)) {
        S.choice = +e.key - 1; renderSession(); e.preventDefault();
      } else if (e.key === 'Enter' && S.choice !== null) {
        $('#checkQ') && $('#checkQ').click();
      }
    }
  });

  var sheet = $('#sheet');
  function openSheet(open) {
    sheet.hidden = !open;
    $('#menuBtn').setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  $('#menuBtn').addEventListener('click', function () { openSheet(true); });
  $('#sheetClose').addEventListener('click', function () { openSheet(false); });
  sheet.addEventListener('click', function (e) { if (e.target.closest('.nav-link')) openSheet(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !sheet.hidden) openSheet(false); });

  var lastMobile = window.matchMedia('(max-width: 760px)').matches;
  window.addEventListener('resize', function () {
    var now = window.matchMedia('(max-width: 760px)').matches;
    if (now !== lastMobile) {
      lastMobile = now;
      if (state.route === 'jalur') paintStage();
    }
  });

  window.addEventListener('hashchange', route);
  document.addEventListener('visibilitychange', function () { if (document.hidden) { stopPlay(); if (state.route === 'jalur') paintStage(); } });

  route();
})();