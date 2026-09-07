(function(){
  var heroSection = document.getElementById('inicio');
  var svg = document.querySelector('.hero-figure svg');
  if (!heroSection || !svg) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var staged = Array.prototype.slice.call(svg.querySelectorAll('.plan-line')).map(function(el){
    var stage = el.classList.contains('delay2') ? 2 : el.classList.contains('delay') ? 1 : 0;
    var length = el.getTotalLength();
    el.style.strokeDasharray = length;
    el.style.strokeDashoffset = reduceMotion ? 0 : length;
    return { el: el, length: length, stage: stage };
  });

  if (reduceMotion || !staged.length) return;

  var BASELINE = 0.4;
  var STAGE_WINDOWS = [ [0, 0.5], [0.25, 0.75], [0.5, 1] ];

  function update(){
    var rect = heroSection.getBoundingClientRect();
    var heroHeight = heroSection.offsetHeight || 1;
    var scrolled = -rect.top;
    var progress = Math.max(BASELINE, Math.min(1, scrolled / heroHeight));

    staged.forEach(function(item){
      var win = STAGE_WINDOWS[item.stage];
      var local = (progress - win[0]) / (win[1] - win[0]);
      local = Math.max(0, Math.min(1, local));
      item.el.style.strokeDashoffset = item.length * (1 - local);
    });
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ update(); ticking = false; });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();
