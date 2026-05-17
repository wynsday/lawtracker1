const SKIN    = '#5c9e48'
const SKIN_DK = '#4a8338'
const EAR_IN  = '#7a4535'
const EYE_W   = '#f8f4e8'
const PUPIL   = '#1a0820'

export function GremlinRosie() {
  return (
    <svg viewBox="0 0 118 132" width="118" height="132" role="img" aria-label="Rosie the gremlin mechanic">
      <rect width="118" height="132" rx="10" fill="#1a0820"/>
      <rect x="2.5" y="2.5" width="113" height="127" rx="8" fill="none" stroke="#C00000" strokeWidth="2"/>
      <rect x="5.5" y="5.5" width="107" height="121" rx="6" fill="none" stroke="#C00000" strokeWidth=".75" strokeOpacity=".35"/>
      <text x="9"   y="18"  fontSize="9" fill="#C00000" opacity=".6">★</text>
      <text x="102" y="18"  fontSize="9" fill="#C00000" opacity=".6">★</text>
      <text x="9"   y="128" fontSize="9" fill="#C00000" opacity=".6">★</text>
      <text x="102" y="128" fontSize="9" fill="#C00000" opacity=".6">★</text>

      {/* body */}
      <path d="M24,132 L24,107 Q24,93 59,91 Q94,93 94,107 L94,132 Z" fill="#1e3c8c"/>

      {/* raised right arm */}
      <path d="M92,103 C100,88 108,74 105,62 C103,55 96,54 95,60 C99,69 97,82 90,100 Z" fill="#1e3c8c"/>
      <ellipse cx="102" cy="59" rx="8" ry="7" fill={SKIN}/>
      <path d="M96,57 Q102,53 108,57" stroke={SKIN_DK} strokeWidth="1" fill="none"/>
      <line x1="97"  y1="55" x2="97"  y2="63" stroke={SKIN_DK} strokeWidth=".8"/>
      <line x1="101" y1="53" x2="101" y2="62" stroke={SKIN_DK} strokeWidth=".8"/>
      <line x1="105" y1="54" x2="105" y2="62" stroke={SKIN_DK} strokeWidth=".8"/>
      <path d="M90,100 Q100,97 108,93 L106,86 Q97,90 90,93 Z" fill="#c8a030"/>

      {/* left arm + wrench */}
      <path d="M26,103 C18,112 14,122 13,128" stroke="#1e3c8c" strokeWidth="10" strokeLinecap="round" fill="none"/>
      <ellipse cx="12" cy="128" rx="7" ry="5.5" fill={SKIN}/>
      <rect x="4" y="127" width="20" height="3" rx="1.5" fill="#8a8a8a"/>
      <circle cx="4"  cy="128.5" r="4.5" fill="none" stroke="#8a8a8a" strokeWidth="1.8"/>
      <circle cx="24" cy="128.5" r="4.5" fill="none" stroke="#8a8a8a" strokeWidth="1.8"/>
      <ellipse cx="21" cy="109" rx="7" ry="4.5" fill="#c8a030"/>

      {/* collar */}
      <path d="M51,92 L59,97 L67,92 L70,99 L59,103 L48,99 Z" fill="#e8e8f0"/>

      {/* neck */}
      <rect x="54" y="80" width="10" height="14" rx="5" fill={SKIN}/>

      {/* head */}
      <ellipse cx="59" cy="64" rx="22" ry="20" fill={SKIN}/>

      {/* ears */}
      <polygon points="37,67 29,48 43,62" fill={SKIN}/>
      <polygon points="37,66 32,51 42,62" fill={EAR_IN}/>
      <polygon points="81,67 89,48 75,62" fill={SKIN}/>
      <polygon points="81,66 86,51 76,62" fill={EAR_IN}/>

      {/* bandana */}
      <path d="M37,61 Q59,45 81,61 L80,55 Q59,39 38,55 Z" fill="#C00000"/>
      <ellipse cx="59" cy="42" rx="8" ry="6" fill="#C00000"/>
      <path d="M53,42 Q59,38 65,42" stroke="#8a0000" strokeWidth="1.5" fill="none"/>
      <circle cx="46" cy="54" r="2"   fill="white" opacity=".5"/>
      <circle cx="59" cy="49" r="2"   fill="white" opacity=".5"/>
      <circle cx="72" cy="54" r="2"   fill="white" opacity=".5"/>
      <circle cx="39" cy="59" r="1.5" fill="white" opacity=".4"/>
      <circle cx="79" cy="59" r="1.5" fill="white" opacity=".4"/>

      {/* eyes */}
      <ellipse cx="50" cy="65" rx="7" ry="7" fill={EYE_W}/>
      <ellipse cx="68" cy="65" rx="7" ry="7" fill={EYE_W}/>
      <circle cx="51" cy="66" r="4"        fill={PUPIL}/>
      <circle cx="69" cy="66" r="4"        fill={PUPIL}/>
      <circle cx="52.5" cy="64.5" r="1.5"  fill="white"/>
      <circle cx="70.5" cy="64.5" r="1.5"  fill="white"/>

      {/* eyebrows — determined */}
      <path d="M43,58 Q50,54 57,58" stroke="#2a4218" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M61,58 Q68,54 75,58" stroke="#2a4218" strokeWidth="2.5" fill="none" strokeLinecap="round"/>

      {/* nose */}
      <ellipse cx="59" cy="73" rx="4" ry="3" fill={SKIN_DK}/>
      <circle cx="57" cy="74.5" r="1.2" fill="#3a7028" opacity=".7"/>
      <circle cx="61" cy="74.5" r="1.2" fill="#3a7028" opacity=".7"/>

      {/* smirk */}
      <path d="M52,79 Q61,86 67,79" stroke="#7a2020" strokeWidth="1.5" fill="#c04040" strokeLinecap="round"/>

      <text x="59" y="130" textAnchor="middle" fontFamily="'Quicksand', sans-serif" fontSize="10" fontWeight="700" fill="#C00000" letterSpacing=".15em">ROSIE</text>
    </svg>
  )
}

