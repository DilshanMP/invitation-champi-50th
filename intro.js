(function () {
  var intro = document.getElementById('intro');
  var env = document.getElementById('env');
  var btn = document.getElementById('music');
  var audio = document.getElementById('bgm');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fadeTimer = null;

  function fadeTo(target, ms, done) {
    clearInterval(fadeTimer);
    var start = audio.volume, t0 = Date.now();
    fadeTimer = setInterval(function () {
      var k = Math.min(1, (Date.now() - t0) / ms);
      audio.volume = Math.max(0, Math.min(1, start + (target - start) * k));
      if (k >= 1) { clearInterval(fadeTimer); if (done) done(); }
    }, 50);
  }
  function play() {
    audio.volume = 0;
    var p = audio.play();
    if (p && p.then) p.then(function () { btn.classList.add('on'); btn.setAttribute('aria-pressed', 'true'); fadeTo(0.55, 2500); })
      .catch(function () { btn.classList.remove('on'); btn.setAttribute('aria-pressed', 'false'); });
    else { btn.classList.add('on'); fadeTo(0.55, 2500); }
  }
  function pause() {
    btn.classList.remove('on'); btn.setAttribute('aria-pressed', 'false');
    fadeTo(0, 500, function () { audio.pause(); });
  }

  btn.addEventListener('click', function () { if (audio.paused || !btn.classList.contains('on')) play(); else pause(); });

  function open() {
    if (intro.classList.contains('opening')) return;
    intro.classList.add('opening');
    play(); // the tap that opens the envelope also starts the music
    setTimeout(function () {
      intro.classList.add('gone');
      document.documentElement.classList.remove('locked');
      btn.hidden = false;
      window.scrollTo(0, 0);
      document.dispatchEvent(new Event('invitation-opened'));
    }, reduce ? 200 : 2700);
  }
  env.addEventListener('click', open);
  document.documentElement.classList.add('locked');
  env.focus({ preventScroll: true });
})();
