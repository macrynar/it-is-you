// Kod Koloru — COLOR PERSONALITY MAP
// 32 questions, 4-choice (A=red, B=yellow, C=green, D=blue)
// scale_type: 'choice_4'

export const COLOR_PERSONALITY_TEST = {
  test_id: 'color_personality_v1',
  test_name: 'Kod Koloru',
  test_type: 'color_personality',
  time_estimate_minutes: 6,
  question_count: 32,
  scale_type: 'choice_4',

  colors: [
    {
      id: 'red',
      name: 'Czerwony',
      archetype: 'Zdobywca',
      tagline: 'Działam. Decyduję. Wygrywam.',
      hex: '#E63946',
      core_need: 'Kontrola i wyniki',
      core_fear: 'Bycie słabym lub zależnym',
      strengths: ['Decyzyjność', 'Odwaga', 'Skuteczność', 'Przywództwo', 'Ambicja'],
      shadows: ['Dominacja', 'Niecierpliwość', 'Impulsywność', 'Brak empatii'],
      in_relationship: 'Przejmuje inicjatywę, jest bezpośredni i lojalny, ale może być zbyt kontrolujący gdy traci poczucie władzy.',
      at_work: 'Naturalny lider, działa sprawnie pod presją, potrzebuje autonomii i wymiernych celów. Najlepszy w trudnych projektach.',
      communication: 'Bezpośredni, konkretny, nie znosi owijania w bawełnę. Oczekuje że inni też mówią wprost.',
    },
    {
      id: 'yellow',
      name: 'Żółty',
      archetype: 'Inspirator',
      tagline: 'Zarażam energią. Tworzę. Łączę.',
      hex: '#FFB703',
      core_need: 'Ekspresja i uznanie',
      core_fear: 'Bycie niezauważonym lub nudnym',
      strengths: ['Kreatywność', 'Entuzjazm', 'Komunikatywność', 'Innowacyjność', 'Optymizm'],
      shadows: ['Niestałość', 'Impulsywność', 'Powierzchowność', 'Trudność z kończeniem'],
      in_relationship: 'Wnosi radość, energię i spontaniczność. Lubi głębię w relacjach ale może uciekać od trudnych tematów.',
      at_work: 'Generator pomysłów i motor napędowy kreatywności. Najlepszy tam gdzie potrzebna jest innowacja i inspiracja innych.',
      communication: 'Żywiołowy, pełen historii i metafor. Potrafi przekonać przez entuzjazm, czasem gubi szczegóły.',
    },
    {
      id: 'green',
      name: 'Zielony',
      archetype: 'Strażnik',
      tagline: 'Słucham. Buduję mosty. Trzymam razem.',
      hex: '#2D9764',
      core_need: 'Harmonia i przynależność',
      core_fear: 'Odrzucenie i konflikt',
      strengths: ['Empatia', 'Lojalność', 'Cierpliwość', 'Dyplomacja', 'Troskliwość'],
      shadows: ['Unikanie konfliktów', 'Stawianie potrzeb innych ponad własne', 'Nadmierna zgoda', 'Trudność z granicami'],
      in_relationship: 'Głęboko oddany, uważny i wspierający. Buduje zaufanie latami i jest niezmiennie lojalny.',
      at_work: 'Spoiwo zespołu. Najlepszy w budowaniu kultury współpracy, mentoringu i pracy wymagającej empatii.',
      communication: 'Słucha więcej niż mówi. Dobiera słowa ostrożnie. Rzadko mówi coś co mogłoby zranić.',
    },
    {
      id: 'blue',
      name: 'Niebieski',
      archetype: 'Architekt',
      tagline: 'Analizuję. Planuję. Doskonalę.',
      hex: '#2D6EAD',
      core_need: 'Porządek i precyzja',
      core_fear: 'Błąd, chaos i niekompetencja',
      strengths: ['Analityczność', 'Systematyczność', 'Precyzja', 'Głębia myślenia', 'Niezawodność'],
      shadows: ['Paraliż analityczny', 'Perfekcjonizm', 'Dystans emocjonalny', 'Trudność z decyzjami bez danych'],
      in_relationship: 'Poważny, niezawodny, głęboki. Nie okazuje uczuć łatwo, ale gdy już to robi — są autentyczne.',
      at_work: 'Architekt rozwiązań. Najlepszy przy złożonych problemach, systemach i zadaniach wymagających głębiej analizy.',
      communication: 'Precyzyjny, logiczny, docenia fakty. Drażni go emocjonalna argumentacja bez danych.',
    },
  ],

  combination_profiles: {
    red_yellow:  'Zdobywca-Inspirator: Charyzmatyczny lider który porywa innych za sobą i działa z impetem. Tworzysz i wdrażasz szybko. Ryzyko: możesz wchodzić w zbyt wiele projektów jednocześnie i zostawiać je niedokończone.',
    red_blue:    'Zdobywca-Architekt: Strategiczny wykonawca — wiesz dokąd idziesz i masz plan jak tam dotrzeć. Łączysz ambicję z precyzją. Ryzyko: perfekcjonizm może spowalniać Twoje naturalne tempo.',
    red_green:   'Zdobywca-Strażnik: Lider który naprawdę dba o swój zespół. Twarda powłoka, miękkie serce. Potrafisz wymagać i wspierać jednocześnie. Ryzyko: wewnętrzny konflikt między asertywnością a potrzebą harmonii.',
    yellow_green: 'Inspirator-Strażnik: Ciepły, charyzmatyczny łącznik ludzi. Budujesz relacje z naturalną łatwością i zarażasz energią. Ryzyko: trudność z trudnymi rozmowami i stawianiem granic.',
    yellow_blue:  'Inspirator-Architekt: Kreatywny wizjoner z analitycznym zapleczem. Masz pomysły i potrafisz je uzasadnić. Ryzyko: wewnętrzna walka między "czuję że to zadziała" a "pokaż mi dane".',
    green_blue:   'Strażnik-Architekt: Niezawodny ekspert który buduje głębokie zaufanie. Solidny, przemyślany, wiarygodny. Ryzyko: za dużo myślenia, za mało działania — paraliż decyzyjny.',
  },

  dominant_interpretations: {
    red:    'Jesteś Zdobywcą. Twój świat to działanie, wpływ i wyniki. Rodzisz się ze zmysłem celu i nie odpuszczasz dopóki go nie osiągniesz. Inni często mówią że masz silną osobowość — masz rację.',
    yellow: 'Jesteś Inspiratorem. Twój świat to pomysły, ludzie i niekończące się możliwości. Zarażasz energią gdzie tylko się pojawisz. Niewielu ma Twój talent do łączenia ludzi i rozpalania ich wyobraźni.',
    green:  'Jesteś Strażnikiem. Twój świat to relacje, harmonia i lojalność. Masz rzadki dar prawdziwego słuchania i tworzenia przestrzeni gdzie inni czują się bezpiecznie. To siła, nie słabość.',
    blue:   'Jesteś Architektem. Twój świat to precyzja, głębia i doskonałość. Widzisz co inni przeoczają i rozumiesz systemy na poziomie który innym zajęłby lata. Twój spokój pod presją to rzadki talent.',
  },

  questions: [
    {
      id: 1,
      options: [
        { label: 'A', color: 'red',    text: 'Jak już sobie coś postanowię, trudno mnie zatrzymać.' },
        { label: 'B', color: 'yellow', text: 'Jak już sobie coś postanowię, szukam kogo zarazić tym pomysłem.' },
        { label: 'C', color: 'green',  text: 'Jak już sobie coś postanowię, upewniam się że wszyscy wokół są z tym okej.' },
        { label: 'D', color: 'blue',   text: 'Jak już sobie coś postanowię, siadam i układam jak to zrealizuję krok po kroku.' },
      ],
    },
    {
      id: 2,
      options: [
        { label: 'A', color: 'red',    text: 'W pracy najbardziej cenię szybkie decyzje i widoczne efekty.' },
        { label: 'B', color: 'yellow', text: 'W pracy najbardziej cenię przestrzeń do kreatywności i nowych pomysłów.' },
        { label: 'C', color: 'green',  text: 'W pracy najbardziej cenię stabilne relacje i wzajemne zaufanie.' },
        { label: 'D', color: 'blue',   text: 'W pracy najbardziej cenię jasne procedury i dobrą organizację.' },
      ],
    },
    {
      id: 3,
      options: [
        { label: 'A', color: 'red',    text: 'Kiedy ktoś popełnia błąd, mówię wprost co poszło nie tak i oczekuję poprawy.' },
        { label: 'B', color: 'yellow', text: 'Kiedy ktoś popełnia błąd, szukam sposobu żeby zamienić to w lekcję dla wszystkich.' },
        { label: 'C', color: 'green',  text: 'Kiedy ktoś popełnia błąd, staram się zrozumieć dlaczego to się stało i wspierać tę osobę.' },
        { label: 'D', color: 'blue',   text: 'Kiedy ktoś popełnia błąd, analizuję co dokładnie poszło nie tak żeby zapobiec temu w przyszłości.' },
      ],
    },
    {
      id: 4,
      options: [
        { label: 'A', color: 'red',    text: 'Idealne środowisko pracy dla mnie to dynamiczne, pełne wyzwań, szybko się zmieniające.' },
        { label: 'B', color: 'yellow', text: 'Idealne środowisko pracy dla mnie to otwarte, pełne energii i nowych bodźców.' },
        { label: 'C', color: 'green',  text: 'Idealne środowisko pracy dla mnie to harmonijne, oparte na zaufaniu i współpracy.' },
        { label: 'D', color: 'blue',   text: 'Idealne środowisko pracy dla mnie to zorganizowane, z jasno określonymi celami i standardami.' },
      ],
    },
    {
      id: 5,
      options: [
        { label: 'A', color: 'red',    text: 'W rozmowie z innymi przechodzę szybko do sedna i oczekuję tego samego.' },
        { label: 'B', color: 'yellow', text: 'W rozmowie z innymi lubię swobodnie skakać między tematami i opowiadać historyjki.' },
        { label: 'C', color: 'green',  text: 'W rozmowie z innymi słucham z uwagą i upewniam się że każdy czuje się wysłuchany.' },
        { label: 'D', color: 'blue',   text: 'W rozmowie z innymi przemyślam co chcę powiedzieć zanim to powiem.' },
      ],
    },
    {
      id: 6,
      options: [
        { label: 'A', color: 'red',    text: 'Kiedy chcę kogoś przekonać, podaję twarde argumenty i fakty — wyniki mówią same za siebie.' },
        { label: 'B', color: 'yellow', text: 'Kiedy chcę kogoś przekonać, opowiadam historię i używam entuzjazmu jako paliwa.' },
        { label: 'C', color: 'green',  text: 'Kiedy chcę kogoś przekonać, buduję na relacji i odwołuję się do wspólnych wartości.' },
        { label: 'D', color: 'blue',   text: 'Kiedy chcę kogoś przekonać, przygotowuję dane, badania i logiczne argumenty.' },
      ],
    },
    {
      id: 7,
      options: [
        { label: 'A', color: 'red',    text: 'Pod presją czasu działam jeszcze sprawniej — stres mnie nakręca.' },
        { label: 'B', color: 'yellow', text: 'Pod presją czasu improwizuję i ufam instynktowi.' },
        { label: 'C', color: 'green',  text: 'Pod presją czasu martwię się jak to wpłynie na innych w zespole.' },
        { label: 'D', color: 'blue',   text: 'Pod presją czasu skupiam się na tym co najważniejsze według planu.' },
      ],
    },
    {
      id: 8,
      options: [
        { label: 'A', color: 'red',    text: 'Ryzyko mnie nie przeraża — bez ryzyka nie ma zwycięstwa.' },
        { label: 'B', color: 'yellow', text: 'Lubię ryzyko jeśli przynosi ekscytację i nowe możliwości.' },
        { label: 'C', color: 'green',  text: 'Wolę pewne opcje — bezpieczeństwo ważniejsze niż potencjalny zysk.' },
        { label: 'D', color: 'blue',   text: 'Kalkuluję ryzyko szczegółowo przed każdą decyzją.' },
      ],
    },
    {
      id: 9,
      options: [
        { label: 'A', color: 'red',    text: 'Najbardziej wyprowadza mnie z równowagi gdy ktoś mnie spowalnia lub ignoruje moje zdanie.' },
        { label: 'B', color: 'yellow', text: 'Najbardziej wyprowadza mnie z równowagi bycie przykutym do rutyny bez przestrzeni na coś nowego.' },
        { label: 'C', color: 'green',  text: 'Najbardziej wyprowadza mnie z równowagi poczucie że ktoś jest niesprawiedliwie traktowany.' },
        { label: 'D', color: 'blue',   text: 'Najbardziej wyprowadza mnie z równowagi niedbałość i błędy wynikające z braku uwagi.' },
      ],
    },
    {
      id: 10,
      options: [
        { label: 'A', color: 'red',    text: 'Idealne spotkanie to krótkie, konkretne, z wyraźnymi decyzjami na koniec.' },
        { label: 'B', color: 'yellow', text: 'Idealne spotkanie to energetyczne, z wolną przestrzenią na pomysły i dyskusję.' },
        { label: 'C', color: 'green',  text: 'Idealne spotkanie to otwarte, gdzie każdy ma szansę się wypowiedzieć.' },
        { label: 'D', color: 'blue',   text: 'Idealne spotkanie to zorganizowane, z agendą i materiałami przygotowanymi wcześniej.' },
      ],
    },
    {
      id: 11,
      options: [
        { label: 'A', color: 'red',    text: 'Kiedy ktoś pyta mnie o radę, daję konkretną, gotową odpowiedź — najlepiej jedną opcję do działania.' },
        { label: 'B', color: 'yellow', text: 'Kiedy ktoś pyta mnie o radę, dzielę się kilkoma inspirującymi możliwościami.' },
        { label: 'C', color: 'green',  text: 'Kiedy ktoś pyta mnie o radę, pytam o kontekst i emocje żeby naprawdę zrozumieć sytuację.' },
        { label: 'D', color: 'blue',   text: 'Kiedy ktoś pyta mnie o radę, proszę o więcej danych i analizuję problem systematycznie.' },
      ],
    },
    {
      id: 12,
      options: [
        { label: 'A', color: 'red',    text: 'Sukces dla mnie to osiągnięcie ambitnego celu szybciej niż ktokolwiek się spodziewał.' },
        { label: 'B', color: 'yellow', text: 'Sukces dla mnie to stworzenie czegoś co inspiruje i zmienia perspektywę ludzi.' },
        { label: 'C', color: 'green',  text: 'Sukces dla mnie to bycie kimś na kogo inni mogą naprawdę liczyć.' },
        { label: 'D', color: 'blue',   text: 'Sukces dla mnie to wykonanie zadania perfekcyjnie, bez błędów i niedociągnięć.' },
      ],
    },
    {
      id: 13,
      options: [
        { label: 'A', color: 'red',    text: 'Wolny weekend wolę spędzić na aktywności z elementem rywalizacji lub wyzwania fizycznego.' },
        { label: 'B', color: 'yellow', text: 'Wolny weekend wolę spędzić eksplorując coś nowego — miejsca, ludzi, doświadczenia.' },
        { label: 'C', color: 'green',  text: 'Wolny weekend wolę spędzić z bliskimi osobami w spokojnej, serdecznej atmosferze.' },
        { label: 'D', color: 'blue',   text: 'Wolny weekend wolę spędzić na pogłębianiu wiedzy o czymś co mnie fascynuje.' },
      ],
    },
    {
      id: 14,
      options: [
        { label: 'A', color: 'red',    text: 'Kiedy coś idzie nie według planu, szybko przestawiam się i szukam alternatywnej drogi do celu.' },
        { label: 'B', color: 'yellow', text: 'Kiedy coś idzie nie według planu, widzę w tym okazję do czegoś zupełnie innego.' },
        { label: 'C', color: 'green',  text: 'Kiedy coś idzie nie według planu, najpierw sprawdzam jak to wpłynie na ludzi zaangażowanych w projekt.' },
        { label: 'D', color: 'blue',   text: 'Kiedy coś idzie nie według planu, wracam do początku i szukam gdzie popełniono błąd w analizie.' },
      ],
    },
    {
      id: 15,
      options: [
        { label: 'A', color: 'red',    text: 'Uczę się przez działanie — próbuję, analizuję efekt i modyfikuję na bieżąco.' },
        { label: 'B', color: 'yellow', text: 'Inspiruję się doświadczeniami innych i eksperymentuję z nowymi podejściami.' },
        { label: 'C', color: 'green',  text: 'Uczę się najlepiej kiedy mogę zrobić to z kimś bliskim lub w supportywnej grupie.' },
        { label: 'D', color: 'blue',   text: 'Potrzebuję solidnej teorii i zrozumienia fundamentów przed przejściem do praktyki.' },
      ],
    },
    {
      id: 16,
      options: [
        { label: 'A', color: 'red',    text: 'Kiedy ktoś mówi mi "to niemożliwe", traktuję to jako wyzwanie i podwajam wysiłki.' },
        { label: 'B', color: 'yellow', text: 'Kiedy ktoś mówi mi "to niemożliwe", odpowiadam "ale wyobraź sobie że jednak tak" i szukam nieoczywistego hacka.' },
        { label: 'C', color: 'green',  text: 'Kiedy ktoś mówi mi "to niemożliwe", pytam czy na pewno wzięliśmy pod uwagę wszystkie perspektywy.' },
        { label: 'D', color: 'blue',   text: 'Kiedy ktoś mówi mi "to niemożliwe", proszę o dane które to potwierdzają — chcę zobaczyć dowody.' },
      ],
    },
    {
      id: 17,
      options: [
        { label: 'A', color: 'red',    text: 'W roli lidera wyznaczam kierunek i oczekuję że inni będą za mną nadążać.' },
        { label: 'B', color: 'yellow', text: 'W roli lidera inspiruję wizją i zarażam entuzjazmem tak żeby wszyscy chcieli iść tam razem.' },
        { label: 'C', color: 'green',  text: 'W roli lidera troszczę się o każdego w zespole i dbam żeby każdy się rozwijał.' },
        { label: 'D', color: 'blue',   text: 'W roli lidera tworzę systemy i procesy które sprawiają że wszystko działa bez chaosu.' },
      ],
    },
    {
      id: 18,
      options: [
        { label: 'A', color: 'red',    text: 'Motywuje mnie przede wszystkim wygrywanie i przebijanie własnych rekordów.' },
        { label: 'B', color: 'yellow', text: 'Motywują mnie nowe pomysły, możliwości i ekscytujące projekty które jeszcze nie istnieją.' },
        { label: 'C', color: 'green',  text: 'Motywuje mnie harmonia w relacjach i poczucie bycia naprawdę potrzebnym.' },
        { label: 'D', color: 'blue',   text: 'Motywuje mnie precyzja, możliwość doskonalenia warsztatu i głębokie rozumienie tematu.' },
      ],
    },
    {
      id: 19,
      options: [
        { label: 'A', color: 'red',    text: 'Na duże spotkania towarzyskie przychodzę bo to dobra okazja do nawiązania wartościowych kontaktów.' },
        { label: 'B', color: 'yellow', text: 'Duże spotkania to mój żywioł — kocham ludzi, energię tłumu i nowe znajomości.' },
        { label: 'C', color: 'green',  text: 'Wolę przyjść dla kilku bliskich znajomych i prowadzić głębokie rozmowy w kącie.' },
        { label: 'D', color: 'blue',   text: 'Często zastanawiam się czy naprawdę chcę iść — po takich imprezach potrzebuję czasu sam ze sobą.' },
      ],
    },
    {
      id: 20,
      options: [
        { label: 'A', color: 'red',    text: 'Kiedy zaczynam projekt, od razu wchodzę w tryb działania — poprawię szczegóły w biegu.' },
        { label: 'B', color: 'yellow', text: 'Kiedy zaczynam projekt, startuję od burzy mózgów — im więcej pomysłów tym lepiej.' },
        { label: 'C', color: 'green',  text: 'Kiedy zaczynam projekt, najpierw upewniam się że wszyscy wiedzą co mają robić i czują się dobrze ze swoją rolą.' },
        { label: 'D', color: 'blue',   text: 'Kiedy zaczynam projekt, tworzę szczegółowy plan zanim wykonam pierwszy krok.' },
      ],
    },
    {
      id: 21,
      options: [
        { label: 'A', color: 'red',    text: 'Nieoczekiwane zmiany akceptuję szybko jeśli widzę że prowadzą do lepszych wyników.' },
        { label: 'B', color: 'yellow', text: 'Nieoczekiwane zmiany zazwyczaj mnie ekscytują — zmiana to nowa przygoda.' },
        { label: 'C', color: 'green',  text: 'Przy nieoczekiwanych zmianach martwię się jak inni to przyjmą zanim sam się dostosowuję.' },
        { label: 'D', color: 'blue',   text: 'Nieoczekiwane zmiany wymagają ode mnie czasu żeby przeanalizować konsekwencje zanim się dostosowuję.' },
      ],
    },
    {
      id: 22,
      options: [
        { label: 'A', color: 'red',    text: 'Moje ulubione rozmowy to te o strategii, celach, wynikach i tym jak wygrywać.' },
        { label: 'B', color: 'yellow', text: 'Moje ulubione rozmowy to te o wizjach, możliwościach i scenariuszach "a co by było gdyby".' },
        { label: 'C', color: 'green',  text: 'Moje ulubione rozmowy to te o ludziach — ich historii, emocjach i relacjach.' },
        { label: 'D', color: 'blue',   text: 'Moje ulubione rozmowy to te o głębokich tematach — filozofii, nauce, mechanizmach rzeczy.' },
      ],
    },
    {
      id: 23,
      options: [
        { label: 'A', color: 'red',    text: 'Kiedy ktoś krytykuje moją pracę, oceniam czy krytyka ma sens i działam jeśli tak — emocje zostawiam na boku.' },
        { label: 'B', color: 'yellow', text: 'Kiedy ktoś krytykuje moją pracę, boli mnie to bardziej niż chcę przyznać, ale szybko się podnoszę.' },
        { label: 'C', color: 'green',  text: 'Kiedy ktoś krytykuje moją pracę, bardzo mnie to dotyka — zależy mi na tym żeby inni mnie lubili i cenili.' },
        { label: 'D', color: 'blue',   text: 'Kiedy ktoś krytykuje moją pracę, analizuję krytykę pod kątem zgodności z faktami — jeśli ma podstawy, poprawiam.' },
      ],
    },
    {
      id: 24,
      options: [
        { label: 'A', color: 'red',    text: 'Kiedy widzę problem, od razu szukam jak go rozwiązać — działanie jest moją pierwszą odpowiedzią.' },
        { label: 'B', color: 'yellow', text: 'Kiedy widzę problem, myślę kreatywnie o niestandardowych rozwiązaniach których inni nie rozważali.' },
        { label: 'C', color: 'green',  text: 'Kiedy widzę problem, zastanawiam się jak wpływa to na relacje i ludzi wokół.' },
        { label: 'D', color: 'blue',   text: 'Kiedy widzę problem, diagnozuję przyczyny dokładnie zanim zacznę szukać rozwiązań.' },
      ],
    },
    {
      id: 25,
      options: [
        { label: 'A', color: 'red',    text: 'Moje słabe strony to brak cierpliwości i trudność z delegowaniem — chcę żeby wszystko było zrobione jak najszybciej i najlepiej.' },
        { label: 'B', color: 'yellow', text: 'Moje słabe strony to trudność z kończeniem projektów i rozpraszanie się nowymi pomysłami zanim skończę stare.' },
        { label: 'C', color: 'green',  text: 'Moje słabe strony to trudność z asertywnym stawianiem granic i mówienie "nie" bliskim.' },
        { label: 'D', color: 'blue',   text: 'Moje słabe strony to paraliż analityczny i trudność z działaniem bez pełnych danych.' },
      ],
    },
    {
      id: 26,
      options: [
        { label: 'A', color: 'red',    text: 'W długim projekcie motywuje mnie widoczny postęp i wymierne wyniki na każdym etapie.' },
        { label: 'B', color: 'yellow', text: 'W długim projekcie motywuje mnie przestrzeń do eksperymentowania i możliwość zmiany kursu gdy widzę coś lepszego.' },
        { label: 'C', color: 'green',  text: 'W długim projekcie motywuje mnie dobre relacje w zespole i poczucie że praca ma sens dla ludzi.' },
        { label: 'D', color: 'blue',   text: 'W długim projekcie motywuje mnie jasne wymagania i możliwość robienia tej pracy naprawdę dobrze.' },
      ],
    },
    {
      id: 27,
      options: [
        { label: 'A', color: 'red',    text: 'Przy trudnej decyzji decyduję szybko na podstawie instynktu i doświadczenia.' },
        { label: 'B', color: 'yellow', text: 'Przy trudnej decyzji pytam kilka osób o opinie a potem idę za tym co czuję.' },
        { label: 'C', color: 'green',  text: 'Przy trudnej decyzji długo rozmawiam z bliskimi i potrzebuję poczucia akceptacji otoczenia.' },
        { label: 'D', color: 'blue',   text: 'Przy trudnej decyzji przeglądam wszystkie opcje, zbieram dane i tworzę listę plusów i minusów.' },
      ],
    },
    {
      id: 28,
      options: [
        { label: 'A', color: 'red',    text: 'W konflikcie z kimś bliskim mówię wprost co mnie boli i oczekuję szybkiego wyjaśnienia.' },
        { label: 'B', color: 'yellow', text: 'W konflikcie z kimś bliskim staram się rozładować napięcie humorem lub otwartą szczerą rozmową.' },
        { label: 'C', color: 'green',  text: 'W konflikcie z kimś bliskim bardzo staram się uniknąć konfliktu lub go wyciszyć, nawet kosztem własnych potrzeb.' },
        { label: 'D', color: 'blue',   text: 'W konflikcie z kimś bliskim potrzebuję czasu sam ze sobą żeby przemyśleć co naprawdę się stało.' },
      ],
    },
    {
      id: 29,
      options: [
        { label: 'A', color: 'red',    text: 'Kiedy ktoś pyta "kto ma pomysł", zazwyczaj już go mam — i nie waham się go przedstawić.' },
        { label: 'B', color: 'yellow', text: 'Kiedy ktoś pyta "kto ma pomysł", zawsze mam ich kilka i chętnie o nich opowiadam.' },
        { label: 'C', color: 'green',  text: 'Kiedy ktoś pyta "kto ma pomysł", mam coś w głowie ale czekam żeby upewnić się że atmosfera jest odpowiednia.' },
        { label: 'D', color: 'blue',   text: 'Kiedy ktoś pyta "kto ma pomysł", mam przemyślany pomysł który dokładnie sprawdziłem zanim go przedstawię.' },
      ],
    },
    {
      id: 30,
      options: [
        { label: 'A', color: 'red',    text: 'Mój naturalny rytm pracy to intensywne sprinty — skupiam się maksymalnie i dowożę.' },
        { label: 'B', color: 'yellow', text: 'Mój naturalny rytm pracy to nieregularny — burze kreatywności przeplatane przestojami.' },
        { label: 'C', color: 'green',  text: 'Mój naturalny rytm pracy to stały, spokojny, zrównoważony — lubię harmonię bez skrajności.' },
        { label: 'D', color: 'blue',   text: 'Mój naturalny rytm pracy to systematyczny i przewidywalny — dedykowane bloki czasu na każde zadanie.' },
      ],
    },
    {
      id: 31,
      options: [
        { label: 'A', color: 'red',    text: 'Kiedy coś mnie zirytuje, mówię to wprost — bez owijania w bawełnę.' },
        { label: 'B', color: 'yellow', text: 'Kiedy coś mnie zirytuje, żartuję z tego lub szybko przechodzę do czegoś pozytywnego.' },
        { label: 'C', color: 'green',  text: 'Kiedy coś mnie zirytuje, trzymam to w sobie bo nie chcę ranić innych ani burzyć harmonii.' },
        { label: 'D', color: 'blue',   text: 'Kiedy coś mnie zirytuje, analizuję dlaczego to mnie irytuje zanim zareaguję.' },
      ],
    },
    {
      id: 32,
      options: [
        { label: 'A', color: 'red',    text: 'Zasady i procedury są dla mnie narzędziem — jeśli coś nie działa, zmieniam je na coś lepszego.' },
        { label: 'B', color: 'yellow', text: 'Zasady i procedury są po to żeby je kwestionować — wolę elastyczność niż sztywne ramy.' },
        { label: 'C', color: 'green',  text: 'Staram się przestrzegać zasad bo stabilność i przewidywalność są ważne dla wszystkich.' },
        { label: 'D', color: 'blue',   text: 'Bardzo cenię dobre zasady i procedury — to fundament który zapobiega błędom i chaosowi.' },
      ],
    },
  ],
};
