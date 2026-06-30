(function () {
  'use strict';

  var CACHE_KEY = 'pm_daily_v5';
  var NASA_KEY  = 'LwKocN7opRPq0C5Bl06PoswP7ZPgSMIs7RtsKNZ9';

  var WORDS = [
    'ephemeral','luminous','serendipity','catalyst','entropy',
    'labyrinth','melancholy','nebulous','paradox','quintessential',
    'resilience','synchrony','tranquil','ubiquitous','verbose',
    'wanderlust','xenial','yearning','zenith','absurdity',
    'brevity','cascade','diligent','equinox','fractal',
    'gossamer','halcyon','iridescent','jubilant','kinetic',
    'liminal','maelstrom','nascent','ominous','perspicacious',
    'quixotic','radiant','solstice','tenacious','undulate',
    'vivid','wistful','exuberant','yielding','zealous',
    'amorphous','benevolent','cadence','dappled','effervescent',
    'fleeting','grandiose','humble','iridescence','jovial',
    'kaleidoscope','laconic','mercurial','nonchalant','oscillate',
    'placid','querulous','ruminate','scintilla','turbulent',
    'uncanny','vertiginous','whimsical','axiom','bemused',
    'chimera','deft','elusive','fervent','glistening',
    'holistic','inquisitive','jaded','keen','loquacious',
    'muse','nuance','opulent','poignant','quirky',
    'reverence','sagacious','tenuous','umber','vestige',
    'wane','exquisite','yonder','zeal','aloof',
    'boundless','candid','dauntless','eloquent','furtive'
  ];

  var TECH_KW = [
    'computer','internet','software','hardware','nasa','apple','microsoft','ibm',
    'google','linux','unix','cpu','processor','network','satellite','robot',
    'algorithm','browser','email','chip','transistor','spacecraft','telephone',
    'digital','program','engineer','code','data','technology','launch',
    'rocket','aviation','electric','television','radio','telegraph'
  ];

  var _cache = null;

  function todayStr() { return new Date().toISOString().slice(0, 10); }

  function yesterdayStr() {
    var d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().slice(0, 10);
  }

  function dayOfYear() {
    var now = new Date(), start = new Date(now.getFullYear(), 0, 0);
    return Math.floor((now - start) / 86400000);
  }

  function initCache() {
    try {
      var raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return;
      var c = JSON.parse(raw);
      if (c.date === todayStr()) _cache = c.data;
    } catch (e) {}
  }

  function setCache(key, val) {
    if (!_cache) _cache = {};
    _cache[key] = val;
    try { localStorage.setItem(CACHE_KEY, JSON.stringify({ date: todayStr(), data: _cache })); } catch (e) {}
  }

  function fetch$(url) {
    return fetch(url).then(function (r) {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });
  }

  /* fetch$ with AbortController timeout; rejects after ms milliseconds */
  function timedFetch$(url, ms) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, ms);
    return fetch(url, ctrl ? { signal: ctrl.signal } : {})
      .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error(r.status); return r.json(); })
      .catch(function (e) { clearTimeout(timer); throw e; });
  }

  function esc(str) {
    if (!str && str !== 0) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function wmo(code) {
    var m = {
      0:['☀️','Clear'],1:['🌤','Mainly clear'],2:['⛅','Partly cloudy'],
      3:['☁️','Overcast'],45:['🌫','Foggy'],48:['🌫','Icy fog'],
      51:['🌦','Light drizzle'],53:['🌦','Drizzle'],55:['🌧','Dense drizzle'],
      61:['🌧','Light rain'],63:['🌧','Rain'],65:['🌧','Heavy rain'],
      71:['🌨','Light snow'],73:['❄️','Snow'],75:['❄️','Heavy snow'],
      77:['🌨','Snow grains'],80:['🌦','Light showers'],81:['🌧','Showers'],
      82:['⛈','Violent showers'],85:['🌨','Snow showers'],86:['❄️','Heavy snow showers'],
      95:['⛈','Thunderstorm'],96:['⛈','Thunderstorm + hail'],99:['⛈','Thunderstorm + heavy hail']
    };
    return m[code] || ['🌡','Unknown'];
  }

  function fmtTime(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    var h = d.getHours(), m = d.getMinutes();
    return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + (h >= 12 ? 'p' : 'a');
  }

  // ── Carousel ─────────────────────────────────────────────

  var _slide = 0;
  var _slideCount = 6;
  var _autoTimer = null;

  function gotoSlide(idx) {
    _slide = ((idx % _slideCount) + _slideCount) % _slideCount;
    document.getElementById('discovery-carousel').style.transform = 'translateX(-' + (_slide * 100) + '%)';
    document.querySelectorAll('.dw-dot').forEach(function (d, i) {
      d.classList.toggle('active', i === _slide);
    });
  }

  function startAuto() {
    _autoTimer = setInterval(function () { gotoSlide(_slide + 1); }, 7000);
  }

  function resetAuto() {
    clearInterval(_autoTimer);
    startAuto();
  }

  // ── Weather ticker ────────────────────────────────────────

  function showZipPrompt() {
    document.getElementById('ticker-prompt').classList.remove('hidden');
    document.getElementById('ticker-data').classList.add('hidden');
  }

  function loadWeather(zip) {
    document.getElementById('ticker-prompt').classList.add('hidden');
    document.getElementById('ticker-data').classList.remove('hidden');
    document.getElementById('w-icon').textContent = '⏳';
    document.getElementById('w-desc').textContent = 'Loading…';
    document.getElementById('w-loc').textContent = '';
    document.getElementById('w-temp').textContent = '';

    fetch$('https://api.zippopotam.us/us/' + zip)
      .then(function (z) {
        var p = z.places[0];
        var city = p['place name'] + ', ' + p['state abbreviation'];
        return fetch$(
          'https://api.open-meteo.com/v1/forecast?latitude=' + p.latitude + '&longitude=' + p.longitude +
          '&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset' +
          '&hourly=temperature_2m' +
          '&temperature_unit=fahrenheit&timezone=auto&forecast_days=1'
        ).then(function (w) { return { w: w, city: city }; });
      })
      .then(function (obj) {
        var w = obj.w, city = obj.city, d = w.daily;
        var info = wmo(d.weather_code[0]);
        var hi = Math.round(d.temperature_2m_max[0]);
        var lo = Math.round(d.temperature_2m_min[0]);
        var hr = new Date().getHours();
        var curTemp = Math.round(w.hourly.temperature_2m[hr] || w.hourly.temperature_2m[12]);

        document.getElementById('w-icon').textContent = info[0];
        document.getElementById('w-temp').textContent = curTemp + '°';
        document.getElementById('w-desc').textContent = info[1];
        document.getElementById('w-loc').textContent = city;
        document.getElementById('w-hi').textContent = hi + '°';
        document.getElementById('w-lo').textContent = lo + '°';
        document.getElementById('w-sunrise').textContent = '☀ ' + fmtTime(d.sunrise[0]);
        document.getElementById('w-sunset').textContent = '⬇ ' + fmtTime(d.sunset[0]);

        var btn = document.getElementById('ticker-map-btn');
        if (btn) btn.href = '../map/map.html';

        document.getElementById('w-date').textContent =
          new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      })
      .catch(function () {
        document.getElementById('w-icon').textContent = '⚠';
        document.getElementById('w-desc').textContent = 'Weather unavailable — check ZIP';
        document.getElementById('w-loc').textContent = '';
        document.getElementById('w-temp').textContent = '';
      });
  }

  // ── APOD ─────────────────────────────────────────────────
  // Primary source: apod-today.json committed by GitHub Actions at 00:01 UTC.

  function fetchApod() {
    if (_cache && _cache.apod) { renderApod(_cache.apod); return; }
    var today = todayStr(), yesterday = yesterdayStr();
    fetch('apod-today.json?v=' + today)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(r.status); })
      .then(function (data) {
        if (data && (data.date === today || data.date === yesterday)) {
          setCache('apod', data);
          renderApod(data);
        } else {
          fetchApodDirect();
        }
      })
      .catch(fetchApodDirect);
  }

  function fetchApodDirect() {
    var h = new Date().getHours();
    var date = h < 6 ? yesterdayStr() : todayStr();
    timedFetch$('https://api.nasa.gov/planetary/apod?api_key=' + NASA_KEY + '&date=' + date, 30000)
      .then(function (data) { setCache('apod', data); renderApod(data); })
      .catch(function () {
        document.getElementById('apod-title').textContent = 'APOD unavailable';
        document.getElementById('apod-desc').textContent = '';
        document.getElementById('apod-img').style.opacity = '0';
        document.getElementById('apod-noimgwrap').classList.remove('hidden');
        document.getElementById('apod-video-link').classList.add('hidden');
      });
  }

  function renderApod(data) {
    var img = document.getElementById('apod-img');
    var noImgWrap = document.getElementById('apod-noimgwrap');
    var vl = document.getElementById('apod-video-link');
    if (data.media_type === 'image') {
      img.src = data.url;
      img.alt = data.title || '';
      img.style.opacity = '1';
      noImgWrap.classList.add('hidden');
      vl.classList.add('hidden');
    } else {
      img.style.opacity = '0';
      noImgWrap.classList.remove('hidden');
      vl.href = data.url || '#';
      vl.classList.remove('hidden');
    }
    document.getElementById('apod-title').textContent = data.title || '';
    var expl = data.explanation || '';
    document.getElementById('apod-desc').textContent = expl.length > 220 ? expl.slice(0, 220) + '…' : expl;
    document.getElementById('apod-link').href = data.hdurl || data.url || '#';
    if (data.copyright) document.getElementById('apod-credit').textContent = '© ' + data.copyright.trim();
  }

  // ── Wikimedia Picture of the Day ──────────────────────────

  function fetchWikiPotd() {
    if (_cache && _cache.potd) { renderWikiPotd(_cache.potd); return; }
    var now = new Date();
    var y  = now.getFullYear();
    var mo = String(now.getMonth() + 1).padStart(2, '0');
    var d  = String(now.getDate()).padStart(2, '0');
    fetch$('https://en.wikipedia.org/api/rest_v1/feed/featured/' + y + '/' + mo + '/' + d)
      .then(function (data) {
        if (!data.image) throw new Error('no image');
        setCache('potd', data.image);
        renderWikiPotd(data.image);
      })
      .catch(function () {
        document.getElementById('potd-title').textContent = 'Picture of the Day unavailable';
        document.getElementById('potd-noimgwrap').classList.remove('hidden');
        document.getElementById('potd-img').style.opacity = '0';
      });
  }

  function renderWikiPotd(img) {
    var el = document.getElementById('potd-img');
    var noEl = document.getElementById('potd-noimgwrap');
    var src = (img.image && img.image.source) || (img.thumbnail && img.thumbnail.source);
    if (src) {
      el.src = src;
      el.alt = (img.title && img.title.text) || 'Wikimedia Picture of the Day';
      el.style.opacity = '1';
      noEl.classList.add('hidden');
    } else {
      el.style.opacity = '0';
      noEl.classList.remove('hidden');
    }
    var titleText = (img.title && (img.title.display || img.title.text)) || 'Picture of the Day';
    document.getElementById('potd-title').textContent = titleText;
    var desc = (img.description && img.description.text) || '';
    document.getElementById('potd-desc').textContent = desc.length > 220 ? desc.slice(0, 220) + '…' : desc;
    if (src) document.getElementById('potd-link').href = src;
  }

  // ── NASA Image Library ────────────────────────────────────

  var SPACE_QUERIES = ['nebula', 'galaxy', 'supernova remnant', 'aurora borealis', 'deep space hubble'];

  function fetchNasaLib() {
    if (_cache && _cache.nasalib) { renderNasaLib(_cache.nasalib); return; }
    var query = SPACE_QUERIES[dayOfYear() % SPACE_QUERIES.length];
    var page  = (Math.floor(dayOfYear() / SPACE_QUERIES.length) % 20) + 1;
    fetch$('https://images-api.nasa.gov/search?q=' + encodeURIComponent(query) + '&media_type=image&page_size=1&page=' + page)
      .then(function (data) {
        var item = data.collection && data.collection.items && data.collection.items[0];
        if (!item) throw new Error('none');
        var result = {
          title: (item.data[0].title || '').trim(),
          desc:  (item.data[0].description || '').trim(),
          img:   item.links && item.links[0] && item.links[0].href || '',
          url:   'https://images.nasa.gov/details/' + item.data[0].nasa_id
        };
        setCache('nasalib', result);
        renderNasaLib(result);
      })
      .catch(function () {
        document.getElementById('nasalib-title').textContent = 'NASA image unavailable';
        document.getElementById('nasalib-noimgwrap').classList.remove('hidden');
        document.getElementById('nasalib-img').style.opacity = '0';
      });
  }

  function renderNasaLib(result) {
    var el = document.getElementById('nasalib-img');
    var noEl = document.getElementById('nasalib-noimgwrap');
    if (result.img) {
      el.onerror = function () { el.style.opacity = '0'; noEl.classList.remove('hidden'); };
      el.src = result.img;
      el.alt = result.title || 'NASA';
      el.style.opacity = '1';
      noEl.classList.add('hidden');
    } else {
      el.style.opacity = '0';
      noEl.classList.remove('hidden');
    }
    document.getElementById('nasalib-title').textContent = result.title || '';
    var desc = result.desc || '';
    document.getElementById('nasalib-desc').textContent = desc.length > 220 ? desc.slice(0, 220) + '…' : desc;
    document.getElementById('nasalib-link').href = result.url || 'https://images.nasa.gov';
  }

  // ── Masterworks via Wikimedia Commons (images on upload.wikimedia.org, no hotlink block) ──

  var MASTERWORKS = [
    {file:'The_Great_Wave_off_Kanagawa.jpg',                                             title:'The Great Wave off Kanagawa',    artist:'Katsushika Hokusai',      year:'c. 1831'},
    {file:'Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',                           title:'The Starry Night',               artist:'Vincent van Gogh',        year:'1889'},
    {file:'Girl_with_a_Pearl_Earring.jpg',                                               title:'Girl with a Pearl Earring',      artist:'Johannes Vermeer',        year:'c. 1665'},
    {file:'Mona_Lisa,_by_Leonardo_da_Vinci,_from_C2RMF_retouched.jpg',                  title:'Mona Lisa',                      artist:'Leonardo da Vinci',       year:'c. 1503'},
    {file:'John_Constable_-_The_Hay_Wain.jpg',                                          title:'The Hay Wain',                   artist:'John Constable',          year:'1821'},
    {file:'Caspar_David_Friedrich_-_Wanderer_above_the_sea_of_fog.jpg',                 title:'Wanderer above the Sea of Fog',  artist:'Caspar David Friedrich',  year:'c. 1818'},
    {file:'Eugène_Delacroix_-_La_liberté_guidant_le_peuple.jpg',              title:'Liberty Leading the People',     artist:'Éugène Delacroix', year:'1830'},
    {file:'Las_Meninas_01.jpg',                                                          title:'Las Meninas',                    artist:'Diego Velázquez',    year:'1656'},
    {file:'Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg', title:'The Birth of Venus',             artist:'Sandro Botticelli',       year:'c. 1485'},
    {file:'Rembrandt_van_Rijn_-_Self-Portrait_-_Google_Art_Project.jpg',                title:'Self-Portrait',                  artist:'Rembrandt van Rijn',      year:'c. 1659'},
    {file:'Georges_Seurat_021.jpg',                                                      title:'Young Woman Powdering Herself',  artist:'Georges Seurat',          year:'1890'},
    {file:'Turner_-_Rain,_Steam_and_Speed_-_National_Gallery_file.jpg',                 title:'Rain, Steam, and Speed',         artist:'J.M.W. Turner',           year:'1844'},
    {file:'The_Fighting_Temeraire,_JMW_Turner,_National_Gallery.jpg',                   title:'The Fighting Temeraire',         artist:'J.M.W. Turner',           year:'1839'},
    {file:'Edvard_Munch_-_The_Scream_-_Google_Art_Project.jpg',                         title:'The Scream',                     artist:'Edvard Munch',            year:'1893'},
    {file:'Michelangelo_-_Creation_of_Adam_(cropped).jpg',                              title:'The Creation of Adam',           artist:'Michelangelo',            year:'c. 1512'},
  ];

  function fetchCommonsArt() {
    if (_cache && _cache.commonsart) { renderCommonsArt(_cache.commonsart); return; }
    var mw = MASTERWORKS[dayOfYear() % MASTERWORKS.length];
    fetch$('https://commons.wikimedia.org/w/api.php?action=query&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*&titles=File:' + encodeURIComponent(mw.file))
      .then(function (data) {
        var pages = data.query && data.query.pages;
        var page  = pages && Object.values(pages)[0];
        var ii    = page && page.imageinfo && page.imageinfo[0];
        if (!ii || !ii.thumburl) throw new Error('no image');
        var result = { src: ii.thumburl, title: mw.title, artist: mw.artist, year: mw.year, file: mw.file };
        setCache('commonsart', result);
        renderCommonsArt(result);
      })
      .catch(function () {
        document.getElementById('art-title').textContent = 'Artwork unavailable';
        document.getElementById('art-noimgwrap').classList.remove('hidden');
        document.getElementById('art-img').style.opacity = '0';
      });
  }

  function renderCommonsArt(result) {
    var el   = document.getElementById('art-img');
    var noEl = document.getElementById('art-noimgwrap');
    el.onerror = function () { el.style.opacity = '0'; noEl.classList.remove('hidden'); };
    el.src = result.src;
    el.alt = result.title;
    el.style.opacity = '1';
    noEl.classList.add('hidden');
    document.getElementById('art-title').textContent = result.title;
    document.getElementById('art-desc').textContent  = result.artist + ' · ' + result.year;
    document.getElementById('art-link').href = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(result.file);
  }

  // ── GBIF Observation ──────────────────────────────────────

  function fetchGbif() {
    if (_cache && _cache.gbif) { renderGbif(_cache.gbif); return; }
    var offset = (dayOfYear() * 7 + 3) % 900;
    fetch$('https://api.gbif.org/v1/occurrence/search?hasCoordinate=true&mediaType=StillImage&hasImage=true&limit=1&offset=' + offset)
      .then(function (data) {
        var occ = data.results && data.results[0];
        if (!occ) throw new Error('empty');
        setCache('gbif', occ);
        renderGbif(occ);
      })
      .catch(function () {
        document.getElementById('gbif-title').textContent = 'Failed to load';
        document.getElementById('gbif-img').style.opacity = '0';
        document.getElementById('gbif-noimgwrap').classList.remove('hidden');
      });
  }

  function renderGbif(occ) {
    var img = document.getElementById('gbif-img');
    var noImgWrap = document.getElementById('gbif-noimgwrap');
    var imgUrl = occ.media && occ.media[0] && occ.media[0].identifier;
    if (imgUrl) {
      img.src = imgUrl;
      img.alt = occ.species || occ.scientificName || '';
      img.style.opacity = '1';
      noImgWrap.classList.add('hidden');
    } else {
      img.style.opacity = '0';
      noImgWrap.classList.remove('hidden');
    }
    var sci = occ.species || occ.scientificName || 'Unknown species';
    var common = occ.vernacularName || '';
    document.getElementById('gbif-title').textContent = common ? common + ' (' + sci + ')' : sci;
    var loc = [occ.stateProvince, occ.country].filter(Boolean).join(', ');
    var date = occ.eventDate ? occ.eventDate.slice(0, 10) : (occ.year ? String(occ.year) : '');
    document.getElementById('gbif-desc').textContent = [loc, date].filter(Boolean).join(' · ');
    var tax = [occ.kingdom, occ.phylum, occ.class, occ.family].filter(Boolean).join(' › ');
    var observer = occ.recordedBy ? 'obs. ' + occ.recordedBy.split(';')[0].trim() : '';
    document.getElementById('gbif-meta').textContent = [tax, observer].filter(Boolean).join(' · ');
    document.getElementById('gbif-link').href = 'https://www.gbif.org/occurrence/' + occ.key;
  }

  // ── iNaturalist ───────────────────────────────────────────

  function fetchInat() {
    if (_cache && _cache.inat) { renderInat(_cache.inat); return; }
    var yest = yesterdayStr();
    fetch$('https://api.inaturalist.org/v1/observations?iconic_taxa[]=Actinopterygii&quality_grade=research&d1=' + yest + '&d2=' + yest + '&order_by=votes&per_page=1')
      .then(function (data) {
        var obs = data.results && data.results[0];
        if (!obs) return fetch$('https://api.inaturalist.org/v1/observations?iconic_taxa[]=Actinopterygii&quality_grade=research&order_by=votes&per_page=1')
          .then(function (d2) { return d2.results && d2.results[0]; });
        return obs;
      })
      .then(function (obs) {
        if (!obs) throw new Error('none');
        setCache('inat', obs);
        renderInat(obs);
      })
      .catch(function () {
        document.getElementById('inat-title').textContent = 'No sighting found';
        document.getElementById('inat-img').style.opacity = '0';
        document.getElementById('inat-noimgwrap').classList.remove('hidden');
      });
  }

  function renderInat(obs) {
    var img = document.getElementById('inat-img');
    var noImgWrap = document.getElementById('inat-noimgwrap');
    var photo = obs.photos && obs.photos[0];
    var imgUrl = photo ? photo.url.replace('square', 'medium') : null;
    if (imgUrl) {
      img.src = imgUrl;
      img.alt = (obs.taxon && obs.taxon.name) || '';
      img.style.opacity = '1';
      noImgWrap.classList.add('hidden');
    } else {
      img.style.opacity = '0';
      noImgWrap.classList.remove('hidden');
    }
    var taxon = obs.taxon || {};
    var common = taxon.preferred_common_name || taxon.name || 'Unknown';
    var sci = taxon.name || '';
    document.getElementById('inat-title').textContent = common + (common !== sci && sci ? ' (' + sci + ')' : '');
    document.getElementById('inat-desc').textContent = [obs.place_guess, obs.observed_on].filter(Boolean).join(' · ');
    document.getElementById('inat-link').href = 'https://www.inaturalist.org/observations/' + obs.id;
  }

  // ── Earthquake ────────────────────────────────────────────

  function fetchQuake() {
    if (_cache && _cache.quake) { renderQuake(_cache.quake); return; }
    fetch$('https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=' + yesterdayStr() + 'T00:00:00&endtime=' + todayStr() + 'T00:00:00&orderby=magnitude&limit=1&minmagnitude=2.5')
      .then(function (data) {
        var f = data.features && data.features[0];
        if (!f) throw new Error('none');
        setCache('quake', f); renderQuake(f);
      })
      .catch(function () { document.getElementById('quake-body').innerHTML = '<div class="dw-error">No significant earthquakes found for yesterday.</div>'; });
  }

  function renderQuake(f) {
    var p = f.properties;
    var mag = parseFloat(p.mag).toFixed(1);
    var coords = f.geometry && f.geometry.coordinates;
    var depth = coords ? parseFloat(coords[2]).toFixed(0) + ' km deep' : '';
    var time = p.time ? new Date(p.time).toUTCString() : '';
    var cls = parseFloat(mag) >= 6 ? 'dw-mag-high' : parseFloat(mag) >= 4 ? 'dw-mag-med' : 'dw-mag-low';
    document.getElementById('quake-body').innerHTML =
      '<div class="dw-quake-row"><span class="dw-mag ' + cls + '">M' + mag + '</span><span class="dw-quake-place">' + esc(p.place || 'Unknown') + '</span></div>' +
      (time ? '<div class="dw-meta">' + esc(time) + (depth ? ' · ' + esc(depth) : '') + '</div>' : '') +
      '<div class="dw-meta"><a href="' + esc(p.url) + '" target="_blank" rel="noopener">USGS Details</a></div>';
  }

  // ── Wikipedia On This Day ─────────────────────────────────

  function fetchWiki() {
    if (_cache && _cache.wiki) { renderWiki(_cache.wiki); return; }
    var now = new Date();
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var dd = String(now.getDate()).padStart(2, '0');
    fetch$('https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/' + mm + '/' + dd)
      .then(function (data) {
        var events = (data.events || []).slice(0, 5);
        setCache('wiki', events); renderWiki(events);
      })
      .catch(function () { document.getElementById('wiki-body').innerHTML = '<div class="dw-error">Failed to load Wikipedia.</div>'; });
  }

  function renderWiki(events) {
    var html = '<div class="dw-tech-grid">';
    events.forEach(function (ev) {
      var page = ev.pages && ev.pages[0];
      var url = page ? 'https://en.wikipedia.org/wiki/' + encodeURIComponent(page.title) : null;
      var wikTxt = url ? '<a href="' + url + '" target="_blank" rel="noopener">' + esc(ev.text) + '</a>' : esc(ev.text);
      html += '<div class="dw-tech-ev"><span class="dw-wiki-yr">' + esc(String(ev.year)) + '</span><span class="dw-wiki-txt">' + wikTxt + '</span></div>';
    });
    html += '</div>';
    document.getElementById('wiki-body').innerHTML = html;
  }

  // ── Word of the Day ───────────────────────────────────────

  function fetchWord() {
    if (_cache && _cache.word) { renderWord(_cache.word); return; }
    var word = WORDS[dayOfYear() % WORDS.length];
    fetch$('https://api.dictionaryapi.dev/api/v2/entries/en/' + word)
      .then(function (data) {
        var payload = { word: word, entry: data[0] || null };
        setCache('word', payload); renderWord(payload);
      })
      .catch(function () { renderWord({ word: word, entry: null }); });
  }

  function renderWord(data) {
    var html = '<div class="dw-word-title">' + esc(data.word) + '</div>';
    var entry = data.entry;
    if (entry) {
      var phon = entry.phonetic || ((entry.phonetics || []).find(function(p){return p.text;}) || {}).text || '';
      if (phon) html += '<div class="dw-word-phonetic">' + esc(phon) + '</div>';
      (entry.meanings || []).slice(0, 2).forEach(function (m) {
        html += '<div class="dw-word-pos">' + esc(m.partOfSpeech) + '</div>';
        var def = m.definitions && m.definitions[0];
        if (def) {
          html += '<div class="dw-word-def">' + esc(def.definition) + '</div>';
          if (def.example) html += '<div class="dw-word-ex">"' + esc(def.example) + '"</div>';
        }
      });
    }
    html += '<div class="dw-meta" style="margin-top:10px;"><a href="https://www.merriam-webster.com/dictionary/' + encodeURIComponent(data.word) + '" target="_blank" rel="noopener">Merriam-Webster</a></div>';
    document.getElementById('word-body').innerHTML = html;
  }

  // ── GitHub Trending ───────────────────────────────────────

  function fetchGithub() {
    if (_cache && _cache.github) { renderGithub(_cache.github); return; }
    fetch$('https://api.github.com/search/repositories?q=created:>' + yesterdayStr() + '&sort=stars&order=desc&per_page=1')
      .then(function (data) {
        var repo = data.items && data.items[0];
        if (!repo) throw new Error('none');
        setCache('github', repo); renderGithub(repo);
      })
      .catch(function () { document.getElementById('github-body').innerHTML = '<div class="dw-error">Failed to load GitHub.</div>'; });
  }

  function renderGithub(repo) {
    document.getElementById('github-body').innerHTML =
      '<div class="dw-repo-name"><a href="' + esc(repo.html_url) + '" target="_blank" rel="noopener">' + esc(repo.full_name) + '</a></div>' +
      '<div class="dw-repo-desc">' + esc(repo.description || 'No description.') + '</div>' +
      '<div class="dw-stats-row">' +
        '<span>⭐ ' + (repo.stargazers_count || 0).toLocaleString() + '</span>' +
        '<span>🍴 ' + (repo.forks_count || 0).toLocaleString() + '</span>' +
        (repo.language ? '<span>💻 ' + esc(repo.language) + '</span>' : '') +
      '</div>';
  }

  // ── HackerNews ────────────────────────────────────────────

  function fetchHN() {
    if (_cache && _cache.hn) { renderHN(_cache.hn); return; }
    fetch$('https://hacker-news.firebaseio.com/v0/topstories.json')
      .then(function (ids) { return fetch$('https://hacker-news.firebaseio.com/v0/item/' + ids[0] + '.json'); })
      .then(function (s) { setCache('hn', s); renderHN(s); })
      .catch(function () { document.getElementById('hn-body').innerHTML = '<div class="dw-error">Failed to load HackerNews.</div>'; });
  }

  function renderHN(s) {
    var domain = '';
    try { if (s.url) domain = new URL(s.url).hostname.replace(/^www\./, ''); } catch(e) {}
    var hrs = s.time ? Math.round((Date.now() / 1000 - s.time) / 3600) : null;
    document.getElementById('hn-body').innerHTML =
      '<div class="dw-hn-title"><a href="' + esc(s.url || 'https://news.ycombinator.com/item?id=' + s.id) + '" target="_blank" rel="noopener">' + esc(s.title) + '</a></div>' +
      (domain ? '<div class="dw-meta">' + esc(domain) + '</div>' : '') +
      '<div class="dw-stats-row">' +
        '<span>▲ ' + (s.score||0) + ' pts</span>' +
        '<span>💬 ' + (s.descendants||0) + ' comments</span>' +
        '<span>by ' + esc(s.by||'') + '</span>' +
        (hrs !== null ? '<span>' + hrs + 'h ago</span>' : '') +
      '</div>' +
      '<div class="dw-meta" style="margin-top:6px;"><a href="https://news.ycombinator.com/item?id=' + s.id + '" target="_blank" rel="noopener">HN Discussion</a></div>';
  }

  // ── Tech History ──────────────────────────────────────────

  function fetchTechHistory() {
    if (_cache && _cache.tech) { renderTechHistory(_cache.tech); return; }
    var now = new Date();
    var mm = String(now.getMonth() + 1).padStart(2, '0');
    var dd = String(now.getDate()).padStart(2, '0');
    fetch$('https://en.wikipedia.org/api/rest_v1/feed/onthisday/events/' + mm + '/' + dd)
      .then(function (data) {
        var events = data.events || [];
        var tech = events.filter(function (ev) {
          var t = (ev.text || '').toLowerCase();
          return TECH_KW.some(function (k) { return t.indexOf(k) !== -1; });
        });
        tech.sort(function (a, b) { return b.year - a.year; });
        var picks = tech.length ? tech.slice(0, 6) : events.slice(0, 5);
        setCache('tech', picks); renderTechHistory(picks);
      })
      .catch(function () { document.getElementById('tech-body').innerHTML = '<div class="dw-error">Failed to load tech history.</div>'; });
  }

  function renderTechHistory(events) {
    if (!events || !events.length) {
      document.getElementById('tech-body').innerHTML = '<div class="dw-error">No events found for today.</div>';
      return;
    }
    var html = '<div class="dw-tech-grid">';
    events.forEach(function (ev) {
      var page = ev.pages && ev.pages[0];
      var url = page ? 'https://en.wikipedia.org/wiki/' + encodeURIComponent(page.title) : null;
      var techTxt = url ? '<a href="' + url + '" target="_blank" rel="noopener">' + esc(ev.text||'') + '</a>' : esc(ev.text||'');
      html += '<div class="dw-tech-ev"><span class="dw-wiki-yr">' + esc(String(ev.year||'')) + '</span><span class="dw-wiki-txt">' + techTxt + '</span></div>';
    });
    html += '</div>';
    document.getElementById('tech-body').innerHTML = html;
  }

  // ── ISS ───────────────────────────────────────────────────

  var SPEEDO = '<svg width="13" height="8" viewBox="0 0 13 8" style="vertical-align:middle;margin-right:2px;" xmlns="http://www.w3.org/2000/svg"><path d="M1 7.5 A 5.5 5.5 0 0 1 12 7.5" fill="none" stroke="rgba(140,200,255,0.55)" stroke-width="1.5" stroke-linecap="round"/><line x1="6.5" y1="7.5" x2="10.5" y2="2.8" stroke="rgba(255,160,80,0.9)" stroke-width="1.5" stroke-linecap="round"/><circle cx="6.5" cy="7.5" r="1.1" fill="rgba(255,255,255,0.75)"/></svg>';

  var COAST = [
    [[-6,36],[14,37],[25,33],[33,31],[37,22],[43,12],[51,11],[44,3],[40,-12],[36,-22],[34,-26],[27,-34],[19,-34],[12,-28],[12,-18],[9,-2],[2,4],[-8,5],[-15,10],[-17,14],[-17,21],[-13,27],[-6,36]],
    [[-9,36],[-9,44],[-5,48],[-2,52],[0,52],[5,54],[8,55],[14,55]],
    [[14,55],[8,55],[5,58],[5,62],[16,70],[26,72],[28,64],[22,60],[18,56],[14,55]],
    [[-9,36],[4,37],[8,44],[16,47],[20,42],[22,38],[25,37],[22,36],[26,40],[30,40],[36,36],[36,28],[38,22]],
    [[28,72],[45,70],[60,73],[80,74],[100,76],[120,73],[140,72],[145,62]],
    [[145,62],[140,54],[132,42],[126,35],[120,30],[108,22],[100,14],[102,3],[104,-2]],
    [[38,22],[45,12],[52,12],[58,22],[65,25],[72,20],[77,8]],
    [[80,8],[87,22],[80,25],[65,25]],
    [[-170,63],[-168,72],[-140,70],[-140,60],[-130,54],[-126,50],[-124,37],[-117,32],[-106,22],[-87,15],[-83,8],[-78,8],[-77,26],[-80,32],[-80,40],[-74,40],[-70,42],[-66,44],[-60,46],[-55,50],null,[-65,44],[-68,46],[-58,52],[-64,60],[-78,63],[-80,66],[-90,72],[-110,74],[-120,70],[-130,68],[-150,60],[-160,58],[-165,62],[-170,63]],
    [[-44,60],[-20,62],[-16,70],[-22,76],[-40,84],[-52,82],[-58,77],[-60,74],[-52,67],[-44,60]],
    [[-75,12],[-62,10],[-50,0],[-48,-28],[-52,-34],[-58,-38],[-62,-52],[-68,-56],[-72,-50],[-76,-50],[-72,-40],[-72,-28],[-70,-18],[-80,-6],[-75,-2],[-72,5],[-75,12]],
    [[114,-22],[120,-14],[130,-12],[136,-12],[138,-36],[141,-38],[150,-38],[152,-25],[150,-22],[145,-14],[140,-10],[130,-12],[120,-14],[114,-22]],
    [[-180,-72],[-120,-72],[-60,-72],[0,-70],[60,-72],[120,-70],[180,-72]]
  ];

  function buildGlobe(lat0deg, lon0deg, bearing) {
    var R = 85, cx = 100, cy = 100;
    var lat0 = lat0deg * Math.PI / 180;
    var lon0 = lon0deg * Math.PI / 180;

    function proj(latd, lond) {
      var la = latd * Math.PI / 180;
      var lo = lond * Math.PI / 180;
      var cosc = Math.sin(lat0)*Math.sin(la) + Math.cos(lat0)*Math.cos(la)*Math.cos(lo-lon0);
      if (cosc < 0) return null;
      return [
        cx + R*Math.cos(la)*Math.sin(lo-lon0),
        cy - R*(Math.cos(lat0)*Math.sin(la) - Math.sin(lat0)*Math.cos(la)*Math.cos(lo-lon0))
      ];
    }

    function segs(pts, stroke, sw) {
      var out = '', seg = [];
      for (var i = 0; i < pts.length; i++) {
        if (pts[i]) { seg.push(pts[i]); }
        else if (seg.length > 1) {
          out += '<polyline clip-path="url(#gc)" points="' + seg.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ') + '" fill="none" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
          seg = [];
        } else { seg = []; }
      }
      if (seg.length > 1) out += '<polyline clip-path="url(#gc)" points="' + seg.map(function(p){return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ') + '" fill="none" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
      return out;
    }

    var s = '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;">';
    s += '<defs><clipPath id="gc"><circle cx="' + cx + '" cy="' + cy + '" r="' + R + '"/></clipPath></defs>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (R+9) + '" fill="none" stroke="rgba(60,120,255,0.10)" stroke-width="9"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="rgba(8,20,60,0.78)"/>';
    for (var ci = 0; ci < COAST.length; ci++) {
      var cpts = COAST[ci].map(function(p) { return p ? proj(p[1], p[0]) : null; });
      s += segs(cpts, 'rgba(80,195,115,0.72)', 0.85);
    }
    var gc = 'rgba(60,120,220,0.22)';
    for (var lat = -60; lat <= 60; lat += 30) {
      var pts = [];
      for (var lo = -180; lo <= 181; lo += 3) pts.push(lo <= 180 ? proj(lat, lo) : null);
      s += segs(pts, gc, 0.6);
    }
    for (var lon = -150; lon < 180; lon += 30) {
      var pts2 = [];
      for (var la = -88; la <= 89; la += 3) pts2.push(proj(la, lon));
      pts2.push(null);
      s += segs(pts2, gc, 0.6);
    }
    var eq = [];
    for (var elo = -180; elo <= 181; elo += 2) eq.push(elo <= 180 ? proj(0, elo) : null);
    s += segs(eq, 'rgba(80,160,255,0.38)', 0.9);
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + R + '" fill="none" stroke="rgba(80,150,255,0.4)" stroke-width="1.5"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="10" fill="rgba(255,60,60,0.13)"/>';
    if (bearing != null) {
      var br = bearing * Math.PI / 180;
      var sinB = Math.sin(br), cosB = Math.cos(br);
      var L = 20;
      var sx = cx + 6*sinB, sy = cy - 6*cosB;
      var tx = cx + L*sinB, ty = cy - L*cosB;
      var wx1 = tx - sinB*5 + cosB*3.5, wy1 = ty + cosB*5 + sinB*3.5;
      var wx2 = tx - sinB*5 - cosB*3.5, wy2 = ty + cosB*5 - sinB*3.5;
      s += '<line x1="' + sx.toFixed(1) + '" y1="' + sy.toFixed(1) + '" x2="' + tx.toFixed(1) + '" y2="' + ty.toFixed(1) + '" stroke="rgba(255,215,70,0.92)" stroke-width="1.5" stroke-linecap="round"/>';
      s += '<polygon points="' + tx.toFixed(1) + ',' + ty.toFixed(1) + ' ' + wx1.toFixed(1) + ',' + wy1.toFixed(1) + ' ' + wx2.toFixed(1) + ',' + wy2.toFixed(1) + '" fill="rgba(255,215,70,0.95)"/>';
    }
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="5" fill="rgba(255,70,70,0.95)"/>';
    s += '</svg>';
    return s;
  }

  function fetchISS() {
    var now = Math.floor(Date.now() / 1000);
    Promise.all([
      fetch$('https://api.wheretheiss.at/v1/satellites/25544'),
      fetch$('https://api.wheretheiss.at/v1/satellites/25544?timestamp=' + (now + 60))
    ]).then(function (r) {
      var la1 = parseFloat(r[0].latitude) * Math.PI / 180;
      var lo1 = parseFloat(r[0].longitude) * Math.PI / 180;
      var la2 = parseFloat(r[1].latitude) * Math.PI / 180;
      var lo2 = parseFloat(r[1].longitude) * Math.PI / 180;
      var y = Math.sin(lo2-lo1)*Math.cos(la2);
      var x = Math.cos(la1)*Math.sin(la2) - Math.sin(la1)*Math.cos(la2)*Math.cos(lo2-lo1);
      var brg = Math.atan2(y, x) * 180 / Math.PI;
      renderISS(r[0], brg);
    }).catch(function () {
      document.getElementById('iss-body').innerHTML = '<div class="dw-error">ISS data unavailable.</div>';
    });
    fetch$('https://api.open-notify.org/astros.json')
      .then(function (data) {
        var aboard = (data.people || []).filter(function (p) { return p.craft === 'ISS'; });
        document.getElementById('iss-crew').textContent =
          aboard.length + ' aboard: ' + aboard.map(function (p) { return p.name; }).join(', ');
      })
      .catch(function () {});
  }

  function renderISS(data, brg) {
    var lat = parseFloat(data.latitude);
    var lon = parseFloat(data.longitude);
    var latStr = Math.abs(lat).toFixed(2) + '° ' + (lat >= 0 ? 'N' : 'S');
    var lonStr = Math.abs(lon).toFixed(2) + '° ' + (lon >= 0 ? 'E' : 'W');
    var alt = Math.round(parseFloat(data.altitude));
    var vel = Math.round(parseFloat(data.velocity)).toLocaleString();
    var vis = data.visibility === 'daylight' ? '☀️ Daylit' : '🌑 Eclipsed';
    var updated = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    document.getElementById('iss-body').innerHTML =
      '<div style="font-size:15px;font-weight:500;color:rgba(255,255,255,0.9);margin-bottom:8px;">' + latStr + ', ' + lonStr + '</div>' +
      '<div class="dw-stats-row">' +
        '<span>⬆ ' + alt + ' km</span>' +
        '<span>' + SPEEDO + ' ' + vel + ' km/h</span>' +
        '<span>' + vis + '</span>' +
      '</div>' +
      '<div style="text-align:right;font-size:10px;color:rgba(255,255,255,0.2);margin-top:10px;">as of ' + updated + '</div>';
    document.getElementById('iss-globe').innerHTML = buildGlobe(lat, lon, brg);
  }

  // ── Init ──────────────────────────────────────────────────

  document.addEventListener('DOMContentLoaded', function () {
    initCache();

    document.getElementById('w-date').textContent =
      new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

    // Carousel
    var carousel = document.getElementById('discovery-carousel');
    document.querySelector('.dw-prev').addEventListener('click', function () { resetAuto(); gotoSlide(_slide - 1); });
    document.querySelector('.dw-next').addEventListener('click', function () { resetAuto(); gotoSlide(_slide + 1); });
    document.querySelectorAll('.dw-dot').forEach(function (d) {
      d.addEventListener('click', function () { resetAuto(); gotoSlide(parseInt(d.dataset.slide, 10)); });
    });

    var _tx = 0;
    carousel.addEventListener('touchstart', function (e) { _tx = e.touches[0].clientX; }, { passive: true });
    carousel.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - _tx;
      if (Math.abs(dx) > 40) { resetAuto(); gotoSlide(_slide + (dx < 0 ? 1 : -1)); }
    }, { passive: true });

    startAuto();

    // Weather ticker
    var savedZip = '';
    try { savedZip = localStorage.getItem('pm_daily_zip') || ''; } catch(e) {}
    if (savedZip) { loadWeather(savedZip); } else { showZipPrompt(); }

    document.getElementById('zip-submit').addEventListener('click', function () {
      var val = (document.getElementById('zip-input').value || '').trim();
      if (/^\d{5}$/.test(val)) {
        try { localStorage.setItem('pm_daily_zip', val); } catch(e) {}
        loadWeather(val);
      }
    });
    document.getElementById('zip-input').addEventListener('keydown', function (e) {
      if (e.key === 'Enter') document.getElementById('zip-submit').click();
    });
    document.getElementById('zip-change').addEventListener('click', function () {
      try { localStorage.removeItem('pm_daily_zip'); } catch(e) {}
      showZipPrompt();
      document.getElementById('zip-input').value = '';
      document.getElementById('zip-input').focus();
    });

    // Load all concurrently
    fetchApod();
    fetchWikiPotd();
    fetchNasaLib();
    fetchCommonsArt();
    fetchGbif();
    fetchInat();
    fetchQuake();
    fetchWiki();
    fetchWord();
    fetchGithub();
    fetchHN();
    fetchTechHistory();
    fetchISS();
  });

}());