export function GremlinAce() {
  return (
    <svg viewBox="0 0 118 132" width="118" height="132" role="img" aria-label="Ace the gremlin aviator">
      <rect width="118" height="132" rx="10" fill="#1a0820"/>
      <rect x="2.5" y="2.5" width="113" height="127" rx="8" fill="none" stroke="#c8a030" strokeWidth="2"/>
      <rect x="5.5" y="5.5" width="107" height="121" rx="6" fill="none" stroke="#c8a030" strokeWidth=".75" strokeOpacity=".35"/>
      <text x="9"   y="18"  fontSize="9" fill="#c8a030" opacity=".6">★</text>
      <text x="102" y="18"  fontSize="9" fill="#c8a030" opacity=".6">★</text>
      <text x="9"   y="128" fontSize="9" fill="#c8a030" opacity=".6">★</text>
      <text x="102" y="128" fontSize="9" fill="#c8a030" opacity=".6">★</text>

      {/* body — leather jacket */}
      <path d="M24,132 L24,107 Q24,93 59,91 Q94,93 94,107 L94,132 Z" fill="#5a3018"/>

      {/* thumbs-up arm */}
      <path d="M92,103 C100,91 106,79 103,68" stroke="#5a3018" strokeWidth="9" strokeLinecap="round" fill="none"/>
      <ellipse cx="102" cy="68" rx="8" ry="6" fill={SKIN}/>
      <path d="M98,65 Q99,52 103,50 Q107,52 106,65" fill={SKIN} stroke={SKIN_DK} strokeWidth=".5"/>
      <ellipse cx="103" cy="51" rx="2.5" ry="2" fill={SKIN_DK} opacity=".6"/>

      {/* left arm */}
      <path d="M26,103 L18,118" stroke="#5a3018" strokeWidth="10" strokeLinecap="round" fill="none"/>

      {/* jacket collar + scarf */}
      <path d="M44,91 L59,98 L74,91 L72,86 L59,94 L46,86 Z" fill="#7a4520"/>
      <path d="M47,88 Q59,83 71,88" stroke="#c8a060" strokeWidth="4" fill="none" strokeLinecap="round"/>

      {/* pilot wings patch */}
      <ellipse cx="45" cy="103" rx="13" ry="3"  fill="#c8a030" opacity=".7"/>
      <ellipse cx="73" cy="103" rx="13" ry="3"  fill="#c8a030" opacity=".7"/>
      <circle  cx="59" cy="103" r="4.5"          fill="#c8a030" opacity=".85"/>
      <text x="59" y="105" textAnchor="middle" fontSize="5" fill="#1a0820" fontWeight="700">★</text>

      {/* neck */}
      <rect x="54" y="80" width="10" height="14" rx="5" fill={SKIN}/>

      {/* head */}
      <ellipse cx="59" cy="64" rx="22" ry="20" fill={SKIN}/>

      {/* ears */}
      <polygon points="37,67 29,48 43,62" fill={SKIN}/>
      <polygon points="37,66 32,51 42,62" fill={EAR_IN}/>
      <polygon points="81,67 89,48 75,62" fill={SKIN}/>
      <polygon points="81,66 86,51 76,62" fill={EAR_IN}/>

      {/* goggles on forehead */}
      <path d="M37,56 Q59,48 81,56" stroke="#5a2a10" strokeWidth="6" fill="none" strokeLinecap="round"/>
      <ellipse cx="48" cy="56" rx="9" ry="7" fill="#c89500" fillOpacity=".2" stroke="#5a2a10" strokeWidth="1.5"/>
      <ellipse cx="70" cy="56" rx="9" ry="7" fill="#c89500" fillOpacity=".2" stroke="#5a2a10" strokeWidth="1.5"/>
      <line x1="57" y1="56" x2="61" y2="56" stroke="#5a2a10" strokeWidth="2"/>
      <ellipse cx="45" cy="53" rx="3" ry="2" fill="white" opacity=".18"/>
      <ellipse cx="67" cy="53" rx="3" ry="2" fill="white" opacity=".18"/>

      {/* eyes */}
      <ellipse cx="50" cy="69" rx="7" ry="7" fill={EYE_W}/>
      <ellipse cx="68" cy="69" rx="7" ry="7" fill={EYE_W}/>
      <circle cx="51" cy="70" r="4"        fill={PUPIL}/>
      <circle cx="69" cy="70" r="4"        fill={PUPIL}/>
      <circle cx="52.5" cy="68.5" r="1.5"  fill="white"/>
      <circle cx="70.5" cy="68.5" r="1.5"  fill="white"/>

      {/* mischievous eyebrows */}
      <path d="M43,62 Q50,59 57,63" stroke="#2a4218" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M61,63 Q68,59 75,62" stroke="#2a4218" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* nose */}
      <ellipse cx="59" cy="76" rx="4" ry="3" fill={SKIN_DK}/>
      <circle cx="57" cy="77.5" r="1.2" fill="#3a7028" opacity=".7"/>
      <circle cx="61" cy="77.5" r="1.2" fill="#3a7028" opacity=".7"/>

      {/* wide grin with teeth */}
      <path d="M49,82 Q59,92 69,82" stroke="#7a2020" strokeWidth="1.5" fill="#b03030" strokeLinecap="round"/>
      <path d="M51,82 Q59,90 67,82 Z" fill="#e04040"/>
      <path d="M51,82 Q59,90 67,82" stroke="white" strokeWidth="2.5" fill="none" opacity=".65"/>
      <line x1="57" y1="82" x2="57" y2="88" stroke="#b03030" strokeWidth=".8" opacity=".5"/>
      <line x1="61" y1="82" x2="61" y2="88" stroke="#b03030" strokeWidth=".8" opacity=".5"/>

      <text x="59" y="130" textAnchor="middle" fontFamily="'Quicksand', sans-serif" fontSize="10" fontWeight="700" fill="#c8a030" letterSpacing=".22em">ACE</text>
    </svg>
  )
}

