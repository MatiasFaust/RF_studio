(function(){
  if (typeof L === 'undefined') return;

  var COLORS = {
    ocupada: '#9a9184',
    construccion: '#c98a3f',
    dia: '#b1573a'
  };

  var locations = [
    { region: 'elpinar', status: 'ocupada', photo: 'assets/casas/el-pinar-1.jpg', lat: -34.7809171, lng: -55.9187019,
      name: { es: 'Casa 1 — El Pinar', en: 'House 1 — El Pinar', pt: 'Casa 1 — El Pinar' },
      sub: { es: 'No disponible actualmente', en: 'Not available right now', pt: 'Não disponível no momento' } },
    { region: 'elpinar', status: 'ocupada', photo: 'assets/casas/el-pinar-2.jpg', lat: -34.7811597, lng: -55.9180079,
      name: { es: 'Casa 2 — El Pinar', en: 'House 2 — El Pinar', pt: 'Casa 2 — El Pinar' },
      sub: { es: 'No disponible actualmente', en: 'Not available right now', pt: 'Não disponível no momento' } },

    { region: 'termas', status: 'dia', photo: 'assets/casas/guaviyu.jpg', lat: -31.8367677, lng: -57.8918348,
      name: { es: 'Casa Guaviyú', en: 'Guaviyú House', pt: 'Casa Guaviyú' },
      sub: { es: 'Alquiler por día — dividida en 2 unidades', en: 'Daily rental — split into 2 units', pt: 'Aluguel por dia — dividida em 2 unidades' } },
    { region: 'termas', status: 'dia', photo: 'assets/casas/anacahuita.jpg', lat: -31.8369637, lng: -57.8906291,
      name: { es: 'Casa Anacahuita', en: 'Anacahuita House', pt: 'Casa Anacahuita' },
      sub: { es: 'Alquiler por día — dividida en 2 unidades', en: 'Daily rental — split into 2 units', pt: 'Aluguel por dia — dividida em 2 unidades' } },

    { region: 'paysandu', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-1.jpg', lat: -32.3299228, lng: -58.0926907,
      name: { es: 'Casa ocupada — Paysandú', en: 'Occupied house — Paysandú', pt: 'Casa ocupada — Paysandú' },
      sub: { es: 'No disponible actualmente', en: 'Not available right now', pt: 'Não disponível no momento' } },
    { region: 'paysandu', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-2.jpg', lat: -32.3295268, lng: -58.0829070,
      name: { es: 'Casa ocupada — Paysandú', en: 'Occupied house — Paysandú', pt: 'Casa ocupada — Paysandú' },
      sub: { es: 'No disponible actualmente', en: 'Not available right now', pt: 'Não disponível no momento' } },
    { region: 'paysandu', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-3.jpg', lat: -32.3080127, lng: -58.0594812,
      name: { es: 'Casa ocupada — Paysandú', en: 'Occupied house — Paysandú', pt: 'Casa ocupada — Paysandú' },
      sub: { es: 'No disponible actualmente', en: 'Not available right now', pt: 'Não disponível no momento' } },
    { region: 'paysandu', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-4.jpg', lat: -32.3162417, lng: -58.0633654,
      name: { es: 'Casa ocupada — Paysandú', en: 'Occupied house — Paysandú', pt: 'Casa ocupada — Paysandú' },
      sub: { es: 'No disponible actualmente', en: 'Not available right now', pt: 'Não disponível no momento' } },
    { region: 'paysandu', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-5.jpg', lat: -32.32478, lng: -58.07464,
      name: { es: 'Casa ocupada — Paysandú', en: 'Occupied house — Paysandú', pt: 'Casa ocupada — Paysandú' },
      sub: { es: 'No disponible actualmente', en: 'Not available right now', pt: 'Não disponível no momento' } },
    { region: 'paysandu', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-6.jpg', lat: -32.32106, lng: -58.09428,
      name: { es: 'Casa ocupada — Paysandú', en: 'Occupied house — Paysandú', pt: 'Casa ocupada — Paysandú' },
      sub: { es: 'No disponible actualmente', en: 'Not available right now', pt: 'Não disponível no momento' } },
    { region: 'paysandu', status: 'construccion', photo: 'assets/casas/paysandu-construccion.jpg', lat: -32.3240322, lng: -58.0676231,
      name: { es: 'En construcción — Paysandú', en: 'Under construction — Paysandú', pt: 'Em construção — Paysandú' },
      sub: { es: '3 casas — próximas a entregar', en: '3 houses — coming soon', pt: '3 casas — entrega em breve' } }
  ];

  function currentLang(){
    return (window.RF_getLang && window.RF_getLang()) || 'es';
  }

  function pinIcon(color){
    return L.divIcon({
      className: 'rfm-pin',
      html: '<span style="background:' + color + '"></span>',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      popupAnchor: [0, -10]
    });
  }

  function buildPopup(loc){
    var lang = currentLang();
    var wrap = document.createElement('div');
    wrap.className = 'pin-popup';

    var img = document.createElement('img');
    img.src = loc.photo;
    img.alt = loc.name[lang] || loc.name.es;
    img.onerror = function(){
      var placeholder = document.createElement('div');
      placeholder.className = 'pin-photo-empty';
      placeholder.textContent = 'Foto próximamente';
      img.replaceWith(placeholder);
    };
    wrap.appendChild(img);

    var title = document.createElement('strong');
    title.textContent = loc.name[lang] || loc.name.es;
    wrap.appendChild(title);

    wrap.appendChild(document.createElement('br'));
    wrap.appendChild(document.createTextNode(loc.sub[lang] || loc.sub.es));

    return wrap;
  }

  var markers = [];

  function refreshPopups(){
    markers.forEach(function(entry){
      entry.marker.setPopupContent(buildPopup(entry.loc));
    });
  }

  function initRegionMap(elId, region){
    var el = document.getElementById(elId);
    if (!el) return;

    var points = locations.filter(function(loc){ return loc.region === region; });
    if (!points.length) return;

    var map = L.map(el, { scrollWheelZoom: false }).setView([points[0].lat, points[0].lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18
    }).addTo(map);

    var bounds = [];
    points.forEach(function(loc){
      var marker = L.marker([loc.lat, loc.lng], { icon: pinIcon(COLORS[loc.status]) })
        .addTo(map)
        .bindPopup(buildPopup(loc));
      markers.push({ marker: marker, loc: loc });
      bounds.push([loc.lat, loc.lng]);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }

  initRegionMap('map-paysandu', 'paysandu');
  initRegionMap('map-termas', 'termas');
  initRegionMap('map-elpinar', 'elpinar');

  window.addEventListener('rf:langchange', refreshPopups);
})();
