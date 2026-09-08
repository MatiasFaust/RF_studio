window.CalendarUtils = (function(){
  function pad(n){ return String(n).padStart(2, '0'); }
  function toISO(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
  function fromISO(s){
    var p = String(s).split('-');
    return new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
  }
  function startOfDay(d){ var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function isBefore(a, b){ return startOfDay(a).getTime() < startOfDay(b).getTime(); }

  // day is considered "in" the stay from check-in (inclusive) to check-out (exclusive) —
  // so the check-out day itself is free for a new booking to start.
  function inRangeExclusiveEnd(day, checkIn, checkOut){
    var d = startOfDay(day).getTime();
    return d >= startOfDay(checkIn).getTime() && d < startOfDay(checkOut).getTime();
  }

  function rangesOverlap(aStart, aEnd, bStart, bEnd){
    return startOfDay(aStart).getTime() < startOfDay(bEnd).getTime() &&
           startOfDay(bStart).getTime() < startOfDay(aEnd).getTime();
  }

  var MONTH_NAMES = {
    es: ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'],
    en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
    pt: ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro']
  };
  var DAY_NAMES = {
    es: ['D','L','M','M','J','V','S'],
    en: ['S','M','T','W','T','F','S'],
    pt: ['D','S','T','Q','Q','S','S']
  };

  function monthLabel(year, month, lang){
    var names = MONTH_NAMES[lang] || MONTH_NAMES.es;
    return names[month] + ' ' + year;
  }
  function dayNames(lang){ return DAY_NAMES[lang] || DAY_NAMES.es; }

  return {
    pad: pad,
    toISO: toISO,
    fromISO: fromISO,
    startOfDay: startOfDay,
    isBefore: isBefore,
    inRangeExclusiveEnd: inRangeExclusiveEnd,
    rangesOverlap: rangesOverlap,
    monthLabel: monthLabel,
    dayNames: dayNames
  };
})();
