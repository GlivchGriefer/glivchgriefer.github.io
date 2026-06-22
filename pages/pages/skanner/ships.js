/* ships.js — SKANNER ship roster, Tier 1-5 */

const SHIPS = [
  {
    tier: 1, name: 'Scout Fighter', cls: 'Light Fighter',
    hullRange: [1, 3],
    desc: 'Single-seat delta-wing scout. Fast, lightly armed.',
    viewBox: '0 0 160 200',
    svg: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" class="ship-preview-svg">
<defs>
  <radialGradient id="eg1a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#AAFFCC"/><stop offset="100%" stop-color="#00DD44" stop-opacity="0"/></radialGradient>
  <radialGradient id="eg1b" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#AAFFCC"/><stop offset="100%" stop-color="#00DD44" stop-opacity="0"/></radialGradient>
  <filter id="gf1" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<!-- canards -->
<path d="M68,54 L40,70 L44,80 L68,68Z" fill="#0A160A" stroke="#007A22" stroke-width="1"/>
<path d="M92,54 L120,70 L116,80 L92,68Z" fill="#0A160A" stroke="#007A22" stroke-width="1"/>
<!-- delta wings -->
<path d="M66,85 L12,120 L22,134 L68,108Z" fill="#0A160A" stroke="#00AA33" stroke-width="1.2"/>
<path d="M94,85 L148,120 L138,134 L92,108Z" fill="#0A160A" stroke="#00AA33" stroke-width="1.2"/>
<!-- wing hardpoints -->
<rect x="18" y="118" width="5" height="10" rx="1.5" fill="#060E06" stroke="#007A22" stroke-width="0.8"/>
<rect x="137" y="118" width="5" height="10" rx="1.5" fill="#060E06" stroke="#007A22" stroke-width="0.8"/>
<!-- fuselage -->
<path d="M80,25 L92,50 L94,85 L90,128 L85,142 L80,146 L75,142 L70,128 L66,85 L68,50Z" fill="#0A160A" stroke="#00DD44" stroke-width="1.5"/>
<!-- panel lines -->
<line x1="80" y1="28" x2="80" y2="142" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<line x1="66" y1="88" x2="94" y2="88" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<line x1="68" y1="112" x2="92" y2="112" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<!-- cockpit -->
<ellipse cx="80" cy="48" rx="9" ry="12" fill="#001808" stroke="#00EE55" stroke-width="1.2"/>
<ellipse cx="80" cy="47" rx="5.5" ry="8" fill="#002A12" opacity="0.9"/>
<ellipse cx="77" cy="42" rx="2" ry="3" fill="#00FF66" opacity="0.2"/>
<!-- nose cannons -->
<line x1="76" y1="25" x2="76" y2="17" stroke="#00CC44" stroke-width="1.4"/>
<line x1="84" y1="25" x2="84" y2="17" stroke="#00CC44" stroke-width="1.4"/>
<!-- engine pods -->
<rect x="69" y="131" width="10" height="16" rx="3" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<rect x="81" y="131" width="10" height="16" rx="3" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<!-- engine glow -->
<ellipse cx="74" cy="148" rx="7" ry="4.5" fill="url(#eg1a)" filter="url(#gf1)"/>
<ellipse cx="86" cy="148" rx="7" ry="4.5" fill="url(#eg1b)" filter="url(#gf1)"/>
</svg>`
  },

  {
    tier: 2, name: 'Hornet Interceptor', cls: 'Heavy Fighter',
    hullRange: [4, 6],
    desc: 'Twin-engine interceptor. Superior firepower and shields.',
    viewBox: '0 0 160 200',
    svg: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" class="ship-preview-svg">
<defs>
  <radialGradient id="eg2a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#AAFFCC"/><stop offset="100%" stop-color="#00DD44" stop-opacity="0"/></radialGradient>
  <radialGradient id="eg2b" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#AAFFCC"/><stop offset="100%" stop-color="#00DD44" stop-opacity="0"/></radialGradient>
  <filter id="gf2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<!-- double canards -->
<path d="M64,50 L32,68 L36,80 L64,64Z" fill="#0A160A" stroke="#007A22" stroke-width="1"/>
<path d="M64,66 L38,76 L40,85 L64,78Z" fill="#0A160A" stroke="#007A22" stroke-width="0.9"/>
<path d="M96,50 L128,68 L124,80 L96,64Z" fill="#0A160A" stroke="#007A22" stroke-width="1"/>
<path d="M96,66 L122,76 L120,85 L96,78Z" fill="#0A160A" stroke="#007A22" stroke-width="0.9"/>
<!-- wings -->
<path d="M60,90 L4,132 L18,148 L62,115Z" fill="#0A160A" stroke="#00AA33" stroke-width="1.3"/>
<path d="M100,90 L156,132 L142,148 L98,115Z" fill="#0A160A" stroke="#00AA33" stroke-width="1.3"/>
<!-- 4 hardpoints -->
<rect x="8" y="130" width="5" height="11" rx="1.5" fill="#060E06" stroke="#007A22" stroke-width="0.8"/>
<rect x="26" y="126" width="5" height="11" rx="1.5" fill="#060E06" stroke="#007A22" stroke-width="0.8"/>
<rect x="129" y="126" width="5" height="11" rx="1.5" fill="#060E06" stroke="#007A22" stroke-width="0.8"/>
<rect x="147" y="130" width="5" height="11" rx="1.5" fill="#060E06" stroke="#007A22" stroke-width="0.8"/>
<!-- fuselage (wider) -->
<path d="M80,20 L96,48 L100,90 L96,135 L88,152 L80,156 L72,152 L64,135 L60,90 L64,48Z" fill="#0A160A" stroke="#00DD44" stroke-width="1.5"/>
<line x1="80" y1="24" x2="80" y2="152" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<line x1="60" y1="92" x2="100" y2="92" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<line x1="62" y1="118" x2="98" y2="118" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<!-- cockpit -->
<ellipse cx="80" cy="46" rx="12" ry="15" fill="#001808" stroke="#00EE55" stroke-width="1.2"/>
<ellipse cx="80" cy="45" rx="7.5" ry="10" fill="#002A12" opacity="0.9"/>
<ellipse cx="76" cy="39" rx="2.5" ry="3.5" fill="#00FF66" opacity="0.2"/>
<!-- nose cannon array -->
<line x1="74" y1="20" x2="74" y2="12" stroke="#00CC44" stroke-width="1.4"/>
<line x1="80" y1="20" x2="80" y2="11" stroke="#00CC44" stroke-width="1.6"/>
<line x1="86" y1="20" x2="86" y2="12" stroke="#00CC44" stroke-width="1.4"/>
<!-- twin engines -->
<rect x="67" y="140" width="12" height="18" rx="4" fill="#060E06" stroke="#00AA33" stroke-width="1.1"/>
<rect x="81" y="140" width="12" height="18" rx="4" fill="#060E06" stroke="#00AA33" stroke-width="1.1"/>
<ellipse cx="73" cy="159" rx="8" ry="5" fill="url(#eg2a)" filter="url(#gf2)"/>
<ellipse cx="87" cy="159" rx="8" ry="5" fill="url(#eg2b)" filter="url(#gf2)"/>
</svg>`
  },

  {
    tier: 3, name: 'Marauder Gunship', cls: 'Assault Gunship',
    hullRange: [7, 10],
    desc: 'Twin-boom gunship with heavy forward armament. Y-Wing lineage.',
    viewBox: '0 0 160 200',
    svg: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" class="ship-preview-svg">
<defs>
  <radialGradient id="eg3a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#AAFFCC"/><stop offset="100%" stop-color="#00DD44" stop-opacity="0"/></radialGradient>
  <radialGradient id="eg3b" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#AAFFCC"/><stop offset="100%" stop-color="#00DD44" stop-opacity="0"/></radialGradient>
  <filter id="gf3" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<!-- left engine boom -->
<path d="M50,58 L36,54 L28,150 L44,156 L60,150 L52,60Z" fill="#0A160A" stroke="#00AA33" stroke-width="1.2"/>
<!-- right engine boom -->
<path d="M110,58 L124,54 L132,150 L116,156 L100,150 L108,60Z" fill="#0A160A" stroke="#00AA33" stroke-width="1.2"/>
<!-- struts -->
<path d="M60,78 L68,78 L68,82 L60,82Z" fill="#007A22"/>
<path d="M92,78 L100,78 L100,82 L92,82Z" fill="#007A22"/>
<path d="M60,108 L68,108 L68,112 L60,112Z" fill="#007A22"/>
<path d="M92,108 L100,108 L100,112 L92,112Z" fill="#007A22"/>
<!-- center hull -->
<path d="M80,22 L92,52 L96,105 L92,140 L80,148 L68,140 L64,105 L68,52Z" fill="#0A160A" stroke="#00DD44" stroke-width="1.5"/>
<line x1="80" y1="26" x2="80" y2="144" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<line x1="64" y1="95" x2="96" y2="95" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<!-- cockpit -->
<ellipse cx="80" cy="50" rx="9" ry="11" fill="#001808" stroke="#00EE55" stroke-width="1.2"/>
<ellipse cx="80" cy="49" rx="5.5" ry="7" fill="#002A12" opacity="0.9"/>
<!-- nose weapon bar -->
<rect x="68" y="18" width="24" height="7" rx="2" fill="#060E06" stroke="#00CC44" stroke-width="1"/>
<line x1="72" y1="18" x2="72" y2="10" stroke="#00CC44" stroke-width="1.4"/>
<line x1="80" y1="18" x2="80" y2="9" stroke="#00CC44" stroke-width="1.6"/>
<line x1="88" y1="18" x2="88" y2="10" stroke="#00CC44" stroke-width="1.4"/>
<!-- left nacelle -->
<rect x="28" y="138" width="20" height="22" rx="5" fill="#060E06" stroke="#00AA33" stroke-width="1.1"/>
<ellipse cx="38" cy="162" rx="11" ry="6" fill="url(#eg3a)" filter="url(#gf3)"/>
<!-- right nacelle -->
<rect x="112" y="138" width="20" height="22" rx="5" fill="#060E06" stroke="#00AA33" stroke-width="1.1"/>
<ellipse cx="122" cy="162" rx="11" ry="6" fill="url(#eg3b)" filter="url(#gf3)"/>
<!-- side turrets on booms -->
<rect x="24" y="90" width="10" height="8" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="24" y1="94" x2="14" y2="90" stroke="#00AA33" stroke-width="1.2"/>
<rect x="126" y="90" width="10" height="8" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="136" y1="94" x2="146" y2="90" stroke="#00AA33" stroke-width="1.2"/>
</svg>`
  },

  {
    tier: 4, name: 'Valiant Corvette', cls: 'Strike Corvette',
    hullRange: [11, 15],
    desc: 'Multi-crew strike corvette. Sponson turrets, triple engines.',
    viewBox: '0 0 160 200',
    svg: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" class="ship-preview-svg">
<defs>
  <radialGradient id="eg4a" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#AAFFCC"/><stop offset="100%" stop-color="#00DD44" stop-opacity="0"/></radialGradient>
  <radialGradient id="eg4b" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#AAFFCC"/><stop offset="100%" stop-color="#00DD44" stop-opacity="0"/></radialGradient>
  <radialGradient id="eg4c" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="#AAFFCC"/><stop offset="100%" stop-color="#00DD44" stop-opacity="0"/></radialGradient>
  <filter id="gf4" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<!-- left weapon sponson -->
<path d="M56,88 L22,82 L16,118 L22,122 L56,116Z" fill="#0A160A" stroke="#00AA33" stroke-width="1.1"/>
<!-- right weapon sponson -->
<path d="M104,88 L138,82 L144,118 L138,122 L104,116Z" fill="#0A160A" stroke="#00AA33" stroke-width="1.1"/>
<!-- turrets left -->
<rect x="12" y="85" width="12" height="9" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="12" y1="89" x2="3" y2="86" stroke="#00CC44" stroke-width="1.3"/>
<rect x="12" y="100" width="12" height="9" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="12" y1="104" x2="2" y2="101" stroke="#00CC44" stroke-width="1.3"/>
<rect x="12" y="115" width="12" height="9" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="12" y1="119" x2="3" y2="116" stroke="#00CC44" stroke-width="1.3"/>
<!-- turrets right -->
<rect x="136" y="85" width="12" height="9" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="148" y1="89" x2="157" y2="86" stroke="#00CC44" stroke-width="1.3"/>
<rect x="136" y="100" width="12" height="9" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="148" y1="104" x2="158" y2="101" stroke="#00CC44" stroke-width="1.3"/>
<rect x="136" y="115" width="12" height="9" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="148" y1="119" x2="157" y2="116" stroke="#00CC44" stroke-width="1.3"/>
<!-- main hull -->
<path d="M80,12 L100,36 L106,88 L108,152 L100,174 L86,182 L80,184 L74,182 L60,174 L52,152 L54,88 L60,36Z" fill="#0A160A" stroke="#00DD44" stroke-width="1.5"/>
<!-- hull plating -->
<line x1="80" y1="16" x2="80" y2="180" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<line x1="54" y1="90" x2="106" y2="90" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<line x1="54" y1="130" x2="106" y2="130" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<line x1="56" y1="155" x2="104" y2="155" stroke="#007A22" stroke-width="0.7" opacity="0.7"/>
<!-- command bridge (front section) -->
<rect x="70" y="22" width="20" height="16" rx="2" fill="#001808" stroke="#00EE55" stroke-width="1.1"/>
<ellipse cx="80" cy="38" rx="10" ry="8" fill="#001808" stroke="#00EE55" stroke-width="1"/>
<ellipse cx="80" cy="37" rx="6" ry="5" fill="#002A12" opacity="0.9"/>
<!-- triple engines -->
<rect x="57" y="174" width="14" height="18" rx="4" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<rect x="73" y="172" width="14" height="22" rx="4" fill="#060E06" stroke="#00AA33" stroke-width="1.1"/>
<rect x="89" y="174" width="14" height="18" rx="4" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<ellipse cx="64" cy="193" rx="8" ry="4.5" fill="url(#eg4a)" filter="url(#gf4)"/>
<ellipse cx="80" cy="195" rx="9" ry="5" fill="url(#eg4b)" filter="url(#gf4)"/>
<ellipse cx="96" cy="193" rx="8" ry="4.5" fill="url(#eg4c)" filter="url(#gf4)"/>
</svg>`
  },

  {
    tier: 5, name: 'Sovereign Dreadnought', cls: 'Capital Ship',
    hullRange: [16, 999],
    desc: 'Fleet command dreadnought. Wedge-class. 12 turret batteries.',
    viewBox: '0 0 160 200',
    svg: `<svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg" class="ship-preview-svg">
<defs>
  <filter id="gf5" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
</defs>
<!-- main wedge hull -->
<path d="M80,10 L152,178 L8,178Z" fill="#0A160A" stroke="#00DD44" stroke-width="1.6"/>
<!-- hull plating -->
<line x1="80" y1="10" x2="80" y2="178" stroke="#007A22" stroke-width="0.7" opacity="0.6"/>
<line x1="80" y1="10" x2="26" y2="178" stroke="#007A22" stroke-width="0.6" opacity="0.5"/>
<line x1="80" y1="10" x2="134" y2="178" stroke="#007A22" stroke-width="0.6" opacity="0.5"/>
<line x1="62" y1="55" x2="98" y2="55" stroke="#007A22" stroke-width="0.8" opacity="0.7"/>
<line x1="46" y1="95" x2="114" y2="95" stroke="#007A22" stroke-width="0.8" opacity="0.7"/>
<line x1="30" y1="138" x2="130" y2="138" stroke="#007A22" stroke-width="0.8" opacity="0.7"/>
<!-- bridge tower base -->
<rect x="68" y="22" width="24" height="38" rx="2" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<!-- command tower -->
<rect x="72" y="14" width="16" height="16" rx="2" fill="#060E06" stroke="#00EE55" stroke-width="1.1"/>
<rect x="74" y="10" width="12" height="8" rx="1" fill="#001808" stroke="#00EE55" stroke-width="1"/>
<!-- bridge viewport -->
<rect x="74" y="15" width="12" height="6" rx="1" fill="#002A12" stroke="#00EE55" stroke-width="0.8"/>
<!-- left batteries (3 pairs) -->
<rect x="35" y="88" width="13" height="8" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="35" y1="92" x2="22" y2="88" stroke="#00CC44" stroke-width="1.3"/>
<line x1="35" y1="94" x2="22" y2="98" stroke="#00CC44" stroke-width="1.3"/>
<rect x="22" y="118" width="13" height="8" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="22" y1="122" x2="8" y2="118" stroke="#00CC44" stroke-width="1.3"/>
<line x1="22" y1="124" x2="8" y2="128" stroke="#00CC44" stroke-width="1.3"/>
<rect x="14" y="146" width="12" height="8" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="14" y1="150" x2="3" y2="146" stroke="#00CC44" stroke-width="1.2"/>
<!-- right batteries -->
<rect x="112" y="88" width="13" height="8" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="125" y1="92" x2="138" y2="88" stroke="#00CC44" stroke-width="1.3"/>
<line x1="125" y1="94" x2="138" y2="98" stroke="#00CC44" stroke-width="1.3"/>
<rect x="125" y="118" width="13" height="8" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="138" y1="122" x2="152" y2="118" stroke="#00CC44" stroke-width="1.3"/>
<line x1="138" y1="124" x2="152" y2="128" stroke="#00CC44" stroke-width="1.3"/>
<rect x="134" y="146" width="12" height="8" rx="2" fill="#060E06" stroke="#007A22" stroke-width="0.9"/>
<line x1="146" y1="150" x2="157" y2="146" stroke="#00CC44" stroke-width="1.2"/>
<!-- engine bank -->
<rect x="14" y="168" width="13" height="10" rx="2" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<rect x="30" y="168" width="13" height="10" rx="2" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<rect x="47" y="168" width="13" height="10" rx="2" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<rect x="64" y="167" width="14" height="12" rx="2" fill="#060E06" stroke="#00AA33" stroke-width="1.1"/>
<rect x="82" y="167" width="14" height="12" rx="2" fill="#060E06" stroke="#00AA33" stroke-width="1.1"/>
<rect x="100" y="168" width="13" height="10" rx="2" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<rect x="117" y="168" width="13" height="10" rx="2" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<rect x="133" y="168" width="13" height="10" rx="2" fill="#060E06" stroke="#00AA33" stroke-width="1"/>
<!-- engine glow row -->
<ellipse cx="20" cy="179" rx="7" ry="3.5" fill="#00DD44" opacity="0.5" filter="url(#gf5)"/>
<ellipse cx="37" cy="179" rx="7" ry="3.5" fill="#00DD44" opacity="0.5" filter="url(#gf5)"/>
<ellipse cx="53" cy="179" rx="7" ry="3.5" fill="#00DD44" opacity="0.5" filter="url(#gf5)"/>
<ellipse cx="71" cy="180" rx="8" ry="4" fill="#00DD44" opacity="0.6" filter="url(#gf5)"/>
<ellipse cx="89" cy="180" rx="8" ry="4" fill="#00DD44" opacity="0.6" filter="url(#gf5)"/>
<ellipse cx="107" cy="179" rx="7" ry="3.5" fill="#00DD44" opacity="0.5" filter="url(#gf5)"/>
<ellipse cx="123" cy="179" rx="7" ry="3.5" fill="#00DD44" opacity="0.5" filter="url(#gf5)"/>
<ellipse cx="140" cy="179" rx="7" ry="3.5" fill="#00DD44" opacity="0.5" filter="url(#gf5)"/>
<!-- hangar bay cutout -->
<rect x="58" y="162" width="44" height="8" rx="1" fill="#000" stroke="#007A22" stroke-width="0.8"/>
<line x1="62" y1="162" x2="62" y2="170" stroke="#007A22" stroke-width="0.6" opacity="0.7"/>
<line x1="98" y1="162" x2="98" y2="170" stroke="#007A22" stroke-width="0.6" opacity="0.7"/>
</svg>`
  }
];

function shipForHull(hullLevel) {
  for (let i = SHIPS.length - 1; i >= 0; i--) {
    if (hullLevel >= SHIPS[i].hullRange[0]) return SHIPS[i];
  }
  return SHIPS[0];
}

function randomShip() {
  return SHIPS[Math.floor(Math.random() * SHIPS.length)];
}
