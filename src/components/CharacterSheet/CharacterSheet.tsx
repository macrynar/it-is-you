import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient.js';
import { generateCareerReport } from '../../utils/scoring.js';

/* ═══════════ LORE ═══════════ */
const ENN_LORE: Record<number, {
  rpg: string; epithet: string; desc: string; symbol: string;
  pop: string[]; charges: string[]; drains: string[];
}> = {
  1:{ rpg:'Praworządny Paladin',     epithet:'Architekt Porządku',    desc:'Wysokie standardy i etyka. Twój rdzeń to wewnętrzny krytyk dążący do doskonałości.',              symbol:'⚔',  pop:['Hermiona Granger','Ned Stark','Chidi Anagonye','Captain America','Jiminy Cricket'], charges:['Precyzja i systemy','Realizacja planów','Etyczne decyzje'],       drains:['Chaos i improwizacja','Niedbałość innych','Brak kontroli'] },
  2:{ rpg:'Kapłan Wsparcia',         epithet:'Strażnik Serc',         desc:'Naturalna empatia i orientacja na potrzeby innych. Budujesz mosty i dbasz o relacje.',            symbol:'💜', pop:['Leslie Knope','Ted Lasso','Samwise Gamgee','Beth March','Joyce Byers'],             charges:['Pomaganie i troskliwość','Głębokie relacje','Wpływ na innych'],   drains:['Praca w izolacji','Bycie ignorowanym','Brak uznania'] },
  3:{ rpg:'Bard Ambicji',            epithet:'Architekt Sukcesu',     desc:'Motywacja przez osiągnięcia i prestiż. Adaptujesz się błyskawicznie i wygrywasz.',               symbol:'🏆', pop:['Tony Stark','Harvey Specter','Jay Gatsby','Miranda Priestly','Jordan Belfort'],    charges:['Sukcesy i wyniki','Uznanie i prestiż','Wysoka stawka'],           drains:['Anonimowość','Porażka','Stagnacja'] },
  4:{ rpg:'Mroczny Artysta',         epithet:'Dziecko Cienia',        desc:'Głęboka potrzeba autentyczności i wyrażenia wewnętrznego świata. Czujesz więcej niż inni.',      symbol:'🎭', pop:['Joker (2019)','Severus Snape','Don Draper','Virginia Woolf','Hamlet'],               charges:['Twórcza ekspresja','Autentyczność','Estetyka i piękno'],          drains:['Banalność','Bycie niezrozumianym','Szablony'] },
  5:{ rpg:'Mistrz Wiedzy Zakazanej', epithet:'Wartownik Umysłu',      desc:'Izolacja jako ochrona. Zbierasz wiedzę jako tarczę i broń. Obserwujesz nie uczestnicząc.',      symbol:'🔮', pop:['Sherlock Holmes','Dr House','Walter White','Spock','Alan Turing'],                  charges:['Głęboka analiza','Praca w skupieniu','Odkrywanie tajemnic'],      drains:['Natłok ludzi','Wymuszona małomówność','Brak czasu na myślenie'] },
  6:{ rpg:'Strażnik Bractwa',        epithet:'Bastion Lojalności',    desc:'Bezpieczeństwo przez przynależność. Lojalność jest Twoją walutą, a sceptycyzm tarczą.',         symbol:'🛡', pop:['Captain America','Ron Weasley','Frodo Baggins','Eddard Stark','Leslie Knope'],      charges:['Zaufane środowisko','Jasne zasady','Wierność wartościom'],        drains:['Niepewność i ryzyko','Zdrada','Brak wsparcia'] },
  7:{ rpg:'Chaotyczny Awanturnik',   epithet:'Wirtuoz Możliwości',    desc:'Ucieczka przez doświadczanie. Świat to plac zabaw, a ograniczenia to wrogowie.',               symbol:'🎲', pop:['Jack Sparrow','Tyrion Lannister','Fleabag','Deadpool','Gonzo'],                      charges:['Nowe przygody','Wolność i spontaniczność','Wielość możliwości'], drains:['Rutyna','Ograniczenia','Zobowiązania długoterminowe'] },
  8:{ rpg:'Warlord Wojenny',         epithet:'Inkwizytor Woli',       desc:'Kontrola jako przeżycie. Dominujesz bo słabość jest zagrożeniem. Chronisz intensywnie.',        symbol:'👁', pop:['Walter White','Tony Soprano','Daenerys Targaryen','Gordon Ramsay','Cersei'],        charges:['Kontrola i decyzyjność','Wyzwania i konfrontacja','Ochrona bliskich'], drains:['Zależność od innych','Okazywanie słabości','Utrata kontroli'] },
  9:{ rpg:'Mnich Harmonii',          epithet:'Spokój w Oku Cyklonu',  desc:'Pokój jako cel. Unikanie konfliktu przez fuzję z otoczeniem. Twój superpower to cierpliwość.', symbol:'☯',  pop:['Frodo Baggins','Ted Lasso','The Dude','Keanu Reeves','Samwise Gamgee'],              charges:['Spokój i harmonia','Mediacja','Połączenie z naturą'],              drains:['Konflikt i spory','Presja czasu','Przymus'] },
};

const HEX_FULL: Record<string,string> = {
  honesty_humility:'Uczciwość', emotionality:'Emocjonalność',
  extraversion:'Ekstrawersja', agreeableness:'Ugodowość',
  conscientiousness:'Sumienność', openness:'Otwartość'
};
const HEX_SHORT: Record<string,string> = {
  honesty_humility:'H', emotionality:'E', extraversion:'X',
  agreeableness:'A', conscientiousness:'C', openness:'O'
};
const HEX_COLOR: Record<string,string> = {
  honesty_humility:'#a78bfa', emotionality:'#f472b6', extraversion:'#fb923c',
  agreeableness:'#34d399', conscientiousness:'#60a5fa', openness:'#fbbf24'
};
const HEX_DIMS = ['honesty_humility','emotionality','extraversion','agreeableness','conscientiousness','openness'] as const;
const HEX_ATTR_CLASS: Record<string,string> = {
  honesty_humility:'ch-ag', emotionality:'ch-ap', extraversion:'ch-ao',
  agreeableness:'ch-at', conscientiousness:'ch-ac', openness:'ch-av2'
};
const HEX_TRAIT_HIGH: Record<string,string> = {
  honesty_humility:'Uczciwy', emotionality:'Empatyczny', extraversion:'Charyzmatyczny',
  agreeableness:'Ugodowy', conscientiousness:'Sumienny', openness:'Kreatywny'
};
const HEX_TRAIT_LOW: Record<string,string> = {
  honesty_humility:'Pragmatyczny', emotionality:'Stoicki', extraversion:'Refleksyjny',
  agreeableness:'Asertywny', conscientiousness:'Spontaniczny', openness:'Tradycjonalista'
};
const HEX_CHIP_CLASS: Record<string,string> = {
  honesty_humility:'ch-ttg', emotionality:'ch-ttp', extraversion:'ch-tto',
  agreeableness:'ch-ttt', conscientiousness:'ch-ttc', openness:'ch-ttv'
};
const DT_LABEL: Record<string,string> = {
  machiavellianism:'Makiawelizm', narcissism:'Narcyzm', psychopathy:'Psychopatia'
};
const DT_COLOR: Record<string,string> = {
  machiavellianism:'#f97316', narcissism:'#fbbf24', psychopathy:'#ef4444'
};
const SHADOW_ITEMS = [
  { trait:'machiavellianism', icon:'🦊', hi:'Manipulacja strategiczna',  lo:'Kalkulujesz zysk relacji — lojalność bywa jednak autentyczna.' },
  { trait:'narcissism',       icon:'👁', hi:'Eksplozja ego',              lo:'Walidacja potrzebna — poszukujesz jej jednak zewnętrznie.' },
  { trait:'psychopathy',      icon:'⚡', hi:'Chłód emocjonalny',          lo:'Empatia jest włączona — twoje reakcje są adekwatne.' },
];
const HL_CLASS = ['ch-hl-c','ch-hl-g','ch-hl-p','ch-hl-c'];
const STR_COLORS = ['#fbbf24','#34d399','#38b6ff','#b08fff','#f97316'];
const SYNTH_BG = [
  'rgba(99,102,241,.08)','rgba(56,182,255,.06)','rgba(123,94,167,.07)',
  'rgba(52,211,153,.06)','rgba(245,158,11,.06)','rgba(239,68,68,.05)'
];
const SYNTH_BD = [
  'rgba(99,102,241,.2)','rgba(56,182,255,.15)','rgba(123,94,167,.18)',
  'rgba(52,211,153,.15)','rgba(245,158,11,.15)','rgba(239,68,68,.13)'
];

