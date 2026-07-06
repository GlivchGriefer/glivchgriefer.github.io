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
    startTickerCycle();
    document.getElementById('w-icon').textContent = '⏳';
    document.getElementById('w-desc').textContent = 'Loading…';
    document.getElementById('w-loc').textContent = '';
    document.getElementById('w-temp').textContent = '';

    fetch$('https://api.zippopotam.us/us/' + zip)
      .then(function (z) {
        var p = z.places[0];
        var city = p['place name'] + ', ' + p['state abbreviation'];
        var lat = parseFloat(p.latitude), lon = parseFloat(p.longitude);
        try { localStorage.setItem('pm_daily_latlon', JSON.stringify([lat, lon])); } catch (e) {}
        fetchAirQuality(lat, lon);
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
      .catch(function () {
        var el = document.getElementById('tick-quake-place');
        if (el) el.textContent = 'no data';
      });
  }

  function renderQuake(f) {
    var p = f.properties;
    var mag = parseFloat(p.mag).toFixed(1);
    var magEl   = document.getElementById('tick-quake-mag');
    var placeEl = document.getElementById('tick-quake-place');
    if (magEl)   magEl.textContent   = 'M' + mag;
    if (placeEl) placeEl.textContent = p.place || 'Unknown';
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
    feedQuizPool(events);
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
    var entry = data.entry;
    var pos = '', def = '';
    if (entry && entry.meanings && entry.meanings[0]) {
      pos = entry.meanings[0].partOfSpeech || '';
      var d = entry.meanings[0].definitions && entry.meanings[0].definitions[0];
      if (d) def = d.definition || '';
    }
    document.getElementById('word-body').innerHTML =
      '<a class="dw-word-thin-word" href="https://www.merriam-webster.com/dictionary/' + encodeURIComponent(data.word) + '" target="_blank" rel="noopener">' + esc(data.word) + '</a>' +
      (pos ? '<span class="dw-word-thin-pos">' + esc(pos) + '</span>' : '') +
      (def ? '<span class="dw-word-thin-def">' + esc(def) + '</span>' : '');
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
    feedQuizPool(events);
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

  // ── Trivia Quiz ───────────────────────────────────────────

  var _quizPool = null;
  var _quizQ    = [];
  var _quizIdx  = 0;
  var _quizScore = 0;
  var _quizLocked = false;

  function feedQuizPool(events) {
    if (_quizPool === null) _quizPool = [];
    events.forEach(function (ev) {
      var yr  = parseInt(ev.year, 10);
      var txt = ev.text ? ev.text.replace(/<[^>]+>/g, '') : '';
      if (yr > 0 && yr <= 2024 && txt.length > 20) {
        _quizPool.push({ year: yr, text: txt });
      }
    });
    if (_quizPool.length >= 5 && _quizQ.length === 0) buildQuiz();
  }

  function buildQuiz() {
    var pool = _quizPool.slice().sort(function () { return Math.random() - 0.5; });
    _quizQ = pool.slice(0, 5).map(function (ev) {
      var correct = ev.year;
      var range = correct > 1800 ? 25 : correct > 1400 ? 80 : 150;
      var wrongs = [], attempts = 0;
      while (wrongs.length < 3 && attempts < 60) {
        attempts++;
        var offset = Math.floor(Math.random() * range) + 5;
        var w = correct + (Math.random() < 0.5 ? -offset : offset);
        if (w > 0 && w !== correct && wrongs.indexOf(w) === -1) wrongs.push(w);
      }
      while (wrongs.length < 3) wrongs.push(correct + (wrongs.length + 1) * 17);
      var choices = [correct].concat(wrongs).sort(function (a, b) { return a - b; });
      return { text: ev.text.length > 150 ? ev.text.slice(0, 150) + '…' : ev.text, correct: correct, choices: choices };
    });
    _quizIdx = 0; _quizScore = 0; _quizLocked = false;
    document.getElementById('quiz-loading').classList.add('hidden');
    document.getElementById('quiz-result').classList.add('hidden');
    document.getElementById('quiz-game').classList.remove('hidden');
    showQuizQ();
  }

  function showQuizQ() {
    var q = _quizQ[_quizIdx];
    document.getElementById('quiz-bar').style.width = (_quizIdx / _quizQ.length * 100) + '%';
    document.getElementById('quiz-question').textContent = q.text;
    document.getElementById('quiz-status').textContent = 'Question ' + (_quizIdx + 1) + ' of ' + _quizQ.length;
    document.getElementById('quiz-next').classList.add('hidden');
    var choicesEl = document.getElementById('quiz-choices');
    choicesEl.innerHTML = '';
    q.choices.forEach(function (yr) {
      var btn = document.createElement('button');
      btn.className = 'dw-quiz-choice';
      btn.textContent = yr;
      btn.addEventListener('click', function () { if (!_quizLocked) answerQuiz(yr, btn); });
      choicesEl.appendChild(btn);
    });
  }

  function answerQuiz(yr, btn) {
    _quizLocked = true;
    var q = _quizQ[_quizIdx];
    if (yr === q.correct) _quizScore++;
    document.querySelectorAll('.dw-quiz-choice').forEach(function (b) {
      b.setAttribute('disabled', 'disabled');
      var byr = parseInt(b.textContent, 10);
      if (byr === q.correct) b.classList.add('correct');
      else if (byr === yr && yr !== q.correct) b.classList.add('wrong');
    });
    document.getElementById('quiz-status').textContent =
      yr === q.correct ? '✓ Correct!' : '✗ The answer was ' + q.correct;
    if (_quizIdx < _quizQ.length - 1) {
      document.getElementById('quiz-next').classList.remove('hidden');
    } else {
      setTimeout(showQuizResult, 1300);
    }
  }

  function showQuizResult() {
    document.getElementById('quiz-game').classList.add('hidden');
    document.getElementById('quiz-result').classList.remove('hidden');
    document.getElementById('quiz-bar').style.width = '100%';
    var s = _quizScore, t = _quizQ.length;
    var em = ['😔','😐','🙂','😊','🎉','🏆'][Math.min(Math.round(s / t * 5), 5)];
    document.getElementById('quiz-score-display').innerHTML =
      em + '<br>' + s + ' / ' + t + ' correct<br>' +
      '<span style="font-size:13px;color:rgba(255,255,255,0.4);">' +
        (s === t ? 'Perfect!' : s === 0 ? 'Better luck next time.' : 'Not bad!') +
      '</span>';
  }

  // ── Space Weather (NOAA Kp) ───────────────────────────────

  function fetchSpaceWeather() {
    if (_cache && _cache.swx) { renderSpaceWeather(_cache.swx); return; }
    fetch$('https://services.swpc.noaa.gov/json/planetary_k_index_1m.json')
      .then(function (data) {
        var recent = data.slice(-60);
        var latest = recent[recent.length - 1];
        var kp = Math.round(parseFloat(latest.estimated_kp || latest.kp_index || 0));
        var older = recent[0];
        var kpNow  = parseFloat(latest.estimated_kp || 0);
        var kpPrev = parseFloat(older.estimated_kp || 0);
        var trend = kpNow > kpPrev + 0.5 ? 'rising' : kpNow < kpPrev - 0.5 ? 'falling' : 'steady';
        var result = { kp: kp, kp_exact: kpNow.toFixed(1), trend: trend };
        setCache('swx', result); renderSpaceWeather(result);
      })
      .catch(function () {
        var el = document.getElementById('tick-swx-level');
        if (el) el.textContent = 'unavailable';
      });
  }

  function renderSpaceWeather(data) {
    var LEVELS = ['Quiet','Quiet','Quiet','Quiet','Minor Watch','G1 Minor','G2 Moderate','G3 Strong','G4 Severe','G5 Extreme'];
    var arrow = { rising: '↑', falling: '↓', steady: '→' }[data.trend] || '→';
    var kpEl    = document.getElementById('tick-swx-kp');
    var lvlEl   = document.getElementById('tick-swx-level');
    var trendEl = document.getElementById('tick-swx-trend');
    if (kpEl)    kpEl.textContent    = 'Kp ' + data.kp_exact;
    if (lvlEl)   lvlEl.textContent   = LEVELS[Math.min(data.kp, 9)];
    if (trendEl) trendEl.textContent = arrow + ' ' + data.trend;
  }

  // ── Air Quality (Open-Meteo) ──────────────────────────────

  function fetchAirQuality(lat, lon) {
    if (!lat || !lon) return;
    if (_cache && _cache.aqi) { renderAirQuality(_cache.aqi); return; }
    fetch$('https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' + lat + '&longitude=' + lon + '&current=us_aqi,pm2_5,ozone')
      .then(function (data) {
        var c = data.current || {};
        var result = { aqi: c.us_aqi, pm25: c.pm2_5, ozone: c.ozone };
        setCache('aqi', result); renderAirQuality(result);
      })
      .catch(function () {
        var el = document.getElementById('tick-aqi-level');
        if (el) el.textContent = 'unavailable';
      });
  }

  function renderAirQuality(data) {
    var aqi = data.aqi || 0;
    var level;
    if      (aqi <= 50)  level = 'Good';
    else if (aqi <= 100) level = 'Moderate';
    else if (aqi <= 150) level = 'Unhealthy SG';
    else if (aqi <= 200) level = 'Unhealthy';
    else if (aqi <= 300) level = 'Very Unhealthy';
    else                 level = 'Hazardous';
    var valEl = document.getElementById('tick-aqi-val');
    var lvlEl = document.getElementById('tick-aqi-level');
    var pmEl  = document.getElementById('tick-aqi-pm');
    if (valEl) valEl.textContent = aqi;
    if (lvlEl) lvlEl.textContent = level;
    if (pmEl && data.pm25 != null) pmEl.textContent = 'PM2.5 ' + parseFloat(data.pm25).toFixed(1);
  }

  // ── xkcd Comic ───────────────────────────────────────────

  function fetchXkcd() {
    if (_cache && _cache.xkcd) { renderXkcd(_cache.xkcd); return; }
    fetch('xkcd-today.json?v=' + todayStr())
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) {
        if (!data || !data.num) { renderXkcdPending(); return; }
        setCache('xkcd', data); renderXkcd(data);
      })
      .catch(function () { renderXkcdPending(); });
  }

  function renderXkcdPending() {
    document.getElementById('xkcd-body').innerHTML =
      '<div class="dw-xkcd-pending">' +
        '<div style="font-size:32px;margin-bottom:10px;">📰</div>' +
        '<div style="font-size:12.5px;color:rgba(255,255,255,0.5);margin-bottom:14px;">Daily comic caches at midnight UTC via GitHub Actions.</div>' +
        '<div style="display:flex;gap:8px;flex-wrap:wrap;">' +
          '<a href="https://xkcd.com" target="_blank" rel="noopener" class="dw-gen-btn" style="text-decoration:none;">xkcd.com ↗</a>' +
          '<button class="dw-gen-btn" id="xkcd-shuffle-pending">↺ Random comic</button>' +
        '</div>' +
      '</div>';
    document.getElementById('xkcd-shuffle-pending').addEventListener('click', fetchXkcdRandom);
  }

  function renderXkcd(data) {
    document.getElementById('xkcd-body').innerHTML =
      '<div class="dw-xkcd-wrap">' +
        '<a href="https://xkcd.com/' + data.num + '/" target="_blank" rel="noopener">' +
          '<img class="dw-xkcd-img" src="' + esc(data.img) + '" alt="' + esc(data.alt) + '" title="' + esc(data.alt) + '" />' +
        '</a>' +
        '<div class="dw-xkcd-caption">' +
          '<div>' +
            '<span style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.85);">' + esc(data.safe_title || data.title) + '</span>' +
            ' <span style="font-size:10px;color:rgba(255,255,255,0.3);">#' + data.num + '</span>' +
            '<div class="dw-xkcd-alt">' + esc(data.alt) + '</div>' +
          '</div>' +
          '<div style="display:flex;gap:6px;flex-shrink:0;">' +
            '<a href="https://explainxkcd.com/' + data.num + '/" target="_blank" rel="noopener" class="dw-gen-btn" style="text-decoration:none;font-size:10px;padding:3px 10px;">Explain ↗</a>' +
            '<button id="xkcd-shuffle" class="dw-gen-btn" style="font-size:10px;padding:3px 10px;">↺ Random</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    document.getElementById('xkcd-shuffle').addEventListener('click', fetchXkcdRandom);
  }

  var _xkcdPool = null;

  function loadXkcdPool(callback) {
    if (_xkcdPool) { callback(_xkcdPool); return; }
    fetch('xkcd-pool.json?v=' + todayStr())
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (data) {
        if (!Array.isArray(data) || !data.length) throw new Error();
        _xkcdPool = data;
        callback(_xkcdPool);
      })
      .catch(function () { callback(null); });
  }

  function fetchXkcdRandom() {
    var btn = document.getElementById('xkcd-shuffle') || document.getElementById('xkcd-shuffle-pending');
    if (btn) { btn.disabled = true; btn.textContent = '⏳'; }
    loadXkcdPool(function (pool) {
      if (btn) { btn.disabled = false; btn.textContent = '↺ Random'; }
      if (!pool) {
        var body = document.getElementById('xkcd-body');
        if (body) body.insertAdjacentHTML('beforeend',
          '<div class="dw-error" style="margin-top:8px;">Pool not yet cached — run the GitHub Actions workflow once.</div>');
        return;
      }
      var comic = pool[Math.floor(Math.random() * pool.length)];
      renderXkcd(comic);
    });
  }

  // ── Upcoming Launches ─────────────────────────────────────

  function fetchLaunches() {
    if (_cache && _cache.launches) { renderLaunches(_cache.launches); return; }
    fetch$('https://fdo.rocketlaunch.live/json/launches/next/5')
      .then(function (data) {
        var results = data.result || [];
        if (!results.length) throw new Error('empty');
        setCache('launches', results); renderLaunches(results);
      })
      .catch(function () {
        document.getElementById('launches-body').innerHTML = '<div class="dw-error">Launch schedule unavailable.</div>';
      });
  }

  function renderLaunches(results) {
    var html = '';
    results.forEach(function (r) {
      var t0 = r.t0 || r.win_open;
      var timeStr = 'TBD';
      if (t0) {
        var dt   = new Date(t0);
        var diff = dt - Date.now();
        if (diff > 0 && diff < 7 * 86400000) {
          var days = Math.floor(diff / 86400000);
          var hrs  = Math.floor((diff % 86400000) / 3600000);
          var mins = Math.floor((diff % 3600000) / 60000);
          timeStr = 'T‑ ' + (days > 0 ? days + 'd ' + hrs + 'h' : hrs + 'h ' + mins + 'm');
        } else if (diff > 0) {
          timeStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } else {
          timeStr = dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
      }
      var vehicle  = r.vehicle  && r.vehicle.name  ? r.vehicle.name  : '';
      var pad      = r.pad      && r.pad.name      ? r.pad.name      : '';
      var provider = r.provider && r.provider.name ? r.provider.name : '';
      var meta     = [provider, vehicle].filter(Boolean).map(esc).join(' · ');
      html += '<div class="dw-launch-row">' +
        '<span class="dw-launch-time">' + esc(timeStr) + '</span>' +
        '<span class="dw-launch-name">' + esc(r.name || 'Unknown Mission') + '</span>' +
        (meta ? '<span class="dw-launch-meta">' + meta + '</span>' : '') +
        (pad  ? '<span class="dw-launch-pad">'  + esc(pad) + '</span>' : '') +
      '</div>';
    });
    document.getElementById('launches-body').innerHTML = html || '<div class="dw-error">No upcoming launches found.</div>';
  }

  // ── Background Canvas Art ────────────────────────────────

  var _bgStyle      = 0;
  var _bgOpacity    = 0.15;
  var _bgEnabled    = true;
  var _bgAnimFrame  = null;

  function initBgArt() {
    var canvas = document.getElementById('bg-canvas');
    if (!canvas) return;
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.opacity = _bgOpacity;
    regenBgArt();
    window.addEventListener('resize', function () {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      regenBgArt();
    });
  }

  function regenBgArt() {
    if (_bgAnimFrame) { cancelAnimationFrame(_bgAnimFrame); _bgAnimFrame = null; }
    var canvas = document.getElementById('bg-canvas');
    if (!canvas || !_bgEnabled) return;
    canvas.style.opacity = _bgOpacity;
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if      (_bgStyle === 0) runBgFlow(canvas, ctx);
    else if (_bgStyle === 1) runBgStars(canvas, ctx);
    else                     runBgWaves(canvas, ctx);
  }

  function runBgFlow(canvas, ctx) {
    var W = canvas.width, H = canvas.height;
    var particles = [];
    for (var i = 0; i < 280; i++) {
      particles.push({ x: Math.random() * W, y: Math.random() * H, age: Math.random() * 80 });
    }
    var t = 0;
    ctx.fillStyle = '#07091A';
    ctx.fillRect(0, 0, W, H);
    function step() {
      ctx.fillStyle = 'rgba(7,9,26,0.18)';
      ctx.fillRect(0, 0, W, H);
      for (var j = 0; j < particles.length; j++) {
        var p = particles[j];
        var angle = Math.sin(p.x * 0.006 + t) * Math.cos(p.y * 0.006 + t * 0.7) * Math.PI * 2;
        p.x += Math.cos(angle) * 1.2;
        p.y += Math.sin(angle) * 1.2;
        p.age++;
        if (p.x < 0 || p.x > W || p.y < 0 || p.y > H || p.age > 140) {
          p.x = Math.random() * W; p.y = Math.random() * H; p.age = 0;
        }
        var hue = (p.x / W * 200 + 180 + t * 30) % 360;
        ctx.fillStyle = 'hsla(' + hue + ',80%,65%,0.55)';
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
      }
      t += 0.006;
      _bgAnimFrame = requestAnimationFrame(step);
    }
    step();
  }

  function runBgStars(canvas, ctx) {
    var W = canvas.width, H = canvas.height;
    var CX = W / 2, CY = H / 2;
    var stars = [];
    for (var i = 0; i < 400; i++) {
      stars.push({ x: (Math.random() - 0.5) * W, y: (Math.random() - 0.5) * H, z: Math.random() * W });
    }
    ctx.fillStyle = '#020408';
    ctx.fillRect(0, 0, W, H);
    function step() {
      ctx.fillStyle = 'rgba(2,4,8,0.25)';
      ctx.fillRect(0, 0, W, H);
      for (var j = 0; j < stars.length; j++) {
        var s = stars[j];
        s.z -= 3.5;
        if (s.z <= 0) { s.x = (Math.random() - 0.5) * W; s.y = (Math.random() - 0.5) * H; s.z = W; }
        var sx = (s.x / s.z) * W + CX;
        var sy = (s.y / s.z) * H + CY;
        var r  = Math.max(0.4, (1 - s.z / W) * 2.8);
        var op = Math.min(1, (1 - s.z / W) * 1.6);
        ctx.fillStyle = 'rgba(180,210,255,' + op + ')';
        ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.fill();
      }
      _bgAnimFrame = requestAnimationFrame(step);
    }
    step();
  }

  function runBgWaves(canvas, ctx) {
    var W = canvas.width, H = canvas.height;
    var t = 0;
    function step() {
      ctx.fillStyle = '#050810';
      ctx.fillRect(0, 0, W, H);
      for (var l = 0; l < 6; l++) {
        var hue   = (l * 55 + t * 25) % 360;
        var amp   = H * (0.12 + l * 0.04);
        var freq  = 0.006 + l * 0.003;
        var phase = t + l * 0.9;
        ctx.beginPath();
        for (var x = 0; x <= W; x += 2) {
          var y = H / 2 + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase * 1.7) * amp * 0.4;
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'hsla(' + hue + ',75%,62%,' + (0.3 + l * 0.08) + ')';
        ctx.lineWidth = 1.5 + l * 0.3;
        ctx.stroke();
      }
      t += 0.018;
      _bgAnimFrame = requestAnimationFrame(step);
    }
    step();
  }

  // ── Ticker Panel Cycling ──────────────────────────────────

  var _tickerPanelIdx   = 0;
  var _tickerPanelTimer = null;
  var TICKER_PANELS = ['tick-panel-weather', 'tick-panel-aqi', 'tick-panel-swx', 'tick-panel-quake'];

  function showTickerPanel(idx) {
    _tickerPanelIdx = ((idx % TICKER_PANELS.length) + TICKER_PANELS.length) % TICKER_PANELS.length;
    TICKER_PANELS.forEach(function (id, i) {
      var el = document.getElementById(id);
      if (el) el.classList.toggle('active', i === _tickerPanelIdx);
    });
    document.querySelectorAll('.dw-tick-pdot').forEach(function (dot) {
      dot.classList.toggle('active', parseInt(dot.dataset.panel, 10) === _tickerPanelIdx);
    });
  }

  function startTickerCycle() {
    if (_tickerPanelTimer) clearInterval(_tickerPanelTimer);
    _tickerPanelTimer = setInterval(function () {
      showTickerPanel(_tickerPanelIdx + 1);
    }, 7000);
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

    // Quiz wiring
    document.getElementById('quiz-next').addEventListener('click', function () {
      _quizIdx++; _quizLocked = false;
      if (_quizIdx < _quizQ.length) showQuizQ();
    });
    document.getElementById('quiz-retry').addEventListener('click', function () {
      document.getElementById('quiz-result').classList.add('hidden');
      _quizQ = [];
      if (_quizPool && _quizPool.length >= 5) buildQuiz();
    });

    // Background art
    initBgArt();

    // Art nav controls — wired across desktop nav + mobile nav buttons
    document.querySelectorAll('.dw-art-style-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _bgStyle = parseInt(btn.dataset.style, 10);
        document.querySelectorAll('.dw-art-style-btn').forEach(function (b) {
          b.classList.toggle('active', b.dataset.style === btn.dataset.style);
        });
        regenBgArt();
      });
    });
    document.querySelectorAll('.dw-art-op-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _bgOpacity = parseFloat(btn.dataset.op);
        document.querySelectorAll('.dw-art-op-btn').forEach(function (b) {
          b.classList.toggle('active', b.dataset.op === btn.dataset.op);
        });
        var canvas = document.getElementById('bg-canvas');
        if (canvas && _bgEnabled) canvas.style.opacity = _bgOpacity;
      });
    });
    document.querySelectorAll('.dw-art-off-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        _bgEnabled = !_bgEnabled;
        var canvas = document.getElementById('bg-canvas');
        if (_bgEnabled) {
          regenBgArt();
          document.querySelectorAll('.dw-art-off-btn').forEach(function (b) { b.textContent = '● On'; });
        } else {
          if (_bgAnimFrame) { cancelAnimationFrame(_bgAnimFrame); _bgAnimFrame = null; }
          if (canvas) canvas.style.opacity = 0;
          document.querySelectorAll('.dw-art-off-btn').forEach(function (b) { b.textContent = '○ Off'; });
        }
      });
    });

    // Ticker panel dots
    document.querySelectorAll('.dw-tick-pdot').forEach(function (dot) {
      dot.addEventListener('click', function () {
        if (_tickerPanelTimer) clearInterval(_tickerPanelTimer);
        showTickerPanel(parseInt(dot.dataset.panel, 10));
        startTickerCycle();
      });
    });

    // Air quality from saved location
    var savedLatLon = null;
    try { savedLatLon = JSON.parse(localStorage.getItem('pm_daily_latlon')); } catch (e) {}
    if (savedLatLon && savedLatLon.length === 2) {
      fetchAirQuality(savedLatLon[0], savedLatLon[1]);
    }

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
    fetchSpaceWeather();
    fetchXkcd();
    fetchLaunches();
  });

}());
