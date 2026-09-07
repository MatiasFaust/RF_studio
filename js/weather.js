(function(){
  var cards = document.querySelectorAll('.location-weather[data-weather]');
  if (!cards.length) return;

  var ICONS = {
    sun: '<circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="5"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="2" y1="12" x2="5" y2="12"/><line x1="19" y1="12" x2="22" y2="12"/><line x1="4.6" y1="4.6" x2="6.7" y2="6.7"/><line x1="17.3" y1="17.3" x2="19.4" y2="19.4"/><line x1="4.6" y1="19.4" x2="6.7" y2="17.3"/><line x1="17.3" y1="6.7" x2="19.4" y2="4.6"/>',
    cloud: '<path d="M7 18a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.6 1.6A3.5 3.5 0 0 1 17.5 18H7z"/>',
    rain: '<path d="M7 15a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.6 1.6A3.5 3.5 0 0 1 17.5 15H7z"/><line x1="9" y1="18" x2="8" y2="21"/><line x1="13" y1="18" x2="12" y2="21"/><line x1="17" y1="18" x2="16" y2="21"/>',
    fog: '<line x1="3" y1="9" x2="21" y2="9"/><line x1="5" y1="13" x2="21" y2="13"/><line x1="3" y1="17" x2="19" y2="17"/>',
    storm: '<path d="M7 13a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.6 1.6A3.5 3.5 0 0 1 17.5 13H7z"/><path d="M13 15 L10 20 L13 20 L11 24"/>',
    snow: '<path d="M7 13a4 4 0 0 1 .4-8 5.5 5.5 0 0 1 10.6 1.6A3.5 3.5 0 0 1 17.5 13H7z"/><line x1="9" y1="18" x2="9" y2="22"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="15" y1="18" x2="15" y2="22"/>'
  };

  var COND = {
    0:  { icon: 'sun',   es: 'Despejado',        en: 'Clear sky',        pt: 'Céu limpo' },
    1:  { icon: 'sun',   es: 'Mayormente claro',  en: 'Mostly clear',     pt: 'Predomínio de sol' },
    2:  { icon: 'cloud', es: 'Parcialmente nublado', en: 'Partly cloudy', pt: 'Parcialmente nublado' },
    3:  { icon: 'cloud', es: 'Nublado',           en: 'Overcast',         pt: 'Nublado' },
    45: { icon: 'fog',   es: 'Niebla',            en: 'Fog',              pt: 'Neblina' },
    48: { icon: 'fog',   es: 'Niebla',            en: 'Fog',              pt: 'Neblina' },
    51: { icon: 'rain',  es: 'Llovizna',          en: 'Drizzle',          pt: 'Garoa' },
    53: { icon: 'rain',  es: 'Llovizna',          en: 'Drizzle',          pt: 'Garoa' },
    55: { icon: 'rain',  es: 'Llovizna',          en: 'Drizzle',          pt: 'Garoa' },
    61: { icon: 'rain',  es: 'Lluvia',            en: 'Rain',             pt: 'Chuva' },
    63: { icon: 'rain',  es: 'Lluvia',            en: 'Rain',             pt: 'Chuva' },
    65: { icon: 'rain',  es: 'Lluvia fuerte',     en: 'Heavy rain',       pt: 'Chuva forte' },
    71: { icon: 'snow',  es: 'Nieve',             en: 'Snow',             pt: 'Neve' },
    73: { icon: 'snow',  es: 'Nieve',             en: 'Snow',             pt: 'Neve' },
    75: { icon: 'snow',  es: 'Nieve fuerte',      en: 'Heavy snow',       pt: 'Neve forte' },
    80: { icon: 'rain',  es: 'Chaparrones',       en: 'Rain showers',     pt: 'Pancadas de chuva' },
    81: { icon: 'rain',  es: 'Chaparrones',       en: 'Rain showers',     pt: 'Pancadas de chuva' },
    82: { icon: 'rain',  es: 'Chaparrones fuertes', en: 'Heavy showers',  pt: 'Pancadas fortes' },
    95: { icon: 'storm', es: 'Tormenta',          en: 'Thunderstorm',     pt: 'Tempestade' },
    96: { icon: 'storm', es: 'Tormenta con granizo', en: 'Storm with hail', pt: 'Tempestade com granizo' },
    99: { icon: 'storm', es: 'Tormenta con granizo', en: 'Storm with hail', pt: 'Tempestade com granizo' }
  };

  function currentLang(){
    return (window.RF_getLang && window.RF_getLang()) || 'es';
  }

  function render(card, code, temp){
    var lang = currentLang();
    var cond = COND[code] || COND[3];
    var icon = card.querySelector('.weather-icon');
    var tempEl = card.querySelector('.location-weather-temp');
    var condEl = card.querySelector('.location-weather-cond');
    icon.innerHTML = '<svg viewBox="0 0 24 24">' + ICONS[cond.icon] + '</svg>';
    tempEl.textContent = Math.round(temp) + '°';
    condEl.textContent = cond[lang] || cond.es;
    condEl.removeAttribute('data-i18n');
    card.dataset.code = code;
    card.dataset.temp = temp;
  }

  function renderError(card){
    var condEl = card.querySelector('.location-weather-cond');
    condEl.textContent = '—';
    condEl.removeAttribute('data-i18n');
  }

  cards.forEach(function(card){
    var lat = card.getAttribute('data-lat');
    var lng = card.getAttribute('data-lng');
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat + '&longitude=' + lng + '&current_weather=true&timezone=auto';
    fetch(url).then(function(res){ return res.json(); }).then(function(data){
      var w = data && data.current_weather;
      if (!w) { renderError(card); return; }
      render(card, w.weathercode, w.temperature);
    }).catch(function(){ renderError(card); });
  });

  window.addEventListener('rf:langchange', function(){
    cards.forEach(function(card){
      if (card.dataset.code === undefined) return;
      render(card, Number(card.dataset.code), Number(card.dataset.temp));
    });
  });
})();
