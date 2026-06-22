/* SKANNER — game.js */

// ── Device ID ─────────────────────────────────────────────
function getDeviceId() {
  const KEY = 'skanner_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = Array.from(crypto.getRandomValues(new Uint8Array(5)))
      .map(b => b.toString(16).padStart(2,'0')).join('').toUpperCase();
    localStorage.setItem(KEY, id);
  }
  return id;
}

const DEVICE_ID = getDeviceId();

// ── State ────────────────────────────────────────────────
const SAVE_KEY = 'skanner_save_' + DEVICE_ID;
const TIPS_KEY = 'skanner_tips_' + DEVICE_ID;

const defaultSave = {
  pilot:     '',
  shipName:  '',
  xp:        0,
  level:     1,
  sector:    1,
  scrapBag:  [],  // {id, code, name, rarity, icon, ts}
  scanLog:   [],  // {code, name, rarity, ts}
  scansToday:0,
  scanDay:   '',
  shipHull:  1,
  tipsOn:    true,
};

let save = {};
let seenTips = {};

function loadSave() {
  try { save = Object.assign({}, defaultSave, JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); }
  catch { save = Object.assign({}, defaultSave); }
  try { seenTips = JSON.parse(localStorage.getItem(TIPS_KEY) || '{}'); }
  catch { seenTips = {}; }
  const today = new Date().toISOString().slice(0,10);
  if (save.scanDay !== today) { save.scansToday = 0; save.scanDay = today; }
}

function writeSave() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save));
}

function markTipSeen(id) {
  seenTips[id] = true;
  localStorage.setItem(TIPS_KEY, JSON.stringify(seenTips));
}

// ── Screens ──────────────────────────────────────────────
function goTo(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  onEnter(id);
}

function onEnter(id) {
  if (id === 'screen-menu')      refreshMenu();
  if (id === 'screen-inventory') refreshInventory();
  if (id === 'screen-map')       renderMap();
  if (id === 'screen-settings')  refreshSettings();
  if (id === 'screen-scan')      startScanner();
}

// ── Boot sequence ─────────────────────────────────────────
function boot() {
  const fill   = document.getElementById('boot-fill');
  const status = document.getElementById('boot-status');
  const steps  = [
    [10, 'LOADING CORE...'],
    [30, 'CALIBRATING SCANNER...'],
    [55, 'LOADING GALAXY DATA...'],
    [80, 'SYNCING PILOT...'],
    [100,'READY'],
  ];
  let i = 0;
  function next() {
    if (i >= steps.length) { setTimeout(() => goTo('screen-menu'), 300); return; }
    const [pct, msg] = steps[i++];
    fill.style.width = pct + '%';
    status.textContent = msg;
    setTimeout(next, 280 + Math.random() * 180);
  }
  next();
}

// ── Menu ──────────────────────────────────────────────────
function renderShipTo(elId, ship, extraClass) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = ship.svg;
  const svg = el.querySelector('svg');
  if (svg && extraClass) svg.classList.add(extraClass);
}

function refreshMenu() {
  const pilotLabel = save.pilot ? 'CMDR ' + save.pilot.toUpperCase() : 'CMDR —';
  const ship = shipForHull(save.shipHull);
  renderShipTo('menu-ship-art', ship);
  document.getElementById('menu-ship-name').textContent =
    (save.shipName || 'SS UNNAMED') + ' · ' + ship.cls + ' Lv.' + save.shipHull;
  const xpNeeded = save.level * 100;
  const pct = Math.min(100, Math.round((save.xp / xpNeeded) * 100));
  document.getElementById('menu-xp-fill').style.width = pct + '%';
  document.getElementById('menu-xp-label').textContent =
    pilotLabel + ' · XP ' + save.xp + '/' + xpNeeded + ' · Sector ' + save.sector;

  if (!save.pilot) showTip('welcome',
    'WELCOME, PILOT',
    'Set your pilot name and ship name in Settings before heading out. Scanned barcodes yield scrap — combine it to upgrade your ship.');
}