export function GremlinVera() {
  return (
    <svg viewBox="0 0 118 132" width="118" height="132" role="img" aria-label="Gremlin mechanic">
      {/* card background — first so character renders over it */}
      <rect width="118" height="132" rx="10" fill="#1a0820"/>

      {/* left arm */}
      <path d="M30,107 C16,118 10,127 9,132" stroke="#1a1a3a" strokeWidth="15" strokeLinecap="round" fill="none"/>
      {/* right arm */}
      <path d="M88,107 C102,118 108,127 109,132" stroke="#1a1a3a" strokeWidth="15" strokeLinecap="round" fill="none"/>

      {/* body — slim blazer */}
      <path d="M28,132 L28,108 Q28,93 59,91 Q90,93 90,108 L90,132 Z" fill="#1a1a3a"/>

      {/* blazer lapels */}
      <path d="M43,91 L59,98 L75,91 L77,98 L59,105 L41,98 Z" fill="#2a2a4a"/>
      <path d="M51,93 L59,98 L67,93 L65,99 L59,103 L53,99 Z" fill="#e8e8f0"/>

      {/* buttons down placket */}
      <line x1="59" y1="105" x2="59" y2="132" stroke="#12122a" strokeWidth=".8" opacity=".6"/>
      <circle cx="59" cy="109" r="1.8" fill="#b0b8c8" stroke="#606878" strokeWidth=".6"/>
      <circle cx="59" cy="116" r="1.8" fill="#b0b8c8" stroke="#606878" strokeWidth=".6"/>
      <circle cx="59" cy="123" r="1.8" fill="#b0b8c8" stroke="#606878" strokeWidth=".6"/>
      <circle cx="59" cy="130" r="1.8" fill="#b0b8c8" stroke="#606878" strokeWidth=".6"/>

      {/* mechanic patch — right side of image (character's left chest) */}
      <rect x="67" y="108" width="19" height="10" rx="2.5" fill="#d4c4a0" stroke="#8a7050" strokeWidth="1" strokeDasharray="2,1"/>
      <text x="76.5" y="116" textAnchor="middle" fontFamily="'Quicksand', sans-serif" fontSize="6" fontWeight="700" fill="#2a1810" letterSpacing=".08em">W4SP</text>

      {/* neck */}
      <rect x="54" y="79" width="10" height="14" rx="5" fill={SKIN}/>

      {/* left ear */}
      <polygon points="39,68 27,47 41,62" fill={SKIN}/>
      <polygon points="39,67 30,50 40,62" fill={EAR_IN}/>
      {/* right ear */}
      <polygon points="79,68 91,47 77,62" fill={SKIN}/>
      <polygon points="79,67 88,50 78,62" fill={EAR_IN}/>

      {/* head — large, extended chin to contain mouth */}
      <ellipse cx="59" cy="65" rx="21" ry="22" fill={SKIN}/>

      {/* victory roll hair */}
      <path d="M36,53 Q59,42 82,53" stroke="#1a1230" strokeWidth="9"  fill="none" strokeLinecap="round"/>
      <path d="M37,54 Q59,44 81,54" stroke="#2a2040" strokeWidth="5"  fill="none" strokeLinecap="round"/>
      <ellipse cx="37" cy="51" rx="10" ry="12" fill="#1a1230" transform="rotate(-20 37 51)"/>
      <ellipse cx="38" cy="52" rx="7"  ry="9"  fill="#2a2040" transform="rotate(-20 38 52)"/>
      <ellipse cx="39" cy="53" rx="4"  ry="6"  fill="#1a1230" transform="rotate(-20 39 53)"/>
      <ellipse cx="81" cy="51" rx="10" ry="12" fill="#1a1230" transform="rotate(20 81 51)"/>
      <ellipse cx="80" cy="52" rx="7"  ry="9"  fill="#2a2040" transform="rotate(20 80 52)"/>
      <ellipse cx="79" cy="53" rx="4"  ry="6"  fill="#1a1230" transform="rotate(20 79 53)"/>

      {/* eyes */}
      <ellipse cx="50" cy="65" rx="7" ry="7" fill={EYE_W}/>
      <ellipse cx="68" cy="65" rx="7" ry="7" fill={EYE_W}/>
      <circle cx="51"  cy="66"   r="4"   fill={PUPIL}/>
      <circle cx="69"  cy="66"   r="4"   fill={PUPIL}/>
      <circle cx="52.5" cy="64.5" r="1.5" fill="white"/>
      <circle cx="70.5" cy="64.5" r="1.5" fill="white"/>

      {/* confident arched eyebrows */}
      <path d="M43,58 Q50,54 57,58" stroke="#2a4218" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M61,58 Q68,54 75,58" stroke="#2a4218" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* nose */}
      <ellipse cx="59" cy="73" rx="4" ry="3" fill={SKIN_DK}/>
      <circle cx="57" cy="74.5" r="1.2" fill="#3a7028" opacity=".7"/>
      <circle cx="61" cy="74.5" r="1.2" fill="#3a7028" opacity=".7"/>

      {/* confident smile */}
      <path d="M52,79 Q59,86 66,79" stroke="#7a2020" strokeWidth="1.5" fill="#c04040" strokeLinecap="round"/>
      <path d="M54,79 Q59,85 64,79 Z" fill="#e04040"/>

      {/* portrait frame — drawn last so it sits on top */}
      <rect x="2.5" y="2.5" width="113" height="127" rx="8" fill="none" stroke="#7a50c8" strokeWidth="2"/>
      <rect x="5.5" y="5.5" width="107" height="121" rx="6" fill="none" stroke="#7a50c8" strokeWidth=".75" strokeOpacity=".35"/>
      <text x="9"   y="18"  fontSize="9" fill="#7a50c8" opacity=".6">★</text>
      <text x="102" y="18"  fontSize="9" fill="#7a50c8" opacity=".6">★</text>
      <text x="9"   y="128" fontSize="9" fill="#7a50c8" opacity=".6">★</text>
      <text x="102" y="128" fontSize="9" fill="#7a50c8" opacity=".6">★</text>
    </svg>
  )
}

