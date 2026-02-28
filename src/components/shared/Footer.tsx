/**
 * Footer.tsx — Universal site footer for all Alcheme pages.
 */

const PROJEKT_LINKS: [string, string][] = [
  ['Strona główna',  '/'],
  ['Cennik',         '/pricing'],
  ['Metodologia',    '/methodology'],
  ['Testy',          '/user-profile-tests'],
  ['Karta Postaci',  '/character'],
];

const BAZA_LINKS: [string, string][] = [
  ['Wszystkie modele',     '/baza-wiedzy/'],
  ['Enneagram',            '/baza-wiedzy/enneagram/'],
  ['HEXACO',               '/baza-wiedzy/hexaco/'],
  ['Typ 1: Reformator',    '/baza-wiedzy/enneagram/typ-1-reformator.html'],
  ['Typ 4: Indywidualista','/baza-wiedzy/enneagram/typ-4-indywidualista.html'],
];

const LEGAL_LINKS: [string, string, boolean?][] = [
  ['Polityka Prywatności', '/privacy-policy'],
  ['Regulamin',            '/regulamin.pdf', true],
  ['RODO',                 '/privacy-policy#rodo'],
];

function FooterLink({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <li>
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        className="hover:text-indigo-400 transition-colors text-slate-500 text-sm"
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        {label}
      </a>
    </li>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/5 bg-black/30 backdrop-blur-xl mt-16">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">

          {/* Col 1 — brand + tagline */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" style={{ display: 'inline-block', marginBottom: 8, textDecoration: 'none' }}>
              <span style={{
                fontFamily: "'Cinzel', serif",
                fontSize: 18,
                fontWeight: 600,
                letterSpacing: '.14em',
                background: 'linear-gradient(120deg,#fff 0%,rgba(0,240,255,.88) 55%,rgba(112,0,255,.75) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Alcheme
              </span>
            </a>
            <p className="text-slate-500 text-sm leading-relaxed">
              Naukowa diagnoza potencjału w formie przystępnej grywalizacji.
            </p>
            <a
              href="mailto:hello@alcheme.io"
              className="inline-block mt-4 text-sm text-cyan-400/80 hover:text-cyan-300 transition-colors"
              style={{ textDecoration: 'none' }}
            >
              hello@alcheme.io
            </a>
          </div>

          {/* Col 2 — Projekt */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Projekt</h4>
            <ul className="space-y-1.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {PROJEKT_LINKS.map(([label, href]) => (
                <FooterLink key={href} href={href} label={label} />
              ))}
            </ul>
          </div>

          {/* Col 3 — Baza Wiedzy */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Baza Wiedzy</h4>
            <ul className="space-y-1.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {BAZA_LINKS.map(([label, href]) => (
                <FooterLink key={href} href={href} label={label} />
              ))}
            </ul>
          </div>

          {/* Col 4 — Legal */}
          <div>
            <h4 className="text-white font-bold mb-3 text-sm">Legal</h4>
            <ul className="space-y-1.5" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {LEGAL_LINKS.map(([label, href, ext]) => (
                <FooterLink key={href} href={href} label={label} external={!!ext} />
              ))}
            </ul>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <span>&copy; {year} Alcheme. All rights reserved.</span>
          <span>Disclaimer: To narzędzie rozwojowe, nie diagnoza kliniczna.</span>
        </div>
      </div>
    </footer>
  );
}
