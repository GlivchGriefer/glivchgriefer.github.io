/* taskbar.js — minimized window manager */
const PM_TB = 'pm_taskbar';

function tbGet() {
  try { return JSON.parse(sessionStorage.getItem(PM_TB) || '[]'); } catch { return []; }
}
function tbSet(v) { sessionStorage.setItem(PM_TB, JSON.stringify(v)); }

function tbMinimize(title, icon, hubHref) {
  const url = window.location.href;
  const items = tbGet().filter(i => i.url !== url);
  items.push({ url, title, icon });
  tbSet(items);
  window.location.href = hubHref;
}

function tbRemove(url) { tbSet(tbGet().filter(i => i.url !== url)); }

function tbRender() {
  const old = document.getElementById('pm-taskbar');
  if (old) old.remove();
  const items = tbGet();
  if (!items.length) return;

  const bar = document.createElement('div');
  bar.id = 'pm-taskbar';
  bar.className = 'pm-taskbar';

  items.forEach(item => {
    const wrap = document.createElement('div');
    wrap.className = 'pm-tb-item';

    const btn = document.createElement('button');
    btn.className = 'pm-tb-btn';
    btn.innerHTML = `<span class="pm-tb-icon">${item.icon}</span><span class="pm-tb-label">${item.title}</span>`;
    btn.addEventListener('click', () => {
      tbRemove(item.url);
      window.location.href = item.url;
    });

    const x = document.createElement('button');
    x.className = 'pm-tb-close';
    x.textContent = '✕';
    x.title = 'Dismiss';
    x.addEventListener('click', () => { tbRemove(item.url); tbRender(); });

    wrap.appendChild(btn);
    wrap.appendChild(x);
    bar.appendChild(wrap);
  });

  (document.querySelector('.aim-app') || document.body).appendChild(bar);
}

document.addEventListener('DOMContentLoaded', tbRender);
