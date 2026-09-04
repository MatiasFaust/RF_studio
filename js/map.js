(function(){
  if (typeof L === 'undefined') return;

  var COLORS = {
    ocupada: '#9a9184',
    construccion: '#c98a3f',
    dia: '#b1573a'
  };

  var locations = [
    { region: 'elpinar', name: 'Casa 1 — El Pinar', sub: 'No disponible actualmente', status: 'ocupada', photo: 'assets/casas/el-pinar-1.jpg', lat: -34.7809171, lng: -55.9187019 },
    { region: 'elpinar', name: 'Casa 2 — El Pinar', sub: 'No disponible actualmente', status: 'ocupada', photo: 'assets/casas/el-pinar-2.jpg', lat: -34.7811597, lng: -55.9180079 },

    { region: 'termas', name: 'Casa Guaviyú', sub: 'Alquiler por día — dividida en 2 unidades', status: 'dia', photo: 'assets/casas/guaviyu.jpg', lat: -31.8367677, lng: -57.8918348 },
    { region: 'termas', name: 'Casa Anacahuita', sub: 'Alquiler por día — dividida en 2 unidades', status: 'dia', photo: 'assets/casas/anacahuita.jpg', lat: -31.8369637, lng: -57.8906291 },

    { region: 'paysandu', name: 'Casa ocupada — Paysandú', sub: 'No disponible actualmente', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-1.jpg', lat: -32.3299228, lng: -58.0926907 },
    { region: 'paysandu', name: 'Casa ocupada — Paysandú', sub: 'No disponible actualmente', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-2.jpg', lat: -32.3295268, lng: -58.0829070 },
    { region: 'paysandu', name: 'Casa ocupada — Paysandú', sub: 'No disponible actualmente', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-3.jpg', lat: -32.3080127, lng: -58.0594812 },
    { region: 'paysandu', name: 'Casa ocupada — Paysandú', sub: 'No disponible actualmente', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-4.jpg', lat: -32.3162417, lng: -58.0633654 },
    { region: 'paysandu', name: 'Casa ocupada — Paysandú', sub: 'No disponible actualmente', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-5.jpg', lat: -32.32478, lng: -58.07464 },
    { region: 'paysandu', name: 'Casa ocupada — Paysandú', sub: 'No disponible actualmente', status: 'ocupada', photo: 'assets/casas/paysandu-ocupada-6.jpg', lat: -32.32106, lng: -58.09428 },
    { region: 'paysandu', name: 'En construcción — Paysandú', sub: '3 casas — próximas a entregar', status: 'construccion', photo: 'assets/casas/paysandu-construccion.jpg', lat: -32.3240322, lng: -58.0676231 }
  ];

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
    var wrap = document.createElement('div');
    wrap.className = 'pin-popup';

    var img = document.createElement('img');
    img.src = loc.photo;
    img.alt = loc.name;
    img.onerror = function(){
      var placeholder = document.createElement('div');
      placeholder.className = 'pin-photo-empty';
      placeholder.textContent = 'Foto próximamente';
      img.replaceWith(placeholder);
    };
    wrap.appendChild(img);

    var title = document.createElement('strong');
    title.textContent = loc.name;
    wrap.appendChild(title);

    wrap.appendChild(document.createElement('br'));
    wrap.appendChild(document.createTextNode(loc.sub));

    return wrap;
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
      L.marker([loc.lat, loc.lng], { icon: pinIcon(COLORS[loc.status]) })
        .addTo(map)
        .bindPopup(buildPopup(loc));
      bounds.push([loc.lat, loc.lng]);
    });

    if (bounds.length > 1) {
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 15 });
    }
  }

  initRegionMap('map-paysandu', 'paysandu');
  initRegionMap('map-termas', 'termas');
  initRegionMap('map-elpinar', 'elpinar');
})();
