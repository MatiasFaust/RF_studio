var revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function(el){ io.observe(el); });
} else {
  revealEls.forEach(function(el){ el.classList.add('in'); });
}

var toggle = document.getElementById('nav-toggle');
document.querySelectorAll('.nav-links a').forEach(function(a){
  a.addEventListener('click', function(){ toggle.checked = false; });
});
