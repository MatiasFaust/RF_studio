(function(){
  var LANGS = ['es', 'en', 'pt'];

  function getLang(){
    try {
      var stored = localStorage.getItem('rf-lang');
      if (stored && LANGS.indexOf(stored) !== -1) return stored;
    } catch (e) {}
    return 'es';
  }

  function applyLang(lang){
    var dict = window.I18N && window.I18N[lang];
    if (!dict) return;

    document.documentElement.setAttribute('lang', lang);

    document.querySelectorAll('[data-i18n]').forEach(function(el){
      var key = el.getAttribute('data-i18n');
      if (dict[key] !== undefined) el.innerHTML = dict[key];
    });

    document.querySelectorAll('.lang-btn').forEach(function(btn){
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    window.dispatchEvent(new CustomEvent('rf:langchange', { detail: { lang: lang } }));
  }

  function setLang(lang){
    try { localStorage.setItem('rf-lang', lang); } catch (e) {}
    applyLang(lang);
  }

  document.querySelectorAll('.lang-btn').forEach(function(btn){
    btn.addEventListener('click', function(){
      setLang(btn.getAttribute('data-lang'));
    });
  });

  window.RF_getLang = getLang;
  applyLang(getLang());
})();
