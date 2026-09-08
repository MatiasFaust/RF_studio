(function(){
  var loginView = document.getElementById('admin-login');
  var panelView = document.getElementById('admin-panel');

  if (!window.SUPABASE_URL || window.SUPABASE_URL.indexOf('PEGA_ACA') === 0) {
    loginView.innerHTML = '<div class="admin-login-card"><div class="admin-login-head"><div class="chat-avatar">RF</div><div><h1>RFM</h1><p>Panel de administración</p></div></div><p class="admin-error">Falta configurar <code>js/supabase-config.js</code> con los datos de tu proyecto Supabase.</p></div>';
    return;
  }
  if (!window.supabase) {
    loginView.innerHTML = '<div class="admin-login-card"><p class="admin-error">No se pudo cargar la librería de Supabase. Revisá tu conexión a internet.</p></div>';
    return;
  }

  var client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
  var U = window.CalendarUtils;

  var HOUSES = [
    { id: 'guaviyu-1', name: 'Guaviyú — Unidad 1' },
    { id: 'guaviyu-2', name: 'Guaviyú — Unidad 2' },
    { id: 'anacahuita-1', name: 'Anacahuita — Unidad 1' },
    { id: 'anacahuita-2', name: 'Anacahuita — Unidad 2' }
  ];

  var loginForm = document.getElementById('login-form');
  var loginEmail = document.getElementById('login-email');
  var loginPassword = document.getElementById('login-password');
  var loginError = document.getElementById('login-error');
  var logoutBtn = document.getElementById('logout-btn');
  var adminUser = document.getElementById('admin-user');

  var houseSelect = document.getElementById('house-select');
  var checkInInput = document.getElementById('check-in');
  var checkOutInput = document.getElementById('check-out');
  var statusSelect = document.getElementById('status-select');
  var noteInput = document.getElementById('guest-note');
  var saveBtn = document.getElementById('save-booking');
  var cancelEditBtn = document.getElementById('cancel-edit');
  var formTitle = document.getElementById('form-title');
  var formMessage = document.getElementById('form-message');

  var calendarEl = document.getElementById('admin-calendar');
  var calendarHouseName = document.getElementById('calendar-house-name');
  var tbody = document.getElementById('bookings-tbody');

  var confirmModal = document.getElementById('confirm-modal');
  var confirmOk = document.getElementById('confirm-ok');
  var confirmCancel = document.getElementById('confirm-cancel');

  var toastEl = document.getElementById('toast');

  var calendarView = new Date();
  calendarView.setDate(1);
  var allBookings = [];
  var editingId = null;
  var pendingDeleteId = null;
  var initialized = false;

  function toast(msg, kind){
    toastEl.textContent = msg;
    toastEl.className = 'admin-toast show' + (kind ? ' ' + kind : '');
    toastEl.hidden = false;
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function(){ toastEl.hidden = true; }, 3500);
  }

  function showFormMessage(text, kind){
    formMessage.textContent = text;
    formMessage.className = 'admin-message ' + kind;
    formMessage.hidden = false;
  }

  function houseName(id){
    var found = null;
    HOUSES.forEach(function(h){ if (h.id === id) found = h; });
    return found ? found.name : id;
  }

  // ---------- Auth ----------
  function showLoginView(){
    loginView.hidden = false;
    panelView.hidden = true;
  }

  function showPanelView(session){
    loginView.hidden = true;
    panelView.hidden = false;
    adminUser.textContent = session.user.email;
    if (!initialized) {
      initialized = true;
      init();
    } else {
      loadBookings();
    }
  }

  client.auth.getSession().then(function(res){
    var session = res && res.data && res.data.session;
    if (session) showPanelView(session); else showLoginView();
  });

  client.auth.onAuthStateChange(function(_event, session){
    if (session) showPanelView(session); else showLoginView();
  });

  loginForm.addEventListener('submit', function(e){
    e.preventDefault();
    loginError.hidden = true;
    client.auth.signInWithPassword({
      email: loginEmail.value.trim(),
      password: loginPassword.value
    }).then(function(res){
      if (res.error) {
        loginError.textContent = 'Usuario o contraseña incorrectos.';
        loginError.hidden = false;
      } else {
        loginPassword.value = '';
      }
    });
  });

  logoutBtn.addEventListener('click', function(){
    client.auth.signOut();
  });

  // ---------- Init ----------
  function init(){
    houseSelect.innerHTML = HOUSES.map(function(h){
      return '<option value="' + h.id + '">' + h.name + '</option>';
    }).join('');
    houseSelect.addEventListener('change', renderCalendar);
    checkInInput.min = U.toISO(new Date());
    checkInInput.addEventListener('change', function(){
      checkOutInput.min = checkInInput.value;
    });

    saveBtn.addEventListener('click', saveBooking);
    cancelEditBtn.addEventListener('click', resetForm);

    client
      .channel('admin-bookings')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, function(){
        loadBookings();
      })
      .subscribe();

    loadBookings();
  }

  function loadBookings(){
    client.from('bookings').select('*').order('check_in', { ascending: true }).then(function(res){
      if (res.error) { toast('No se pudieron cargar las reservas.', 'error'); return; }
      allBookings = res.data || [];
      renderCalendar();
      renderTable();
    });
  }

  // ---------- Form: create / update ----------
  function saveBooking(){
    formMessage.hidden = true;
    var houseId = houseSelect.value;
    var checkIn = checkInInput.value;
    var checkOut = checkOutInput.value;
    var status = statusSelect.value;
    var note = noteInput.value.trim();

    if (!checkIn || !checkOut) {
      showFormMessage('Elegí fecha de entrada y de salida.', 'error');
      return;
    }
    if (checkOut <= checkIn) {
      showFormMessage('La fecha de salida debe ser posterior a la de entrada.', 'error');
      return;
    }

    var overlap = allBookings.some(function(b){
      if (editingId && b.id === editingId) return false;
      return b.house_id === houseId &&
        U.rangesOverlap(U.fromISO(checkIn), U.fromISO(checkOut), U.fromISO(b.check_in), U.fromISO(b.check_out));
    });
    if (overlap) {
      showFormMessage('Estas fechas ya están ocupadas.', 'error');
      return;
    }

    var payload = { house_id: houseId, check_in: checkIn, check_out: checkOut, status: status, guest_note: note || null };
    var request = editingId
      ? client.from('bookings').update(payload).eq('id', editingId)
      : client.from('bookings').insert(payload);

    saveBtn.disabled = true;
    request.then(function(res){
      saveBtn.disabled = false;
      if (res.error) {
        if (String(res.error.message || '').indexOf('no_overlapping_bookings') !== -1) {
          showFormMessage('Estas fechas ya están ocupadas.', 'error');
        } else {
          showFormMessage('No se pudo guardar: ' + res.error.message, 'error');
        }
        return;
      }
      showFormMessage(editingId ? 'Reserva actualizada correctamente.' : 'Reserva registrada correctamente.', 'success');
      resetForm();
      loadBookings();
    });
  }

  function resetForm(){
    editingId = null;
    checkInInput.value = '';
    checkOutInput.value = '';
    checkOutInput.min = '';
    noteInput.value = '';
    statusSelect.value = 'reservado';
    formTitle.textContent = 'Nueva reserva / bloqueo';
    saveBtn.textContent = 'Guardar';
    cancelEditBtn.hidden = true;
  }

  function startEdit(b){
    editingId = b.id;
    houseSelect.value = b.house_id;
    checkInInput.value = b.check_in;
    checkOutInput.value = b.check_out;
    checkOutInput.min = b.check_in;
    statusSelect.value = b.status;
    noteInput.value = b.guest_note || '';
    formTitle.textContent = 'Editar reserva';
    saveBtn.textContent = 'Guardar cambios';
    cancelEditBtn.hidden = false;
    formMessage.hidden = true;
    renderCalendar();
    document.getElementById('form-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ---------- Calendar ----------
  function renderCalendar(){
    var houseId = houseSelect.value;
    calendarHouseName.textContent = houseName(houseId);
    var bookings = allBookings.filter(function(b){ return b.house_id === houseId; });

    var year = calendarView.getFullYear(), month = calendarView.getMonth();
    var first = new Date(year, month, 1);
    var startWeekday = first.getDay();
    var daysInMonth = new Date(year, month + 1, 0).getDate();
    var today = U.startOfDay(new Date());

    var html = '';
    html += '<div class="avail-head">';
    html += '<button type="button" class="avail-nav" data-dir="-1" aria-label="Mes anterior">&#8249;</button>';
    html += '<span class="avail-month">' + U.monthLabel(year, month, 'es') + '</span>';
    html += '<button type="button" class="avail-nav" data-dir="1" aria-label="Mes siguiente">&#8250;</button>';
    html += '</div>';
    html += '<div class="avail-grid avail-dow">';
    U.dayNames('es').forEach(function(d){ html += '<span>' + d + '</span>'; });
    html += '</div>';
    html += '<div class="avail-grid avail-days">';
    for (var i = 0; i < startWeekday; i++) html += '<span class="avail-day empty"></span>';
    for (var d = 1; d <= daysInMonth; d++) {
      var date = new Date(year, month, d);
      var booking = null;
      bookings.forEach(function(b){
        if (U.inRangeExclusiveEnd(date, U.fromISO(b.check_in), U.fromISO(b.check_out))) booking = b;
      });
      var cls = 'avail-day';
      var title = '';
      if (U.isBefore(date, today)) {
        cls += ' past';
      } else if (booking) {
        cls += booking.status === 'bloqueado' ? ' blocked' : ' booked';
        title = booking.guest_note || (booking.status === 'bloqueado' ? 'No disponible' : 'Alquilado');
      } else {
        cls += ' free';
      }
      html += '<span class="' + cls + '" title="' + title.replace(/"/g, '&quot;') + '">' + d + '</span>';
    }
    html += '</div>';
    html += '<div class="avail-legend"><span><i class="dot free"></i>Libre</span><span><i class="dot booked"></i>Alquilado / no disponible</span></div>';

    calendarEl.innerHTML = html;
    calendarEl.querySelectorAll('.avail-nav').forEach(function(btn){
      btn.addEventListener('click', function(){
        calendarView.setMonth(calendarView.getMonth() + Number(btn.getAttribute('data-dir')));
        renderCalendar();
      });
    });
  }

  // ---------- Table ----------
  function renderTable(){
    tbody.innerHTML = '';
    allBookings.forEach(function(b){
      var tr = document.createElement('tr');

      var tdHouse = document.createElement('td'); tdHouse.textContent = houseName(b.house_id);
      var tdIn = document.createElement('td'); tdIn.textContent = b.check_in;
      var tdOut = document.createElement('td'); tdOut.textContent = b.check_out;
      var tdStatus = document.createElement('td');
      var badge = document.createElement('span');
      badge.className = 'admin-badge ' + (b.status === 'bloqueado' ? 'admin-badge-blocked' : 'admin-badge-rented');
      badge.textContent = b.status === 'bloqueado' ? 'No disponible' : 'Alquilado';
      tdStatus.appendChild(badge);
      var tdNote = document.createElement('td'); tdNote.textContent = b.guest_note || '';

      var tdActions = document.createElement('td');
      tdActions.className = 'admin-table-actions';

      var editBtn = document.createElement('button');
      editBtn.type = 'button'; editBtn.className = 'btn-ghost'; editBtn.textContent = 'Editar';
      editBtn.addEventListener('click', function(){ startEdit(b); });

      var delBtn = document.createElement('button');
      delBtn.type = 'button'; delBtn.className = 'btn-ghost admin-danger'; delBtn.textContent = 'Eliminar';
      delBtn.addEventListener('click', function(){ askDelete(b.id); });

      tdActions.appendChild(editBtn);
      tdActions.appendChild(delBtn);

      tr.appendChild(tdHouse); tr.appendChild(tdIn); tr.appendChild(tdOut);
      tr.appendChild(tdStatus); tr.appendChild(tdNote); tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
  }

  // ---------- Delete ----------
  function askDelete(id){
    pendingDeleteId = id;
    confirmModal.hidden = false;
  }
  confirmCancel.addEventListener('click', function(){
    confirmModal.hidden = true;
    pendingDeleteId = null;
  });
  confirmOk.addEventListener('click', function(){
    if (!pendingDeleteId) return;
    var id = pendingDeleteId;
    client.from('bookings').delete().eq('id', id).then(function(res){
      confirmModal.hidden = true;
      pendingDeleteId = null;
      if (res.error) { toast('No se pudo eliminar la reserva.', 'error'); return; }
      toast('Fechas liberadas correctamente.', 'success');
      if (editingId === id) resetForm();
      loadBookings();
    });
  });
})();
