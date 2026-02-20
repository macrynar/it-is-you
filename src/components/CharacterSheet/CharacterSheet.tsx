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

/* RGB triplets for dynamic inline backgrounds */
const HEX_BG: Record<string,string> = {
  honesty_humility:'167,139,250', emotionality:'244,114,182', extraversion:'251,146,60',
  agreeableness:'52,211,153',     conscientiousness:'96,165,250',  openness:'251,191,36'
};
const HL_STYLES = [
  {bg:'rgba(56,182,255,.12)',  color:'#38b6ff', border:'rgba(56,182,255,.28)'},
  {bg:'rgba(0,229,160,.10)',   color:'#34d399', border:'rgba(0,229,160,.24)'},
  {bg:'rgba(232,120,224,.10)', color:'#e878e0', border:'rgba(232,120,224,.24)'},
  {bg:'rgba(56,182,255,.12)',  color:'#38b6ff', border:'rgba(56,182,255,.28)'},
];
const CHIP_STYLE: Record<string,{bg:string;border:string;color:string}> = {
  'ch-ttc':{bg:'rgba(56,182,255,.09)', border:'rgba(56,182,255,.22)', color:'#38b6ff'},
  'ch-ttv':{bg:'rgba(176,143,255,.09)',border:'rgba(176,143,255,.22)',color:'#b08fff'},
  'ch-ttg':{bg:'rgba(0,229,160,.08)',  border:'rgba(0,229,160,.2)',   color:'#34d399'},
  'ch-tto':{bg:'rgba(249,115,22,.08)', border:'rgba(249,115,22,.2)',  color:'#f97316'},
  'ch-ttp':{bg:'rgba(232,120,224,.08)',border:'rgba(232,120,224,.2)', color:'#e878e0'},
  'ch-ttt':{bg:'rgba(64,224,208,.08)', border:'rgba(64,224,208,.2)',  color:'#40e0d0'},
};

interface RawRow { test_type:string; raw_scores:any; percentile_scores:any; report:any; }