interface RawRow { test_type:string; raw_scores:any; percentile_scores:any; report:any; }

/* ══ STYLES ══ */
const STYLES = [
'.iiy-logo,.iiy-logo *{box-sizing:border-box;margin:0;padding:0}',
'.iiy-logo{display:inline-flex;align-items:center;gap:20px;text-decoration:none;user-select:none}',
'.iiy-logo .iiy-wordmark{display:flex;flex-direction:column}',
'.iiy-logo .iiy-title{font-family:"Orbitron",monospace;font-weight:900;text-transform:uppercase;background:linear-gradient(160deg,#fff 0%,#a8c8ff 35%,#38b6ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 16px rgba(56,182,255,.45));animation:iiy-glitch 9s infinite}',
'@keyframes iiy-glitch{0%,87%,100%{transform:none}88%{transform:translate(-2px,0) skewX(-2deg)}89%{transform:translate(2px,0)}90%{transform:none}}',
'.iiy-logo .iiy-divider{height:1px;background:linear-gradient(90deg,#38b6ff,#7b5ea7 55%,transparent);opacity:.8}',
'.iiy-logo .iiy-sub{font-family:"Share Tech Mono",monospace;color:rgba(100,160,230,.5);text-transform:uppercase;line-height:1}',
'.iiy-logo.iiy-sm{gap:14px}.iiy-logo.iiy-sm .iiy-signet svg{width:44px;height:44px}',
'.iiy-logo.iiy-sm .iiy-title{font-size:19px;letter-spacing:7px;line-height:1}',
'.iiy-logo.iiy-sm .iiy-sub{font-size:7px;letter-spacing:2.5px}',
'.iiy-logo.iiy-sm .iiy-divider{margin:4px 0 3px}',
'.iiy-ring-ticks{animation:iiy-spin 20s linear infinite;transform-origin:48px 48px}',
'@keyframes iiy-spin{to{transform:rotate(360deg)}}',
'.iiy-eye-l{animation:iiy-eye 3.5s ease-in-out infinite}',
'.iiy-eye-r{animation:iiy-eye 3.5s ease-in-out infinite .2s}',
'@keyframes iiy-eye{0%,70%,100%{opacity:1}76%{opacity:.05}}',
'.iiy-scan{animation:iiy-scan 2.8s ease-in-out infinite}',
'@keyframes iiy-scan{0%{transform:translateY(-22px);opacity:0}8%{opacity:.55}92%{opacity:.55}100%{transform:translateY(22px);opacity:0}}',
'.iiy-core{animation:iiy-pulse 2.2s ease-in-out infinite;transform-origin:48px 61px}',
'@keyframes iiy-pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.9);opacity:1}}',
'.iiy-nav-tabs{display:flex;align-items:center;gap:2px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:4px}',
'.iiy-tab-btn{padding:8px 20px;border-radius:9px;border:none;background:transparent;color:rgba(255,255,255,.45);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:"Space Grotesk",-apple-system,sans-serif;white-space:nowrap}',
'.iiy-tab-btn:hover{color:rgba(255,255,255,.8);background:rgba(255,255,255,.05)}',
'.iiy-tab-btn.active{background:linear-gradient(135deg,rgba(99,102,241,.3),rgba(56,182,255,.2));color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px rgba(99,102,241,.3)}',
'.ch-sheet-wrapper{font-family:"Space Grotesk",sans-serif;padding-bottom:48px}',
'.ch-topbar{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;padding:9px 16px;background:rgba(8,14,40,.72);border:1px solid rgba(56,182,255,.10);border-radius:8px;backdrop-filter:blur(14px);flex-wrap:wrap;gap:8px}',
'.ch-tb-pill{display:inline-flex;align-items:center;gap:7px;padding:4px 12px;border-radius:3px;background:rgba(52,211,153,.07);border:1px solid rgba(52,211,153,.22);font-family:"Share Tech Mono",monospace;font-size:9.5px;letter-spacing:2px;color:#34d399}',
'.ch-tb-dot{width:5px;height:5px;border-radius:50%;background:#34d399;box-shadow:0 0 8px #34d399;animation:ch-blink 1.8s ease-in-out infinite}',
'@keyframes ch-blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.5)}}',
'.ch-tb-meta{font-family:"Share Tech Mono",monospace;font-size:8.5px;color:rgba(56,182,255,.28);letter-spacing:2px;line-height:1.9}',
'.ch-bento{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}',
'.ch-tile{background:rgba(8,14,38,.88);backdrop-filter:blur(28px) saturate(160%);-webkit-backdrop-filter:blur(28px) saturate(160%);border:1px solid rgba(56,182,255,.11);border-radius:14px;position:relative;overflow:hidden;padding:20px;display:flex;flex-direction:column;transition:border-color .3s,box-shadow .3s}',
'.ch-tile:hover{border-color:rgba(56,182,255,.25);box-shadow:0 0 30px -8px rgba(56,182,255,.18),0 8px 32px -8px rgba(0,0,0,.4)}',
'.ch-tile::before,.ch-tile::after{content:"";position:absolute;width:13px;height:13px;border-color:#38b6ff;border-style:solid;opacity:.22;pointer-events:none;z-index:0}',
'.ch-tile::before{top:0;left:0;border-width:1.5px 0 0 1.5px}',
'.ch-tile::after{bottom:0;right:0;border-width:0 1.5px 1.5px 0}',
'.ch-tile-accent{position:absolute;top:0;left:0;right:0;height:2px;border-radius:14px 14px 0 0;z-index:1}',
'.ch-t-hero{grid-column:span 1}.ch-t-radar{grid-column:span 2}.ch-t-enn{grid-column:span 1}',
'.ch-t-str{grid-column:span 2}.ch-t-dt{grid-column:span 2}.ch-t-synth{grid-column:1/-1}',
'@media(max-width:1100px){.ch-bento{grid-template-columns:repeat(2,1fr)}.ch-t-radar{grid-column:1/-1}.ch-t-str,.ch-t-dt{grid-column:span 2}}',
'@media(max-width:680px){.ch-bento{grid-template-columns:1fr}.ch-t-hero,.ch-t-radar,.ch-t-enn,.ch-t-str,.ch-t-dt{grid-column:1/-1}}',
'.ch-tl{font-family:"Share Tech Mono",monospace;font-size:8px;letter-spacing:2.5px;color:rgba(56,182,255,.38);text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:8px}',
'.ch-tl::after{content:"";flex:1;height:1px;background:linear-gradient(90deg,rgba(56,182,255,.18),transparent)}',
'.ch-asc{animation:ch-asc 3.4s ease-in-out infinite}',
'@keyframes ch-asc{0%{transform:translateY(-28px);opacity:0}6%{opacity:.6}94%{opacity:.6}100%{transform:translateY(28px);opacity:0}}',
'.ch-lvl{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:2px;background:linear-gradient(110deg,rgba(99,102,241,.14),rgba(56,182,255,.11));border:1px solid rgba(99,102,241,.28);font-family:"Share Tech Mono",monospace;font-size:9px;letter-spacing:2px;color:#a5b4fc;margin-bottom:11px}',
'.ch-ldot{width:4px;height:4px;border-radius:50%;background:#a5b4fc;box-shadow:0 0 6px #a5b4fc}',
'.ch-cname{font-family:"Orbitron",monospace;font-size:16px;font-weight:900;letter-spacing:2.5px;text-transform:uppercase;color:#fff;margin-bottom:4px;text-shadow:0 0 18px rgba(56,182,255,.22);word-break:break-word}',
'.ch-carch{font-family:"Share Tech Mono",monospace;font-size:10px;letter-spacing:2px;color:#38b6ff;text-shadow:0 0 10px rgba(56,182,255,.4);margin-bottom:3px}',
'.ch-ccodes{font-family:"Share Tech Mono",monospace;font-size:7.5px;letter-spacing:1.5px;color:rgba(255,255,255,.22);margin-bottom:11px}',
'.ch-rare{display:inline-flex;align-items:center;gap:5px;padding:3px 10px;border-radius:2px;background:rgba(176,143,255,.07);border:1px solid rgba(176,143,255,.2);font-family:"Share Tech Mono",monospace;font-size:8.5px;letter-spacing:1.5px;color:#b08fff;margin-bottom:13px}',
'.ch-xp-wrap{width:100%}.ch-xp-lbl{display:flex;justify-content:space-between;margin-bottom:4px;font-family:"Share Tech Mono",monospace;font-size:8px;letter-spacing:1.5px}',
'.ch-xp-track{height:4px;background:rgba(255,255,255,.05);border-radius:2px;overflow:visible;position:relative}',
'.ch-xp-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,#3d2a9e,#38b6ff);box-shadow:0 0 10px rgba(56,182,255,.5);position:relative;transition:width 1s ease-out}',
'.ch-xp-fill::after{content:"";position:absolute;right:-1px;top:50%;transform:translateY(-50%);width:8px;height:8px;border-radius:50%;background:#fff;box-shadow:0 0 8px rgba(56,182,255,.8)}',
'.ch-hx-bars{display:grid;grid-template-columns:1fr 1fr;gap:5px 20px}',
'.ch-hb{display:flex;flex-direction:column;gap:4px}',
'.ch-hb-top{display:flex;justify-content:space-between;align-items:center}',
'.ch-hb-name{font-size:10px;font-weight:600;color:rgba(255,255,255,.44)}',
'.ch-hb-val{font-family:"Share Tech Mono",monospace;font-size:10px;font-weight:700}',
'.ch-hb-track{height:4px;background:rgba(255,255,255,.06);border-radius:100px;overflow:hidden}',
'.ch-hb-fill{height:100%;border-radius:100px;transition:width 1.2s cubic-bezier(.4,0,.2,1)}',
'.ch-attr-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}',
'.ch-attr-b{padding:8px;border-radius:4px;cursor:default;transition:transform .22s;position:relative;overflow:hidden}',
'.ch-attr-b:hover{transform:translateY(-2px)}',
'.ch-a-lbl{font-family:"Share Tech Mono",monospace;font-size:7px;letter-spacing:1.5px;color:rgba(255,255,255,.26);margin-bottom:1px;text-transform:uppercase}',
'.ch-a-val{font-family:"Orbitron",monospace;font-size:22px;font-weight:700;line-height:1;margin-bottom:1px}',
'.ch-a-nm{font-size:8px;font-weight:600;color:rgba(255,255,255,.28)}',
'.ch-ag{background:rgba(0,229,160,.07);border:1px solid rgba(0,229,160,.18)}.ch-ag .ch-a-val{color:#34d399;text-shadow:0 0 12px rgba(0,229,160,.4)}',
'.ch-ac{background:rgba(56,182,255,.07);border:1px solid rgba(56,182,255,.18)}.ch-ac .ch-a-val{color:#38b6ff;text-shadow:0 0 12px rgba(56,182,255,.45)}',
'.ch-av2{background:rgba(176,143,255,.07);border:1px solid rgba(176,143,255,.18)}.ch-av2 .ch-a-val{color:#b08fff;text-shadow:0 0 12px rgba(176,143,255,.4)}',
'.ch-at{background:rgba(64,224,208,.07);border:1px solid rgba(64,224,208,.18)}.ch-at .ch-a-val{color:#40e0d0;text-shadow:0 0 12px rgba(64,224,208,.38)}',
'.ch-ap{background:rgba(232,120,224,.07);border:1px solid rgba(232,120,224,.18)}.ch-ap .ch-a-val{color:#e878e0;text-shadow:0 0 12px rgba(232,120,224,.35)}',
'.ch-ao{background:rgba(249,115,22,.07);border:1px solid rgba(249,115,22,.18)}.ch-ao .ch-a-val{color:#f97316;text-shadow:0 0 12px rgba(249,115,22,.35)}',
'.ch-enn-num{font-family:"Orbitron",monospace;font-size:2.4rem;font-weight:900;letter-spacing:2px;color:#b08fff;text-shadow:0 0 30px rgba(176,143,255,.5);line-height:1}',
'.ch-enn-type{font-size:13px;font-weight:700;color:rgba(255,255,255,.8);letter-spacing:1px;margin-top:4px}',
'.ch-enn-sub{font-family:"Share Tech Mono",monospace;font-size:7px;letter-spacing:2px;color:rgba(176,143,255,.35);margin-top:2px;text-transform:uppercase}',
'.ch-enn-desc{font-size:9.5px;color:rgba(255,255,255,.35);line-height:1.6;margin-top:6px}',
'.ch-hol-ltrs{display:flex;gap:5px;margin-bottom:8px}',
'.ch-hl{font-family:"Orbitron",monospace;font-size:14px;font-weight:700;width:27px;height:27px;border-radius:3px;display:flex;align-items:center;justify-content:center}',
'.ch-hl-c{background:rgba(56,182,255,.12);color:#38b6ff;border:1px solid rgba(56,182,255,.28)}',
'.ch-hl-g{background:rgba(0,229,160,.10);color:#34d399;border:1px solid rgba(0,229,160,.24)}',
'.ch-hl-p{background:rgba(232,120,224,.10);color:#e878e0;border:1px solid rgba(232,120,224,.24)}',
'.ch-careers{display:flex;flex-wrap:wrap;gap:4px}',
'.ch-ct{font-family:"Share Tech Mono",monospace;font-size:7.5px;padding:3px 7px;border-radius:2px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.10);color:rgba(255,255,255,.38)}',
'.ch-val-chips{display:flex;flex-wrap:wrap;gap:4px}',
'.ch-vc1{font-size:9.5px;font-weight:600;padding:3px 8px;border-radius:2px;background:rgba(56,182,255,.09);border:1px solid rgba(56,182,255,.22);color:#38b6ff}',
'.ch-vc2{font-size:9.5px;font-weight:600;padding:3px 8px;border-radius:2px;background:rgba(0,229,160,.07);border:1px solid rgba(0,229,160,.2);color:#34d399}',
'.ch-vc3{font-size:9.5px;font-weight:600;padding:3px 8px;border-radius:2px;background:rgba(245,158,11,.08);border:1px solid rgba(245,158,11,.2);color:#f59e0b}',
'.ch-vc4{font-size:9.5px;font-weight:600;padding:3px 8px;border-radius:2px;background:rgba(176,143,255,.08);border:1px solid rgba(176,143,255,.2);color:#b08fff}',
'.ch-str-list{display:flex;flex-direction:column;gap:6px}',
'.ch-str-item{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:4px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);transition:background .2s,border-color .2s,transform .18s;cursor:default}',
'.ch-str-item:hover{background:rgba(56,182,255,.05);border-color:rgba(56,182,255,.18);transform:translateX(3px)}',
'.ch-srk{font-family:"Share Tech Mono",monospace;font-size:9px;color:rgba(255,255,255,.18);width:14px;flex-shrink:0;text-align:center}',
'.ch-sinf{flex:1}.ch-snm{font-size:11px;font-weight:700;color:rgba(255,255,255,.78)}',
'.ch-sct{font-family:"Share Tech Mono",monospace;font-size:7px;color:rgba(255,255,255,.27)}',
'.ch-sbar{width:30px;height:3px;background:rgba(255,255,255,.06);border-radius:100px;flex-shrink:0;overflow:hidden}',
'.ch-sbf{height:100%;border-radius:100px}',
'.ch-dt-bars{display:flex;flex-direction:column;gap:14px}',
'.ch-dt-row{display:flex;flex-direction:column;gap:5px}',
'.ch-dt-head{display:flex;align-items:center;justify-content:space-between}',
'.ch-dt-name{display:flex;align-items:center;gap:7px;font-size:12.5px;font-weight:700}',
'.ch-dt-sw{display:flex;align-items:baseline;gap:2px}.ch-dt-sc{font-family:"Orbitron",monospace;font-size:18px;font-weight:700}',
'.ch-dt-mx{font-family:"Share Tech Mono",monospace;font-size:8px;color:rgba(255,255,255,.28)}',
'.ch-dt-pc{font-family:"Share Tech Mono",monospace;font-size:8px}',
'.ch-dt-track{height:9px;border-radius:2px;background:rgba(255,255,255,.04);overflow:hidden}',
'.ch-dt-fill{height:100%;border-radius:2px;transition:width 1s ease-out}',
'.ch-dt-tags{display:flex;flex-wrap:wrap;gap:3px}',
'.ch-dtag{font-family:"Share Tech Mono",monospace;font-size:7px;letter-spacing:.5px;padding:2px 6px;border-radius:2px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);color:rgba(255,255,255,.3)}',
'.ch-sh-list{display:flex;flex-direction:column;gap:8px}',
'.ch-sh-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:4px;background:rgba(239,68,68,.04);border:1px solid rgba(239,68,68,.10);transition:background .2s,border-color .2s;cursor:default}',
'.ch-sh-item:hover{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.2)}',
'.ch-shico{font-size:15px;flex-shrink:0;margin-top:1px}',
'.ch-shbd{flex:1}.ch-shtt{font-size:11px;font-weight:700;color:rgba(255,100,100,.82);margin-bottom:2px}',
'.ch-sht{font-size:9px;color:rgba(255,255,255,.35);line-height:1.6}',
'.ch-iblk{padding:12px 13px;border-radius:4px;margin-bottom:9px}.ch-iblk:last-child{margin-bottom:0}',
'.ch-ib-tx{font-size:10.5px;color:rgba(255,255,255,.42);line-height:1.7}',
'.ch-ib-tx strong{color:rgba(255,255,255,.8);font-weight:600}',
'.ch-tflow{display:flex;flex-wrap:wrap;gap:6px}',
'.ch-tt{display:flex;align-items:center;gap:4px;padding:4px 10px;border-radius:2px;font-size:10px;font-weight:600;cursor:default;transition:transform .18s}',
'.ch-tt:hover{transform:translateY(-2px)}',
'.ch-ttc{background:rgba(56,182,255,.09);border:1px solid rgba(56,182,255,.22);color:#38b6ff}',
'.ch-ttv{background:rgba(176,143,255,.09);border:1px solid rgba(176,143,255,.22);color:#b08fff}',
'.ch-ttg{background:rgba(0,229,160,.08);border:1px solid rgba(0,229,160,.2);color:#34d399}',
'.ch-tto{background:rgba(249,115,22,.08);border:1px solid rgba(249,115,22,.2);color:#f97316}',
'.ch-ttp{background:rgba(232,120,224,.08);border:1px solid rgba(232,120,224,.2);color:#e878e0}',
'.ch-ttw{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.5)}',
'.ch-ttt{background:rgba(64,224,208,.08);border:1px solid rgba(64,224,208,.2);color:#40e0d0}',
'.ch-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-top:13px;padding:10px 14px;border-radius:4px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.05)}',
'.ch-fid{font-family:"Share Tech Mono",monospace;font-size:8px;letter-spacing:2px;color:rgba(56,182,255,.28)}',
'.ch-ftests{font-family:"Share Tech Mono",monospace;font-size:7.5px;color:rgba(255,255,255,.12);letter-spacing:.8px}',
'.ch-fver{font-family:"Share Tech Mono",monospace;font-size:8px;letter-spacing:2px;color:rgba(123,94,167,.35)}',
'.ch-empty-block{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px 10px;text-align:center;opacity:.55}',
'.ch-empty-icon{font-size:2rem;margin-bottom:8px}.ch-empty-text{font-size:.78rem;color:rgba(255,255,255,.3);margin-bottom:10px}',
'.ch-go-btn{display:inline-block;padding:6px 13px;border-radius:6px;border:1px solid rgba(99,102,241,.4);background:rgba(99,102,241,.12);color:#a5b4fc;font-size:.72rem;font-weight:600;cursor:pointer;transition:all .2s;font-family:inherit;text-decoration:none}',
'.ch-go-btn:hover{background:rgba(99,102,241,.22);color:#fff}',
'.ch-rpg-box{background:rgba(99,102,241,.07);border:1px solid rgba(99,102,241,.2);border-radius:6px;padding:12px 13px;margin-bottom:8px}',
'.ch-rpg-lbl{font-family:"Share Tech Mono",monospace;font-size:7.5px;letter-spacing:2px;color:rgba(99,102,241,.55);margin-bottom:6px;text-transform:uppercase}',
'.ch-rpg-class{font-size:15px;font-weight:700;color:#fff;margin-bottom:4px}',
'.ch-rpg-epit{font-size:9.5px;color:rgba(99,102,241,.7);font-style:italic;margin-bottom:6px}',
'.ch-pop-item{display:flex;align-items:center;gap:8px;padding:5px 8px;border-radius:4px;cursor:default;transition:background .2s,transform .18s}',
'.ch-pop-item:hover{background:rgba(255,255,255,.04);transform:translateX(3px)}',
'.ch-pop-rank{font-family:"Share Tech Mono",monospace;font-size:8px;color:rgba(255,255,255,.15);width:12px;text-align:center;flex-shrink:0}',
'.ch-pop-name{font-size:11px;font-weight:600;color:rgba(255,255,255,.65)}',
'.ch-energy-box{border-radius:6px;padding:10px 12px}',
'.ch-energy-title{font-family:"Share Tech Mono",monospace;font-size:7.5px;letter-spacing:2px;margin-bottom:7px;text-transform:uppercase}',
'.ch-energy-row{display:flex;align-items:center;gap:7px;margin-bottom:4px;font-size:9.5px;color:rgba(255,255,255,.55)}',
'@keyframes ch-fadeup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}',
'.ch-tile{animation:ch-fadeup .5s ease-out both}',
'.ch-tile:nth-child(1){animation-delay:.05s}.ch-tile:nth-child(2){animation-delay:.1s}',
'.ch-tile:nth-child(3){animation-delay:.15s}.ch-tile:nth-child(4){animation-delay:.2s}',
'.ch-tile:nth-child(5){animation-delay:.25s}.ch-tile:nth-child(6){animation-delay:.3s}',
'@keyframes ch-spin{to{transform:rotate(360deg)}}',
].join('\n');