// ── Scrap generation ──────────────────────────────────────
const SCRAP_POOL = [
  { name:'IRON PLATE',    icon:'🔩', rarity:'common',    xp:5  },
  { name:'COPPER WIRE',   icon:'⚡', rarity:'common',    xp:5  },
  { name:'POLYMER SHARD', icon:'🧱', rarity:'common',    xp:5  },
  { name:'FUEL CELL',     icon:'🔋', rarity:'uncommon',  xp:15 },
  { name:'LENS ARRAY',    icon:'🔭', rarity:'uncommon',  xp:15 },
  { name:'ALLOY HULL',    icon:'🛡️', rarity:'uncommon',  xp:15 },
  { name:'DARK MATTER',   icon:'✦',  rarity:'rare',      xp:40 },
  { name:'VOID CRYSTAL',  icon:'💎', rarity:'rare',      xp:40 },
  { name:'STELLAR CORE',  icon:'⭐', rarity:'legendary', xp:100},
];

function codeToScrap(code) {
  let hash = 0;
  for (const ch of code) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  const rarityRoll = hash % 100;
  let pool;
  if (rarityRoll < 60)       pool = SCRAP_POOL.filter(s => s.rarity === 'common');
  else if (rarityRoll < 85)  pool = SCRAP_POOL.filter(s => s.rarity === 'uncommon');
  else if (rarityRoll < 97)  pool = SCRAP_POOL.filter(s => s.rarity === 'rare');
  else                       pool = SCRAP_POOL.filter(s => s.rarity === 'legendary');
  return pool[hash % pool.length];
}

// ── Scanner ───────────────────────────────────────────────
let scanStream = null;
let barcodeDetector = null;
let scanActive = false;
let scanLoop = null;

function startScanner() {
  document.getElementById('scan-count').textContent = save.scansToday + ' scanned today';
  document.getElementById('scan-result').classList.add('hidden');
  document.getElementById('scan-tip').style.display = '';
  document.getElementById('scan-label').textContent = 'AIM SCANNER AT BARCODE';

  if ('BarcodeDetector' in window) {
    barcodeDetector = new BarcodeDetector({ formats: [
      'ean_13','ean_8','upc_a','upc_e','qr_code','code_128','code_39'
    ]});
  }

  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
    .then(stream => {
      scanStream = stream;
      const vid = document.getElementById('scan-video');
      vid.srcObject = stream;
      vid.play();
      scanActive = true;
      if (barcodeDetector) scheduleScan();
      else document.getElementById('scan-label').textContent = 'CAMERA ACTIVE — NO DETECTOR API';
    })
    .catch(() => {
      document.getElementById('scan-label').textContent = 'CAMERA PERMISSION DENIED';
    });

  showTip('scan-intro',
    'HOW TO SCAN',
    'Point your camera at any barcode — food, books, packages. Each barcode generates unique scrap. Rare barcodes yield better components.');
}

function stopScanner() {
  scanActive = false;
  if (scanLoop) { clearTimeout(scanLoop); scanLoop = null; }
  if (scanStream) { scanStream.getTracks().forEach(t => t.stop()); scanStream = null; }
}

function scheduleScan() {
  if (!scanActive) return;
  scanLoop = setTimeout(async () => {
    const vid = document.getElementById('scan-video');
    if (vid.readyState >= 2) {
      try {
        const results = await barcodeDetector.detect(vid);
        if (results.length > 0) onBarcode(results[0].rawValue);
      } catch {}
    }
    scheduleScan();
  }, 400);
}

function onBarcode(code) {
  if (!scanActive) return;
  stopScanner();

  const scrap = codeToScrap(code);
  document.getElementById('scan-result').classList.remove('hidden');
  document.getElementById('scan-tip').style.display = 'none';
  document.getElementById('result-code').textContent = code;
  document.getElementById('result-item').textContent = scrap.icon + ' ' + scrap.name + ' (' + scrap.rarity + ')';
  document.getElementById('scan-label').textContent = 'BARCODE DETECTED';

  document.getElementById('result-collect-btn').onclick = () => {
    const entry = {
      id:     Date.now(),
      code,
      name:   scrap.name,
      rarity: scrap.rarity,
      icon:   scrap.icon,
      ts:     new Date().toISOString(),
    };
    save.scrapBag.push(entry);
    save.scanLog.unshift(entry);
    if (save.scanLog.length > 100) save.scanLog.length = 100;
    save.scansToday++;
    save.xp += scrap.xp;
    checkLevelUp();
    writeSave();
    goTo('screen-menu');
  };
}

