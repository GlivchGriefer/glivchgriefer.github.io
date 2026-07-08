(function () {
  'use strict';

  // ── Source catalog ────────────────────────────────────────────
  var SOURCES = [
    // IMAGES
    { id:'smithsonian', name:'Smithsonian Open Access', org:'Smithsonian Institution',
      desc:'4.5M+ CC0 images, 3D models, and data from 19 Smithsonian museums and the National Zoo.',
      url:'https://www.si.edu/openaccess', cats:['images','3d'], license:'CC0', tier:1,
      count:'4.5M+', tags:['artifacts','history','art'] },
    { id:'nasa-img', name:'NASA Image & Video Library', org:'NASA',
      desc:'Hundreds of thousands of public domain images spanning all NASA missions and centers.',
      url:'https://images.nasa.gov', cats:['images','video'], license:'Public Domain', tier:1,
      count:'300k+', tags:['space','missions','planets'] },
    { id:'met', name:'Metropolitan Museum of Art', org:'The Met',
      desc:'470k+ high-res CC0 images of public domain artworks, free to download and use for any purpose.',
      url:'https://www.metmuseum.org/art/collection', cats:['images'], license:'CC0', tier:1,
      count:'470k+', tags:['art','paintings','sculpture'] },
    { id:'rijksmuseum', name:'Rijksmuseum Collection', org:'Rijksmuseum Amsterdam',
      desc:'700k+ high-resolution images of Dutch masterworks and cultural heritage, free to download.',
      url:'https://www.rijksmuseum.nl/en/rijksstudio', cats:['images'], license:'CC0', tier:1,
      count:'700k+', tags:['Dutch masters','Rembrandt','Vermeer'] },
    { id:'loc', name:'Library of Congress Prints & Photos', org:'Library of Congress',
      desc:'14M+ digitized photos, posters, maps, and drawings — the bulk of it public domain.',
      url:'https://www.loc.gov/pictures/', cats:['images','documents'], license:'Mixed', tier:3,
      count:'14M+', tags:['americana','history','posters'] },
    { id:'nypl', name:'NYPL Digital Collections', org:'New York Public Library',
      desc:'900k+ public domain items — maps, photographs, menus, ephemera — free to download.',
      url:'https://digitalcollections.nypl.org', cats:['images','documents'], license:'Public Domain', tier:1,
      count:'900k+', tags:['new york','maps','history'] },
    { id:'wikimedia', name:'Wikimedia Commons', org:'Wikimedia Foundation',
      desc:'90M+ freely usable media files — images, audio, and video. The world\'s open media repository.',
      url:'https://commons.wikimedia.org', cats:['images','audio','video'], license:'Mixed CC', tier:3,
      count:'90M+', tags:['global','encyclopedia','multilingual'] },
    { id:'europeana', name:'Europeana Collections', org:'Europeana Foundation',
      desc:'50M+ digitized items from European museums, galleries, archives, and libraries.',
      url:'https://www.europeana.eu', cats:['images','documents','audio','video'], license:'Mixed CC', tier:3,
      count:'50M+', tags:['europe','culture','heritage'] },
    { id:'british-library', name:'British Library Flickr', org:'British Library',
      desc:'Over 1M public domain historical images — illustrations, manuscripts, maps from the BL collections.',
      url:'https://www.flickr.com/photos/britishlibrary/', cats:['images'], license:'Public Domain', tier:1,
      count:'1M+', tags:['british','history','illustrations'] },
    { id:'rawpixel', name:'Rawpixel Public Domain', org:'Rawpixel',
      desc:'100k+ curated CC0 and public domain images — art, vintage illustrations, botanical prints.',
      url:'https://www.rawpixel.com/category/53/public-domain', cats:['images'], license:'CC0', tier:1,
      count:'100k+', tags:['vintage','illustrations','botanical'] },
    { id:'artic', name:'Art Institute of Chicago', org:'Art Institute of Chicago',
      desc:'100k+ CC0 high-resolution artworks spanning 5,000 years — searchable via public API.',
      url:'https://www.artic.edu/collection', cats:['images'], license:'CC0', tier:1,
      count:'100k+', tags:['paintings','sculpture','decorative arts'] },
    { id:'cleveland', name:'Cleveland Museum of Art', org:'Cleveland Museum of Art',
      desc:'68k+ open access artworks with free API — paintings, drawings, prints, and decorative arts.',
      url:'https://www.clevelandart.org/art/collection/search', cats:['images'], license:'CC0', tier:1,
      count:'68k+', tags:['paintings','drawings','prints'] },

    // AUDIO
    { id:'ncs', name:'NoCopyrightSounds', org:'NCS',
      desc:'1k+ free tracks across electronic genres for creators. Attribution required. Streaming-safe.',
      url:'https://ncs.io', cats:['audio'], license:'CC BY', tier:2,
      count:'1k+', tags:['electronic','EDM','creator-safe'] },
    { id:'fma', name:'Free Music Archive', org:'WFMU / Internet Archive',
      desc:'150k+ high-quality CC-licensed tracks across every genre, curated by radio stations and labels.',
      url:'https://freemusicarchive.org', cats:['audio'], license:'Mixed CC', tier:3,
      count:'150k+', tags:['music','all genres','indie'] },
    { id:'ccmixter', name:'ccMixter', org:'ccMixter',
      desc:'350k+ CC-licensed tracks with stems and samples, built for remixing and collaborative music.',
      url:'https://ccmixter.org', cats:['audio'], license:'CC BY-NC', tier:4,
      count:'350k+', tags:['stems','remix','samples'] },
    { id:'freesound', name:'Freesound', org:'Universitat Pompeu Fabra',
      desc:'600k+ CC-licensed sound effects, field recordings, and ambiences. API access available.',
      url:'https://freesound.org', cats:['audio'], license:'Mixed CC', tier:3,
      count:'600k+', tags:['SFX','field recordings','ambient'] },
    { id:'musopen', name:'Musopen', org:'Musopen',
      desc:'40k+ public domain classical music recordings and scores — royalty-free and downloadable.',
      url:'https://musopen.org', cats:['audio'], license:'Public Domain', tier:1,
      count:'40k+', tags:['classical','orchestral','scores'] },
    { id:'ia-audio', name:'Internet Archive Audio', org:'Internet Archive',
      desc:'14M+ audio files — live concerts, old-time radio, spoken word, and historical recordings.',
      url:'https://archive.org/details/audio', cats:['audio'], license:'Mixed', tier:3,
      count:'14M+', tags:['concerts','radio','historical'] },
    { id:'bensound', name:'Bensound', org:'Bensound',
      desc:'Royalty-free music for video, film, and multimedia. Wide genre coverage with CC BY licensing.',
      url:'https://www.bensound.com', cats:['audio'], license:'CC BY', tier:2,
      count:'200+', tags:['cinematic','ambient','corporate'] },

    // VIDEO
    { id:'ia-video', name:'Internet Archive Video', org:'Internet Archive',
      desc:'Millions of freely viewable videos — classic films, news broadcasts, educational content.',
      url:'https://archive.org/details/movies', cats:['video'], license:'Mixed', tier:3,
      count:'10M+', tags:['films','news','historical'] },
    { id:'coverr', name:'Coverr', org:'Coverr',
      desc:'1k+ CC0 cinematic stock video clips for creative projects and web backgrounds.',
      url:'https://coverr.co', cats:['video'], license:'CC0', tier:1,
      count:'1k+', tags:['stock','cinematic','backgrounds'] },
    { id:'pexels-video', name:'Pexels Videos', org:'Pexels',
      desc:'50k+ free HD and 4K stock video clips. No attribution required.',
      url:'https://www.pexels.com/videos/', cats:['video'], license:'Free to use', tier:2,
      count:'50k+', tags:['stock','HD','4K','lifestyle'] },
    { id:'videvo', name:'Videvo', org:'Videvo',
      desc:'Free stock video footage and motion graphics with a mix of CC0 and Creative Commons licenses.',
      url:'https://www.videvo.net', cats:['video'], license:'Mixed CC', tier:3,
      count:'40k+', tags:['stock','motion graphics','aerial'] },

    // 3D
    { id:'smithsonian-3d', name:'Smithsonian 3D Digitization', org:'Smithsonian Institution',
      desc:'900+ CC0 3D scans of museum objects — fossils, spacecraft, cultural artifacts, and more.',
      url:'https://3d.si.edu', cats:['3d'], license:'CC0', tier:1,
      count:'900+', tags:['artifacts','fossils','spacecraft'] },
    { id:'nasa-3d', name:'NASA 3D Resources', org:'NASA',
      desc:'3D models of spacecraft, planets, astronaut suits, and mission artifacts in the public domain.',
      url:'https://nasa3d.arc.nasa.gov', cats:['3d'], license:'Public Domain', tier:1,
      count:'300+', tags:['spacecraft','planets','missions'] },
    { id:'sketchfab-ch', name:'Sketchfab Cultural Heritage', org:'Sketchfab',
      desc:'Thousands of CC-licensed 3D scans of museum objects, archaeological sites, and heritage items.',
      url:'https://sketchfab.com/tags/cultural-heritage', cats:['3d'], license:'Mixed CC', tier:3,
      count:'10k+', tags:['museums','archaeology','scans'] },
    { id:'thingiverse', name:'Thingiverse', org:'MakerBot',
      desc:'2M+ maker designs for 3D printing under Creative Commons. The largest open maker library.',
      url:'https://www.thingiverse.com', cats:['3d'], license:'Mixed CC', tier:3,
      count:'2M+', tags:['3D printing','maker','functional'] },
    { id:'printables', name:'Printables', org:'Prusa Research',
      desc:'High-quality curated 3D print files, many under CC licenses. Strong community curation.',
      url:'https://www.printables.com', cats:['3d'], license:'Mixed CC', tier:3,
      count:'500k+', tags:['3D printing','curated','Prusa'] },

    // DOCUMENTS
    { id:'gutenberg', name:'Project Gutenberg', org:'Project Gutenberg',
      desc:'70k+ public domain ebooks — the original digital library, free to read and download since 1971.',
      url:'https://www.gutenberg.org', cats:['documents'], license:'Public Domain', tier:1,
      count:'70k+', tags:['ebooks','literature','classics'] },
    { id:'standard-ebooks', name:'Standard Ebooks', org:'Standard Ebooks',
      desc:'800+ beautifully typeset public domain ebooks with consistent metadata and typography.',
      url:'https://standardebooks.org', cats:['documents'], license:'Public Domain', tier:1,
      count:'800+', tags:['ebooks','curated','typography'] },
    { id:'ia-books', name:'Open Library', org:'Internet Archive',
      desc:'20M+ digitized books — borrow from millions, download public domain titles instantly.',
      url:'https://openlibrary.org', cats:['documents'], license:'Mixed', tier:3,
      count:'20M+', tags:['books','borrowing','research'] },
    { id:'hathitrust', name:'HathiTrust Digital Library', org:'HathiTrust',
      desc:'17M+ volumes from research libraries. Full-text search, public domain full-text downloads.',
      url:'https://www.hathitrust.org', cats:['documents'], license:'Mixed', tier:3,
      count:'17M+', tags:['academic','journals','research'] },
    { id:'arxiv', name:'arXiv', org:'Cornell University',
      desc:'2M+ open-access preprints in physics, math, CS, quantitative biology, and economics.',
      url:'https://arxiv.org', cats:['documents'], license:'CC BY', tier:2,
      count:'2M+', tags:['research','physics','CS'] },
  ];

  // ── Internet radio stations (SomaFM HTTPS streams) ────────────
  var RADIO_STATIONS = [
    { id:'groove-salad',   name:'Groove Salad',           genre:'AMBIENT · DOWNTEMPO',
      desc:'A nicely chilled plate of ambient/downtempo beats and grooves.',
      url:'https://ice1.somafm.com/groovesalad-128-mp3',    org:'SomaFM' },
    { id:'space-station',  name:'Space Station Soma',     genre:'SPACE AMBIENT',
      desc:'Spaced-out ambient and mid-tempo electronica for the interstellar traveler.',
      url:'https://ice1.somafm.com/spacestation-128-mp3',   org:'SomaFM' },
    { id:'drone-zone',     name:'Drone Zone',             genre:'ATMOSPHERIC AMBIENT',
      desc:'Deep, textured atmospheric drone and slow ambient music.',
      url:'https://ice1.somafm.com/dronezone-128-mp3',      org:'SomaFM' },
    { id:'deep-space',     name:'Deep Space One',         genre:'DEEP AMBIENT · SPACE',
      desc:'Deep ambient electronic — music for spacefarers and introverts.',
      url:'https://ice1.somafm.com/deepspaceone-128-mp3',   org:'SomaFM' },
    { id:'secret-agent',   name:'Secret Agent',           genre:'SPY JAZZ · LOUNGE',
      desc:'The soundtrack for your stylish, mysterious, covert operations.',
      url:'https://ice1.somafm.com/secretagent-128-mp3',    org:'SomaFM' },
    { id:'lush',           name:'Lush',                   genre:'INDIE POP · DREAM',
      desc:'Sensuous and dreamy ethereal vocal music with soft edges.',
      url:'https://ice1.somafm.com/lush-128-mp3',           org:'SomaFM' },
    { id:'the-trip',       name:'The Trip',               genre:'PROGRESSIVE · PSYCHEDELIC',
      desc:'Progressive and psychedelic electronica for extended journeys.',
      url:'https://ice1.somafm.com/thetrip-128-mp3',        org:'SomaFM' },
    { id:'metal',          name:'Metal Detector',         genre:'METAL · HEAVY',
      desc:'Crushing, aggressive metal from all corners of the genre.',
      url:'https://ice1.somafm.com/metal-128-mp3',          org:'SomaFM' },
    { id:'boot-liquor',    name:'Boot Liquor',            genre:'AMERICANA · COUNTRY',
      desc:'Americana roots music for the free-spirited outlaw.',
      url:'https://ice1.somafm.com/bootliquor-128-mp3',     org:'SomaFM' },
    { id:'suburbs-goa',    name:'Suburbs of Goa',         genre:'PSY-TRANCE · GOA',
      desc:'Psy-trance and psychedelic electronic from the shores of Goa.',
      url:'https://ice1.somafm.com/suburbsofgoa-128-mp3',   org:'SomaFM' },
    { id:'u80s',           name:'Underground 80s',        genre:'OBSCURE 80s',
      desc:'Darker, weirder, harder-to-find tracks from the 1980s underground.',
      url:'https://ice1.somafm.com/u80s-128-mp3',           org:'SomaFM' },
    { id:'ill-street',     name:'Illinois St. Lounge',    genre:'COCKTAIL · EASY LISTENING',
      desc:'Classic bachelor pad, easy listening, and cocktail music.',
      url:'https://ice1.somafm.com/illstreet-128-mp3',      org:'SomaFM' },
  ];

  // ── Browsable services (cycle order) ──────────────────────────
  var BROWSE_ORDER = ['nasa', 'met', 'artic', 'cleveland', 'ia-audio', 'radio', 'ia-video'];

  // Service → which tab should be active
  var SVC_TAB = {
    'nasa':      'images',
    'met':       'images',
    'artic':     'images',
    'cleveland': 'images',
    'ia-audio':  'audio',
    'radio':     'audio',
    'ia-video':  'video'
  };

  // Category tab → browse service (null = source directory)
  var CAT_BROWSE = {
    'images':    'nasa',
    'audio':     'ia-audio',
    'video':     'ia-video',
    '3d':        null,
    'documents': null,
    'all':       null
  };

  var BROWSE_SERVICES = {
    'nasa': {
      name: 'NASA · IMAGE LIBRARY',
      placeholder: 'SEARCH NASA IMAGES',
      fetch: fetchNASA, render: renderNASA
    },
    'met': {
      name: 'METROPOLITAN MUSEUM OF ART',
      placeholder: 'SEARCH ARTWORK',
      fetch: fetchMet, render: renderMet
    },
    'ia-audio': {
      name: 'INTERNET ARCHIVE · AUDIO',
      placeholder: 'SEARCH AUDIO',
      fetch: fetchIAudio, render: renderIAudio
    },
    'artic': {
      name: 'ART INSTITUTE OF CHICAGO',
      placeholder: 'SEARCH ARTWORKS',
      fetch: fetchArtic, render: renderArtic
    },
    'cleveland': {
      name: 'CLEVELAND MUSEUM OF ART',
      placeholder: 'SEARCH COLLECTION',
      fetch: fetchCleveland, render: renderCleveland
    },
    'ia-video': {
      name: 'INTERNET ARCHIVE · VIDEO',
      placeholder: 'SEARCH VIDEO',
      fetch: fetchIAvideo, render: renderIAvideo
    },
    'radio': {
      name: 'INTERNET RADIO · LIVE',
      placeholder: 'FILTER STATIONS',
      fetch: fetchRadio, render: renderRadio
    }
  };

  // ── State ──────────────────────────────────────────────────────
  var _cat       = 'images';
  var _browseId  = null;
  var _page      = 1;
  var _hasMore   = false;
  var _browseTimer = null;
  // Met Museum caches IDs for the current query so page changes are fast
  var _metIds    = [];
  var _metQuery  = null;
  // Live reference to the <audio> element (recreated each render)
  var _audioEl   = null;

  // ── Utilities ──────────────────────────────────────────────────
  function esc(s) {
    return String(s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;')
      .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  function $si() { return document.getElementById('omb-search'); }

  // ── Source card builder ────────────────────────────────────────
  function buildCard(s) {
    var primaryCat = s.cats[0];
    var tags = s.tags.slice(0, 3).map(function (t) {
      return '<span class="omb-tag">' + esc(t) + '</span>';
    }).join('');
    var catDots = s.cats.map(function (c) {
      return '<span class="omb-cat-dot ' + esc(c === '3d' ? 'd3' : c) + '" title="' + esc(c) + '"></span>';
    }).join('');

    return (
      '<div class="omb-card cat-' + esc(primaryCat) + ' tier-' + s.tier + '">' +
        '<div class="omb-card-stripe"></div>' +
        '<div class="omb-card-inner">' +
          '<div class="omb-card-top">' +
            '<div class="omb-card-name">' + esc(s.name) + '</div>' +
            '<div class="omb-license t' + s.tier + '">' + esc(s.license) + '</div>' +
          '</div>' +
          '<div class="omb-card-org-row">' +
            '<span class="omb-card-org">' + esc(s.org) + '</span>' +
            '<span class="omb-card-cats">' + catDots + '</span>' +
          '</div>' +
          '<div class="omb-card-desc">' + esc(s.desc) + '</div>' +
          '<div class="omb-card-footer">' +
            '<span class="omb-item-count">' + esc(s.count) + ' items</span>' +
            '<div class="omb-tags">' + tags + '</div>' +
            '<a href="' + esc(s.url) + '" target="_blank" rel="noopener" class="omb-access">ACCESS ↗</a>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  // ── Directory render ───────────────────────────────────────────
  function render() {
    var si = $si();
    var q = (si ? si.value : '').trim().toLowerCase();
    var filtered = SOURCES.filter(function (s) {
      if (_cat !== 'all' && s.cats.indexOf(_cat) === -1) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().indexOf(q) !== -1 ||
        s.org.toLowerCase().indexOf(q) !== -1 ||
        s.desc.toLowerCase().indexOf(q) !== -1 ||
        s.license.toLowerCase().indexOf(q) !== -1 ||
        s.tags.some(function (t) { return t.toLowerCase().indexOf(q) !== -1; })
      );
    });

    var countEl = document.getElementById('omb-count');
    if (countEl) {
      countEl.textContent = filtered.length + ' SOURCE' + (filtered.length !== 1 ? 'S' : '') + ' INDEXED';
    }
    var grid = document.getElementById('omb-grid');
    grid.innerHTML = filtered.length
      ? filtered.map(buildCard).join('')
      : '<div class="omb-empty">NO SOURCES MATCH — REFINE QUERY</div>';
  }

  // ── Mode switching ─────────────────────────────────────────────
  function switchTab(cat) {
    _cat = cat;
    setActiveTab(cat);
    var svcId = CAT_BROWSE[cat];
    if (svcId) {
      enterBrowse(svcId);
    } else {
      enterDirectory();
    }
  }

  function cycleSvc(dir) {
    var idx = BROWSE_ORDER.indexOf(_browseId);
    if (idx === -1) idx = 0;
    idx = (idx + dir + BROWSE_ORDER.length) % BROWSE_ORDER.length;
    enterBrowse(BROWSE_ORDER[idx]);
  }

  function setActiveTab(cat) {
    document.querySelectorAll('.omb-cat').forEach(function (b) { b.classList.remove('active'); });
    var btn = document.querySelector('.omb-cat[data-cat="' + cat + '"]');
    if (btn) btn.classList.add('active');
  }

  function enterBrowse(svcId) {
    var svc = BROWSE_SERVICES[svcId];
    if (!svc) return;
    _browseId = svcId;
    _page = 1;
    _hasMore = false;
    clearTimeout(_browseTimer);

    // Sync tab highlight to the service's category
    setActiveTab(SVC_TAB[svcId]);

    document.getElementById('omb-browse-svc').textContent = svc.name;
    var si = $si();
    si.placeholder = svc.placeholder;
    si.value = '';

    document.getElementById('omb-stats').style.display  = 'none';
    document.getElementById('omb-grid').style.display   = 'none';
    document.getElementById('omb-browse').style.display = 'flex';

    doFetch('', 1);
  }

  function enterDirectory() {
    stopAudio();
    _browseId = null;
    _page = 1;
    _hasMore = false;
    clearTimeout(_browseTimer);
    document.getElementById('omb-browse').style.display = 'none';
    document.getElementById('omb-browse-body').innerHTML = '';
    document.getElementById('omb-stats').style.display  = '';
    document.getElementById('omb-grid').style.display   = '';
    var si = $si();
    si.placeholder = 'SEARCH CATALOG';
    si.value = '';
    updatePager();
    render();
  }

  // ── Browse fetch & pagination ──────────────────────────────────
  function doFetch(query, page) {
    if (!_browseId) return;
    page = page || 1;
    _page = page;

    stopAudio(); // pause any playing audio before replacing content

    var svc = BROWSE_SERVICES[_browseId];
    var body = document.getElementById('omb-browse-body');
    body.innerHTML = '<div class="omb-browse-loading">SCANNING CATALOG</div>';
    updatePager(); // disable buttons during load

    svc.fetch(query, page, function (results, err, hasMore) {
      _hasMore = hasMore === true;
      if (err) {
        body.innerHTML = '<div class="omb-browse-empty">' + esc(err) + '</div>';
        updatePager();
        return;
      }
      if (!results || !results.length) {
        body.innerHTML = '<div class="omb-browse-empty">NO RESULTS FOUND</div>';
        updatePager();
        return;
      }
      body.innerHTML = svc.render(results);
      body.scrollTop = 0;
      updatePager();
      attachResultHandlers();
    });
  }

  function updatePager() {
    var prevBtn = document.getElementById('omb-page-prev');
    var nextBtn = document.getElementById('omb-page-next');
    var pageNum = document.getElementById('omb-page-num');
    if (prevBtn) prevBtn.disabled = (_page <= 1);
    if (nextBtn) nextBtn.disabled = (!_hasMore);
    if (pageNum) pageNum.textContent = 'PAGE ' + _page;
  }

  function attachResultHandlers() {
    // Image lightbox
    document.querySelectorAll('.omb-img-card').forEach(function (card) {
      card.addEventListener('click', function () {
        openLightbox(card.dataset.full, card.dataset.caption);
      });
    });

    // Audio player wiring (only present when audio/radio tab is active)
    _audioEl = document.getElementById('omb-audio');
    if (!_audioEl) return;

    var playBtn  = document.getElementById('omb-play-btn');
    var fillEl   = document.getElementById('omb-player-fill');
    var curEl    = document.getElementById('omb-t-cur');
    var durEl    = document.getElementById('omb-t-dur');
    var barEl    = document.getElementById('omb-player-bar');

    playBtn.addEventListener('click', function () {
      if (!_audioEl || !_audioEl.src) return;
      if (_audioEl.paused) _audioEl.play();
      else _audioEl.pause();
    });

    barEl.addEventListener('click', function (e) {
      var dur = _audioEl ? _audioEl.duration : 0;
      if (!dur || !isFinite(dur)) return; // skip seeking on live streams
      var rect = barEl.getBoundingClientRect();
      _audioEl.currentTime = ((e.clientX - rect.left) / rect.width) * dur;
    });

    _audioEl.addEventListener('timeupdate', function () {
      if (curEl) curEl.textContent = fmtTime(_audioEl.currentTime);
      var dur = _audioEl.duration;
      if (!dur || !isFinite(dur)) return; // live stream — no progress fill
      if (fillEl) fillEl.style.width = (_audioEl.currentTime / dur * 100) + '%';
    });

    _audioEl.addEventListener('loadedmetadata', function () {
      var dur  = _audioEl.duration;
      var live = !dur || !isFinite(dur);
      if (durEl)  durEl.textContent = live ? '● LIVE' : fmtTime(dur);
      if (fillEl && live) fillEl.style.width = '100%'; // solid bar for live
    });

    _audioEl.addEventListener('play', function () {
      if (playBtn) playBtn.textContent = '‖';
    });

    _audioEl.addEventListener('pause', function () {
      if (playBtn) playBtn.textContent = '▷';
    });

    _audioEl.addEventListener('ended', function () {
      if (playBtn) playBtn.textContent = '▷';
      // Auto-advance to next IA archive track (radio streams don't end)
      var tracks = Array.from(document.querySelectorAll('.omb-audio-track[data-id]'));
      var idx = tracks.findIndex(function (t) { return t.classList.contains('omb-track-active'); });
      if (idx >= 0 && idx < tracks.length - 1) {
        var next = tracks[idx + 1];
        selectTrack(next.dataset.id, next.dataset.title, next.dataset.artist);
      }
    });

    // Track row click — radio uses data-url; IA archive uses data-id
    document.querySelectorAll('.omb-audio-track').forEach(function (track) {
      track.addEventListener('click', function (e) {
        if (e.target.closest('.omb-audio-link')) return;

        var url    = track.dataset.url;
        var id     = track.dataset.id;
        var title  = track.dataset.title;
        var artist = track.dataset.artist;

        if (url) {
          // Radio: direct stream URL — mark active and play immediately
          document.querySelectorAll('.omb-audio-track').forEach(function (t) {
            t.classList.remove('omb-track-active');
            var b = t.querySelector('.omb-track-btn'); if (b) b.textContent = '▷';
          });
          track.classList.add('omb-track-active');
          var tb = track.querySelector('.omb-track-btn'); if (tb) tb.textContent = '▶';

          showPlayer();

          var titleEl  = document.getElementById('omb-player-title');
          var artistEl = document.getElementById('omb-player-artist');
          var pBtn     = document.getElementById('omb-play-btn');
          var fill     = document.getElementById('omb-player-fill');
          var cur      = document.getElementById('omb-t-cur');
          var dur      = document.getElementById('omb-t-dur');

          if (titleEl)  titleEl.textContent  = title || '';
          if (artistEl) artistEl.textContent = artist || '';
          if (fill)     fill.style.width     = '100%';
          if (cur)      cur.textContent      = '0:00';
          if (dur)      dur.textContent      = '● LIVE';
          if (pBtn)     { pBtn.textContent = '▷'; pBtn.disabled = true; }

          _audioEl.src = url;
          _audioEl.load();
          if (pBtn) { pBtn.textContent = '▷'; pBtn.disabled = false; }
          _audioEl.play().catch(function () {
            if (pBtn) { pBtn.textContent = '▷'; pBtn.disabled = false; }
          });

        } else if (id) {
          // IA archive: fetch metadata first
          selectTrack(id, title, artist);
        }
      });
    });
  }

  // ── Audio helpers ──────────────────────────────────────────────
  function stopAudio() {
    if (_audioEl) {
      _audioEl.pause();
      _audioEl.removeAttribute('src');
      _audioEl.load();
      _audioEl = null;
    }
  }

  function showPlayer() {
    var el = document.getElementById('omb-player');
    if (el) el.style.display = 'block';
  }

  function fmtTime(s) {
    s = Math.floor(s || 0);
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  function findAudioFile(files) {
    if (!files || !files.length) return null;
    // Use extension matching — IA format field names vary widely across items
    var audio = files.filter(function (f) {
      return /\.(mp3|ogg|oga|m4a|aac)$/i.test(f.name) && f.source !== 'metadata';
    });
    if (!audio.length) return null;
    var mp3s = audio.filter(function (f) { return /\.mp3$/i.test(f.name); });
    // Among MP3s prefer 128kbps/VBR (common IA derivative formats)
    var preferred = mp3s.filter(function (f) {
      var fmt = (f.format || '').toLowerCase();
      return fmt.indexOf('128') !== -1 || fmt.indexOf('vbr') !== -1;
    });
    return preferred[0] || mp3s[0] || audio[0];
  }

  function selectTrack(id, title, artist) {
    if (!_audioEl) return;
    showPlayer();

    var titleEl  = document.getElementById('omb-player-title');
    var artistEl = document.getElementById('omb-player-artist');
    var playBtn  = document.getElementById('omb-play-btn');
    var fillEl   = document.getElementById('omb-player-fill');
    var curEl    = document.getElementById('omb-t-cur');
    var durEl    = document.getElementById('omb-t-dur');

    if (titleEl)  titleEl.textContent  = title || id;
    if (artistEl) artistEl.textContent = artist || '';
    if (fillEl)   fillEl.style.width = '0%';
    if (curEl)    curEl.textContent = '0:00';
    if (durEl)    durEl.textContent = '—:——';
    if (playBtn)  { playBtn.textContent = '·'; playBtn.disabled = true; }

    document.querySelectorAll('.omb-audio-track').forEach(function (t) {
      t.classList.remove('omb-track-active');
      var btn = t.querySelector('.omb-track-btn');
      if (btn) btn.textContent = '▷';
    });
    var safeId = id.replace(/"/g, '');
    var activeRow = document.querySelector('.omb-audio-track[data-id="' + safeId + '"]');
    if (activeRow) {
      activeRow.classList.add('omb-track-active');
      var ab = activeRow.querySelector('.omb-track-btn');
      if (ab) ab.textContent = '▶';
    }

    fetch('https://archive.org/metadata/' + encodeURIComponent(id))
      .then(function (r) { return r.ok ? r.json() : Promise.reject('HTTP ' + r.status); })
      .then(function (data) {
        var file = findAudioFile(data.files || []);
        if (!file) {
          if (titleEl) titleEl.textContent = (title || id) + ' — NO AUDIO FILE';
          if (playBtn) { playBtn.textContent = '✕'; playBtn.disabled = true; }
          return;
        }
        var url = 'https://archive.org/download/' +
                  encodeURIComponent(id) + '/' + encodeURIComponent(file.name);
        if (!_audioEl) return; // navigated away while loading
        _audioEl.src = url;
        _audioEl.load();
        if (playBtn) { playBtn.textContent = '▷'; playBtn.disabled = false; }
        _audioEl.play().catch(function () {
          if (playBtn) { playBtn.textContent = '▷'; playBtn.disabled = false; }
        });
      })
      .catch(function () {
        if (titleEl) titleEl.textContent = (title || id) + ' — LOAD ERROR';
        if (playBtn) { playBtn.textContent = '✕'; playBtn.disabled = true; }
      });
  }

  // ── NASA Images ────────────────────────────────────────────────
  function fetchNASA(query, page, cb) {
    var params = 'media_type=image&page=' + page + '&page_size=24';
    if (query) params = 'q=' + encodeURIComponent(query) + '&' + params;
    fetch('https://images-api.nasa.gov/search?' + params)
      .then(function (r) { return r.ok ? r.json() : Promise.reject('HTTP ' + r.status); })
      .then(function (data) {
        var col   = data.collection || {};
        var items = col.items || [];
        var total = col.metadata && col.metadata.total_hits;
        var results = items.map(function (item) {
          var d = (item.data && item.data[0]) || {};
          var thumb = (item.links && item.links[0] && item.links[0].href) || '';
          return { title: d.title || '', thumb: thumb, date: (d.date_created || '').slice(0, 10) };
        }).filter(function (r) { return r.thumb; });
        var hasMore = total ? (page * 24 < total) : (items.length === 24);
        cb(results, null, hasMore);
      })
      .catch(function (e) { cb(null, 'FETCH ERROR · ' + e, false); });
  }

  function renderNASA(results) {
    return '<div class="omb-img-grid">' + results.map(function (r) {
      return '<div class="omb-img-card" data-full="' + esc(r.thumb) + '" data-caption="' + esc(r.title) + '">' +
        '<img class="omb-img-thumb" src="' + esc(r.thumb) + '" alt="' + esc(r.title) + '" loading="lazy" onerror="this.closest(\'.omb-img-card\').style.display=\'none\'" />' +
        '<div class="omb-img-title">' + esc(r.title.slice(0, 60)) + (r.title.length > 60 ? '…' : '') + '</div>' +
        '<div class="omb-img-sub">' + esc(r.date) + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  // ── Metropolitan Museum ────────────────────────────────────────
  var MET_PAGE = 20;

  function fetchMet(query, page, cb) {
    var base = 'https://collectionapi.metmuseum.org/public/collection/v1/';
    var searchQ = query || '*';

    function fetchPage(ids) {
      var start = (page - 1) * MET_PAGE;
      var slice = ids.slice(start, start + MET_PAGE);
      if (!slice.length) { cb([], null, false); return; }
      var hasMore = ids.length > start + MET_PAGE;
      Promise.all(slice.map(function (id) {
        return fetch(base + 'objects/' + id)
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      })).then(function (objects) {
        var results = (objects || []).filter(function (o) { return o && o.primaryImageSmall; })
          .map(function (o) {
            return {
              title: o.title || 'Untitled',
              sub: o.artistDisplayName || o.department || '',
              date: o.objectDate || '',
              thumb: o.primaryImageSmall,
              full: o.primaryImage || o.primaryImageSmall
            };
          });
        cb(results, null, hasMore);
      }).catch(function (e) { cb(null, 'FETCH ERROR · ' + e, false); });
    }

    if (searchQ === _metQuery && _metIds.length) {
      fetchPage(_metIds);
    } else {
      _metQuery = searchQ;
      _metIds = [];
      // Default (no query) → isHighlight=true shows the most famous works
      var metUrl = base + 'search?q=' + encodeURIComponent(searchQ) + '&hasImages=true' +
                   (!query ? '&isHighlight=true' : '');
      fetch(metUrl)
        .then(function (r) { return r.ok ? r.json() : Promise.reject('HTTP ' + r.status); })
        .then(function (data) {
          _metIds = data.objectIDs || [];
          fetchPage(_metIds);
        })
        .catch(function (e) { cb(null, 'FETCH ERROR · ' + e, false); });
    }
  }

  function renderMet(results) {
    if (!results.length) return '<div class="omb-browse-empty">NO ARTWORKS WITH IMAGES — TRY ANOTHER TERM</div>';
    return '<div class="omb-img-grid">' + results.map(function (r) {
      return '<div class="omb-img-card" data-full="' + esc(r.full) + '" data-caption="' + esc(r.title + (r.sub ? ' · ' + r.sub : '')) + '">' +
        '<img class="omb-img-thumb" src="' + esc(r.thumb) + '" alt="' + esc(r.title) + '" loading="lazy" onerror="this.closest(\'.omb-img-card\').style.display=\'none\'" />' +
        '<div class="omb-img-title">' + esc(r.title.slice(0, 55)) + (r.title.length > 55 ? '…' : '') + '</div>' +
        '<div class="omb-img-sub">' + esc(r.sub) + (r.date ? ' · ' + esc(r.date) : '') + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  // ── Art Institute of Chicago ───────────────────────────────────
  var ARTIC_PAGE = 24;

  function fetchArtic(query, page, cb) {
    var url;
    if (query) {
      url = 'https://api.artic.edu/api/v1/artworks/search?' +
            'q=' + encodeURIComponent(query) +
            '&fields=id,title,artist_display,date_display,image_id' +
            '&limit=' + ARTIC_PAGE + '&page=' + page;
    } else {
      url = 'https://api.artic.edu/api/v1/artworks?' +
            'fields=id,title,artist_display,date_display,image_id' +
            '&is_public_domain=true&limit=' + ARTIC_PAGE + '&page=' + page;
    }
    fetch(url)
      .then(function (r) { return r.ok ? r.json() : Promise.reject('HTTP ' + r.status); })
      .then(function (data) {
        var items = data.data || [];
        var pg = data.pagination || {};
        var hasMore = pg.total_pages ? (pg.current_page < pg.total_pages) : (items.length === ARTIC_PAGE);
        var results = items.filter(function (d) { return d.image_id; }).map(function (d) {
          var artist = (d.artist_display || '').split('\n')[0].trim();
          return {
            title: d.title || 'Untitled',
            sub:   artist,
            date:  d.date_display || '',
            thumb: 'https://www.artic.edu/iiif/2/' + d.image_id + '/full/400,/0/default.jpg',
            full:  'https://www.artic.edu/iiif/2/' + d.image_id + '/full/843,/0/default.jpg'
          };
        });
        cb(results, null, hasMore);
      })
      .catch(function (e) { cb(null, 'FETCH ERROR · ' + e, false); });
  }

  function renderArtic(results) {
    if (!results.length) return '<div class="omb-browse-empty">NO ARTWORKS WITH IMAGES — TRY ANOTHER TERM</div>';
    return '<div class="omb-img-grid">' + results.map(function (r) {
      return '<div class="omb-img-card" data-full="' + esc(r.full) + '" data-caption="' + esc(r.title + (r.sub ? ' · ' + r.sub : '')) + '">' +
        '<img class="omb-img-thumb" src="' + esc(r.thumb) + '" alt="' + esc(r.title) + '" loading="lazy" onerror="this.closest(\'.omb-img-card\').style.display=\'none\'" />' +
        '<div class="omb-img-title">' + esc(r.title.slice(0, 55)) + (r.title.length > 55 ? '…' : '') + '</div>' +
        '<div class="omb-img-sub">' + esc(r.sub) + (r.date ? ' · ' + esc(r.date) : '') + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  // ── Cleveland Museum of Art ────────────────────────────────────
  var CMA_PAGE = 24;

  function fetchCleveland(query, page, cb) {
    var skip = (page - 1) * CMA_PAGE;
    var url = 'https://openaccess-api.clevelandart.org/api/artworks/?' +
              'has_image=1&cc0=1&limit=' + CMA_PAGE + '&skip=' + skip;
    if (query) url += '&q=' + encodeURIComponent(query);
    fetch(url)
      .then(function (r) { return r.ok ? r.json() : Promise.reject('HTTP ' + r.status); })
      .then(function (data) {
        var items = data.data || [];
        var total = (data.info && data.info.total) || 0;
        var hasMore = total > page * CMA_PAGE;
        var results = items.filter(function (d) {
          return d.images && d.images.web && d.images.web.url;
        }).map(function (d) {
          var creator = (d.creators && d.creators[0] && d.creators[0].description) || '';
          return {
            title: d.title || 'Untitled',
            sub:   creator,
            date:  d.creation_date || '',
            thumb: d.images.web.url,
            full:  (d.images.print && d.images.print.url) || d.images.web.url
          };
        });
        cb(results, null, hasMore);
      })
      .catch(function (e) { cb(null, 'FETCH ERROR · ' + e, false); });
  }

  function renderCleveland(results) {
    if (!results.length) return '<div class="omb-browse-empty">NO ARTWORKS WITH IMAGES — TRY ANOTHER TERM</div>';
    return '<div class="omb-img-grid">' + results.map(function (r) {
      return '<div class="omb-img-card" data-full="' + esc(r.full) + '" data-caption="' + esc(r.title + (r.sub ? ' · ' + r.sub : '')) + '">' +
        '<img class="omb-img-thumb" src="' + esc(r.thumb) + '" alt="' + esc(r.title) + '" loading="lazy" onerror="this.closest(\'.omb-img-card\').style.display=\'none\'" />' +
        '<div class="omb-img-title">' + esc(r.title.slice(0, 55)) + (r.title.length > 55 ? '…' : '') + '</div>' +
        '<div class="omb-img-sub">' + esc(r.sub) + (r.date ? ' · ' + esc(r.date) : '') + '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  // ── Internet Archive Audio ─────────────────────────────────────
  var IA_AUDIO_ROWS = 18;

  function fetchIAudio(query, page, cb) {
    var q = query
      ? encodeURIComponent(query) + '+mediatype%3Aaudio'
      : 'mediatype%3Aaudio';
    var sort = query ? '' : '&sort[]=downloads+desc';
    fetch('https://archive.org/advancedsearch.php?q=' + q + sort +
          '&fl[]=identifier,title,creator,year&rows=' + IA_AUDIO_ROWS +
          '&page=' + page + '&output=json')
      .then(function (r) { return r.ok ? r.json() : Promise.reject('HTTP ' + r.status); })
      .then(function (data) {
        var resp = data.response || {};
        var docs = resp.docs || [];
        var found = resp.numFound || 0;
        cb(docs, null, found > page * IA_AUDIO_ROWS);
      })
      .catch(function (e) { cb(null, 'FETCH ERROR · ' + e, false); });
  }

  function renderIAudio(results) {
    if (!results.length) return '<div class="omb-browse-empty">NO AUDIO FOUND</div>';

    var player =
      '<div class="omb-player" id="omb-player" style="display:none">' +
        '<audio id="omb-audio" preload="none"></audio>' +
        '<div class="omb-player-row">' +
          '<button class="omb-play-btn" id="omb-play-btn" disabled>▷</button>' +
          '<div class="omb-player-info">' +
            '<div class="omb-player-title" id="omb-player-title">SELECT A TRACK BELOW</div>' +
            '<div class="omb-player-artist" id="omb-player-artist"></div>' +
          '</div>' +
        '</div>' +
        '<div class="omb-player-row omb-player-timeline">' +
          '<span class="omb-t" id="omb-t-cur">0:00</span>' +
          '<div class="omb-player-bar" id="omb-player-bar">' +
            '<div class="omb-player-fill" id="omb-player-fill"></div>' +
          '</div>' +
          '<span class="omb-t" id="omb-t-dur">—:——</span>' +
        '</div>' +
      '</div>';

    var list = '<div class="omb-audio-list">' +
      results.map(function (r) {
        var creator = Array.isArray(r.creator) ? r.creator[0] : (r.creator || '');
        var title   = (r.title || r.identifier).slice(0, 72);
        var sub     = [creator, r.year ? String(r.year) : ''].filter(Boolean).join(' · ');
        return '<div class="omb-audio-track" ' +
               'data-id="'     + esc(r.identifier) + '" ' +
               'data-title="'  + esc(title) + '" ' +
               'data-artist="' + esc(creator) + '">' +
          '<button class="omb-track-btn" title="Play">▷</button>' +
          '<div class="omb-track-meta">' +
            '<span class="omb-track-title">' + esc(title) + '</span>' +
            (sub ? '<span class="omb-track-sub">' + esc(sub) + '</span>' : '') +
          '</div>' +
          '<a href="https://archive.org/details/' + esc(r.identifier) + '" ' +
             'target="_blank" rel="noopener" class="omb-audio-link" title="Open source page">↗</a>' +
        '</div>';
      }).join('') +
    '</div>';

    return player + list;
  }

  // ── Internet Radio ────────────────────────────────────────────
  function fetchRadio(query, page, cb) {
    var list = RADIO_STATIONS;
    if (query) {
      var q = query.toLowerCase();
      list = RADIO_STATIONS.filter(function (s) {
        return (s.name + ' ' + s.genre + ' ' + s.desc).toLowerCase().indexOf(q) !== -1;
      });
    }
    cb(list, null, false);
  }

  function renderRadio(stations) {
    if (!stations.length) return '<div class="omb-browse-empty">NO STATIONS MATCH</div>';
    var player =
      '<div class="omb-player" id="omb-player" style="display:none">' +
        '<audio id="omb-audio" preload="none"></audio>' +
        '<div class="omb-player-row">' +
          '<button class="omb-play-btn" id="omb-play-btn" disabled>▷</button>' +
          '<div class="omb-player-info">' +
            '<div class="omb-player-title" id="omb-player-title">SELECT A STATION</div>' +
            '<div class="omb-player-artist" id="omb-player-artist"></div>' +
          '</div>' +
        '</div>' +
        '<div class="omb-player-row omb-player-timeline">' +
          '<span class="omb-t" id="omb-t-cur">0:00</span>' +
          '<div class="omb-player-bar" id="omb-player-bar">' +
            '<div class="omb-player-fill" id="omb-player-fill"></div>' +
          '</div>' +
          '<span class="omb-t" id="omb-t-dur">—:——</span>' +
        '</div>' +
      '</div>';
    var list = '<div class="omb-audio-list">' +
      stations.map(function (s) {
        return '<div class="omb-audio-track omb-radio-track" ' +
               'data-url="'    + esc(s.url)   + '" ' +
               'data-title="'  + esc(s.name)  + '" ' +
               'data-artist="' + esc(s.genre) + '">' +
          '<button class="omb-track-btn" title="Play">▷</button>' +
          '<div class="omb-track-meta">' +
            '<span class="omb-track-title">' + esc(s.name)  + '</span>' +
            '<span class="omb-track-sub">'   + esc(s.genre) + ' · ' + esc(s.org) + '</span>' +
          '</div>' +
          '<span class="omb-live-badge">LIVE</span>' +
        '</div>';
      }).join('') +
    '</div>';
    return player + list;
  }

  // ── Internet Archive Video ─────────────────────────────────────
  var IA_VIDEO_ROWS = 12;

  function fetchIAvideo(query, page, cb) {
    var q = query
      ? encodeURIComponent(query) + '+mediatype%3Amovies'
      : 'mediatype%3Amovies';
    var vsort = query ? '' : '&sort[]=downloads+desc';
    fetch('https://archive.org/advancedsearch.php?q=' + q + vsort +
          '&fl[]=identifier,title,creator,year&rows=' + IA_VIDEO_ROWS +
          '&page=' + page + '&output=json')
      .then(function (r) { return r.ok ? r.json() : Promise.reject('HTTP ' + r.status); })
      .then(function (data) {
        var resp = data.response || {};
        var docs = resp.docs || [];
        var found = resp.numFound || 0;
        cb(docs, null, found > page * IA_VIDEO_ROWS);
      })
      .catch(function (e) { cb(null, 'FETCH ERROR · ' + e, false); });
  }

  function renderIAvideo(results) {
    return '<div class="omb-video-grid">' + results.map(function (r) {
      var creator = Array.isArray(r.creator) ? r.creator[0] : (r.creator || '');
      var embedSrc = 'https://archive.org/embed/' + encodeURIComponent(r.identifier);
      return '<div class="omb-video-item">' +
        '<iframe src="' + esc(embedSrc) + '" class="omb-video-embed" width="100%" height="190" frameborder="0" allowfullscreen allow="autoplay"></iframe>' +
        '<div class="omb-video-meta">' +
          '<span class="omb-video-title">' + esc((r.title || r.identifier).slice(0, 65)) + '</span>' +
          (creator ? '<div class="omb-video-creator">' + esc(creator) + (r.year ? ' · ' + esc(String(r.year)) : '') + '</div>' : '') +
        '</div>' +
      '</div>';
    }).join('') + '</div>';
  }

  // ── Lightbox ───────────────────────────────────────────────────
  function openLightbox(src, caption) {
    document.getElementById('omb-lb-img').src = src;
    document.getElementById('omb-lb-caption').textContent = caption || '';
    document.getElementById('omb-lightbox').style.display = 'flex';
  }

  function closeLightbox() {
    document.getElementById('omb-lightbox').style.display = 'none';
    document.getElementById('omb-lb-img').src = '';
  }

  // ── Init ───────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

    // Toolbar: tab clicks
    document.getElementById('omb-cats').addEventListener('click', function (e) {
      var btn = e.target.closest('.omb-cat');
      if (!btn) return;
      switchTab(btn.dataset.cat);
    });

    // Browse header: cycle service
    document.getElementById('omb-svc-prev').addEventListener('click', function () { cycleSvc(-1); });
    document.getElementById('omb-svc-next').addEventListener('click', function () { cycleSvc(1); });

    // Browse footer: page navigation
    document.getElementById('omb-page-prev').addEventListener('click', function () {
      if (_page > 1) doFetch($si().value.trim(), _page - 1);
    });
    document.getElementById('omb-page-next').addEventListener('click', function () {
      if (_hasMore) doFetch($si().value.trim(), _page + 1);
    });

    // Unified search: debounced in browse mode, instant filter in directory mode
    var si = $si();
    si.addEventListener('input', function () {
      if (_browseId) {
        clearTimeout(_browseTimer);
        var q = si.value.trim();
        _metQuery = null; // invalidate Met cache on new search
        _browseTimer = setTimeout(function () { doFetch(q, 1); }, 600);
      } else {
        render();
      }
    });
    si.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && _browseId) {
        clearTimeout(_browseTimer);
        _metQuery = null;
        doFetch(si.value.trim(), 1);
      }
    });

    // Lightbox close
    document.getElementById('omb-lb-close').addEventListener('click', closeLightbox);
    document.getElementById('omb-lb-bg').addEventListener('click', closeLightbox);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });

    // Default: open IMAGES (NASA) on load
    switchTab('images');
  });
})();