/* ══ SVG COMPONENTS ══ */
function HexRadar({ data }: { data: {k:string; pct:number}[] }) {
  const cx = 200, cy = 200, r = 148;
  const n = data.length;
  const angles = data.map((_,i) => ((i * 360 / n) - 90) * (Math.PI / 180));
  const toXY = (angle: number, radius: number) => ({
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  });
  const pts = data.map((d,i) => toXY(angles[i], (d.pct / 100) * r));
  const polyPts = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const gridLevels = [25,50,75,100];
  return (
    <svg viewBox="0 0 400 400" style={{width:'100%',maxHeight:260,display:'block'}}>
      {gridLevels.map(l => (
        <polygon key={l}
          points={data.map((_,i) => { const p=toXY(angles[i],(l/100)*r); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ')}
          fill="none" stroke="rgba(56,182,255,.07)" strokeWidth="1"/>
      ))}
      {data.map((_,i) => {
        const e = toXY(angles[i],r);
        return <line key={i} x1={cx} y1={cy} x2={e.x.toFixed(1)} y2={e.y.toFixed(1)} stroke="rgba(56,182,255,.08)" strokeWidth="1"/>;
      })}
      <polygon points={polyPts} fill="rgba(56,182,255,.10)" stroke="#38b6ff" strokeWidth="1.8" strokeLinejoin="round"/>
      {pts.map((p,i) => (
        <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="4" fill="#38b6ff" style={{filter:'drop-shadow(0 0 4px #38b6ff)'}}/>
      ))}
      {data.map((d,i) => {
        const lp = toXY(angles[i], r + 26);
        return (
          <text key={i} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
            fill="rgba(203,213,225,.55)" fontSize="11" fontFamily="Space Grotesk,sans-serif" fontWeight="600">
            {HEX_FULL[d.k]}
          </text>
        );
      })}
    </svg>
  );
}

function EnnStar({ active, pct }: { active: number|null; pct: number }) {
  const N=9, cx=100, cy=100, R=80, ri=28;
  const angle = (i: number) => ((i * 360 / N) - 90) * (Math.PI / 180);
  const outer = Array.from({length:N}, (_,i) => ({ x: cx+R*Math.cos(angle(i)), y: cy+R*Math.sin(angle(i)), n: i+1 }));
  const inner = Array.from({length:N}, (_,i) => ({ x: cx+ri*Math.cos(angle(i)+(Math.PI/N)), y: cy+ri*Math.sin(angle(i)+(Math.PI/N)) }));
  const starPts = outer.flatMap((o,i) => [`${o.x.toFixed(1)},${o.y.toFixed(1)}`, `${inner[i].x.toFixed(1)},${inner[i].y.toFixed(1)}`]).join(' ');
  return (
    <svg viewBox="0 0 200 200" style={{width:'100%',maxHeight:200,display:'block'}}>
      <circle cx={cx} cy={cy} r={R+6} fill="none" stroke="rgba(176,143,255,.07)" strokeWidth="1.5"/>
      <polygon points={starPts} fill="rgba(176,143,255,.06)" stroke="rgba(176,143,255,.18)" strokeWidth="1.2" strokeLinejoin="round"/>
      {outer.map(o => <line key={o.n} x1={cx} y1={cy} x2={o.x.toFixed(1)} y2={o.y.toFixed(1)} stroke="rgba(176,143,255,.07)" strokeWidth="1"/>)}
      {outer.map(o => (
        <circle key={o.n} cx={o.x.toFixed(1)} cy={o.y.toFixed(1)} r={o.n===active ? 8 : 4}
          fill={o.n===active ? '#b08fff' : 'rgba(176,143,255,.25)'}
          stroke={o.n===active ? 'rgba(176,143,255,.6)' : 'none'} strokeWidth="2"
          style={o.n===active ? {filter:'drop-shadow(0 0 8px #b08fff)'} : {}}/>
      ))}
      {outer.map(o => {
        const lp = { x: cx+(R+18)*Math.cos(angle(o.n-1)), y: cy+(R+18)*Math.sin(angle(o.n-1)) };
        return (
          <text key={o.n} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle"
            fill={o.n===active ? '#b08fff' : 'rgba(176,143,255,.28)'}
            fontSize={o.n===active ? 11 : 8.5} fontFamily="Orbitron,monospace" fontWeight="700">
            {o.n}
          </text>
        );
      })}
      {active && pct > 0 && (
        <circle cx={cx} cy={cy} r={(pct/100)*(R-10)+10} fill="none" stroke="rgba(176,143,255,.10)" strokeWidth="18" strokeDasharray="3 5"/>
      )}
    </svg>
  );
}

/* ══ HELPERS ══ */
function pad2(n: number) { return String(n).padStart(2,'0'); }
function hashCode(s: string) {
  let h = 0;
  for (const c of s) h = (Math.imul(31,h) + c.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/* ══ LOGO HTML ══ */
const LOGO_HTML = [
'<div class="iiy-signet">',
'<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" width="44" height="44">',
'<defs>',
'<linearGradient id="cs-hg" x1="0%" y1="0%" x2="100%" y2="100%">',
'<stop offset="0%" stop-color="#38b6ff"/><stop offset="50%" stop-color="#7b5ea7"/><stop offset="100%" stop-color="#38b6ff"/></linearGradient>',
'<linearGradient id="cs-bg" x1="0%" y1="0%" x2="0%" y2="100%">',
'<stop offset="0%" stop-color="#38b6ff" stop-opacity="0.45"/>',
'<stop offset="100%" stop-color="#1a1d4a" stop-opacity="0.08"/></linearGradient>',
'<filter id="cs-gl" x="-30%" y="-30%" width="160%" height="160%">',
'<feGaussianBlur stdDeviation="2" result="b"/><feMerge>',
'<feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
'<clipPath id="cs-cp"><polygon points="48,5 87,27 87,69 48,91 9,69 9,27"/></clipPath></defs>',
'<polygon points="48,5 87,27 87,69 48,91 9,69 9,27" fill="#11143a"/>',
'<g class="iiy-ring-ticks" filter="url(#cs-gl)">',
'<line x1="48" y1="5" x2="48" y2="12" stroke="#38b6ff" stroke-width="1.8"/>',
'<line x1="87" y1="27" x2="81" y2="30" stroke="#38b6ff" stroke-width="1.8"/>',
'<line x1="87" y1="69" x2="81" y2="66" stroke="#38b6ff" stroke-width="1.8"/>',
'<line x1="48" y1="91" x2="48" y2="84" stroke="#38b6ff" stroke-width="1.8"/>',
'<line x1="9" y1="69" x2="15" y2="66" stroke="#38b6ff" stroke-width="1.8"/>',
'<line x1="9" y1="27" x2="15" y2="30" stroke="#38b6ff" stroke-width="1.8"/></g>',
'<polygon points="48,5 87,27 87,69 48,91 9,69 9,27" fill="none" stroke="url(#cs-hg)" stroke-width="1.8"/>',
'<g clip-path="url(#cs-cp)">',
'<line class="iiy-scan" x1="12" y1="48" x2="84" y2="48" stroke="#38b6ff" stroke-width="1.2" opacity="0.5"/>',
'<circle cx="48" cy="30" r="12" fill="#11143a" stroke="#38b6ff" stroke-width="1.2"/>',
'<ellipse class="iiy-eye-l" cx="43" cy="29.5" rx="3.5" ry="1.8" fill="#7b5ea7" filter="url(#cs-gl)"/>',
'<ellipse class="iiy-eye-r" cx="53" cy="29.5" rx="3.5" ry="1.8" fill="#7b5ea7" filter="url(#cs-gl)"/>',
'<path d="M28 90 L31 50 Q48 44 65 50 L68 90 Z" fill="url(#cs-bg)" stroke="#38b6ff" stroke-width="0.9"/>',
'<circle class="iiy-core" cx="48" cy="61" r="2.8" fill="#38b6ff" filter="url(#cs-gl)"/></g></svg>',
'</div>',
'<div class="iiy-wordmark">',
'<div class="iiy-title">PSYCHER</div>',
'<div class="iiy-divider"></div>',
'<div class="iiy-sub">Psychometric AI Engine</div>',
'</div>',
].join('');

/* ══ MAIN ══ */
export default function CharacterSheet() {
  const [loading, setLoading] = useState(true);
  const [authUser, setAuthUser] = useState<any>(null);
  const [raw, setRaw] = useState<Record<string,RawRow|null>>({
    HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null
  });

  useEffect(() => {
    (async () => {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { window.location.href = '/auth'; return; }
      setAuthUser(u);
      const { data: rows } = await supabase
        .from('user_psychometrics')
        .select('test_type,raw_scores,percentile_scores,report')
        .eq('user_id', u.id)
        .order('created_at', { ascending: false });
      if (rows?.length) {
        const m: Record<string,RawRow|null> = {
          HEXACO:null, ENNEAGRAM:null, STRENGTHS:null, CAREER:null, DARK_TRIAD:null, VALUES:null
        };
        for (const r of rows) if (m[r.test_type] === null) m[r.test_type] = r;
        setRaw(m);
      }
      setLoading(false);
    })();
  }, []);

  /* DERIVED */
  const userName  = (authUser?.user_metadata?.full_name ?? authUser?.email?.split('@')[0] ?? 'Użytkownik') as string;
  const avatarUrl = (authUser?.user_metadata?.avatar_url ?? '') as string;
  const initials  = userName.split(' ').map((n:string) => n[0]).join('').toUpperCase().slice(0,2);
  const done      = Object.values(raw).filter(Boolean).length;
  const xpPct     = Math.round((done / 6) * 100);
  const charId    = authUser ? `PSY-${hashCode(authUser.id).toString(16).toUpperCase().slice(0,6)}` : 'PSY-??????';
  const now       = new Date();
  const buildDate = `${now.getFullYear()}.${pad2(now.getMonth()+1)}.${pad2(now.getDate())}`;

  /* HEXACO */
  const hexPct: Record<string,number> = raw.HEXACO?.percentile_scores ?? {};
  const hexBars = HEX_DIMS.map(k => ({
    k, label:HEX_FULL[k], short:HEX_SHORT[k],
    pct:Math.round(hexPct[k] ?? 0),
    color:HEX_COLOR[k], cls:HEX_ATTR_CLASS[k]
  }));
  const hexTop3 = [...hexBars].sort((a,b) => b.pct - a.pct).slice(0,3);

  /* ENNEAGRAM */
  const ennR = raw.ENNEAGRAM?.report;
  const ennP = ennR?.primary_type;
  const ennN: number|null = ennP?.id ?? null;
  const ennL = ennN ? ENN_LORE[ennN] : null;
  const ennWing: string = ennR?.wing ? `w${ennR.wing}` : '';

  /* STRENGTHS */
  const top5: any[] = raw.STRENGTHS?.raw_scores?.top_5 ?? [];

  /* CAREER */
  const careerRep = raw.CAREER ? (raw.CAREER.report ?? generateCareerReport(raw.CAREER.raw_scores)) : null;
  const holland: string = careerRep?.holland_code ?? '';
  const topJobs: any[] = (careerRep?.top_careers ?? careerRep?.career_clusters ?? []).slice(0,6);

  /* VALUES */
  const topVals: any[] = (raw.VALUES?.raw_scores?.top_values ?? raw.VALUES?.report?.top_values ?? []).slice(0,5);

  /* DARK TRIAD */
  const dtDims = raw.DARK_TRIAD?.raw_scores?.dimensions ?? {};
  const dtTraits = ['machiavellianism','narcissism','psychopathy'].map(k => {
    const v = dtDims[k]?.raw_score ?? 0;
    const pct = v <= 5 ? Math.round(((v-1)/4)*100) : Math.round(v);
    return { k, label:DT_LABEL[k], pct:Math.max(0,Math.min(100,pct)), color:DT_COLOR[k] };
  }).sort((a,b) => b.pct - a.pct);

  /* CHIPS */
  const chips: {label:string; cls:string}[] = [];
  if (raw.HEXACO) hexTop3.forEach(h => {
    chips.push({ label: h.pct >= 55 ? HEX_TRAIT_HIGH[h.k] : HEX_TRAIT_LOW[h.k], cls: HEX_CHIP_CLASS[h.k] });
  });
  if (ennN) chips.push({ label: `Enneagram ${ennN}`, cls: 'ch-ttv' });
  if (holland) chips.push({ label: `Holland ${holland}`, cls: 'ch-ttt' });

  /* RPG meta */
  const lvlLabel = ['NOVICE','AWAKENED','SEEKER','ADEPT','INITIATE','OPERATOR'][Math.min(done,5)];
  const rareLabel = done>=6 ? '◈ LEGENDARY' : done>=4 ? '◆ RARE' : done>=2 ? '◇ UNCOMMON' : '○ COMMON';
  const codeStr = [hexTop3[0]?.short, hexTop3[1]?.short, ennN ? `E${ennN}` : null, holland||null].filter(Boolean).join(' · ');

  /* AI SYNTHESIS */
  const synthLines: string[] = [];
  if (ennN && ennL) synthLines.push(`<strong>Archetyp ${ennL.rpg}:</strong> ${ennL.epithet}. ${ennL.desc.slice(0,120)}.`);
  if (hexTop3.length >= 3) synthLines.push(`<strong>Rdzeń HEXACO:</strong> Dominują ${hexTop3.map(h => h.label + ' (' + h.pct + '%)').join(', ')}. To Twój psychologiczny hardware.`);
  if (top5.length >= 3) synthLines.push(`<strong>Talenty:</strong> ${top5.slice(0,3).map((t:any) => t.name ?? t.name_en).join(', ')} — naturalne przewagi wymagające narzędzi, nie pracy.`);
  if (dtTraits.length && raw.DARK_TRIAD) synthLines.push(`<strong>Strefa cienia:</strong> ${dtTraits[0].label} (${dtTraits[0].pct}%) to najsilniejszy obszar Twojego cienia. Świadomość to pierwsza linia obrony.`);
  if (topVals.length) synthLines.push(`<strong>Wartości dominujące:</strong> ${topVals.slice(0,3).map((v:any) => v.name ?? v.value_name ?? String(v)).join(', ')}. To Twój wewnętrzny kompas.`);
  if (careerRep && holland) synthLines.push(`<strong>Profil kariery:</strong> Kod Holland ${holland} wskazuje na środowiska: ${topJobs.slice(0,2).map((j:any) => j.title ?? j.name ?? '').filter(Boolean).join(' i ')}. Twój flow jest właśnie tam.`);

  /* LOADING */
  if (loading) return (
    <div style={{minHeight:'100vh',background:'#030014',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style dangerouslySetInnerHTML={{__html:STYLES}}/>
      <div style={{textAlign:'center'}}>
        <div style={{width:40,height:40,borderRadius:'50%',border:'2px solid rgba(56,182,255,.15)',borderTopColor:'#38b6ff',animation:'ch-spin .8s linear infinite',margin:'0 auto 16px'}}/>
        <div style={{fontFamily:'Share Tech Mono,monospace',color:'rgba(56,182,255,.35)',fontSize:11,letterSpacing:'3px'}}>LOADING PROFILE…</div>
      </div>
    </div>
  );

  return (
    <div style={{background:'#030014',backgroundImage:'radial-gradient(circle at 50% 0%,#1a0b38 0%,transparent 60%)',backgroundAttachment:'fixed',minHeight:'100vh',color:'#e2e8f0',fontFamily:"'Space Grotesk',system-ui,sans-serif"}}>
      <style dangerouslySetInnerHTML={{__html:STYLES}}/>
      <style dangerouslySetInnerHTML={{__html:"@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');"}}/>

      {/* NAV */}
      <nav style={{background:'rgba(3,0,20,.9)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(255,255,255,.05)',position:'sticky',top:0,zIndex:50}}>
        <div style={{maxWidth:1400,margin:'0 auto',padding:'0 24px',display:'flex',alignItems:'center',justifyContent:'space-between',height:72}}>
          <a href="/user-profile-tests.html" className="iiy-logo iiy-sm" dangerouslySetInnerHTML={{__html:LOGO_HTML}}/>
          <div className="iiy-nav-tabs">
            <button className="iiy-tab-btn" onClick={() => { window.location.href='/user-profile-tests.html'; }}>🧪 Testy</button>
            <button className="iiy-tab-btn active">🃏 Karta Postaci</button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <div style={{display:'flex',gap:4}}>
              {(['HEXACO','ENNEAGRAM','STRENGTHS','CAREER','DARK_TRIAD','VALUES'] as const).map(k => (
                <div key={k} title={k} style={{width:7,height:7,borderRadius:'50%',background:raw[k]?'#38b6ff':'rgba(255,255,255,.1)',boxShadow:raw[k]?'0 0 6px #38b6ff':'none',transition:'all .3s'}}/>
              ))}
            </div>
            <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/'; }}
              style={{padding:'7px 16px',borderRadius:8,border:'1px solid rgba(255,255,255,.1)',background:'rgba(255,255,255,.04)',color:'#e2e8f0',fontSize:12,cursor:'pointer',fontFamily:"'Space Grotesk',sans-serif"}}>
              Wyloguj
            </button>
          </div>
        </div>
      </nav>

      {/* PAGE */}
      <div style={{maxWidth:1400,margin:'0 auto',padding:'28px 24px'}}>
        <div className="ch-sheet-wrapper">

          {/* STATUS BAR */}
          <div className="ch-topbar">
            <div className="ch-tb-pill">
              <div className="ch-tb-dot"/>
              {done >= 6 ? 'PROFIL KOMPLETNY' : 'PROFIL W BUDOWIE'} · {done}/6 TESTÓW UKOŃCZONYCH
            </div>
            <div className="ch-tb-meta">CHAR-ID: {charId} · PSYCHER v2.0</div>
          </div>

          {/* BENTO GRID */}
          <div className="ch-bento">

            {/* T1: HERO */}
            <div className="ch-tile ch-t-hero">
              <div className="ch-tile-accent" style={{background:'linear-gradient(90deg,#38b6ff,#7b5ea7,#d946ef)'}}/>
              <div className="ch-tl">// IDENTYFIKACJA</div>

              <div style={{display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center',marginBottom:16}}>
                <div style={{position:'relative',width:90,height:90,marginBottom:12}}>
                  <svg viewBox="0 0 90 90" width="90" height="90">
                    <defs>
                      <linearGradient id="av-g" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#38b6ff"/><stop offset="100%" stopColor="#7b5ea7"/>
                      </linearGradient>
                      <linearGradient id="av-sg" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="transparent"/><stop offset="20%" stopColor="#38b6ff" stopOpacity=".7"/>
                        <stop offset="80%" stopColor="#38b6ff" stopOpacity=".7"/><stop offset="100%" stopColor="transparent"/>
                      </linearGradient>
                      <clipPath id="av-cp"><circle cx="45" cy="45" r="36"/></clipPath>
                    </defs>
                    <circle cx="45" cy="45" r="42" fill="#030014"/>
                    <circle cx="45" cy="45" r="40" fill="none" stroke="url(#av-g)" strokeWidth="1.5"/>
                    {avatarUrl
                      ? <image href={avatarUrl} x="9" y="9" width="72" height="72" clipPath="url(#av-cp)" preserveAspectRatio="xMidYMid slice"/>
                      : <text x="45" y="51" textAnchor="middle" fontSize="23" fontWeight="700" fontFamily="Space Grotesk,sans-serif" fill="url(#av-g)">{initials}</text>
                    }
                    <rect className="ch-asc" x="3" y="44" width="84" height="2" fill="url(#av-sg)" rx="1"/>
                  </svg>
                  <div style={{position:'absolute',bottom:2,right:2,width:11,height:11,borderRadius:'50%',background:done>=4?'#34d399':'#f59e0b',border:'2px solid #030014',boxShadow:`0 0 7px ${done>=4?'#34d399':'#f59e0b'}`}}/>
                </div>
                <div className="ch-lvl"><div className="ch-ldot"/>LVL {done} · {lvlLabel}</div>
                <div className="ch-cname">{userName}</div>
                <div className="ch-carch">{ennL?.rpg ?? 'ARCHETYP NIEZNANY'}</div>
                <div className="ch-ccodes">{codeStr || 'UZUPEŁNIJ TESTY'}</div>
                <div className="ch-rare">{rareLabel}</div>
              </div>

              <div className="ch-xp-wrap" style={{marginBottom:16}}>
                <div className="ch-xp-lbl">
                  <span style={{color:'rgba(255,255,255,.22)'}}>PROFIL XP</span>
                  <span style={{color:'rgba(56,182,255,.6)'}}>{done}/6</span>
                </div>
                <div className="ch-xp-track"><div className="ch-xp-fill" style={{width:`${xpPct}%`}}/></div>
              </div>

              <div className="ch-tl" style={{marginBottom:8}}>// ARCHETYP RPG</div>
              {ennL ? (
                <>
                  <div className="ch-rpg-box">
                    <div className="ch-rpg-lbl">KLASA POSTACI</div>
                    <div className="ch-rpg-class">{ennL.symbol} {ennL.rpg}</div>
                    <div className="ch-rpg-epit">"{ennL.epithet}"</div>
                    <div style={{fontSize:9,color:'rgba(255,255,255,.32)',lineHeight:1.6}}>{ennL.desc.slice(0,110)}…</div>
                  </div>
                  <div className="ch-tl" style={{marginTop:14,marginBottom:6}}>// PODOBNE POSTACIE</div>
                  {ennL.pop.slice(0,4).map((p,i) => (
                    <div key={p} className="ch-pop-item">
                      <span className="ch-pop-rank">{i+1}</span>
                      <span className="ch-pop-name">{p}</span>
                      <span style={{marginLeft:'auto',fontFamily:'Share Tech Mono,monospace',fontSize:8,color:'rgba(255,255,255,.18)'}}>{[97,85,74,64][i]}%</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="ch-empty-block">
                  <div className="ch-empty-icon">⚔</div>
                  <div className="ch-empty-text">Ukończ test Enneagram aby odblokować archetyp RPG</div>
                  <a className="ch-go-btn" href="/user-profile-tests.html">Przejdź do testów →</a>
                </div>
              )}
            </div>

            {/* T2: HEXACO RADAR */}
            <div className="ch-tile ch-t-radar">
              <div className="ch-tile-accent" style={{background:'linear-gradient(90deg,#22d3ee,#38b6ff)'}}/>
              <div className="ch-tl">// ATRYBUTY · HEXACO-60</div>
              {raw.HEXACO ? (
                <>
                  <HexRadar data={hexBars.map(h => ({k:h.k, pct:h.pct}))}/>
                  <div className="ch-attr-grid" style={{marginTop:12,marginBottom:16}}>
                    {hexBars.map(h => (
                      <div key={h.k} className={`ch-attr-b ${h.cls}`}>
                        <div className="ch-a-lbl">{h.short}</div>
                        <div className="ch-a-val">{h.pct}</div>
                        <div className="ch-a-nm">{h.label.slice(0,7)}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{borderTop:'1px solid rgba(56,182,255,.07)',paddingTop:12}}>
                    <div className="ch-hx-bars">
                      {hexBars.map(h => (
                        <div key={h.k} className="ch-hb">
                          <div className="ch-hb-top">
                            <span className="ch-hb-name">{h.label}</span>
                            <span className="ch-hb-val" style={{color:h.color}}>{h.pct}%</span>
                          </div>
                          <div className="ch-hb-track">
                            <div className="ch-hb-fill" style={{width:`${h.pct}%`, background:h.color}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="ch-empty-block" style={{flex:1,justifyContent:'center'}}>
                  <div className="ch-empty-icon">📊</div>
                  <div className="ch-empty-text">Wykonaj test HEXACO-60 aby odblokować radar osobowości</div>
                  <a className="ch-go-btn" href="/user-profile-tests.html">Wykonaj test HEXACO-60 →</a>
                </div>
              )}
            </div>

            {/* T3: ENNEAGRAM */}
            <div className="ch-tile ch-t-enn">
              <div className="ch-tile-accent" style={{background:'linear-gradient(90deg,#7b5ea7,#b08fff)'}}/>
              <div className="ch-tl">// TYPOLOGIA · ENNEAGRAM</div>
              <div style={{display:'flex',alignItems:'center',justifyContent:'center',marginBottom:8}}>
                <EnnStar active={ennN} pct={ennN ? (done/6)*100 : 0}/>
              </div>
              <div style={{textAlign:'center',marginBottom:12}}>
                <div className="ch-enn-num">{ennN ?? '?'}</div>
                <div className="ch-enn-type">{ennP?.name ?? 'Nieznany typ'}</div>
                <div className="ch-enn-sub">{ennL ? `SKRZYDŁO ${ennWing||'?'} · ENNEAGRAM` : 'WYKONAJ TEST'}</div>
                <div className="ch-enn-desc">{ennL?.desc.slice(0,110) ?? 'Wykonaj test Enneagram aby odblokować typologię motywacji.'}</div>
              </div>
              <div style={{borderTop:'1px solid rgba(176,143,255,.07)',paddingTop:10}}>
                <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:8,flexWrap:'wrap'}}>
                  <div className="ch-hol-ltrs">
                    {holland ? holland.split('').map((c,i) => (
                      <div key={c+i} className={`ch-hl ${HL_CLASS[i%4]}`}>{c}</div>
                    )) : ['?','?','?'].map((c,i) => (
                      <div key={i} className={`ch-hl ${HL_CLASS[i]}`}>{c}</div>
                    ))}
                  </div>
                  <div className="ch-careers">
                    {topJobs.slice(0,3).map((j:any,i:number) => (
                      <span key={i} className="ch-ct">{j.title ?? j.name ?? ''}</span>
                    ))}
                    {topJobs.length === 0 && <span className="ch-ct">WYKONAJ TEST KARIERY</span>}
                  </div>
                </div>
                <div className="ch-val-chips" style={{marginBottom:8}}>
                  {topVals.length > 0 ? topVals.map((v:any,i:number) => (
                    <span key={i} className={['ch-vc1','ch-vc2','ch-vc3','ch-vc4','ch-vc1'][i]}>
                      {v.name ?? v.value_name ?? String(v)}
                    </span>
                  )) : <span className="ch-vc4">Wykonaj test wartości</span>}
                </div>
                <div style={{fontSize:8.5,color:'rgba(255,255,255,.18)',fontFamily:'Share Tech Mono,monospace',letterSpacing:'1px',lineHeight:1.6}}>
                  {raw.DARK_TRIAD
                    ? `CIEŃ · ${dtTraits.map(t => `${t.label}: ${t.pct}%`).join(' · ')}`
                    : 'Wykonaj test Dark Triad SD3 aby zobaczyć profil cienia.'}
                </div>
              </div>
            </div>

            {/* T4: STRENGTHS */}
            <div className="ch-tile ch-t-str">
              <div className="ch-tile-accent" style={{background:'linear-gradient(90deg,#fbbf24,#34d399)'}}/>
              <div className="ch-tl">// ARSENAL · TOP TALENTY</div>
              {top5.length > 0 ? (
                <>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,marginBottom:12}}>
                    <div className="ch-str-list">
                      {top5.slice(0,3).map((t:any,i:number) => (
                        <div key={t.name ?? i} className="ch-str-item">
                          <span className="ch-srk">0{i+1}</span>
                          <div className="ch-sinf">
                            <div className="ch-snm">{t.name ?? t.name_en}</div>
                            <div className="ch-sct">{t.category ?? t.domain ?? 'TALENT'}</div>
                            {t.description && <div style={{fontSize:8,color:'rgba(255,255,255,.28)',lineHeight:1.5,marginTop:2}}>{String(t.description).slice(0,55)}…</div>}
                          </div>
                          <div className="ch-sbar"><div className="ch-sbf" style={{width:`${Math.max(65,100-i*13)}%`, background:STR_COLORS[i]}}/></div>
                        </div>
                      ))}
                    </div>
                    <div className="ch-str-list">
                      {top5.slice(3).map((t:any,i:number) => (
                        <div key={t.name ?? i} className="ch-str-item">
                          <span className="ch-srk">0{i+4}</span>
                          <div className="ch-sinf">
                            <div className="ch-snm">{t.name ?? t.name_en}</div>
                            <div className="ch-sct">{t.category ?? t.domain ?? 'TALENT'}</div>
                            {t.description && <div style={{fontSize:8,color:'rgba(255,255,255,.28)',lineHeight:1.5,marginTop:2}}>{String(t.description).slice(0,55)}…</div>}
                          </div>
                          <div className="ch-sbar"><div className="ch-sbf" style={{width:`${Math.max(50,85-(i+3)*13)}%`, background:STR_COLORS[(i+3)%5]}}/></div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {ennL && (
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:8}}>
                      <div className="ch-energy-box" style={{background:'rgba(16,185,129,.05)',border:'1px solid rgba(16,185,129,.15)'}}>
                        <div className="ch-energy-title" style={{color:'rgba(52,211,153,.6)'}}>⚡ CO CIĘ ŁADUJE</div>
                        {ennL.charges.map(c => (
                          <div key={c} className="ch-energy-row"><span style={{color:'#34d399',marginRight:4}}>›</span>{c}</div>
                        ))}
                      </div>
                      <div className="ch-energy-box" style={{background:'rgba(239,68,68,.04)',border:'1px solid rgba(239,68,68,.12)'}}>
                        <div className="ch-energy-title" style={{color:'rgba(239,68,68,.5)'}}>⬇ CO CIĘ DRENUJE</div>
                        {ennL.drains.map(d => (
                          <div key={d} className="ch-energy-row"><span style={{color:'#ef4444',marginRight:4}}>›</span>{d}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="ch-empty-block">
                  <div className="ch-empty-icon">⚡</div>
                  <div className="ch-empty-text">Wykonaj test Strengths aby odkryć naturalne talenty</div>
                  <a className="ch-go-btn" href="/user-profile-tests.html">Wykonaj test Strengths →</a>
                </div>
              )}
            </div>

            {/* T5: DARK TRIAD */}
            <div className="ch-tile ch-t-dt" style={{borderColor:'rgba(239,68,68,.15)'}}>
              <div className="ch-tile-accent" style={{background:'linear-gradient(90deg,#ef4444,#f97316,#fbbf24)'}}/>
              <div className="ch-tl" style={{color:'rgba(239,68,68,.45)'}}>// CIEMNA TRIADA · SD3 · CIEŃ</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,flex:1}}>
                <div>
                  {raw.DARK_TRIAD ? (
                    <div className="ch-dt-bars">
                      {dtTraits.map(t => (
                        <div key={t.k} className="ch-dt-row">
                          <div className="ch-dt-head">
                            <div className="ch-dt-name" style={{color:t.color}}>
                              <span style={{width:8,height:8,borderRadius:'50%',background:t.color,boxShadow:`0 0 6px ${t.color}`,display:'inline-block'}}/>
                              {t.label}
                            </div>
                            <div className="ch-dt-sw">
                              <span className="ch-dt-sc" style={{color:t.color}}>{t.pct}</span>
                              <span className="ch-dt-mx">/100</span>
                              <span className="ch-dt-pc" style={{color:t.color,marginLeft:5}}>{t.pct>70?'HIGH':t.pct>40?'MED':'LOW'}</span>
                            </div>
                          </div>
                          <div className="ch-dt-track">
                            <div className="ch-dt-fill" style={{width:`${t.pct}%`, background:`linear-gradient(90deg,${t.color}55,${t.color})`}}/>
                          </div>
                          <div className="ch-dt-tags">
                            {t.pct>70 && <span className="ch-dtag">DOMINUJĄCY</span>}
                            {t.pct>50 && t.pct<=70 && <span className="ch-dtag">PODWYŻSZONY</span>}
                            {t.pct<=50 && <span className="ch-dtag">KONTROLOWANY</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="ch-empty-block">
                      <div className="ch-empty-icon">🌑</div>
                      <div className="ch-empty-text">Odblokuj test Dark Triad SD3</div>
                      <a className="ch-go-btn" href="/user-profile-tests.html">Odblokuj →</a>
                    </div>
                  )}
                </div>
                <div>
                  <div className="ch-tl" style={{color:'rgba(239,68,68,.35)',marginBottom:10}}>// OBSZARY CIENIA</div>
                  {raw.DARK_TRIAD ? (
                    <div className="ch-sh-list">
                      {SHADOW_ITEMS.map(s => {
                        const td = dtTraits.find(t => t.k === s.trait);
                        const high = (td?.pct ?? 0) > 55;
                        return (
                          <div key={s.trait} className="ch-sh-item">
                            <span className="ch-shico">{s.icon}</span>
                            <div className="ch-shbd">
                              <div className="ch-shtt">{high ? s.hi : s.lo.split('—')[0].trim()}</div>
                              <div className="ch-sht">{high ? `Wynik ${td?.pct}% — strefa ryzyka.` : s.lo}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="ch-empty-block">
                      <div className="ch-empty-icon">🌘</div>
                      <div className="ch-empty-text">Obszary cienia pojawią się po ukończeniu testu</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* T6: AI SYNTHESIS */}
            <div className="ch-tile ch-t-synth">
              <div className="ch-tile-accent" style={{background:'linear-gradient(90deg,#6366f1,#38b6ff,#7b5ea7,#34d399)'}}/>
              <div className="ch-tl">// PSYCHER AI INSIGHT · SYNTEZA PROFILU</div>
              {synthLines.length >= 2 ? (
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(250px,1fr))',gap:10}}>
                  {synthLines.map((line,i) => (
                    <div key={i} className="ch-iblk" style={{background:SYNTH_BG[i%6], border:`1px solid ${SYNTH_BD[i%6]}`}}>
                      <div className="ch-ib-tx" dangerouslySetInnerHTML={{__html:line}}/>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="ch-empty-block">
                  <div className="ch-empty-icon">🔮</div>
                  <div className="ch-empty-text">Synteza AI pojawi się po ukończeniu co najmniej 3 testów. Aktualnie {done}/6.</div>
                  <a className="ch-go-btn" href="/user-profile-tests.html">Uzupełnij profil →</a>
                </div>
              )}
            </div>

          </div>{/* /ch-bento */}

          {/* TRAIT CHIPS */}
          {chips.length > 0 && (
            <div style={{marginTop:14}}>
              <div className="ch-tl">// CECHY DOMINUJĄCE · TRAIT CHIPS</div>
              <div className="ch-tflow">
                {chips.map((c,i) => <span key={i} className={`ch-tt ${c.cls}`}>{c.label}</span>)}
              </div>
            </div>
          )}

          {/* FOOTER */}
          <div className="ch-footer">
            <div className="ch-fid">CHAR-ID: {charId} · PSYCHER v2.0</div>
            <div className="ch-ftests">
              {(['HEXACO','ENNEAGRAM','STRENGTHS','CAREER','DARK_TRIAD','VALUES'] as const).map(k => raw[k] ? '■' : '□').join(' ')}
            </div>
            <div className="ch-fver">BUILD {buildDate}</div>
          </div>

        </div>
      </div>
    </div>
  );
}
