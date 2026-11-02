(function () {
  var LAYOUT = window.LAYOUT || [], TEXT = window.INVITE || {};
  // Two versions of the same invitation: the normal link says "YOU ARE",
  // the family link (?family or #family) says "YOU & YOUR FAMILY ARE".
  // Everyone starts on the normal wording; only the private family code switches it.
  var FAMILY_HASH = '8a6665d40469dc70d113694d7f7d1c71e49b1397bf7685d3d8a786be58bcecd9';
  var familyText = TEXT.k08;
  if (TEXT.k08_single != null) TEXT.k08 = TEXT.k08_single;
  function checkFamily() {
    var m = /[?&]i=([A-Za-z0-9]{6,32})/.exec(location.search);
    if (!m || !window.crypto || !crypto.subtle || !window.TextEncoder) return;
    crypto.subtle.digest('SHA-256', new TextEncoder().encode(m[1])).then(function (buf) {
      var hex = Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join('');
      if (hex !== FAMILY_HASH) return;
      document.querySelectorAll('[data-k="k08"]').forEach(function (el) { setText(el, familyText); });
    }).catch(function () {});
  }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var book = document.getElementById('book');

  function setText(el, s) {
    el.textContent = '';
    String(s == null ? '' : s).split('\n').forEach(function (line, i) {
      if (i) el.appendChild(document.createElement('br'));
      el.appendChild(document.createTextNode(line));
    });
  }
  function photo(box, slot, label) {
    var sp = document.createElement('span'); sp.textContent = label; box.appendChild(sp);
    var img = new Image(); img.alt = '';
    img.onload = function () { sp.remove(); box.appendChild(img); };
    img.src = 'photos/' + slot + '.jpg';
  }

  LAYOUT.forEach(function (sc, si) {
    var sec = document.createElement('section'); sec.className = 'scene'; sec.id = 's' + (si + 1);
    sec.setAttribute('aria-label', sc.alt);
    var inner = document.createElement('div'); inner.className = 'inner'; sec.appendChild(inner);
    var plate = document.createElement('img'); plate.className = 'plate'; plate.alt = ''; plate.src = sc.plate;
    plate.width = 900; plate.height = 1600; plate.decoding = 'async'; if (si > 1) plate.loading = 'lazy';
    inner.appendChild(plate);
    var k = 0;
    sc.items.forEach(function (it) {
      var el;
      if (it.t === 'text') {
        el = document.createElement(it.tag || 'div'); el.className = it.cls; el.style.cssText = it.style; el.dataset.k = it.k;
        if (it.href) { el.href = it.href; el.target = '_blank'; el.rel = 'noopener'; }
        setText(el, TEXT[it.k] != null ? TEXT[it.k] : '');
        el.style.setProperty('--i', /foot/.test(it.cls) ? k + 1 : k++);
      } else if (it.t === 'photo') {
        el = document.createElement('div'); el.className = it.cls; el.style.cssText = it.style || '';
        el.style.setProperty('--i', k++); photo(el, it.slot, it.label);
      } else if (it.t === 'flame') {
        el = document.createElement('i'); el.className = 'flame'; el.style.cssText = it.style;
      } else if (it.t === 'hint') {
        el = document.createElement('div'); el.className = 'hint'; el.setAttribute('aria-hidden', 'true');
        var s = document.createElement('span'); s.textContent = 'Scroll'; el.appendChild(s); el.appendChild(document.createElement('i'));
      }
      if (el) inner.appendChild(el);
    });
    book.appendChild(sec);
  });

  checkFamily();
  var scenes = Array.prototype.slice.call(book.querySelectorAll('.scene'));
  if (reduce || !('IntersectionObserver' in window)) { scenes.forEach(function (s) { s.classList.add('in'); }); return; }
  document.documentElement.classList.add('armed');
  function startReveal() {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.3 });
    scenes.forEach(function (s) { io.observe(s); });
    requestAnimationFrame(function () { scenes[0] && scenes[0].classList.add('in'); });
  }
  // wait for the envelope to open so the first card animates in front of the guest
  if (document.getElementById('intro')) document.addEventListener('invitation-opened', startReveal, { once: true });
  else startReveal();

  var c = document.getElementById('dust'), g = c.getContext('2d'), dpr = Math.min(window.devicePixelRatio || 1, 2), P = [];
  function size() { c.width = innerWidth * dpr; c.height = innerHeight * dpr; }
  size(); addEventListener('resize', size);
  for (var i = 0; i < 46; i++) P.push({ x: Math.random(), y: Math.random(), v: .004 + Math.random() * .012, d: (Math.random() - .5) * .004,
    r: .6 + Math.random() * 1.6, p: Math.random() * 6.28, f: .6 + Math.random() * 1.4 });
  var last = performance.now();
  function tick(now) {
    var dt = Math.min((now - last) / 1000, .05); last = now;
    g.clearRect(0, 0, c.width, c.height);
    for (var i = 0; i < P.length; i++) {
      var q = P[i]; q.y -= q.v * dt; q.x += q.d * dt; if (q.y < -0.02) { q.y = 1.02; q.x = Math.random(); }
      var a = Math.pow(Math.max(0, Math.sin(now / 1000 * q.f + q.p)), 2);
      if (a < .03) continue;
      var x = q.x * c.width, y = q.y * c.height, rr = q.r * dpr;
      var grd = g.createRadialGradient(x, y, 0, x, y, rr * 6);
      grd.addColorStop(0, 'rgba(255,236,190,' + (.9 * a) + ')');
      grd.addColorStop(.25, 'rgba(230,185,110,' + (.35 * a) + ')');
      grd.addColorStop(1, 'rgba(200,150,80,0)');
      g.fillStyle = grd; g.beginPath(); g.arc(x, y, rr * 6, 0, 6.283); g.fill();
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();