export function GremlinEggPortrait() {
  return (
    <svg viewBox="0 0 118 132" width="118" height="132" role="img" aria-label="Gremlin engineer">
      <defs>
        <radialGradient id="eg2-skin" cx="45%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#7fcf58"/>
          <stop offset="100%" stopColor="#4a8838"/>
        </radialGradient>
      </defs>

      {/* card background */}
      <rect width="118" height="132" rx="10" fill="#1a0820"/>

      {/* victory buns — large, at crown, behind head */}
      <circle cx="38" cy="40" r="14" fill="#1a1230"/>
      <circle cx="38" cy="40" r="9"  fill="#2a2040"/>
      <circle cx="36" cy="36" r="3"  fill="white" opacity=".15"/>
      <circle cx="80" cy="40" r="14" fill="#1a1230"/>
      <circle cx="80" cy="40" r="9"  fill="#2a2040"/>
      <circle cx="78" cy="36" r="3"  fill="white" opacity=".15"/>
      <path d="M38,40 Q59,24 80,40" stroke="#1a1230" strokeWidth="9" fill="none" strokeLinecap="round"/>

      {/* ears */}
      <polygon points="42,60 26,38 46,54" fill="url(#eg2-skin)"/>
      <polygon points="42,58 30,41 45,54" fill="#7a4535"/>
      <polygon points="76,60 92,38 72,54" fill="url(#eg2-skin)"/>
      <polygon points="76,58 88,41 73,54" fill="#7a4535"/>

      {/* neck — before head so head covers the overlap */}
      <rect x="53" y="62" width="12" height="18" rx="5" fill="url(#eg2-skin)"/>

      {/* head — 34 units tall (ry=17) */}
      <ellipse cx="59" cy="47" rx="16" ry="17" fill="url(#eg2-skin)"/>

      {/* eyes */}
      <ellipse cx="50" cy="46" rx="6" ry="6" fill="#f8f4e8"/>
      <ellipse cx="68" cy="46" rx="6" ry="6" fill="#f8f4e8"/>
      <circle  cx="51" cy="47" r="3.8" fill="#1a0820"/>
      <circle  cx="69" cy="47" r="3.8" fill="#1a0820"/>
      <circle  cx="52.5" cy="45.5" r="1.5" fill="white"/>
      <circle  cx="70.5" cy="45.5" r="1.5" fill="white"/>

      {/* confident arched eyebrows */}
      <path d="M43,39 Q50,35 57,39" stroke="#2a4218" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M61,39 Q68,35 75,39" stroke="#2a4218" strokeWidth="2" fill="none" strokeLinecap="round"/>

      {/* nose */}
      <ellipse cx="59" cy="53" rx="4" ry="3" fill="#4a8838"/>
      <circle cx="57" cy="55" r="1.3" fill="#3a7028" opacity=".7"/>
      <circle cx="61" cy="55" r="1.3" fill="#3a7028" opacity=".7"/>

      {/* mouth — line only, no lip fill */}
      <path d="M50,60 Q59,67 68,60" stroke="#5a2020" strokeWidth="1.5" fill="none" strokeLinecap="round"/>

      {/* overall pants */}
      <path d="M28,108 L28,122 Q28,132 59,132 Q90,132 90,122 L90,108 Z" fill="#8B4513"/>

      {/* center leg seam */}
      <line x1="59" y1="108" x2="59" y2="132" stroke="#5a2808" strokeWidth="1.5" opacity=".7"/>

      {/* overall bib */}
      <rect x="30" y="76" width="58" height="35" rx="3" fill="#7a3810"/>

      {/* shoulder straps */}
      <rect x="30" y="73" width="11" height="28" rx="3" fill="#9a4a18"/>
      <rect x="77" y="73" width="11" height="28" rx="3" fill="#9a4a18"/>

      {/* W4SP center pocket */}
      <rect x="41"   y="85"   width="36" height="22" rx="3" fill="#5a2808"/>
      <rect x="43.5" y="87.5" width="31" height="17" rx="2" fill="none" stroke="#c8a060" strokeWidth="1" strokeDasharray="3,1.5"/>
      <text x="59" y="101" textAnchor="middle" fontFamily="'Quicksand', sans-serif" fontSize="11" fontWeight="700" fill="#d4c4a0" letterSpacing=".08em">W4SP</text>

      {/* left arm */}
      <path d="M30,107 C18,118 12,126 9,132" stroke="#4a8838" strokeWidth="14" strokeLinecap="round" fill="none"/>

      {/* right arm — raised, holding wrench */}
      <path d="M88,100 C96,88 100,76 100,66" stroke="#4a8838" strokeWidth="14" strokeLinecap="round" fill="none"/>

      {/* fist */}
      <rect x="93" y="61" width="18" height="12" rx="6" fill="url(#eg2-skin)"/>
      <path d="M94,67 Q102,65 110,67" stroke="#3a7828" strokeWidth="1.2" fill="none"/>
      <ellipse cx="92" cy="67" rx="4" ry="3" fill="url(#eg2-skin)" transform="rotate(-15 92 67)"/>

      {/* open-end wrench — horizontal, jaws face left */}
      <rect x="76"  y="54" width="19" height="7"  rx="2.5" fill="#9a9a9a"/>
      <rect x="76"  y="69" width="19" height="7"  rx="2.5" fill="#9a9a9a"/>
      <rect x="94"  y="56" width="18" height="18" rx="2.5" fill="#9a9a9a"/>
      <rect x="76"  y="61" width="18" height="8"           fill="#1a0820"/>


      {/* portrait frame — drawn last so it sits on top */}
      <rect x="2.5" y="2.5" width="113" height="127" rx="8" fill="none" stroke="#3a7828" strokeWidth="2"/>
      <rect x="5.5" y="5.5" width="107" height="121" rx="6" fill="none" stroke="#3a7828" strokeWidth=".75" strokeOpacity=".35"/>
      <text x="9"   y="18"  fontSize="9" fill="#3a7828" opacity=".6">★</text>
      <text x="102" y="18"  fontSize="9" fill="#3a7828" opacity=".6">★</text>
      <text x="9"   y="128" fontSize="9" fill="#3a7828" opacity=".6">★</text>
      <text x="102" y="128" fontSize="9" fill="#3a7828" opacity=".6">★</text>
    </svg>
  )
}
