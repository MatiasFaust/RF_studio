// Lógica centralizada de WhatsApp para todo el sitio.
//
// Cómo agregar o cambiar un número:
// - ARQ / DESARROLLO: cambiá las constantes de acá abajo.
// - TERMAS: cada propiedad tiene su propio campo "whatsapp" en RFM_PROPERTIES.
//   Para agregar una casa nueva (o darle un administrador distinto a una
//   existente), solo hay que sumar/editar una entrada en ese objeto — no
//   hace falta tocar el HTML ni repetir lógica.
//
// Cómo usarlo desde el HTML, sin escribir el link a mano:
//   <a href="#" data-wa-tipo="ARQ">...</a>
//   <a href="#" data-wa-tipo="TERMAS" data-wa-house="guaviyu-1">...</a>
// Este script completa el href real al cargar la página.
//
// Cómo usarlo desde JS:
//   abrirWhatsApp('ARQ')
//   abrirWhatsApp('DESARROLLO')
//   abrirWhatsApp('TERMAS', 'guaviyu-1')

window.RFM_WHATSAPP = (function(){
  // Números que ya existían en el sitio (mismo número usado hasta ahora
  // para el estudio y para RFM/Desarrollo).
  var whatsappArq = '59898357587';
  var whatsappDesarrollo = '59898357587';

  // TODO: reemplazar por el número real de WhatsApp de la administrativa
  // que gestiona las casas de Las Termas.
  var whatsappTermas = '598XXXXXXXX';

  var MESSAGES = {
    ARQ: '[ARQ] Hola, vengo desde la página de RF Estudio de Arquitectura y quisiera realizar una consulta.',
    DESARROLLO: '[DESARROLLO] Hola, vengo desde la página de RF Desarrollo y quisiera realizar una consulta.'
  };

  // Una entrada por propiedad de Termas. Los ids coinciden con los que ya
  // usa el sistema de reservas (js/admin.js, js/availability.js), así no
  // hay que mantener dos listas de casas por separado.
  var RFM_PROPERTIES = {
    'guaviyu-1':    { nombre: 'Guaviyú — Unidad 1',    ubicacion: 'Termas', whatsapp: whatsappTermas },
    'guaviyu-2':    { nombre: 'Guaviyú — Unidad 2',    ubicacion: 'Termas', whatsapp: whatsappTermas },
    'anacahuita-1': { nombre: 'Anacahuita — Unidad 1', ubicacion: 'Termas', whatsapp: whatsappTermas },
    'anacahuita-2': { nombre: 'Anacahuita — Unidad 2', ubicacion: 'Termas', whatsapp: whatsappTermas }
  };

  function buildUrl(numero, mensaje){
    return 'https://wa.me/' + numero + '?text=' + encodeURIComponent(mensaje);
  }

  // tipo: 'ARQ' | 'DESARROLLO' | 'TERMAS'
  // propiedad (solo para TERMAS): el id ('guaviyu-1', ...) o el objeto de RFM_PROPERTIES
  function getWhatsAppUrl(tipo, propiedad){
    if (tipo === 'TERMAS') {
      var prop = typeof propiedad === 'string' ? RFM_PROPERTIES[propiedad] : propiedad;
      if (!prop || !prop.whatsapp) return null;
      var mensaje = '[TERMAS][' + prop.nombre + ']\n\nHola, estoy interesado en ' + prop.nombre + '. Quisiera consultar disponibilidad, precio y realizar una reserva.';
      return buildUrl(prop.whatsapp, mensaje);
    }

    var numero = tipo === 'ARQ' ? whatsappArq : whatsappDesarrollo;
    var mensaje = MESSAGES[tipo];
    if (!numero || !mensaje) return null;
    return buildUrl(numero, mensaje);
  }

  function abrirWhatsApp(tipo, propiedad){
    var url = getWhatsAppUrl(tipo, propiedad);
    if (!url) return;
    window.open(url, '_blank', 'noopener');
  }

  // Completa automáticamente el href de cualquier link marcado con
  // data-wa-tipo (y data-wa-house para TERMAS), sin repetir el link a mano.
  function wireLinks(){
    document.querySelectorAll('[data-wa-tipo]').forEach(function(el){
      var tipo = el.getAttribute('data-wa-tipo');
      var houseId = el.getAttribute('data-wa-house');
      var url = getWhatsAppUrl(tipo, houseId || undefined);
      if (url) el.setAttribute('href', url);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireLinks);
  } else {
    wireLinks();
  }

  return {
    abrirWhatsApp: abrirWhatsApp,
    getWhatsAppUrl: getWhatsAppUrl,
    properties: RFM_PROPERTIES
  };
})();

window.abrirWhatsApp = window.RFM_WHATSAPP.abrirWhatsApp;
