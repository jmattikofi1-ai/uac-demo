/* Demo labelling: banner + diagonal stripes + footer credit + noindex.
   Loaded by site/index.html. Delete this file and its <script> tag before the real launch. */
(function () {
  'use strict';

  var meta = document.createElement('meta');
  meta.name = 'robots';
  meta.content = 'noindex, nofollow';
  document.head.appendChild(meta);

  var tile = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='340' height='200'%3E%3Cg transform='rotate(-24 170 100)' font-family='Arial,Helvetica,sans-serif' font-weight='800' font-size='20' letter-spacing='3' text-anchor='middle' fill='%23808080' fill-opacity='0.22'%3E%3Ctext x='170' y='92'%3EDEMO BY JOSEPH%3C/text%3E%3Ctext x='170' y='124' font-size='13' letter-spacing='2'%3EMADE BY JOSEPH%3C/text%3E%3C/g%3E%3C/svg%3E";

  var css =
    '.demo-strip{position:sticky;top:0;z-index:300;background:#e11d2e;color:#fff;text-align:center;' +
    'font:700 .8125rem/1.2 Arial,Helvetica,sans-serif;letter-spacing:.08em;text-transform:uppercase;padding:.55rem 1rem}' +
    '.demo-stripes{position:fixed;inset:0;z-index:250;pointer-events:none;' +
    'background-image:url("' + tile + '"),repeating-linear-gradient(-24deg,transparent 0 150px,rgba(225,29,46,.10) 150px 190px)}' +
    '.demo-credit{margin:.4rem 0 0!important;font-weight:700;letter-spacing:.04em}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var strip = document.createElement('div');
  strip.className = 'demo-strip';
  strip.setAttribute('role', 'note');
  strip.textContent = 'Demo by Joseph \u00b7 design preview';
  document.body.insertBefore(strip, document.body.firstChild);

  var stripes = document.createElement('div');
  stripes.className = 'demo-stripes';
  stripes.setAttribute('aria-hidden', 'true');
  document.body.appendChild(stripes);

  var legal = document.querySelector('.footer__legal');
  if (legal) {
    var credit = document.createElement('p');
    credit.className = 'demo-credit';
    credit.textContent = 'Demo by Joseph \u00b7 Made by Joseph';
    legal.appendChild(credit);
  }

  function setOffset() {
    document.documentElement.style.setProperty('--demo-h', strip.offsetHeight + 'px');
  }
  setOffset();
  window.addEventListener('resize', setOffset);
})();
