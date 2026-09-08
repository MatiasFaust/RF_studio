(function(){
  var widgets = document.querySelectorAll('.availability-calendar[data-house-id]');
  if (!widgets.length) return;
  if (!window.supabase || !window.SUPABASE_URL || !window.SUPABASE_ANON_KEY || window.SUPABASE_URL.indexOf('PEGA_ACA') === 0) {
    widgets.forEach(function(el){
      el.innerHTML = '<p class="avail-unconfigured">Calendario en configuración.</p>';
    });
    return;
  }

  var client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  var U = window.CalendarUtils;

  var LABELS = {
    es: { free: 'Libre', booked: 'Ocupado', prev: 'Mes anterior', next: 'Mes siguiente' },
    en: { free: 'Free', booked: 'Booked', prev: 'Previous month', next: 'Next month' },
    pt: { free: 'Livre', booked: 'Ocupado', prev: 'Mês anterior', next: 'Próximo mês' }
  };

  widgets.forEach(function(el){
    var houseId = el.getAttribute('data-house-id');
    var view = new Date();
    view.setDate(1);
    var bookings = [];

    function lang(){ return (window.RF_getLang && window.RF_getLang()) || 'es'; }
    function t(){ return LABELS[lang()] || LABELS.es; }

    function isBooked(day){
      return bookings.some(function(b){
        return U.inRangeExclusiveEnd(day, U.fromISO(b.check_in), U.fromISO(b.check_out));
      });
    }

    function render(){
      var L = t();
      var year = view.getFullYear(), month = view.getMonth();
      var first = new Date(year, month, 1);
      var startWeekday = first.getDay();
      var daysInMonth = new Date(year, month + 1, 0).getDate();
      var today = U.startOfDay(new Date());

      var html = '';
      html += '<div class="avail-head">';
      html += '<button type="button" class="avail-nav" data-dir="-1" aria-label="' + L.prev + '">&#8249;</button>';
      html += '<span class="avail-month">' + U.monthLabel(year, month, lang()) + '</span>';
      html += '<button type="button" class="avail-nav" data-dir="1" aria-label="' + L.next + '">&#8250;</button>';
      html += '</div>';
      html += '<div class="avail-grid avail-dow">';
      U.dayNames(lang()).forEach(function(d){ html += '<span>' + d + '</span>'; });
      html += '</div>';
      html += '<div class="avail-grid avail-days">';
      for (var i = 0; i < startWeekday; i++) html += '<span class="avail-day empty"></span>';
      for (var d = 1; d <= daysInMonth; d++) {
        var date = new Date(year, month, d);
        var cls = 'avail-day';
        if (U.isBefore(date, today)) cls += ' past';
        else if (isBooked(date)) cls += ' booked';
        else cls += ' free';
        html += '<span class="' + cls + '">' + d + '</span>';
      }
      html += '</div>';
      html += '<div class="avail-legend"><span><i class="dot free"></i>' + L.free + '</span><span><i class="dot booked"></i>' + L.booked + '</span></div>';

      el.innerHTML = html;
      el.querySelectorAll('.avail-nav').forEach(function(btn){
        btn.addEventListener('click', function(){
          view.setMonth(view.getMonth() + Number(btn.getAttribute('data-dir')));
          render();
        });
      });
    }

    function load(){
      client.from('bookings').select('check_in, check_out').eq('house_id', houseId)
        .then(function(res){
          bookings = (res && res.data) || [];
          render();
        });
    }

    load();

    client
      .channel('public-bookings-' + houseId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: 'house_id=eq.' + houseId }, function(){
        load();
      })
      .subscribe();

    window.addEventListener('rf:langchange', render);
  });
})();
