/* ==========================================================================
   Sumith Abeykoon — site behaviour · v4
   Plain JavaScript. No libraries, no build step, no tracking.
   ========================================================================== */
(function () {
  'use strict';

  var IMG = 'images/web/';

  /* ---- Year ------------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---- Mobile navigation ------------------------------------------------- */
  var toggle = document.getElementById('navToggle');
  var nav = document.getElementById('nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '✕' : '☰';
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        nav.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = '☰';
      }
    });
  }

  /* ---- Header hairline on scroll ---------------------------------------- */
  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > 12); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ======================================================================
     SECTION BAR — a slim sticky row of jump links under the header.
     Used by Research and Life (sections marked data-nav="Label"),
     Publications (one chip per year) and Photography (one per album).
     ====================================================================== */
  function setHdr() { if (header) document.documentElement.style.setProperty('--hdr', header.offsetHeight + 'px'); }
  setHdr(); window.addEventListener('resize', setHdr);
  function hdrOff() { return (header ? header.offsetHeight : 64) + 56; }
  function goTo(t) {
    window.scrollTo({ top: t.getBoundingClientRect().top + window.scrollY - hdrOff(), behavior: 'smooth' });
    /* images above may still be settling; correct the landing once the scroll has finished */
    var n = 0, iv = setInterval(function () {
      var d = t.getBoundingClientRect().top - hdrOff();
      n++; if (n > 3 && Math.abs(d) > 6) window.scrollTo({ top: window.scrollY + d, behavior: 'auto' });
      if (n > 8) clearInterval(iv);
    }, 220);
  }
  function sectionBar(opts) {
    var items = (opts.items || []).filter(function (i) { return i.id && document.getElementById(i.id); });
    if (items.length < 3) return null;
    var bar = document.createElement('nav');
    bar.className = 'secbar'; bar.setAttribute('aria-label', opts.label || 'On this page');
    bar.innerHTML = '<div class="wrap wrap--wide secbar__row"><div class="secbar__inner">' +
      items.map(function (i) { return '<a href="#' + esc(i.id) + '">' + esc(i.label) + '</a>'; }).join('') +
      '</div><button class="secbar__top" type="button" aria-label="Back to top" title="Back to top">↑</button></div>' +
      '<span class="secbar__progress" aria-hidden="true"></span>';
    document.body.appendChild(bar);
    var inner = bar.querySelector('.secbar__inner'), prog = bar.querySelector('.secbar__progress');
    var links = {}; inner.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var current = null, lastId = items[items.length - 1].id;
    var els = items.map(function (i) { return document.getElementById(i.id); });
    function setHere(id) {
      if (id === current) return; current = id;
      Object.keys(links).forEach(function (k) { links[k].classList.toggle('is-here', k === id); });
      if (opts.onActive) opts.onActive(id);
      var a = links[id]; if (a) inner.scrollTo({ left: a.offsetLeft - inner.clientWidth / 2 + a.offsetWidth / 2, behavior: 'smooth' });
    }
    function onScroll() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      prog.style.transform = 'scaleX(' + (h > 0 ? Math.min(1, window.scrollY / h) : 0) + ')';
      var trig = opts.trigger;
      bar.classList.toggle('is-on', trig ? trig.getBoundingClientRect().bottom < (header ? header.offsetHeight : 0) : window.scrollY > 400);
      /* the active chip is the last section whose top has passed just under the bar */
      var line = hdrOff() + 24, here = null;
      if (h > 0 && window.scrollY >= h - 4) here = lastId;
      else for (var k = 0; k < els.length; k++) { if (els[k].getBoundingClientRect().top <= line) here = els[k].id; else break; }
      setHere(here);
    }
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    function toTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); history.replaceState(null, '', location.pathname + location.search); }
    bar.querySelector('.secbar__top').addEventListener('click', toTop);
    [bar].concat(opts.extra || []).forEach(function (nav) {
      if (!nav) return;
      nav.addEventListener('click', function (e) {
        var a = e.target.closest('a[href^="#"]'); if (!a) return;
        var id = a.getAttribute('href').slice(1), t = document.getElementById(id); if (!t || !links[id]) return;
        e.preventDefault();
        if (nav === bar && id === current) { toTop(); return; }   /* the active chip again: back to the top */
        goTo(t); history.replaceState(null, '', '#' + id);
      });
    });
    var hash = location.hash.slice(1);
    if (hash && links[hash]) setTimeout(function () { goTo(document.getElementById(hash)); }, 300);
    return bar;
  }
  function autoBar(trigger) {
    var secs = document.querySelectorAll('[data-nav]');
    return sectionBar({ trigger: trigger, items: [].map.call(secs, function (s) { return { id: s.id, label: s.getAttribute('data-nav') }; }) });
  }
  if (!document.getElementById('pubArchive') && !document.getElementById('gallery')) autoBar(document.querySelector('.page-head'));

  /* ---- Reveal on scroll -------------------------------------------------- */
  var revealables = document.querySelectorAll('.section, .theme-block, .session');
  if ('IntersectionObserver' in window && revealables.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.03 });
    revealables.forEach(function (el) { el.classList.add('reveal'); io.observe(el); });
  }

  /* ---- Helpers ----------------------------------------------------------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function markAuthors(authors) {
    return esc(authors).replace(/(S\.\s*Abeykoon|Abeykoon,\s*S\.|S\.\s*Abekoon)/g, '<span class="me">$1</span>');
  }
  function getJSON(url) {
    return fetch(url, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' -> ' + r.status);
      return r.json();
    });
  }
  /* file "x.jpg" -> small variant "x-s.jpg" (made by tools/add-photos.py) */
  function small(file) { return file.replace(/\.jpg$/i, '-s.jpg'); }
  function srcset(file, v) { var q = v ? '?v=' + v : ''; return IMG + small(file) + q + ' 900w, ' + IMG + file + q + ' 2000w'; }
  function vq(ph) { return ph && ph.v ? '?v=' + ph.v : ''; }  /* bump "v" on a photo in photos.json after editing it, so browsers fetch the new file */


  /* ORCID public record -> [{doi,title,journal,year,authors}] (cached in the browser for a day) */
  var ORCID_ID = '0000-0002-9060-6203';
  function orcidWorks() {
    var key = 'orcid-works-v1', now = Date.now();
    try { var c = JSON.parse(localStorage.getItem(key) || 'null'); if (c && now - c.t < 864e5) return Promise.resolve(c.w); } catch (e) {}
    return fetch('https://pub.orcid.org/v3.0/' + ORCID_ID + '/works', { headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error('orcid ' + r.status); return r.json(); })
      .then(function (d) {
        var out = [];
        (d.group || []).forEach(function (g) {
          var s = (g['work-summary'] || [])[0]; if (!s) return;
          var doi = ''; ((s['external-ids'] || {})['external-id'] || []).forEach(function (x) { if (x['external-id-type'] === 'doi') doi = x['external-id-value']; });
          var y = (((s['publication-date'] || {}).year) || {}).value;
          out.push({ doi: doi, title: ((s.title || {}).title || {}).value || '', journal: (s['journal-title'] || {}).value || '', year: y ? +y : null, put: s['put-code'] });
        });
        try { localStorage.setItem(key, JSON.stringify({ t: now, w: out })); } catch (e) {}
        return out;
      });
  }

  /* ---- Missing images degrade gracefully --------------------------------- */
  document.addEventListener('error', function (e) {
    var img = e.target;
    if (!img || img.tagName !== 'IMG' || img.dataset.fallbackDone) return;
    if (img.closest('.lightbox')) return;
    if (!img.getAttribute('src')) return;
    /* If the small variant is missing, try the full file once before giving up */
    if (/-s\.jpg$/i.test(img.getAttribute('src')) && !img.dataset.triedFull) {
      img.dataset.triedFull = '1';
      img.removeAttribute('srcset');
      img.src = img.getAttribute('src').replace(/-s\.jpg$/i, '.jpg');
      return;
    }
    img.dataset.fallbackDone = '1';
    var name = (img.getAttribute('src') || '').split('/').pop();
    var box = document.createElement('div');
    box.className = 'ph'; box.textContent = name || 'image';
    img.replaceWith(box);
  }, true);

  /* ======================================================================
     PUBLICATIONS — data/publications.json
     ====================================================================== */
  var themesRoot = document.getElementById('pubThemes');
  var archiveRoot = document.getElementById('pubArchive');
  if (themesRoot || archiveRoot) {
    getJSON('data/publications.json').then(function (data) {
      var papers = data.papers || [];
      var byId = {}; papers.forEach(function (p) { byId[p.id] = p; });

      function paperHTML(p) {
        if (!p) return '';
        var doi = p.doi ? 'https://doi.org/' + p.doi : '';
        var href = p.url || doi;
        var title = href ? '<a href="' + esc(href) + '" rel="noopener">' + esc(p.title) + '</a>' : esc(p.title);
        var meta = '<span>' + esc(p.journal) + (p.year ? ' · ' + esc(p.year) : '') + '</span>' +
                   (doi ? '<a href="' + esc(doi) + '" rel="noopener">doi:' + esc(p.doi) + '</a>' : '');
        return '<li class="pub">' +
          '<div class="pub__title">' + title + '</div>' +
          '<div class="pub__authors">' + markAuthors(p.authors) + '</div>' +
          '<div class="pub__meta">' + meta + '</div>' +
          '</li>';
      }
      if (themesRoot) {
        themesRoot.innerHTML = (data.themes || []).map(function (t) {
          var list = (t.papers || []).map(function (id) { return paperHTML(byId[id]); }).join('');
          return '<section class="theme-block">' +
            '<span class="eyebrow">' + esc(t.label || 'Theme') + '</span>' +
            '<h2>' + esc(t.title) + '</h2>' +
            '<div class="theme-block__summary prose"><p>' + esc(t.summary).replace(/\n\n/g, '</p><p>') + '</p></div>' +
            '<ul class="pub-list">' + list + '</ul></section>';
        }).join('');
      }
      if (archiveRoot) {
        var sorted = papers.slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); });
        var years = [], byYear = {};
        sorted.forEach(function (p) { var y = p.year || 'Undated'; if (!byYear[y]) { byYear[y] = []; years.push(y); } byYear[y].push(p); });
        archiveRoot.innerHTML = years.map(function (y) {
          return '<div class="pub-year" id="year-' + esc(String(y).toLowerCase()) + '" data-nav="' + esc(y) + '">' +
            '<h3 class="pub-year__h">' + esc(y) + '</h3><ul class="pub-list">' + byYear[y].map(paperHTML).join('') + '</ul></div>';
        }).join('');
        if (themesRoot) themesRoot.setAttribute('data-nav', 'By theme');
        autoBar(document.querySelector('.page-head'));
        /* anything on ORCID that is not yet in publications.json appears here by itself */
        orcidWorks().then(function (works) {
          var known = {}; papers.forEach(function (p) { if (p.doi) known[p.doi.toLowerCase()] = 1; });
          var fresh = works.filter(function (w) { return w.doi && !known[w.doi.toLowerCase()]; });
          if (!fresh.length) return;
          var note = document.createElement('div');
          note.innerHTML = '<p class="eyebrow eyebrow--quiet" style="margin-top:2.5rem">New on ORCID</p>' +
            '<p class="quiet small" style="margin-bottom:1rem">Pulled live from my ORCID record; not yet written up above.</p>' +
            '<ul class="pub-list">' + fresh.map(function (w) {
              return paperHTML({ title: w.title, authors: w.authors || '', journal: w.journal || '', year: w.year, doi: w.doi });
            }).join('') + '</ul>';
          archiveRoot.appendChild(note);
        }).catch(function () {});
      }
    }).catch(function (err) {
      console.error(err);
      var msg = '<p class="quiet small">The publication list could not be loaded. If you opened this file directly, double-click start-site.bat instead (see README).</p>';
      if (themesRoot) themesRoot.innerHTML = msg;
      if (archiveRoot) archiveRoot.innerHTML = '';
    });
  }

  /* ======================================================================
     LIVE FACTS — counts that update themselves from the data files
     ====================================================================== */
  var factPapers = document.getElementById('factPapers') || document.getElementById('glancePapers');
  if (factPapers) {
    getJSON('data/publications.json').then(function (d) {
      factPapers.textContent = (d.papers || []).length;
      orcidWorks().then(function (works) {
        var known = {}; (d.papers || []).forEach(function (p) { if (p.doi) known[p.doi.toLowerCase()] = 1; });
        var extra = works.filter(function (w) { return w.doi && !known[w.doi.toLowerCase()]; }).length;
        if (extra) factPapers.textContent = (d.papers || []).length + extra;
      }).catch(function () {});
    }).catch(function () {});
  }
  var factBeam = document.getElementById('factBeamtimes') || document.getElementById('glanceBeam');
  var beamList = document.getElementById('beamtimes');
  var beamCount = document.getElementById('beamtimeCount');
  if (factBeam || beamList) {
    getJSON('data/beamtimes.json').then(function (d) {
      var c = d.campaigns || [];
      if (factBeam) factBeam.textContent = c.length;
      if (beamCount) {
        var words = ['Zero','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve'];
        beamCount.textContent = c.length < words.length ? words[c.length] : String(c.length);
      }
      if (beamList) {
        beamList.innerHTML = c.map(function (b) {
          return '<li><span class="timeline__when">' + esc(b.when) + '</span>' +
            '<span class="timeline__what"><strong>' + (b.url ? '<a href="' + esc(b.url) + '" rel="noopener">' + esc(b.facility) + '</a>' : esc(b.facility)) + '</strong> <span>\u2014 ' + esc(b.what) +
            (b.code ? ' \u00b7 ' + esc(b.code) : '') + '</span></span></li>';
        }).join('');
      }
    }).catch(function () {});
  }

  /* ======================================================================
     RESEARCH HIGHLIGHTS — data/research-notes.json
     Full feed on research.html (#researchNotes); the three newest on the
     home page (#homeHighlights).
     ====================================================================== */
  var notesRoot = document.getElementById('researchNotes');
  var homeHl = document.getElementById('homeHighlights');
  if (notesRoot || homeHl) {
    getJSON('data/research-notes.json').then(function (data) {
      var notes = data.notes || [];

      if (notesRoot) {
        /* Grid of cards + filter buttons; the full text opens in a panel. */
        var groups = [
          ['all', 'All'], ['Publication', 'Publications'], ['Beamtime', 'Beamtimes'], ['Grant|Project', 'Grants & projects'],
          ['Method|Instrument', 'Methods & instruments'], ["Master's project", "Master's projects"]
        ];
        function firstLine(t) { var m = (t || '').match(/^.*?[.!?](\s|$)/); return m ? m[0].trim() : (t || ''); }
        var cards = notes.map(function (n, i) {
          var fig = n.image
            ? '<div class="hcard__figure' + (/^fig-/.test(n.image) ? ' hcard__figure--plate' : '') + '"><img src="' + IMG + esc(small(n.image)) + '" srcset="' + esc(srcset(n.image)) + '" sizes="(min-width: 900px) 30vw, (min-width: 620px) 45vw, 100vw" alt="" loading="lazy"></div>'
            : '';
          return '<button type="button" class="hcard" data-i="' + i + '" data-tag="' + esc(n.tag || '') + '">' + fig +
            '<div class="hcard__body"><div class="note__meta">' +
              (n.tag ? '<span class="note__tag">' + esc(n.tag) + '</span>' : '') +
              (n.date ? '<span class="note__date">' + esc(n.date) + '</span>' : '') + '</div>' +
              '<h3 class="hcard__title">' + esc(n.title) + '</h3>' +
              '<p class="hcard__text">' + esc(firstLine(n.body)) + '</p>' +
              '<span class="hcard__more">Read more</span></div></button>';
        });
        notesRoot.innerHTML = notes.length ?
          '<div class="hfilters" role="group" aria-label="Filter highlights">' + groups.map(function (g, k) {
            return '<button type="button" class="hfilter' + (k ? '' : ' is-on') + '" data-f="' + esc(g[0]) + '">' + esc(g[1]) + '</button>';
          }).join('') + '</div>' +
          '<div class="hgrid">' + cards.join('') + '</div>' +
          '<div class="hpanel" id="hpanel" role="dialog" aria-modal="true" hidden><div class="hpanel__box">' +
            '<button type="button" class="hpanel__close" aria-label="Close">×</button><div class="hpanel__content"></div></div></div>' : '';

        var grid = notesRoot.querySelector('.hgrid'), panel = notesRoot.querySelector('.hpanel'), content = panel.querySelector('.hpanel__content');
        notesRoot.querySelector('.hfilters').addEventListener('click', function (e) {
          var b = e.target.closest('.hfilter'); if (!b) return;
          notesRoot.querySelectorAll('.hfilter').forEach(function (x) { x.classList.toggle('is-on', x === b); });
          var f = b.dataset.f, re = f === 'all' ? null : new RegExp('^(' + f + ')$');
          grid.querySelectorAll('.hcard').forEach(function (c) { c.hidden = !!(re && !re.test(c.dataset.tag)); });
        });
        function openNote(i) {
          var n = notes[i]; if (!n) return;
          var fig = n.image ? '<div class="hpanel__figure' + (/^fig-/.test(n.image) ? ' hcard__figure--plate' : '') + '"><img src="' + IMG + esc(n.image) + '" alt=""></div>' : '';
          var link = n.link ? '<p class="note__link"><a class="link-out" href="' + esc(n.link) + '" rel="noopener">' + esc(n.linkText || 'Read the paper') + '</a></p>' : '';
          content.innerHTML = fig + '<div class="note__meta">' + (n.tag ? '<span class="note__tag">' + esc(n.tag) + '</span>' : '') + (n.date ? '<span class="note__date">' + esc(n.date) + '</span>' : '') + '</div>' +
            '<h3 class="note__title">' + esc(n.title) + '</h3><p class="note__text">' + esc(n.body) + '</p>' + link;
          panel.hidden = false; document.body.style.overflow = 'hidden'; panel.querySelector('.hpanel__close').focus();
        }
        function closeNote() { panel.hidden = true; document.body.style.overflow = ''; }
        grid.addEventListener('click', function (e) { var c = e.target.closest('.hcard'); if (c) openNote(+c.dataset.i); });
        panel.addEventListener('click', function (e) { if (e.target === panel || e.target.closest('.hpanel__close')) closeNote(); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) closeNote(); });
      }

      if (homeHl) {
        homeHl.innerHTML = notes.slice(0, 3).map(function (n) {
          var short = (n.body || '').split('. ').slice(0, 1).join('. ');
          if (short && !/\.$/.test(short)) short += '.';
          var t = n.link ? '<a href="' + esc(n.link) + '" rel="noopener" style="text-decoration:none;">' + esc(n.title) + '</a>' : esc(n.title);
          return '<li><span class="hl__when">' + esc(n.date || '') + '</span>' +
            '<div><div class="hl__title">' + (n.tag ? '<span class="hl__tag">' + esc(n.tag) + '</span>' : '') + t + '</div>' +
            '<div class="hl__text">' + esc(short) + '</div></div></li>';
        }).join('');
      }
    }).catch(function (err) {
      console.error(err);
      if (notesRoot) notesRoot.innerHTML = '<p class="quiet small">Research highlights could not be loaded.</p>';
      if (homeHl) homeHl.innerHTML = '';
    });
  }

  /* ======================================================================
     PHOTOGRAPHY — data/photos.json + images/web/_dims.json
     Justified rows: every photograph keeps its own shape.
     ====================================================================== */
  var galleryRoot = document.getElementById('gallery');
  var lightboxItems = [];

  function layoutJustified(container, targetH) {
    var items = Array.prototype.slice.call(container.children);
    if (!items.length) return;
    var gap = parseFloat(getComputedStyle(container).gap) || 8;
    var W = container.clientWidth;
    if (!W) return;
    var row = [], rowW = 0;
    function flush(last) {
      if (!row.length) return;
      var totalGap = gap * (row.length - 1);
      var scale = (W - totalGap) / rowW;
      /* last row: stretch it to the edge unless that would blow the pictures up absurdly */
      if (last && scale > 1.6) scale = 1;
      var h = targetH * scale;
      row.forEach(function (it) {
        var ar = parseFloat(it.dataset.ar);
        it.style.width = Math.floor(ar * h) + 'px';   /* floor: never a pixel too wide, or the last one wraps */
        it.style.height = Math.round(h) + 'px';
        it.style.flexGrow = '0';
      });
      row = []; rowW = 0;
    }
    items.forEach(function (it) {
      var ar = parseFloat(it.dataset.ar) || 1.5;
      var w = ar * targetH;
      if (rowW + w + gap * row.length > W && row.length) flush(false);
      row.push(it); rowW += w;
    });
    flush(true);
  }

  function relayoutAll() {
    var vw = window.innerWidth;
    var target = vw < 560 ? 150 : vw < 900 ? 190 : 240;
    document.querySelectorAll('.justified').forEach(function (c) { layoutJustified(c, target); });
  }
  if (window.ResizeObserver) {
    var ro = new ResizeObserver(function () { relayoutAll(); });
    document.addEventListener('gallery:ready', function () {
      document.querySelectorAll('.justified').forEach(function (c) { ro.observe(c); });
    });
  }

  function slug(t) { return 'album-' + String(t).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

  if (galleryRoot) {
    Promise.all([getJSON('data/photos.json'), getJSON(IMG + '_dims.json').catch(function () { return {}; })])
    .then(function (res) {
      var data = res[0], dims = res[1] || {};
      var sessions = data.sessions || [];
      if (!sessions.length) { galleryRoot.innerHTML = '<div class="empty-note">No photographs yet.</div>'; return; }

      galleryRoot.innerHTML = sessions.map(function (s) {
        var photos = s.photos || [];
        var picks = photos.filter(function (p) { return p.pick; });
        var rest = photos.filter(function (p) { return !p.pick; });

        function register(ph) {
          lightboxItems.push({ src: IMG + ph.file + vq(ph), caption: ph.caption || '', place: s.title + (s.place ? ' · ' + s.place : '') });
          return lightboxItems.length - 1;
        }
        var featureHTML = picks.map(function (ph) {
          var idx = register(ph);
          var d = dims[ph.file] || [2000, 1325];
          return '<button class="feature" data-lb="' + idx + '" aria-label="' + esc(ph.caption || 'Photograph') + '">' +
            '<img src="' + IMG + esc(small(ph.file)) + vq(ph) + '" srcset="' + esc(srcset(ph.file, ph.v)) + '" sizes="(min-width: 1312px) 1248px, 94vw" width="' + d[0] + '" height="' + d[1] + '" alt="' + esc(ph.caption || '') + '" loading="lazy">' +
            '<span class="feature__cap"><strong>' + esc(ph.caption || '') + '</strong><span>' + esc(s.place || '') + '</span></span>' +
            '</button>';
        }).join('');
        var gridHTML = rest.length ? '<div class="justified">' + rest.map(function (ph) {
          var idx = register(ph);
          var d = dims[ph.file] || [3, 2];
          var ar = d[0] / d[1];
          return '<button class="shot" data-lb="' + idx + '" data-ar="' + ar.toFixed(4) + '" aria-label="' + esc(ph.caption || 'Photograph') + '" style="aspect-ratio:' + ar.toFixed(4) + '">' +
            '<img src="' + IMG + esc(small(ph.file)) + vq(ph) + '" srcset="' + esc(srcset(ph.file, ph.v)) + '" sizes="(min-width: 900px) 30vw, 50vw" width="' + d[0] + '" height="' + d[1] + '" alt="' + esc(ph.caption || '') + '" loading="lazy">' +
            (ph.caption ? '<span class="shot__cap">' + esc(ph.caption) + '</span>' : '') +
            '</button>';
        }).join('') + '</div>' : '';

        return '<section class="session" id="' + slug(s.title) + '">' +
          '<div class="session__head"><h2>' + esc(s.title) + '</h2></div>' +
          (s.note ? '<p class="session__note">' + esc(s.note) + '</p>' : '') +
          featureHTML + gridHTML + '</section>';
      }).join('');

      /* ---- album index: contact strip + sticky bar -------------------- */
      var strip = document.getElementById('albumStrip');
      if (strip) {
        strip.innerHTML = sessions.map(function (s) {
          var ph = (s.photos || []).filter(function (p) { return p.pick; })[0] || (s.photos || [])[0];
          if (!ph) return '';
          return '<a class="albums__item" href="#' + slug(s.title) + '"><img src="' + IMG + esc(small(ph.file)) + vq(ph) + '" alt="" loading="lazy">' +
            esc(s.title) + '<span class="albums__count">' + (s.photos || []).length + ' photographs</span></a>';
        }).join('');
      }
      var stripLinks = {}; if (strip) strip.querySelectorAll('a').forEach(function (a) { stripLinks[a.getAttribute('href').slice(1)] = a; });
      sectionBar({
        label: 'Albums', trigger: strip || galleryRoot, extra: [strip],
        items: sessions.map(function (s) { return { id: slug(s.title), label: s.title }; }),
        onActive: function (id) { Object.keys(stripLinks).forEach(function (k) { stripLinks[k].classList.toggle('is-here', k === id); }); }
      });

      relayoutAll();
      document.dispatchEvent(new Event('gallery:ready'));
      requestAnimationFrame(relayoutAll);
      var t; window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(relayoutAll, 120); });
    }).catch(function (err) {
      console.error(err);
      galleryRoot.innerHTML = '<div class="empty-note">The gallery could not be loaded. If you opened this file directly, double-click start-site.bat instead (see README).</div>';
    });
  }

  /* ---- Lightbox with zoom ------------------------------------------------ */
  var lb = document.getElementById('lightbox');
  if (lb) {
    var lbImg = lb.querySelector('img');
    var lbCap = lb.querySelector('.lightbox__cap');
    var lbCount = lb.querySelector('.lightbox__count');
    var stage = lb.querySelector('.lightbox__stage') || lb;
    var current = 0;
    var z = { s: 1, x: 0, y: 0 }, drag = null, pinch = null;

    function apply() {
      lbImg.style.transform = 'translate(' + z.x + 'px,' + z.y + 'px) scale(' + z.s + ')';
      lb.classList.toggle('is-zoomed', z.s > 1.01);
    }
    function resetZoom() { z = { s: 1, x: 0, y: 0 }; apply(); }
    function zoomAt(factor, px, py) {
      var ns = Math.max(1, Math.min(5, z.s * factor));
      var r = lbImg.getBoundingClientRect();
      /* keep the point under the cursor fixed */
      var ox = px - r.left, oy = py - r.top;
      z.x += ox - ox * (ns / z.s); z.y += oy - oy * (ns / z.s); z.s = ns;
      if (z.s <= 1.01) { resetZoom(); return; }
      apply();
    }

    function preload(i) { var it = lightboxItems[(i + lightboxItems.length) % lightboxItems.length]; if (it) { var im = new Image(); im.src = it.src; } }
    function show(i) {
      if (!lightboxItems.length) return;
      current = (i + lightboxItems.length) % lightboxItems.length;
      var item = lightboxItems[current];
      resetZoom();
      lbImg.src = item.src; lbImg.alt = item.caption || '';
      lbCap.textContent = item.caption || '';
      if (lbCount) lbCount.textContent = (current + 1) + ' / ' + lightboxItems.length;
      preload(current + 1); preload(current - 1);
    }
    function open(i) { show(i); lb.classList.add('is-open'); document.body.style.overflow = 'hidden'; }
    function close() { lb.classList.remove('is-open'); document.body.style.overflow = ''; lbImg.removeAttribute('src'); resetZoom(); }

    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-lb]');
      if (btn) { open(parseInt(btn.getAttribute('data-lb'), 10)); return; }
      if (e.target.matches('.lightbox__close')) close();
      if (e.target.matches('.lightbox__prev')) show(current - 1);
      if (e.target.matches('.lightbox__next')) show(current + 1);
      if (e.target.matches('.lightbox__zin')) { var r = lbImg.getBoundingClientRect(); zoomAt(1.5, r.left + r.width / 2, r.top + r.height / 2); }
      if (e.target.matches('.lightbox__zout')) { var r2 = lbImg.getBoundingClientRect(); zoomAt(1 / 1.5, r2.left + r2.width / 2, r2.top + r2.height / 2); }
      if (e.target.matches('.lightbox__zreset')) resetZoom();
      if (e.target === lb || e.target === stage) close();
    });
    /* double-click / double-tap toggles zoom at that point */
    lbImg.addEventListener('dblclick', function (e) { e.preventDefault(); if (z.s > 1.01) resetZoom(); else zoomAt(2.5, e.clientX, e.clientY); });
    /* wheel zoom */
    stage.addEventListener('wheel', function (e) {
      if (!lb.classList.contains('is-open')) return;
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX, e.clientY);
    }, { passive: false });
    /* drag to pan when zoomed */
    lbImg.addEventListener('pointerdown', function (e) {
      if (z.s <= 1.01) return;
      drag = { x: e.clientX - z.x, y: e.clientY - z.y }; lb.classList.add('is-dragging'); lbImg.setPointerCapture(e.pointerId);
    });
    lbImg.addEventListener('pointermove', function (e) { if (!drag) return; z.x = e.clientX - drag.x; z.y = e.clientY - drag.y; apply(); });
    lbImg.addEventListener('pointerup', function () { drag = null; lb.classList.remove('is-dragging'); });
    lbImg.addEventListener('pointercancel', function () { drag = null; lb.classList.remove('is-dragging'); });
    /* pinch zoom + swipe */
    var x0 = null;
    stage.addEventListener('touchstart', function (e) {
      if (e.touches.length === 2) { var a = e.touches[0], b = e.touches[1]; pinch = { d: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), s: z.s, cx: (a.clientX + b.clientX) / 2, cy: (a.clientY + b.clientY) / 2 }; }
      else if (e.touches.length === 1) x0 = e.touches[0].clientX;
    }, { passive: true });
    stage.addEventListener('touchmove', function (e) {
      if (pinch && e.touches.length === 2) {
        var a = e.touches[0], b = e.touches[1], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
        var f = (pinch.s * d / pinch.d) / z.s; zoomAt(f, pinch.cx, pinch.cy);
      }
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (pinch) { pinch = null; return; }
      if (x0 == null || z.s > 1.01) { x0 = null; return; }
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) show(dx < 0 ? current + 1 : current - 1);
    });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') { if (z.s > 1.01) resetZoom(); else close(); }
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
      if (e.key === '+' || e.key === '=') { var r = lbImg.getBoundingClientRect(); zoomAt(1.5, r.left + r.width / 2, r.top + r.height / 2); }
      if (e.key === '-') { var r2 = lbImg.getBoundingClientRect(); zoomAt(1 / 1.5, r2.left + r2.width / 2, r2.top + r2.height / 2); }
      if (e.key === '0') resetZoom();
    });
  }

  /* ======================================================================
     RESEARCH GRAPHICS
     ====================================================================== */
  function svgEl(tag, attrs) {
    var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }
  function tipFor(box) {
    var t = document.createElement('div'); t.className = 'graphic__tip'; box.appendChild(t);
    return {
      show: function (x, y, html) { t.innerHTML = html; t.style.left = x + 'px'; t.style.top = y + 'px'; t.classList.add('is-on'); },
      hide: function () { t.classList.remove('is-on'); }
    };
  }

  /* ---- World map ------------------------------------------------------- */
  var mapRoot = document.getElementById('worldMap');
  if (mapRoot) {
    getJSON('data/worldmap.json').then(function (m) {
      var svg = svgEl('svg', { viewBox: '440 52 480 220', role: 'img', 'aria-label': 'World map of places lived and worked' });
      svg.appendChild(svgEl('path', { d: m.land, 'class': 'map-land' }));
      m.hi.forEach(function (c) { var p = svgEl('path', { d: c.d, 'class': 'map-hi' }); p.appendChild(svgEl('title', {})).textContent = c.name; svg.appendChild(p); });
      svg.appendChild(svgEl('path', { d: m.journey, 'class': 'map-journey' }));
      /* a small light travelling the whole route, over and over */
      var mover = svgEl('circle', { r: 1.6, 'class': 'map-mover' });
      var am = svgEl('animateMotion', { dur: '28s', repeatCount: 'indefinite', path: m.journey, rotate: 'auto' });
      mover.appendChild(am); svg.appendChild(mover);
      var tip = tipFor(mapRoot);
      m.places.forEach(function (p) {
        var r = p.k === 'home' ? 2.6 : 2;
        if (p.n === 'Rome') { var ring = svgEl('circle', { cx: p.x, cy: p.y, r: 3, 'class': 'map-pulse' }); svg.appendChild(ring); }
        var c = svgEl('circle', { cx: p.x, cy: p.y, r: r, 'class': 'map-pin map-pin--' + p.k });
        c.addEventListener('mousemove', function (e) { var b = mapRoot.getBoundingClientRect(); tip.show(e.clientX - b.left, e.clientY - b.top, esc(p.n)); });
        c.addEventListener('mouseleave', tip.hide);
        svg.appendChild(c);
      });
      /* a few labels for the lived places, offset so they do not collide */
      var labels = { 'Peradeniya': [5, 6], 'Bayreuth': [4, -3], 'Sendai': [4, -2], 'Rome': [4, 5], 'Tsukuba': [4, 6], 'Nancy': [4, -3], 'Paris': [-4, -3, 'end'], 'Faenza': [-4, 1, 'end'], 'Camerino': [4, 2] };
      m.places.forEach(function (p) {
        if (!labels[p.n]) return;
        var o = labels[p.n];
        var t = svgEl('text', { x: p.x + o[0], y: p.y + o[1], 'class': 'map-label', 'text-anchor': o[2] || 'start' }); t.textContent = p.n; svg.appendChild(t);
      });
      mapRoot.insertBefore(svg, mapRoot.firstChild);
    }).catch(function (e) { console.error(e); mapRoot.innerHTML = '<p class="quiet small" style="padding:1rem">The map could not be loaded.</p>'; });
  }

  /* ---- Co-author network ---------------------------------------------- */
  var netRoot = document.getElementById('coauthorNet');
  var netRoot = document.getElementById('coauthorNet');
  /* ---- Co-author places: where the people on the papers work ----------- */
  var cmapRoot = document.getElementById('coauthorMap');
  if (cmapRoot && netRoot) {
    var tabs = document.querySelector('.viewtabs'), zoomBox = tabs && tabs.querySelector('.viewtabs__zoom');
    var lede = document.getElementById('coauthorLede'), ledeNet = lede ? lede.innerHTML : '';
    var built = false, svgM, VIEWS = { world: [330, 45, 670, 380], europe: [452, 62, 150, 78] };
    function setView(name, animate) {
      if (!svgM) return;
      var to = VIEWS[name], from = (svgM.getAttribute('viewBox') || '0 0 1000 520').split(' ').map(Number);
      if (!animate) { svgM.setAttribute('viewBox', to.join(' ')); return; }
      var t0 = performance.now(), D = 650;
      (function step(now) {
        var k = Math.min(1, (now - t0) / D); k = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        svgM.setAttribute('viewBox', from.map(function (a, i) { return a + (to[i] - a) * k; }).join(' '));
        if (k < 1) requestAnimationFrame(step);
      })(t0);
      /* scale the city rings so they stay readable when zoomed in */
      var k2 = name === 'europe' ? 0.4 : 1;
      svgM.querySelectorAll('[data-r]').forEach(function (c) { c.setAttribute('r', (parseFloat(c.dataset.r) * k2).toFixed(2)); if (c.classList.contains('cmap-city')) c.style.strokeWidth = (0.6 * Math.max(k2, 0.5)) + 'px'; });
      svgM.querySelectorAll('.cmap-label').forEach(function (t) { t.style.fontSize = (3.6 * k2).toFixed(2) + 'px'; t.setAttribute('x', (parseFloat(t.dataset.x) + (parseFloat(t.dataset.r) + 1.5) * k2).toFixed(2)); t.setAttribute('y', (parseFloat(t.dataset.y) + 1.3 * k2).toFixed(2)); });
      svgM.querySelectorAll('.cmap-arc').forEach(function (a) { a.style.strokeWidth = (0.45 * (name === 'europe' ? 0.5 : 1)) + 'px'; });
    }
    function build() {
      if (built) return; built = true;
      Promise.all([getJSON('data/worldmap.json'), getJSON('data/coauthor-places.json')]).then(function (res) {
        var m = res[0], d = res[1], home = d.home, places = d.places || [];
        svgM = svgEl('svg', { viewBox: VIEWS.world.join(' '), role: 'img', 'aria-label': 'Map of where my co-authors work' });
        svgM.appendChild(svgEl('path', { d: m.land, 'class': 'map-land' }));
        var arcs = svgEl('g', {}), dots = svgEl('g', {}), labels = svgEl('g', {});
        svgM.appendChild(arcs); svgM.appendChild(dots); svgM.appendChild(labels);
        var maxP = places.reduce(function (a, p) { return Math.max(a, p.people.length); }, 1);
        var tip = tipFor(cmapRoot);
        places.forEach(function (p, i) {
          /* a great-circle-ish arc: a quadratic curve bowed away from the equator */
          var mx = (home.x + p.x) / 2, my = (home.y + p.y) / 2, dx = p.x - home.x, dy = p.y - home.y, L = Math.hypot(dx, dy);
          var bow = Math.min(60, L * 0.22), nx = -dy / (L || 1), ny = dx / (L || 1);
          if (ny > 0) { nx = -nx; ny = -ny; }   /* always bow upward (north) */
          var dPath = 'M' + home.x + ',' + home.y + ' Q' + (mx + nx * bow).toFixed(1) + ',' + (my + ny * bow).toFixed(1) + ' ' + p.x + ',' + p.y;
          var arc = svgEl('path', { d: dPath, 'class': 'cmap-arc' });
          arcs.appendChild(arc);
          var len = arc.getTotalLength ? arc.getTotalLength() : 400;
          arc.style.strokeDasharray = len; arc.style.strokeDashoffset = len; arc.style.transition = 'stroke-dashoffset 1.1s ease ' + (0.15 + i * 0.03).toFixed(2) + 's, stroke-opacity 0.3s, stroke-width 0.3s';
          var r = 2.2 + 7 * Math.sqrt(p.people.length / maxP);
          var g = svgEl('g', { 'class': 'cmap-place' });
          var ring = svgEl('circle', { cx: p.x, cy: p.y, r: r, 'data-r': r, 'class': 'cmap-city' });
          var core = svgEl('circle', { cx: p.x, cy: p.y, r: 1.1, 'data-r': 1.1, 'class': 'cmap-core' });
          g.appendChild(ring); g.appendChild(core); dots.appendChild(g);
          if (p.people.length >= 3) { var t = svgEl('text', { x: p.x + r + 1.5, y: p.y + 1.3, 'data-x': p.x, 'data-y': p.y, 'data-r': r, 'class': 'cmap-label', style: 'font-size:3.6px' }); t.textContent = p.city; labels.appendChild(t); }
          function on(e) {
            arc.classList.add('is-hot'); ring.classList.add('is-hot');
            var rect = cmapRoot.getBoundingClientRect();
            tip.show(e.clientX - rect.left, e.clientY - rect.top,
              '<strong>' + esc(p.city) + '</strong>, ' + esc(p.country) + '<br><span style="color:var(--ink-faint)">' + esc(p.institutions.join(' · ')) + '</span><br>' +
              esc(p.people.join(', ')) + '<br><span style="color:var(--ink-faint)">' + p.papers + (p.papers === 1 ? ' paper together' : ' papers together') + '</span>');
          }
          function off() { arc.classList.remove('is-hot'); ring.classList.remove('is-hot'); tip.hide(); }
          g.addEventListener('mouseenter', on); g.addEventListener('mousemove', on); g.addEventListener('mouseleave', off);
          g.addEventListener('click', function (e) { if (ring.classList.contains('is-hot')) off(); else on(e); });
        });
        /* home */
        svgM.appendChild(svgEl('circle', { cx: home.x, cy: home.y, r: 6, 'data-r': 6, 'class': 'cmap-home-ring' }));
        svgM.appendChild(svgEl('circle', { cx: home.x, cy: home.y, r: 2.6, 'data-r': 2.6, 'class': 'cmap-home' }));
        cmapRoot.insertBefore(svgM, cmapRoot.firstChild);
        var countries = {}; places.forEach(function (p) { countries[p.country] = 1; });
        var legend = document.getElementById('coauthorMapLegend');
        if (legend) legend.innerHTML = '<span><i style="background:var(--ember)"></i>Rome, where the lines start</span><span><i style="background:#7fb0ff"></i>' + places.length + ' cities in ' + Object.keys(countries).length + ' countries — a bigger ring means more co-authors there</span>';
        requestAnimationFrame(function () { requestAnimationFrame(function () { arcs.querySelectorAll('.cmap-arc').forEach(function (a) { a.classList.add('is-drawn'); }); }); });
      }).catch(function (e) { console.error(e); cmapRoot.innerHTML = '<p class="quiet small" style="padding:1rem">The map could not be loaded.</p>'; });
    }
    if (tabs) tabs.addEventListener('click', function (e) {
      var b = e.target.closest('.viewtab'); if (!b) return;
      if (b.dataset.view) {
        tabs.querySelectorAll('[data-view]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
        var map = b.dataset.view === 'map';
        netRoot.hidden = map; cmapRoot.hidden = !map; if (zoomBox) zoomBox.hidden = !map;
        if (lede) lede.innerHTML = map ? 'Where the people on those papers work, from the affiliations on the papers. Lines start from Rome; a bigger ring means more co-authors in that city. Point at a city to see who.' : ledeNet;
        if (map) build();
      } else if (b.dataset.zoom) {
        tabs.querySelectorAll('[data-zoom]').forEach(function (x) { x.classList.toggle('is-on', x === b); });
        setView(b.dataset.zoom, true);
      }
    });
  }

  if (netRoot) {
    getJSON('data/publications.json').then(function (d) {
      var ME = /abeykoon|abekoon/i;
      var papers = d.papers || [];
      var nodes = {}, links = {};
      /* colour by theme: each co-author takes the colour of the theme they share most papers with me in */
      var PAL = ['#e8823c', '#d94f6b', '#f0c050', '#6fa8dc', '#4fb3a0', '#b48cd6'];
      var themeOf = {}; (d.themes || []).forEach(function (t, ti) { (t.papers || []).forEach(function (id) { if (themeOf[id] == null) themeOf[id] = ti; }); });
      function key(n) { return n.replace(/\s+/g, ' ').trim(); }
      papers.forEach(function (p) {
        var ti = themeOf[p.id] == null ? 0 : themeOf[p.id];
        var names = (p.authors || '').split(',').map(key).filter(Boolean);
        names.forEach(function (n) {
          var id = ME.test(n) ? 'ME' : n;
          nodes[id] = nodes[id] || { id: id, name: ME.test(n) ? 'Sumith Abeykoon' : n, papers: 0, deg: 0, themes: {} };
          nodes[id].papers++; nodes[id].themes[ti] = (nodes[id].themes[ti] || 0) + 1;
        });
        var ids = names.map(function (n) { return ME.test(n) ? 'ME' : n; });
        for (var i = 0; i < ids.length; i++) for (var j = i + 1; j < ids.length; j++) {
          var a = ids[i] < ids[j] ? ids[i] : ids[j], b = ids[i] < ids[j] ? ids[j] : ids[i];
          var k = a + '|' + b; links[k] = links[k] || { s: a, t: b, w: 0, ti: ti }; links[k].w++;
        }
      });
      function themeIdx(n) { var best = 0, bc = -1; Object.keys(n.themes).forEach(function (t) { if (n.themes[t] > bc) { bc = n.themes[t]; best = +t; } }); return best; }
      var legend = netRoot.querySelector('.graphic__legend');
      if (legend) legend.innerHTML = '<span><i style="background:var(--ember)"></i>Me</span>' + (d.themes || []).map(function (t, ti) { return '<span><i style="background:' + PAL[ti % PAL.length] + '"></i>' + esc(t.short || t.label || t.title) + '</span>'; }).join('') + '<span style="margin-left:auto">Larger circles: more papers together</span>';
      var N = Object.keys(nodes).map(function (k) { return nodes[k]; });
      var L = Object.keys(links).map(function (k) { return links[k]; });
      L.forEach(function (l) { nodes[l.s].deg++; nodes[l.t].deg++; });

      var W = 1000, H = 620, cx = W / 2, cy = H / 2;
      N.forEach(function (n, i) {
        var a = (i / N.length) * Math.PI * 2, r = n.id === 'ME' ? 0 : 180 + Math.random() * 120;
        n.x = cx + Math.cos(a) * r; n.y = cy + Math.sin(a) * r; n.vx = 0; n.vy = 0;
      });
      var idx = {}; N.forEach(function (n) { idx[n.id] = n; });
      /* simple force simulation: repulsion + springs + centre pull */
      for (var it = 0; it < 320; it++) {
        var k = 1 - it / 320, step = 0.9 * k + 0.1;
        for (var i = 0; i < N.length; i++) for (var j = i + 1; j < N.length; j++) {
          var a = N[i], b = N[j], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2);
          var f = 2600 / d2;
          a.vx -= dx / d * f; a.vy -= dy / d * f; b.vx += dx / d * f; b.vy += dy / d * f;
        }
        L.forEach(function (l) {
          var a = idx[l.s], b = idx[l.t], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01;
          var target = 70 + 40 / l.w, f = (d - target) * 0.02 * Math.min(l.w, 4);
          a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
        });
        N.forEach(function (n) {
          if (n.id === 'ME') { n.x = cx; n.y = cy; n.vx = n.vy = 0; return; }
          n.vx += (cx - n.x) * 0.004; n.vy += (cy - n.y) * 0.006;
          n.x += n.vx * step; n.y += n.vy * step; n.vx *= 0.6; n.vy *= 0.6;
          n.x = Math.max(24, Math.min(W - 24, n.x)); n.y = Math.max(20, Math.min(H - 20, n.y));
        });
      }
      var svg = svgEl('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Co-author network' });
      L.forEach(function (l) {
        var a = idx[l.s], b = idx[l.t];
        svg.appendChild(svgEl('line', { x1: a.x.toFixed(1), y1: a.y.toFixed(1), x2: b.x.toFixed(1), y2: b.y.toFixed(1), 'class': 'net-link', stroke: PAL[l.ti % PAL.length], 'stroke-width': (0.5 + Math.min(l.w, 5) * 0.5).toFixed(1) }));
      });
      var tip = tipFor(netRoot);
      N.forEach(function (n) {
        var r = n.id === 'ME' ? 13 : 3.5 + Math.min(n.papers, 8) * 1.1;
        var cls = n.id === 'ME' ? 'me' : (n.papers >= 3 ? 'core' : 'other');
        var c = svgEl('circle', { cx: n.x.toFixed(1), cy: n.y.toFixed(1), r: r, 'class': 'net-node net-node--' + cls, style: n.id === 'ME' ? '' : 'fill:' + PAL[themeIdx(n) % PAL.length], opacity: n.id === 'ME' ? 1 : (n.papers >= 3 ? 1 : 0.75) });
        c.addEventListener('mousemove', function (e) { var b = netRoot.getBoundingClientRect(); tip.show(e.clientX - b.left, e.clientY - b.top, '<strong>' + esc(n.name) + '</strong> &middot; ' + n.papers + (n.papers === 1 ? ' paper' : ' papers') + ' together'); });
        c.addEventListener('mouseleave', tip.hide);
        svg.appendChild(c);
        if (n.id === 'ME' || n.papers >= 3) {
          var t = svgEl('text', { x: (n.x + r + 3).toFixed(1), y: (n.y + 3.5).toFixed(1), 'class': 'net-label' });
          t.textContent = n.id === 'ME' ? 'Abeykoon' : n.name.split(' ').pop(); svg.appendChild(t);
        }
      });
      netRoot.insertBefore(svg, netRoot.firstChild);
      var cnt = document.getElementById('coauthorCount'); if (cnt) cnt.textContent = N.length - 1;
      var g = document.getElementById('glanceCoauthors'); if (g) g.textContent = N.length - 1;
      var cp = document.getElementById('coauthorPapers'); if (cp) cp.textContent = papers.length;
    }).catch(function (e) { console.error(e); netRoot.innerHTML = '<p class="quiet small" style="padding:1rem">The network could not be loaded.</p>'; });
  }

  /* ---- Career timeline ------------------------------------------------- */
  var careerRoot = document.getElementById('career');
  if (careerRoot) {
    getJSON('data/career.json').then(function (d) {
      careerRoot.innerHTML = (d.positions || []).map(function (p) {
        return '<li' + (p.now ? ' class="is-now"' : '') + '><span class="career__when">' + esc(p.when) + '</span>' +
          '<div class="career__what"><strong>' + esc(p.role) + (p.now ? '<span class="career__flag">now</span>' : '') + '</strong>' +
          '<span>' + (p.url ? '<a href="' + esc(p.url) + '" rel="noopener">' + esc(p.where) + '</a>' : esc(p.where)) + '</span>' + (p.note ? '<em>' + esc(p.note) + '</em>' : '') + '</div></li>';
      }).join('');
    }).catch(function () {});
  }

  /* ======================================================================
     WRITING — data/posts.json
     ====================================================================== */
  var postsRoot = document.getElementById('postList');
  if (postsRoot) {
    getJSON('data/posts.json').then(function (data) {
      var posts = data.posts || [];
      if (!posts.length) {
        postsRoot.innerHTML = '<div class="empty-note">Nothing here yet. I write when something is worth writing about, which is not on any schedule.</div>';
        return;
      }
      postsRoot.innerHTML = '<ul class="posts">' + posts.map(function (p) {
        return '<li class="post-item"><a href="' + esc(p.url) + '"><h2>' + esc(p.title) + '</h2>' +
          (p.excerpt ? '<p>' + esc(p.excerpt) + '</p>' : '') +
          (p.kicker ? '<span class="meta">' + esc(p.kicker) + '</span>' : '') + '</a></li>';
      }).join('') + '</ul>';
    }).catch(function () { postsRoot.innerHTML = '<div class="empty-note">Nothing here yet.</div>'; });
  }


  /* ---- Descent rail: scroll = depth into the Earth ----------------------- */
  var descent = document.getElementById('descent');
  if (descent) {
    document.documentElement.classList.add('has-descent');
    getJSON('data/descent.json').then(function (d) {
      var stops = d.stops || []; if (stops.length < 2) return;
      var earth = d.earth || {}, prof = earth.profile || [[0, 0, 20], [6371, 364, 5700]], layers = earth.layers || [];
      var RE = 6371, PEARTH = prof[prof.length - 1][1], TEARTH = prof[prof.length - 1][2];
      var PMAX = stops.reduce(function (m, s) { return Math.max(m, s.gpa || 0); }, PEARTH), TMAX = stops.reduce(function (m, s) { return Math.max(m, s.tc || 0); }, 6000);
      var q = function (sel) { return descent.querySelector(sel); };
      var fill = q('.descent__fill'), holder = q('.descent__stops'), depthEl = q('.descent__depth'), whereEl = q('.descent__where'),
          layerEl = q('.descent__layer'), toolEl = q('.descent__tool'), tEl = q('.descent__t'), pEl = q('.descent__p'),
          tNeedle = q('.descent__bar--t i'), pNeedle = q('.descent__bar--p i'), svg = q('.descent__earth'), planetSvg = q('.descent__planet');
      var dots = stops.map(function (s, i) {
        var e = document.createElement('span'); e.className = 'descent__stop'; e.style.top = (i / (stops.length - 1) * 100) + '%';
        e.title = s.name; holder.appendChild(e); return e;
      });
      /* the cutaway Earth */
      var C = 60, R = 54, rings = [], probe, dot;
      if (svg) {
        var defs = svgEl('defs', {});
        var g1 = svgEl('radialGradient', { id: 'eSurf', cx: '35%', cy: '30%', r: '75%' });
        g1.appendChild(svgEl('stop', { offset: '0', 'stop-color': '#9fc3e6' })); g1.appendChild(svgEl('stop', { offset: '0.55', 'stop-color': '#3f6f9e' })); g1.appendChild(svgEl('stop', { offset: '1', 'stop-color': '#17304d' }));
        defs.appendChild(g1);
        var clip = svgEl('clipPath', { id: 'eWedge' }); clip.appendChild(svgEl('path', { d: 'M' + C + ',' + C + ' L' + (C + R + 2) + ',' + C + ' A' + (R + 2) + ',' + (R + 2) + ' 0 0 1 ' + C + ',' + (C + R + 2) + ' Z' })); defs.appendChild(clip);
        svg.appendChild(defs);
        svg.appendChild(svgEl('circle', { cx: C, cy: C, r: R, fill: 'url(#eSurf)' }));
        var wedge = svgEl('g', { 'clip-path': 'url(#eWedge)' });
        layers.forEach(function (L) {
          var r = R * (1 - L.top / RE);
          var c = svgEl('circle', { cx: C, cy: C, r: r, fill: L.color, stroke: 'rgba(0,0,0,0.35)', 'stroke-width': 0.6 });
          wedge.appendChild(c); rings.push(c);
        });
        svg.appendChild(wedge);
        /* cut faces */
        svg.appendChild(svgEl('path', { d: 'M' + C + ',' + C + ' L' + (C + R) + ',' + C + ' M' + C + ',' + C + ' L' + C + ',' + (C + R), stroke: 'rgba(0,0,0,0.5)', 'stroke-width': 0.8, fill: 'none' }));
        svg.appendChild(svgEl('circle', { cx: C, cy: C, r: R, fill: 'none', stroke: 'rgba(255,255,255,0.25)', 'stroke-width': 0.6 }));
        probe = svgEl('line', { 'class': 'earth__probe' }); dot = svgEl('circle', { 'class': 'earth__dot', r: 2.8 });
        svg.appendChild(probe); svg.appendChild(dot);
      }
      /* Jupiter, for the stop that goes beyond the Earth */
      if (planetSvg) {
        var pd = svgEl('defs', {});
        var pc = svgEl('clipPath', { id: 'jDisc' }); pc.appendChild(svgEl('circle', { cx: C, cy: C, r: R })); pd.appendChild(pc);
        var sh = svgEl('radialGradient', { id: 'jShade', cx: '35%', cy: '32%', r: '78%' });
        sh.appendChild(svgEl('stop', { offset: '0', 'stop-color': '#fff', 'stop-opacity': '0.22' })); sh.appendChild(svgEl('stop', { offset: '0.6', 'stop-color': '#000', 'stop-opacity': '0' })); sh.appendChild(svgEl('stop', { offset: '1', 'stop-color': '#000', 'stop-opacity': '0.45' }));
        pd.appendChild(sh); planetSvg.appendChild(pd);
        var jg = svgEl('g', { 'clip-path': 'url(#jDisc)' });
        var bands = [['#cfb08a', 9], ['#a3704a', 7], ['#e6d2ad', 8], ['#8f5634', 6], ['#f0e0c2', 10], ['#b57a4e', 7], ['#e2c9a2', 9], ['#874c2e', 7], ['#d6b88e', 8], ['#a87850', 8], ['#e8d6b6', 9], ['#95613e', 7], ['#c9a67e', 8], ['#b08866', 9], ['#a58b6a', 8]];
        var y = C - R, sum = bands.reduce(function (m, b) { return m + b[1]; }, 0);
        bands.forEach(function (b) { var h = b[1] / sum * 2 * R; jg.appendChild(svgEl('rect', { x: C - R, y: y, width: 2 * R, height: h + 0.4, fill: b[0] })); y += h; });
        jg.appendChild(svgEl('ellipse', { cx: C + 18, cy: C + 17, rx: 11, ry: 6.5, fill: '#c9654a', opacity: 0.9 }));
        jg.appendChild(svgEl('ellipse', { cx: C + 18, cy: C + 17, rx: 7, ry: 3.8, fill: '#e08a6e', opacity: 0.8 }));
        jg.appendChild(svgEl('circle', { cx: C, cy: C, r: R, fill: 'url(#jShade)' }));
        planetSvg.appendChild(jg);
        planetSvg.appendChild(svgEl('circle', { cx: C, cy: C, r: R, fill: 'none', stroke: 'rgba(255,255,255,0.25)', 'stroke-width': 0.6 }));
      }
      function hex(c) { var m = /^#?([0-9a-f]{6})$/i.exec(c || ''); if (!m) return [210, 105, 30]; var n = parseInt(m[1], 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
      function mix(a, b, t) { var A = hex(a), B = hex(b); return 'rgb(' + A.map(function (v, i) { return Math.round(v + (B[i] - v) * t); }).join(',') + ')'; }
      function fmt(km) { return km < 10 ? (Math.round(km * 10) / 10) : Math.round(km).toLocaleString('en-GB'); }
      function at(depth) { /* pressure and temperature inside the Earth at this depth */
        for (var k = 1; k < prof.length; k++) if (depth <= prof[k][0]) {
          var a = prof[k - 1], b = prof[k], f = (depth - a[0]) / (b[0] - a[0] || 1);
          return [a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
        }
        return [prof[prof.length - 1][1], prof[prof.length - 1][2]];
      }
      var last = -1, lastLayer = -1, ticking = false;
      function update() {
        ticking = false;
        var max = document.documentElement.scrollHeight - window.innerHeight; if (max <= 0) return;
        var p = Math.min(1, Math.max(0, window.scrollY / max));
        var seg = p * (stops.length - 1), i = Math.min(stops.length - 2, Math.floor(seg)), t = seg - i;
        var a = stops[i], b = stops[i + 1];
        var km = a.depth + (b.depth - a.depth) * t, col = mix(a.color, b.color, t);
        var beyond = b.planet ? t : 0; /* 0..1 across the stop that leaves the Earth */
        descent.style.setProperty('--dc', col); descent.style.setProperty('--p', (p * 100) + '%');
        fill.style.height = (p * 100) + '%';
        var here = p <= 0.001 ? 0 : i + 1;
        dots.forEach(function (e, k) { e.classList.toggle('is-past', k < here); e.classList.toggle('is-here', k === here); });
        if (here !== last) {
          last = here; var s = stops[here]; descent.style.setProperty('--y', Math.min(86, Math.max(14, here / (stops.length - 1) * 100)) + '%');
          toolEl.textContent = here === 0 ? s.name + ' \u00b7 ' + s.pt : s.name + ' \u00b7 ' + s.where + ' \u00b7 ' + s.pt;
        }
        var pt = at(km);
        if (beyond > 0) {
          pt = [PEARTH + ((b.gpa || PEARTH) - PEARTH) * beyond, TEARTH + ((b.tc || TEARTH) - TEARTH) * beyond];
          depthEl.textContent = pt[0] >= 1000 ? (Math.round(pt[0] / 10) / 100) + ' TPa' : Math.round(pt[0]) + ' GPa';
        } else depthEl.textContent = fmt(km) + ' km';
        if (planetSvg) { planetSvg.style.opacity = beyond; svg.style.opacity = 1 - beyond; }
        if (tEl) { tEl.textContent = Math.round(pt[1]).toLocaleString('en-GB') + ' \u00b0C'; tNeedle.style.setProperty('--v', Math.min(100, pt[1] / TMAX * 100) + '%'); }
        if (pEl) { pEl.textContent = (pt[0] < 10 ? Math.round(pt[0] * 10) / 10 : Math.round(pt[0]).toLocaleString('en-GB')) + ' GPa'; pNeedle.style.setProperty('--v', Math.min(100, pt[0] / PMAX * 100) + '%'); }
        var li = -1; layers.forEach(function (L, k) { if (km >= L.top && km <= L.bottom) li = k; });
        if (beyond > 0.02) li = -2;
        if (li !== lastLayer) { lastLayer = li; whereEl.textContent = li === -2 ? b.where : li >= 0 ? layers[li].name : stops[0].where; if (layerEl) layerEl.textContent = ''; rings.forEach(function (r, k) { r.classList.toggle('earth__ring--here', k === li); }); }
        if (dot) {
          var rr = R * (1 - km / RE), cs = Math.SQRT1_2;
          dot.setAttribute('cx', C + rr * cs); dot.setAttribute('cy', C + rr * cs);
          probe.setAttribute('x1', C + R * cs); probe.setAttribute('y1', C + R * cs); probe.setAttribute('x2', C + rr * cs); probe.setAttribute('y2', C + rr * cs);
        }
        descent.classList.add('is-on');
      }
      window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      window.addEventListener('resize', update);
      update();
    }).catch(function (e) { console.error(e); descent.remove(); });
  }


  /* ---- Gallery motion: cursor-following drift on the feature images, staggered reveal of tiles ---- */
  (function () {
    var g = document.getElementById('gallery'); if (!g) return;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function arm() {
      if (fine) g.querySelectorAll('.feature').forEach(function (f) {
        var img = f.querySelector('img'); if (!img || f.dataset.armed) return; f.dataset.armed = 1;
        f.addEventListener('mousemove', function (e) {
          var r = f.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
          img.style.transform = 'scale(1.06) translate(' + (-x * 2.2) + '%, ' + (-y * 2.2) + '%)';
        });
        f.addEventListener('mouseleave', function () { img.style.transform = ''; });
      });
      if ('IntersectionObserver' in window) {
        var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
        g.querySelectorAll('.shot:not(.is-in), .feature:not(.is-in), .session__head:not(.is-in)').forEach(function (el, i) { el.style.transitionDelay = (i % 6) * 60 + 'ms'; io.observe(el); });
      } else g.querySelectorAll('.shot, .feature').forEach(function (el) { el.classList.add('is-in'); });
    }
    new MutationObserver(arm).observe(g, { childList: true });
    arm();
  })();

  /* External links (and PDFs) open in a new tab; works for links added later too */
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || a.target) return;
    var url;
    try { url = new URL(a.getAttribute('href'), location.href); } catch (err) { return; }
    if (!/^https?:$/.test(url.protocol)) return;
    var external = url.hostname !== location.hostname;
    var pdf = /\.pdf$/i.test(url.pathname);
    if (external || pdf) { a.target = '_blank'; a.rel = 'noopener'; }
  }, true);

})();
