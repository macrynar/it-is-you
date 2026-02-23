/**
 * Enneagram Personality Test Data
 * Polish Translation - Test osobowości Enneagram
 * 
 * 9 types: Reformer, Helper, Achiever, Individualist, Investigator,
 * Loyalist, Enthusiast, Challenger, Peacemaker
 * 
 * Scale: Forced Choice (A vs B)
 */

export const ENNEAGRAM_TEST = {
  test_id: "enneagram_adapted",
  test_name: "Enneagram - Test Typu Osobowości",
  test_type: "enneagram",
  time_estimate_minutes: 15,
  question_count: 36,
  scale_type: "forced_choice",
  types: [
    {
      id: 1,
      name: "Reformista",
      name_en: "The Reformer",
      description: "Idealistyczny, zasadniczy, opanowany i perfekcjonistyczny",
      core_motivation: "Być dobrym, zrównoważonym i uczciwym",
      basic_fear: "Bycie złym, skorumpowanym lub nieuczciwym"
    },
    {
      id: 2,
      name: "Pomocnik",
      name_en: "The Helper",
      description: "Troskliwy, hojny, perswazyjny i posesywny",
      core_motivation: "Być kochanym i potrzebnym",
      basic_fear: "Bycie nielubionym lub niepotrzebnym"
    },
    {
      id: 3,
      name: "Osiągacz",
      name_en: "The Achiever",
      description: "Ambitny, adaptacyjny i skoncentrowany na wizerunku",
      core_motivation: "Być wartościowym, podziwianym i odnosić sukces",
      basic_fear: "Bycie bezwartościowym lub porażką"
    },
    {
      id: 4,
      name: "Indywidualista",
      name_en: "The Individualist",
      description: "Wrażliwy, melancholijny, kreatywny i introspekcyjny",
      core_motivation: "Być sobą, wyrażać swoją niepowtarzalność",
      basic_fear: "Brak tożsamości lub znaczenia osobistego"
    },
    {
      id: 5,
      name: "Badacz",
      name_en: "The Investigator",
      description: "Intensywny, analityczny, odizolowany i innowacyjny",
      core_motivation: "Być kompetentnym i rozumieć świat",
      basic_fear: "Bycie bezużytecznym, niekompetentnym lub nieprzygotowanym"
    },
    {
      id: 6,
      name: "Lojalista",
      name_en: "The Loyalist",
      description: "Zaangażowany, odpowiedzialny, lękliwy i defensywny",
      core_motivation: "Mieć bezpieczeństwo i wsparcie",
      basic_fear: "Bycie bez wsparcia lub orientacji"
    },
    {
      id: 7,
      name: "Entuzjasta",
      name_en: "The Enthusiast",
      description: "Spontaniczny, wszechstronny, rozproszony i optymistyczny",
      core_motivation: "Być szczęśliwym, spełnionym i zadowolonym",
      basic_fear: "Bycie pozbawionym, w cierpeniu lub uwięzionym"
    },
    {
      id: 8,
      name: "Przywódca",
      name_en: "The Challenger",
      description: "Mocny, pewny siebie, konfrontacyjny i ochronny",
      core_motivation: "Być niezależnym, samowystarczalnym i mocnym",
      basic_fear: "Bycie kontrolowanym, zranionym lub wykorzystanym"
    },
    {
      id: 9,
      name: "Mediator",
      name_en: "The Peacemaker",
      description: "Ugodowy, akceptujący, ufny i zadowolony",
      core_motivation: "Mieć wewnętrzny pokój i harmonię",
      basic_fear: "Utrata, separacja lub fragmentacja"
    }
  ],
  questions: [
    {
      id: "enn_001",
      option_a: "Koncentruję się na robieniu rzeczy właściwym sposobem",
      scores_a: { 1: 2, 9: 0 },
      option_b: "Jestem wyluzowany i akceptujący",
      scores_b: { 1: 0, 9: 2 }
    },
    {
      id: "enn_002",
      option_a: "Jestem dumny z tego, że jestem troskliwy i hojny",
      scores_a: { 2: 2, 5: 0 },
      option_b: "Jestem dumny z tego, że jestem niezależny",
      scores_b: { 2: 0, 5: 2 }
    },
    {
      id: "enn_003",
      option_a: "Skupiam się na osiąganiu celów i byciu produktywnym",
      scores_a: { 3: 2, 4: 0 },
      option_b: "Skupiam się na moich uczuciach i wyrażaniu indywidualności",
      scores_b: { 3: 0, 4: 2 }
    },
    {
      id: "enn_004",
      option_a: "Analizuję sytuacje dokładnie przed działaniem",
      scores_a: { 5: 2, 8: 0 },
      option_b: "Działam zdecydowanie i bezpośrednio",
      scores_b: { 5: 0, 8: 2 }
    },
    {
      id: "enn_005",
      option_a: "Jestem naturalnie ostrożny i myślę o tym, co może pójść nie tak",
      scores_a: { 6: 2, 7: 0 },
      option_b: "Jestem naturalnie optymistyczny i myślę o możliwościach",
      scores_b: { 6: 0, 7: 2 }
    },
    {
      id: "enn_006",
      option_a: "Biorę sprawy w swoje ręce i czuję się komfortowo z konfrontacją",
      scores_a: { 8: 2, 9: 0 },
      option_b: "Preferuję harmonię i unikam konfrontacji",
      scores_b: { 8: 0, 9: 2 }
    },
    {
      id: "enn_007",
      option_a: "Mój wewnętrzny krytyk jest silny",
      scores_a: { 1: 2, 7: 0 },
      option_b: "Skupiam się na pozytywach",
      scores_b: { 1: 0, 7: 2 }
    },
    {
      id: "enn_008",
      option_a: "Skupiam swoją energię na pomaganiu innym",
      scores_a: { 2: 2, 3: 0 },
      option_b: "Skupiam swoją energię na osiąganiu sukcesu",
      scores_b: { 2: 0, 3: 2 }
    },
    {
      id: "enn_009",
      option_a: "Odczuwam rzeczy głęboko i mam bogate życie emocjonalne",
      scores_a: { 4: 2, 7: 0 },
      option_b: "Wolę pozostać pozytywny",
      scores_b: { 4: 0, 7: 2 }
    },
    {
      id: "enn_010",
      option_a: "Potrzebuję czasu w samotności, aby się zregenerować",
      scores_a: { 5: 2, 2: 0 },
      option_b: "Czerpię energię z pomagania ludziom",
      scores_b: { 5: 0, 2: 2 }
    },
    {
      id: "enn_011",
      option_a: "Jestem sceptyczny i kwestionuję autorytet",
      scores_a: { 6: 2, 1: 0 },
      option_b: "Szanuję zasady i robienie rzeczy właściwie",
      scores_b: { 6: 0, 1: 2 }
    },
    {
      id: "enn_012",
      option_a: "Jestem bezpośredni i szczery",
      scores_a: { 8: 2, 3: 0 },
      option_b: "Jestem dyplomatyczny i dostosowuję swój styl",
      scores_b: { 8: 0, 3: 2 }
    },
    {
      id: "enn_013",
      option_a: "Płynę z prądem",
      scores_a: { 9: 2, 6: 0 },
      option_b: "Potrzebuję jasności i wiedzieć, czego się spodziewać",
      scores_b: { 9: 0, 6: 2 }
    },
    {
      id: "enn_014",
      option_a: "Czasami poświęcam swoje potrzeby, aby zachować spokój",
      scores_a: { 9: 2, 4: 0 },
      option_b: "Jestem w kontakcie ze swoimi potrzebami i je wyrażam",
      scores_b: { 9: 0, 4: 2 }
    },
    {
      id: "enn_015",
      option_a: "Jestem postrzegany jako ciepły i dający",
      scores_a: { 2: 2, 8: 0 },
      option_b: "Jestem postrzegany jako silny i opiekuńczy",
      scores_b: { 2: 0, 8: 2 }
    },
    {
      id: "enn_016",
      option_a: "Martwię się o bycie kompetentnym",
      scores_a: { 5: 2, 1: 0 },
      option_b: "Martwię się o robienie właściwych rzeczy",
      scores_b: { 5: 0, 1: 2 }
    },
    {
      id: "enn_017",
      option_a: "Jestem pragmatyczny i skupiam się na tym, co działa",
      scores_a: { 3: 2, 5: 0 },
      option_b: "Jestem analityczny i skupiam się na zrozumieniu",
      scores_b: { 3: 0, 5: 2 }
    },
    {
      id: "enn_018",
      option_a: "Szukam ekscytacji i nowych doświadczeń",
      scores_a: { 7: 2, 1: 0 },
      option_b: "Preferuję strukturę i konsekwencję",
      scores_b: { 7: 0, 1: 2 }
    },
    {
      id: "enn_019",
      option_a: "Ludzie mówią, że jestem wrażliwy",
      scores_a: { 4: 2, 8: 0 },
      option_b: "Ludzie mówią, że jestem twardy",
      scores_b: { 4: 0, 8: 2 }
    },
    {
      id: "enn_020",
      option_a: "Potrzebuję lojalności od bliskich mi osób",
      scores_a: { 6: 2, 7: 0 },
      option_b: "Potrzebuję wolności w relacjach",
      scores_b: { 6: 0, 7: 2 }
    },
    {
      id: "enn_021",
      option_a: "Zazwyczaj zdaję sobie sprawę z tego, czego inni potrzebują",
      scores_a: { 2: 2, 9: 0 },
      option_b: "Czasami przegapiam to, czego inni potrzebują",
      scores_b: { 2: 0, 9: 2 }
    },
    {
      id: "enn_022",
      option_a: "Czuję się komfortowo będąc w centrum uwagi",
      scores_a: { 3: 2, 5: 0 },
      option_b: "Wolę pozostać w tle",
      scores_b: { 3: 0, 5: 2 }
    },
    {
      id: "enn_023",
      option_a: "Czuję się fundamentalnie inny niż inni",
      scores_a: { 4: 2, 6: 0 },
      option_b: "Cenię dostosowanie się i przynależność",
      scores_b: { 4: 0, 6: 2 }
    },
    {
      id: "enn_024",
      option_a: "Wierzę, że więcej jest zazwyczaj lepsze",
      scores_a: { 7: 2, 4: 0 },
      option_b: "Wierzę, że jakość jest ważniejsza niż ilość",
      scores_b: { 7: 0, 4: 2 }
    },
    {
      id: "enn_025",
      option_a: "Ufam moim instynktom",
      scores_a: { 8: 2, 6: 0 },
      option_b: "Kwestionuję przed zaufaniem",
      scores_b: { 8: 0, 6: 2 }
    },
    {
      id: "enn_026",
      option_a: "Mam silne opinie i je wyrażam",
      scores_a: { 1: 2, 9: 0 },
      option_b: "Widzę wiele perspektyw",
      scores_b: { 1: 0, 9: 2 }
    },
    {
      id: "enn_027",
      option_a: "Swobodnie udzielam rad",
      scores_a: { 2: 2, 5: 0 },
      option_b: "Wolę obserwować",
      scores_b: { 2: 0, 5: 2 }
    },
    {
      id: "enn_028",
      option_a: "Robienie pozytywnego wrażenia jest dla mnie ważne",
      scores_a: { 3: 2, 4: 0 },
      option_b: "Bycie autentycznym jest ważniejsze",
      scores_b: { 3: 0, 4: 2 }
    },
    {
      id: "enn_029",
      option_a: "Przygotowuję się na najgorsze, mając nadzieję na najlepsze",
      scores_a: { 6: 2, 7: 0 },
      option_b: "Skupiam się na możliwościach i pozostaję optymistyczny",
      scores_b: { 6: 0, 7: 2 }
    },
    {
      id: "enn_030",
      option_a: "Stanę w obronie osób pokrzywdzonych",
      scores_a: { 8: 2, 9: 0 },
      option_b: "Wierzę, że każdy ma rację",
      scores_b: { 8: 0, 9: 2 }
    },
    {
      id: "enn_031",
      option_a: "Mam wysokie standardy wobec siebie",
      scores_a: { 1: 2, 3: 0 },
      option_b: "Skupiam się na wynikach ponad perfekcją",
      scores_b: { 1: 0, 3: 2 }
    },
    {
      id: "enn_032",
      option_a: "Motywuje mnie uszczęśliwianie innych",
      scores_a: { 2: 2, 7: 0 },
      option_b: "Motywują mnie przyjemne doświadczenia",
      scores_b: { 2: 0, 7: 2 }
    },
    {
      id: "enn_033",
      option_a: "Czuję się niezrozumiany przez większość ludzi",
      scores_a: { 4: 2, 3: 0 },
      option_b: "Dostosowuję się, aby łączyć się z różnymi ludźmi",
      scores_b: { 4: 0, 3: 2 }
    },
    {
      id: "enn_034",
      option_a: "Oszczędzam moją energię i zasoby",
      scores_a: { 5: 2, 7: 0 },
      option_b: "Rzucam się w doświadczenia całkowicie",
      scores_b: { 5: 0, 7: 2 }
    },
    {
      id: "enn_035",
      option_a: "Testuję lojalność ludzi",
      scores_a: { 6: 2, 2: 0 },
      option_b: "Zakładam, że ludzie się o mnie troszczą",
      scores_b: { 6: 0, 2: 2 }
    },
    {
      id: "enn_036",
      option_a: "Unikam pokazywania wrażliwości",
      scores_a: { 8: 2, 4: 0 },
      option_b: "Wyrażam moje wrażliwości",
      scores_b: { 8: 0, 4: 2 }
    }
  ]
};
