(function () {
  'use strict';
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $('#year').textContent = new Date().getFullYear();

  /* Mobile menu */
  var toggle = $('#navToggle'), nav = $('#nav');
  function setMenu(open) {
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  }
  toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 64rem)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  /* Open now (Europe/London) */
  function londonNow() {
    var parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
    var o = {};
    parts.forEach(function (p) { o[p.type] = p.value; });
    var days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: days[o.weekday], mins: (+o.hour) * 60 + (+o.minute) };
  }
  function updateStatus() {
    var n = londonNow(), el = $('#status'), txt = $('#statusText');
    var weekday = n.day >= 1 && n.day <= 5;
    var open = weekday && n.mins >= 480 && n.mins < 1080;
    el.classList.toggle('is-open', open);
    el.classList.toggle('is-closed', !open);
    if (open) txt.textContent = 'Open now · closes 6pm';
    else if (weekday && n.mins < 480) txt.textContent = 'Closed · opens today at 8am';
    else if (n.day >= 1 && n.day <= 4) txt.textContent = 'Closed · opens tomorrow at 8am';
    else txt.textContent = 'Closed · opens Monday at 8am';
    $$('.hours tr').forEach(function (tr) { tr.classList.toggle('today', +tr.dataset.day === n.day); });
  }
  updateStatus();
  setInterval(updateStatus, 60000);

  /* Registration plate input */
  function tidyReg(input) {
    input.addEventListener('input', function () {
      var v = input.value.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
      input.value = v;
    });
  }
  tidyReg($('#plateInput'));
  tidyReg($('#fReg'));

  /* Pre-fill the contact form from "Book" buttons */
  var service = $('#fService');
  function chooseService(name) {
    if (!name) return;
    var found = false;
    $$('option', service).forEach(function (o) { if (o.textContent === name) { service.value = o.value; found = true; } });
    return found;
  }
  $$('[data-service]').forEach(function (a) {
    if (!a.matches('a[href="#contact"]')) return;
    a.addEventListener('click', function () { chooseService(a.dataset.service); });
  });
  $('#plateForm').addEventListener('submit', function (e) {
    e.preventDefault();
    $('#fReg').value = $('#plateInput').value;
    chooseService('MOT');
    $('#contact').scrollIntoView({ behavior: 'smooth' });
    setTimeout(function () { $('#fName').focus({ preventScroll: true }); }, 600);
  });

  /* Pricing */
  var vat = 'ex', synthetic = false;
  function fmt(n) { return '£' + (Math.abs(n % 1) < 0.001 ? n.toFixed(0) : n.toFixed(2)); }
  function renderPrices() {
    $$('[data-ex]').forEach(function (el) {
      var base = parseFloat(el.dataset.ex) + (synthetic && el.dataset.service ? 35 : 0);
      el.textContent = fmt(vat === 'inc' ? Math.round(base * 120) / 100 : base);
    });
    $$('.vatlabel').forEach(function (el) { el.textContent = vat === 'inc' ? '+ parts · inc. VAT' : '+ parts + VAT'; });
    $('#vatNote').textContent = (vat === 'inc' ? 'All prices shown include VAT at 20%. ' : 'All prices shown exclude VAT. ') +
      'Parts, filters, spark plugs and cabin filters are charged additionally. Air-con price depends on the amount of refrigerant.';
  }
  $$('.switch__opt').forEach(function (b) {
    b.addEventListener('click', function () {
      vat = b.dataset.vat;
      $$('.switch__opt').forEach(function (x) { var on = x === b; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', on); });
      renderPrices();
    });
  });
  $('#synthetic').addEventListener('change', function (e) { synthetic = e.target.checked; renderPrices(); });

  var tabs = $$('.tabs [role="tab"]');
  function selectPlan(plan, focus) {
    tabs.forEach(function (t) {
      var on = t.dataset.plan === plan;
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
      if (on && focus) t.focus();
    });
    $$('.chooser button').forEach(function (c) { c.setAttribute('aria-checked', c.dataset.pick === plan); });
  }
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { selectPlan(t.dataset.plan); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); selectPlan(tabs[(i + d + tabs.length) % tabs.length].dataset.plan, true); }
    });
  });
  $$('.chooser button').forEach(function (c) { c.addEventListener('click', function () { selectPlan(c.dataset.pick); }); });
  selectPlan('silver');
  renderPrices();

  /* MOT checklist search */
  var items = $$('#checklist details'), search = $('#motSearch'), count = $('#motCount'), empty = $('#motEmpty');
  function filterChecklist() {
    var q = search.value.trim().toLowerCase(), shown = 0;
    items.forEach(function (d) {
      var hit = !q || d.textContent.toLowerCase().indexOf(q) !== -1;
      d.hidden = !hit;
      if (hit) shown++;
      if (q && hit) d.open = true; else if (!q) d.open = false;
    });
    count.textContent = q ? shown + ' of ' + items.length + ' items match' : items.length + ' checks in a standard MOT';
    empty.hidden = shown !== 0;
  }
  search.addEventListener('input', filterChecklist);
  filterChecklist();

  /* Contact form -> mailto */
  var form = $('#contactForm'), note = $('#formNote');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('#fName'), phone = $('#fPhone'), ok = true;
    [name, phone].forEach(function (f) {
      var bad = !f.value.trim();
      f.classList.toggle('invalid', bad);
      if (bad) ok = false;
    });
    note.classList.toggle('error', !ok);
    if (!ok) { note.textContent = 'Please add your name and phone number.'; (name.value ? phone : name).focus(); return; }
    var lines = [
      'Name: ' + name.value.trim(),
      'Phone: ' + phone.value.trim(),
      'Email: ' + ($('#fEmail').value.trim() || '-'),
      'Registration: ' + ($('#fReg').value.trim() || '-'),
      'Service: ' + service.value,
      '',
      $('#fMsg').value.trim()
    ];
    var subject = 'Booking request: ' + service.value + ($('#fReg').value.trim() ? ' (' + $('#fReg').value.trim() + ')' : '');
    window.location.href = 'mailto:info@unique-autocentre.co.uk?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    note.textContent = 'Your email app should open with the details filled in. Not working? Call 01908 611100.';
  });

  /* Reveal on scroll */
  var reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }
})();