function checkLevelUp() {
  const needed = save.level * 100;
  if (save.xp >= needed) {
    save.xp -= needed;
    save.level++;
    if (save.level % 3 === 0) save.sector = Math.floor(save.level / 3) + 1;
  }
}

// ── Inventory ─────────────────────────────────────────────
function refreshInventory() {
  document.getElementById('inv-count').textContent = save.scrapBag.length + ' items';

  // scrap grid
  const grid = document.getElementById('scrap-grid');
  if (!save.scrapBag.length) {
    grid.innerHTML = '<div class="empty-state">No scrap collected yet.<br/>Start scanning to find components.</div>';
  } else {
    grid.innerHTML = save.scrapBag.map((item, idx) =>
      `<div class="item-card" data-idx="${idx}">
        <div class="item-card-icon">${item.icon}</div>
        <div class="item-card-name">${item.name}</div>
        <div class="item-card-rarity rarity-${item.rarity}">${item.rarity.toUpperCase()}</div>
      </div>`
    ).join('');
    grid.querySelectorAll('.item-card').forEach(card => {
      card.addEventListener('click', () => openItemModal(save.scrapBag[+card.dataset.idx]));
    });
  }

  // ship tab
  const invShip = shipForHull(save.shipHull);
  renderShipTo('inv-ship-art', invShip, 'large');
  document.getElementById('ship-stats').innerHTML =
    `Class: <span>${invShip.cls}</span><br>
     Designation: <span>${save.shipName || 'SS UNNAMED'}</span><br>
     Hull Level: <span>${save.shipHull}</span><br>
     Pilot: <span>${save.pilot || '—'}</span><br>
     Total Scrap: <span>${save.scrapBag.length}</span><br>
     Sector: <span>${save.sector}</span><br>
     ${invShip.desc}`;

  // scan log
  const log = document.getElementById('scan-log');
  if (!save.scanLog.length) {
    log.innerHTML = '<div class="empty-state">No scans yet.</div>';
  } else {
    log.innerHTML = save.scanLog.map(e =>
      `<div class="log-entry">
        <div class="log-entry-code">${e.code}</div>
        <div class="log-entry-item">${e.icon} ${e.name} — ${e.rarity.toUpperCase()}</div>
        <div class="log-entry-time">${new Date(e.ts).toLocaleString()}</div>
      </div>`
    ).join('');
  }
}

