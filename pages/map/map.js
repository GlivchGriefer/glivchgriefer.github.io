(function () {
  'use strict';

  // ── Helpers ─────────────────────────────────────────────────
  function $g(url, opts) {
    return fetch(url, opts || {}).then(function (r) {
      if (!r.ok) throw r;
      return r.json();
    });
  }
  function $t(url, opts) {
    return fetch(url, opts || {}).then(function (r) {
      if (!r.ok) throw r;
      return r.text();
    });
  }
  function parseXml(text) {
    return (new DOMParser()).parseFromString(text, 'application/xml');
  }

  var WMO = {
    0:'Clear',1:'Mostly Clear',2:'Partly Cloudy',3:'Overcast',
    45:'Fog',48:'Freezing Fog',
    51:'Light Drizzle',53:'Drizzle',55:'Heavy Drizzle',
    61:'Light Rain',63:'Rain',65:'Heavy Rain',
    71:'Light Snow',73:'Snow',75:'Heavy Snow',77:'Sleet',
    80:'Showers',81:'Heavy Showers',82:'Violent Showers',
    85:'Snow Showers',86:'Heavy Snow Showers',
    95:'Thunderstorm',96:'Thunderstorm w/ Hail',99:'Severe Thunderstorm'
  };

  var DEFAULT_LAT = 39, DEFAULT_LON = -98, DEFAULT_ZOOM = 4;
  var homeLat = DEFAULT_LAT, homeLon = DEFAULT_LON, homeZoom = DEFAULT_ZOOM;

  // ── Map init ────────────────────────────────────────────────
  var map = L.map('map', { zoomControl: false, attributionControl: false });

  L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);
  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(map);

  // ── Layer groups ────────────────────────────────────────────
  var quakeGroup = L.layerGroup();
  var alertGroup = L.layerGroup();
  var gdacsGroup = L.layerGroup();
  var buoyGroup  = L.layerGroup();
  var radarTile  = null;

  var LAYER_DEFS = [
    { key: 'radar',  name: 'Radar',       icon: '🌧', group: null,        on: true  },
    { key: 'quake',  name: 'Earthquakes', icon: '🌍', group: quakeGroup,  on: true  },
    { key: 'alerts', name: 'NWS Alerts',  icon: '⚠️', group: alertGroup,  on: true  },
    { key: 'gdacs',  name: 'Disasters',   icon: '🚨', group: gdacsGroup,  on: true  },
    { key: 'buoys',  name: 'Buoys',       icon: '📡', group: buoyGroup,   on: false }
  ];

  var state = {};
  LAYER_DEFS.forEach(function (d) { state[d.key] = d.on; });

  function setLayer(key, on) {
    state[key] = on;
    var def = LAYER_DEFS.filter(function (d) { return d.key === key; })[0];
    if (!def) return;
    if (key === 'radar') {
      if (radarTile) { on ? radarTile.addTo(map) : map.removeLayer(radarTile); }
    } else if (def.group) {
      on ? def.group.addTo(map) : map.removeLayer(def.group);
    }
  }

  // ── Sidebar ─────────────────────────────────────────────────
  var sidebar  = document.getElementById('ms-sidebar');
  var sideToggle = document.getElementById('ms-toggle');
  var layersEl = document.getElementById('ms-layers');

  LAYER_DEFS.forEach(function (d) {
    var lbl = document.createElement('label');
    lbl.className = 'ms-layer-row';
    lbl.innerHTML =
      '<input type="checkbox"' + (d.on ? ' checked' : '') + ' data-key="' + d.key + '">' +
      '<span class="ms-layer-icon">' + d.icon + '</span>' +
      '<span class="ms-layer-name">' + d.name + '</span>' +
      '<span class="ms-layer-badge" id="ms-b-' + d.key + '"></span>';
    layersEl.appendChild(lbl);
  });

  layersEl.addEventListener('change', function (e) {
    var cb = e.target;
    if (cb.type === 'checkbox') setLayer(cb.dataset.key, cb.checked);
  });

  sideToggle.addEventListener('click', function () {
    sidebar.classList.toggle('open');
  });

  // Close sidebar on map click (mobile)
  map.on('click', function () {
    if (window.innerWidth < 600) sidebar.classList.remove('open');
  });

  function badge(key, text, live) {
    var el = document.getElementById('ms-b-' + key);
    if (!el) return;
    el.textContent = text;
    if (live) el.classList.add('live');
  }

  // ── Initial view (ZIP → lat/lon) ────────────────────────────
  var savedZip = '';
  try { savedZip = localStorage.getItem('pm_daily_zip') || ''; } catch (e) {}

  if (savedZip) {
    $g('https://api.zippopotam.us/us/' + savedZip)
      .then(function (d) {
        var p = d.places[0];
        homeLat = parseFloat(p.latitude);
        homeLon = parseFloat(p.longitude);
        homeZoom = 9;
        map.setView([homeLat, homeLon], homeZoom);
      })
      .catch(function () { map.setView([DEFAULT_LAT, DEFAULT_LON], DEFAULT_ZOOM); });
  } else {
    map.setView([DEFAULT_LAT, DEFAULT_LON], DEFAULT_ZOOM);
  }

  // ── Radar — RainViewer ──────────────────────────────────────
  $g('https://api.rainviewer.com/public/weather-maps.json')
    .then(function (data) {
      var past = data.radar && data.radar.past;
      if (!past || !past.length) return;
      var path = past[past.length - 1].path;
      radarTile = L.tileLayer(
        'https://tilecache.rainviewer.com' + path + '/256/{z}/{x}/{y}/2/1_1.png',
        { opacity: 0.5, maxZoom: 12 }
      );
      if (state.radar) radarTile.addTo(map);
      badge('radar', 'live', true);
    })
    .catch(function () { badge('radar', 'err'); });

  // ── Earthquakes — USGS ──────────────────────────────────────
  $g('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson')
    .then(function (data) {
      L.geoJSON(data, {
        pointToLayer: function (f, ll) {
          var m = parseFloat(f.properties.mag) || 0;
          var r = Math.max(3.5, Math.min(16, m * 3));
          var c = m >= 6 ? '#FF3030' : m >= 5 ? '#FF7422' : m >= 4 ? '#FFC020' : m >= 3 ? '#FFEE44' : '#44DF80';
          return L.circleMarker(ll, {
            radius: r, fillColor: c, color: 'rgba(0,0,0,0.5)',
            weight: 0.5, fillOpacity: 0.8
          });
        },
        onEachFeature: function (f, layer) {
          var p = f.properties;
          var mag = parseFloat(p.mag).toFixed(1);
          var t = new Date(p.time).toLocaleString();
          var c = parseFloat(p.mag) >= 6 ? '#FF3030' : parseFloat(p.mag) >= 5 ? '#FF7422' : parseFloat(p.mag) >= 4 ? '#FFC020' : parseFloat(p.mag) >= 3 ? '#FFEE44' : '#44DF80';
          layer.bindPopup(
            '<b style="color:' + c + '">M' + mag + '</b> — ' + (p.place || '—') + '<br>' +
            '<span style="color:#5a7a90;font-size:10px">' + t + '</span>' +
            (p.depth ? '<br><span style="color:#5a7a90;font-size:10px">Depth: ' + p.depth.toFixed(0) + ' km</span>' : '')
          );
        }
      }).addTo(quakeGroup);
      if (state.quake) quakeGroup.addTo(map);
      badge('quake', data.features.length);
    })
    .catch(function () { badge('quake', '—'); });

  // ── NWS Alerts ──────────────────────────────────────────────
  $g('https://api.weather.gov/alerts/active.geojson', {
    headers: { 'User-Agent': '(proceduralmedia.com, weather-map)' }
  })
    .then(function (data) {
      var feats = (data.features || []).filter(function (f) { return f.geometry; });
      L.geoJSON({ type: 'FeatureCollection', features: feats }, {
        style: function (f) {
          var s = (f.properties.severity || '').toLowerCase();
          var c = s === 'extreme' ? '#FF0000' : s === 'severe' ? '#FF7700' :
                  s === 'moderate' ? '#FFCC00' : '#3399FF';
          return { color: c, weight: 1.5, fillColor: c, fillOpacity: 0.12, opacity: 0.8 };
        },
        onEachFeature: function (f, layer) {
          var p = f.properties;
          layer.bindPopup(
            '<b>' + (p.event || 'Weather Alert') + '</b><br>' +
            '<span style="font-size:10px;color:#90aac8">' + (p.headline || '') + '</span><br>' +
            '<span style="font-size:9px;color:#3a5a70">Severity: ' + (p.severity || '?') + '</span>'
          );
        }
      }).addTo(alertGroup);
      if (state.alerts) alertGroup.addTo(map);
      badge('alerts', feats.length);
    })
    .catch(function () { badge('alerts', '—'); });

  // ── GDACS Disasters (RSS) ────────────────────────────────────
  function gdacsIcon(title) {
    var t = (title || '').toLowerCase();
    if (t.indexOf('earthquake') >= 0) return '🌍';
    if (t.indexOf('cyclone') >= 0 || t.indexOf('hurricane') >= 0 || t.indexOf('typhoon') >= 0) return '🌀';
    if (t.indexOf('flood') >= 0) return '🌊';
    if (t.indexOf('fire') >= 0) return '🔥';
    if (t.indexOf('drought') >= 0) return '🏜';
    if (t.indexOf('tsunami') >= 0) return '🌊';
    return '🚨';
  }
  function gdacsColor(alertLevel) {
    var al = (alertLevel || '').toLowerCase();
    return al === 'red' ? '#FF3030' : al === 'orange' ? '#FF7700' : '#44CC44';
  }
  function geoNs(item, tag) {
    var ns = 'http://www.w3.org/2003/01/geo/wgs84_pos#';
    var els = item.getElementsByTagNameNS(ns, tag);
    if (els.length) return parseFloat(els[0].textContent);
    // fallback: try without namespace
    var fb = item.getElementsByTagName('geo:' + tag);
    if (fb.length) return parseFloat(fb[0].textContent);
    return NaN;
  }
  function gdacsNs(item, tag) {
    var ns = 'http://www.gdacs.org';
    var els = item.getElementsByTagNameNS(ns, tag);
    if (els.length) return els[0].textContent;
    var fb = item.getElementsByTagName('gdacs:' + tag);
    if (fb.length) return fb[0].textContent;
    return '';
  }

  $t('https://www.gdacs.org/xml/rss.xml')
    .then(function (xml) {
      var doc = parseXml(xml);
      var items = Array.from(doc.querySelectorAll('item'));
      var count = 0;
      items.forEach(function (item) {
        var lat = geoNs(item, 'lat');
        var lon = geoNs(item, 'long');
        if (isNaN(lat) || isNaN(lon)) return;
        var titleEl = item.querySelector('title');
        var title = titleEl ? titleEl.textContent : '?';
        var alertLevel = gdacsNs(item, 'alertlevel');
        var country = gdacsNs(item, 'country');
        var linkEl = item.querySelector('link');
        var link = linkEl ? linkEl.textContent : '#';
        var ico = gdacsIcon(title);
        var col = gdacsColor(alertLevel);
        L.circleMarker([lat, lon], {
          radius: 7, fillColor: col, color: 'rgba(0,0,0,0.5)',
          weight: 1.2, fillOpacity: 0.82
        }).bindPopup(
          '<b>' + ico + ' ' + title + '</b>' +
          (country ? '<br><span style="font-size:10px;color:#90aac8">' + country + '</span>' : '') +
          (alertLevel ? '<br><span style="font-size:9px;color:' + col + '">Alert: ' + alertLevel + '</span>' : '') +
          (link && link !== '#' ? '<br><a href="' + link + '" target="_blank" rel="noopener" style="font-size:10px;color:#4a8aee">GDACS details ↗</a>' : '')
        ).addTo(gdacsGroup);
        count++;
      });
      if (state.gdacs) gdacsGroup.addTo(map);
      badge('gdacs', count || '—');
    })
    .catch(function () { badge('gdacs', '—'); });

  // ── NDBC Buoys ───────────────────────────────────────────────
  $t('https://www.ndbc.noaa.gov/activestations.xml')
    .then(function (xml) {
      var doc = parseXml(xml);
      var stations = Array.from(doc.querySelectorAll('Station'));
      var count = 0;
      stations.slice(0, 300).forEach(function (s) {
        var lat = parseFloat(s.getAttribute('lat'));
        var lon = parseFloat(s.getAttribute('lon'));
        if (isNaN(lat) || isNaN(lon)) return;
        var id   = s.getAttribute('id') || '';
        var name = s.getAttribute('name') || id;
        var pgm  = s.getAttribute('pgm') || '';
        L.circleMarker([lat, lon], {
          radius: 3.5, fillColor: '#22AACC', color: 'rgba(0,40,80,0.6)',
          weight: 0.5, fillOpacity: 0.75
        }).bindPopup(
          '<b>📡 ' + name + '</b><br>' +
          '<span style="font-size:10px;color:#5a8aaa">' + id +
          (pgm ? ' · ' + pgm : '') + '</span><br>' +
          '<a href="https://www.ndbc.noaa.gov/station_page.php?station=' + encodeURIComponent(id) +
          '" target="_blank" rel="noopener" style="font-size:10px;color:#4a8aee">Station data ↗</a>'
        ).addTo(buoyGroup);
        count++;
      });
      badge('buoys', count);
      // buoys off by default — don't add to map
    })
    .catch(function () { badge('buoys', '—'); });

  // ── Click → Weather + Marine popup ──────────────────────────
  var clickPopup = L.popup({ className: 'mp-popup', maxWidth: 240 });
  var pendingLL = null;

  map.on('click', function (e) {
    var ll = e.latlng;
    pendingLL = ll;
    clickPopup
      .setLatLng(ll)
      .setContent('<div class="mp-loading">Fetching conditions…</div>')
      .openOn(map);

    var lat = ll.lat.toFixed(4), lon = ll.lng.toFixed(4);
    var wxUrl = 'https://api.open-meteo.com/v1/forecast?latitude=' + lat +
      '&longitude=' + lon +
      '&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,apparent_temperature' +
      '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto';
    var marineUrl = 'https://marine-api.open-meteo.com/v1/marine?latitude=' + lat +
      '&longitude=' + lon +
      '&current=wave_height,wave_direction,wave_period,swell_wave_height&timezone=auto';

    Promise.all([
      $g(wxUrl).catch(function () { return null; }),
      $g(marineUrl).catch(function () { return null; })
    ]).then(function (res) {
      if (pendingLL !== ll) return;
      var wx = res[0], marine = res[1];
      var html = '<div class="mp-ll">' + ll.lat.toFixed(3) + '°, ' + ll.lng.toFixed(3) + '°</div>';

      if (wx && wx.current && wx.current.temperature_2m != null) {
        var c = wx.current;
        html += '<span class="mp-temp">' + Math.round(c.temperature_2m) + '°F</span>';
        html += '<div class="mp-wx-row">';
        html += (WMO[c.weather_code] || '');
        if (c.apparent_temperature != null) html += ' · Feels ' + Math.round(c.apparent_temperature) + '°';
        html += '<br>💨 ' + Math.round(c.wind_speed_10m) + ' mph · 💧 ' + c.relative_humidity_2m + '%';
        html += '</div>';
      } else {
        html += '<div class="mp-wx-row" style="color:#3a5a70">No weather data for this point.</div>';
      }

      if (marine && marine.current && marine.current.wave_height != null) {
        var m = marine.current;
        html += '<div class="mp-marine">🌊 Wave: ' + parseFloat(m.wave_height).toFixed(1) + ' m';
        if (m.swell_wave_height != null) html += ' · Swell: ' + parseFloat(m.swell_wave_height).toFixed(1) + ' m';
        if (m.wave_period != null) html += ' · Period: ' + parseFloat(m.wave_period).toFixed(0) + ' s';
        if (m.wave_direction != null) {
          var dirs = ['N','NE','E','SE','S','SW','W','NW'];
          html += ' · ' + dirs[Math.round(m.wave_direction / 45) % 8];
        }
        html += '</div>';
      }

      clickPopup.setContent(html);
    });
  });

  // ── Search — Nominatim ───────────────────────────────────────
  var searchOpen    = document.getElementById('search-open');
  var searchRow     = document.getElementById('search-row');
  var searchInput   = document.getElementById('search-input');
  var searchClose   = document.getElementById('search-close');
  var searchResults = document.getElementById('search-results');
  var searchTimer;

  searchOpen.addEventListener('click', function () {
    searchRow.style.display = 'flex';
    searchOpen.style.display = 'none';
    searchInput.focus();
  });

  function closeSearch() {
    searchRow.style.display = 'none';
    searchOpen.style.display = 'flex';
    searchResults.innerHTML = '';
    searchInput.value = '';
  }
  searchClose.addEventListener('click', closeSearch);

  searchInput.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeSearch();
    if (e.key === 'Enter') { clearTimeout(searchTimer); runSearch(searchInput.value.trim()); }
  });

  searchInput.addEventListener('input', function () {
    clearTimeout(searchTimer);
    var q = searchInput.value.trim();
    if (q.length < 2) { searchResults.innerHTML = ''; return; }
    searchTimer = setTimeout(function () { runSearch(q); }, 420);
  });

  function runSearch(q) {
    if (!q) return;
    searchResults.innerHTML = '<div class="mc-search-msg">Searching…</div>';
    $g('https://nominatim.openstreetmap.org/search?format=json&limit=5&q=' + encodeURIComponent(q), {
      headers: { 'Accept-Language': 'en', 'User-Agent': 'proceduralmedia.com map' }
    })
      .then(function (data) {
        searchResults.innerHTML = '';
        if (!data.length) {
          searchResults.innerHTML = '<div class="mc-search-msg">No results</div>';
          return;
        }
        data.forEach(function (r) {
          var div = document.createElement('div');
          div.className = 'mc-result';
          div.textContent = r.display_name;
          div.addEventListener('click', function () {
            var lat = parseFloat(r.lat), lon = parseFloat(r.lon);
            var zoom = r.type === 'administrative' ? 8 : 12;
            map.setView([lat, lon], zoom);
            closeSearch();
          });
          searchResults.appendChild(div);
        });
      })
      .catch(function () {
        searchResults.innerHTML = '<div class="mc-search-msg">Search unavailable</div>';
      });
  }

  // ── Home / reset view ────────────────────────────────────────
  document.getElementById('mc-home').addEventListener('click', function () {
    map.setView([homeLat, homeLon], homeZoom);
  });

  // ── Fullscreen ───────────────────────────────────────────────
  document.getElementById('mc-fs').addEventListener('click', function () {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else {
      document.exitFullscreen();
    }
  });

  document.addEventListener('fullscreenchange', function () {
    document.getElementById('mc-fs').textContent = document.fullscreenElement ? '✕' : '⛶';
    document.getElementById('mc-fs').title = document.fullscreenElement ? 'Exit fullscreen' : 'Fullscreen';
  });

  // ── Keyboard shortcut: Escape closes sidebar/search ─────────
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      sidebar.classList.remove('open');
      if (searchRow.style.display !== 'none') closeSearch();
    }
  });

}());