/* ══ MINIMAL CSS — only nav/logo animations + keyframes Tailwind cannot express ══ */
const MINIMAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&family=Space+Grotesk:wght@400;500;600;700;800&display=swap');
.iiy-logo,.iiy-logo *{box-sizing:border-box;margin:0;padding:0}
.iiy-logo{display:inline-flex;align-items:center;gap:20px;text-decoration:none;user-select:none}
.iiy-logo .iiy-wordmark{display:flex;flex-direction:column}
.iiy-logo .iiy-title{font-family:"Orbitron",monospace;font-weight:900;text-transform:uppercase;background:linear-gradient(160deg,#fff 0%,#a8c8ff 35%,#38b6ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;filter:drop-shadow(0 0 16px rgba(56,182,255,.45));animation:iiy-glitch 9s infinite}
@keyframes iiy-glitch{0%,87%,100%{transform:none}88%{transform:translate(-2px,0) skewX(-2deg)}89%{transform:translate(2px,0)}90%{transform:none}}
.iiy-logo .iiy-divider{height:1px;background:linear-gradient(90deg,#38b6ff,#7b5ea7 55%,transparent);opacity:.8}
.iiy-logo .iiy-sub{font-family:"Share Tech Mono",monospace;color:rgba(100,160,230,.5);text-transform:uppercase;line-height:1}
.iiy-logo.iiy-sm{gap:14px}.iiy-logo.iiy-sm .iiy-signet svg{width:44px;height:44px}
.iiy-logo.iiy-sm .iiy-title{font-size:19px;letter-spacing:7px;line-height:1}
.iiy-logo.iiy-sm .iiy-sub{font-size:7px;letter-spacing:2.5px}
.iiy-logo.iiy-sm .iiy-divider{margin:4px 0 3px}
.iiy-ring-ticks{animation:iiy-spin 20s linear infinite;transform-origin:48px 48px}
.iiy-eye-l{animation:iiy-eye 3.5s ease-in-out infinite}.iiy-eye-r{animation:iiy-eye 3.5s ease-in-out infinite .2s}
@keyframes iiy-eye{0%,70%,100%{opacity:1}76%{opacity:.05}}
.iiy-scan{animation:iiy-scan 2.8s ease-in-out infinite}
@keyframes iiy-scan{0%{transform:translateY(-22px);opacity:0}8%{opacity:.55}92%{opacity:.55}100%{transform:translateY(22px);opacity:0}}
.iiy-core{animation:iiy-pulse 2.2s ease-in-out infinite;transform-origin:48px 61px}
@keyframes iiy-pulse{0%,100%{transform:scale(1);opacity:.6}50%{transform:scale(1.9);opacity:1}}
.iiy-nav-tabs{display:flex;align-items:center;gap:2px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:12px;padding:4px}
.iiy-tab-btn{padding:8px 20px;border-radius:9px;border:none;background:transparent;color:rgba(255,255,255,.45);font-size:13px;font-weight:600;cursor:pointer;transition:all .2s;font-family:"Space Grotesk",-apple-system,sans-serif;white-space:nowrap}
.iiy-tab-btn:hover{color:rgba(255,255,255,.8);background:rgba(255,255,255,.05)}
.iiy-tab-btn.active{background:linear-gradient(135deg,rgba(99,102,241,.3),rgba(56,182,255,.2));color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.12),0 0 0 1px rgba(99,102,241,.3)}
.theme-toggle{position:relative;width:60px;height:32px;background:rgba(30,41,59,.6);border-radius:16px;border:1px solid rgba(255,255,255,.1);cursor:pointer;transition:all .3s ease;flex-shrink:0}
.theme-toggle:hover{background:rgba(15,7,40,.9);border-color:rgba(112,0,255,.5)}
.theme-toggle-slider{position:absolute;top:3px;left:3px;width:24px;height:24px;background:linear-gradient(135deg,#7000ff,#00f0ff);border-radius:50%;transition:transform .3s cubic-bezier(.4,0,.2,1);box-shadow:0 2px 8px rgba(112,0,255,.5)}
.theme-toggle.light .theme-toggle-slider{transform:translateX(28px);background:linear-gradient(135deg,#F59E0B,#EAB308);box-shadow:0 2px 8px rgba(245,158,11,.4)}
.theme-icon{position:absolute;top:50%;transform:translateY(-50%);width:16px;height:16px;transition:opacity .3s ease}
.theme-icon-moon{left:8px;opacity:1}.theme-icon-sun{right:8px;opacity:.4}
.theme-toggle.light .theme-icon-moon{opacity:.4}.theme-toggle.light .theme-icon-sun{opacity:1}
@keyframes iiy-spin{to{transform:rotate(360deg)}}
@keyframes cs-spin{to{transform:rotate(360deg)}}
@keyframes cs-asc{0%{transform:translateY(-28px);opacity:0}6%{opacity:.6}94%{opacity:.6}100%{transform:translateY(28px);opacity:0}}
@keyframes cs-blink{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.3;transform:scale(.5)}}
@keyframes cs-fadeup{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.cs-asc{animation:cs-asc 3.4s ease-in-out infinite}
.cs-blink{animation:cs-blink 1.8s ease-in-out infinite}
.cs-spin{animation:cs-spin .8s linear infinite}
.cs-fu1{animation:cs-fadeup .5s ease-out .05s both}.cs-fu2{animation:cs-fadeup .5s ease-out .10s both}
.cs-fu3{animation:cs-fadeup .5s ease-out .15s both}.cs-fu4{animation:cs-fadeup .5s ease-out .20s both}
.cs-fu5{animation:cs-fadeup .5s ease-out .25s both}.cs-fu6{animation:cs-fadeup .5s ease-out .30s both}
`;

const _STYLES_REMOVED = [
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
'.theme-toggle{position:relative;width:60px;height:32px;background:rgba(30,41,59,.6);border-radius:16px;border:1px solid rgba(255,255,255,.1);cursor:pointer;transition:all .3s ease;flex-shrink:0}',
'.theme-toggle:hover{background:rgba(15,7,40,.9);border-color:rgba(112,0,255,.5)}',
'.theme-toggle-slider{position:absolute;top:3px;left:3px;width:24px;height:24px;background:linear-gradient(135deg,#7000ff,#00f0ff);border-radius:50%;transition:transform .3s cubic-bezier(.4,0,.2,1);box-shadow:0 2px 8px rgba(112,0,255,.5)}',
'.theme-toggle.light .theme-toggle-slider{transform:translateX(28px);background:linear-gradient(135deg,#F59E0B,#EAB308);box-shadow:0 2px 8px rgba(245,158,11,.4)}',
'.theme-icon{position:absolute;top:50%;transform:translateY(-50%);width:16px;height:16px;transition:opacity .3s ease}',
'.theme-icon-moon{left:8px;opacity:1}.theme-icon-sun{right:8px;opacity:.4}',
'.theme-toggle.light .theme-icon-moon{opacity:.4}.theme-toggle.light .theme-icon-sun{opacity:1}',
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
].join(''); // legacy — kept to avoid breaking git history, not injected

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
'<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg">',
'<defs>',
'<linearGradient id="iiy-hg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#38b6ff"/><stop offset="50%" stop-color="#7b5ea7"/><stop offset="100%" stop-color="#38b6ff"/></linearGradient>',
'<linearGradient id="iiy-bg2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#38b6ff" stop-opacity="0.45"/><stop offset="100%" stop-color="#1a1d4a" stop-opacity="0.08"/></linearGradient>',
'<filter id="iiy-glow2" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
'<clipPath id="iiy-clip2"><polygon points="48,5 87,27 87,69 48,91 9,69 9,27"/></clipPath>',
'</defs>',
'<polygon points="48,5 87,27 87,69 48,91 9,69 9,27" fill="#11143a"/>',
'<g class="iiy-ring-ticks" filter="url(#iiy-glow2)">',
'<line x1="48" y1="5" x2="48" y2="12" stroke="#38b6ff" stroke-width="1.8"/><line x1="87" y1="27" x2="81" y2="30" stroke="#38b6ff" stroke-width="1.8"/><line x1="87" y1="69" x2="81" y2="66" stroke="#38b6ff" stroke-width="1.8"/><line x1="48" y1="91" x2="48" y2="84" stroke="#38b6ff" stroke-width="1.8"/><line x1="9" y1="69" x2="15" y2="66" stroke="#38b6ff" stroke-width="1.8"/><line x1="9" y1="27" x2="15" y2="30" stroke="#38b6ff" stroke-width="1.8"/>',
'<line x1="68" y1="8" x2="66" y2="12" stroke="#7b5ea7" stroke-width="1" opacity="0.6"/><line x1="28" y1="8" x2="30" y2="12" stroke="#7b5ea7" stroke-width="1" opacity="0.6"/><line x1="90" y1="48" x2="84" y2="48" stroke="#7b5ea7" stroke-width="1" opacity="0.6"/><line x1="6" y1="48" x2="12" y2="48" stroke="#7b5ea7" stroke-width="1" opacity="0.6"/><line x1="68" y1="88" x2="66" y2="84" stroke="#7b5ea7" stroke-width="1" opacity="0.6"/><line x1="28" y1="88" x2="30" y2="84" stroke="#7b5ea7" stroke-width="1" opacity="0.6"/>',
'</g>',
'<polygon points="48,5 87,27 87,69 48,91 9,69 9,27" fill="none" stroke="url(#iiy-hg2)" stroke-width="1.8"/>',
'<g clip-path="url(#iiy-clip2)">',
'<line class="iiy-scan" x1="12" y1="48" x2="84" y2="48" stroke="#38b6ff" stroke-width="1.2" opacity="0.5"/>',
'<circle cx="48" cy="30" r="12" fill="#11143a" stroke="#38b6ff" stroke-width="1.2"/>',
'<rect x="37" y="26.5" width="22" height="6" rx="3" fill="#0d0f2b" stroke="#38b6ff" stroke-width="0.7"/>',
'<ellipse class="iiy-eye-l" cx="43" cy="29.5" rx="3.5" ry="1.8" fill="#7b5ea7" filter="url(#iiy-glow2)"/>',
'<ellipse class="iiy-eye-r" cx="53" cy="29.5" rx="3.5" ry="1.8" fill="#7b5ea7" filter="url(#iiy-glow2)"/>',
'<rect x="44.5" y="42" width="7" height="6" rx="1" fill="#11143a" stroke="#38b6ff" stroke-width="0.8"/>',
'<path d="M28 90 L31 50 Q48 44 65 50 L68 90 Z" fill="url(#iiy-bg2)" stroke="#38b6ff" stroke-width="0.9"/>',
'<line x1="48" y1="50" x2="48" y2="74" stroke="#38b6ff" stroke-width="0.5" opacity="0.35"/>',
'<rect x="39" y="55" width="18" height="12" rx="1.5" fill="none" stroke="#38b6ff" stroke-width="0.6" opacity="0.5"/>',
'<line x1="31" y1="52" x2="31" y2="65" stroke="#7b5ea7" stroke-width="1.4" opacity="0.9"/>',
'<line x1="65" y1="52" x2="65" y2="65" stroke="#7b5ea7" stroke-width="1.4" opacity="0.9"/>',
'<circle class="iiy-core" cx="48" cy="61" r="2.8" fill="#38b6ff" filter="url(#iiy-glow2)"/>',
'</g></svg>',
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
  const [lightMode, setLightMode] = useState(() => document.body.classList.contains('light-mode'));
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
    <div className="min-h-screen bg-[#030014] flex items-center justify-center">
      <style dangerouslySetInnerHTML={{__html: MINIMAL_CSS}}/>
      <div className="text-center">
        <div className="w-10 h-10 rounded-full border-2 border-sky-400/15 border-t-sky-400 cs-spin mx-auto mb-4"/>
        <div className="font-mono text-sky-400/35 text-[11px] tracking-[3px]">LOADING PROFILE…</div>
      </div>
    </div>
  );


  /* ── Reusable micro-components ── */
  const SectionLabel = ({ children, danger }: { children: string; danger?: boolean }) => (
    <div className="flex items-center gap-2 mb-4">
      <span className={`text-[8px] tracking-[2.5px] uppercase font-mono ${danger ? 'text-rose-400/45' : 'text-sky-400/40'}`}>{children}</span>
      <div className={`flex-1 h-px bg-gradient-to-r ${danger ? 'from-rose-400/20' : 'from-sky-400/20'} to-transparent`}/>
    </div>
  );
  const EmptyBlock = ({ icon, text, href, btnText }: { icon:string; text:string; href?:string; btnText?:string }) => (
    <div className="flex flex-col items-center justify-center py-6 text-center opacity-55 flex-1">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-[0.78rem] text-white/30 mb-3">{text}</div>
      {href && <a href={href} className="px-3 py-1.5 rounded-md border border-indigo-400/40 bg-indigo-400/12 text-indigo-300 text-[0.72rem] font-semibold transition-all hover:bg-indigo-400/22 hover:text-white no-underline">{btnText}</a>}
    </div>
  );

  return (
    <div className="bg-[#030014] [background-image:radial-gradient(circle_at_50%_0%,#1a0b38_0%,transparent_60%)] bg-fixed min-h-screen text-slate-200">
      <style dangerouslySetInnerHTML={{__html: MINIMAL_CSS}}/>

      {/* NAV — identyczna struktura jak user-profile-tests.html */}
      <nav className="border-b border-white/5 bg-bg-surface/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <a href="https://it-is-you1.vercel.app/" className="iiy-logo iiy-sm" dangerouslySetInnerHTML={{__html:LOGO_HTML}}/>
            <div className="iiy-nav-tabs">
              <button className="iiy-tab-btn" onClick={() => { window.location.href='/user-profile-tests.html'; }}>🧪 Testy</button>
              <button className="iiy-tab-btn active">🃏 Karta Postaci</button>
            </div>
            <div className="flex items-center gap-4">
              <button
                className={`theme-toggle${lightMode ? ' light' : ''}`}
                title="Przełącz motyw"
                onClick={() => { const n = !lightMode; setLightMode(n); document.body.classList.toggle('light-mode', n); }}
              >
                <div className="theme-toggle-slider"/>
                <svg className="theme-icon theme-icon-moon" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
                <svg className="theme-icon theme-icon-sun" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </button>
              <button onClick={async () => { await supabase.auth.signOut(); window.location.href='/'; }}
                className="px-4 py-2 bg-bg-surface/50 hover:bg-bg-surface text-white rounded-lg text-sm border border-white/10 hover:border-brand-primary/50 transition-all backdrop-blur-sm">
                Wyloguj
              </button>
              <a href="/settings"
                className="px-4 py-2 bg-bg-surface/50 hover:bg-bg-surface text-white rounded-lg text-sm border border-white/10 hover:border-brand-primary/50 transition-all backdrop-blur-sm inline-flex items-center gap-1.5 no-underline"
                title="Ustawienia konta">⚙️ Ustawienia</a>
            </div>
          </div>
        </div>
      </nav>

      {/* PAGE */}
      <div className="px-6 py-7 pb-16 font-[Space_Grotesk,system-ui,sans-serif]">

        {/* STATUS BAR */}
        <div className="flex items-center justify-between flex-wrap gap-2 mb-5 py-2.5 px-4 bg-[rgba(8,14,40,.72)] border border-sky-400/10 rounded-lg backdrop-blur-md max-w-[1400px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-emerald-500/[0.07] border border-emerald-400/[0.22] font-mono text-[9.5px] tracking-[2px] text-emerald-400">
            <span className="w-[5px] h-[5px] rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399] cs-blink"/>
            {done >= 6 ? 'PROFIL KOMPLETNY' : 'PROFIL W BUDOWIE'} · {done}/6 TESTÓW UKOŃCZONYCH
          </div>
          <div className="font-mono text-[8.5px] text-sky-400/[0.28] tracking-[2px]">CHAR-ID: {charId} · PSYCHER v2.0</div>
        </div>

        {/* ── BENTO GRID ── */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-[1400px] mx-auto auto-rows-min">

          {/* ── T1: HERO & AI CORE ── */}
          <div className="col-span-1 lg:col-span-1 lg:row-span-2 bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 relative flex flex-col transition-all hover:border-violet-500/30 overflow-hidden cs-fu1">
            <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-sky-400 via-violet-500 to-fuchsia-500"/>
            <SectionLabel>// IDENTYFIKACJA</SectionLabel>

            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="relative w-[90px] h-[90px] mb-3">
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
                  <rect className="cs-asc" x="3" y="44" width="84" height="2" fill="url(#av-sg)" rx="1"/>
                </svg>
                <div className={`absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-[#030014] ${done>=4?'bg-emerald-400 shadow-[0_0_7px_#34d399]':'bg-amber-400 shadow-[0_0_7px_#f59e0b]'}`}/>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-gradient-to-r from-indigo-500/[0.14] to-sky-400/[0.11] border border-indigo-400/[0.28] font-mono text-[9px] tracking-[2px] text-indigo-300 mb-3">
                <span className="w-1 h-1 rounded-full bg-indigo-300 shadow-[0_0_6px_#a5b4fc]"/>
                LVL {done} · {lvlLabel}
              </div>
              <div className="font-['Orbitron'] font-black text-base tracking-[2.5px] uppercase text-white mb-1 break-words [text-shadow:0_0_18px_rgba(56,182,255,.22)]">{userName}</div>
              <div className="font-mono text-[10px] tracking-[2px] text-sky-400 mb-1 [text-shadow:0_0_10px_rgba(56,182,255,.4)]">{ennL?.rpg ?? 'ARCHETYP NIEZNANY'}</div>
              <div className="font-mono text-[7.5px] tracking-[1.5px] text-white/[0.22] mb-3">{codeStr || 'UZUPEŁNIJ TESTY'}</div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-sm bg-violet-400/[0.07] border border-violet-400/20 font-mono text-[8.5px] tracking-[1.5px] text-violet-300 mb-4">{rareLabel}</div>
            </div>

            {/* XP bar */}
            <div className="w-full mb-5">
              <div className="flex justify-between mb-1">
                <span className="font-mono text-[8px] tracking-[1.5px] text-white/[0.22]">PROFIL XP</span>
                <span className="font-mono text-[8px] tracking-[1.5px] text-sky-400/60">{done}/6</span>
              </div>
              <div className="h-1 bg-white/5 rounded-sm overflow-hidden relative">
                <div className="h-full rounded-sm bg-gradient-to-r from-[#3d2a9e] to-sky-400 shadow-[0_0_10px_rgba(56,182,255,.5)] transition-[width] duration-1000 ease-out relative"
                  style={{width:`${xpPct}%`}}>
                  <span className="absolute -right-0.5 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(56,182,255,.8)]"/>
                </div>
              </div>
            </div>

            <SectionLabel>// ARCHETYP RPG</SectionLabel>
            {ennL ? (
              <>
                <div className="bg-indigo-500/[0.07] border border-indigo-500/20 rounded-lg p-3 mb-3">
                  <div className="font-mono text-[7.5px] tracking-[2px] text-indigo-400/55 mb-1.5 uppercase">KLASA POSTACI</div>
                  <div className="text-[15px] font-bold text-white mb-1">{ennL.symbol} {ennL.rpg}</div>
                  <div className="text-[9.5px] text-indigo-400/70 italic mb-1.5">"{ennL.epithet}"</div>
                  <div className="text-[9px] text-white/[0.32] leading-relaxed">{ennL.desc.slice(0,110)}…</div>
                </div>
                <SectionLabel>// PODOBNE POSTACIE</SectionLabel>
                <div className="flex flex-col gap-0.5">
                  {ennL.pop.slice(0,4).map((p,i) => (
                    <div key={p} className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/5 cursor-default transition-all hover:bg-white/[0.07] hover:translate-x-0.5">
                      <span className="font-mono text-[8px] text-white/15 w-3 text-center shrink-0">{i+1}</span>
                      <span className="text-[11px] font-semibold text-white/65 flex-1">{p}</span>
                      <span className="font-mono text-[8px] text-white/18">{[97,85,74,64][i]}%</span>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyBlock icon="⚔" text="Ukończ test Enneagram aby odblokować archetyp RPG" href="/user-profile-tests.html" btnText="Przejdź do testów →"/>}
          </div>

          {/* ── T2: MATRYCA HEXACO ── */}
          <div className="col-span-1 lg:col-span-2 lg:row-span-2 min-h-[500px] bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 relative flex flex-col transition-all hover:border-sky-500/30 overflow-hidden cs-fu2">
            <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-cyan-400 to-sky-400"/>
            <SectionLabel>// MATRYCA · HEXACO-60</SectionLabel>
            {raw.HEXACO ? (
              <>
                {/* Radar — 60% */}
                <div className="flex justify-center">
                  <HexRadar data={hexBars.map(h => ({k:h.k, pct:h.pct}))}/>
                </div>
                {/* Attribute boxes 3-col */}
                <div className="grid grid-cols-3 gap-2 mt-3 mb-4">
                  {hexBars.map(h => (
                    <div key={h.k} className="p-2 rounded cursor-default transition-transform hover:-translate-y-0.5"
                      style={{background:`rgba(${HEX_BG[h.k]},.07)`, border:`1px solid rgba(${HEX_BG[h.k]},.2)`}}>
                      <div className="font-mono text-[7px] tracking-[1.5px] text-white/[0.26] mb-0.5 uppercase">{h.short}</div>
                      <div className="font-['Orbitron'] text-[22px] font-bold leading-none mb-0.5" style={{color:h.color, textShadow:`0 0 12px ${h.color}99`}}>{h.pct}</div>
                      <div className="text-[8px] font-semibold text-white/[0.28]">{h.label.slice(0,7)}</div>
                    </div>
                  ))}
                </div>
                {/* Progress bars 2-col — 40% */}
                <div className="border-t border-sky-400/[0.07] pt-3 grid grid-cols-2 gap-x-5 gap-y-2">
                  {hexBars.map(h => (
                    <div key={h.k}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-semibold text-white/44">{h.label}</span>
                        <span className="font-mono text-[10px] font-bold" style={{color:h.color}}>{h.pct}%</span>
                      </div>
                      <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-[width] duration-[1200ms]" style={{width:`${h.pct}%`, background:h.color}}/>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : <EmptyBlock icon="📊" text="Wykonaj test HEXACO-60 aby odblokować radar osobowości" href="/user-profile-tests.html" btnText="Wykonaj test HEXACO-60 →"/>}
          </div>

          {/* ── T3: ENNEAGRAM & ENGINE ── */}
          <div className="col-span-1 lg:col-span-1 lg:row-span-2 min-h-[500px] bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 relative flex flex-col transition-all hover:border-violet-500/30 overflow-hidden cs-fu3">
            <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-violet-600 to-violet-400"/>
            <SectionLabel>// TYPOLOGIA · ENNEAGRAM</SectionLabel>
            <div className="flex justify-center mb-2">
              <EnnStar active={ennN} pct={ennN ? (done/6)*100 : 0}/>
            </div>
            <div className="text-center mb-4">
              <div className="font-['Orbitron'] text-[2.4rem] font-black tracking-[2px] text-violet-400 [text-shadow:0_0_30px_rgba(176,143,255,.5)] leading-none">{ennN ?? '?'}</div>
              <div className="text-[13px] font-bold text-white/80 tracking-wide mt-1">{ennP?.name ?? 'Nieznany typ'}</div>
              <div className="font-mono text-[7px] tracking-[2px] text-violet-400/35 mt-0.5 uppercase">{ennL ? `SKRZYDŁO ${ennWing||'?'} · ENNEAGRAM` : 'WYKONAJ TEST'}</div>
              <div className="text-[9.5px] text-white/35 leading-relaxed mt-1.5">{ennL?.desc.slice(0,110) ?? 'Wykonaj test Enneagram aby odblokować typologię motywacji.'}</div>
            </div>
            <div className="border-t border-violet-400/[0.07] pt-3 flex flex-col gap-3">
              {/* Holland RIASEC */}
              <div>
                <div className="font-mono text-[7.5px] tracking-[2px] text-white/20 mb-2 uppercase">KOD HOLLAND (RIASEC)</div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(holland ? holland.split('') : ['?','?','?']).map((c,i) => (
                    <div key={c+i} className="font-['Orbitron'] text-[14px] font-bold w-7 h-7 rounded flex items-center justify-center"
                      style={{background:HL_STYLES[i%4].bg, color:HL_STYLES[i%4].color, border:`1px solid ${HL_STYLES[i%4].border}`}}>{c}</div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1">
                  {topJobs.slice(0,4).map((j:any,i:number) => (
                    <span key={i} className="font-mono text-[7.5px] px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10 text-white/38">{j.title ?? j.name ?? ''}</span>
                  ))}
                  {topJobs.length === 0 && <span className="font-mono text-[7.5px] px-1.5 py-0.5 rounded-sm bg-white/5 border border-white/10 text-white/38">WYKONAJ TEST KARIERY</span>}
                </div>
              </div>
              {/* Values */}
              <div>
                <div className="font-mono text-[7.5px] tracking-[2px] text-white/20 mb-1.5 uppercase">WARTOŚCI DOMINUJĄCE</div>
                <div className="flex flex-wrap gap-1.5">
                  {(topVals.length > 0 ? topVals : []).map((v:any,i:number) => {
                    const vc = ['bg-sky-400/[0.09] border-sky-400/[0.22] text-sky-400','bg-emerald-400/[0.07] border-emerald-400/[0.2] text-emerald-400','bg-amber-400/[0.08] border-amber-400/[0.2] text-amber-400','bg-violet-400/[0.08] border-violet-400/[0.2] text-violet-300','bg-sky-400/[0.09] border-sky-400/[0.22] text-sky-400'][i];
                    return <span key={i} className={`text-[9.5px] font-semibold px-2 py-0.5 rounded-sm border ${vc}`}>{v.name ?? v.value_name ?? String(v)}</span>;
                  })}
                  {topVals.length === 0 && <span className="text-[9.5px] font-semibold px-2 py-0.5 rounded-sm border bg-violet-400/[0.08] border-violet-400/[0.2] text-violet-300">Wykonaj test wartości</span>}
                </div>
              </div>
              {/* DT shadow summary */}
              <div className="font-mono text-[8.5px] text-white/18 tracking-[1px] leading-relaxed">
                {raw.DARK_TRIAD ? `CIEŃ · ${dtTraits.map(t=>`${t.label}: ${t.pct}%`).join(' · ')}` : 'Wykonaj test Dark Triad SD3 aby zobaczyć profil cienia.'}
              </div>
            </div>
          </div>

          {/* ── T4: ARSENAŁ ── */}
          <div className="col-span-1 lg:col-span-2 bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 relative flex flex-col transition-all hover:border-amber-500/30 overflow-hidden cs-fu4">
            <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-amber-400 to-emerald-400"/>
            <SectionLabel>// ARSENAŁ · TOP TALENTY</SectionLabel>
            {top5.length > 0 ? (
              <>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex flex-col gap-1.5">
                    {top5.slice(0,3).map((t:any,i:number) => (
                      <div key={t.name ?? i} className="flex items-center gap-2 p-2.5 rounded bg-white/[0.03] border border-white/[0.07] cursor-default transition-all hover:bg-sky-400/5 hover:border-sky-400/18 hover:translate-x-0.5">
                        <span className="font-mono text-[9px] text-white/18 w-3.5 shrink-0 text-center">0{i+1}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-white/78 truncate">{t.name ?? t.name_en}</div>
                          <div className="font-mono text-[7px] text-white/27">{t.category ?? t.domain ?? 'TALENT'}</div>
                        </div>
                        <div className="w-8 h-0.5 bg-white/[0.06] rounded-full shrink-0 overflow-hidden">
                          <div className="h-full rounded-full" style={{width:`${Math.max(65,100-i*13)}%`, background:STR_COLORS[i]}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {top5.slice(3).map((t:any,i:number) => (
                      <div key={t.name ?? i} className="flex items-center gap-2 p-2.5 rounded bg-white/[0.03] border border-white/[0.07] cursor-default transition-all hover:bg-sky-400/5 hover:border-sky-400/18 hover:translate-x-0.5">
                        <span className="font-mono text-[9px] text-white/18 w-3.5 shrink-0 text-center">0{i+4}</span>
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-white/78 truncate">{t.name ?? t.name_en}</div>
                          <div className="font-mono text-[7px] text-white/27">{t.category ?? t.domain ?? 'TALENT'}</div>
                        </div>
                        <div className="w-8 h-0.5 bg-white/[0.06] rounded-full shrink-0 overflow-hidden">
                          <div className="h-full rounded-full" style={{width:`${Math.max(50,85-(i+3)*13)}%`, background:STR_COLORS[(i+3)%5]}}/>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {ennL && (
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <div className="rounded-lg p-3 bg-emerald-500/5 border border-emerald-500/15">
                      <div className="font-mono text-[7.5px] tracking-[2px] text-emerald-400/60 mb-2 uppercase">⚡ CO CIĘ ŁADUJE</div>
                      {ennL.charges.map(c => <div key={c} className="flex items-center gap-1.5 mb-1 text-[9.5px] text-white/55"><span className="text-emerald-400">›</span>{c}</div>)}
                    </div>
                    <div className="rounded-lg p-3 bg-rose-500/[0.04] border border-rose-500/12">
                      <div className="font-mono text-[7.5px] tracking-[2px] text-rose-400/50 mb-2 uppercase">⬇ CO CIĘ DRENUJE</div>
                      {ennL.drains.map(d => <div key={d} className="flex items-center gap-1.5 mb-1 text-[9.5px] text-white/55"><span className="text-rose-400">›</span>{d}</div>)}
                    </div>
                  </div>
                )}
              </>
            ) : <EmptyBlock icon="⚡" text="Wykonaj test Strengths aby odkryć naturalne talenty" href="/user-profile-tests.html" btnText="Wykonaj test Strengths →"/>}
          </div>

          {/* ── T5: STREFA CIENIA ── */}
          <div className="col-span-1 lg:col-span-2 bg-rose-950/20 border border-rose-500/20 backdrop-blur-xl rounded-2xl p-6 relative flex flex-col transition-all hover:border-rose-500/35 overflow-hidden cs-fu5">
            <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-rose-500 via-orange-400 to-amber-400"/>
            <SectionLabel danger>// CIEMNA TRIADA · SD3 · CIEŃ</SectionLabel>
            <div className="grid grid-cols-2 gap-4 flex-1">
              {/* Bars */}
              <div>
                {raw.DARK_TRIAD ? (
                  <div className="flex flex-col gap-4">
                    {dtTraits.map(t => (
                      <div key={t.k}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5 text-[12.5px] font-bold" style={{color:t.color}}>
                            <span className="w-2 h-2 rounded-full inline-block" style={{background:t.color, boxShadow:`0 0 6px ${t.color}`}}/>
                            {t.label}
                          </div>
                          <div className="flex items-baseline gap-0.5">
                            <span className="font-['Orbitron'] text-[18px] font-bold" style={{color:t.color}}>{t.pct}</span>
                            <span className="font-mono text-[8px] text-white/28">/100</span>
                            <span className="font-mono text-[8px] ml-1.5" style={{color:t.color}}>{t.pct>70?'HIGH':t.pct>40?'MED':'LOW'}</span>
                          </div>
                        </div>
                        <div className="h-2.5 rounded-sm bg-white/[0.04] overflow-hidden">
                          <div className="h-full rounded-sm transition-[width] duration-1000 ease-out" style={{width:`${t.pct}%`, background:`linear-gradient(90deg,${t.color}55,${t.color})`}}/>
                        </div>
                        <div className="flex gap-1 mt-1">
                          {t.pct>70  && <span className="font-mono text-[7px] px-1.5 py-0.5 rounded-sm bg-white/[0.04] border border-white/[0.08] text-white/30">DOMINUJĄCY</span>}
                          {t.pct>50 && t.pct<=70 && <span className="font-mono text-[7px] px-1.5 py-0.5 rounded-sm bg-white/[0.04] border border-white/[0.08] text-white/30">PODWYŻSZONY</span>}
                          {t.pct<=50 && <span className="font-mono text-[7px] px-1.5 py-0.5 rounded-sm bg-white/[0.04] border border-white/[0.08] text-white/30">KONTROLOWANY</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <EmptyBlock icon="🌑" text="Odblokuj test Dark Triad SD3" href="/user-profile-tests.html" btnText="Odblokuj →"/>}
              </div>
              {/* Shadow items */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[8px] tracking-[2.5px] text-rose-400/35 uppercase font-mono">// OBSZARY CIENIA</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-rose-400/20 to-transparent"/>
                </div>
                {raw.DARK_TRIAD ? (
                  <div className="flex flex-col gap-2">
                    {SHADOW_ITEMS.map(s => {
                      const td = dtTraits.find(t => t.k === s.trait);
                      const high = (td?.pct ?? 0) > 55;
                      return (
                        <div key={s.trait} className="flex items-start gap-2.5 p-2.5 rounded bg-rose-500/[0.04] border border-rose-500/10 cursor-default transition-all hover:bg-rose-500/[0.08] hover:border-rose-500/20">
                          <span className="text-[15px] shrink-0 mt-0.5">{s.icon}</span>
                          <div>
                            <div className="text-[11px] font-bold text-rose-400/82 mb-0.5">{high ? s.hi : s.lo.split('—')[0].trim()}</div>
                            <div className="text-[9px] text-white/35 leading-relaxed">{high ? `Wynik ${td?.pct}% — strefa ryzyka.` : s.lo}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-center opacity-55">
                    <div className="text-2xl mb-2">🌘</div>
                    <div className="text-[0.78rem] text-white/30">Obszary cienia pojawią się po ukończeniu testu</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── T6: SYNTEZA AI ── */}
          <div className="col-span-1 lg:col-span-4 bg-slate-900/60 border border-white/10 backdrop-blur-xl rounded-2xl p-6 relative flex flex-col transition-all hover:border-indigo-500/30 overflow-hidden cs-fu6">
            <div className="absolute top-0 inset-x-0 h-0.5 rounded-t-2xl bg-gradient-to-r from-indigo-500 via-sky-400 via-violet-500 to-emerald-400"/>
            <SectionLabel>// PSYCHER AI INSIGHT · SYNTEZA PROFILU</SectionLabel>
            {synthLines.length >= 2 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {synthLines.map((line,i) => (
                  <div key={i} className="p-3 rounded" style={{background:SYNTH_BG[i%6], border:`1px solid ${SYNTH_BD[i%6]}`}}>
                    <div className="text-[10.5px] text-white/42 leading-relaxed [&_strong]:text-white/80 [&_strong]:font-semibold"
                      dangerouslySetInnerHTML={{__html:line}}/>
                  </div>
                ))}
              </div>
            ) : <EmptyBlock icon="🔮" text={`Synteza AI pojawi się po ukończeniu co najmniej 3 testów. Aktualnie ${done}/6.`} href="/user-profile-tests.html" btnText="Uzupełnij profil →"/>}
          </div>

        </div>{/* /bento grid */}

        {/* TRAIT CHIPS */}
        {chips.length > 0 && (
          <div className="mt-4 max-w-[1400px] mx-auto">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[8px] tracking-[2.5px] text-sky-400/40 uppercase font-mono">// CECHY DOMINUJĄCE · TRAIT CHIPS</span>
              <div className="flex-1 h-px bg-gradient-to-r from-sky-400/20 to-transparent"/>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {chips.map((c,i) => {
                const s = CHIP_STYLE[c.cls] ?? {bg:'rgba(255,255,255,.05)',border:'rgba(255,255,255,.1)',color:'rgba(255,255,255,.5)'};
                return (
                  <span key={i} className="flex items-center gap-1 px-2.5 py-1 rounded-sm text-[10px] font-semibold cursor-default transition-transform hover:-translate-y-0.5"
                    style={{background:s.bg, border:`1px solid ${s.border}`, color:s.color}}>{c.label}</span>
                );
              })}
            </div>
          </div>
        )}

        {/* FOOTER */}
        <div className="flex items-center justify-between flex-wrap gap-2 mt-4 py-2.5 px-3.5 rounded bg-white/[0.02] border border-white/5 max-w-[1400px] mx-auto">
          <div className="font-mono text-[8px] tracking-[2px] text-sky-400/[0.28]">CHAR-ID: {charId} · PSYCHER v2.0</div>
          <div className="font-mono text-[7.5px] text-white/12 tracking-[0.8px]">
            {(['HEXACO','ENNEAGRAM','STRENGTHS','CAREER','DARK_TRIAD','VALUES'] as const).map(k => raw[k] ? '■' : '□').join(' ')}
          </div>
          <div className="font-mono text-[8px] tracking-[2px] text-violet-400/35">BUILD {buildDate}</div>
        </div>

      </div>
    </div>
  );
}