// ── Galaxy Map ────────────────────────────────────────────
function renderMap() {
  document.getElementById('map-sector').textContent = 'Sector ' + save.sector;
  const canvas = document.getElementById('map-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const cx = canvas.width / 2, cy = canvas.height / 2;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // generate deterministic sector nodes
  const nodes = [];
  for (let i = 1; i <= 12; i++) {
    const angle = (i / 12) * Math.PI * 2 + (i * 0.4);
    const r = 60 + (i % 4) * 28;
    nodes.push({ id: i, x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
  }
  nodes.unshift({ id: 0, x: cx, y: cy }); // home

  // draw connections
  ctx.strokeStyle = '#1A2A1A';
  ctx.lineWidth = 1;
  nodes.forEach((n, i) => {
    if (i === 0) return;
    ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(cx, cy); ctx.stroke();
  });

  // draw nodes
  nodes.forEach((n, i) => {
    const unlocked = i <= save.level;
    const current  = i === 0;
    ctx.beginPath();
    ctx.arc(n.x, n.y, current ? 8 : 5, 0, Math.PI * 2);
    if (current) {
      ctx.fillStyle = '#00DD44';
      ctx.shadowBlur = 12; ctx.shadowColor = '#00DD44';
    } else if (unlocked) {
      ctx.fillStyle = '#1044BB';
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = '#222';
      ctx.shadowBlur = 0;
    }
    ctx.fill();
    ctx.shadowBlur = 0;

    if (current || unlocked) {
      ctx.fillStyle = current ? '#00FF55' : '#4A6A9A';
      ctx.font = '9px Courier New';
      ctx.textAlign = 'center';
      ctx.fillText('S' + (i + 1), n.x, n.y + 16);
    }
  });
}

// ── Settings ──────────────────────────────────────────────
function refreshSettings() {
  document.getElementById('set-pilot-name').value  = save.pilot;
  document.getElementById('set-ship-name').value   = save.shipName;
  document.getElementById('set-tips').checked      = save.tipsOn;
  document.getElementById('set-device-id').textContent = DEVICE_ID;
}

// ── Item Modal ────────────────────────────────────────────
function openItemModal(item) {
  document.getElementById('modal-title').textContent = item.name;
  document.getElementById('modal-body').innerHTML =
    `<div style="font-size:40px;text-align:center;margin-bottom:12px">${item.icon}</div>
     <strong>Rarity:</strong> ${item.rarity.toUpperCase()}<br>
     <strong>Source:</strong> ${item.code}<br>
     <strong>Acquired:</strong> ${new Date(item.ts).toLocaleString()}`;
  document.getElementById('item-modal').classList.remove('hidden');
}

// ── Tutorial ──────────────────────────────────────────────
function showTip(id, title, body) {
  if (!save.tipsOn) return;
  if (seenTips[id]) return;
  document.getElementById('tut-title').textContent = title;
  document.getElementById('tut-body').textContent  = body;
  document.getElementById('tut-dont-show').checked = false;
  document.getElementById('tutorial-overlay').classList.remove('hidden');

  document.getElementById('tut-ok').onclick = () => {
    if (document.getElementById('tut-dont-show').checked) markTipSeen(id);
    document.getElementById('tutorial-overlay').classList.add('hidden');
  };
}

// ── Starfield ─────────────────────────────────────────────
(function(){
  const c = document.getElementById('starfield');
  const x = c.getContext('2d');
  let stars = [];
  function init() {
    c.width = window.innerWidth; c.height = window.innerHeight;
    stars = Array.from({length:160}, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      r: Math.random() * 1.2 + 0.2,
      o: Math.random() * 0.5 + 0.2, p: Math.random() * Math.PI * 2
    }));
  }
  function draw(t) {
    x.clearRect(0, 0, c.width, c.height);
    stars.forEach(s => {
      const op = s.o * (0.6 + 0.4 * Math.sin(t / 1400 + s.p));
      x.beginPath(); x.arc(s.x, s.y, s.r, 0, Math.PI*2);
      x.fillStyle = 'rgba(200,255,200,' + op + ')'; x.fill();
    });
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize', init);
  init(); requestAnimationFrame(draw);
}());

// ── Wire up events ────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadSave();

  // Screen nav buttons
  document.querySelectorAll('[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.screen;
      if (target === 'screen-menu') stopScanner();
      goTo(target);
    });
  });

  // Menu nav
  document.querySelectorAll('.menu-btn[data-screen]').forEach(btn => {
    btn.addEventListener('click', () => goTo(btn.dataset.screen));
  });

  // Inventory tabs
  document.querySelectorAll('.inv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById('tab-' + tab.dataset.tab).classList.add('active');
    });
  });

  // Settings saves
  document.getElementById('set-save-name').addEventListener('click', () => {
    save.pilot = document.getElementById('set-pilot-name').value.trim().toUpperCase();
    writeSave(); document.getElementById('set-save-name').textContent = 'SAVED ✓';
    setTimeout(() => document.getElementById('set-save-name').textContent = 'SAVE', 1500);
  });
  document.getElementById('set-save-ship').addEventListener('click', () => {
    save.shipName = document.getElementById('set-ship-name').value.trim().toUpperCase();
    writeSave(); document.getElementById('set-save-ship').textContent = 'SAVED ✓';
    setTimeout(() => document.getElementById('set-save-ship').textContent = 'SAVE', 1500);
  });
  document.getElementById('set-tips').addEventListener('change', e => {
    save.tipsOn = e.target.checked; writeSave();
  });
  document.getElementById('set-reset-tips').addEventListener('click', () => {
    if (confirm('Reset all seen tutorials?')) {
      seenTips = {}; localStorage.removeItem(TIPS_KEY);
    }
  });
  document.getElementById('set-reset-all').addEventListener('click', () => {
    if (confirm('RESET ALL PROGRESS? This cannot be undone.')) {
      localStorage.removeItem(SAVE_KEY);
      localStorage.removeItem(TIPS_KEY);
      location.reload();
    }
  });

  // Modal close
  document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('item-modal').classList.add('hidden');
  });
  document.getElementById('item-modal').addEventListener('click', e => {
    if (e.target === document.getElementById('item-modal'))
      document.getElementById('item-modal').classList.add('hidden');
  });

  // Boot
  goTo('screen-boot');
  boot();
});
