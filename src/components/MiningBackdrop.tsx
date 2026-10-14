import React from 'react';

const COAL_FRAGMENTS = [
  ...Array.from({ length: 20 }, (_, index) => ({
    className: `mining-coal mining-coal-${index + 1}`,
  })),
];

const EMBERS = Array.from({ length: 12 }, (_, index) => `mining-ember-${index + 1}`);

export const MiningBackdrop: React.FC = () => (
  <div className="mining-backdrop" aria-hidden="true">
    <div className="mining-backdrop-glow" />
    <div className="mining-backdrop-particles">
      {COAL_FRAGMENTS.map(({ className }) => <span key={className} className={className} />)}
      {EMBERS.map((className) => <span key={className} className={`mining-ember ${className}`} />)}
    </div>

    <svg
      className="mining-side-machine mining-side-excavator"
      viewBox="0 0 300 250"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M28 205H220L249 222H42L28 205Z" fill="#151A22" stroke="#D89B2B" strokeOpacity=".78" strokeWidth="3" />
      <path d="M56 195L73 159H159L190 198" fill="#101720" stroke="#E5AD3B" strokeOpacity=".8" strokeWidth="4" strokeLinejoin="round" />
      <path d="M86 158L92 110L121 84L156 101L160 158H86Z" fill="#201D17" stroke="#F5C542" strokeOpacity=".85" strokeWidth="4" strokeLinejoin="round" />
      <path d="M100 111L105 94L121 81L148 94L153 111H100Z" fill="#F59E0B" fillOpacity=".3" stroke="#F5C542" strokeWidth="3" />
      <path d="M108 98L122 87L144 97L147 106H105L108 98Z" fill="#A5D8F3" fillOpacity=".24" />
      <path d="M94 161H169L182 190H76L94 161Z" fill="#2B2518" stroke="#D89B2B" strokeOpacity=".7" strokeWidth="3" />
      <path d="M162 158L192 127L214 133L232 168L254 175" stroke="#F5C542" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M230 166L262 175L279 195L255 202L239 190" fill="#272016" stroke="#F5C542" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="97" cy="203" r="18" fill="#0B1018" stroke="#D89B2B" strokeWidth="4" />
      <circle cx="174" cy="203" r="18" fill="#0B1018" stroke="#D89B2B" strokeWidth="4" />
      <circle cx="97" cy="203" r="6" fill="#E7AD39" />
      <circle cx="174" cy="203" r="6" fill="#E7AD39" />
    </svg>

    <svg
      className="mining-side-machine mining-side-dozer"
      viewBox="0 0 260 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M36 166H221L240 181H39L28 173L36 166Z" fill="#121820" stroke="#E3A331" strokeWidth="3" />
      <path d="M75 153L91 112H158L185 153H75Z" fill="#292317" stroke="#F5C542" strokeWidth="4" strokeLinejoin="round" />
      <path d="M98 111L108 75H153L164 112" fill="#20242A" stroke="#E5AD3B" strokeWidth="4" strokeLinejoin="round" />
      <path d="M114 80H149L156 102H106L114 80Z" fill="#9AD8F1" fillOpacity=".28" />
      <path d="M68 150L37 137L23 147L39 166H77" fill="#77531A" stroke="#F5C542" strokeWidth="4" strokeLinejoin="round" />
      <path d="M28 145L11 157L22 174H42L50 160" fill="#292317" stroke="#E5AD3B" strokeWidth="3" strokeLinejoin="round" />
      <path d="M172 137L205 124L221 133L216 158H181" fill="#77531A" stroke="#F5C542" strokeWidth="4" strokeLinejoin="round" />
      <path d="M63 164H190" stroke="#F5C542" strokeOpacity=".68" strokeWidth="3" />
      <circle cx="92" cy="169" r="17" fill="#090D14" stroke="#D89B2B" strokeWidth="4" />
      <circle cx="162" cy="169" r="17" fill="#090D14" stroke="#D89B2B" strokeWidth="4" />
      <circle cx="92" cy="169" r="5" fill="#E0A12D" />
      <circle cx="162" cy="169" r="5" fill="#E0A12D" />
    </svg>

    <svg
      className="mining-side-machine mining-side-drill"
      viewBox="0 0 230 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M41 229H191L205 244H32L41 229Z" fill="#121820" stroke="#D89B2B" strokeWidth="3" />
      <path d="M64 217L71 179H158L174 219" fill="#282217" stroke="#F5C542" strokeWidth="4" strokeLinejoin="round" />
      <path d="M83 178L87 143H139L149 179H83Z" fill="#20242A" stroke="#E5AD3B" strokeWidth="4" />
      <path d="M91 145L103 128H134L141 145H91Z" fill="#F59E0B" fillOpacity=".2" stroke="#E5AD3B" strokeWidth="3" />
      <path d="M111 127V42H121V127" fill="#B77A22" stroke="#F5C542" strokeWidth="3" />
      <path d="M106 50L116 24L126 50H106Z" fill="#F59E0B" fillOpacity=".3" stroke="#F5C542" strokeWidth="3" />
      <path d="M100 74H132M100 91H132M100 108H132" stroke="#E5AD3B" strokeWidth="3" />
      <path d="M116 128V223" stroke="#F5C542" strokeWidth="5" />
      <path d="M108 217L116 234L124 217" stroke="#F5C542" strokeWidth="3" strokeLinejoin="round" />
      <path d="M65 216H175" stroke="#F5C542" strokeOpacity=".68" strokeWidth="3" />
      <circle cx="84" cy="231" r="14" fill="#090D14" stroke="#D89B2B" strokeWidth="4" />
      <circle cx="159" cy="231" r="14" fill="#090D14" stroke="#D89B2B" strokeWidth="4" />
    </svg>

    <svg
      className="mining-side-machine mining-side-truck"
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M27 177H285L301 192H31L27 177Z" fill="#141A23" stroke="#D89B2B" strokeOpacity=".8" strokeWidth="3" />
      <path d="M58 163L79 116H162L192 153L259 160V179H54L58 163Z" fill="#282217" stroke="#F5C542" strokeOpacity=".9" strokeWidth="4" strokeLinejoin="round" />
      <path d="M79 116L95 88H150L164 117" fill="#1B2027" stroke="#F5C542" strokeWidth="4" strokeLinejoin="round" />
      <path d="M101 93H145L154 113H88L101 93Z" fill="#9AD8F1" fillOpacity=".3" />
      <path d="M173 119L203 87H252L279 121L286 158H185L173 119Z" fill="#8E5D1B" fillOpacity=".58" stroke="#E5AA37" strokeWidth="4" strokeLinejoin="round" />
      <path d="M194 119L211 99H247L264 121H194Z" fill="#F6B93B" fillOpacity=".16" />
      <path d="M45 160H286" stroke="#F5C542" strokeOpacity=".55" strokeWidth="4" />
      <circle cx="99" cy="183" r="20" fill="#090D14" stroke="#E0A12D" strokeWidth="4" />
      <circle cx="232" cy="183" r="20" fill="#090D14" stroke="#E0A12D" strokeWidth="4" />
      <circle cx="99" cy="183" r="7" fill="#E0A12D" />
      <circle cx="232" cy="183" r="7" fill="#E0A12D" />
    </svg>

    <svg
      className="mining-machinery"
      viewBox="0 0 1440 440"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="mine-machine-light" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#F5C542" stopOpacity=".65" />
          <stop offset="1" stopColor="#C87918" stopOpacity=".2" />
        </linearGradient>
        <linearGradient id="mine-horizon" x1="0" y1="0" x2="0" y2="1">
          <stop stopColor="#F59E0B" stopOpacity=".2" />
          <stop offset="1" stopColor="#020617" stopOpacity="0" />
        </linearGradient>
      </defs>

      <path d="M0 342C198 317 311 348 490 330C703 309 831 347 1040 321C1195 301 1328 324 1440 298V440H0V342Z" fill="url(#mine-horizon)" />
      <path d="M0 391L112 354L188 381L270 332L358 377L459 341L552 384L661 335L750 377L868 339L982 382L1088 334L1179 370L1281 329L1371 357L1440 331V440H0V391Z" fill="#02050C" fillOpacity=".68" />

      <g className="machine-glow" stroke="url(#mine-machine-light)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M160 330H498" />
        <path d="M230 326L257 286H365L399 326" />
        <path d="M269 286L282 237H352L366 286" />
        <path d="M283 239L297 219H341L351 239" />
        <path d="M291 250H348" />
        <path d="M306 327L318 285" />
        <path d="M374 288L415 262L449 277L476 315" />
        <path d="M446 276L471 252L502 260L516 281" />
        <path d="M478 316L502 329" />
        <circle cx="284" cy="331" r="21" />
        <circle cx="371" cy="331" r="21" />
        <circle cx="284" cy="331" r="7" />
        <circle cx="371" cy="331" r="7" />
      </g>

      <g className="machine-glow truck-glow" stroke="url(#mine-machine-light)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M914 327H1320" />
        <path d="M972 317L1002 263H1104L1142 306L1218 311L1242 327" />
        <path d="M1002 263L1020 231H1090L1105 263" />
        <path d="M1023 238H1086" />
        <path d="M1139 307L1173 266H1220L1250 307" />
        <path d="M1172 266V246H1211L1223 266" />
        <circle cx="1035" cy="328" r="23" />
        <circle cx="1193" cy="328" r="23" />
        <circle cx="1035" cy="328" r="8" />
        <circle cx="1193" cy="328" r="8" />
      </g>
      <path d="M1014 260L1030 236H1081L1093 260" fill="#F59E0B" fillOpacity=".08" />
      <path d="M1180 263H1210L1222 282H1171L1180 263Z" fill="#F59E0B" fillOpacity=".08" />
    </svg>
  </div>
);
