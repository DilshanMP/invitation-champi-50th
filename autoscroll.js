// Gentle auto-scroll: after the envelope opens, glide from card to card,
// pausing on each one. Any touch, wheel, key or drag hands control to the guest;
// auto-scroll picks up again after a few quiet seconds.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;
  var HOLD = 5500, GLIDE = 1900, FIRST_HOLD = 4500, RESUME_AFTER = 7000;
  var timer = null, anim = null, idx = 0, active = false, done = false;

  function cards() { return Array.prototype.slice.call(document.querySelectorAll('.scene')); }
  function targetY(el) {
    var r = el.getBoundingClientRect();
    var y = window.scrollY + r.top - Math.max(0, (window.innerHeight - r.height) / 2);
    return Math.max(0, Math.min(y, document.documentElement.scrollHeight - window.innerHeight));
  }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function glide(to, ms, cb) {
    var from = window.scrollY, t0 = performance.now();
    cancelAnimationFrame(anim);
    (function step(now) {
      if (!active) return;
      var k = Math.min(1, (now - t0) / ms);
      window.scrollTo(0, from + (to - from) * ease(k));
      if (k < 1) anim = requestAnimationFrame(step); else if (cb) cb();
    })(performance.now());
  }
  function next() {
    var list = cards();
    if (idx >= list.length - 1) { done = true; active = false; return; }
    idx += 1;
    glide(targetY(list[idx]), GLIDE, function () { timer = setTimeout(next, HOLD); });
  }
  function nearest() {
    var list = cards(), mid = window.innerHeight / 2, best = 0, bd = Infinity;
    list.forEach(function (c, i) { var r = c.getBoundingClientRect(); var d = Math.abs(r.top + r.height / 2 - mid); if (d < bd) { bd = d; best = i; } });
    return best;
  }
  function start(delay) {
    if (done) return;
    active = true;
    clearTimeout(timer);
    timer = setTimeout(next, delay);
  }
  var resumeTimer = null;
  function userTookOver() {
    if (!active && done) return;
    active = false;
    cancelAnimationFrame(anim); clearTimeout(timer); clearTimeout(resumeTimer);
    resumeTimer = setTimeout(function () { idx = nearest(); done = idx >= cards().length - 1; start(1500); }, RESUME_AFTER);
  }
  ['touchstart', 'wheel', 'keydown', 'mousedown'].forEach(function (ev) {
    window.addEventListener(ev, function (e) {
      if (e.target && e.target.closest && e.target.closest('#music')) return; // music button doesn't stop the tour
      userTookOver();
    }, { passive: true });
  });
  document.addEventListener('invitation-opened', function () { idx = 0; start(FIRST_HOLD); }, { once: true });
})();
